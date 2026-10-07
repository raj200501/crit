"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";
import { popModal, pushModal } from "./modalStack";
import { cn } from "./cn";
import { useMediaQuery } from "./useMediaQuery";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** auto: bottom under 1024 px, right at ≥ 1024 px. full: a full-screen overlay (e.g. the check-in QR). */
  side?: "bottom" | "right" | "auto" | "full";
  /** id of the element that names the sheet (preferred), or a plain `label`. */
  labelledBy?: string;
  label?: string;
  /** Bottom sheet snap points as fractions of the viewport height (default [0.55, 0.92]). */
  snap?: number[];
  /** Where focus goes on close (default: whatever was focused when it opened). */
  returnFocusTo?: RefObject<HTMLElement | null>;
  children?: ReactNode;
  footer?: ReactNode;
  /** night: the sheet uses the night theme; its scrim is black/60 (night/94 for side="full", e.g. the check-in QR). */
  tone?: "paper" | "night";
  /** Shows a Close (X) button in the corner. Default true. */
  showClose?: boolean;
  /** Render children while closed (default false: children mount when it opens). */
  keepMounted?: boolean;
  className?: string;
}

type Phase = "closed" | "opening" | "open" | "closing";
const DUR_MS = 280;

/**
 * Native <dialog> + showModal(): focus trap, inert background, Esc. Bottom sheets drag by the grabber
 * (snap to the nearest point, dismiss below 30% of the viewport). Restores focus on close. Reduced motion: no travel.
 */
export function Sheet({
  open,
  onClose,
  side = "auto",
  labelledBy,
  label,
  snap = [0.55, 0.92],
  returnFocusTo,
  children,
  footer,
  tone = "paper",
  showClose = true,
  keepMounted = false,
  className,
}: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const drag = useRef<{ startY: number; startOffset: number; offset: number } | null>(null);
  const [phase, setPhase] = useState<Phase>("closed");
  const [snapIndex, setSnapIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const wide = useMediaQuery("(min-width: 1024px)");
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const resolved = side === "auto" ? (wide ? "right" : "bottom") : side;
  const maxSnap = Math.max(...snap);

  // open / close the native dialog in step with the `open` prop
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
      pushModal(d);
      document.documentElement.style.overflow = "hidden";
      const raf = requestAnimationFrame(() => {
        setSnapIndex(0);
        setPhase(reduce ? "open" : "opening");
        requestAnimationFrame(() => setPhase("open"));
      });
      return () => cancelAnimationFrame(raf);
    }
    if (open && d.open) {
      // reopened while closing
      const raf = requestAnimationFrame(() => setPhase("open"));
      return () => cancelAnimationFrame(raf);
    }
    if (!open && d.open) {
      const finishClose = () => {
        if (d.open) d.close();
        popModal(d);
        document.documentElement.style.removeProperty("overflow");
        setPhase("closed");
        const target = returnFocusTo?.current ?? opener.current;
        if (target && target.isConnected) target.focus({ preventScroll: true });
      };
      const raf = requestAnimationFrame(() => setPhase("closing"));
      const t = window.setTimeout(finishClose, reduce ? 0 : DUR_MS);
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(t);
      };
    }
  }, [open, reduce, returnFocusTo]);

  // unmounting while open: release the page
  useEffect(() => {
    const d = dialogRef.current;
    return () => {
      if (d) popModal(d);
      document.documentElement.style.removeProperty("overflow");
    };
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (resolved !== "bottom" || !panelRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const h = panelRef.current.getBoundingClientRect().height;
    const visible = (snap[snapIndex] / maxSnap) * h;
    drag.current = { startY: e.clientY, startOffset: h - visible, offset: h - visible };
    setDragOffset(h - visible);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = drag.current;
    if (!s) return;
    s.offset = Math.max(0, s.startOffset + (e.clientY - s.startY));
    setDragOffset(s.offset);
  };
  const onPointerUp = () => {
    const s = drag.current;
    const panel = panelRef.current;
    drag.current = null;
    setDragOffset(null);
    if (!s || !panel) return;
    const h = panel.getBoundingClientRect().height;
    const visibleFraction = ((h - s.offset) / window.innerHeight);
    if (visibleFraction < 0.3) {
      onClose();
      return;
    }
    let best = 0;
    snap.forEach((p, i) => {
      if (Math.abs(p - visibleFraction) < Math.abs(snap[best] - visibleFraction)) best = i;
    });
    setSnapIndex(best);
  };

  const shown = phase === "open";
  let transform: string | undefined;
  if (resolved === "bottom") {
    const restOffset = `${(1 - snap[snapIndex] / maxSnap) * 100}%`;
    transform = dragOffset !== null ? `translateY(${dragOffset}px)` : shown ? `translateY(${restOffset})` : "translateY(100%)";
  } else if (resolved === "right") {
    transform = shown ? "translateX(0)" : "translateX(100%)";
  } else {
    transform = shown ? "scale(1)" : "scale(0.98)";
  }
  const mounted = keepMounted || phase !== "closed" || open;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      // always explicit: a paper sheet opened from a night band (e.g. the SiteNav menu over the footer) stays paper
      data-theme={tone}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        // overflow-clip, not -hidden: showModal() focuses the (still off-screen) scroll body, and a scroll container
        // would scroll itself to reveal it, so a bottom sheet would open at its tallest snap with blank space below.
        "fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-clip bg-transparent p-0 text-fg",
        "backdrop:bg-transparent",
        "transition-[background-color] duration-[280ms]",
        shown ? (tone === "night" ? (resolved === "full" ? "bg-night/94" : "bg-black/60") : "bg-ink/40") : "bg-transparent",
      )}
    >
      <div
        ref={panelRef}
        style={{ transform, ...(resolved === "bottom" ? { height: `${maxSnap * 100}dvh` } : {}) }}
        className={cn(
          "absolute flex flex-col bg-raised text-fg shadow-lg",
          dragOffset === null && "transition-[transform,opacity] duration-[280ms] ease-emph motion-reduce:transition-none",
          resolved === "bottom" && "inset-x-0 bottom-0 rounded-t-xl",
          resolved === "right" && "inset-y-0 right-0 w-[420px] max-w-full border-l border-line",
          resolved === "full" && "inset-0 overflow-auto bg-transparent shadow-none",
          resolved === "full" && (shown ? "opacity-100" : "opacity-0"),
          className,
        )}
      >
        <div
          className="flex min-h-0 flex-col"
          style={{ height: resolved === "bottom" ? `${(dragOffset === null ? snap[snapIndex] : maxSnap) * 100}dvh` : "100%" }}
        >
          {resolved === "bottom" ? (
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
            >
              <span aria-hidden className="h-1.5 w-10 rounded-full bg-fg/20" />
            </div>
          ) : null}
          <div
            data-lenis-prevent
            className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", resolved === "right" ? "px-6 pt-6 pb-6" : resolved !== "full" && "px-5 pt-2 pb-5")}
          >
            {mounted ? children : null}
          </div>
          {footer && mounted ? (
            <div className={cn("shrink-0 border-t border-line pt-3 pb-[max(12px,env(safe-area-inset-bottom))]", resolved === "right" ? "px-6" : "px-5")}>{footer}</div>
          ) : null}
        </div>
        {showClose ? (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 grid size-11 place-items-center rounded-full text-fg-2 transition-colors hover:bg-sunken hover:text-fg"
          >
            <X aria-hidden className="size-5" />
          </button>
        ) : null}
      </div>
    </dialog>
  );
}
