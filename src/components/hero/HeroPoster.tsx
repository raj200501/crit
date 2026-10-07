// Server-renderable SVG of the constellation, in the same world coordinates as the 3D scene (z dropped), so the
// crossfade to the canvas does not jump. Two looks (DESIGN §9.6):
//   night: the SSR placeholder, the reduced-motion hero, the WebGL fallback, the stacked chapter cards and the final
//          CTA background. Glyphs use the app grammar (PedigreeGlyph tone="night") with halos only where light is earned.
//   paper: the clearing sheet's pedigree (PedigreeGlyph tone="paper", ink links, optional names).

import { useId } from "react";
import { PedigreeGlyph, type GlyphStatus } from "@/components/ui/PedigreeGlyph";
import { VIEW, type StoryModel } from "./story";

export interface HeroPosterProps {
  model: StoryModel;
  theme?: "night" | "paper";
  /** Keyframe to draw (default: the last one, the finished tree). */
  keyframe?: number;
  /** night: draw the three invite arcs leaving "you" (the Invite chapter). */
  invites?: boolean;
  /** night: the static grain field around the tree (default true). */
  dust?: boolean;
  /** paper: names under the glyphs. */
  names?: boolean;
  /** night: the halos of the lit relatives twinkle (one 6 s sine loop each, motion-safe). Pauses while an ancestor
   *  `group/inview` carries data-offscreen (landing/InView mode="pause"). Used by the landing's final CTA backdrop. */
  twinkle?: boolean;
  className?: string;
}

/** World units → PedigreeGlyph `size` (its shape radius is 11 of 32), so the glyph radius is 0.21 world units. */
const GLYPH = (0.21 / 11) * 32;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f3 = (n: number) => Math.round(n * 1000) / 1000;

/** A deterministic grain field (same on server and client): mostly on filaments, some around relatives, a few free. */
function grains(model: StoryModel, crisp: (id: string) => number) {
  const rand = mulberry32(709);
  const out: { x: number; y: number; r: number; o: number }[] = [];
  const bez = (a: number, c: number, b: number, t: number) => (1 - t) ** 2 * a + 2 * (1 - t) * t * c + t * t * b;
  for (let i = 0; i < 210; i++) {
    const roll = rand();
    if (roll < 0.55) {
      const l = model.links[Math.floor(rand() * model.links.length)];
      const t = rand();
      out.push({ x: bez(l.a[0], l.ctrl[0], l.b[0], t) + (rand() - 0.5) * 0.07, y: -bez(l.a[1], l.ctrl[1], l.b[1], t) + (rand() - 0.5) * 0.07, r: 0.008 + rand() * 0.012, o: 0.35 + rand() * 0.45 });
    } else if (roll < 0.85) {
      const n = model.nodes[Math.floor(rand() * model.nodes.length)];
      const c = crisp(n.id);
      const ang = rand() * Math.PI * 2;
      const rad = 0.3 + rand() * (0.22 + (1 - c) * 0.35); // uncertain relatives keep their haze
      out.push({ x: n.pos[0] + Math.cos(ang) * rad, y: -n.pos[1] + Math.sin(ang) * rad, r: 0.008 + rand() * 0.012, o: (0.25 + rand() * 0.4) * (0.55 + 0.45 * c) });
    } else {
      out.push({ x: VIEW.x + rand() * VIEW.w, y: VIEW.y + rand() * VIEW.h, r: 0.006 + rand() * 0.012, o: 0.12 + rand() * 0.3 });
    }
  }
  return out.map((g) => ({ x: f3(g.x), y: f3(g.y), r: f3(g.r), o: f3(g.o) }));
}

/** Groups grains into ≤ ~20 paths: diameter in 0.008-unit steps, opacity in 0.1 steps. */
function grainPaths(list: { x: number; y: number; r: number; o: number }[]) {
  const buckets = new Map<string, { w: number; o: number; d: string[] }>();
  for (const g of list) {
    const w = Math.max(0.008, Math.round((g.r * 2) / 0.008) * 0.008);
    const o = Math.max(0.1, Math.round(g.o * 10) / 10);
    const key = `${w.toFixed(3)}:${o.toFixed(1)}`;
    const b = buckets.get(key) ?? { w: f3(w), o, d: [] };
    b.d.push(`M${g.x} ${g.y}h0`);
    buckets.set(key, b);
  }
  return [...buckets.entries()].map(([key, b]) => ({ key, w: b.w, o: b.o, d: b.d.join("") }));
}

export default function HeroPoster({ model, theme = "night", keyframe, invites = false, dust = true, names = false, twinkle = false, className }: HeroPosterProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const k = keyframe ?? model.keyframes.length - 1;
  const kf = model.keyframes[k];
  const self = model.nodes.find((n) => n.isSelf);
  const night = theme === "night";
  const status = (id: string, isSelf: boolean): GlyphStatus => (isSelf ? "self" : kf.states[id]);
  const crisp = (id: string) => {
    const s = kf.states[id];
    return s === "known" || s === "conflicting" ? 1 : s === "declined" ? 0.4 : 0;
  };

  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ overflow: "visible" }}
    >
      {night ? (
        <defs>
          <radialGradient id={`${uid}-halo`}>
            <stop offset="0" stopColor="var(--fht-known)" stopOpacity="0.34" />
            <stop offset="0.45" stopColor="var(--fht-known)" stopOpacity="0.1" />
            <stop offset="1" stopColor="var(--fht-known)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-self`}>
            <stop offset="0" stopColor="var(--fht-light)" stopOpacity="0.2" />
            <stop offset="1" stopColor="var(--fht-light)" stopOpacity="0" />
          </radialGradient>
        </defs>
      ) : null}

      {night && dust ? (
        // ~210 grains drawn as a handful of paths (zero-length round-capped segments, bucketed by size and opacity)
        // instead of 210 <circle>s: the landing draws this poster five times.
        <g fill="none" stroke="var(--fht-light)" strokeLinecap="round">
          {grainPaths(grains(model, crisp)).map((b) => (
            <path key={b.key} d={b.d} strokeWidth={b.w} strokeOpacity={b.o} />
          ))}
        </g>
      ) : null}

      <g fill="none" strokeLinecap="round">
        {model.links.map((l, i) => {
          const d = `M${f3(l.a[0])} ${f3(-l.a[1])} Q${f3(l.ctrl[0])} ${f3(-l.ctrl[1])} ${f3(l.b[0])} ${f3(-l.b[1])}`;
          return night ? (
            <g key={i}>
              <path d={d} stroke="var(--fht-line)" strokeWidth={0.075} strokeOpacity={0.18} />
              <path d={d} stroke="var(--fht-line)" strokeWidth={l.kind === "couple" ? 0.016 : 0.024} strokeOpacity={l.kind === "couple" ? 0.7 : 1} />
            </g>
          ) : (
            <path key={i} d={d} stroke="var(--color-ink)" strokeOpacity={0.22} strokeWidth={0.018} />
          );
        })}
      </g>

      {night && invites && self
        ? model.pulses
            .filter((p) => p.kind === "invite")
            .map((p, i) => {
              const to = model.nodes.find((n) => n.id === p.to);
              if (!to) return null;
              const [ax, ay] = [self.pos[0], -self.pos[1]];
              const [bx, by] = [to.pos[0], -to.pos[1]];
              const cx = (ax + bx) / 2 + (bx - ax) * 0.08;
              const cy = Math.min(ay, by) - 0.55;
              return (
                <g key={i}>
                  <path d={`M${f3(ax)} ${f3(ay - 0.3)} Q${f3(cx)} ${f3(cy)} ${f3(bx)} ${f3(by + 0.3)}`} fill="none" stroke="var(--fht-light)" strokeOpacity={0.55} strokeWidth={0.018} strokeDasharray="0.06 0.07" strokeLinecap="round" />
                  <circle cx={f3(bx)} cy={f3(by + 0.3)} r={0.035} fill="var(--fht-light)" />
                </g>
              );
            })
        : null}

      {model.nodes.map((n, i) => {
        const s = kf.states[n.id];
        const x = f3(n.pos[0]);
        const y = f3(-n.pos[1]);
        const lit = !n.isSelf && (s === "known" || s === "conflicting");
        return (
          <g key={n.id}>
            {night && lit ? (
              <circle
                cx={x}
                cy={y}
                r={0.62}
                fill={`url(#${uid}-halo)`}
                className={twinkle ? "motion-safe:animate-pulse group-data-offscreen/inview:[animation-play-state:paused]" : undefined}
                style={twinkle ? { animationDuration: "6s", animationTimingFunction: "var(--ease-in-out-sine)", animationDelay: `${i * -1.4}s` } : undefined}
              />
            ) : null}
            {night && n.isSelf ? <circle cx={x} cy={y} r={0.55} fill={`url(#${uid}-self)`} /> : null}
            <PedigreeGlyph
              as="g"
              x={x}
              y={y}
              size={n.isSelf ? GLYPH * 1.15 : GLYPH}
              shape={n.shape}
              status={status(n.id, n.isSelf)}
              finding={kf.finding[n.id]}
              deceased={n.deceased}
              record={kf.fromRecord[n.id]}
              proband={n.isSelf}
              tone={night ? "night" : "paper"}
            />
            {names ? (
              // Chrome rasterizes sub-pixel font sizes badly: set 20 px type and scale the text down to 0.26 units.
              <text
                // "you" is drawn larger with the proband arrow, so its name sits a little lower to clear the arrow
                transform={`translate(${x} ${f3(y + (n.isSelf ? 0.56 : 0.5))}) scale(0.013)`}
                textAnchor="middle"
                fontSize={20}
                fontWeight={560}
                fill="var(--color-ink-2)"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {n.name}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
