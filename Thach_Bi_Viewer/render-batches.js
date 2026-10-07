/* Indexed display buffers. Original model objects remain the source for picking,
 * export, collisions and engineering data. No vertex welding or simplification.
 */
(() => {
  'use strict';
  function merge(THREE, parts) {
    let vertices = 0, indices = 0;
    for (const { geo } of parts) {
      vertices += geo.attributes.position.count;
      indices += geo.index ? geo.index.count : geo.attributes.position.count;
    }
    const position = new Float32Array(vertices * 3), normal = new Float32Array(vertices * 3);
    const uv = new Float32Array(vertices * 2);
    const index = vertices > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
    const p = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3();
    let vertexOffset = 0, indexOffset = 0;
    for (const { geo, matrix } of parts) {
      // Work on one temporary geometry at a time only if normals are absent.
      const g = geo.attributes.normal ? geo : geo.clone();
      if (!g.attributes.normal) g.computeVertexNormals();
      const a = g.attributes;
      nm.getNormalMatrix(matrix);
      for (let i = 0; i < a.position.count; i++) {
        p.fromBufferAttribute(a.position, i).applyMatrix4(matrix);
        n.fromBufferAttribute(a.normal, i).applyMatrix3(nm).normalize();
        p.toArray(position, (vertexOffset + i) * 3);
        n.toArray(normal, (vertexOffset + i) * 3);
        if (a.uv) { uv[(vertexOffset + i) * 2] = a.uv.getX(i); uv[(vertexOffset + i) * 2 + 1] = a.uv.getY(i); }
      }
      const count = g.index ? g.index.count : a.position.count;
      for (let i = 0; i < count; i++) index[indexOffset + i] = vertexOffset + (g.index ? g.index.getX(i) : i);
      vertexOffset += a.position.count; indexOffset += count;
      if (g !== geo) g.dispose();
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(position, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
    out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    out.setIndex(new THREE.BufferAttribute(index, 1));
    out.computeBoundingBox(); out.computeBoundingSphere();
    return out;
  }
  function build(THREE, building, displayRoot) {
    const batches = new Map();
    building.updateMatrixWorld(true);
    for (const source of building.children) {
      const display = new THREE.Group();
      display.name = source.name; displayRoot.add(display); batches.set(source, display);
      const materials = new Map();
      source.traverse(object => {
        if (!object.isMesh || Array.isArray(object.material)) return;
        const material = object.material;
        if (!materials.has(material)) materials.set(material, []);
        materials.get(material).push({ geo: object.geometry, matrix: object.matrixWorld });
      });
      for (const [material, parts] of materials) {
        const mesh = new THREE.Mesh(merge(THREE, parts), material);
        mesh.castShadow = mesh.receiveShadow = true;
        // Display architecture is static. Visibility/material switches remain live.
        mesh.matrixAutoUpdate = false;
        display.add(mesh);
      }
      display.matrixAutoUpdate = false;
    }
    return batches;
  }
  window.CHURCH_BATCHES = { merge, build };
})();
