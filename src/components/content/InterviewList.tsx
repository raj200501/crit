import { Badge } from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import type { Interview } from "@/content/interviews";

/** The small marker on interviews (and the theme) that touched on family history. Text, never color alone. */
export function FamilyHistoryMark({ className }: { className?: string }) {
  return (
    <Badge tone="brand" className={className}>
      Family history
    </Badge>
  );
}

// ≥ 1024 px: one row per interview under a header row (Interview · Topic · What we learned). Below: stacked cards.
const COLS = "lg:grid lg:grid-cols-[10rem_minmax(0,15rem)_minmax(0,1fr)] lg:gap-x-8";

/**
 * The 21 interviews as one ordered list: a table-like grid from 1024 px, stacked cards on phones and tablets, the same
 * DOM at every width (each <li id="ID006"> is a link target for the theme cards). Labels: the header row is for sighted
 * desktop readers (aria-hidden); every cell also carries its own label, visible on cards and sr-only in the grid.
 */
export function InterviewList({ interviews, label, className }: { interviews: readonly Interview[]; label: string; className?: string }) {
  return (
    <div className={cn("lg:overflow-hidden lg:rounded-lg lg:border lg:border-line lg:bg-surface lg:shadow-xs", className)}>
      <div aria-hidden data-list-head="" className={cn("hidden bg-sunken px-6 py-3 text-caption font-strong text-fg", COLS)}>
        <span>Interview</span>
        <span>Topic</span>
        <span>What we learned (paraphrased)</span>
      </div>
      <ol aria-label={label} className="flex flex-col gap-3 lg:gap-0">
        {interviews.map((iv) => (
          <li
            key={iv.id}
            id={iv.id}
            className={cn(
              "flex flex-col gap-3 rounded-lg border border-line bg-surface p-5 shadow-xs transition-colors duration-(--dur-hover)",
              "lg:rounded-none lg:border-0 lg:border-t lg:px-6 lg:py-5 lg:shadow-none lg:hover:bg-paper",
              "target:bg-evergreen-50 target:shadow-[inset_3px_0_0_var(--color-evergreen-600)] lg:target:bg-evergreen-50 lg:target:shadow-[inset_3px_0_0_var(--color-evergreen-600)]",
              COLS,
            )}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 lg:flex-col lg:items-start">
              <span className="font-mono text-ui font-medium text-fg tabular-nums">
                <span className="sr-only">Interview </span>
                {iv.id}
              </span>
              <span aria-hidden className="text-fg-3 lg:hidden">
                ·
              </span>
              <span className="text-small text-fg-2">
                <span className="sr-only">Role: </span>
                {iv.role}
              </span>
              {iv.familyHistory ? <FamilyHistoryMark className="max-lg:ml-auto lg:mt-1" /> : null}
            </div>
            <p className="text-ui font-strong text-fg">{iv.topic}</p>
            <div className="min-w-0 border-t border-line pt-3 lg:border-0 lg:pt-0">
              <p className="font-mono text-eyebrow text-fg-3 uppercase lg:sr-only">What we learned (paraphrased)</p>
              <p className="mt-1 text-small text-fg-2 lg:mt-0 lg:text-body">{iv.learned}</p>
              {iv.quote ? (
                <blockquote className="mt-3 border-l-2 border-brand pl-3 font-display text-body text-fg italic">
                  <p>&ldquo;{iv.quote}&rdquo;</p>
                </blockquote>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
