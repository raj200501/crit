import { X } from "lucide-react";
import type { Report } from "@/lib/types";
import { cn } from "@/components/ui/cn";
import { IconButton } from "@/components/ui/IconButton";
import { PedigreeGlyph } from "@/components/ui/PedigreeGlyph";
import { SourceChip } from "@/components/ui/SourceChip";
import { factLine, shortDate } from "@/components/tree/model";
import { chipWho, whoSaid } from "./ReceiptTimeline";

/** The two disagreeing reports, from different people (latest word from each of the first two voices). */
export function voicesOf(reports: Report[]): [Report, Report] | null {
  const latest = new Map<string, Report>();
  for (const r of reports) if (r.kind === "condition" || r.kind === "no-history") latest.set(r.reportedBy, r);
  const list = [...latest.values()].sort((a, b) => a.reportedAt.localeCompare(b.reportedAt));
  return list.length >= 2 ? [list[0], list[1]] : null;
}

function Voice({ r, side, onRemove }: { r: Report; side: "a" | "b"; onRemove?: () => void }) {
  const { who, verb } = whoSaid(r);
  return (
    <article
      aria-label={`${who} ${verb}`}
      className={cn(
        "relative flex min-w-0 flex-col rounded-md border border-line bg-surface p-3.5 pt-4 shadow-xs",
        "before:absolute before:inset-x-3.5 before:top-0 before:h-0.5 before:rounded-full",
        side === "a" ? "before:bg-evergreen-600" : "before:bg-[repeating-linear-gradient(90deg,var(--color-conflict)_0_6px,transparent_6px_10px)]",
      )}
    >
      <p className="flex items-baseline justify-between gap-2 text-small text-fg-2">
        <span className="min-w-0 truncate">
          <span className="font-medium text-fg">{who}</span> {verb}
        </span>
        <time dateTime={r.reportedAt} className="shrink-0 font-mono text-eyebrow text-fg-3 uppercase">
          {shortDate(r.reportedAt)}
        </time>
      </p>
      <p className="mt-1.5 text-ui font-strong text-fg">{factLine(r)}</p>
      {r.note ? <p className="mt-1 text-small text-ink-2 italic">&ldquo;{r.note}&rdquo;</p> : null}
      <div className="mt-auto flex min-h-9 items-center gap-2 pt-2.5">
        <SourceChip kind={r.source} who={chipWho(r)} date={r.source === "record" ? r.record?.recordedDate : undefined} />
        {onRemove ? <IconButton label="Remove this entry" size="sm" icon={<X />} onClick={onRemove} className="ml-auto max-lg:size-11" /> : null}
      </div>
    </article>
  );
}

const BOTH = "font-mono text-eyebrow font-medium whitespace-nowrap text-conflict-ink uppercase";

/**
 * A conflict as two voice cards: side by side when there's room, stacked in panels under 360 px (the inspector and the
 * phone sheet), divided by the split glyph and "Both kept · names attached".
 */
export function VoicePair({ voices, removable, onRemove }: { voices: [Report, Report]; removable: (r: Report) => boolean; onRemove: (id: string) => void }) {
  const [a, b] = voices;
  return (
    <div className="@container">
      <div className="relative grid gap-2 @min-[22.5rem]:grid-cols-2 @min-[22.5rem]:gap-4">
        <Voice r={a} side="a" onRemove={removable(a) ? () => onRemove(a.id) : undefined} />
        <div className="flex items-center gap-2.5 px-1 @min-[22.5rem]:absolute @min-[22.5rem]:top-1/2 @min-[22.5rem]:left-1/2 @min-[22.5rem]:-translate-x-1/2 @min-[22.5rem]:-translate-y-1/2 @min-[22.5rem]:px-0">
          <span aria-hidden className="h-px flex-1 bg-line-strong @min-[22.5rem]:hidden" />
          <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-surface shadow-xs ring-1 ring-line">
            <PedigreeGlyph shape="circle" status="conflicting" size={20} />
          </span>
          <span className={cn(BOTH, "@min-[22.5rem]:hidden")}>Both kept · names attached</span>
          <span aria-hidden className="h-px flex-1 bg-line-strong @min-[22.5rem]:hidden" />
        </div>
        <Voice r={b} side="b" onRemove={removable(b) ? () => onRemove(b.id) : undefined} />
      </div>
      <p aria-hidden className={cn(BOTH, "mt-3 hidden items-center justify-center gap-2 @min-[22.5rem]:flex")}>
        <span className="h-px w-6 bg-line-strong" />
        Both kept · names attached
        <span className="h-px w-6 bg-line-strong" />
      </p>
    </div>
  );
}
