/* Display finish, 2026-11-10: contact shading, highlight roll-off and glow.
 *
 * Display only. The scene is drawn once into a floating-point picture with its
 * depth; a second step darkens creases and contacts (where a pew meets the
 * floor, a wall meets the ceiling) from that depth, compresses very bright
 * surfaces so lit stone keeps its shape and colour before the tone curve, and
 * lets lamps, flames and gilded highlights glow a little, with a faint haze over distance.
 * Nothing here changes the model, a lamp, a material, the analysis or its
 * results: lux, STI and air figures come from the simulator, never from pixels.
 *
 * Off with ?graphics=light or ?finish=off, for orthographic drawing views, and
 * whenever the browser cannot draw to a floating-point target.
 */
(() => {
  'use strict';
  const query = new URLSearchParams(location.search);
  const settings = {
    enabled: query.get('graphics') !== 'light' && query.get('finish') !== 'off',
    radius: 0.18,       // metres: keep shading local to the join
    strength: 0.75,     // 0 = none
    floor: 0.72,        // darkest multiplier a crease can reach
    fadeStart: 45,       // metres from the eye where the shading starts to fade
    fadeEnd: 90,
    shadeOnly: false,    // review aid: show the shading alone
    knee: { day: 1.0, evening: 0.4 },    // scene radiance where the roll-off begins
    range: { day: 2.2, evening: 0.8 },   // radiance added above the knee at most
    // Soft glow round lamps, flames and gilded highlights: only radiance above the
    // threshold spreads, so lit walls and floors stay crisp.
    glow: { day: 0.22, evening: 0.3 },
    glowThreshold: { day: 1.5, evening: 4.0 },
    // Faint air in a long room: distant surfaces drift toward a warm veil (evening: the lamps'
    // glow in the roof; day: pale sky light). Distance in metres where half the veil is reached.
    haze: { day: 0.05, evening: 0.1 },
    hazeHalf: 55,
    hazeColour: { day: [0.62, 0.64, 0.66], evening: [0.42, 0.3, 0.2] }
  };
  let T, renderer, scene, base, mode = 'day', busy = false, failed = false;
  let colour, half, blurA, blurB, glowA, glowB, quad, quadScene, quadCamera, aoMaterial, blurMaterial, brightMaterial, glowMaterial, outMaterial;
  const size = { x: 0, y: 0 };
  const stats = { active: false, width: 0, height: 0, frames: 0, reason: '' };

  const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const VIEW = `
    uniform sampler2D tDepth; uniform mat4 uProjectionInverse; uniform vec2 uTexel;
    // Read depth and rebuild the eye-space position from the same texel.
    // AO is half-resolution, so its pixel centres can lie between depth texels.
    ivec2 depthPixel(vec2 uv) {
      return clamp(ivec2(uv / uTexel), ivec2(0), textureSize(tDepth, 0) - 1);
    }
    vec3 viewAtDepth(ivec2 px, float depth) {
      vec2 uv = (vec2(px) + 0.5) * uTexel;
      vec4 p = uProjectionInverse * vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
      return p.xyz / p.w;
    }
    vec3 viewAt(ivec2 px) {
      px = clamp(px, ivec2(0), textureSize(tDepth, 0) - 1);
      return viewAtDepth(px, texelFetch(tDepth, px, 0).x);
    }`;
  // Occlusion of the hemisphere over each visible point, from neighbouring depths.
  const AO_FRAG = `
    varying vec2 vUv; ${VIEW}
    uniform float uRadius, uProjectionScale, uFadeStart, uFadeEnd;
    const int DIRECTIONS = 6, STEPS = 6;
    void main() {
      ivec2 px = depthPixel(vUv);
      float depth = texelFetch(tDepth, px, 0).x;
      if (depth >= 0.99999) { gl_FragColor = vec4(1.0, 1000.0, 0.0, 1.0); return; }
      vec3 p = viewAtDepth(px, depth);
      float fade = 1.0 - smoothstep(uFadeStart, uFadeEnd, -p.z);
      if (fade <= 0.0) { gl_FragColor = vec4(1.0, -p.z, 0.0, 1.0); return; }
      vec3 l = viewAt(px - ivec2(1, 0)), r = viewAt(px + ivec2(1, 0));
      vec3 d = viewAt(px - ivec2(0, 1)), u = viewAt(px + ivec2(0, 1));
      vec3 dx = abs(l.z - p.z) < abs(r.z - p.z) ? p - l : r - p;
      vec3 dy = abs(d.z - p.z) < abs(u.z - p.z) ? p - d : u - p;
      // A clamped neighbour at the viewport edge may coincide with p.
      vec3 n = cross(dx, dy);
      n /= max(length(n), 1e-10);
      float screen = min(uRadius * uProjectionScale / -p.z, 0.16);
      // A fixed symmetric kernel keeps long, identical grooves evenly shaded.
      // Suppress steps smaller than one screen pixel on the receiving plane.
      float footprint = -p.z * uTexel.y / uProjectionScale;
      float sum = 0.0;
      // For each direction, the highest thing within reach above the surface's own plane.
      for (int i = 0; i < DIRECTIONS; i++) {
        float a = (float(i) + 0.25) * 6.2831853 / float(DIRECTIONS), horizon = 0.0;
        vec2 direction = vec2(cos(a) * uTexel.x / uTexel.y, sin(a)) * screen;
        for (int j = 0; j < STEPS; j++) {
          vec2 uv = vUv + direction * (float(j) + 0.65) / float(STEPS);
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) break;
          vec3 v = viewAt(depthPixel(uv)) - p;
          float len = length(v), reach = len / uRadius;
          // Surfaces beyond reach belong to another object: no shade from them.
          horizon = max(horizon, ((dot(n, v) - min(footprint, 0.03)) / max(len, 1e-4) - 0.1) * max(0.0, 1.0 - reach * reach));
        }
        sum += horizon;
      }
      gl_FragColor = vec4(1.0 - fade * min(1.0, sum / (0.5 * float(DIRECTIONS))), -p.z, 0.0, 1.0);
    }`;
  // Depth-aware blur limits shade crossing a silhouette.
  const BLUR_FRAG = `
    varying vec2 vUv; uniform sampler2D tAO; uniform vec2 uStep;
    uniform float uProjectionScale, uPixelHeight, uReach;
    void main() {
      vec2 c = texture2D(tAO, vUv).xy;
      // Limit the blur in metres so it cannot widen over the wall as the
      // model gets smaller on screen. Keep the depth check at silhouettes.
      float metresPerPixel = c.y * uPixelHeight / uProjectionScale;
      vec2 stepUV = uStep * min(1.0, uReach / max(4.0 * metresPerPixel, 1e-4));
      float total = c.x * 0.2, weight = 0.2;
      for (int i = 1; i <= 4; i++) {
        float g = 0.2 - 0.04 * float(i);
        for (int s = -1; s <= 1; s += 2) {
          vec2 q = texture2D(tAO, vUv + stepUV * float(i * s)).xy;
          float w = g * max(0.0, 1.0 - abs(q.y - c.y) / (0.025 + metresPerPixel));
          total += q.x * w; weight += w;
        }
      }
      gl_FragColor = vec4(total / weight, c.y, 0.0, 1.0);
    }`;
  // Radiance above the threshold, limited so one lamp cannot flood the picture.
  const BRIGHT_FRAG = `
    varying vec2 vUv; uniform sampler2D tColor; uniform vec2 uTexel; uniform float uThreshold;
    void main() {
      vec3 sum = vec3(0.0);
      for (int i = 0; i < 4; i++) {
        vec2 o = vec2(i == 0 || i == 3 ? -1.0 : 1.0, i < 2 ? -1.0 : 1.0);
        vec3 c = texture2D(tColor, vUv + o * uTexel).rgb;
        float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
        sum += c * (clamp(lum - uThreshold, 0.0, 6.0) / max(lum, 1e-4));
      }
      gl_FragColor = vec4(sum * 0.25, 1.0);
    }`;
  const GLOW_FRAG = `
    varying vec2 vUv; uniform sampler2D tGlow; uniform vec2 uStep;
    void main() {
      vec3 sum = texture2D(tGlow, vUv).rgb * 0.227;
      sum += (texture2D(tGlow, vUv + uStep * 1.385).rgb + texture2D(tGlow, vUv - uStep * 1.385).rgb) * 0.316;
      sum += (texture2D(tGlow, vUv + uStep * 3.231).rgb + texture2D(tGlow, vUv - uStep * 3.231).rgb) * 0.0705;
      gl_FragColor = vec4(sum, 1.0);
    }`;
  const OUT_FRAG = `
    varying vec2 vUv; uniform sampler2D tColor, tAO, tGlow;
    uniform float uStrength, uFloor, uKnee, uRange, uShadeOnly, uGlow, uHaze, uHazeHalf;
    uniform vec3 uHazeColour;
    void main() {
      vec3 c = texture2D(tColor, vUv).rgb;
      // Roll bright surfaces off by luminance, keeping their hue.
      float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
      if (lum > uKnee) {
        float over = lum - uKnee;
        c *= (uKnee + over / (1.0 + over / uRange)) / lum;
      }
      c += texture2D(tGlow, vUv).rgb * uGlow;
      // Haze from the view distance kept beside the shading; the sky (beyond 900 m) has none.
      float dist = texture2D(tAO, vUv).y;
      if (dist < 900.0) c = mix(c, uHazeColour, uHaze * (1.0 - exp2(-dist / uHazeHalf)));
      gl_FragColor = vec4(c, 1.0);
      #include <tonemapping_fragment>
      // Shade after the tone curve, so a crease reads as well on bright stone as on dark timber.
      float shade = max(uFloor, 1.0 - uStrength * (1.0 - texture2D(tAO, vUv).x));
      gl_FragColor.rgb = uShadeOnly > 0.5 ? vec3(shade) : gl_FragColor.rgb * shade;
      #include <colorspace_fragment>
      // Half a display step of noise hides banding on smooth plaster.
      gl_FragColor.rgb += (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
    }`;

  function pass(fragment, uniforms, toneMapped = false) {
    return new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: fragment, uniforms, depthTest: false, depthWrite: false, toneMapped });
  }
  function build() {
    const options = { type: T.HalfFloatType, depthBuffer: false, minFilter: T.LinearFilter, magFilter: T.LinearFilter };
    colour = new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType, samples: 4, depthTexture: new T.DepthTexture(4, 4, T.UnsignedIntType) });
    colour.texture.name = 'Display finish: scene before contact shading';
    half = new T.WebGLRenderTarget(4, 4, { ...options, minFilter: T.NearestFilter, magFilter: T.NearestFilter });
    blurA = new T.WebGLRenderTarget(4, 4, options);
    blurB = new T.WebGLRenderTarget(4, 4, options);
    glowA = new T.WebGLRenderTarget(4, 4, options);
    glowB = new T.WebGLRenderTarget(4, 4, options);
    aoMaterial = pass(AO_FRAG, {
      tDepth: { value: colour.depthTexture }, uProjectionInverse: { value: new T.Matrix4() }, uTexel: { value: new T.Vector2() },
      uRadius: { value: 0 }, uProjectionScale: { value: 1 }, uFadeStart: { value: 0 }, uFadeEnd: { value: 1 }
    });
    blurMaterial = pass(BLUR_FRAG, {
      tAO: { value: null }, uStep: { value: new T.Vector2() },
      uProjectionScale: { value: 1 }, uPixelHeight: { value: 1 }, uReach: { value: 0 }
    });
    brightMaterial = pass(BRIGHT_FRAG, { tColor: { value: colour.texture }, uTexel: { value: new T.Vector2() }, uThreshold: { value: 1 } });
    glowMaterial = pass(GLOW_FRAG, { tGlow: { value: null }, uStep: { value: new T.Vector2() } });
    outMaterial = pass(OUT_FRAG, {
      tColor: { value: colour.texture }, tAO: { value: blurB.texture }, tGlow: { value: glowB.texture }, uGlow: { value: 0 }, uHaze: { value: 0 }, uHazeHalf: { value: 50 }, uHazeColour: { value: new T.Vector3() },
      uStrength: { value: 1 }, uFloor: { value: 0 }, uKnee: { value: 1 }, uRange: { value: 1 }, uShadeOnly: { value: 0 }
    }, true);
    quad = new T.Mesh(new T.PlaneGeometry(2, 2), aoMaterial);
    quad.frustumCulled = false;
    quadScene = new T.Scene(); quadScene.add(quad);
    quadCamera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
  function resize() {
    const v = renderer.getDrawingBufferSize(new T.Vector2());
    if (v.x === size.x && v.y === size.y) return;
    size.x = v.x; size.y = v.y;
    const w = Math.max(2, Math.ceil(v.x / 2)), h = Math.max(2, Math.ceil(v.y / 2));
    colour.setSize(v.x, v.y); half.setSize(w, h); blurA.setSize(w, h); blurB.setSize(w, h);
    const gw = Math.max(2, Math.ceil(v.x / 4)), gh = Math.max(2, Math.ceil(v.y / 4));
    glowA.setSize(gw, gh); glowB.setSize(gw, gh);
    stats.width = v.x; stats.height = v.y;
  }
  function draw(material, target) {
    quad.material = material;
    renderer.setRenderTarget(target);
    base(quadScene, quadCamera);
  }
  function render(view, camera) {
    if (busy || failed || !settings.enabled || view !== scene || !camera.isPerspectiveCamera || renderer.getRenderTarget()) {
      stats.active = false;
      return base(view, camera);
    }
    busy = true;
    const info = renderer.info, reset = info.autoReset;
    try {
      if (!colour) build();
      resize();
      // The scene's own counts stay readable after the extra full-screen steps.
      info.autoReset = false; info.reset();
      renderer.setRenderTarget(colour);
      base(view, camera);
      const ao = aoMaterial.uniforms;
      ao.uProjectionInverse.value.copy(camera.projectionMatrixInverse);
      ao.uTexel.value.set(1 / size.x, 1 / size.y);
      ao.uRadius.value = settings.radius;
      ao.uProjectionScale.value = camera.projectionMatrix.elements[5] * 0.5;
      ao.uFadeStart.value = settings.fadeStart; ao.uFadeEnd.value = settings.fadeEnd;
      draw(aoMaterial, half);
      const blur = blurMaterial.uniforms;
      blur.uProjectionScale.value = ao.uProjectionScale.value;
      blur.uPixelHeight.value = 1 / half.height;
      blur.uReach.value = settings.radius * 0.2;
      blur.tAO.value = half.texture;
      blur.uStep.value.set(1 / half.width, 0);
      draw(blurMaterial, blurA);
      blur.tAO.value = blurA.texture;
      blur.uStep.value.set(0, 1 / half.height);
      draw(blurMaterial, blurB);
      brightMaterial.uniforms.uTexel.value.set(1 / size.x, 1 / size.y);
      brightMaterial.uniforms.uThreshold.value = settings.glowThreshold[mode];
      draw(brightMaterial, glowB);
      for (const step of [1, 2, 4]) {
        glowMaterial.uniforms.tGlow.value = glowB.texture;
        glowMaterial.uniforms.uStep.value.set(step / glowB.width, 0);
        draw(glowMaterial, glowA);
        glowMaterial.uniforms.tGlow.value = glowA.texture;
        glowMaterial.uniforms.uStep.value.set(0, step / glowB.height);
        draw(glowMaterial, glowB);
      }
      const out = outMaterial.uniforms;
      out.uGlow.value = settings.glow[mode];
      out.uHaze.value = settings.haze[mode]; out.uHazeHalf.value = settings.hazeHalf;
      out.uHazeColour.value.fromArray(settings.hazeColour[mode]);
      out.uStrength.value = settings.strength; out.uFloor.value = settings.floor;
      out.uShadeOnly.value = settings.shadeOnly ? 1 : 0;
      out.uKnee.value = settings.knee[mode]; out.uRange.value = settings.range[mode];
      draw(outMaterial, null);
      stats.active = true; stats.frames++;
    } catch (error) {
      // Keep the church on screen: fall back to the plain picture for good.
      failed = true; stats.active = false; stats.reason = String(error?.message || error);
      renderer.setRenderTarget(null);
      base(view, camera);
    } finally {
      info.autoReset = reset;
      busy = false;
    }
  }
  function attach(context) {
    if (renderer || !context?.renderer) return false;
    ({ THREE: T, renderer, scene } = context);
    const gl = renderer.getContext();
    if (!renderer.capabilities.isWebGL2 && !(typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext)) {
      stats.reason = 'WebGL 2 is not available'; renderer = null; return false;
    }
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) {
      stats.reason = 'No floating-point render target'; renderer = null; return false;
    }
    base = renderer.render.bind(renderer);
    renderer.render = render;
    return true;
  }
  window.CHURCH_DISPLAY_FINISH = {
    attach, settings, stats,
    lighting: value => { mode = value === 'evening' ? 'evening' : 'day'; },
    setEnabled: value => { settings.enabled = !!value; return settings.enabled; }
  };
})();
