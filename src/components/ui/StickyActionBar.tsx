import type { ReactNode } from "react";
import { cn } from "./cn";

/** Sticks to the bottom of its scroll container, above the safe area. On desktop, put it inside the card. */
export function StickyActionBar({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-(--z-sticky) flex flex-col gap-2 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
