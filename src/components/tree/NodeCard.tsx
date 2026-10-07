import type { FocusEvent, KeyboardEvent, PointerEvent } from "react";
import type { PersonView } from "@/lib/status";
import { cn } from "@/components/ui/cn";
import { PedigreeGlyph, shapeForSex } from "@/components/ui/PedigreeGlyph";
import { STATUS_TEXT } from "@/components/ui/status";
import { hasFinding, nodeAriaDetail, nodeDetail, nodeStatus, statusWord } from "./model";
import { NODE_H, NODE_W } from "./geometry";

export interface NodeCardProps {
  view: PersonView;
  x: number;
  y: number;
  /** Invited and waiting for an answer. */
  pending?: boolean;
  selected?: boolean;
  /** Roving tabindex: only one node is in the tab order. */
  tabbable?: boolean;
  /** The legend filter is on and this node doesn't match. */
  dimmed?: boolean;
  /** An answer just arrived for this person: ripple once (motion) and a NEW tag. */
  arrived?: boolean;
  /** The demo tour points here. */
  anchor?: boolean;
  /** Entrance stagger (ms). */
  delay?: number;
  onSelect?: (id: string) => void;
  onFocus?: (id: string, e: FocusEvent<HTMLButtonElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onHoverStart?: (id: string) => void;
  onHoverEnd?: (id: string) => void;
}

/**
 * One relative on the canvas: 188 × 82, a pedigree glyph (ring = certainty, fill = heart condition reported, slash =
 * passed away, square = portal record), the name, the status word and the headline. The e2e contract lives here:
 * one <button> per person, data-person-id, aria-pressed and the `{label}: {status}. {headline}` name (DESIGN §12.2).
 */
export function NodeCard({
  view,
  x,
  y,
  pending,
  selected,
  tabbable = true,
  dimmed,
  arrived,
  anchor,
  delay = 0,
  onSelect,
  onFocus,
  onKeyDown,
  onHoverStart,
  onHoverEnd,
}: NodeCardProps) {
  const p = view.person;
  const isSelf = p.relation === "self";
  const ns = nodeStatus(view, pending);
  const line3 = nodeDetail(view, ns, pending);

  const hover = (fn?: (id: string) => void) => (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "mouse") fn?.(p.id);
  };

  return (
    <button
      type="button"
      data-person-id={p.id}
      data-tour-anchor={anchor || undefined}
      aria-pressed={!!selected}
      aria-label={`${p.label}: ${isSelf ? "you" : view.status}. ${isSelf ? view.headline : nodeAriaDetail(view)}`}
      tabIndex={tabbable ? 0 : -1}
      onClick={() => onSelect?.(p.id)}
      onFocus={(e) => onFocus?.(p.id, e)}
      onKeyDown={onKeyDown}
      onPointerEnter={hover(onHoverStart)}
      onPointerLeave={hover(onHoverEnd)}
      style={{ left: x, top: y, width: NODE_W, height: NODE_H, animationDelay: delay ? `${delay}ms` : undefined }}
      className={cn(
        "group/node absolute flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-left",
        "transition-[translate,box-shadow,opacity,border-color,background-color] duration-(--dur-hover) ease-out-quart motion-safe:animate-fade-up",
        isSelf ? "border-ink bg-ink text-white shadow-md" : dimmed ? "border-line/50 bg-surface/70 text-fg-3 shadow-none" : "border-line bg-surface text-fg shadow-xs hover:border-line-strong",
        "hover:-translate-y-0.5 not-aria-pressed:hover:shadow-md",
        "aria-pressed:-translate-y-0.5 aria-pressed:shadow-[0_0_0_3px_var(--color-canvas),0_0_0_5px_var(--color-ink),var(--shadow-md)]",
        "focus-visible:outline-offset-2 aria-pressed:focus-visible:outline-offset-[7px]",
        anchor &&
          "shadow-[0_0_0_3px_var(--color-canvas),0_0_0_5px_var(--color-evergreen-600),0_0_28px_6px_rgb(127_230_197/0.7)] not-aria-pressed:hover:shadow-[0_0_0_3px_var(--color-canvas),0_0_0_5px_var(--color-evergreen-600),0_0_28px_6px_rgb(127_230_197/0.7)]",
        // Dimmed by the legend filter: only the glyph, border and shadow fade; text stays ≥ 4.5:1 (WCAG 1.4.3)
        dimmed && "[&>svg]:opacity-35",
        "motion-reduce:hover:translate-y-0 motion-reduce:aria-pressed:translate-y-0",
      )}
    >
      <PedigreeGlyph
        shape={shapeForSex(p.sex)}
        status={ns}
        finding={hasFinding(view)}
        deceased={p.deceased}
        record={view.verified}
        proband={isSelf}
        size={32}
        tone={isSelf ? "night" : "paper"}
        className="shrink-0"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-ui leading-snug font-strong">
          {p.label}
          {p.deceased ? <span className="sr-only">, passed away</span> : null}
        </span>
        {/* Line 2: the full A3 status word in sentence case (the glyph carries the shape, so no icon here) */}
        <span
          data-node-status=""
          className={cn(
            "mt-0.5 truncate text-caption leading-[1.3] font-medium",
            isSelf ? "text-lumen" : dimmed ? "text-fg-3" : STATUS_TEXT[ns as keyof typeof STATUS_TEXT],
          )}
        >
          {statusWord(ns, pending)}
        </span>
        <span className={cn("mt-0.5 truncate text-caption", isSelf ? "text-ivory-2" : dimmed ? "text-fg-3" : "text-fg-2")}>{line3}</span>
      </span>
      {arrived || view.verified ? (
        <span aria-hidden className="pointer-events-none absolute -top-2.5 right-2.5 flex gap-1">
          {arrived ? (
            <span className="rounded-xs bg-evergreen-50 px-1.5 font-mono text-eyebrow leading-5 font-medium text-evergreen-700 ring-1 ring-evergreen-600/30">
              NEW
            </span>
          ) : null}
          {view.verified ? (
            <span className="rounded-xs bg-record-bg px-1.5 font-mono text-eyebrow leading-5 font-medium text-record ring-1 ring-record/25">RECORD</span>
          ) : null}
        </span>
      ) : null}
      {arrived ? (
        <>
          <span
            data-ripple
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[inherit] border-2 border-evergreen-600 shadow-[0_0_22px_rgb(127_230_197/0.9)] motion-safe:animate-ripple motion-reduce:hidden"
          />
          <span
            data-ripple
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[inherit] border-2 border-lumen motion-safe:animate-ripple motion-reduce:hidden [animation-delay:380ms]"
          />
        </>
      ) : null}
    </button>
  );
}
