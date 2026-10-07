import { Link2 } from "lucide-react";
import { cn } from "./cn";

export type SourceKind = "self" | "relative" | "patient" | "record";

export interface SourceChipProps {
  kind: SourceKind;
  /** Who said it ("Mom", "Uncle Dev"). For `patient` defaults to "you". */
  who?: string;
  /** ISO date. Shown as "SEP 27"; for portal records as the record year. */
  date?: string;
  /** Record kind only: the record's system (`RecordProvenance.system`). A simulated record (the offline fallback) says
   *  "SIMULATED" instead of "DEMO SANDBOX". */
  system?: string;
  /** Turns the chip into a button (e.g. to open a provenance popover). */
  onOpen?: () => void;
  className?: string;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// UTC parts, so server and client format the same string (no hydration mismatch across time zones).
function parts(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return null;
  return { md: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`, year: String(d.getUTCFullYear()) };
}

/** The plain-text label a chip shows, e.g. "TOLD BY MOM · SEP 27". Exported for tests and copy-as-text. */
export function sourceChipText(kind: SourceKind, who?: string, date?: string, system?: string): string {
  const p = parts(date);
  const bits =
    kind === "record"
      ? ["Portal record", system && /simulated/i.test(system) ? "Simulated" : "Demo sandbox", p?.year]
      : kind === "self"
        ? ["Self-reported", p?.md]
        : [`Told by ${who ?? (kind === "patient" ? "you" : "a relative")}`, p?.md];
  return bits.filter(Boolean).join(" · ").toUpperCase();
}

/** Mono provenance chip. Never "verified": portal facts say where they came from. */
export function SourceChip({ kind, who, date, system, onOpen, className }: SourceChipProps) {
  const text = sourceChipText(kind, who, date, system);
  const classes = cn(
    "inline-flex max-w-full items-center gap-1 rounded-xs px-1.5 py-0.5 font-mono text-eyebrow font-medium whitespace-nowrap [&_svg]:size-3",
    kind === "record" ? "bg-record-bg text-record dark:bg-record/15" : "bg-sunken text-fg-2",
    // As a button: a hairline ring marks it as tappable, and an invisible ::after grows the hit area to ~44 px without moving layout
    onOpen &&
      "relative cursor-pointer ring-1 ring-line-strong ring-inset underline-offset-2 transition-colors after:absolute after:-inset-x-1 after:-inset-y-3 hover:underline",
    className,
  );
  const content = (
    <>
      {kind === "record" ? <Link2 aria-hidden strokeWidth={2.25} /> : null}
      <span className="truncate">{text}</span>
    </>
  );
  return onOpen ? (
    <button type="button" onClick={onOpen} aria-haspopup="dialog" className={classes}>
      {content}
    </button>
  ) : (
    <span className={classes}>{content}</span>
  );
}
