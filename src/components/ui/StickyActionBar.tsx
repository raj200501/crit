"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { cn } from "./cn";

// Sticky bottom chrome publishes how much of the viewport bottom it covers as --fht-sticky-h on <html>, and globals.css
// turns that into scroll-padding-bottom. Focus scrolling then keeps a focused control clear of the bar (WCAG 2.4.11).
const covers = new Map<HTMLElement, number>();
function publish() {
  const h = Math.max(0, ...covers.values());
  if (h > 0) document.documentElement.style.setProperty("--fht-sticky-h", `${h}px`);
  else document.documentElement.style.removeProperty("--fht-sticky-h");
}

/** Registers a sticky/fixed bottom element: its height plus its `bottom` offset (0 while it's display:none). */
export function useStickyInset(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const h = el.offsetHeight;
      covers.set(el, h ? Math.round(h + (parseFloat(getComputedStyle(el).bottom) || 0)) : 0);
      publish();
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      covers.delete(el);
      publish();
    };
  }, [ref]);
}

/** Sticks to the bottom of its scroll container, above the safe area. On desktop, put it inside the card. */
export function StickyActionBar({ children, className }: { children?: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useStickyInset(ref);
  return (
    <div
      ref={ref}
      data-sticky-actions=""
      className={cn(
        "sticky bottom-0 z-(--z-sticky) flex flex-col gap-2 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
