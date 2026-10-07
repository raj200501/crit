import type { ReactNode } from "react";
import { Cite } from "@/components/ui/Cite";
import { cn } from "@/components/ui/cn";

export interface FindingProps {
  title: string;
  /** The fact-checked sentence(s), verbatim. */
  children: ReactNode;
  cite?: number | readonly number[];
  /** Small label above the title. */
  label?: string;
  className?: string;
}

/** A research finding: an evergreen rule, a display title, the verbatim text and its sources. */
export function Finding({ title, children, cite, label = "From the research", className }: FindingProps) {
  return (
    <div className={cn("relative flex h-full min-w-0 flex-col gap-3 overflow-hidden rounded-lg border border-line bg-surface p-6 shadow-xs sm:p-7", className)}>
      <span aria-hidden className="absolute inset-y-6 left-0 w-[3px] rounded-r-full bg-brand" />
      <p className="font-mono text-eyebrow text-fg-3 uppercase">{label}</p>
      <h3 className="font-display text-[1.625rem] leading-[1.15] font-book tracking-[-0.015em] text-fg">{title}</h3>
      <p className="text-body text-fg-2">
        {children}
        {cite !== undefined ? <Cite n={cite} /> : null}
      </p>
    </div>
  );
}
