"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Bounds } from "./geometry";

// Pan/zoom for the workspace canvas (DESIGN §12.1). The view is { cx, cy, k }: the world point at the focal point
// (the viewport centre, nudged up to clear the toolbar) and the zoom. Until the user (or the app) moves it, the view
// is pure CSS on the viewport (see TreeView: container-query units), so the server HTML already shows the right frame:
// phones centre on "you" at k = 1, desktop fits (k clamped to ≥ 0.87 so 15 px names stay ≥ 13 px). Once moved, the
// view lives in inline custom properties written here, without React re-renders on every pointer move.

export interface View {
  cx: number;
  cy: number;
  k: number;
}

export const MIN_K = 0.5;
export const MAX_K = 1.6;
/** Names are 15 px: at 0.87 they render at 13 px, the type floor. */
export const LEGIBLE_K = 0.87;
export const FIT_MAX_K = 1.05;
/** Total padding Fit leaves around the tree (px): 32 each side; 32 top + 88 bottom for the floating toolbar. */
export const PAD_X = 64;
export const PAD_Y = 120;
/** The focal point sits this far above the viewport centre (half of the 88 − 32 bottom/top padding difference). */
export const FOCAL_Y = -28;
/** Phones frame "you" with your parents: the focal point sits half a generation above you (world units, k = 1). */
export const PHONE_LIFT = 85;
const SLACK = 80;
const GLIDE_MS = 420;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const WIDE = "(min-width: 1024px)";

export interface PanZoomApi {
  /** Fit the whole tree (may go below the legibility floor: the user asked). */
  fit(): void;
  /** Glide so a world point sits at the focal point. */
  centerOn(x: number, y: number, k?: number): void;
  /** Centre on a point within the tree's bounds (an axis that fits stays framed). */
  focus(x: number, y: number): void;
  zoomBy(factor: number): void;
  panBy(dx: number, dy: number): void;
  /** Glide to a world rect only if it isn't comfortably on screen. */
  /** `reserve`: px at the bottom of the viewport covered by something (the toolbar, the phone tour card). */
  ensureVisible(rect: { x: number; y: number; w: number; h: number }, margin?: number, reserve?: number): void;
  /** World → viewport pixel coordinates for the current view. */
  toScreen(x: number, y: number): { x: number; y: number; k: number };
  current(): View;
}

export function usePanZoom({
  bounds,
  self,
  enabled,
  onGesture,
}: {
  bounds: Bounds;
  /** Centre of "you" (the phone default). */
  self?: { x: number; y: number };
  enabled: boolean;
  /** Called when a pan/zoom gesture starts (e.g. to hide the hover card). */
  onGesture?: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const view = useRef<View | null>(null);
  const boundsRef = useRef(bounds);
  const selfRef = useRef(self);
  const gestureRef = useRef(onGesture);
  const glideTimer = useRef(0);
  const readoutRaf = useRef(0);
  const [zoom, setZoom] = useState<number | null>(null);

  useLayoutEffect(() => {
    boundsRef.current = bounds;
    selfRef.current = self;
    gestureRef.current = onGesture;
  });

  const engine = useMemo(() => {
    const el = () => viewportRef.current;
    const size = () => {
      const v = el();
      return { w: v?.clientWidth ?? 0, h: v?.clientHeight ?? 0 };
    };
    const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fitK = (floor: number) => {
      const b = boundsRef.current;
      const { w, h } = size();
      const k = Math.min((w - PAD_X) / Math.max(1, b.maxX - b.minX), (h - PAD_Y) / Math.max(1, b.maxY - b.minY));
      return clamp(k, floor, FIT_MAX_K);
    };
    const boundsCenter = () => {
      const b = boundsRef.current;
      return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
    };
    // Mirrors the CSS default in TreeView exactly, so taking over from CSS never jumps.
    const defaultView = (): View => {
      if (window.matchMedia(WIDE).matches) {
        const c = boundsCenter();
        return { cx: c.x, cy: c.y, k: fitK(LEGIBLE_K) };
      }
      const s = selfRef.current ?? boundsCenter();
      return { cx: s.x, cy: s.y - PHONE_LIFT, k: 1 };
    };
    const current = () => view.current ?? defaultView();
    const readout = (k: number) => {
      cancelAnimationFrame(readoutRaf.current);
      readoutRaf.current = requestAnimationFrame(() => setZoom(Math.round(k * 100)));
    };
    const apply = (v: View, glide = false) => {
      const node = el();
      if (!node) return;
      const b = boundsRef.current;
      const next = {
        k: clamp(v.k, MIN_K, MAX_K),
        cx: clamp(v.cx, b.minX - SLACK, b.maxX + SLACK),
        cy: clamp(v.cy, b.minY - SLACK, b.maxY + SLACK),
      };
      view.current = next;
      window.clearTimeout(glideTimer.current);
      if (glide && !reduced()) {
        node.dataset.glide = "";
        glideTimer.current = window.setTimeout(() => delete node.dataset.glide, GLIDE_MS + 40);
      } else delete node.dataset.glide;
      node.style.setProperty("--cx", String(next.cx));
      node.style.setProperty("--cy", String(next.cy));
      node.style.setProperty("--k", String(next.k));
      readout(next.k);
    };
    const focal = () => {
      const { w, h } = size();
      return { fx: w / 2, fy: h / 2 + FOCAL_Y };
    };
    const zoomAt = (px: number, py: number, k2: number, glide = false) => {
      const v = current();
      const { fx, fy } = focal();
      const k = clamp(k2, MIN_K, MAX_K);
      const wx = v.cx + (px - fx) / v.k;
      const wy = v.cy + (py - fy) / v.k;
      apply({ k, cx: wx - (px - fx) / k, cy: wy - (py - fy) / k }, glide);
    };
    const api: PanZoomApi = {
      fit() {
        const c = boundsCenter();
        apply({ cx: c.x, cy: c.y, k: fitK(MIN_K) }, true);
      },
      centerOn(x, y, k) {
        apply({ cx: x, cy: y, k: k ?? current().k }, true);
      },
      focus(x, y) {
        // Centre on a point, but never scroll the tree past its own edges: an axis that already fits stays framed.
        const v = current();
        const { w, h } = size();
        const b = boundsRef.current;
        const axis = (target: number, min: number, max: number, avail: number) => {
          if ((max - min) * v.k <= avail) return (min + max) / 2;
          const half = avail / (2 * v.k);
          return clamp(target, min + half, max - half);
        };
        apply({ k: v.k, cx: axis(x, b.minX, b.maxX, w - PAD_X), cy: axis(y, b.minY, b.maxY, h - PAD_Y) }, true);
      },
      zoomBy(factor) {
        const { fx, fy } = focal();
        zoomAt(fx, fy, current().k * factor, true);
      },
      panBy(dx, dy) {
        const v = current();
        apply({ ...v, cx: v.cx + dx / v.k, cy: v.cy + dy / v.k });
      },
      ensureVisible(r, margin = 24, reserve = 72) {
        const v = current();
        const { w, h } = size();
        const { fx, fy } = focal();
        const left = fx + (r.x - v.cx) * v.k;
        const top = fy + (r.y - v.cy) * v.k;
        const right = left + r.w * v.k;
        const bottom = top + r.h * v.k;
        if (left >= margin && top >= margin && right <= w - margin && bottom <= h - reserve) return;
        // centre it in the part of the viewport that isn't covered
        const want = (margin + h - reserve) / 2;
        apply({ ...v, cx: r.x + r.w / 2, cy: r.y + r.h / 2 - (want - fy) / v.k }, true);
      },
      toScreen(x, y) {
        const v = current();
        const { fx, fy } = focal();
        return { x: fx + (x - v.cx) * v.k, y: fy + (y - v.cy) * v.k, k: v.k };
      },
      current,
    };
    return { api, apply, zoomAt };
  }, []);
  const { api } = engine;

  // The zoom readout starts from the CSS default.
  useEffect(() => {
    if (!enabled) return;
    const raf = requestAnimationFrame(() => setZoom(Math.round(api.current().k * 100)));
    const onResize = () => {
      if (!view.current) setZoom(Math.round(api.current().k * 100));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [api, enabled]);

  // Gestures: drag (or one finger) pans, two fingers pinch, the wheel pans, ctrl/⌘ + wheel (and trackpad pinch) zooms.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node || !enabled) return;
    const { apply, zoomAt } = engine;
    const pts = new Map<number, { x: number; y: number }>();
    let start: { x: number; y: number; v: View } | null = null;
    let pinch: { d: number; mx: number; my: number; v: View } | null = null;
    let panning = false;
    let suppress = false;

    const local = (e: { clientX: number; clientY: number }) => {
      const r = node.getBoundingClientRect();
      return { x: e.clientX - r.left - node.clientLeft, y: e.clientY - r.top - node.clientTop };
    };
    const pannable = (t: EventTarget | null) => {
      const n = t instanceof Element ? t : null;
      if (!n || !node.contains(n) || n.closest("[popover], [data-no-pan]")) return false;
      const control = n.closest("button, a, input, textarea, select, label");
      return !control || control.hasAttribute("data-person-id");
    };
    const begin = () => {
      panning = true;
      node.dataset.panning = "";
      gestureRef.current?.();
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (!pannable(e.target)) return;
      pts.set(e.pointerId, local(e));
      if (pts.size === 1) {
        start = { ...local(e), v: api.current() };
        panning = false;
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, v: api.current() };
        for (const id of pts.keys()) node.setPointerCapture?.(id);
        if (!panning) begin();
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, local(e));
      if (pts.size >= 2 && pinch) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const k = clamp((pinch.v.k * d) / pinch.d, MIN_K, MAX_K);
        const fx = node.clientWidth / 2;
        const fy = node.clientHeight / 2 + FOCAL_Y;
        const wx = pinch.v.cx + (pinch.mx - fx) / pinch.v.k;
        const wy = pinch.v.cy + (pinch.my - fy) / pinch.v.k;
        apply({ k, cx: wx - (mx - fx) / k, cy: wy - (my - fy) / k });
        return;
      }
      if (!start) return;
      const p = local(e);
      const dx = p.x - start.x;
      const dy = p.y - start.y;
      if (!panning) {
        if (Math.hypot(dx, dy) < 5) return;
        node.setPointerCapture?.(e.pointerId);
        begin();
      }
      apply({ k: start.v.k, cx: start.v.cx - dx / start.v.k, cy: start.v.cy - dy / start.v.k });
    };
    const onUp = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (pts.size === 1) {
        const [p] = [...pts.values()];
        start = { ...p, v: api.current() };
        return;
      }
      if (pts.size === 0) {
        if (panning) {
          suppress = true;
          window.setTimeout(() => (suppress = false), 0);
        }
        start = null;
        panning = false;
        delete node.dataset.panning;
      }
    };
    // A drag that started on a relative must not also select them.
    const onClickCapture = (e: MouseEvent) => {
      if (!suppress) return;
      suppress = false;
      e.stopPropagation();
      e.preventDefault();
    };
    const onWheel = (e: WheelEvent) => {
      if (e.target instanceof Element && e.target.closest("[popover]")) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? node.clientHeight : 1;
      gestureRef.current?.();
      if (e.ctrlKey || e.metaKey) {
        const p = local(e);
        zoomAt(p.x, p.y, api.current().k * Math.exp(-e.deltaY * unit * 0.0022));
      } else {
        const v = api.current();
        apply({ ...v, cx: v.cx + (e.deltaX * unit) / v.k, cy: v.cy + (e.deltaY * unit) / v.k });
      }
    };

    node.addEventListener("pointerdown", onDown);
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerup", onUp);
    node.addEventListener("pointercancel", onUp);
    node.addEventListener("click", onClickCapture, true);
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      node.removeEventListener("pointerdown", onDown);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerup", onUp);
      node.removeEventListener("pointercancel", onUp);
      node.removeEventListener("click", onClickCapture, true);
      node.removeEventListener("wheel", onWheel);
    };
  }, [api, engine, enabled]);

  useEffect(
    () => () => {
      window.clearTimeout(glideTimer.current);
      cancelAnimationFrame(readoutRaf.current);
    },
    [],
  );

  return { viewportRef, api, zoom };
}
