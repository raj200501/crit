import type { ReactNode } from "react";
import { Cite } from "./Cite";
import { cn } from "./cn";

/** Mono eyebrow line naming a study ("SWEDEN · 25,302 PEOPLE") with its citation. */
export function SourceTag({ children, cite, className }: { children?: ReactNode; cite?: number | readonly number[]; className?: string }) {
  return (
    <p className={cn("font-mono text-eyebrow text-fg-3 uppercase", className)}>
      {children}
      {/* the tag is already 12 px mono, so the digits match it instead of shrinking */}
      {cite !== undefined ? <Cite n={cite} className="text-[1em]" /> : null}
    </p>
  );
}
