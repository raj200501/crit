import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/components/ui/cn";
import { PedigreeGlyph } from "@/components/ui/PedigreeGlyph";
import { STATUS_LABEL } from "@/components/ui/status";
import type { PersonReceipt } from "./receipts";

// A static night pedigree of the demo family, built from P1's PedigreeGlyph. It stands in for P2's three.js window
// (HeroStage) and its HeroPoster until P2 merges. Stage coordinates: a 100 × 80 box (the window's 5:4 stage).
const POS: Record<string, { x: number; y: number; short: string; order: number }> = {
  pgf: { x: 13, y: 17, short: "Ray", order: 6 },
  pgm: { x: 37, y: 17, short: "June", order: 7 },
  mgf: { x: 63, y: 17, short: "Luis", order: 8 },
  mgm: { x: 87, y: 17, short: "Rosa", order: 4 },
  dev: { x: 13, y: 43, short: "Dev", order: 3 },
  dad: { x: 37, y: 43, short: "Dad", order: 2 },
  mom: { x: 75, y: 43, short: "Mom", order: 1 },
  self: { x: 56, y: 68, short: "Alex", order: 0 },
};

// Pedigree links (stage units; the stage is exactly 100 × 80, so the SVG scales uniformly). Couple lines join partners;
// each sibship drops from its couple, under the name labels, then to each child with soft rounded corners.
const LINKS = [
  "M17.5 17H32.5", // Ray — June
  "M67.5 17H82.5", // Luis — Rosa
  "M41.5 43H70.5", // Dad — Mom
  "M25 17V31", // Ray + June → sibship
  "M13 38.6V33.5Q13 31 15.5 31H34.5Q37 31 37 33.5V38.6", // Dev, Dad
  "M75 17V38.6", // Luis + Rosa → Mom
  "M56 43V63.6", // Dad + Mom → Alex
];

// Deterministic star field (no Math.random at render: server and client agree).
const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12543.1234;
  const fx = a - Math.floor(a);
  const fy = b - Math.floor(b);
  return { x: fx * 100, y: fy * 80, r: 0.12 + ((i * 7) % 5) * 0.05, o: 0.18 + ((i * 11) % 7) * 0.06 };
});

const LIT = new Set(["known", "conflicting", "self"]);

export interface NightPosterProps {
  receipts: Record<string, PersonReceipt>;
  /** window: labelled deep links into the demo. backdrop: decorative (aria-hidden), no labels, the lit nodes twinkle. */
  variant?: "window" | "backdrop";
  className?: string;
}

function statusWord(r: PersonReceipt) {
  if (r.status === "self") return "You";
  return r.record && r.status === "known" ? "Known · portal record" : STATUS_LABEL[r.status];
}

export function NightPoster({ receipts, variant = "window", className }: NightPosterProps) {
  const people = Object.values(receipts).filter((r) => POS[r.id]);
  const backdrop = variant === "backdrop";
  return (
    <div className={cn("@container relative aspect-[5/4] w-full", className)} aria-hidden={backdrop || undefined}>
      <svg viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden focusable="false" className="absolute inset-0 size-full overflow-visible">
        <defs>
          <radialGradient id={`fog-${variant}`} cx="50%" cy="45%" r="60%">
            <stop offset="0" stopColor="var(--fht-line)" stopOpacity="0.16" />
            <stop offset="1" stopColor="var(--fht-line)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {backdrop ? null : <rect x="0" y="0" width="100" height="80" fill={`url(#fog-${variant})`} />}
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="var(--fht-light)" opacity={s.o * (backdrop ? 0.7 : 1)} />
        ))}
        {LINKS.map((d, i) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            fill="none"
            stroke="var(--fht-line)"
            strokeWidth={0.32}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="[stroke-dasharray:1] motion-safe:animate-draw"
            style={{ animationDelay: `${120 + i * 90}ms` }}
          />
        ))}
      </svg>
      <ul className="contents">
        {people
          .sort((a, b) => POS[a.id].order - POS[b.id].order)
          .map((r) => {
            const p = POS[r.id];
            const lit = LIT.has(r.status);
            const style: CSSProperties = { left: `${p.x}%`, top: `${(p.y / 80) * 100}%`, animationDelay: `${260 + p.order * 110}ms` };
            const glyph = (
              <span className="relative grid aspect-square w-full place-items-center">
                {lit ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -inset-[70%] rounded-full bg-[radial-gradient(closest-side,rgb(127_230_197/0.34),rgb(127_230_197/0.08)_55%,transparent)]",
                      // one 6 s sine twinkle (Tailwind's pulse keyframes), paused offscreen by the parent InView
                      backdrop && "motion-safe:animate-pulse group-data-offscreen/inview:[animation-play-state:paused]",
                    )}
                    style={
                      backdrop
                        ? { animationDuration: "6s", animationTimingFunction: "var(--ease-in-out-sine)", animationDelay: `${p.order * -1.4}s` }
                        : undefined
                    }
                  />
                ) : null}
                <PedigreeGlyph
                  shape={r.shape}
                  status={r.glyph}
                  finding={r.finding}
                  deceased={r.deceased}
                  record={r.record}
                  tone="night"
                  size={64}
                  className="relative size-full transition-transform duration-(--dur-hover) ease-out-quart group-hover/node:scale-110 group-focus-visible/node:scale-110 motion-reduce:transition-none"
                />
              </span>
            );
            if (backdrop) {
              return (
                <li key={r.id} className="absolute w-[7%] -translate-x-1/2 -translate-y-1/2" style={style}>
                  {glyph}
                </li>
              );
            }
            const href = r.status === "pending" ? `/tree?person=${r.id}&mode=invite` : `/tree?person=${r.id}`;
            return (
              <li key={r.id} className="absolute w-[8%] -translate-x-1/2 -translate-y-1/2 motion-safe:animate-fade-up" style={style}>
                <Link
                  href={href}
                  prefetch={false}
                  aria-label={`${r.label}: ${statusWord(r)}. ${r.status === "pending" ? `Ask ${r.name} in the demo` : `Open ${r.name} in the demo`}`}
                  className="group/node relative flex flex-col items-center rounded-md outline-offset-4"
                >
                  {glyph}
                  <span className="absolute top-[calc(100%+0.35rem)] flex flex-col items-center gap-0.5 whitespace-nowrap">
                    <span className="rounded-full border border-white/10 bg-night-900/85 px-2 py-px text-caption font-strong text-ivory shadow-raise-night transition-colors duration-(--dur-hover) group-hover/node:border-lumen/50 group-focus-visible/node:border-lumen/50">
                      <span className="@min-[26rem]:hidden">{p.short}</span>
                      <span className="@max-[26rem]:hidden">{r.label}</span>
                    </span>
                    <span className="text-caption text-ivory-2 @max-[30rem]:hidden">{statusWord(r)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
