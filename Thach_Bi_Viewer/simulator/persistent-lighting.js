/* All switched-on lamps use Three's physical material response at every distance.
 * Native lights and texture-backed lights share diffuse/specular calculations;
 * switching between paths changes neither brightness nor material reflections.
 * This avoids uniform-count limits and never invents a light between fittings.
 */
(() => {
  'use strict';
  const SIM = window.CHURCH_SIMULATOR;
  let T, ctx, texture, capacity = 16;
  const materials = new Set();
  const uniforms = {
    uSimLightTexture: { value: null }, uSimLightCount: { value: 0 },
    uSimLightTexel: { value: 1 / capacity }, uSimLightScale: { value: 1 },
    uSimIndoorLux: { value: 0 }, uSimIndoorSky: { value: null }, uSimIndoorGround: { value: null }
  };
  let sources = [];
  function allocate(count) {
    while (capacity < count) capacity *= 2;
    texture?.dispose();
    texture = new T.DataTexture(new Float32Array(capacity * 4 * 4), capacity, 4, T.RGBAFormat, T.FloatType);
    texture.name = 'Simulator persistent lamp illumination';
    texture.minFilter = texture.magFilter = T.NearestFilter;
    texture.generateMipmaps = false;
    uniforms.uSimLightTexture.value = texture;
    uniforms.uSimLightTexel.value = 1 / capacity;
    for (const material of materials) material.needsUpdate = true;
  }
  function bindMaterial(material) {
    if (!material?.isMeshStandardMaterial || materials.has(material)) return;
    materials.add(material);
    const compile = material.onBeforeCompile, cacheKey = material.customProgramCacheKey.bind(material);
    material.customProgramCacheKey = () => `${cacheKey()}|persistent-lamps-physical-v2|${capacity}`;
    material.onBeforeCompile = function (shader, renderer) {
      compile.call(this, shader, renderer);
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = 'varying vec3 vSimWorldPosition;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
        vec4 simPosition = vec4(transformed, 1.0);
        #ifdef USE_BATCHING
          simPosition = batchingMatrix * simPosition;
        #endif
        #ifdef USE_INSTANCING
          simPosition = instanceMatrix * simPosition;
        #endif
        vSimWorldPosition = (modelMatrix * simPosition).xyz;`);
      shader.fragmentShader = `varying vec3 vSimWorldPosition;
        uniform sampler2D uSimLightTexture;
        uniform float uSimLightCount, uSimLightTexel, uSimLightScale, uSimIndoorLux;
        uniform vec3 uSimIndoorSky, uSimIndoorGround;
        float simIndoorWeight(vec3 p) {
          float alongNave = smoothstep(2.2, 2.5, p.x) * (1.0 - smoothstep(52.85, 53.15, p.x));
          float roofY = 12.282 - 0.7258 * abs(p.z);
          float nave = alongNave * (1.0 - smoothstep(7.2, 7.45, abs(p.z)))
            * (1.0 - smoothstep(roofY + 0.02, roofY + 0.22, p.y));
          float wingRoofY = 9.39 - 0.787 * abs(p.x - 40.56);
          float wing = smoothstep(37.1, 37.35, p.x) * (1.0 - smoothstep(43.8, 44.05, p.x))
            * (1.0 - smoothstep(12.85, 13.1, abs(p.z)))
            * (1.0 - smoothstep(wingRoofY + 0.02, wingRoofY + 0.22, p.y));
          return max(nave, wing) * smoothstep(-0.5, -0.3, p.y);
        }
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_end>', `
        vec3 simWorldNormal = transformNormalByInverseViewMatrix(geometryNormal, viewMatrix);
        // Room bounce belongs to the surface's room, never the camera's room.
        irradiance += mix(uSimIndoorGround, uSimIndoorSky, simWorldNormal.y * 0.5 + 0.5)
          * (simIndoorWeight(vSimWorldPosition) * uSimIndoorLux * uSimLightScale);
        #include <lights_fragment_end>
        #if defined(RE_Direct)
          #ifdef STANDARD
            // Three only initializes this when native direct lights exist.
            // Texture-only scenes need the identical GGX energy compensation.
            float simEssMs = material.dfg.x + material.dfg.y;
            material.multiScatteringCompensation = 1.0 + material.specularColorBlended * (1.0 / simEssMs - 1.0);
          #endif
          for (int i = 0; i < ${capacity}; i++) {
            if (float(i) >= uSimLightCount) break;
            float x = (float(i) + 0.5) * uSimLightTexel;
            vec4 source = texture2D(uSimLightTexture, vec2(x, 0.125));
            vec3 delta = source.xyz - vSimWorldPosition;
            float distance2 = max(dot(delta, delta), 0.01);
            vec3 direction = delta * inversesqrt(distance2);
            float incidence = max(dot(simWorldNormal, direction), 0.0);
            if (incidence <= 0.0) continue;
            float cone = 1.0;
            if (source.w > 0.5) {
              vec4 aim = texture2D(uSimLightTexture, vec2(x, 0.625));
              float alignment = dot(-direction, aim.xyz);
              if (alignment <= aim.w) continue;
              float inner = texture2D(uSimLightTexture, vec2(x, 0.875)).x;
              cone = smoothstep(aim.w, inner, alignment);
            }
            vec3 intensity = texture2D(uSimLightTexture, vec2(x, 0.375)).rgb;
            IncidentLight simLight;
            simLight.direction = transformDirection(direction, viewMatrix);
            simLight.color = intensity * (cone * uSimLightScale / distance2);
            simLight.visible = true;
            RE_Direct(simLight, geometryPosition, geometryNormal, geometryViewDir,
              geometryClearcoatNormal, material, reflectedLight);
          }
        #endif`);
    };
    material.needsUpdate = true;
  }
  function bindObject(object, visibleOnly = false) {
    const visit = o => { for (const m of Array.isArray(o.material) ? o.material : [o.material]) bindMaterial(m); };
    if (visibleOnly) object.traverseVisible(visit); else object.traverse(visit);
  }
  function prepare(context) {
    ctx = context; T = ctx.THREE;
    uniforms.uSimIndoorSky.value = new T.Color('#fff1dc');
    uniforms.uSimIndoorGround.value = new T.Color('#d9c3a3');
    allocate(capacity);
    bindObject(ctx.scene); bindObject(ctx.building);
  }
  function update(all, detailed, scale) {
    sources = all.filter(e => !detailed.has(e));
    if (sources.length > capacity) allocate(sources.length);
    const data = texture.image.data;
    sources.forEach((e, i) => {
      data.set([...e.pos, e.kind === 'spot' ? 1 : 0], i * 4);
      data.set([...e.color.map(c => c * e.cd), 0], (capacity + i) * 4);
      data.set([...(e.dir || [0, 0, 0]), e.cosOuter ?? -1], (2 * capacity + i) * 4);
      data.set([e.cosInner ?? 1, 0, 0, 0], (3 * capacity + i) * 4);
    });
    uniforms.uSimLightCount.value = sources.length;
    uniforms.uSimLightScale.value = scale;
    texture.needsUpdate = true;
    // Cover new board/window materials as well as fixture materials, skipping
    // the hidden original architectural hierarchy on camera moves.
    bindObject(ctx.scene, true);
  }
  SIM.persistentLighting = {
    prepare, bindMaterial, bindObject, update,
    scale: value => { uniforms.uSimLightScale.value = value; },
    indoorAmbient: lux => { uniforms.uSimIndoorLux.value = lux; },
    stats: () => ({ count: sources.length, capacity }),
    // Read-only source records support coverage and switch-state verification.
    emitters: () => sources.slice()
  };
})();
