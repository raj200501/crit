import { X } from "lucide-react";
import type { Report } from "@/lib/types";
import { cn } from "@/components/ui/cn";
import { IconButton } from "@/components/ui/IconButton";
import { SourceChip } from "@/components/ui/SourceChip";
import { factLine, shortDate } from "@/components/tree/model";

/** "Mom said" / "Uncle Dev shared from a portal record" / "You added". */
export function whoSaid(r: Report) {
  const who = r.reportedById === "self" ? "You" : r.reportedBy;
  if (r.source === "record") return { who, verb: "shared from a portal record" };
  if (r.reportedById === "self") return { who, verb: "added" };
  return { who, verb: "said" };
}

export const chipWho = (r: Report) => (r.reportedById === "self" ? "you" : r.reportedBy);

const DOT: Record<string, string> = {
  record: "bg-record",
  declined: "bg-declined",
  "dont-know": "bg-unknown",
  default: "bg-evergreen-600",
};

function dotFor(r: Report) {
  if (r.kind === "declined") return DOT.declined;
  if (r.kind === "dont-know") return DOT["dont-know"];
  if (r.source === "record") return DOT.record;
  return DOT.default;
}

/** One receipt: who said it and when → the fact → their words → the source chip (DESIGN §12.3). */
export function ReceiptRow({ r, onRemove }: { r: Report; onRemove?: () => void }) {
  const { who, verb } = whoSaid(r);
  return (
    <li className="relative pb-5 pl-7 last:pb-0 before:absolute before:top-4 before:bottom-0 before:left-[7px] before:w-px before:bg-line last:before:hidden">
      <span aria-hidden className={cn("absolute top-1 left-0 size-[15px] rounded-full border-[3px] border-surface ring-1 ring-line-strong", dotFor(r))} />
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-small text-fg-2">
          <span className="font-medium text-fg">{who}</span> {verb}
        </p>
        <time dateTime={r.reportedAt} className="shrink-0 font-mono text-eyebrow text-fg-3 uppercase">
          {shortDate(r.reportedAt)}
        </time>
      </div>
      <p className="mt-1 text-ui font-strong text-fg">{factLine(r)}</p>
      {r.note && r.kind !== "declined" ? <p className="mt-1 text-small text-ink-2 italic">&ldquo;{r.note}&rdquo;</p> : null}
      {r.source === "record" && r.record?.recordedDate ? (
        <p className="mt-1 text-small text-fg-2">From a portal record · on problem list since {r.record.recordedDate.slice(0, 4)}</p>
      ) : null}
      <div className="mt-2 flex min-h-9 items-center gap-2">
        <SourceChip kind={r.source} who={chipWho(r)} date={r.source === "record" ? r.record?.recordedDate : r.reportedAt} />
        {onRemove ? (
          <IconButton label="Remove this entry" title="Remove this entry" size="sm" icon={<X />} onClick={onRemove} className="ml-auto max-lg:size-11" />
        ) : null}
      </div>
    </li>
  );
}

export function ReceiptTimeline({ reports, removable, onRemove }: { reports: Report[]; removable: (r: Report) => boolean; onRemove: (id: string) => void }) {
  return (
    <ol className="flex flex-col">
      {reports.map((r) => (
        <ReceiptRow key={r.id} r={r} onRemove={removable(r) ? () => onRemove(r.id) : undefined} />
      ))}
    </ol>
  );
}
