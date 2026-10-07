"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/components/ui/cn";
import { useGlide } from "@/components/ui/useGlide";
import type { TocItem } from "./researchHtml";
import { useScrollSpy } from "./useScrollSpy";

export type { TocItem };

type Group = { item: TocItem; children: TocItem[] };

function group(items: readonly TocItem[]): Group[] {
  const out: Group[] = [];
  for (const it of items) {
    if (it.level === 2 || !out.length) out.push({ item: it, children: [] });
    else out[out.length - 1].children.push(it);
  }
  return out;
}

/** "2.1 When HIPAA applies" → ["2.1", "When HIPAA applies"]: the number is set in mono, the words in the UI face. */
function splitNumber(text: string): [string | null, string] {
  const m = /^(\d+(?:\.\d+)*)\.?\s+(.+)$/.exec(text);
  return m ? [m[1], m[2]] : [null, text];
}

function Label({ text, numbered }: { text: string; numbered: boolean }) {
  const [n, words] = splitNumber(text);
  // the number hangs in its own column, so a wrapped title lines up under its first word
  return (
    <span className="flex gap-2">
      {numbered ? (
        <span aria-hidden={!n} className="w-7 shrink-0 pt-px font-mono text-caption text-fg-3 tabular-nums">
          {n}
        </span>
      ) : null}
      <span className="min-w-0">{words}</span>
    </span>
  );
}

/** Which h2 group holds the active id (so its h3s unfold). */
function activeGroupOf(groups: Group[], active: string | null) {
  if (!active) return null;
  return groups.find((g) => g.item.id === active || g.children.some((c) => c.id === active))?.item.id ?? null;
}

export interface TocProps {
  items: readonly TocItem[];
  /** The nav's accessible name and visible label. */
  label?: string;
  /** Scroll-spy line, px from the viewport top. */
  offset?: number;
  className?: string;
}

/**
 * Desktop table of contents (≥ 1024 px): sticky, scrolls by itself, marks the section in view with
 * aria-current="location" and a gliding rule; only the current chapter's h3s unfold.
 */
export function Toc({ items, label = "On this page", offset = 140, className }: TocProps) {
  const groups = useMemo(() => group(items), [items]);
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const numbered = items.some((i) => splitNumber(i.text)[0]);
  const active = useScrollSpy(ids, offset);
  const openGroup = activeGroupOf(groups, active);
  const listRef = useRef<HTMLElement>(null);
  const rule = useRef<HTMLSpanElement>(null);
  useGlide("toc-rule", rule, active);

  // Keep the current entry visible inside the TOC's own scroll box (never scrolls the page).
  useEffect(() => {
    const box = listRef.current;
    const link = active ? box?.querySelector<HTMLElement>(`a[href="#${CSS.escape(active)}"]`) : null;
    if (!box || !link) return;
    const b = box.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    if (r.top < b.top + 48 || r.bottom > b.bottom - 48) box.scrollTo({ top: box.scrollTop + (r.top - b.top) - b.height / 3 });
  }, [active]);

  const link = (it: TocItem, sub = false) => {
    const current = active === it.id;
    return (
      <a
        href={`#${it.id}`}
        aria-current={current ? "location" : undefined}
        className={cn(
          "relative -ml-px block border-l border-transparent py-1.5 pr-2 transition-colors duration-(--dur-hover)",
          sub ? "pl-4 text-caption" : "pl-4 text-small",
          current ? "font-medium text-fg" : "text-fg-2 hover:border-line-strong hover:text-fg",
        )}
      >
        {current ? <span ref={rule} aria-hidden className="absolute inset-y-1 -left-px w-0.5 rounded-full bg-brand" /> : null}
        <Label text={it.text} numbered={numbered} />
      </a>
    );
  };

  return (
    <nav
      ref={listRef}
      aria-label={label}
      data-lenis-prevent
      className={cn("sticky top-24 max-h-[calc(100svh-8rem)] overflow-y-auto overscroll-contain pr-1 pb-6 [scrollbar-width:thin]", className)}
    >
      <p className="mb-3 font-mono text-eyebrow text-fg-3 uppercase">{label}</p>
      <ol data-glide-scope="" className="border-l border-line">
        {groups.map((g) => {
          const open = openGroup === g.item.id;
          return (
            <li key={g.item.id}>
              {link(g.item)}
              {g.children.length ? (
                <div className={cn("grid transition-[grid-template-rows] duration-(--dur-panel) ease-out-quart", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <ol className="overflow-hidden" inert={!open}>
                    {g.children.map((c) => (
                      <li key={c.id}>{link(c, true)}</li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Phones and tablets (< 1024 px): a sticky "On this page" bar under the site nav. Its summary names the section in
 * view; it opens a scrollable list (every heading) and closes when a link is chosen or on Escape.
 */
export function MobileToc({ items, label = "On this page", offset = 140, className }: TocProps) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const numbered = items.some((i) => splitNumber(i.text)[0]);
  const active = useScrollSpy(ids, offset);
  const ref = useRef<HTMLDetailsElement>(null);
  const current = items.find((i) => i.id === active);
  const close = () => {
    if (ref.current) ref.current.open = false;
  };

  return (
    <details
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === "Escape" && ref.current?.open) {
          close();
          ref.current?.querySelector("summary")?.focus();
        }
      }}
      className={cn("group/toc sticky top-[76px] z-(--z-sticky)", className)}
    >
      <summary className="flex min-h-11 bg-surface/95 backdrop-blur-md cursor-pointer list-none items-center gap-3 rounded-full border border-line px-4 shadow-sm [&::-webkit-details-marker]:hidden">
        <span className="shrink-0 font-mono text-eyebrow text-fg-3 uppercase">{label}</span>
        <span aria-hidden className="h-4 w-px shrink-0 bg-line-strong" />
        <span className="min-w-0 flex-1 truncate text-small font-medium text-fg">{current ? splitNumber(current.text)[1] : "Contents"}</span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-fg-3 transition-transform duration-(--dur-ui) group-open/toc:rotate-180" />
      </summary>
      <nav
        aria-label={label}
        data-lenis-prevent
        className="absolute inset-x-0 top-full mt-2 max-h-[60svh] overflow-y-auto overscroll-contain rounded-lg border border-line bg-surface p-2 shadow-lg"
      >
        <ol>
          {items.map((it) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                onClick={close}
                aria-current={active === it.id ? "location" : undefined}
                className={cn(
                  "flex min-h-11 items-center rounded-sm px-3 text-small aria-[current=location]:bg-sunken aria-[current=location]:font-medium aria-[current=location]:text-fg",
                  it.level === 3 ? "pl-6 text-fg-2" : "font-medium text-fg",
                )}
              >
                <span className="min-w-0">
                  <Label text={it.text} numbered={numbered} />
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
