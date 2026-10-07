// The mini pedigree on the summary (DESIGN §12.8a): NSGC symbols on layoutTree() coordinates. Filled = heart condition
// reported, slash = deceased, arrow = the patient, square chip = portal record; ring = how sure we are. Server-safe.
import { layoutTree } from "@/lib/layout";
import type { PersonView } from "@/lib/status";
import type { Person, Relation } from "@/lib/types";
import type { CSSProperties } from "react";
import { cn } from "@/components/ui/cn";
import { PedigreeGlyph, shapeForSex } from "@/components/ui/PedigreeGlyph";
import { annotations, hasFinding, nodeStatus } from "./model";

const G = 56; // glyph box (shape edge ≈ ±19)
const EDGE = 20; // where lines meet the shape
const PX = 108; // side padding: half the widest label
const TOP = 32;
const ROW = 166;
const NAME_DY = 50;
const LINE_DY = 22;
const MAX_NAME = 16;
/** On screen: never smaller than this (12 px notes), never taller than this. */
const MIN_SCALE = 0.6;
const MAX_SCALE = 0.85;

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export interface PedigreeProps {
  views: PersonView[];
  className?: string;
  /** Accessible name of the figure's image. */
  label?: string;
}

export function Pedigree({ views, className, label }: PedigreeProps) {
  const people = views.map((v) => v.person);
  if (!people.length) return null;
  const layout = layoutTree(people);
  const rowsPresent = [...new Set(layout.nodes.map((n) => n.y))].sort((a, b) => a - b);
  const minX = Math.min(...layout.nodes.map((n) => n.x));
  // layout x is a node card's left edge; every card has the same width, so x − minX + PX puts the leftmost centre at PX
  const pos = new Map(layout.nodes.map((n) => [n.id, { x: n.x - minX + PX, y: TOP + rowsPresent.indexOf(n.y) * ROW }]));
  const cxs = [...pos.values()].map((p) => p.x);
  const width = Math.max(...cxs) + PX;
  // room under the last row for its own labels only (rows above leave theirs in the row gap)
  const lastY = TOP + (rowsPresent.length - 1) * ROW;
  const lastLines = Math.max(0, ...views.filter((v) => pos.get(v.person.id)?.y === lastY).map((v) => annotations(v).length));
  const height = lastY + NAME_DY + LINE_DY * lastLines + 10;

  const of = (...rel: Relation[]) => people.filter((p) => rel.includes(p.relation));
  const at = (p: Person | undefined) => (p ? pos.get(p.id) : undefined);
  const lines: string[] = [];
  const family = (a: Person | undefined, b: Person | undefined, kids: (Person | undefined)[]) => {
    const parents = [at(a), at(b)].filter(Boolean) as { x: number; y: number }[];
    const children = kids.map(at).filter(Boolean) as { x: number; y: number }[];
    if (!parents.length || !children.length) return;
    const py = parents[0].y;
    let mid: number;
    let startY: number;
    if (parents.length === 2) {
      const [l, r] = parents[0].x < parents[1].x ? parents : [parents[1], parents[0]];
      lines.push(`M${l.x + EDGE} ${py}H${r.x - EDGE}`);
      mid = (l.x + r.x) / 2;
      startY = py;
    } else {
      mid = parents[0].x;
      startY = py + EDGE;
    }
    const cy = children[0].y;
    const sibY = cy - EDGE - 20;
    lines.push(`M${mid} ${startY}V${sibY}`);
    const xs = [mid, ...children.map((c) => c.x)];
    if (Math.max(...xs) - Math.min(...xs) > 0.5) lines.push(`M${Math.min(...xs)} ${sibY}H${Math.max(...xs)}`);
    for (const c of children) lines.push(`M${c.x} ${sibY}V${c.y - EDGE}`);
  };
  family(of("paternal-grandfather")[0], of("paternal-grandmother")[0], [...of("paternal-aunt-uncle"), of("father")[0]]);
  family(of("maternal-grandfather")[0], of("maternal-grandmother")[0], [of("mother")[0], ...of("maternal-aunt-uncle")]);
  family(of("father")[0], of("mother")[0], [...of("self"), ...of("sibling")]);

  return (
    <svg
      viewBox={`0 0 ${Math.round(width)} ${Math.round(height)}`}
      role="img"
      aria-label={label ?? `Family pedigree, ${people.length} people across ${rowsPresent.length} generations. Filled symbols mean a heart condition was reported.`}
      className={cn("block h-auto w-full overflow-visible", className)}
      // the legible screen size: notes (20 units) at ≥ 12 px and names (24 units) at ≥ 14 px; print ignores both
      style={{ "--ped-min-w": `${Math.round(width * MIN_SCALE)}px`, "--ped-max-h": `${Math.round(height * MAX_SCALE)}px` } as CSSProperties}
      focusable="false"
    >
      <path d={lines.join("")} fill="none" stroke="var(--color-ink-3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" data-pedigree-lines="" />
      {views.map((v) => {
        const p = pos.get(v.person.id);
        if (!p) return null;
        const self = v.person.relation === "self";
        const notes = annotations(v);
        const name = self ? v.person.label.replace(/\s*\(you\)$/, "") : v.person.label;
        return (
          <g key={v.person.id} data-node={v.person.id}>
            {/* lit (opacity) while the reader points at this person's row; see SummaryDocument's linked-highlight style */}
            <circle data-halo="" cx={p.x} cy={p.y} r={G * 0.62} fill="var(--color-lumen)" opacity={0} className="transition-opacity duration-(--dur-hover) print:hidden" />
            <PedigreeGlyph
              as="g"
              x={p.x}
              y={p.y}
              size={G}
              shape={shapeForSex(v.person.sex)}
              status={nodeStatus(v)}
              finding={hasFinding(v)}
              deceased={v.person.deceased}
              record={v.verified}
              proband={self}
            />
            <text x={p.x} y={p.y + NAME_DY} textAnchor="middle" fontSize={24} fontWeight={590} fill="var(--color-ink)" fontFamily="var(--font-geist), ui-sans-serif, system-ui, sans-serif">
              {clip(name, MAX_NAME)}
              {self ? " (you)" : ""}
            </text>
            {notes.map((t, i) => (
              <text
                key={i}
                x={p.x}
                y={p.y + NAME_DY + LINE_DY * (i + 1)}
                textAnchor="middle"
                fontSize={20}
                fill="var(--color-ink-2)"
                fontFamily="var(--font-geist-mono), ui-monospace, monospace"
              >
                {clip(t, 17)}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
