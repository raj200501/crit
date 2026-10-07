import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { PedigreeGlyph } from "@/components/ui/PedigreeGlyph";
import { SourceChip } from "@/components/ui/SourceChip";
import { StatusPill } from "@/components/ui/StatusPill";
import type { PersonReceipt, ReceiptLine } from "./receipts";

function Fact({ line }: { line: ReceiptLine }) {
  return (
    <span className="text-ui font-strong text-fg">
      {line.fact}
      {line.age ? (
        <>
          <span className="px-1.5 font-normal text-fg-3">·</span>
          <span className="tabular-nums">{line.age}</span>
        </>
      ) : null}
    </span>
  );
}

function Voice({ line, className }: { line: ReceiptLine; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 rounded-md border border-line bg-surface p-3.5 shadow-xs", className)}>
      <Fact line={line} />
      <SourceChip kind={line.kind} who={line.who} date={line.date} className="self-start" />
      {line.note ? <p className="text-small text-fg-2 italic">&ldquo;{line.note}&rdquo;</p> : null}
    </div>
  );
}

/**
 * The side card that opens when a visitor selects someone in the ProductTour tree. Built only from the person's
 * view (status, reports, sources): two voices side by side when reports disagree, otherwise one row per report.
 */
export function LandingReceipt({ person, className }: { person: PersonReceipt; className?: string }) {
  const conflicting = person.status === "conflicting";
  const voices = conflicting ? person.lines.filter((l) => l.fact !== "No heart history").slice(0, 2) : [];
  const pending = person.status === "pending";
  return (
    <article aria-labelledby={`receipt-${person.id}`} className={cn("@container flex flex-col gap-5", className)}>
      <header className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-sunken">
          <PedigreeGlyph shape={person.shape} status={person.glyph} finding={person.finding} deceased={person.deceased} record={person.record} size={34} />
        </span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 id={`receipt-${person.id}`} className="text-title font-strong text-fg">
            {person.label}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {person.status === "self" ? null : <StatusPill status={person.status} size="sm" />}
            <span className="font-mono text-eyebrow text-fg-3 uppercase">{person.relation}</span>
          </div>
        </div>
      </header>

      {conflicting && voices.length === 2 ? (
        <div className="grid gap-2 @lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] @lg:items-stretch">
          <Voice line={voices[0]} />
          <span className="flex items-center justify-center gap-2 font-mono text-eyebrow text-brand uppercase py-0.5 @lg:flex-col @lg:[writing-mode:vertical-rl]">
            <span aria-hidden className="h-px w-6 bg-brand/40 @lg:h-6 @lg:w-px" />
            Both kept
            <span aria-hidden className="h-px w-6 bg-brand/40 @lg:h-6 @lg:w-px" />
          </span>
          <Voice line={voices[1]} />
        </div>
      ) : person.lines.length ? (
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
          {person.lines.map((l) => (
            <li key={l.id} className="flex flex-col gap-2 p-3.5">
              <Fact line={l} />
              <SourceChip kind={l.kind} who={l.who} date={l.date} className="self-start" />
              {l.note ? <p className="text-small text-fg-2 italic">&ldquo;{l.note}&rdquo;</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-line-strong p-3.5 text-small text-fg-2">
          {person.status === "self" ? `${person.headline}. Your relatives fill in their own branches.` : "No one has been asked yet."}
        </p>
      )}

      <Link
        href={pending ? `/tree?person=${person.id}&mode=invite` : `/tree?person=${person.id}`}
        prefetch={false}
        className="group/open inline-flex min-h-11 items-center gap-1.5 self-start rounded-full text-ui font-medium text-brand transition-colors hover:text-brand-strong"
      >
        {pending ? `Ask ${person.name}` : `Open ${person.name} in the demo`}
        <ArrowRight aria-hidden className="size-4 transition-transform duration-(--dur-hover) group-hover/open:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
    </article>
  );
}
