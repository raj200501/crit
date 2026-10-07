"use client";

import { cn } from "@/components/ui/cn";
import { PedigreeGlyph } from "@/components/ui/PedigreeGlyph";
import { STATUS_LABEL } from "@/components/ui/status";
import type { Highlight } from "./model";

type Key = Exclude<Highlight, null>;

const ITEMS: { key: Key; label: string }[] = [
  { key: "known", label: STATUS_LABEL.known },
  { key: "conflicting", label: STATUS_LABEL.conflicting },
  { key: "unknown", label: STATUS_LABEL.unknown },
  { key: "declined", label: STATUS_LABEL.declined },
  { key: "pending", label: STATUS_LABEL.pending },
  { key: "finding", label: "Heart-related condition reported" },
];

export interface LegendFilterProps {
  counts: Record<Key, number>;
  value: Highlight;
  onChange: (value: Highlight) => void;
  className?: string;
}

/**
 * The legend is the filter (DESIGN §12.1): glyph + word + count, as toggle buttons. Pressing one dims every relative
 * who doesn't match; pressing it again clears. Still the `list "Legend"` of the e2e contract.
 */
export function LegendFilter({ counts, value, onChange, className }: LegendFilterProps) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <p id="legend-hint" className="sr-only">
        Press a status to highlight those relatives in the tree. Press it again to show everyone.
      </p>
      <ul
        aria-label="Legend"
        aria-describedby="legend-hint"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {ITEMS.map(({ key, label }) => {
          const on = value === key;
          const tone = on ? "night" : "paper";
          return (
            <li key={key} className="shrink-0">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onChange(on ? null : key)}
                // phones: the chips scroll sideways; a chip that gets keyboard focus slides fully into view
                onFocus={(e) => e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })}
                className={cn(
                  "group inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border pr-2 pl-2.5 text-small font-medium whitespace-nowrap lg:h-9",
                  "transition-[background-color,border-color,color,box-shadow] duration-(--dur-ui) ease-out-quart",
                  on
                    ? "border-ink bg-ink text-white shadow-sm"
                    : "border-line bg-surface/80 text-fg-2 shadow-xs hover:border-line-strong hover:bg-surface hover:text-fg",
                )}
              >
                {key === "finding" ? (
                  <PedigreeGlyph shape="circle" status="known" finding size={18} tone={tone} />
                ) : (
                  <PedigreeGlyph shape="circle" status={key} size={18} tone={tone} />
                )}
                <span>{label}</span>
                <span
                  className={cn(
                    "grid h-5 min-w-5 place-items-center rounded-full px-1.5 font-mono text-eyebrow tabular-nums",
                    on ? "bg-white/15 text-white" : "bg-sunken text-fg-2 group-hover:text-fg",
                  )}
                >
                  {counts[key]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
