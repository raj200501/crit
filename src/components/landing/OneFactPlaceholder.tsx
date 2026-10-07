"use client";

// TEMPORARY (DESIGN §13 merge order): stands in for P2's <OneFactBeam /> (§9.7) until P2 merges. Same story and copy,
// without the travelling record square. The integrator swaps it in RelativesSection.tsx and deletes this file.
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckboxCard } from "@/components/ui/CheckboxCard";
import { cn } from "@/components/ui/cn";
import { PedigreeGlyph } from "@/components/ui/PedigreeGlyph";

const ROWS = [
  { id: "afib", title: "Atrial fibrillation", since: "on problem list since 2009", cardiac: true },
  { id: "htn", title: "Essential hypertension", since: "since 2015", cardiac: false },
  { id: "allergy", title: "Seasonal allergies", since: "since 1998", cardiac: false },
] as const;

export function OneFactPlaceholder() {
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [shared, setShared] = useState(false);
  const n = picked.size;
  const toggle = (id: string, on: boolean) =>
    setPicked((s) => {
      const next = new Set(s);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  const finding = shared && ROWS.some((r) => r.cardiac && picked.has(r.id));
  const reset = () => {
    setPicked(new Set());
    setShared(false);
  };

  return (
    <div className="bg-dots @container relative rounded-xl border border-line bg-canvas p-3 [--dots-size:20px] sm:p-6">
      <div className="grid gap-4 @min-[36rem]:grid-cols-[minmax(0,1fr)_14rem] @min-[36rem]:items-center @min-[36rem]:gap-6">
        <div className="rounded-lg border border-line bg-surface p-4 shadow-md sm:p-5">
          <p className="text-ui font-strong text-fg">Grandpa Luis&rsquo;s patient portal</p>
          <p className="mt-1 font-mono text-eyebrow text-record uppercase">Demo sandbox · made-up record</p>
          <ul className="mt-4 flex flex-col gap-2">
            {ROWS.map((r) => {
              const left = shared && !picked.has(r.id);
              return (
                <li key={r.id} className={cn("transition-opacity duration-(--dur-panel)", left && "opacity-40")}>
                  <CheckboxCard
                    checked={picked.has(r.id)}
                    onChange={(on) => toggle(r.id, on)}
                    disabled={shared}
                    title={r.title}
                    description={left ? <span className="font-mono text-eyebrow uppercase">Not shared · not stored</span> : r.since}
                    className="disabled:opacity-100"
                  />
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {shared ? (
              <Button variant="secondary" onClick={reset} iconLeft={<RotateCcw />}>
                Reset
              </Button>
            ) : (
              <>
                <Button disabled={n === 0} onClick={() => setShared(true)} aria-describedby={n === 0 ? "one-fact-hint" : undefined}>
                  Share {n} {n === 1 ? "fact" : "facts"} with Alex
                </Button>
                {n === 0 ? (
                  <span id="one-fact-hint" className="text-small text-fg-3">
                    Tick what you want to share
                  </span>
                ) : null}
              </>
            )}
          </div>
        </div>

        <figure className="flex flex-col items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-sm">
          <p className="self-start font-mono text-eyebrow text-fg-3 uppercase">Alex&rsquo;s tree</p>
          <svg
            viewBox="0 0 160 150"
            className="w-full max-w-[11.5rem]"
            role="img"
            aria-label={shared ? "Grandpa Luis now shows as known, from a portal record" : "Grandpa Luis: not asked yet"}
          >
            <g fill="none" stroke="var(--ui-line-strong)" strokeWidth={1.5} strokeLinecap="round">
              <path d="M54 30H106M80 30V66M80 94V107" />
            </g>
            {shared ? (
              <circle
                cx={40}
                cy={30}
                r={22}
                fill="var(--color-evergreen-50)"
                className="motion-safe:animate-ripple [transform-box:fill-box] [transform-origin:center]"
              />
            ) : null}
            <PedigreeGlyph as="g" x={40} y={30} size={40} shape="square" status={shared ? "known" : "pending"} record={shared} finding={finding} />
            <PedigreeGlyph as="g" x={120} y={30} size={40} shape="circle" status="known" finding />
            <PedigreeGlyph as="g" x={80} y={80} size={40} shape="circle" status="known" />
            <PedigreeGlyph as="g" x={80} y={124} size={40} shape="diamond" status="self" />
            <g aria-hidden fill="var(--ui-fg-2)" fontSize={13} fontWeight={500} textAnchor="middle">
              <text x={40} y={64}>
                Luis
              </text>
              <text x={120} y={64}>
                Rosa
              </text>
              <text x={100} y={85} textAnchor="start">
                Mom
              </text>
              <text x={102} y={129} textAnchor="start">
                Alex
              </text>
            </g>
          </svg>
          <figcaption role="status" className="max-w-[16rem] text-center text-small text-fg-2">
            {shared
              ? n === 1
                ? "Grandpa Luis shared one fact from his portal. Only that fact left the page."
                : `Grandpa Luis shared ${n} facts from his portal. Only those facts left the page.`
              : "Grandpa Luis · not asked yet"}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
