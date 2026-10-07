"use client";

import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { FamilyTree } from "@/lib/types";
import { cn } from "@/components/ui/cn";
import { formatVisitDate, type ReadyItem } from "./model";

/** Four quarter arcs, one per checklist item: progress toward the visit, never a score about health. */
export function ReadyRing({ done, total = 4, size = 28, className }: { done: number; total?: number; size?: number; className?: string }) {
  const stroke = size >= 40 ? 4 : 3;
  const r = size / 2 - stroke / 2 - 0.5;
  const c = size / 2;
  const gap = total > 1 ? 14 : 0; // degrees between segments
  const arc = (i: number) => {
    const a1 = ((-90 + (i * 360) / total + gap / 2) * Math.PI) / 180;
    const a2 = ((-90 + ((i + 1) * 360) / total - gap / 2) * Math.PI) / 180;
    const p = (a: number) => `${(c + r * Math.cos(a)).toFixed(3)} ${(c + r * Math.sin(a)).toFixed(3)}`;
    return `M${p(a1)} A${r} ${r} 0 0 1 ${p(a2)}`;
  };
  return (
    <svg aria-hidden width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" className={cn("shrink-0", className)}>
      {Array.from({ length: total }, (_, i) => (
        <path
          key={i}
          d={arc(i)}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={cn("transition-[stroke] duration-(--dur-reveal)", i < done ? "stroke-evergreen-600" : "stroke-mist-2")}
        />
      ))}
    </svg>
  );
}

export interface VisitReadyProps {
  tree: FamilyTree;
  items: ReadyItem[];
  /** Opens the item's person in the right panel mode. */
  onOpen: (personId: string, mode: "answer" | "edit" | "invite", field?: "age" | "cause") => void;
}

/** The visit-ready checklist (DESIGN §12.1): four steps toward the visit, each linking to where you'd do it. */
export function VisitReadyCard({ tree, items, onOpen }: VisitReadyProps) {
  const done = items.filter((i) => i.done).length;
  const all = done === items.length;
  return (
    <section aria-labelledby="ready-title" className="relative isolate overflow-hidden rounded-lg border border-line bg-surface p-5 shadow-xs">
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 -z-10 size-56 rounded-full bg-aurora-mint/70 blur-3xl" />
      <div className="flex items-center gap-4">
        <div className="relative grid place-items-center">
          <ReadyRing done={done} total={items.length} size={56} />
          <span aria-hidden className="absolute font-mono text-small font-medium text-fg tabular-nums">
            {done}/{items.length}
          </span>
        </div>
        <div className="min-w-0">
          <h2 id="ready-title" className="text-title font-strong text-fg">
            {all ? "You’re visit-ready" : "Get visit-ready"}
          </h2>
          <p className="text-small text-fg-2">
            {done} of {items.length} done
            {tree.visit ? ` · ${tree.visit.specialty} visit ${formatVisitDate(tree.visit.date)}` : ""}
          </p>
        </div>
      </div>
      {all ? <p className="mt-3 text-small text-fg-2">You can still add answers as relatives reply.</p> : null}
      <ol className="mt-4 flex flex-col gap-0.5">
        {items.map((it) => {
          const body = (
            <>
              <span
                aria-hidden
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-(--dur-ui)",
                  it.done ? "bg-evergreen-600 text-white" : "border-[1.5px] border-dashed border-ink-4 text-transparent",
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span className={cn("min-w-0 flex-1 text-small", it.done ? "text-fg-2" : "font-medium text-fg")}>
                {it.label}
                <span className="sr-only">{it.done ? " (done)" : " (to do)"}</span>
              </span>
              <ChevronRight aria-hidden className="size-4 shrink-0 text-fg-3 transition-transform duration-(--dur-hover) group-hover/item:translate-x-0.5" />
            </>
          );
          const cls =
            "group/item -mx-2 flex min-h-11 w-[calc(100%+1rem)] cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-left transition-colors duration-(--dur-hover) hover:bg-sunken";
          const t = it.target;
          return (
            <li key={it.key}>
              {!t ? (
                <span className={cn(cls, "cursor-default hover:bg-transparent")}>{body}</span>
              ) : "href" in t ? (
                <Link href={t.href} className={cls}>
                  {body}
                </Link>
              ) : (
                <button type="button" className={cls} onClick={() => onOpen(t.personId, t.mode, t.field)}>
                  {body}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
