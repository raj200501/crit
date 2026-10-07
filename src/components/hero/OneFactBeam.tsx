"use client";

// "One fact, one beam" (DESIGN §9.7): the relative's portal shows a few (made-up) problems, nothing is pre-ticked, and
// only what the visitor ticks travels to the tree, as a record-blue square along a dashed path. SVG + motion, no second
// WebGL context. Everything is placed in viewBox units (no DOM measuring); the record card is HTML in % of the box.

import { animate } from "motion/react";
import { Check, Link2, Minus, RotateCcw, Send } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/components/ui/cn";
import { EASE, prefersReducedMotion } from "@/components/ui/motion";
import { PedigreeGlyph, type GlyphShape, type GlyphStatus } from "@/components/ui/PedigreeGlyph";

// Names and record rows match the synthetic demo family (src/lib/demo.ts; checked in tests/story.test.ts).
export const BEAM = {
  relative: "Grandpa Luis",
  asker: "Alex",
  rows: [
    { id: "afib", label: "Atrial fibrillation", since: "on problem list since 2009", heart: true },
    { id: "htn", label: "Essential hypertension", since: "since 2015", heart: false },
    { id: "allergy", label: "Seasonal allergies", since: "since 1998", heart: false },
  ],
} as const;

type RowId = (typeof BEAM.rows)[number]["id"];
type Phase = "idle" | "sending" | "done";

interface Spot {
  id: string;
  name: string;
  shape: GlyphShape;
  x: number;
  y: number;
  /** Where the name goes (default: the layout's). */
  label?: "below" | "right";
}
// Two layouts in viewBox units: wide (≥ 768 px, 640 × 360) and narrow (phones, 360 × 572).
const WIDE = {
  w: 640,
  h: 360,
  spots: [
    { id: "luis", name: "Grandpa Luis", shape: "square", x: 446, y: 92 },
    { id: "rosa", name: "Grandma Rosa", shape: "circle", x: 570, y: 92 },
    { id: "mom", name: "Mom", shape: "circle", x: 508, y: 196 },
    { id: "alex", name: "Alex (you)", shape: "diamond", x: 508, y: 292 },
  ] as Spot[],
  path: "M 326 318 C 388 318, 382 92, 424 92",
  labelBelow: true,
};
// Narrow: every glyph and label sits ≥ 12 px inside the mist panel (which starts at 64% of the box); names and status
// words stack on two lines, so the grandparents' labels never reach the panel's edges.
const NARROW = {
  w: 360,
  h: 572,
  spots: [
    { id: "luis", name: "Grandpa Luis", shape: "square", x: 104, y: 394, label: "below" },
    { id: "rosa", name: "Grandma Rosa", shape: "circle", x: 256, y: 394, label: "below" },
    { id: "mom", name: "Mom", shape: "circle", x: 180, y: 484 },
    { id: "alex", name: "Alex (you)", shape: "diamond", x: 180, y: 532 },
  ] as Spot[],
  path: "M 180 343 C 180 366, 108 356, 104 374",
  labelBelow: false,
};
type Layout = typeof WIDE;

const GLYPH = 34;

function Pedigree({ L, luis, phase, ripple, squareRef, pathRef, trailRef }: {
  L: Layout;
  luis: { status: GlyphStatus; record: boolean; finding: boolean };
  phase: Phase;
  ripple: boolean;
  squareRef?: React.Ref<SVGRectElement>;
  pathRef?: React.Ref<SVGPathElement>;
  trailRef?: React.Ref<SVGPathElement>;
}) {
  const [l, r, m, a] = L.spots;
  const knotY = l.y + 14;
  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true" focusable="false">
      {/* pedigree lines */}
      <g stroke="var(--color-ink)" strokeOpacity={0.28} strokeWidth={1.5} fill="none" strokeLinecap="round">
        <path d={`M ${l.x + 15} ${l.y} H ${r.x - 15}`} />
        <path d={`M ${(l.x + r.x) / 2} ${l.y} V ${knotY} M ${(l.x + r.x) / 2} ${knotY} V ${m.y - 15}`} />
        <path d={`M ${m.x} ${m.y + 15} V ${a.y - 17}`} />
        {/* Dad's side continues off the card */}
        <path d={`M ${m.x - 15} ${m.y} H ${m.x - 64}`} strokeDasharray="2 5" />
      </g>
      {/* the beam's path: faint until a fact travels, then drawn behind the square */}
      <path ref={pathRef} d={L.path} fill="none" stroke="var(--color-record)" strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="3 6" strokeLinecap="round" />
      <path
        ref={trailRef}
        d={L.path}
        pathLength={1}
        fill="none"
        stroke="var(--color-record)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="1 1"
        strokeDashoffset={phase === "done" ? 0 : 1}
        opacity={phase === "idle" ? 0 : 0.85}
      />
      {/* ripple once when the fact lands */}
      {ripple ? (
        <circle cx={l.x} cy={l.y} r={22} fill="none" stroke="var(--color-record)" strokeWidth={2} className="motion-safe:animate-ripple [transform-box:fill-box] [transform-origin:center]" />
      ) : null}
      <PedigreeGlyph as="g" x={l.x} y={l.y} size={GLYPH} shape="square" status={luis.status} record={luis.record} finding={luis.finding} />
      <PedigreeGlyph as="g" x={r.x} y={r.y} size={GLYPH} shape="circle" status="known" finding />
      <PedigreeGlyph as="g" x={m.x} y={m.y} size={GLYPH} shape="circle" status="known" />
      <PedigreeGlyph as="g" x={a.x} y={a.y} size={GLYPH} shape="diamond" status="self" proband />
      {/* the travelling fact: a 10 px record-blue square */}
      <rect ref={squareRef} x={-5} y={-5} width={10} height={10} rx={1.5} fill="var(--color-record)" opacity={phase === "sending" ? 1 : 0} style={{ filter: "drop-shadow(0 0 6px rgb(43 79 199 / .55))" }} />
    </svg>
  );
}

export function OneFactBeam() {
  const uid = useId();
  const [ticked, setTicked] = useState<Set<RowId>>(() => new Set());
  const [phase, setPhase] = useState<Phase>("idle");
  const [shared, setShared] = useState<RowId[]>([]);
  const [ripple, setRipple] = useState(false);
  const wideSquare = useRef<SVGRectElement>(null);
  const widePath = useRef<SVGPathElement>(null);
  const wideTrail = useRef<SVGPathElement>(null);
  const narrowSquare = useRef<SVGRectElement>(null);
  const narrowPath = useRef<SVGPathElement>(null);
  const narrowTrail = useRef<SVGPathElement>(null);
  const firstBox = useRef<HTMLInputElement>(null);
  const resetBtn = useRef<HTMLButtonElement>(null);
  const shareBtn = useRef<HTMLButtonElement>(null);
  const anim = useRef<{ stop(): void } | null>(null);
  const focusAfter = useRef<"reset" | "first" | null>(null);

  const n = ticked.size;
  const heart = shared.some((id) => BEAM.rows.find((r) => r.id === id)?.heart);
  const luis =
    phase === "done" ? { status: "known" as const, record: true, finding: heart } : { status: "pending" as const, record: false, finding: false };
  const hintId = `${uid}-hint`;

  useEffect(() => {
    if (focusAfter.current === "reset") resetBtn.current?.focus();
    if (focusAfter.current === "first") firstBox.current?.focus();
    focusAfter.current = null;
  }, [phase]);
  useEffect(() => () => anim.current?.stop(), []);

  const land = (ids: RowId[]) => {
    setShared(ids);
    setPhase("done");
    setRipple(!prefersReducedMotion());
    focusAfter.current = "reset";
  };

  const share = () => {
    if (!n || phase !== "idle") return;
    const ids = BEAM.rows.filter((r) => ticked.has(r.id)).map((r) => r.id);
    if (prefersReducedMotion()) return land(ids); // instant: no travel, no ripple
    setPhase("sending");
    const tracks = [
      { sq: wideSquare.current, path: widePath.current, trail: wideTrail.current },
      { sq: narrowSquare.current, path: narrowPath.current, trail: narrowTrail.current },
    ]
      .filter((t) => t.sq && t.path && t.path.getClientRects().length > 0); // only the layout on screen
    const lens = tracks.map((t) => t.path!.getTotalLength());
    anim.current = animate(0, 1, {
      duration: 0.9,
      ease: EASE.outExpo as unknown as [number, number, number, number],
      onUpdate: (v) => {
        tracks.forEach((t, i) => {
          const pt = t.path!.getPointAtLength(v * lens[i]);
          t.sq!.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${(v * 90).toFixed(1)})`);
          t.trail?.setAttribute("stroke-dashoffset", String(1 - v));
        });
      },
      onComplete: () => land(ids),
    });
  };

  const reset = () => {
    anim.current?.stop();
    setTicked(new Set());
    setShared([]);
    setRipple(false);
    setPhase("idle");
    focusAfter.current = "first";
  };

  const toggle = (id: RowId, on: boolean) =>
    setTicked((cur) => {
      const next = new Set(cur);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const caption =
    phase === "done"
      ? shared.length === 1
        ? `${BEAM.relative} shared one fact from his portal. Only that fact left the page.`
        : `${BEAM.relative} shared ${shared.length} facts from his portal. Only those facts left the page.`
      : "";

  const card = (
    <div className="flex h-full flex-col rounded-lg border border-line bg-surface p-4 shadow-md sm:p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-sm bg-record-bg text-record">
          <Link2 className="size-[18px]" strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <p className="text-ui font-strong text-fg">{BEAM.relative}’s patient portal</p>
          <p className="font-mono text-eyebrow font-medium tracking-[0.08em] text-fg-3 uppercase">Demo sandbox · made-up record</p>
        </div>
      </div>
      {phase === "done" ? (
        // After sharing: a plain record of what left and what didn't (no dimmed, disabled checkboxes).
        <ul className="mt-3 divide-y divide-line" aria-label={`What ${BEAM.relative} shared`}>
          {BEAM.rows.map((r) => {
            const went = shared.includes(r.id);
            return (
              <li key={r.id} className="flex min-h-11 items-center gap-3 py-1.5">
                <span
                  aria-hidden
                  className={cn("grid size-5 shrink-0 place-items-center rounded-[5px]", went ? "bg-record text-white" : "border border-line-strong text-fg-3")}
                >
                  {went ? <Check className="size-3.5" strokeWidth={3} /> : <Minus className="size-3" strokeWidth={2.5} />}
                </span>
                {/* rows that stayed behind read quieter by colour, not opacity (AA contrast); the Minus box and the tag say it */}
                <span className="block min-w-0 flex-1 leading-tight">
                  <span className={cn("block text-ui", went ? "text-fg" : "text-fg-2")}>{r.label}</span>
                  <span className="block text-caption text-fg-3">{r.since}</span>
                </span>
                <span
                  className={cn(
                    "shrink-0 text-right font-mono text-eyebrow leading-tight font-medium tracking-[0.06em] uppercase",
                    went ? "text-record" : "max-w-[7.5rem] text-fg-2",
                  )}
                >
                  {went ? "Shared" : "Not shared · not stored"}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <fieldset className="mt-3 min-w-0" disabled={phase !== "idle"}>
          <legend className="sr-only">
            Problems in {BEAM.relative}’s record. Tick what to share with {BEAM.asker}.
          </legend>
          <ul className="divide-y divide-line">
            {BEAM.rows.map((r, i) => (
              <li key={r.id}>
                <Checkbox
                  ref={i === 0 ? firstBox : undefined}
                  checked={ticked.has(r.id)}
                  onChange={(e) => toggle(r.id, e.currentTarget.checked)}
                  className="w-full py-0.5"
                  label={
                    <span className="block min-w-0 leading-tight">
                      <span className="block text-ui text-fg">{r.label}</span>
                      <span className="block text-caption text-fg-3">{r.since}</span>
                    </span>
                  }
                />
              </li>
            ))}
          </ul>
        </fieldset>
      )}
      <div className="mt-auto pt-3">
        {phase === "done" ? (
          <Button ref={resetBtn} variant="secondary" size="md" iconLeft={<RotateCcw />} onClick={reset} className="max-sm:w-full">
            Reset
          </Button>
        ) : (
          <>
            <Button
              ref={shareBtn}
              variant="primary"
              size="md"
              iconLeft={<Send />}
              onClick={share}
              disabled={n === 0}
              loading={phase === "sending"}
              aria-describedby={n === 0 ? hintId : undefined}
              className="max-sm:w-full"
            >
              {n === 0 ? `Share with ${BEAM.asker}` : `Share ${n} fact${n === 1 ? "" : "s"} with ${BEAM.asker}`}
            </Button>
            <p id={hintId} className={cn("mt-2 text-caption text-fg-3", n > 0 && "invisible")}>
              Tick what you want to share. Nothing is ticked for you.
            </p>
          </>
        )}
      </div>
    </div>
  );

  const label = (s: Spot, L: Layout) => {
    const isLuis = s.id === "luis";
    const done = isLuis && phase === "done";
    const word = isLuis ? (done ? "Known" : "Not asked yet") : s.id === "alex" ? "" : "Known";
    const below = (s.label ?? (L.labelBelow ? "below" : "right")) === "below";
    const style = below
      ? { left: `${(s.x / L.w) * 100}%`, top: `${((s.y + 24) / L.h) * 100}%`, translate: "-50% 0" }
      : { left: `${((s.x + 24) / L.w) * 100}%`, top: `${(s.y / L.h) * 100}%`, translate: "0 -50%" };
    return (
      <span key={s.id} className="absolute grid justify-items-start whitespace-nowrap data-[below]:justify-items-center" data-below={below || undefined} style={style}>
        <span className={cn("text-caption font-medium text-fg", done && "text-record")}>{s.name}</span>
        {word ? <span className={cn("text-caption text-fg-3", done && "font-medium text-record")}>{word}</span> : null}
        {done ? <span className="text-caption text-record">{L.labelBelow ? "from a portal record (demo)" : "from a portal record"}</span> : null}
      </span>
    );
  };

  return (
    <figure className="m-0 w-full" aria-labelledby={`${uid}-cap`}>
      {/* One box: 360 × 572 on phones (card on top, pedigree below), 16:9 from 768 px (card left, pedigree right). */}
      <div className="relative aspect-[360/572] w-full md:aspect-[16/9]">
        <div className="absolute inset-x-0 top-[64%] bottom-0 rounded-lg bg-mist/60 bg-dots [--dots-size:20px] md:inset-y-0 md:right-0 md:left-[55%]" aria-hidden="true" />
        <div className="hidden md:contents">
          <Pedigree L={WIDE} luis={luis} phase={phase} ripple={ripple} squareRef={wideSquare} pathRef={widePath} trailRef={wideTrail} />
          <div className="pointer-events-none absolute inset-0">{WIDE.spots.map((s) => label(s, WIDE))}</div>
        </div>
        <div className="contents md:hidden">
          <Pedigree L={NARROW} luis={luis} phase={phase} ripple={ripple} squareRef={narrowSquare} pathRef={narrowPath} trailRef={narrowTrail} />
          <div className="pointer-events-none absolute inset-0">{NARROW.spots.map((s) => label(s, NARROW))}</div>
        </div>
        <div className="absolute inset-x-0 top-0 h-[60%] md:right-auto md:h-full md:w-[50%]">{card}</div>
      </div>
      <figcaption id={`${uid}-cap`} className="mt-3 min-h-6 text-small text-fg-2">
        <span role="status">{caption}</span>
        {phase !== "done" ? <span>Only the facts you tick leave the portal. Everything else is discarded on the page.</span> : null}
      </figcaption>
    </figure>
  );
}

export default OneFactBeam;
