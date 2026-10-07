import type { ElementType, ReactNode } from "react";
import { cn } from "./cn";

/** Mono uppercase label (12 px, +0.08em). The only text allowed under 13 px. */
export function Eyebrow({ as: Tag = "p", className, children, id }: { as?: ElementType; className?: string; children?: ReactNode; id?: string }) {
  return (
    <Tag id={id} className={cn("font-mono text-eyebrow font-medium text-fg-3 uppercase", className)}>
      {children}
    </Tag>
  );
}
