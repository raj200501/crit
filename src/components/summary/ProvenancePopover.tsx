"use client";

import { Link2, Quote } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Popover } from "@/components/ui/Popover";
import { SourceChip, type SourceKind } from "@/components/ui/SourceChip";
import { fmtStamp, type ProvEntry } from "./model";

export interface ProvenancePopoverProps {
  /** The visible trigger text (a chip label, or the Epic source wording in the care-team table). */
  label: string;
  /** Who the facts are about, for the popover heading ("Dad · Father"). */
  subject: string;
  entries: ProvEntry[];
  /** chip: a mono SourceChip look. text: a dotted-underline source cell. */
  variant?: "chip" | "text";
  kind?: SourceKind;
  className?: string;
}

const CHIP = "h-auto min-h-0 max-w-full min-w-0 shrink gap-1 rounded-xs px-1.5 py-0.5 font-mono text-eyebrow font-medium ring-1 ring-line-strong ring-inset [&_svg]:size-3";
const TEXT =
  "h-auto min-h-0 justify-start rounded-xs px-0 text-left text-[length:inherit] leading-[inherit] font-normal whitespace-normal text-fg-2 underline decoration-fg/35 decoration-dotted underline-offset-[3px] hover:bg-transparent hover:text-fg hover:decoration-solid";

/**
 * Abridge-style "linked evidence": every source opens who said it, when, their own words and the record date.
 * A client island inside the (server-renderable) SummaryDocument; props are plain data.
 */
export function ProvenancePopover({ label, subject, entries, variant = "chip", kind = "relative", className }: ProvenancePopoverProps) {
  return (
    <Popover
      align="start"
      label={`Where this came from: ${subject}`}
      className="w-[min(352px,calc(100vw-24px))] p-0"
      trigger={{
        variant: "ghost",
        size: "sm",
        // ~44 px hit area without moving layout (the chip is 20 px tall)
        className: cn(
          variant === "chip" ? CHIP : TEXT,
          variant === "chip" && (kind === "record" ? "bg-record-bg text-record hover:bg-record-bg" : "bg-sunken text-fg-2 hover:bg-mist-2"),
          "after:absolute after:-inset-x-1 after:-inset-y-3 active:scale-100 print:bg-transparent print:no-underline print:ring-0",
          className,
        ),
        label: (
          <>
            {variant === "chip" && kind === "record" ? <Link2 aria-hidden strokeWidth={2.25} /> : null}
            <span className={variant === "chip" ? "truncate" : undefined}>{label}</span>
          </>
        ),
      }}
    >
      <div className="max-h-[min(70vh,520px)] overflow-y-auto p-4">
        <p className="font-mono text-eyebrow font-medium text-fg-3 uppercase">Where this came from</p>
        <p className="mt-1 text-ui font-strong text-fg">{subject}</p>
        <ul className="mt-2 divide-y divide-line">
          {entries.map((e) => (
            <li key={e.id} className="flex flex-col gap-1.5 py-3 last:pb-0">
              <div className="flex flex-wrap items-center gap-2">
                <SourceChip kind={e.kind} who={e.kind === "relative" || e.kind === "patient" ? e.who : undefined} date={e.kind === "record" ? e.record?.recordedDate : e.when} />
              </div>
              <p className="text-small text-fg">
                {e.kind === "self" ? `${e.who} said: ` : e.kind === "record" ? "From their record: " : `${e.who} said: `}
                <span className="font-strong">{e.what}</span>
              </p>
              {e.note ? (
                <blockquote className="flex gap-2 rounded-sm bg-sunken px-3 py-2 text-small text-fg-2 italic">
                  <Quote aria-hidden className="mt-1 size-3 shrink-0 text-fg-3" />
                  <span>{e.note}</span>
                </blockquote>
              ) : null}
              {e.record ? (
                <p className="text-caption text-fg-3">
                  {e.record.system}
                  {e.record.recordedDate ? ` · on the problem list since ${e.record.recordedDate.slice(0, 4)}` : ""}. Shared by {e.who} from their own
                  portal. A record date can be when a problem was listed, not when it started.
                </p>
              ) : null}
              {e.when ? (
                <p className="text-caption text-fg-3">
                  Added{" "}
                  <time dateTime={e.when} suppressHydrationWarning>
                    {fmtStamp(e.when, { year: true, time: true })}
                  </time>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </Popover>
  );
}
