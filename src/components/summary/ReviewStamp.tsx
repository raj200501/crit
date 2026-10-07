import { Check, ClipboardCheck } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { fmtStamp } from "./model";

export interface ReviewStampProps {
  /** ISO timestamp, or nothing when not reviewed yet. */
  reviewedAt?: string | null;
  /** Patient review ("you" on the patient's copy) or the demo clinician review (/view, /practice). */
  by: "you" | "patient" | "clinician";
  className?: string;
}

/**
 * "✓ Reviewed by patient · Oct 6" in evergreen-700, or "Not yet reviewed" (patient review only). Keyed by state, so a change
 * crossfades in 220 ms through @starting-style (no JS); facts never travel.
 */
export function ReviewStamp({ reviewedAt, by, className }: ReviewStampProps) {
  const date = fmtStamp(reviewedAt ?? undefined);
  if (!reviewedAt || !date) {
    if (by === "clinician") return null;
    return (
      <span
        key="not-reviewed"
        className={cn(
          "inline-flex items-center gap-1.5 font-mono text-eyebrow font-medium text-conflict-ink uppercase transition-opacity duration-(--dur-ui) starting:opacity-0",
          className,
        )}
      >
        <span aria-hidden className="size-1.5 rounded-full border border-current" />
        Not yet reviewed
      </span>
    );
  }
  const Icon = by === "clinician" ? ClipboardCheck : Check;
  return (
    <span
      key={`reviewed-${by}`}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-eyebrow font-medium whitespace-nowrap text-evergreen-700 uppercase transition-opacity duration-(--dur-ui) starting:opacity-0",
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" strokeWidth={2.5} />
      Reviewed by {by}
      <span aria-hidden>·</span>
      <time dateTime={reviewedAt} suppressHydrationWarning>
        {date}
      </time>
    </span>
  );
}
