import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "./cn";
import { FlowReplay } from "./FlowReplay";
import { iconFor, type IconName } from "./iconMap";

export interface FlowNode {
  id: string;
  label: string;
  sub?: string;
  icon?: IconName | LucideIcon;
  /** Centre, in viewBox units. */
  x: number;
  y: number;
}
export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}
export interface FlowDiagramProps {
  nodes: readonly FlowNode[];
  edges: readonly FlowEdge[];
  viewBox?: string;
  caption: string;
  /** Pulse cycles before the beams stop (default 2). "Replay" restarts them. */
  cycles?: number;
  className?: string;
}

type P = [number, number];
const curve = ([x1, y1]: P, [x2, y2]: P) => {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
};

/**
 * Data-flow diagram with travelling "beams" (D1 recipe E). Server-rendered SVG; a CSS dash pulse runs
 * `cycles` times and stops. Below 1280 px (phones, tablets, small laptops) it is a vertical list instead: the
 * node chips are nowrap and the edge labels need the room. Reduced motion: static arrows.
 * Nodes in the outer fifth of the viewBox are anchored to the figure's edge (not centred on x), so they never overhang.
 * On night bands the beams are lumen; on paper, evergreen (both via --ui-brand).
 */
export function FlowDiagram({ nodes, edges, viewBox = "0 0 160 90", caption, cycles = 2, className }: FlowDiagramProps) {
  const [, , vw, vh] = viewBox.split(/\s+/).map(Number);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const markerId = `flow-arrow-${nodes.map((n) => n.id).join("-")}`.replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <figure data-flow className={cn("relative", className)}>
      {/* Desktop: SVG paths + positioned node chips */}
      <div className="relative hidden w-full xl:block" style={{ aspectRatio: `${vw} / ${vh}` }}>
        <svg viewBox={viewBox} className="absolute inset-0 size-full overflow-visible" aria-hidden focusable="false">
          <defs>
            <marker id={markerId} viewBox="0 0 6 6" refX="5" refY="3" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M0 0 L6 3 L0 6 z" fill="var(--ui-brand)" />
            </marker>
          </defs>
          {edges.map((e, i) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            if (!a || !b) return null;
            const d = curve([a.x, a.y], [b.x, b.y]);
            return (
              <g key={`${e.from}-${e.to}`}>
                <path d={d} fill="none" stroke="var(--ui-fg)" strokeOpacity={0.22} strokeWidth={0.18} />
                <path d={d} fill="none" stroke="var(--ui-brand)" strokeOpacity={0.7} strokeWidth={0.25} className="hidden motion-reduce:block" markerEnd={`url(#${markerId})`} />
                <path
                  d={d}
                  data-beam
                  pathLength={1}
                  fill="none"
                  stroke="var(--ui-brand)"
                  strokeWidth={0.42}
                  strokeLinecap="round"
                  className="[stroke-dasharray:0.14_1.14] [stroke-dashoffset:0.14] motion-safe:animate-[beam-pulse_3.2s_var(--ease-out-quart)_both] motion-reduce:hidden"
                  style={{ animationDelay: `${i * 0.7}s`, animationIterationCount: cycles } as CSSProperties}
                />
              </g>
            );
          })}
        </svg>
        {edges.map((e) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b || !e.label) return null;
          return (
            <span
              key={`l-${e.from}-${e.to}`}
              aria-hidden
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xs border border-line bg-bg px-1.5 py-0.5 font-mono text-eyebrow whitespace-nowrap text-fg-3 uppercase"
              style={{ left: `${(((a.x + b.x) / 2) / vw) * 100}%`, top: `${(((a.y + b.y) / 2) / vh) * 100}%` }}
            >
              {e.label}
            </span>
          );
        })}
        <ul className="contents">
          {nodes.map((n) => {
            const Icon = iconFor(n.icon);
            const fx = n.x / vw;
            const top = `${(n.y / vh) * 100}%`;
            const pos: CSSProperties = fx <= 0.2 ? { left: 0, top } : fx >= 0.8 ? { right: 0, top } : { left: `${fx * 100}%`, top };
            return (
              <li
                key={n.id}
                className={cn(
                  "absolute flex -translate-y-1/2 items-center gap-2.5 rounded-md border border-line bg-surface py-2 pr-3.5 pl-2.5 whitespace-nowrap shadow-md",
                  fx > 0.2 && fx < 0.8 && "-translate-x-1/2",
                )}
                style={pos}
              >
                {Icon ? (
                  <span aria-hidden className="grid size-8 place-items-center rounded-sm bg-sunken text-brand">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                ) : null}
                <span className="flex flex-col leading-tight">
                  <span className="text-small font-strong text-fg">{n.label}</span>
                  {n.sub ? <span className="text-caption text-fg-3">{n.sub}</span> : null}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Phones: a vertical list with CSS connectors */}
      <ol className="flex flex-col xl:hidden">
        {nodes.map((n, i) => {
          const Icon = iconFor(n.icon);
          const out = edges.filter((e) => e.from === n.id);
          return (
            <li key={n.id} className={cn("relative flex gap-3 pb-6", i < nodes.length - 1 && "before:absolute before:top-10 before:bottom-1 before:left-[19px] before:w-px before:bg-line-strong")}>
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-surface text-brand shadow-xs">
                {Icon ? <Icon className="size-5" strokeWidth={1.75} /> : null}
              </span>
              <span className="flex min-w-0 flex-col gap-1 pt-0.5">
                <span className="text-ui font-strong text-fg">{n.label}</span>
                {n.sub ? <span className="text-caption text-fg-3">{n.sub}</span> : null}
                {out.map((e) => (
                  <span key={e.to} className="font-mono text-eyebrow text-fg-3 uppercase">
                    → {byId.get(e.to)?.label}
                    {e.label ? ` · ${e.label}` : ""}
                  </span>
                ))}
              </span>
            </li>
          );
        })}
      </ol>

      <figcaption className="mt-6 flex max-w-[68ch] flex-col items-start gap-2 text-small text-fg-2">
        {caption}
        <FlowReplay />
      </figcaption>
    </figure>
  );
}
