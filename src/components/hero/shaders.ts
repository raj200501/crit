// GLSL for the hero scene. Plain template strings: no loaders, no eval, CSP-safe.
// three r163+ is WebGL2-only, so ShaderMaterial compiles as GLSL ES 3.0 (dynamic uniform
// array indexing and fwidth() are available). Every fragment shader ends with
// colorspace_fragment so linear uniforms land correctly in the sRGB canvas.
//
// The glyph grammar matches PedigreeGlyph and the app (DESIGN §3.1): ring = certainty, filled core = heart condition
// reported, slash = deceased, square chip = portal record, arrow = the patient. "Light is earned": only known and
// conflicting relatives get a halo.

const common = /* glsl */ `
  uniform float uTime;      // wall-clock seconds, for idle micro-motion
  uniform float uStory;     // story time in seconds (scrubbable, stateless)
  uniform float uFlatten;   // 0 = 3D constellation, 1 = flat pedigree (summary hand-off)
  uniform vec2  uResolution;// drawing-buffer px
  uniform float uPixelRatio;
  uniform float uFocus;     // 0..1: a relative is hovered/focused (everything off their lineage dims)
  vec3 flatten(vec3 p) { return vec3(p.xy, p.z * (1.0 - uFlatten)); }
  float easeInOut(float t) { t = clamp(t, 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
`;

/* ---------- 1. Dust: fog that condenses into the tree (THREE.Points, 1 draw call) ---------- */
export const dustVert = /* glsl */ `
  ${common}
  uniform vec2  uMouse;         // NDC, damped on the CPU
  uniform float uMouseForce;    // 0 when the pointer is idle or on touch
  uniform float uAspect;
  uniform float uSize;
  uniform float uCondense[2];   // [start, end] story seconds
  uniform float uCrisp[16];     // per-node: 1 = known/conflicting, 0 = unknown/pending, 0.4 = declined
  uniform float uHi[16];        // per-node highlight (hovered 1, lineage ~0.5)
  attribute vec3 aHome;         // where this grain lives on the tree
  attribute vec4 aSeed;         // xyz: unit fog direction, w: random 0..1
  attribute float aNode;        // node index, or -1 for filament/free dust
  attribute float aFree;        // 1 = never condenses (ambient dust)
  varying float vAlpha;
  varying float vWarm;
  varying float vHi;

  void main() {
    float r = aSeed.w;
    // Stateless fog drift: analytic, so scrolling backwards un-condenses exactly.
    vec3 fog = aSeed.xyz * vec3(5.4, 3.0, 2.4)
      + 0.45 * vec3(sin(uTime * 0.21 + r * 40.0), cos(uTime * 0.17 + r * 31.0), sin(uTime * 0.13 + r * 23.0));

    float k = easeInOut((uStory - mix(uCondense[0], uCondense[1] - 0.6, r)) / 0.6);
    float crisp = 1.0;
    float hi = 0.0;
    if (aNode >= 0.0) { crisp = uCrisp[int(aNode)]; hi = uHi[int(aNode)]; }
    k *= (1.0 - aFree) * mix(0.72, 1.0, crisp);              // uncertain relatives stay hazy

    // Grains around a hovered relative gather in and brighten, as if the light leans toward them.
    float wobble = mix(0.55, 0.05, crisp) * (1.0 - aFree) * (1.0 - 0.6 * hi);
    vec3 home = aHome + wobble * vec3(sin(uTime * 0.6 + r * 17.0), cos(uTime * 0.5 + r * 11.0), sin(uTime * 0.4 + r * 7.0));
    vec3 p = flatten(mix(fog, home, k));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;

    // Pointer repulsion in screen space (no CPU simulation, no feedback textures).
    vec2 ndc = clip.xy / clip.w;
    vec2 d = ndc - uMouse; d.x *= uAspect;
    float f = exp(-dot(d, d) * 18.0) * uMouseForce;
    clip.xy += normalize(d + 1e-5) * f * 0.07 * clip.w * vec2(1.0 / uAspect, 1.0);

    gl_Position = clip;
    float bokeh = mix(3.4, 1.0, k);                            // unfocused fog grains read as soft light
    gl_PointSize = uSize * uPixelRatio * bokeh * mix(0.6, 1.4, fract(r * 7.13)) * (6.0 / -mv.z);
    vAlpha = mix(0.75, 0.9, k) * mix(0.6, 1.0, max(crisp, 1.0 - k)) * (0.55 + 0.45 * fract(r * 3.7)) / (bokeh * 0.6);
    vAlpha *= mix(1.0, 0.55, uFocus * (1.0 - hi)) * (1.0 + 1.1 * hi);
    vWarm = 1.0 - k; // fog is warmer and dimmer; condensed grains take the brand light
    vHi = hi;
  }
`;

export const dustFrag = /* glsl */ `
  uniform vec3 uColorFog;
  uniform vec3 uColorLight;
  varying float vAlpha;
  varying float vWarm;
  varying float vHi;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 c = mix(uColorLight, uColorFog, vWarm * (1.0 - vHi));
    gl_FragColor = vec4(c * a * a * vAlpha, 1.0);
    #include <colorspace_fragment>
  }
`;

/* ---------- 2. Filaments: instanced quadratic Bezier ribbons (1 draw call) ---------- */
export const filamentVert = /* glsl */ `
  ${common}
  uniform float uWidth;        // CSS px
  uniform float uGrow[2];      // story seconds
  attribute vec3 aP0;          // instanced: near end (toward "you")
  attribute vec3 aP1;          // control point
  attribute vec3 aP2;          // far end
  attribute vec4 aMeta;        // x: kind (0 parent, 1 couple), y: grow delay 0..1, z: highlight 0..1, w: seed
  varying float vT;
  varying float vSide;
  varying float vHead;
  varying vec4 vMeta;

  vec3 bez(float t) { float s = 1.0 - t; return s * s * aP0 + 2.0 * s * t * aP1 + t * t * aP2; }
  vec3 dbez(float t) { return 2.0 * (1.0 - t) * (aP1 - aP0) + 2.0 * t * (aP2 - aP1); }

  void main() {
    float t = position.x;        // 0..1 along the curve
    float side = position.y;     // -1 or +1 across the ribbon
    vec3 p = flatten(bez(t));
    vec3 q = flatten(bez(t) + dbez(t) * 0.01);
    vec4 c0 = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vec4 c1 = projectionMatrix * modelViewMatrix * vec4(q, 1.0);
    vec2 s0 = c0.xy / c0.w * uResolution;
    vec2 s1 = c1.xy / c1.w * uResolution;
    vec2 dir = normalize(s1 - s0 + 1e-6);
    vec2 n = vec2(-dir.y, dir.x);
    float w = uWidth * uPixelRatio * mix(1.0, 1.8, aMeta.z) * (aMeta.x > 0.5 ? 0.6 : 1.0);
    c0.xy += n * side * w / uResolution * c0.w;   // constant pixel width, no Line2 needed
    gl_Position = c0;

    float span = uGrow[1] - uGrow[0];
    vHead = clamp((uStory - uGrow[0] - aMeta.y * span * 0.6) / (span * 0.4), 0.0, 1.0);
    vT = t; vSide = side; vMeta = aMeta;
  }
`;

export const filamentFrag = /* glsl */ `
  uniform float uTime;
  uniform float uFocus;
  uniform vec3 uColorLine;
  uniform vec3 uColorLight;
  varying float vT;
  varying float vSide;
  varying float vHead;
  varying vec4 vMeta;
  void main() {
    if (vT > vHead) discard;                               // grows from "you" outward
    float x = abs(vSide);
    float core = smoothstep(0.45, 0.0, x);
    float glow = exp(-x * x * 5.0) * 0.4;                  // fake bloom: no post-processing pass
    float flow = 0.75 + 0.25 * sin((vT * 3.0 - uTime * 0.35 + vMeta.w) * 6.2831);
    float tip = smoothstep(vHead - 0.08, vHead, vT) * step(vHead, 0.999); // bright growing tip
    vec3 col = mix(uColorLine, uColorLight, clamp(vMeta.z * 0.85 + tip, 0.0, 1.0));
    float a = (core * 0.8 + glow) * flow * (vMeta.x > 0.5 ? 0.45 : 1.0);
    a *= mix(1.0, 0.3, uFocus * (1.0 - vMeta.z));          // off-lineage filaments step back
    gl_FragColor = vec4(col * a, 1.0);
    #include <colorspace_fragment>
  }
`;

/* ---------- 3. Nodes: instanced billboards with SDF pedigree glyphs (1 draw call) ---------- */
export const nodeVert = /* glsl */ `
  ${common}
  attribute vec3 aCenter;
  attribute vec4 aKind;     // x: shape (0 circle, 1 square, 2 diamond), y: status (0..5), z: reveal (story s), w: size
  attribute vec4 aFlags;    // x: from record, y: deceased + 2 * finding, z: highlight 0..1, w: story time of last status change
  varying vec2 vUv;
  varying vec4 vKind;
  varying vec4 vFlags;
  varying float vAppear;
  void main() {
    vec4 mv = modelViewMatrix * vec4(flatten(aCenter), 1.0);
    vAppear = smoothstep(aKind.z, aKind.z + 0.5, uStory);
    float hov = smoothstep(0.6, 1.0, aFlags.z);
    float s = aKind.w * (0.6 + 0.4 * vAppear) * (1.0 + 0.14 * hov);
    mv.xy += position.xy * s;     // camera-facing quad
    gl_Position = projectionMatrix * mv;
    vUv = position.xy;            // -1..1
    vKind = aKind; vFlags = aFlags;
  }
`;

export const nodeFrag = /* glsl */ `
  uniform float uTime;
  uniform float uStory;
  uniform float uFocus;
  uniform vec3 uColorKnown;
  uniform vec3 uColorConflict;
  uniform vec3 uColorUnknown;
  uniform vec3 uColorDeclined;
  uniform vec3 uColorLight;
  uniform vec3 uColorRecord;
  uniform vec3 uColorFog;
  varying vec2 vUv;
  varying vec4 vKind;
  varying vec4 vFlags;
  varying float vAppear;

  float sdShape(vec2 p, float shape, float r) {
    if (shape < 0.5) return length(p) - r;                                   // circle: female
    if (shape < 1.5) { vec2 q = abs(p) - vec2(r * 0.84); return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r * 0.12; } // square: male
    return (abs(p.x) + abs(p.y)) * 0.7071 - r * 0.86;                       // diamond: sex unknown
  }
  float band(float d, float w) { float aa = fwidth(d) * 1.2; return 1.0 - smoothstep(w - aa, w + aa, abs(d)); }
  float sdSeg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }

  void main() {
    vec2 p = vUv;
    float r = length(p);
    float ang = atan(p.y, p.x);
    float st = vKind.y;
    float shape = vKind.x;
    float d = sdShape(p, shape, 0.42);
    float deceased = mod(vFlags.y, 2.0);
    float finding = step(1.5, vFlags.y);
    float core = 1.0 - smoothstep(-0.2, -0.1, d);           // inset core (NSGC "affected" fill)
    float halo = exp(-r * r * 4.0) * smoothstep(1.0, 0.6, r); // fades before the quad edge
    float since = uStory - vFlags.w;
    vec3 col = vec3(0.0);

    if (st < 0.5) {                                   // known: solid ring + halo (light is earned)
      col += uColorKnown * band(d, 0.035);
      col += uColorKnown * halo * 0.35;
      col += uColorLight * core * 0.62 * finding;
    } else if (st < 1.5) {                            // conflicting: two voices, one solid, one dashed, drifting apart
      float split = 0.05 * smoothstep(0.0, 0.7, since);
      float dl = sdShape(p + vec2(split, 0.0), shape, 0.42);
      float dr = sdShape(p - vec2(split, 0.0), shape, 0.42);
      float dash = step(0.4, fract(ang / 6.2831 * 18.0));
      col += uColorKnown * band(dl, 0.032) * step(p.x, 0.0);
      col += uColorConflict * band(dr, 0.032) * step(0.0, p.x) * dash;
      col += mix(uColorKnown, uColorConflict, 0.5 + 0.5 * sin(uTime * 1.1)) * halo * 0.26;
      col += uColorLight * core * 0.62 * finding;
    } else if (st < 2.5) {                            // unknown: dashed, hollow, still searching
      float dash = step(0.45, fract(ang / 6.2831 * 14.0 + uTime * 0.03));
      col += uColorUnknown * band(d, 0.028) * dash * 0.85;
    } else if (st < 3.5) {                            // declined: thin ring, and a calm veil that closes from the centre
      float closing = smoothstep(0.0, 0.9, since);
      float inside = (1.0 - smoothstep(-0.01, 0.01, d)) * (1.0 - smoothstep(closing * 0.62 - 0.04, closing * 0.62, r));
      float hatch = step(0.6, fract((p.x + p.y) * 7.0));
      col += uColorDeclined * inside * (0.16 + 0.3 * hatch);
      col += uColorDeclined * band(d, 0.018) * 0.8;
    } else if (st < 4.5) {                            // not asked yet: faint dotted outline
      float dots = 1.0 - smoothstep(0.12, 0.26, abs(fract(ang / 6.2831 * 24.0) - 0.5));
      col += uColorFog * band(d, 0.024) * dots * 0.8;
    } else {                                          // the patient: ivory ring + proband arrow
      col += uColorLight * band(d, 0.035);
      col += uColorLight * halo * 0.16;
      float shaft = sdSeg(p, vec2(-0.8, -0.8), vec2(-0.47, -0.47));
      float h1 = sdSeg(p, vec2(-0.47, -0.47), vec2(-0.64, -0.47));
      float h2 = sdSeg(p, vec2(-0.47, -0.47), vec2(-0.47, -0.64));
      col += uColorLight * (1.0 - smoothstep(0.014, 0.032, min(shaft, min(h1, h2)))) * 0.9;
    }

    if (vFlags.x > 0.5) {                             // from a portal record: small square chip (record hue)
      vec2 c = p - vec2(0.47, 0.47);
      float chip = 1.0 - smoothstep(0.075, 0.095, max(abs(c.x), abs(c.y)));
      col += uColorRecord * chip;
    }
    if (deceased > 0.5) {                             // deceased: NSGC diagonal stroke
      float diag = abs(p.x - p.y) * 0.7071;
      col += uColorUnknown * (1.0 - smoothstep(0.012, 0.03, diag)) * step(r, 0.62) * 0.75;
    }
    if (since > 0.0 && since < 1.2) {                 // ripple when a new answer lands (record answers ripple in the record hue)
      vec3 rc = vFlags.x > 0.5 ? uColorRecord : uColorLight;
      col += rc * band(r - (0.45 + since * 0.45), 0.02) * (1.0 - since / 1.2);
    }
    float hov = smoothstep(0.6, 1.0, vFlags.z);
    col += uColorLight * band(d - 0.12, 0.012) * hov * 0.9;  // hover / keyboard focus ring (the DOM label rings too)
    col *= mix(1.0, 0.32 + 0.68 * smoothstep(0.0, 0.4, vFlags.z), uFocus); // focus + context: off-lineage glyphs dim

    gl_FragColor = vec4(col * vAppear, 1.0);
    #include <colorspace_fragment>
  }
`;

/* ---------- 4. Pulses: answers travelling to a node (instanced comets, 1 draw call) ---------- */
export const pulseVert = /* glsl */ `
  ${common}
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec4 aTiming;   // x: start, y: end (story s), z: kind (0 invite, 1 report, 2 record, 3 self), w: trail index 0..5
  varying vec2 vUv;
  varying float vAlpha;
  varying float vKind;
  void main() {
    float u = (uStory - aTiming.x) / max(aTiming.y - aTiming.x, 1e-3) - aTiming.w * 0.035;
    float live = step(0.0, u) * step(u, 1.0);
    u = clamp(u, 0.0, 1.0);
    vec3 a = flatten(aFrom), b = flatten(aTo);
    vec3 ctrl = mix(a, b, 0.5) + vec3(0.0, 0.5, 1.4);       // arc toward the viewer
    float s = 1.0 - u;
    vec3 p = aTiming.z > 2.5 ? b : s * s * a + 2.0 * s * u * ctrl + u * u * b;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float size = (aTiming.z > 2.5 ? 0.35 + u * 0.4 : (aTiming.z > 1.5 ? 0.13 : 0.11)) * (1.0 - aTiming.w * 0.13);
    mv.xy += position.xy * size * live;
    gl_Position = projectionMatrix * mv;
    vUv = position.xy;
    vAlpha = live * (1.0 - aTiming.w / 6.0) * smoothstep(0.0, 0.08, u) * (aTiming.z > 2.5 ? 1.0 - u : 1.0);
    vKind = aTiming.z;
  }
`;

export const pulseFrag = /* glsl */ `
  uniform vec3 uColorKnown;
  uniform vec3 uColorLight;
  uniform vec3 uColorRecord;
  varying vec2 vUv;
  varying float vAlpha;
  varying float vKind;
  void main() {
    float r = length(vUv);
    bool record = vKind > 1.5 && vKind < 2.5;
    float shape = record
      ? 1.0 - smoothstep(0.45, 0.6, max(abs(vUv.x), abs(vUv.y)))            // record fact: a square, in the record hue
      : vKind > 2.5 ? 1.0 - smoothstep(0.02, 0.06, abs(r - 0.8))             // self answer: ripple
      : exp(-r * r * 6.0);                                                    // report/invite: comet
    vec3 col = record ? uColorRecord : vKind < 0.5 ? uColorLight * 0.7 : mix(uColorKnown, uColorLight, 0.35);
    gl_FragColor = vec4(col * shape * vAlpha, 1.0);
    #include <colorspace_fragment>
  }
`;
