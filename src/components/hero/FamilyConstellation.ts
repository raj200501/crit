// Vanilla three.js engine for the landing hero ("Resolve Constellation", DESIGN §9). Imported only through a dynamic
// import() from HeroStage (client-only), so three never reaches the server bundle or the first-load JS.
// Named imports from "three" core only. 4 draw calls, no per-frame allocations, DPR capped by tier.

import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Timer,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Plate } from "./clearing-constants";
import type { StoryModel } from "./story";
import { keyframeAt, phaseAt, SHAPE_CODE, STATUS_CODE, VIEW, VIEW_CENTER, type Phase } from "./story";
import * as S from "./shaders";

export type { Plate };

// Seeded PRNG so screenshots are deterministic (visual regression) and every visit looks the same.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Tier = 0 | 1 | 2; // 0 low (phones), 1 medium, 2 high
const TIER = [
  { dpr: 1.0, dust: 3500 },
  { dpr: 1.25, dust: 8000 },
  { dpr: 1.6, dust: 14000 },
] as const;

export type SceneColors = Partial<Record<"fog" | "light" | "line" | "known" | "conflict" | "unknown" | "declined" | "bg" | "record", string>>;

export interface EngineOptions {
  model: StoryModel;
  tier: Tier;
  /** Initial plate (where the pedigree sits, in % of the canvas). */
  plate?: Plate;
  /** Element that receives pointer input (the window), so DOM labels over the canvas don't break parallax or hover. */
  eventTarget?: HTMLElement;
  /** Called every frame with each node's CSS-pixel position, for the DOM label layer. */
  onProject?: (id: string, x: number, y: number, depth: number) => void;
  /** Pointer near a glyph (screen-space pick, ≤ 34 px). */
  onHover?: (id: string | null) => void;
  /** Click or tap on the canvas: a relative, or null for empty space. */
  onSelect?: (id: string | null) => void;
  onKeyframe?: (index: number) => void;
  /** fog | grow | invite | answers | summary, for DOM copy and label visibility. */
  onPhase?: (phase: Phase) => void;
  /** Every rendered frame, story seconds (write CSS directly; never set React state here). */
  onStory?: (storySeconds: number) => void;
  /** Autoplay reached the end of "answers" (once per replay). */
  onAutoplayEnd?: () => void;
  /** The device can't hold ~30 fps even at the lowest tier, or the context was lost: swap to the poster. */
  onFallback?: () => void;
  colors?: SceneColors;
}

export class FamilyConstellation {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(30, 1, 0.1, 100);
  private timer = new Timer();
  private uniforms = {
    uTime: { value: 0 },
    uStory: { value: 0 },
    uFlatten: { value: 0 },
    uFocus: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uPixelRatio: { value: 1 },
  };
  private dust: Points;
  private dustGeo: BufferGeometry;
  private nodesGeo: InstancedBufferGeometry;
  private filGeo: InstancedBufferGeometry;
  private materials: ShaderMaterial[] = [];
  private nodeKind: InstancedBufferAttribute;
  private nodeFlags: InstancedBufferAttribute;
  private filMeta: InstancedBufferAttribute;
  private crisp = new Float32Array(16);
  private hi = new Float32Array(16); // damped per-node highlight, shared with the dust shader

  private story = 0; // story seconds actually shown
  private autoStory = 0; // advances on its own once, up to the end of "answers"
  private target: number | null = null; // null = autoplay; a number = scroll/chapter control drives the story
  private autoplayStop: number;
  private autoplayEnded = false;
  private keyframe = -1;
  private phase: Phase | null = null;
  private paused = false;
  private visible = true;
  private frozen = false;
  private running = false;
  private disposed = false;

  private pointer = new Vector2(0, 0); // NDC
  private pointerDamped = new Vector2(0, 0);
  private pointerForce = 0;
  private dragYaw = 0;
  private yaw = 0;
  private pitch = 0;
  private dragging: { x: number; y: number; yaw: number; moved: boolean } | null = null;
  private hovered: string | null = null;
  private focusId: string | null = null; // DOM hover/focus/selection (wins over the canvas pick for the highlight)
  private highlightTarget = new Float32Array(16);
  private focusTarget = 0;
  private projected: { x: number; y: number }[] = [];
  private tmp = new Vector3();
  private cssSize = { w: 1, h: 1 };
  private plate: Plate = { cx: 50, cy: 50, pw: 100, ph: 100 };
  private clip: { l: number; t: number; w: number; h: number } | null = null;
  private baseDistance = 16;
  private tier: Tier;
  private frameTimes: number[] = [];
  private frameCount = 0;
  private events: HTMLElement;
  private lineage: number[][]; // per node: indices of the nodes that share a filament with it

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: EngineOptions,
  ) {
    this.tier = opts.tier;
    this.events = opts.eventTarget ?? canvas;
    if (opts.plate) this.plate = opts.plate;
    this.autoplayStop = opts.model.t.answers[1] + 0.2;
    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "default", stencil: false, depth: false });
    const c = { bg: "#0b1514", fog: "#7d8f86", light: "#f2f5f1", line: "#2f8f7a", known: "#a8f0d1", conflict: "#f2d38a", unknown: "#8fa3a0", declined: "#6c7d7a", record: "#afc0ff" };
    for (const [k, v] of Object.entries(opts.colors ?? {})) if (v) c[k as keyof typeof c] = v; // never let an empty CSS var become white
    this.renderer.setClearColor(new Color(c.bg), 1);
    this.camera.position.set(0, 0, this.baseDistance);
    const col = (k: keyof typeof c) => ({ value: new Color(c[k]) });
    const { model } = opts;
    const rand = mulberry32(709);
    const N = model.nodes.length;
    const index = new Map(model.nodes.map((n, i) => [n.id, i]));
    const P = (id: string) => model.nodes[index.get(id)!].pos;
    this.lineage = model.nodes.map((n) => {
      const ids = new Set<string>();
      for (const l of model.links) if (l.people.includes(n.id)) l.people.forEach((p) => ids.add(p));
      ids.delete(n.id);
      return [...ids].map((id) => index.get(id)!).filter((i) => i !== undefined);
    });

    const mat = (vertexShader: string, fragmentShader: string, extra: Record<string, { value: unknown }>) => {
      const m = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { ...this.uniforms, ...extra }, // shared uniform objects: one write updates all
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });
      this.materials.push(m);
      return m;
    };

    // ---- Filaments: one strip geometry, instanced per link ----
    const SEG = 48;
    const strip: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= SEG; i++) strip.push(i / SEG, -1, 0, i / SEG, 1, 0);
    for (let i = 0; i < SEG; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    this.filGeo = new InstancedBufferGeometry();
    this.filGeo.setAttribute("position", new Float32BufferAttribute(strip, 3));
    this.filGeo.setIndex(idx);
    const L = model.links.length;
    const p0 = new Float32Array(L * 3),
      p1 = new Float32Array(L * 3),
      p2 = new Float32Array(L * 3),
      meta = new Float32Array(L * 4);
    model.links.forEach((l, i) => {
      p0.set(l.a, i * 3);
      p1.set(l.ctrl, i * 3);
      p2.set(l.b, i * 3);
      meta.set([l.kind === "couple" ? 1 : 0, l.delay, 0, rand() * 6.28], i * 4);
    });
    this.filGeo.setAttribute("aP0", new InstancedBufferAttribute(p0, 3));
    this.filGeo.setAttribute("aP1", new InstancedBufferAttribute(p1, 3));
    this.filGeo.setAttribute("aP2", new InstancedBufferAttribute(p2, 3));
    this.filMeta = new InstancedBufferAttribute(meta, 4).setUsage(DynamicDrawUsage);
    this.filGeo.setAttribute("aMeta", this.filMeta);
    this.filGeo.instanceCount = L;
    const filaments = new Mesh(this.filGeo, mat(S.filamentVert, S.filamentFrag, { uWidth: { value: 2.2 }, uGrow: { value: model.t.grow }, uColorLine: col("line"), uColorLight: col("light") }));
    filaments.frustumCulled = false;
    filaments.renderOrder = 1;

    // ---- Dust: homes sampled on filaments and around nodes ----
    const D = TIER[2].dust; // allocate for the top tier, draw fewer via setDrawRange
    const home = new Float32Array(D * 3),
      seed = new Float32Array(D * 4),
      nodeOf = new Float32Array(D),
      free = new Float32Array(D);
    const bez = (a: number[], c: number[], b: number[], t: number, k: number) => (1 - t) ** 2 * a[k] + 2 * (1 - t) * t * c[k] + t * t * b[k];
    for (let i = 0; i < D; i++) {
      const v = new Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize().multiplyScalar(0.25 + 0.75 * Math.cbrt(rand())); // fog volume, setup-time only
      seed.set([v.x, v.y, v.z, rand()], i * 4);
      const roll = rand();
      if (roll < 0.62) {
        const l = Math.floor(rand() * L),
          t = rand();
        const a = [...p0.subarray(l * 3, l * 3 + 3)],
          c = [...p1.subarray(l * 3, l * 3 + 3)],
          b = [...p2.subarray(l * 3, l * 3 + 3)];
        home.set(
          [0, 1, 2].map((k) => bez(a, c, b, t, k) + (rand() - 0.5) * 0.06),
          i * 3,
        );
        nodeOf[i] = -1;
      } else if (roll < 0.9) {
        const n = Math.floor(rand() * N),
          ang = rand() * Math.PI * 2,
          rad = 0.32 + rand() * 0.22;
        const c = model.nodes[n].pos;
        home.set([c[0] + Math.cos(ang) * rad, c[1] + Math.sin(ang) * rad, c[2] + (rand() - 0.5) * 0.2], i * 3);
        nodeOf[i] = n;
      } else {
        home.set([v.x * 9, v.y * 5, v.z * 4 - 2], i * 3);
        nodeOf[i] = -1;
        free[i] = 1;
      }
    }
    this.dustGeo = new BufferGeometry();
    this.dustGeo.setAttribute("position", new Float32BufferAttribute(new Float32Array(D * 3), 3)); // required by three; shader ignores it
    this.dustGeo.setAttribute("aHome", new Float32BufferAttribute(home, 3));
    this.dustGeo.setAttribute("aSeed", new Float32BufferAttribute(seed, 4));
    this.dustGeo.setAttribute("aNode", new Float32BufferAttribute(nodeOf, 1));
    this.dustGeo.setAttribute("aFree", new Float32BufferAttribute(free, 1));
    this.dust = new Points(
      this.dustGeo,
      mat(S.dustVert, S.dustFrag, {
        uMouse: { value: this.pointerDamped },
        uMouseForce: { value: 0 },
        uAspect: { value: 1 },
        uSize: { value: 2.4 },
        uCondense: { value: model.t.condense },
        uCrisp: { value: this.crisp },
        uHi: { value: this.hi },
        uColorFog: col("fog"),
        uColorLight: col("light"),
      }),
    );
    this.dust.frustumCulled = false;

    // ---- Nodes: instanced billboards ----
    this.nodesGeo = new InstancedBufferGeometry();
    this.nodesGeo.setAttribute("position", new Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
    this.nodesGeo.setIndex([0, 1, 2, 0, 2, 3]);
    const centers = new Float32Array(N * 3),
      kind = new Float32Array(N * 4),
      flags = new Float32Array(N * 4);
    model.nodes.forEach((n, i) => {
      centers.set(n.pos, i * 3);
      kind.set([SHAPE_CODE[n.shape], n.isSelf ? STATUS_CODE.self : STATUS_CODE.pending, model.t.grow[0] + 0.25 * (2 - n.gen), n.isSelf ? 0.62 : 0.5], i * 4);
      flags.set([0, n.deceased ? 1 : 0, 0, -10], i * 4);
    });
    this.nodesGeo.setAttribute("aCenter", new InstancedBufferAttribute(centers, 3));
    this.nodeKind = new InstancedBufferAttribute(kind, 4).setUsage(DynamicDrawUsage);
    this.nodeFlags = new InstancedBufferAttribute(flags, 4).setUsage(DynamicDrawUsage);
    this.nodesGeo.setAttribute("aKind", this.nodeKind);
    this.nodesGeo.setAttribute("aFlags", this.nodeFlags);
    this.nodesGeo.instanceCount = N;
    const nodes = new Mesh(
      this.nodesGeo,
      mat(S.nodeVert, S.nodeFrag, {
        uColorKnown: col("known"),
        uColorConflict: col("conflict"),
        uColorUnknown: col("unknown"),
        uColorDeclined: col("declined"),
        uColorLight: col("light"),
        uColorRecord: col("record"),
        uColorFog: col("fog"),
      }),
    );
    nodes.frustumCulled = false;
    nodes.renderOrder = 3;

    // ---- Pulses: 6 trail sub-instances per pulse ----
    const pulseGeo = new InstancedBufferGeometry();
    pulseGeo.setAttribute("position", new Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
    pulseGeo.setIndex([0, 1, 2, 0, 2, 3]);
    const TRAIL = 6,
      PN = model.pulses.length * TRAIL;
    const from = new Float32Array(PN * 3),
      to = new Float32Array(PN * 3),
      timing = new Float32Array(PN * 4);
    const recordOrigin: [number, number, number] = [9, 2.5, 1]; // off-stage: the relative's own portal
    const kindCode = { invite: 0, report: 1, record: 2, self: 3 } as const;
    model.pulses.forEach((p, i) => {
      for (let k = 0; k < TRAIL; k++) {
        const j = i * TRAIL + k;
        from.set(p.from === "record" ? recordOrigin : P(p.from), j * 3);
        to.set(P(p.to), j * 3);
        timing.set([p.start, p.end, kindCode[p.kind], p.kind === "self" ? (k === 0 ? 0 : 99) : k], j * 4);
      }
    });
    pulseGeo.setAttribute("aFrom", new InstancedBufferAttribute(from, 3));
    pulseGeo.setAttribute("aTo", new InstancedBufferAttribute(to, 3));
    pulseGeo.setAttribute("aTiming", new InstancedBufferAttribute(timing, 4));
    pulseGeo.instanceCount = PN;
    const pulses = new Mesh(pulseGeo, mat(S.pulseVert, S.pulseFrag, { uColorKnown: col("known"), uColorLight: col("light"), uColorRecord: col("record") }));
    pulses.frustumCulled = false;
    pulses.renderOrder = 2;

    this.scene.add(this.dust, filaments, pulses, nodes); // 4 draw calls total
    this.projected = model.nodes.map(() => ({ x: 0, y: 0 }));

    const ev = this.events;
    ev.addEventListener("pointermove", this.onPointerMove, { passive: true });
    ev.addEventListener("pointerdown", this.onPointerDown);
    ev.addEventListener("pointerleave", this.onPointerLeave, { passive: true });
    window.addEventListener("pointerup", this.onPointerUp, { passive: true });
    ev.addEventListener("pointercancel", this.onPointerCancel, { passive: true }); // vertical scroll on touch
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    this.applyTier();
  }

  // ---------- public API (called from React) ----------
  start() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.timer.reset();
    this.renderer.setAnimationLoop(this.frame);
  }
  stop() {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }
  setVisible(v: boolean) {
    this.visible = v;
    if (v && !this.paused && !this.frozen) this.start();
    else this.stop();
  }
  setPaused(p: boolean) {
    this.paused = p;
    if (p) {
      this.stop();
      this.render(); // keep a correct still frame
    } else if (this.visible && !this.frozen) this.start();
  }
  /** Re-fit the pedigree to a plate without resizing the renderer (cheap; called per scroll frame). */
  setPlate(plate: Plate) {
    this.plate = plate;
    const { w, h } = this.cssSize;
    const plateW = Math.max(1, Math.min((plate.pw / 100) * w, (plate.ph / 100) * h * (VIEW.w / VIEW.h)));
    const tan = Math.tan(MathUtils.degToRad(this.camera.fov / 2));
    this.baseDistance = (VIEW.w * h) / (2 * tan * plateW); // VIEW.w world units == plateW px at z = 0
    // Shift the image (not the scene) so dust can still drift outside the plate.
    this.camera.setViewOffset(w, h, -((plate.cx / 100) * w - w / 2), -((plate.cy / 100) * h - h / 2), w, h);
    this.camera.updateProjectionMatrix();
    this.placeCamera();
    if (!this.running) this.render();
  }
  /** Orbit around the centre of VIEW at the plate's distance. No dolly: the flattened frame matches the SVG posters. */
  private placeCamera() {
    const d = this.baseDistance,
      { yaw, pitch } = this;
    this.camera.position.set(VIEW_CENTER.x + Math.sin(yaw) * Math.cos(pitch) * d, VIEW_CENTER.y + Math.sin(pitch) * d, Math.cos(yaw) * Math.cos(pitch) * d);
    this.camera.lookAt(VIEW_CENTER.x, VIEW_CENTER.y, 0);
  }
  /** Rasterize only inside this CSS-px rect (the clipped window); null = the whole canvas. */
  setClip(rect: { l: number; t: number; w: number; h: number } | null) {
    const full = !rect || (rect.l <= 0.5 && rect.t <= 0.5 && rect.w >= this.cssSize.w - 1 && rect.h >= this.cssSize.h - 1);
    this.clip = full ? null : rect;
    this.applyClip();
    if (!this.running) this.render();
  }
  /** null: autoplay once to the end of "answers". A number: the story damps toward it, in both directions. */
  setTarget(storySeconds: number | null) {
    this.target = storySeconds;
    if (!this.running) {
      this.story = storySeconds ?? this.autoStory;
      this.syncStory();
      this.render();
    }
  }
  /** Stop the loop once the page has cleared; resume when scrolled back. */
  setFrozen(f: boolean) {
    if (f === this.frozen) return;
    this.frozen = f;
    if (f) this.stop();
    else if (this.visible && !this.paused) this.start();
  }
  replay() {
    // From fog again. If scroll or the chapter control drives the story, it rebuilds up to that point.
    this.story = this.autoStory = 0;
    this.autoplayEnded = false;
    this.syncStory();
    if (!this.paused && this.visible && !this.frozen) this.start();
    else this.render();
  }
  /** DOM hover, keyboard focus or a pinned receipt: highlights the node and its lineage (wins over the canvas pick). */
  setHighlight(id: string | null) {
    this.focusId = id;
    this.updateHighlightTargets();
  }
  resize(w: number, h: number) {
    this.cssSize = { w: Math.max(1, w), h: Math.max(1, h) };
    this.renderer.setSize(this.cssSize.w, this.cssSize.h, false);
    this.camera.aspect = this.cssSize.w / this.cssSize.h;
    this.syncResolution();
    this.applyClip();
    this.setPlate(this.plate);
  }
  dispose() {
    this.stop();
    this.disposed = true;
    const ev = this.events;
    ev.removeEventListener("pointermove", this.onPointerMove);
    ev.removeEventListener("pointerdown", this.onPointerDown);
    ev.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("pointerup", this.onPointerUp);
    ev.removeEventListener("pointercancel", this.onPointerCancel);
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.scene.traverse((o) => (o as Mesh).geometry?.dispose());
    this.materials.forEach((m) => m.dispose());
    this.renderer.dispose();
  }
  /** Test hook (?scene-debug): render one deterministic still frame at a given story time. */
  freeze(storySeconds: number, wallSeconds = 4) {
    this.setPaused(true);
    this.uniforms.uTime.value = wallSeconds;
    this.autoStory = Math.min(storySeconds, this.autoplayStop); // what the autoplayed state at the top shows
    this.pointerDamped.set(0, 0);
    this.dragYaw = this.yaw = this.pitch = 0;
    this.target = storySeconds;
    this.story = storySeconds;
    this.syncStory();
    this.placeCamera();
    this.render();
  }
  get info() {
    return { calls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles, points: this.renderer.info.render.points, tier: this.tier, story: this.story };
  }

  // ---------- frame loop ----------
  private frame = (now: number) => {
    this.timer.update(now);
    const dt = Math.min(this.timer.getDelta(), 1 / 20);
    this.uniforms.uTime.value += dt;
    this.watchPerformance(dt);
    if (!this.running) return; // fell back to the poster inside watchPerformance

    // Story clock: autoplay once to the end of "answers"; scroll or the chapter control can drive it anywhere.
    this.autoStory = Math.min(this.autoStory + dt, this.autoplayStop);
    const target = this.target ?? this.autoStory;
    this.story = Math.abs(target - this.story) < 0.1 && target >= this.story ? target : MathUtils.damp(this.story, target, 5, dt);
    if (Math.abs(target - this.story) < 0.002) this.story = target;
    if (!this.autoplayEnded && this.target === null && this.story >= this.autoplayStop - 1e-3) {
      this.autoplayEnded = true;
      this.opts.onAutoplayEnd?.();
    }
    this.syncStory();
    const flat = this.uniforms.uFlatten.value;

    // Camera: idle drift + pointer parallax + drag, all fading out as the tree flattens.
    this.pointerDamped.x = MathUtils.damp(this.pointerDamped.x, this.pointer.x, 5, dt);
    this.pointerDamped.y = MathUtils.damp(this.pointerDamped.y, this.pointer.y, 5, dt);
    const dustU = (this.dust.material as ShaderMaterial).uniforms;
    dustU.uMouseForce.value = MathUtils.damp(dustU.uMouseForce.value as number, this.pointerForce, 4, dt);
    if (!this.dragging) this.dragYaw = MathUtils.damp(this.dragYaw, 0, 1.5, dt); // spring back
    const t = this.uniforms.uTime.value;
    const yaw = (Math.sin(t * 0.12) * 0.06 + this.pointerDamped.x * 0.12 + this.dragYaw) * (1 - flat);
    const pitch = (Math.cos(t * 0.1) * 0.03 - this.pointerDamped.y * 0.06) * (1 - flat);
    this.yaw = yaw;
    this.pitch = pitch;
    this.placeCamera();

    const m = this.opts.model;
    for (let i = 0; i < m.nodes.length; i++) {
      this.hi[i] = MathUtils.damp(this.hi[i], this.highlightTarget[i], 10, dt);
      this.nodeFlags.setZ(i, this.hi[i]);
    }
    this.nodeFlags.needsUpdate = true;
    this.uniforms.uFocus.value = MathUtils.damp(this.uniforms.uFocus.value, this.focusTarget, 8, dt);

    this.render();
  };

  private render() {
    if (this.disposed) return;
    if (!this.running) {
      // Still frames (paused, frozen, scrubbed while stopped): settle highlight values instantly.
      for (let i = 0; i < this.opts.model.nodes.length; i++) {
        this.hi[i] = this.highlightTarget[i];
        this.nodeFlags.setZ(i, this.hi[i]);
      }
      this.nodeFlags.needsUpdate = true;
      this.uniforms.uFocus.value = this.focusTarget;
    }
    this.renderer.render(this.scene, this.camera);
    this.projectLabels();
    this.opts.onStory?.(this.story);
  }

  private syncStory() {
    const m = this.opts.model;
    this.uniforms.uStory.value = this.story;
    this.uniforms.uFlatten.value = MathUtils.smoothstep(this.story, m.t.summary[0], m.t.summary[1]);
    this.applyKeyframe();
  }

  private applyKeyframe() {
    const m = this.opts.model;
    const ph = phaseAt(m, this.story);
    if (ph !== this.phase) {
      this.phase = ph;
      this.opts.onPhase?.(ph);
    }
    const k = keyframeAt(m, this.story);
    if (k === this.keyframe) return;
    const kf = m.keyframes[k];
    m.nodes.forEach((n, i) => {
      const s = kf.states[n.id];
      this.nodeKind.setY(i, n.isSelf ? STATUS_CODE.self : STATUS_CODE[s]);
      this.nodeFlags.setX(i, kf.fromRecord[n.id] ? 1 : 0);
      this.nodeFlags.setY(i, (n.deceased ? 1 : 0) + (kf.finding[n.id] ? 2 : 0));
      this.nodeFlags.setW(i, k > this.keyframe ? kf.changedAt[n.id] : -10); // ripple only when moving forward
      this.crisp[i] = n.isSelf || s === "known" || s === "conflicting" ? 1 : s === "declined" ? 0.4 : 0;
    });
    this.nodeKind.needsUpdate = true;
    this.nodeFlags.needsUpdate = true;
    this.keyframe = k;
    this.opts.onKeyframe?.(k);
  }

  private projectLabels() {
    const { w, h } = this.cssSize;
    const flat = this.uniforms.uFlatten.value;
    this.opts.model.nodes.forEach((n, i) => {
      this.tmp.set(n.pos[0], n.pos[1], n.pos[2] * (1 - flat)).project(this.camera);
      const x = (this.tmp.x * 0.5 + 0.5) * w,
        y = (-this.tmp.y * 0.5 + 0.5) * h;
      this.projected[i].x = x;
      this.projected[i].y = y;
      this.opts.onProject?.(n.id, x, y, this.tmp.z);
    });
  }

  private updateHighlightTargets() {
    const id = this.focusId ?? this.hovered;
    const m = this.opts.model;
    this.highlightTarget.fill(0);
    const i = id ? m.nodes.findIndex((n) => n.id === id) : -1;
    if (i >= 0) {
      this.highlightTarget[i] = 1;
      for (const j of this.lineage[i]) this.highlightTarget[j] = 0.5;
    }
    this.focusTarget = i >= 0 ? 1 : 0;
    m.links.forEach((l, k) => this.filMeta.setZ(k, id && l.people.includes(id) ? 1 : 0));
    this.filMeta.needsUpdate = true;
    if (!this.running) this.render();
  }

  private applyClip() {
    const r = this.renderer;
    if (this.clip) {
      const { l, t, w, h } = this.clip;
      r.setScissor(Math.floor(l), Math.floor(this.cssSize.h - t - h), Math.ceil(w) + 1, Math.ceil(h) + 1); // GL origin is bottom-left
      r.setScissorTest(true);
    } else r.setScissorTest(false);
  }

  // ---------- input ----------
  private pick(px: number, py: number): string | null {
    let best: string | null = null;
    let bestD = 34 * 34;
    for (let i = 0; i < this.projected.length; i++) {
      const d = (this.projected[i].x - px) ** 2 + (this.projected[i].y - py) ** 2;
      if (d < bestD) {
        bestD = d;
        best = this.opts.model.nodes[i].id;
      }
    }
    return best;
  }
  private onPointerMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.pointerForce = e.pointerType === "mouse" ? 1 : 0.6;
    if (this.dragging) {
      this.dragYaw = MathUtils.clamp(this.dragging.yaw + ((e.clientX - this.dragging.x) / r.width) * 1.2, -0.45, 0.45);
      if (Math.abs(e.clientX - this.dragging.x) + Math.abs(e.clientY - this.dragging.y) > 6) this.dragging.moved = true;
    }
    // Hover pick in screen space: 8 nodes, no Raycaster needed. Over a DOM label or card the DOM reports hover itself.
    const best = e.target === this.canvas ? this.pick(e.clientX - r.left, e.clientY - r.top) : null;
    if (best !== this.hovered) {
      this.hovered = best;
      this.updateHighlightTargets();
      this.canvas.style.cursor = best ? "pointer" : "grab";
      this.opts.onHover?.(best);
    }
  };
  private onPointerDown = (e: PointerEvent) => {
    if (e.target !== this.canvas || e.button !== 0) return;
    this.dragging = { x: e.clientX, y: e.clientY, yaw: this.dragYaw, moved: false };
    if (e.pointerType === "mouse") this.canvas.style.cursor = "grabbing";
  };
  private onPointerUp = (e: PointerEvent) => {
    const d = this.dragging;
    this.dragging = null;
    if (!d || d.moved) return;
    // A click or tap that didn't drag: select the relative under it (or nothing).
    const r = this.canvas.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    const id = this.pick(e.clientX - r.left, e.clientY - r.top);
    this.canvas.style.cursor = id ? "pointer" : "grab";
    this.opts.onSelect?.(id);
  };
  private onPointerCancel = () => {
    this.dragging = null;
  };
  private onPointerLeave = () => {
    this.pointer.set(0, 0);
    this.pointerForce = 0;
    if (this.hovered) {
      this.hovered = null;
      this.updateHighlightTargets();
      this.opts.onHover?.(null);
    }
  };
  private onContextLost = (e: Event) => {
    e.preventDefault();
    this.stop();
    this.opts.onFallback?.();
  };

  // ---------- adaptive quality (GitHub globe approach: measure, step down, never flip-flop) ----------
  private watchPerformance(dt: number) {
    if (++this.frameCount < 45) return; // ignore shader-compile and first-frame jank
    this.frameTimes.push(dt);
    if (this.frameTimes.length < 60) return;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.frameTimes.length = 0;
    if (avg > 1 / 50) {
      if (this.tier > 0) {
        this.tier = (this.tier - 1) as Tier;
        this.applyTier();
      } else if (avg > 1 / 28) {
        this.stop();
        this.opts.onFallback?.();
      }
    }
  }
  private applyTier() {
    const t = TIER[this.tier];
    const dpr = Math.min(window.devicePixelRatio || 1, t.dpr);
    this.renderer.setPixelRatio(dpr);
    this.dustGeo.setDrawRange(0, t.dust);
    if (this.cssSize.w > 1) this.renderer.setSize(this.cssSize.w, this.cssSize.h, false);
    this.syncResolution();
    this.applyClip();
  }
  private syncResolution() {
    const dpr = this.renderer.getPixelRatio();
    this.uniforms.uPixelRatio.value = dpr;
    this.uniforms.uResolution.value.set(this.cssSize.w * dpr, this.cssSize.h * dpr);
    (this.dust.material as ShaderMaterial).uniforms.uAspect.value = this.cssSize.w / this.cssSize.h;
  }
}
