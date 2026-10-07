"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { cn } from "@/components/ui/cn";
import { Sheet } from "@/components/ui/Sheet";
import { useEnter } from "./useEnter";

/** Desktop: the inline inspector in the right column (Card tier overlay), entering x 24 → 0 with a fade over 280 ms. */
export function Inspector({ children, personId, className }: { children: ReactNode; personId: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEnter(ref, { x: 24, duration: 280 }, [personId]);
  return (
    <div ref={ref} className={cn("edge-highlight relative rounded-lg border border-line bg-raised p-6 text-fg shadow-lg", className)}>
      {children}
    </div>
  );
}

/**
 * Phones: the same panel inside a bottom Sheet (snaps at 55% and 92%; drag down or Esc closes; focus returns to the
 * relative's node). The panel's own Close button is the sheet's close.
 */
export function PanelSheet({
  open,
  onClose,
  titleId,
  returnFocusTo,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titleId?: string;
  returnFocusTo: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onClose={onClose} side="bottom" labelledBy={titleId} returnFocusTo={returnFocusTo} showClose={false}>
      {children}
    </Sheet>
  );
}
