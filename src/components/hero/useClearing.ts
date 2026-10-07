"use client";

// The Clearing (DESIGN §9.3), desktop pinned mode only: scroll progress → CSS custom properties on the stage (clip
// insets, bezel and copy fade, paper layer) + one onFrame callback for the engine. No React state per frame.

import { useEffect, useEffectEvent, type RefObject } from "react";
import { CLEAR, clamp01, frameAt, PLATE_STAGE, seg, slotGeometry, stagePlateFor, type ClearingFrame, type Plate } from "./clearing-constants";
import { labelDensity } from "./story";

export { CLEAR, CHAPTER_STARTS, PINNED_QUERY, PLATE_SHEET, PLATE_STAGE, frameAt, type ClearingFrame } from "./clearing-constants";

/** The part of the stage the window currently shows (stage px), and the stage size. */
export interface Visible {
  l: number;
  t: number;
  r: number;
  b: number;
  w: number;
  h: number;
}

interface Refs {
  section: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLDivElement | null>;
  slot: RefObject<HTMLDivElement | null>;
  copy: RefObject<HTMLDivElement | null>;
  win: RefObject<HTMLDivElement | null>;
}

/** Below this rAF interval during the first expansion we animate clip-path; above it (Safari repaint jank) we snap. */
const SLOW_FRAME_MS = 28;

export function useClearing(refs: Refs, enabled: boolean, onFrame: (f: ClearingFrame, visible: Visible) => void) {
  const emit = useEffectEvent(onFrame);
  useEffect(() => {
    const section = refs.section.current,
      stage = refs.stage.current,
      slot = refs.slot.current,
      copy = refs.copy.current,
      win = refs.win.current;
    if (!enabled || !section || !stage || !slot || !copy || !win) return;
    const st = stage.style;
    const q = new URLSearchParams(location.search).get("clip");
    let cheap = q === "cheap";
    if (cheap) stage.setAttribute("data-cheap-clip", "");
    let probed = q === "cheap" || q === "full";
    let raf = 0;
    let box = { t: 0, r: 0, b: 0, l: 0, w: 1, h: 1 };
    let slotPlate: Plate = PLATE_STAGE;
    let stagePlate: Plate = PLATE_STAGE;

    const measure = () => {
      const a = stage.getBoundingClientRect(),
        b = slot.getBoundingClientRect();
      const g = slotGeometry({ left: a.left, top: a.top, width: a.width, height: a.height }, { left: b.left, top: b.top, width: b.width, height: b.height });
      box = { ...g.clip, w: a.width, h: a.height };
      slotPlate = g.plate;
      stagePlate = stagePlateFor(a.width, a.height);
    };

    // Safari guard (DESIGN §9.3): watch real frame intervals while the window first expands; if they're slow, stop
    // animating clip-path and snap to full-bleed with a short crossfade instead.
    const probe = () => {
      probed = true;
      const times: number[] = [];
      let last = performance.now();
      const tick = (now: number) => {
        times.push(now - last);
        last = now;
        if (times.length < 24) requestAnimationFrame(tick);
        else {
          const slow = times.slice(2).filter((d) => d > SLOW_FRAME_MS).length;
          if (slow >= 6) {
            cheap = true;
            stage.setAttribute("data-cheap-clip", "");
            apply();
          }
        }
      };
      requestAnimationFrame(tick);
    };

    const apply = () => {
      const r = section.getBoundingClientRect();
      const p = clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
      const f = frameAt(p, slotPlate, stagePlate);
      if (!probed && p > 0.005 && p < CLEAR.expandEnd) probe();
      const expand = cheap ? (p > CLEAR.copyEnd ? 1 : 0) : f.expand;
      if (cheap) f.plate = p > CLEAR.copyEnd ? f.plate : slotPlate;
      const k = 1 - expand;
      st.setProperty("--clip-t", `${box.t * k}px`);
      st.setProperty("--clip-r", `${box.r * k}px`);
      st.setProperty("--clip-b", `${box.b * k}px`);
      st.setProperty("--clip-l", `${box.l * k}px`);
      st.setProperty("--clip-rad", `${20 * k}px`);
      st.setProperty("--expand", String(expand));
      st.setProperty("--frame-o", String(1 - seg(f.p, 0, CLEAR.frameEnd)));
      const copyO = 1 - seg(f.p, 0, CLEAR.copyEnd);
      st.setProperty("--copy-o", String(copyO));
      copy.toggleAttribute("inert", copyO < 0.05);
      st.setProperty("--clear-o", String(f.clear));
      st.setProperty("--chapter-p", String(f.chapterProgress));
      for (const key of ["cx", "cy", "pw", "ph"] as const) st.setProperty(`--${key}`, String(f.plate[key]));
      if (f.chapter >= 0) stage.setAttribute("data-chapter", String(f.chapter));
      else stage.removeAttribute("data-chapter");
      stage.toggleAttribute("data-expanded", expand > 0.5);
      stage.toggleAttribute("data-cleared", f.clear >= 0.999);
      win.toggleAttribute("inert", f.clear >= 0.999);
      // Night nav once the window's top edge has passed under the floating nav (~40 px); paper again as the page clears.
      section.setAttribute("data-nav-theme", box.t * k < 40 && f.clear < 0.45 ? "night" : "paper");
      const vis: Visible = { l: box.l * k, t: box.t * k, r: box.w - box.r * k, b: box.h - box.b * k, w: box.w, h: box.h };
      stage.toggleAttribute("data-wide", vis.r - vis.l >= 760);
      const d = labelDensity(f.plate, box.w, box.h);
      stage.toggleAttribute("data-names", d.names);
      stage.toggleAttribute("data-states", d.states);
      emit(f, vis);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    const ro = new ResizeObserver(() => {
      measure();
      apply();
    });
    measure();
    apply();
    ro.observe(stage);
    ro.observe(slot);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      copy.removeAttribute("inert");
      win.removeAttribute("inert");
      for (const v of ["--clip-t", "--clip-r", "--clip-b", "--clip-l", "--clip-rad", "--expand", "--frame-o", "--copy-o", "--clear-o", "--chapter-p", "--cx", "--cy", "--pw", "--ph"]) st.removeProperty(v);
      for (const a of ["data-chapter", "data-expanded", "data-cleared", "data-wide", "data-names", "data-states", "data-cheap-clip"]) stage.removeAttribute(a);
      section.setAttribute("data-nav-theme", "paper");
    };
  }, [enabled, refs.section, refs.stage, refs.slot, refs.copy, refs.win]);
}
