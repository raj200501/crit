import type { ReactNode } from "react";
import { cn } from "./cn";

/** A key cap, for keyboard help lines. */
export function Kbd({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-xs border border-line-strong bg-surface px-1.5 font-mono text-caption text-fg-2 shadow-[inset_0_-1px_0_var(--ui-line-strong)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
