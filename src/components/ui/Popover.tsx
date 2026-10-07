"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode, type ToggleEvent } from "react";
import { Button, type ButtonProps } from "./Button";
import { cn } from "./cn";

export interface PopoverProps {
  /** Button props for the trigger, plus its visible `label`. */
  trigger: Omit<ButtonProps, "children" | "href" | "popoverTarget"> & { label: ReactNode };
  children?: ReactNode | ((api: { close: () => void }) => ReactNode);
  align?: "start" | "center" | "end";
  /** Accessible name of the popover surface. */
  label?: string;
  className?: string;
}

const GAP = 8;
const MARGIN = 8;

/**
 * Native `popover` + `popovertarget`: top layer, light dismiss, Esc. Positioned under the trigger with fixed
 * coordinates computed when it opens (and on resize/scroll while open). Focus returns to the trigger on close.
 */
export function Popover({ trigger, children, align = "start", label, className }: PopoverProps) {
  const id = useId().replace(/:/g, "");
  const popId = `pop-${id}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const place = useCallback(() => {
    const t = triggerRef.current;
    const p = popRef.current;
    if (!t || !p) return;
    const r = t.getBoundingClientRect();
    const w = p.offsetWidth;
    const h = p.offsetHeight;
    let left = align === "start" ? r.left : align === "end" ? r.right - w : r.left + r.width / 2 - w / 2;
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - w - MARGIN));
    let top = r.bottom + GAP;
    if (top + h > window.innerHeight - MARGIN && r.top - GAP - h > MARGIN) top = r.top - GAP - h;
    p.style.left = `${Math.round(left)}px`;
    p.style.top = `${Math.round(top)}px`;
  }, [align]);

  useEffect(() => {
    if (!open) return;
    const onMove = () => place();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, { passive: true, capture: true });
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, { capture: true });
    };
  }, [open, place]);

  // By id rather than ref, so render-prop children can call it.
  const close = useCallback(() => {
    const el = document.getElementById(popId);
    if (el?.matches(":popover-open")) el.hidePopover();
  }, [popId]);

  const onToggle = (e: ToggleEvent<HTMLDivElement>) => {
    const isOpen = e.newState === "open";
    setOpen(isOpen);
    if (isOpen) {
      place();
      return;
    }
    // Light dismiss by clicking elsewhere keeps focus where the user clicked; Esc and item clicks return it here.
    const active = document.activeElement;
    if (!active || active === document.body || popRef.current?.contains(active)) triggerRef.current?.focus();
  };

  const { label: triggerLabel, className: triggerClass, variant = "secondary", size = "sm", ...triggerRest } = trigger;
  return (
    <>
      <Button
        ref={triggerRef as React.Ref<HTMLButtonElement>}
        variant={variant}
        size={size}
        popoverTarget={popId}
        aria-expanded={open}
        aria-controls={popId}
        className={triggerClass}
        {...triggerRest}
      >
        {triggerLabel}
      </Button>
      <div
        ref={popRef}
        id={popId}
        popover="auto"
        aria-label={label}
        role={label ? "group" : undefined}
        onBeforeToggle={(e) => {
          if (e.newState === "open") requestAnimationFrame(place);
        }}
        onToggle={onToggle}
        className={cn(
          "fixed inset-auto m-0 min-w-56 max-w-[min(360px,calc(100vw-16px))] rounded-md border border-line bg-raised p-1.5 text-fg shadow-lg",
          "opacity-100 transition-[opacity,translate] duration-(--dur-hover) ease-out-quart starting:-translate-y-1 starting:opacity-0",
          className,
        )}
      >
        {typeof children === "function" ? children({ close }) : children}
      </div>
    </>
  );
}
