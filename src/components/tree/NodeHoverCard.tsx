import { ArrowRight } from "lucide-react";
import type { PersonView } from "@/lib/status";
import { cn } from "@/components/ui/cn";
import { SourceChip } from "@/components/ui/SourceChip";
import { StatusPill } from "@/components/ui/StatusPill";
import { factLine, nodeStatus, statusWord } from "./model";

export interface NodeHoverCardProps {
  view: PersonView;
  pending?: boolean;
  /** The node's rect in viewport pixels. */
  rect: { x: number; y: number; w: number; h: number };
  viewport: { w: number; h: number };
  onOpen: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

const W = 320;

/** Mouse-only preview of a relative's latest answers (DESIGN §12.2 hover). Hoverable, Esc dismisses, never covers the node. */
export function NodeHoverCard({ view, pending, rect, viewport, onOpen, onPointerEnter, onPointerLeave }: NodeHoverCardProps) {
  const ns = nodeStatus(view, pending);
  const latest = [...view.reports].reverse().slice(0, 2);
  const above = rect.y > 200 || rect.y + rect.h + 220 > viewport.h;
  const left = Math.max(8, Math.min(rect.x + rect.w / 2 - W / 2, viewport.w - W - 8));
  return (
    <div
      data-no-pan
      role="group"
      aria-label={`${view.person.label}, latest answers`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ left, width: W, ...(above ? { bottom: viewport.h - rect.y + 10 } : { top: rect.y + rect.h + 10 }) }}
      className={cn(
        "absolute z-10 rounded-lg border border-line bg-raised p-4 text-fg shadow-lg",
        "transition-[opacity,translate] duration-(--dur-hover) ease-out-quart starting:opacity-0",
        above ? "starting:translate-y-1" : "starting:-translate-y-1",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-ui font-strong">{view.person.label}</p>
        {ns !== "self" ? <StatusPill status={ns} size="sm" label={ns === "pending" && pending ? statusWord(ns, pending) : undefined} /> : null}
      </div>
      {latest.length ? (
        <ul className="mt-3 flex flex-col gap-2.5 border-t border-line pt-3">
          {latest.map((r) => (
            <li key={r.id} className="flex flex-col items-start gap-1">
              <span className="text-small font-medium text-fg">{factLine(r)}</span>
              <SourceChip kind={r.source} who={r.reportedBy} date={r.source === "record" ? r.record?.recordedDate : r.reportedAt} system={r.record?.system} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-small text-fg-3">No answers yet.</p>
      )}
      <button
        type="button"
        onClick={onOpen}
        className="group/open mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-xs text-small font-medium text-brand hover:text-brand-strong"
      >
        Open details
        <ArrowRight aria-hidden className="size-3.5 transition-transform duration-(--dur-hover) group-hover/open:translate-x-0.5" />
      </button>
    </div>
  );
}
