import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
export type VisitAsset = {
  path: string;
  sha256: string;
  bytes: number;
  decodedBytes: number;
  decodedSha256?: string;
  sourceRevision: string;
};
export type Viewpoint = "exterior" | "nave" | "sanctuary" | "overhead";
export async function createVisit(
  host: HTMLElement,
  asset: VisitAsset,
  signal: AbortSignal,
  progress: (percent: number) => void,
  lost: () => void,
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.3;
  controls.maxDistance = 160;
  const ambient = new THREE.HemisphereLight(0xe7efff, 0x967858, 2.2);
  const sun = new THREE.DirectionalLight(0xffecd4, 2.6);
  sun.position.set(-20, 35, 15);
  const fill = new THREE.DirectionalLight(0xffdbab, 1.8);
  fill.position.set(40, 12, 0);
  scene.add(ambient, sun, fill);
  let model: THREE.Object3D | undefined;
  let environment: THREE.WebGLRenderTarget | undefined;
  let frame = 0;
  let disposed = false;
  let mode: Viewpoint = "exterior";
  const resources = () => {
    const geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>(),
      textures = new Set<THREE.Texture>();
    model?.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        for (const material of [object.material].flat()) {
          materials.add(material);
          for (const value of Object.values(material))
            if (value instanceof THREE.Texture) textures.add(value);
        }
      }
    });
    for (const texture of textures) {
      const image = texture.source?.data;
      if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) image.close();
      texture.dispose();
    }
    for (const material of materials) material.dispose();
    for (const geometry of geometries) geometry.dispose();
  };
  const render = () => {
    frame = 0;
    if (disposed || document.hidden) return;
    controls.update();
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };
  const visibility = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden && !disposed) frame = requestAnimationFrame(render);
  };
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
    lost();
  };
  const observer = new ResizeObserver(resize);
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    renderer.domElement.removeEventListener("webglcontextlost", contextLost);
    controls.dispose();
    resources();
    environment?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
  try {
    const response = await fetch(asset.path, {
      signal,
      cache: asset.decodedSha256 ? "no-store" : "default",
    });
    if (!response.ok || !response.body) throw Error("Model unavailable");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > asset.bytes) {
        await reader.cancel();
        throw Error("Model length mismatch");
      }
      chunks.push(value);
      progress(Math.round((100 * size) / asset.bytes));
    }
    if (size !== asset.bytes) throw Error("Incomplete model");
    const packed = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      packed.set(chunk, offset);
      offset += chunk.length;
    }
    chunks.length = 0;
    const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", packed))]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("");
    if (hash !== asset.sha256) throw Error("Model checksum mismatch");
    let decodedSize = 0;
    const bounded = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        decodedSize += chunk.length;
        if (decodedSize > asset.decodedBytes) throw Error("Decoded model exceeds declared size");
        controller.enqueue(chunk);
      },
    });
    const buffer = await new Response(
      new Blob([packed]).stream().pipeThrough(new DecompressionStream("gzip")).pipeThrough(bounded),
    ).arrayBuffer();
    if (buffer.byteLength !== asset.decodedBytes) throw Error("Model size mismatch");
    signal.throwIfAborted();
    if (asset.decodedSha256) {
      const decodedHash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", buffer))]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("");
      if (decodedHash !== asset.decodedSha256) throw Error("Decoded model checksum mismatch");
    }
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    loader.register((parser) => ({
      name: "EXT_materials_bump",
      async extendMaterialParams(index, params) {
        const bump = parser.json.materials[index].extensions?.EXT_materials_bump;
        if (!bump) return;
        if (bump.bumpTexture) await parser.assignTexture(params, "bumpMap", bump.bumpTexture);
        if (Number.isFinite(bump.bumpFactor)) params.bumpScale = bump.bumpFactor;
      },
    }));
    const loaded = await loader.parseAsync(buffer, "");
    model = loaded.scene;
    if (signal.aborted) {
      dispose();
      signal.throwIfAborted();
    }
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();
    scene.add(model);
    host.append(renderer.domElement);
    resize();
    observer.observe(host);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    document.addEventListener("visibilitychange", visibility);
    const viewpoint = (value: Viewpoint) => {
      mode = value;
      const views: Record<Viewpoint, number[]> = {
        exterior: [-53, 29, 45, 17, 12, 0],
        nave: [8, 1.6, 0, 43, 4, 0],
        sanctuary: [38, 1.6, 0, 49, 4.5, 0],
        overhead: [23, 74, 0.01, 23, 0, 0],
      };
      const v = views[value];
      camera.position.set(v[0], v[1], v[2]);
      controls.target.set(v[3], v[4], v[5]);
      controls.update();
    };
    const atmosphere = (night: boolean) => {
      scene.background = new THREE.Color(night ? 0x222c38 : 0xdce5e7);
      scene.environmentIntensity = night ? 0.55 : 0.8;
      ambient.intensity = night ? 1.2 : 2.2;
      sun.intensity = night ? 0.25 : 2.6;
      fill.intensity = night ? 2.5 : 1.8;
      renderer.toneMappingExposure = night ? 1 : 1.1;
    };
    viewpoint("exterior");
    atmosphere(false);
    visibility();
    return {
      dispose,
      viewpoint,
      atmosphere,
      roof: (visible: boolean) => {
        const roof = model?.getObjectByName("roof");
        if (roof) roof.visible = visible;
      },
      quality: (low: boolean) => {
        renderer.setPixelRatio(low ? 1 : Math.min(devicePixelRatio, 1.5));
        resize();
      },
      move: (direction: number) => {
        if (mode !== "nave") viewpoint("nave");
        const next = THREE.MathUtils.clamp(camera.position.x + direction, 6, 36);
        const delta = next - camera.position.x;
        camera.position.set(next, 1.6, 0);
        controls.target.x += delta;
        controls.target.z = 0;
        controls.update();
      },
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
