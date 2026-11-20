/* All switched-on lamps use Three's physical material response at every distance.
 * Native lights and texture-backed lights share diffuse/specular calculations;
 * switching between paths changes neither brightness nor material reflections.
 * This avoids uniform-count limits and never invents a light between fittings.
 */
(() => {
  'use strict';
  const SIM = window.CHURCH_SIMULATOR;
  let T, ctx, texture, gridTexture, gridKey = '', gridStats = null, gridBuilds = 0, capacity = 16;
  const GRID = window.CHURCH_LIGHT_GRID, OPENINGS = 15;
  const materials = new Set();
  const uniforms = {
    uSimLightGrid: { value: null }, uSimGridSize: { value: null }, uSimGridEnabled: { value: 0 },
    uSimLightTexture: { value: null }, uSimLightCount: { value: 0 },
    uSimLightTexel: { value: 1 / capacity }, uSimLightScale: { value: 1 },
    uSimIndoorLux: { value: 0 }, uSimIndoorSky: { value: null }, uSimIndoorGround: { value: null },
    // Display daylight: sky light entering through the side windows and doors (never an analysis input).
    uSimDaylight: { value: 0 }, uSimDayColor: { value: null }, uSimOpenings: { value: [] }, uSimOpeningNormals: { value: [] }
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
    material.customProgramCacheKey = () => `${cacheKey()}|persistent-lamps-physical-v4-daylight|${capacity}`;
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
      shader.fragmentShader = `#define SIM_OPENINGS ${OPENINGS}
        varying vec3 vSimWorldPosition;
        uniform sampler2D uSimLightTexture, uSimLightGrid;
        uniform vec2 uSimGridSize;
        uniform float uSimGridEnabled;
        uniform float uSimLightCount, uSimLightTexel, uSimLightScale, uSimIndoorLux;
        uniform vec3 uSimIndoorSky, uSimIndoorGround;
        uniform float uSimDaylight; uniform vec3 uSimDayColor;
        uniform vec4 uSimOpenings[SIM_OPENINGS]; uniform vec3 uSimOpeningNormals[SIM_OPENINGS];
        float simIndoorWeight(vec3 p) {
          float alongNave = smoothstep(2.2, 2.5, p.x) * (1.0 - smoothstep(52.85, 53.15, p.x));
          float roofY = 12.282 - 0.7258 * abs(p.z);
          float nave = alongNave * (1.0 - smoothstep(7.2, 7.45, abs(p.z)))
            * (1.0 - smoothstep(roofY + 0.02, roofY + 0.22, p.y));
          float wingRoofY = 9.26 - 0.8054 * abs(p.x - 40.575);
          // Fade over the wing return-wall thickness, retaining bounce on the inner faces.
          float wing = smoothstep(36.815, 37.135, p.x) * (1.0 - smoothstep(44.015, 44.335, p.x))
            // Gable wall inner face is |Z| 13.099; fade across its modeled 0.30 m thickness,
            // so the inside face receives room bounce while the outside face does not.
            * (1.0 - smoothstep(13.10, 13.399, abs(p.z)))
            * (1.0 - smoothstep(wingRoofY + 0.02, wingRoofY + 0.22, p.y));
          return max(nave, wing) * smoothstep(-0.5, -0.3, p.y);
        }
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_end>', `
        vec3 simWorldNormal = transformNormalByInverseViewMatrix(geometryNormal, viewMatrix);
        // Room bounce belongs to the surface's room, never the camera's room.
        irradiance += mix(uSimIndoorGround, uSimIndoorSky, simWorldNormal.y * 0.5 + 0.5)
          * (simIndoorWeight(vSimWorldPosition) * uSimIndoorLux * uSimLightScale);
        // Each opening acts as a small diffuse patch of sky: light falls off with distance and with
        // the angle at both ends, so floors and column flanks near a window are brighter by day.
        if (uSimDaylight > 0.0) {
          float simDayWeight = simIndoorWeight(vSimWorldPosition);
          if (simDayWeight > 0.0) {
            float simSky = 0.0;
            for (int i = 0; i < SIM_OPENINGS; i++) {
              vec3 toOpening = uSimOpenings[i].xyz - vSimWorldPosition;
              float d2 = max(dot(toOpening, toOpening), 1.0);
              vec3 dir = toOpening * inversesqrt(d2);
              simSky += uSimOpenings[i].w * max(dot(simWorldNormal, dir), 0.0) * max(-dot(dir, uSimOpeningNormals[i]), 0.0) / d2;
            }
            irradiance += uSimDayColor * (simSky * simDayWeight * uSimDaylight);
          }
        }
        #include <lights_fragment_end>
        #if defined(RE_Direct)
          #ifdef STANDARD
            // Three only initializes this when native direct lights exist.
            // Texture-only scenes need the identical GGX energy compensation.
            float simEssMs = material.dfg.x + material.dfg.y;
            material.multiScatteringCompensation = 1.0 + material.specularColorBlended * (1.0 / simEssMs - 1.0);
          #endif
          float simRow = -1.0;
          ${GRID ? `vec3 simCell = floor((vSimWorldPosition - vec3(${GRID.min.map(v => v.toFixed(1)).join(',')})) / ${GRID.step.toFixed(1)});
          if (uSimGridEnabled > 0.5 && all(greaterThanEqual(simCell, vec3(0.0))) && all(lessThan(simCell, vec3(${GRID.dimensions.map(v => v.toFixed(1)).join(',')}))))
            simRow = simCell.x + ${GRID.dimensions[0].toFixed(1)} * (simCell.y + ${GRID.dimensions[1].toFixed(1)} * simCell.z);` : ''}
          float simCount = simRow < 0.0 ? uSimLightCount : texture2D(uSimLightGrid, vec2(0.5 / uSimGridSize.x, (simRow + 0.5) / uSimGridSize.y)).x;
          for (int i = 0; i < ${capacity}; i++) {
            if (float(i) >= simCount) break;
            float simIndex = float(i);
            if (simRow >= 0.0) {
              int slot = i + 1;
              vec4 packed = texture2D(uSimLightGrid, vec2((float(slot / 4) + 0.5) / uSimGridSize.x, (simRow + 0.5) / uSimGridSize.y));
              simIndex = packed[slot - (slot / 4) * 4];
            }
            float x = (simIndex + 0.5) * uSimLightTexel;
            vec4 source = texture2D(uSimLightTexture, vec2(x, 0.125));
            if (source.w > 1.5) continue; // this exact source already uses a native light
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
    uniforms.uSimDayColor.value = new T.Color('#eef4ff');
    // Seven window or door bays on each side wall and the centre entrance. w = clear area × a display
    // gain chosen by eye; the porches shade these openings, so this is not a daylight calculation.
    const axes = ctx.DATA?.longitudinal || ctx.data?.longitudinal || {}, names = ["2′", '3', '4', '5', '6', '7', '8', '9'];
    const list = [];
    for (let i = 0; i + 1 < names.length; i++) for (const s of [-1, 1]) {
      const a = axes[names[i]], b = axes[names[i + 1]];
      if (Number.isFinite(a) && Number.isFinite(b)) list.push([(a + b) / 2, 2.1, s * 7.25, 7.6 * 1.6, 0, 0, -s]);
    }
    list.push([5.3, 1.7, 0, 6 * 0.9, 1, 0, 0]);
    while (list.length < OPENINGS) list.push([0, -100, 0, 0, 0, 1, 0]);
    uniforms.uSimOpenings.value = list.slice(0, OPENINGS).map(o => new T.Vector4(o[0], o[1], o[2], o[3]));
    uniforms.uSimOpeningNormals.value = list.slice(0, OPENINGS).map(o => new T.Vector3(o[4], o[5], o[6]));
    allocate(capacity);
    gridTexture = new T.DataTexture(new Float32Array(4), 1, 1, T.RGBAFormat, T.FloatType);
    gridTexture.minFilter = gridTexture.magFilter = T.NearestFilter;
    gridTexture.generateMipmaps = false; gridTexture.needsUpdate = true;
    uniforms.uSimLightGrid.value = gridTexture;
    uniforms.uSimGridSize.value = new T.Vector2(1, 1);
    bindObject(ctx.scene); bindObject(ctx.building);
  }
  function update(all, detailed, scale) {
    sources = all.filter(e => !detailed.has(e));
    if (all.length > capacity) allocate(all.length);
    const data = texture.image.data;
    all.forEach((e, i) => {
      data.set([...e.pos, (e.kind === 'spot' ? 1 : 0) + (detailed.has(e) ? 2 : 0)], i * 4);
      data.set([...e.color.map(c => c * e.cd), 0], (capacity + i) * 4);
      data.set([...(e.dir || [0, 0, 0]), e.cosOuter ?? -1], (2 * capacity + i) * 4);
      data.set([e.cosInner ?? 1, 0, 0, 0], (3 * capacity + i) * 4);
    });
    uniforms.uSimLightCount.value = all.length;
    // Source order is stable across native pool reassignment. Rebuild only for
    // actual source membership/geometry/cutoff changes, never just camera motion.
    if (GRID && (ctx.renderer.capabilities.maxTextureSize || 4096) >= GRID.cells) {
      const key = capacity + '|' + all.map(e => [e.kind, ...e.pos, ...(e.dir || []), e.cosOuter].join(',')).join(';');
      if (key !== gridKey) {
        gridKey = key;
        const grid = GRID.build(all, capacity);
        gridTexture.dispose();
        gridTexture = new T.DataTexture(grid.data, grid.width, grid.height, T.RGBAFormat, T.FloatType);
        gridTexture.minFilter = gridTexture.magFilter = T.NearestFilter;
        gridTexture.generateMipmaps = false; gridTexture.needsUpdate = true;
        uniforms.uSimLightGrid.value = gridTexture;
        uniforms.uSimGridSize.value.set(grid.width, grid.height);
        uniforms.uSimGridEnabled.value = 1;
        gridStats = { average: grid.average, max: grid.max, sources: all.length, bytes: grid.data.byteLength };
        gridBuilds++;
      }
    }
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
    daylight: value => { uniforms.uSimDaylight.value = value; },
    stats: () => ({ count: sources.length, capacity, grid: gridStats, gridBuilds }),
    // Verification switch: the reference loop uses exactly the same sources/PBR.
    setGridEnabled: value => { uniforms.uSimGridEnabled.value = value && gridStats ? 1 : 0; },
    // Read-only source records support coverage and switch-state verification.
    emitters: () => sources.slice()
  };
})();
