"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

type Box = { top: number; left: number; width: number; height: number };

interface Callout {
  title: string;
  body: ReactNode;
  /** Finds the part of the document this callout points at (text-based, so it survives the document's restyle). */
  find: (root: HTMLElement) => Element[];
}

const HEADINGS = "h1, h2, h3, h4, h5, h6, [role=heading]";

function headingMatching(root: HTMLElement, re: RegExp): HTMLElement | null {
  return [...root.querySelectorAll<HTMLElement>(HEADINGS)].find((h) => re.test((h.textContent ?? "").trim())) ?? null;
}

/** The innermost element whose own text starts with `re` (e.g. the cell that says "Portal record …"). */
function elementWithText(root: HTMLElement, re: RegExp): HTMLElement | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (re.test((n.textContent ?? "").trim())) return n.parentElement;
  }
  return null;
}

const visible = <T extends Element>(el: T | null | undefined): el is T => Boolean(el && el.getClientRects().length);

/** DESIGN §10.1.2: five numbered callouts on the real care-team sheet. */
const CALLOUTS: Callout[] = [
  {
    title: "For clinician review.",
    body: (
      <>
        Rule-based criteria, each with its guideline and year. At most three rows.
        <span className="mt-1.5 block font-medium text-fg">Doesn&rsquo;t diagnose. Doesn&rsquo;t score risk. A clinician decides what matters.</span>
      </>
    ),
    find: (root) => {
      const h = headingMatching(root, /^For clinician review/i);
      if (!h) return [];
      const basis = elementWithText(root, /^Basis:/);
      const row = basis?.closest("li") ?? basis;
      return [h, row ?? h.nextElementSibling].filter(visible);
    },
  },
  {
    title: "Gaps and conflicts.",
    body: "Mom says heart attack at 60; Uncle Dev says angina at about 58. Both kept.",
    find: (root) => {
      const h = headingMatching(root, /^(Gaps and conflicts|To clarify|Still to confirm)/i);
      return h ? [h, h.nextElementSibling].filter(visible) : [];
    },
  },
  {
    title: "A three-generation pedigree",
    body: "with NSGC symbols and a legend.",
    find: (root) => {
      const svg = [...root.querySelectorAll("svg")].find((s) => s.getBoundingClientRect().width >= 120);
      const legend = root.querySelector('[aria-label="Legend"]');
      return [svg, legend].filter(visible);
    },
  },
  {
    title: "The relative table in the order your EHR uses:",
    body: "Relation · Problem · Age at onset · Source · Comments.",
    find: (root) => {
      const table = root.querySelector("table");
      const head = table?.querySelector("thead");
      return [visible(head) ? head : table].filter(visible);
    },
  },
  {
    title: "A source on every fact:",
    body: "self-reported, reported by a named relative, or from a portal record with its date.",
    find: (root) => {
      const el = elementWithText(root, /^Portal record/i) ?? elementWithText(root, /^(Reported by|Self-reported)/i);
      return [el].filter(visible);
    },
  },
];

function unionBox(els: Element[], base: DOMRect): Box | null {
  if (!els.length) return null;
  let top = Infinity;
  let left = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    top = Math.min(top, r.top);
    left = Math.min(left, r.left);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  if (!Number.isFinite(top)) return null;
  return { top: top - base.top, left: left - base.left, width: right - left, height: bottom - top };
}

/**
 * The real care-team document with numbered markers and a side list of what each part is for. Hovering, focusing or
 * choosing a callout glides one highlight ring to that part of the sheet (instant under reduced motion); on phones
 * the list sits under the sheet and choosing a callout scrolls its part into view.
 */
export function AnnotatedDocument({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  const frameRef = useRef<HTMLElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<(Box | null)[]>(() => CALLOUTS.map(() => null));
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);
  const uid = useId();

  useEffect(() => {
    const frame = frameRef.current;
    const doc = docRef.current;
    if (!frame || !doc) return;
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const base = frame.getBoundingClientRect();
        setWidth(base.width);
        setBoxes(CALLOUTS.map((c) => unionBox(c.find(doc), base)));
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const show = (i: number, scroll = false) => {
    setActive(i);
    const b = boxes[i];
    const frame = frameRef.current;
    if (!scroll || !b || !frame) return;
    const top = frame.getBoundingClientRect().top + b.top;
    if (top > 96 && top + Math.min(b.height, 200) < window.innerHeight) return; // already in view
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: window.scrollY + top - 140, behavior: reduce ? "auto" : "smooth" });
  };

  const current = boxes[active];
  // Markers line up in one rail in the sheet's left margin (the text column's left edge − 38 px), level with their
  // part; when the margin is too narrow (phones) the rail straddles the sheet's edge.
  const textLeft = Math.min(...boxes.filter((b): b is Box => Boolean(b)).map((b) => b.left), Infinity);
  const railX = Number.isFinite(textLeft) && textLeft >= 44 ? textLeft - 38 : -12;
  const markerAt = (b: Box) => ({ left: railX, top: b.top - 1 });

  return (
    <div className={cn("grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_24rem]", className)}>
      <figure ref={frameRef} aria-label={label} className="relative min-w-0">
        {/* The real, readable document. The caller renders it with a headingLevel that fits this page's outline
            (SummaryDocument headingLevel={3} under the section's h2), so screen readers get it in place. */}
        <div ref={docRef} className="relative rounded-paper bg-white shadow-paper [&_article]:border-0! [&_article]:shadow-none!">
          {children}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {current ? (
            <div
              className="absolute rounded-[12px] bg-lumen/12 ring-2 ring-brand shadow-[0_0_0_6px_rgb(127_230_197/0.25)] transition-[top,left,width,height] duration-(--dur-panel) ease-emph motion-reduce:transition-none"
              style={{
                top: current.top - 7,
                left: Math.max(0, current.left - 10),
                width: Math.min(current.width + 20, width - Math.max(0, current.left - 10)),
                height: current.height + 14,
              }}
            />
          ) : null}
          {boxes.map((b, i) =>
            b ? (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                onClick={() => show(i)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "pointer-events-auto absolute grid size-7 cursor-pointer place-items-center rounded-full font-mono text-caption font-medium tabular-nums shadow-sm ring-2 ring-white transition-[background-color,color,scale] duration-(--dur-ui)",
                  active === i ? "scale-110 bg-cta text-cta-fg" : "bg-evergreen-50 text-known-ink hover:bg-evergreen-600 hover:text-white",
                )}
                style={markerAt(b)}
              >
                {i + 1}
              </button>
            ) : null,
          )}
        </div>
      </figure>

      <div className="min-w-0">
        <ol className="flex flex-col gap-1.5 lg:sticky lg:top-28" aria-label="What's on the care-team page">
          {CALLOUTS.map((c, i) => {
            const on = active === i;
            return (
              <li key={c.title}>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-labelledby={`${uid}-t${i}`}
                  aria-describedby={`${uid}-b${i}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => show(i, true)}
                  className={cn(
                    "group flex w-full cursor-pointer gap-4 rounded-lg border p-4 text-left transition-[background-color,border-color,box-shadow] duration-(--dur-ui) sm:p-5",
                    on ? "border-line bg-surface shadow-md" : "border-transparent hover:bg-surface/70",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full font-mono text-caption font-medium tabular-nums transition-colors duration-(--dur-ui)",
                      on ? "bg-cta text-cta-fg" : "bg-evergreen-50 text-known-ink",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span id={`${uid}-t${i}`} className="text-ui font-strong text-fg">
                      {c.title}
                    </span>
                    <span id={`${uid}-b${i}`} className="text-small text-fg-2">
                      {c.body}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
