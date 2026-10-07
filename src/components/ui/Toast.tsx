"use client";

import { AnimatePresence, m } from "motion/react";
import { Check, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "./cn";
import { DUR, EASE } from "./motion";

export interface ToastOptions {
  title: string;
  body?: string;
  action?: { label: string; onClick(): void };
  tone?: "neutral" | "brand";
}
interface ToastItem extends ToastOptions {
  id: number;
}

const MAX = 3;
const LIFETIME = 6000;
let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Shows a toast in the polite live region. Returns its id (for dismissToast). */
export function toast(options: ToastOptions): number {
  const id = nextId++;
  items = [...items, { ...options, id }].slice(-MAX);
  emit();
  return id;
}

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const EMPTY: ToastItem[] = [];

/** Mounted once in the root layout, inside <MotionProvider> (its m.li needs LazyMotion). Bottom-right; on phones it sits above the app tab bar. */
export function Toaster() {
  const list = useSyncExternalStore(
    subscribe,
    () => items,
    () => EMPTY,
  );
  return (
    <section aria-label="Notifications" className="pointer-events-none fixed right-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-(--z-toast) w-[min(380px,calc(100vw-32px))] md:right-6 md:bottom-6 print:hidden">
      <div role="status" aria-live="polite" aria-atomic="false">
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {list.map((t) => (
              <ToastCard key={t.id} toast={t} />
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </section>
  );
}

function ToastCard({ toast: t }: { toast: ToastItem }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(LIFETIME);
  useEffect(() => {
    if (paused) return;
    const started = performance.now();
    const timer = window.setTimeout(() => dismissToast(t.id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(800, remaining.current - (performance.now() - started));
    };
  }, [paused, t.id]);

  return (
    <m.li
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8, transition: { duration: DUR.ui } }}
      transition={{ duration: DUR.panel, ease: EASE.outQuart }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="glass pointer-events-auto flex items-start gap-3 rounded-md border border-line p-3.5 pr-2 text-fg shadow-lg"
    >
      {t.tone === "brand" ? (
        <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-evergreen-600 text-white">
          <Check className="size-3.5" strokeWidth={2.5} />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-ui font-strong text-fg">{t.title}</p>
        {t.body ? <p className="mt-0.5 text-small text-fg-2">{t.body}</p> : null}
        {t.action ? (
          <button
            type="button"
            onClick={() => {
              t.action?.onClick();
              dismissToast(t.id);
            }}
            className="-mb-2 -ml-1 inline-flex min-h-11 items-center rounded-xs px-1 text-small font-medium text-brand underline-offset-4 hover:underline"
          >
            {t.action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismissToast(t.id)}
        className={cn("-my-1.5 grid size-11 shrink-0 place-items-center rounded-full text-fg-3 transition-colors hover:bg-sunken hover:text-fg")}
      >
        <X className="size-4" aria-hidden />
      </button>
    </m.li>
  );
}
