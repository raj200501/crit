"use client";

import { m, useReducedMotion } from "motion/react";
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type Ref } from "react";
import type { PersonView } from "@/lib/status";
import type { Person } from "@/lib/types";
import { cn } from "./ui/cn";
import { StatusLegend } from "./ui/StatusLegend";
import { useMediaQuery } from "./ui/useMediaQuery";
import { CanvasToolbar } from "./tree/CanvasToolbar";
import { buildScene, centerOf, GHOST_H, GHOST_W, lineagePath, neighbour, NODE_H, NODE_W, roundedEdges, type Ghost, type Scene } from "./tree/geometry";
import { generationOf, matchesHighlight, nodeStatus, type Highlight } from "./tree/model";
import { NodeCard } from "./tree/NodeCard";
import { NodeHoverCard } from "./tree/NodeHoverCard";
import { PHONE_LIFT, usePanZoom } from "./tree/usePanZoom";

export type { Highlight } from "./tree/model";

export interface TreeViewHandle {
  /** Glide the canvas so this person sits at the focal point. */
  centerOn(id: string): void;
  fit(): void;
  /** Pan just enough to show this person, if they're off screen. */
  reveal(id: string, reserve?: number): void;
}

/** Stable props (DESIGN §11.4). P3 and P4 embed the tree with `mode="embed"`. */
export interface TreeViewProps {
  views: PersonView[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Invited, waiting. */
  pendingIds?: Set<string>;
  /** Ripple once (new). */
  arrivedIds?: Set<string>;
  /** Legend filter: other nodes dim. */
  highlight?: Highlight;
  /** workspace: pan/zoom canvas + toolbar. embed (default): fit to width, no wheel capture, legible. */
  mode?: "workspace" | "embed";
  /** Accepted and ignored (back-compat). */
  maxScale?: number;
  minScale?: number;
  // ---- workspace extras (optional) ----
  ref?: Ref<TreeViewHandle>;
  /** The demo tour's anchored relative (lumen ring). */
  anchorId?: string;
  /** Ghost "+" slots beside the parents and beside you; the workspace renders the add-relative control in each. */
  renderGhost?: (ghost: Ghost) => ReactNode;
  /** Desktop toolbar "List view" toggle. */
  onShowList?: () => void;
  className?: string;
}

export default function TreeView(props: TreeViewProps) {
  return props.mode === "workspace" ? <WorkspaceTree {...props} /> : <EmbedTree {...props} />;
}

/** Kept export name: the glyph + word legend for every mark the tree uses (`list "Legend"`). */
export function Legend() {
  return <StatusLegend />;
}

const EDGE = "rgb(10 31 27 / 0.24)";
const ROW_DELAY = 70;

function useScene(views: PersonView[], withGhosts: boolean) {
  const people = useMemo(() => views.map((v) => v.person), [views]);
  const scene = useMemo(() => buildScene(people, withGhosts), [people, withGhosts]);
  const byId = useMemo(() => new Map(views.map((v) => [v.person.id, v])), [views]);
  return { people, scene, byId };
}

/** Edges (rounded elbows that draw in once), the evergreen lineage to "you" for the selected relative, and a lumen
 *  trace for answers that just arrived. */
function Edges({
  scene,
  people,
  selectedId,
  arrivedIds,
  dim,
}: {
  scene: Scene;
  people: Person[];
  selectedId?: string;
  arrivedIds?: Set<string>;
  dim?: boolean;
}) {
  const reduce = useReducedMotion();
  const edges = useMemo(() => roundedEdges(scene.layout), [scene]);
  const lineage = selectedId ? lineagePath(people, scene, selectedId) : "";
  const lit = reduce ? [] : [...(arrivedIds ?? [])].map((id) => ({ id, d: lineagePath(people, scene, id) })).filter((l) => l.d);
  return (
    <svg aria-hidden className="pointer-events-none absolute top-0 left-0 overflow-visible" width={scene.layout.width} height={scene.layout.height} fill="none">
      <g
        stroke={EDGE}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("transition-opacity duration-(--dur-ui)", dim && "opacity-40")}
      >
        {edges.map((d, i) => (
          <path key={i} d={d} pathLength={1} strokeDasharray="1" className="motion-safe:animate-draw" />
        ))}
      </g>
      {lineage ? (
        <path
          key={selectedId}
          d={lineage}
          stroke="var(--color-evergreen-600)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          className="motion-safe:animate-draw"
        />
      ) : null}
      {lit.map((l) => (
        <m.path
          key={l.id}
          d={l.d}
          stroke="var(--color-evergreen-600)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="[filter:drop-shadow(0_0_5px_rgb(127_230_197/0.95))]"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{ pathLength: 1, opacity: [1, 1, 0] }}
          transition={{ pathLength: { duration: 0.9, ease: [0.19, 1, 0.22, 1] }, opacity: { duration: 2.6, times: [0, 0.7, 1] } }}
        />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Workspace: a pan/zoom canvas. The default view is CSS (container-query units), so the server HTML is already framed:
// phones centre on "you" at k = 1; desktop fits with k clamped to [0.87, 1.05]. usePanZoom takes over on first move.

const DEFAULT_VIEW =
  "[--k:1] [--cx:var(--self-x)] [--cy:calc(var(--self-y)_-_85)] " +
  "lg:[--k:clamp(0.87,min(tan(atan2(100cqw_-_64px,var(--bw))),tan(atan2(100cqh_-_120px,var(--bh)))),1.05)] lg:[--cx:var(--mid-x)] lg:[--cy:var(--mid-y)]";
const WORLD_TRANSFORM = "translate(calc(50cqw - var(--cx) * var(--k) * 1px), calc(50cqh - 28px - var(--cy) * var(--k) * 1px)) scale(var(--k))";

function WorkspaceTree({ views, selectedId, onSelect, pendingIds, arrivedIds, highlight, ref, anchorId, renderGhost, onShowList, className }: TreeViewProps) {
  const { people, scene, byId } = useScene(views, !!renderGhost);
  const self = scene.selfId ? scene.byId.get(scene.selfId) : undefined;
  const selfCenter = self ? centerOf(self) : undefined;
  const [hover, setHover] = useState<{ id: string; rect: { x: number; y: number; w: number; h: number }; vp: { w: number; h: number } } | null>(null);
  const [focusId, setFocusId] = useState<string | undefined>();
  const hoverTimer = useRef(0);
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const { viewportRef, api, zoom } = usePanZoom({ bounds: scene.bounds, self: selfCenter, enabled: true, onGesture: () => setHover(null) });

  const roving = focusId && byId.has(focusId) ? focusId : selectedId && byId.has(selectedId) ? selectedId : scene.selfId;

  const rectOf = (id: string) => {
    const n = scene.byId.get(id);
    return n ? { x: n.x, y: n.y, w: NODE_W, h: NODE_H } : undefined;
  };

  useImperativeHandle(
    ref,
    () => ({
      centerOn(id) {
        const n = scene.byId.get(id);
        if (!n) return;
        const c = centerOf(n);
        api.focus(c.x, c.y);
      },
      fit: () => api.fit(),
      reveal(id, reserve) {
        const r = scene.byId.get(id);
        if (r) api.ensureVisible({ x: r.x, y: r.y, w: NODE_W, h: NODE_H }, 32, reserve);
      },
    }),
    [api, scene],
  );

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  /** Desktop centres exactly on you; phones frame you with your parents (the same view as the default). */
  const centerSelf = () => {
    if (!selfCenter) return;
    const lift = window.matchMedia("(min-width: 1024px)").matches ? 0 : PHONE_LIFT;
    api.centerOn(selfCenter.x, selfCenter.y - lift, window.matchMedia("(min-width: 1024px)").matches ? undefined : 1);
  };

  const focusNode = (id: string) => {
    const el = viewportRef.current?.querySelector<HTMLElement>(`[data-person-id="${CSS.escape(id)}"]`);
    el?.focus({ preventScroll: true });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, select, [contenteditable], [popover]") || e.altKey || e.ctrlKey || e.metaKey) return;
    const id = t.closest("[data-person-id]")?.getAttribute("data-person-id");
    if (id && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      const next = neighbour(scene, id, e.key);
      if (next) focusNode(next);
      return;
    }
    if (e.key === "+" || e.key === "=") api.zoomBy(1.2);
    else if (e.key === "-" || e.key === "_" || e.key === "−") api.zoomBy(1 / 1.2);
    else if (e.key === "0") api.fit();
    else if ((e.key === "c" || e.key === "C") && selfCenter) centerSelf();
    else if (e.key === "Escape" && hover) setHover(null);
    else return;
    e.preventDefault();
  };

  const startHover = (id: string) => {
    if (!finePointer) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      const r = rectOf(id);
      const el = viewportRef.current;
      if (!r || !el || el.hasAttribute("data-panning")) return;
      const s = api.toScreen(r.x, r.y);
      setHover({ id, rect: { x: s.x, y: s.y, w: r.w * s.k, h: r.h * s.k }, vp: { w: el.clientWidth, h: el.clientHeight } });
    }, 300);
  };
  const endHover = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setHover(null), 160);
  };

  const hoverView = hover && hover.id !== selectedId ? byId.get(hover.id) : undefined;

  const b = scene.bounds;
  const vars = {
    "--bw": `${b.maxX - b.minX}px`,
    "--bh": `${b.maxY - b.minY}px`,
    "--mid-x": (b.minX + b.maxX) / 2,
    "--mid-y": (b.minY + b.maxY) / 2,
    "--self-x": selfCenter?.x ?? (b.minX + b.maxX) / 2,
    "--self-y": selfCenter?.y ?? (b.minY + b.maxY) / 2,
  } as CSSProperties;

  return (
    <div
      ref={viewportRef}
      onKeyDown={onKeyDown}
      style={vars}
      className={cn(
        "group/vp relative h-full w-full touch-none overflow-clip rounded-lg border border-line bg-canvas select-none [container-type:size]",
        "cursor-grab data-panning:cursor-grabbing",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.8),inset_0_0_0_1px_rgb(255_255_255/0.4)]",
        DEFAULT_VIEW,
        className,
      )}
    >
      <div
        aria-hidden
        className="bg-dots absolute inset-0 group-data-glide/vp:transition-[background-position,background-size] group-data-glide/vp:duration-[420ms] group-data-glide/vp:ease-emph"
        style={{
          backgroundPosition: "calc(50cqw - var(--cx) * var(--k) * 1px) calc(50cqh - 28px - var(--cy) * var(--k) * 1px)",
          backgroundSize: "calc(24px * var(--k)) calc(24px * var(--k))",
        }}
      />
      <div
        className="absolute top-0 left-0 origin-top-left will-change-transform group-data-glide/vp:transition-transform group-data-glide/vp:duration-[420ms] group-data-glide/vp:ease-emph"
        style={{ width: scene.layout.width, height: scene.layout.height, transform: WORLD_TRANSFORM }}
      >
        <Edges scene={scene} people={people} selectedId={selectedId} arrivedIds={arrivedIds} dim={!!highlight} />
        <div role="group" aria-label="Family health tree" aria-describedby="tree-keys" className="absolute inset-0">
          {scene.layout.nodes.map((n) => {
            const v = byId.get(n.id)!;
            const pending = !!pendingIds?.has(n.id) && v.status === "unknown";
            const ns = nodeStatus(v, pending);
            return (
              <NodeCard
                key={n.id}
                view={v}
                x={n.x}
                y={n.y}
                pending={pending}
                selected={selectedId === n.id}
                tabbable={roving === n.id}
                dimmed={!!highlight && v.person.relation !== "self" && !matchesHighlight(v, ns, highlight)}
                arrived={arrivedIds?.has(n.id)}
                anchor={anchorId === n.id}
                delay={generationOf(v.person.relation) * ROW_DELAY}
                onSelect={(id) => {
                  setHover(null);
                  onSelect?.(id);
                }}
                onFocus={(id) => {
                  setFocusId(id);
                  const r = rectOf(id);
                  if (r) api.ensureVisible(r, 24);
                }}
                onHoverStart={startHover}
                onHoverEnd={endHover}
              />
            );
          })}
        </div>
        {renderGhost
          ? scene.ghosts.map((g) => (
              <div
                key={g.relation}
                className="absolute motion-safe:animate-fade-up [animation-delay:240ms]"
                style={{ left: g.x, top: g.y, width: GHOST_W, height: GHOST_H }}
              >
                {renderGhost(g)}
              </div>
            ))
          : null}
      </div>
      <p id="tree-keys" className="sr-only">
        Arrow keys move between relatives. Enter opens one. Plus and minus zoom, 0 fits the tree, C centers on you.
      </p>
      {hover && hoverView ? (
        <NodeHoverCard
          view={hoverView}
          pending={!!pendingIds?.has(hoverView.person.id) && hoverView.status === "unknown"}
          rect={hover.rect}
          viewport={hover.vp}
          onOpen={() => {
            const id = hoverView.person.id;
            setHover(null);
            onSelect?.(id);
          }}
          onPointerEnter={() => window.clearTimeout(hoverTimer.current)}
          onPointerLeave={endHover}
        />
      ) : null}
      <CanvasToolbar
        zoom={zoom}
        onFit={() => api.fit()}
        onCenter={selfCenter ? () => centerSelf() : undefined}
        onZoomIn={() => api.zoomBy(1.2)}
        onZoomOut={() => api.zoomBy(1 / 1.2)}
        onShowList={onShowList}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Embed (landing, content pages): fit to the container width with k in [0.87, 1] (names ≥ 13 px), computed in CSS so the
// server HTML has the final size (CLS 0). Narrower containers scroll sideways, starting centred on "you". No wheel capture.

const PAD = 14;

function EmbedTree({ views, selectedId, onSelect, pendingIds, arrivedIds, highlight, className }: TreeViewProps) {
  const { people, scene, byId } = useScene(views, false);
  const scroller = useRef<HTMLDivElement>(null);
  const w = scene.layout.width + PAD * 2;
  const h = scene.layout.height + PAD * 2;
  const selfX = scene.selfId ? centerOf(scene.byId.get(scene.selfId)!).x + PAD : w / 2;

  useEffect(() => {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const k = el.scrollWidth / w;
    el.scrollLeft = selfX * k - el.clientWidth / 2;
  }, [w, selfX]);

  return (
    <div className={cn("w-full [container-type:inline-size]", className)}>
      <div ref={scroller} className="overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:thin]">
        <div
          className="relative mx-auto [--k:clamp(0.87,tan(atan2(100cqw,var(--ew))),1)]"
          style={{ "--ew": `${w}px`, width: `calc(${w} * var(--k) * 1px)`, height: `calc(${h} * var(--k) * 1px)` } as CSSProperties}
        >
          <div className="absolute top-0 left-0 origin-top-left" style={{ width: w, height: h, transform: "scale(var(--k))" }}>
            <div className="absolute" style={{ left: PAD, top: PAD, width: scene.layout.width, height: scene.layout.height }}>
              <Edges scene={scene} people={people} selectedId={selectedId} arrivedIds={arrivedIds} dim={!!highlight} />
              <div role="group" aria-label="Family health tree" className="absolute inset-0">
                {scene.layout.nodes.map((n) => {
                  const v = byId.get(n.id)!;
                  const pending = !!pendingIds?.has(n.id) && v.status === "unknown";
                  const ns = nodeStatus(v, pending);
                  return (
                    <NodeCard
                      key={n.id}
                      view={v}
                      x={n.x}
                      y={n.y}
                      pending={pending}
                      selected={selectedId === n.id}
                      dimmed={!!highlight && v.person.relation !== "self" && !matchesHighlight(v, ns, highlight)}
                      arrived={arrivedIds?.has(n.id)}
                      delay={generationOf(v.person.relation) * ROW_DELAY}
                      onSelect={onSelect}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
