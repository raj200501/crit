"use client";

// The landing hero's Night Window and the Clearing (DESIGN §8.1–8.2, §9). SSR renders the SVG poster, the real
// relative <button>s, the badge, the caption and the chapters, so LCP (the <h1> from `children`), SEO and screen readers
// never depend on WebGL. After hydration, if motion is allowed, Save-Data is off and the window is on screen, three.js
// is fetched with a plain dynamic import() (Next's "Loading External Libraries" pattern) after the browser is idle.
//
// Two layouts from one DOM, decided by CSS so SSR matches: "pinned" (html[data-js] + ≥ 1024 px + fine pointer + motion
// allowed: a 360svh section whose sticky stage expands the window to full-bleed, plays four chapters and clears to
// paper) and "flow" (everything else: the window is a card, the chapters are stacked cards).

import { ArrowDown, Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { InlineScript } from "@/components/ui/InlineScript";
import { PedigreeGlyph } from "@/components/ui/PedigreeGlyph";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { STATUS_ICON, STATUS_LABEL } from "@/components/ui/status";
import { useMediaQuery } from "@/components/ui/useMediaQuery";
import { CHAPTER_COLUMN, CHAPTER_STARTS, clearingBootScript, PINNED_QUERY, type ClearingFrame, type Plate } from "./clearing-constants";
import type { FamilyConstellation, Tier } from "./FamilyConstellation";
import HeroPoster from "./HeroPoster";
import { ReceiptCard, receiptText } from "./ReceiptCard";
import { chapters, keyframeAt, labelDensity, phaseAt, receiptsAt, storyFromClearing, VIEW, viewFraction, type NodeState, type Phase, type SceneNode, type StoryModel } from "./story";
import { useClearing, type Visible } from "./useClearing";
import styles from "./hero.module.css";

export interface HeroStageProps {
  /** Built on the server: `buildStory(demoTree())`. */
  model: StoryModel;
  /** The hero copy (pill, h1#hero-title, lead, CTAs). */
  children: ReactNode;
}

const STAGE_ID = "hero-stage";
/** Below this visible window width there's no room beside a relative, so the (compact) receipt docks to the top or
 *  bottom of the window instead: phones, and the framed window at p = 0 on desktop. */
const DOCK_BELOW = 600;
const SLOT_ID = "hero-slot";

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function pickTier(): Tier {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency || 4;
  if (coarse) return cores >= 8 ? 1 : 0;
  return cores >= 8 ? 2 : 1;
}

function readPlate(el: HTMLElement): Plate {
  const cs = getComputedStyle(el);
  const n = (name: string, d: number) => parseFloat(cs.getPropertyValue(name)) || d;
  return { cx: n("--cx", 50), cy: n("--cy", 50), pw: n("--pw", 100), ph: n("--ph", 100) };
}

function readColors(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const v = (name: string) => cs.getPropertyValue(name).trim() || undefined;
  return {
    bg: v("--fht-stage"),
    fog: v("--fht-fog"),
    light: v("--fht-light"),
    line: v("--fht-line"),
    known: v("--fht-known"),
    conflict: v("--fht-conflict"),
    unknown: v("--fht-unknown"),
    declined: v("--fht-declined"),
    record: v("--fht-record"),
  };
}

/** Pixel position of a node in the window for a given plate (the poster's "meet" fit, same as the engine's). */
function posterPoint(n: SceneNode, plate: Plate, w: number, h: number) {
  const plateW = Math.min((plate.pw / 100) * w, (plate.ph / 100) * h * (VIEW.w / VIEW.h));
  const f = viewFraction(n.pos);
  return { x: (plate.cx / 100) * w + f.x * plateW, y: (plate.cy / 100) * h + f.y * plateW * (VIEW.h / VIEW.w) };
}

/** Pinned mode: push one scroll frame into the engine (plate, scissor, story target, freeze after the clearing). */
function syncEngine(e: FamilyConstellation, model: StoryModel, f: ClearingFrame, vis: Visible) {
  const t = f.p > 0.02 ? storyFromClearing(model, f.p) : null; // null = the autoplayed state at the top
  e.setPlate(f.plate);
  e.setClip({ l: vis.l, t: vis.t, w: vis.r - vis.l, h: vis.b - vis.t });
  e.setTarget(t);
  e.setFrozen(f.clear >= 1);
}

const PHASE_CHAPTER: Record<Phase, 0 | 1 | 2 | 3> = { fog: 0, grow: 0, invite: 1, answers: 2, summary: 3 };

/** Where the flow-mode poster stands for each chapter (reduced motion / no WebGL). */
function posterForChapter(model: StoryModel, i: number): { keyframe: number; invites: boolean } {
  if (i <= 0) return { keyframe: 0, invites: false };
  if (i === 1) return { keyframe: 0, invites: true };
  return { keyframe: model.keyframes.length - 1, invites: false };
}

function stateWord(n: SceneNode, s: NodeState, record: boolean, visit: string | undefined) {
  if (n.isSelf) return visit ?? "The patient";
  return `${STATUS_LABEL[s]}${record ? " · from a portal record (demo)" : ""}`;
}
function stateShort(n: SceneNode, s: NodeState, visit: string | undefined) {
  return n.isSelf ? (visit ?? "The patient") : STATUS_LABEL[s];
}

export function HeroStage({ model, children }: HeroStageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<FamilyConstellation | null>(null);
  const labelRefs = useRef(new Map<string, HTMLLIElement>());
  const points = useRef(new Map<string, { x: number; y: number }>());
  const plateRef = useRef<Plate | null>(null);
  const visRef = useRef<Visible | null>(null);
  const frameRef = useRef<ClearingFrame | null>(null);
  const posterKfRef = useRef(-1);
  const chapterRef = useRef(-1);
  const activeRef = useRef<string | null>(null);
  const hoverTimer = useRef(0);
  const canvasTimer = useRef(0);
  const narrowRef = useRef(false);
  const revealRef = useRef(false); // a tap/click pinned a receipt: make sure the docked card is on screen

  // Server snapshot = "reduced": the poster is always what SSR and hydration render.
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
  const pinned = useMediaQuery(PINNED_QUERY, false);
  const [mode, setMode] = useState<"poster" | "live">("poster");
  const [paused, setPaused] = useState(false);
  const [keyframe, setKeyframe] = useState(model.keyframes.length - 1);
  const [phase, setPhase] = useState<Phase>("answers"); // SSR/poster shows the finished tree
  const [posterKf, setPosterKf] = useState<number | null>(null);
  const [posterInvites, setPosterInvites] = useState(false);
  const [chapter, setChapter] = useState(-1); // pinned: the chapter on screen (for the dots)
  const [picked, setPicked] = useState<number | null>(null); // flow: the chapter the visitor chose
  const [domHover, setDomHover] = useState<string | null>(null);
  const [canvasHover, setCanvasHover] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [touched, setTouched] = useState(false); // the hint chip goes once someone explores
  const [narrow, setNarrow] = useState(false); // a window narrower than DOCK_BELOW: the compact receipt docks top or bottom

  const live = mode === "live";
  const kfIndex = live ? keyframe : (posterKf ?? model.keyframes.length - 1);
  const kf = model.keyframes[kfIndex];
  const active = pinnedId ?? focusId ?? domHover ?? canvasHover;
  const showCard = active !== null && active !== dismissed;
  const chapterList = chapters(model);
  const visitLine = model.visit ? `${model.visit.specialty} visit · ${model.visit.date}` : undefined;
  // Reading order for screen readers and Tab: you, then parents' generation, then grandparents;
  // within a generation mother's side first (she sits on the right, as in a standard pedigree).
  const listed = useMemo(() => [...model.nodes].sort((a, b) => b.gen - a.gen || b.pos[0] - a.pos[0]), [model]);
  const flowChapter = picked ?? (live ? PHASE_CHAPTER[phase] : 2);
  const flowPage = !pinned && picked === 3;

  // ---------- receipt card placement (runs from effects, the engine's frame callback and scroll frames) ----------
  const placeCard = useCallback(() => {
    const id = activeRef.current;
    const card = cardRef.current;
    const win = windowRef.current;
    if (!id || !card || !win) return;
    const node = model.nodes.find((n) => n.id === id);
    if (!node) return;
    const W = win.clientWidth,
      H = win.clientHeight;
    const v = visRef.current ?? { l: 0, t: 0, r: W, b: H, w: W, h: H };
    // Pinned, mid-story: the chapter card owns the left column (left max(32, (W − 1240) / 2 + 32), 26rem wide).
    const chapterRight = (frameRef.current?.chapter ?? -1) >= 0 ? CHAPTER_COLUMN.left(W) + CHAPTER_COLUMN.width + 16 : 0;
    const vis = { ...v, l: Math.max(v.l, chapterRight) };
    const pt = points.current.get(id) ?? posterPoint(node, plateRef.current ?? readPlate(win), W, H);
    if (narrowRef.current) {
      // Narrow windows: dock the compact card to the bottom of the window (over the caption), or to the top when the relative
      // sits low enough that the card would cover their own label.
      card.style.width = `${Math.max(200, vis.r - vis.l - 20)}px`;
      const h = card.offsetHeight;
      const bottomTop = vis.b - 10 - h;
      const glyph = 12; // glyph radius plus a little air, px
      const fitsBelow = pt.y + glyph + 34 <= bottomTop; // the relative's glyph and the label under it stay clear
      const fitsAbove = vis.t + 10 + h <= pt.y - glyph - (node.gen === 0 ? 34 : 4);
      const dock = fitsBelow || !fitsAbove ? "bottom" : "top";
      win.setAttribute("data-dock", dock);
      card.style.translate = `${(vis.l + 10 - pt.x).toFixed(1)}px ${((dock === "bottom" ? bottomTop : vis.t + 10) - pt.y).toFixed(1)}px`;
      return;
    }
    card.style.width = "";
    win.removeAttribute("data-dock");
    const cw = card.offsetWidth,
      ch = card.offsetHeight;
    const pad = 12;
    const clampX = (v: number) => Math.min(Math.max(v, vis.l + pad), Math.max(vis.l + pad, vis.r - pad - cw));
    const clampY = (v: number) => Math.min(Math.max(v, vis.t + pad), Math.max(vis.t + pad, vis.b - pad - ch));
    let left: number, top: number;
    if (vis.r - vis.l >= 560) {
      const right = pt.x < (vis.l + vis.r) / 2;
      left = clampX(right ? pt.x + 36 : pt.x - 36 - cw);
      top = clampY(pt.y - 40);
    } else {
      left = clampX(pt.x - cw / 2);
      const below = pt.y + 54;
      top = clampY(below + ch <= vis.b - pad ? below : pt.y - 34 - ch);
    }
    card.style.translate = `${(left - pt.x).toFixed(1)}px ${(top - pt.y).toFixed(1)}px`;
  }, [model]);

  useLayoutEffect(() => {
    activeRef.current = showCard ? active : null;
    narrowRef.current = narrow;
    if (!showCard) windowRef.current?.removeAttribute("data-dock");
    placeCard();
    if (revealRef.current && showCard && narrow) cardRef.current?.scrollIntoView({ block: "nearest", behavior: getReducedMotion() ? "auto" : "smooth" });
    revealRef.current = false;
  }, [active, showCard, placeCard, keyframe, posterKf, narrow]);

  // ---------- engine boot: idle + visible + motion allowed → import("./FamilyConstellation") ----------
  useEffect(() => {
    const win = windowRef.current;
    const canvas = canvasRef.current;
    if (reduced || !win || !canvas) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return;
    let cancelled = false;
    let booting = false;
    let started = false; // flow mode: autoplay starts once ≥ 50% of the window is in view
    let inView = false;
    let engine: FamilyConstellation | null = null;
    const debug = new URLSearchParams(location.search).has("scene-debug");
    const pts = points.current;
    const labels = labelRefs.current;

    const boot = async () => {
      booting = true;
      const { FamilyConstellation } = await import("./FamilyConstellation");
      if (cancelled) return;
      try {
        engine = new FamilyConstellation(canvas, {
          model,
          tier: pickTier(),
          plate: plateRef.current ?? readPlate(win),
          eventTarget: win,
          colors: readColors(win),
          onProject: (id, x, y) => {
            const el = labelRefs.current.get(id);
            if (el) el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
            points.current.set(id, { x, y });
            if (id === activeRef.current) placeCard();
          },
          onHover: (id) => {
            window.clearTimeout(canvasTimer.current);
            if (id) {
              setCanvasHover(id);
              setDismissed(null);
              setTouched(true);
            } else canvasTimer.current = window.setTimeout(() => setCanvasHover(null), 160);
          },
          onSelect: (id) => {
            setTouched(true);
            setDismissed(null);
            revealRef.current = id !== null;
            setPinnedId((cur) => (id === null ? null : cur === id ? null : id));
          },
          onKeyframe: setKeyframe, // at most ~8 React renders per story, never per frame
          onPhase: setPhase,
          onStory: (s) => {
            const bar = progressRef.current;
            if (bar) bar.style.transform = `scaleX(${(s / model.t.end).toFixed(4)})`;
          },
          onAutoplayEnd: () => {
            if (document.documentElement.hasAttribute("data-present")) setPaused(true); // ?present: autoplay once, then hold
          },
          onFallback: () => {
            engine?.dispose();
            engine = null;
            engineRef.current = null;
            points.current.clear();
            setMode("poster");
          },
        });
      } catch {
        return; // no WebGL2: keep the poster
      }
      engineRef.current = engine;
      if (debug) (window as unknown as { __fhtScene?: FamilyConstellation }).__fhtScene = engine;
      const r = win.getBoundingClientRect();
      engine.resize(r.width, r.height);
      const f = frameRef.current;
      if (f && visRef.current) syncEngine(engine, model, f, visRef.current);
      engine.setVisible(started && inView);
      if (started && inView) goLive();
    };
    const goLive = () =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled && engineRef.current) setMode("live");
        }),
      );

    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (e.intersectionRatio >= 0.5 || (pinned && e.isIntersecting)) started = true;
        if (inView && !booting && !cancelled) {
          const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 120));
          ric(() => void boot(), { timeout: 1200 });
        }
        if (engine) {
          engine.setVisible(started && inView);
          if (started && inView) goLive();
        }
      },
      { threshold: [0, 0.5] },
    );
    io.observe(win);
    const ro = new ResizeObserver(([e]) => {
      if (!engine) return;
      engine.resize(e.contentRect.width, e.contentRect.height);
      if (!pinned) engine.setPlate(readPlate(win));
    });
    ro.observe(win);

    return () => {
      cancelled = true;
      io.disconnect();
      ro.disconnect();
      engine?.dispose();
      engineRef.current = null;
      pts.clear();
      if (debug) delete (window as unknown as { __fhtScene?: FamilyConstellation }).__fhtScene;
      // Labels go back to CSS placement (poster mode).
      labels.forEach((el) => (el.style.transform = ""));
      requestAnimationFrame(() => {
        setMode("poster");
        setPhase("answers");
        setKeyframe(model.keyframes.length - 1);
      });
    };
  }, [reduced, pinned, model, placeCard]);

  // ---------- the Clearing: pinned scroll story ----------
  const onFrame = (f: ClearingFrame, vis: Visible) => {
    frameRef.current = f;
    visRef.current = vis;
    plateRef.current = f.plate;
    const e = engineRef.current;
    if (e) syncEngine(e, model, f, vis);
    else {
      // Poster fallback: swap keyframes per chapter (≤ 8 re-renders over the whole scroll).
      const t = f.p > 0.02 ? storyFromClearing(model, f.p) : null;
      const k = t === null ? model.keyframes.length - 1 : keyframeAt(model, Math.max(t, 0.01));
      if (k !== posterKfRef.current) {
        posterKfRef.current = k;
        setPosterKf(k);
        setPosterInvites(t !== null && phaseAt(model, t) === "invite");
      }
    }
    const n = vis.r - vis.l < DOCK_BELOW;
    if (n !== narrowRef.current) {
      narrowRef.current = n;
      setNarrow(n);
    }
    if (f.chapter !== chapterRef.current) {
      chapterRef.current = f.chapter;
      setChapter(f.chapter);
    }
    placeCard();
  };
  useClearing({ section: sectionRef, stage: stageRef, slot: slotRef, copy: copyRef, win: windowRef }, pinned, onFrame);

  // Flow mode: label density follows the window card's own size (pinned mode sets it per scroll frame).
  useEffect(() => {
    const win = windowRef.current;
    const stage = stageRef.current;
    if (pinned || !win || !stage) return;
    const ro = new ResizeObserver(() => {
      const d = labelDensity(readPlate(win), win.clientWidth, win.clientHeight);
      stage.toggleAttribute("data-names", d.names);
      stage.toggleAttribute("data-states", d.states);
      setNarrow(win.clientWidth < DOCK_BELOW);
    });
    ro.observe(win);
    return () => {
      ro.disconnect();
      setNarrow(false);
    };
  }, [pinned]);

  // Leaving pinned mode (resize below 1024 px): forget the scroll-driven geometry.
  useEffect(() => {
    if (pinned) return;
    frameRef.current = null;
    visRef.current = null;
    plateRef.current = null;
    posterKfRef.current = -1;
    chapterRef.current = -1;
    const e = engineRef.current;
    const win = windowRef.current;
    if (e && win) {
      e.setClip(null);
      e.setFrozen(false);
      e.setPlate(readPlate(win));
    }
  }, [pinned]);

  useEffect(() => engineRef.current?.setPaused(paused), [paused, mode]);
  useEffect(() => engineRef.current?.setHighlight(showCard ? active : (focusId ?? domHover)), [active, showCard, focusId, domHover, mode]);

  // ---------- controls ----------
  const replay = () => {
    const e = engineRef.current;
    setPaused(false);
    setPicked(null);
    if (e) {
      if (!pinned || (frameRef.current?.p ?? 0) <= 0.02) e.setTarget(null);
      e.replay();
    }
  };
  const skip = () => {
    const section = sectionRef.current;
    if (!section) return;
    const smooth = !getReducedMotion();
    const next = document.getElementById("problem") ?? (section.nextElementSibling as HTMLElement | null);
    if (pinned) {
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + 0.97 * (section.offsetHeight - window.innerHeight), behavior: smooth ? "smooth" : "auto" });
    } else if (next) next.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    else window.scrollTo({ top: section.getBoundingClientRect().bottom + window.scrollY, behavior: smooth ? "smooth" : "auto" });
    if (next) {
      if (!next.hasAttribute("tabindex")) next.setAttribute("tabindex", "-1");
      next.focus({ preventScroll: true });
    }
  };
  const goToChapter = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (CHAPTER_STARTS[i] + 0.004) * (section.offsetHeight - window.innerHeight), behavior: "smooth" });
  };
  const seek = (value: string) => {
    const i = chapterList.findIndex((c) => c.id === value);
    if (i < 0) return;
    setPicked(i);
    setTouched(true);
    const e = engineRef.current;
    if (e) {
      e.setTarget(chapterList[i].to);
      if (paused) setPaused(false);
    } else {
      const p = posterForChapter(model, i);
      setPosterKf(p.keyframe);
      setPosterInvites(p.invites);
    }
  };

  // ---------- relatives: hover with intent, focus, pin ----------
  const hoverIn = (id: string) => {
    window.clearTimeout(hoverTimer.current);
    setDomHover(id);
    setDismissed(null);
    setTouched(true);
  };
  const hoverOut = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setDomHover(null), 160);
  };
  const onWindowKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Escape" || !active) return;
    const li = labelRefs.current.get(active);
    if (li && cardRef.current?.contains(document.activeElement)) li.querySelector("button")?.focus();
    setPinnedId(null);
    setDismissed(active);
  };

  // While the receipt card is pinned, a press anywhere outside the window closes it.
  useEffect(() => {
    if (!pinnedId) return;
    const onDown = (e: PointerEvent) => {
      if (!windowRef.current?.contains(e.target as Node)) setPinnedId(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [pinnedId]);

  useEffect(
    () => () => {
      window.clearTimeout(hoverTimer.current);
      window.clearTimeout(canvasTimer.current);
    },
    [],
  );

  const activeNode = active ? model.nodes.find((n) => n.id === active) : undefined;
  const announce = showCard && activeNode ? receiptText({ node: activeNode, state: kf.states[activeNode.id], entries: receiptsAt(model, activeNode.id, kfIndex), visitLine }) : "";
  const subject = kf.subject ? model.nodes.find((n) => n.id === kf.subject) : undefined;
  const windowLabel = `${model.patientName}’s family · synthetic demo`;
  // Before the first answer lands, the caption follows the beat (fog → slots → invites).
  const captionText =
    kfIndex > 0 ? kf.caption : live ? (phase === "grow" ? model.phaseCaptions.grow : phase === "invite" ? model.phaseCaptions.invite : model.phaseCaptions.fog) : posterInvites ? model.phaseCaptions.invite : model.phaseCaptions.grow;

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-nav-theme="paper"
      data-mode={mode}
      data-phase={live ? phase : "answers"}
      aria-labelledby="hero-title"
    >
      <div ref={stageRef} id={STAGE_ID} className={cn(styles.stage, "aurora grain")} data-flow-page={flowPage ? "" : undefined}>
        <div className={styles.inner}>
          <div ref={copyRef} className={styles.copy}>
            {children}
          </div>

          <div ref={slotRef} id={SLOT_ID} className={styles.slot} aria-hidden="true" />

          <div ref={windowRef} className={styles.window} data-theme="night" onKeyDown={onWindowKey}>
            <div className={styles.poster}>
              <HeroPoster model={model} keyframe={kfIndex} invites={!live && posterInvites} />
            </div>
            <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
            <div className={styles.atmosphere} aria-hidden="true" />

            <p className={styles.windowLabel}>
              <span>{windowLabel}</span>
              <span className={cn(styles.hint, (touched || (live && phase !== "answers")) && styles.hintGone)} aria-hidden="true">
                <span className={styles.hintFine}>Hover a relative</span>
                <span className={styles.hintCoarse}>Tap a relative</span>
              </span>
            </p>

            {/* Controls first in the focus order (Pause is the WCAG 2.2.2 mechanism); drawn at the bottom of the window. */}
            <div className={styles.bar}>
              <div className={styles.controls}>
                <span className={styles.badge}>
                  <span aria-hidden className={styles.badgeDot} />
                  Synthetic demo family
                </span>
                <span className={styles.ctlGroup}>
                  {live ? (
                    <>
                      <button type="button" className={styles.ctl} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
                        {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
                        <span className={styles.ctlText}>{paused ? "Play animation" : "Pause animation"}</span>
                      </button>
                      <button type="button" className={cn(styles.ctl, styles.ctlMinor)} onClick={replay}>
                        <RotateCcw aria-hidden />
                        <span className={styles.ctlText}>Replay</span>
                      </button>
                    </>
                  ) : null}
                  <button type="button" className={cn(styles.ctl, styles.ctlMinor)} onClick={skip}>
                    <ArrowDown aria-hidden />
                    <span className={cn(styles.ctlText, styles.skipPinned)}>Skip to the page</span>
                    <span className={cn(styles.ctlText, styles.skipFlow)}>Skip the story</span>
                  </button>
                </span>
              </div>
              <p className={styles.caption} aria-live="off" key={kfIndex}>
                {subject ? (
                  <PedigreeGlyph
                    shape={subject.shape}
                    status={kf.states[subject.id]}
                    finding={kf.finding[subject.id]}
                    deceased={subject.deceased}
                    record={kf.fromRecord[subject.id]}
                    tone="night"
                    size={22}
                    className={styles.captionGlyph}
                  />
                ) : null}
                <span>{captionText}</span>
              </p>
              <span className={styles.progress} aria-hidden="true">
                <span ref={progressRef} />
              </span>
            </div>

            {/* Real, focusable relatives. Positioned by CSS from the plate in poster mode, by the engine when live. */}
            <ol className={styles.labels} aria-label="Demo family (synthetic)">
              {listed.map((n) => {
                const state = kf.states[n.id];
                const Icon = n.isSelf ? null : STATUS_ICON[state];
                const isActive = active === n.id;
                const fr = viewFraction(n.pos);
                const style = { "--x": fr.x, "--y": fr.y } as CSSProperties;
                return (
                  <li
                    key={n.id}
                    style={style}
                    data-gen={n.gen}
                    data-active={isActive || undefined}
                    ref={(el) => {
                      if (el) labelRefs.current.set(n.id, el);
                      else labelRefs.current.delete(n.id);
                    }}
                    className={styles.label}
                    onPointerEnter={(e) => e.pointerType === "mouse" && hoverIn(n.id)}
                    onPointerLeave={(e) => e.pointerType === "mouse" && hoverOut()}
                    onFocus={() => {
                      setFocusId(n.id);
                      setDismissed(null);
                      setTouched(true);
                    }}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusId((cur) => (cur === n.id ? null : cur));
                    }}
                  >
                    <span className={styles.labelInner}>
                      <button
                        type="button"
                        data-state={n.isSelf ? "self" : state}
                        aria-label={n.label}
                        aria-describedby={`hero-node-${n.id}`}
                        aria-expanded={pinnedId === n.id}
                        onClick={() => {
                          setDismissed(null);
                          revealRef.current = true;
                          setPinnedId((cur) => (cur === n.id ? null : n.id));
                        }}
                      >
                        <span className={styles.full}>{n.label}</span>
                        <span className={styles.short} aria-hidden="true">
                          {n.isSelf ? n.name : n.short}
                        </span>
                      </button>
                      <span id={`hero-node-${n.id}`} className={styles.state}>
                        {Icon ? <Icon aria-hidden className={styles.stateIcon} data-state={state} /> : null}
                        <span aria-hidden="true">{stateShort(n, state, visitLine)}</span>
                        {kf.fromRecord[n.id] ? <span aria-hidden="true" className={styles.recordChip} title="From a portal record (demo)" /> : null}
                        <span className="sr-only">{stateWord(n, state, kf.fromRecord[n.id], visitLine)}</span>
                      </span>
                    </span>
                    {isActive && showCard ? (
                      <ReceiptCard
                        ref={cardRef}
                        className={styles.card}
                        node={n}
                        state={state}
                        headline={kf.headlines[n.id]}
                        entries={receiptsAt(model, n.id, kfIndex)}
                        finding={kf.finding[n.id]}
                        record={kf.fromRecord[n.id]}
                        visitLine={visitLine}
                        compact={narrow}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <p className="sr-only" role="status">
              {announce}
            </p>
          </div>

          <div className={styles.seg}>
            <SegmentedControl
              label="Story chapter"
              options={chapterList.map((c) => ({ value: c.id, label: c.label }))}
              value={chapterList[flowChapter].id}
              onChange={seek}
              fullWidth
            />
          </div>

          {/* The chapter cards are h3s; this sr-only h2 keeps the page outline from jumping h1 → h3. */}
          <h2 id="hero-chapters-title" className="sr-only">
            How it works, in four chapters
          </h2>
          <ol className={styles.chapters} aria-labelledby="hero-chapters-title">
            {chapterList.map((c, i) => {
              const p = posterForChapter(model, i);
              return (
                <li key={c.id} className={styles.chapter} data-active={chapter === i || undefined}>
                  <figure className={styles.chapterFigure} aria-hidden="true">
                    {c.id === "page" ? (
                      <div className={styles.miniSheet}>
                        <span className={styles.miniRule} />
                        <HeroPoster model={model} theme="paper" />
                        <span className={styles.miniLines} />
                      </div>
                    ) : (
                      <HeroPoster model={model} keyframe={p.keyframe} invites={p.invites} />
                    )}
                  </figure>
                  <p className={styles.chapterNum}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {c.label}
                  </p>
                  <h3 className={styles.chapterTitle}>{c.title}</h3>
                  <p className={styles.chapterBody}>{c.body}</p>
                  <span className={styles.chapterProgress} aria-hidden="true" />
                </li>
              );
            })}
          </ol>

          <div className={styles.clearing} aria-hidden="true">
            <div className={styles.sheet}>
              <div className={styles.sheetHead}>
                <p className={styles.sheetEyebrow}>Synthetic demo data · pre-visit family history</p>
                <p className={styles.sheetTitle}>{model.patientName}’s family heart history</p>
                <p className={styles.sheetMeta}>{visitLine ?? "Before the visit"} · Facts, gaps and questions</p>
              </div>
              <div className={styles.sheetBody}>
                {["Facts", "Gaps", "Questions for your visit"].map((h, i) => (
                  <div key={h}>
                    <p className={styles.sheetEyebrow}>{h}</p>
                    <span className={styles.skel} style={{ width: `${92 - i * 9}%` }} />
                    <span className={styles.skel} style={{ width: `${70 + i * 6}%` }} />
                    <span className={styles.skel} style={{ width: `${54 + i * 11}%` }} />
                  </div>
                ))}
              </div>
            </div>
            {/* Placed by the plate formula, not by the sheet's flow, so it lands exactly where the flattened canvas was. */}
            <div className={styles.sheetPedigree}>
              <HeroPoster model={model} theme="paper" names />
            </div>
            <p className={styles.clearingCaption}>
              Same family, same facts. <span>Now on one page.</span>
            </p>
          </div>
        </div>

        <nav className={styles.dots} aria-label="Story chapters">
          {chapterList.map((c, i) => (
            <button key={c.id} type="button" aria-label={`Go to chapter ${i + 1}: ${c.label}`} aria-current={chapter === i ? "step" : undefined} onClick={() => goToChapter(i)}>
              <span aria-hidden="true" />
            </button>
          ))}
        </nav>
      </div>
      <InlineScript html={clearingBootScript(STAGE_ID, SLOT_ID)} />
    </section>
  );
}

export default HeroStage;
