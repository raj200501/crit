// Canvas geometry for the tree. Node positions come only from layoutTree() (src/lib/layout); this file adds the
// presentation around them: ghost "+" slots, world bounds, rounded edge corners and the lineage path to "you".
import { layoutTree, NODE_H, NODE_W, type Layout, type Placed } from "@/lib/layout";
import type { Person, Relation } from "@/lib/types";

export { NODE_H, NODE_W };

const GAP_X = 22;
const BAR = 20; // matches layoutTree's couple/sibling bar offset
export const GHOST_W = 148;
export const GHOST_H = 74;

export interface Ghost {
  relation: Extract<Relation, "paternal-aunt-uncle" | "maternal-aunt-uncle" | "sibling">;
  /** "Dad’s brother or sister" */
  label: string;
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Scene {
  layout: Layout;
  ghosts: Ghost[];
  /** People + ghosts (what Fit frames). */
  bounds: Bounds;
  byId: Map<string, Placed>;
  selfId?: string;
}

const of = (people: Person[], ...relations: Relation[]) => people.filter((p) => relations.includes(p.relation));

export function buildScene(people: Person[], withGhosts: boolean): Scene {
  const layout = layoutTree(people);
  const byId = new Map(layout.nodes.map((n) => [n.id, n]));
  const at = (p?: Person) => (p ? byId.get(p.id) : undefined);
  const father = of(people, "father")[0];
  const mother = of(people, "mother")[0];
  const self = of(people, "self")[0];

  const ghosts: Ghost[] = [];
  if (withGhosts) {
    const pat = [...of(people, "paternal-aunt-uncle"), father].map(at).filter(Boolean) as Placed[];
    const mat = [mother, ...of(people, "maternal-aunt-uncle")].map(at).filter(Boolean) as Placed[];
    const kids = [self, ...of(people, "sibling")].map(at).filter(Boolean) as Placed[];
    const dy = (NODE_H - GHOST_H) / 2;
    if (father && pat.length) {
      const left = pat.reduce((a, b) => (b.x < a.x ? b : a));
      ghosts.push({ relation: "paternal-aunt-uncle", label: `${father.label}’s brother or sister`, x: left.x - GAP_X - GHOST_W, y: left.y + dy });
    }
    if (mother && mat.length) {
      const right = mat.reduce((a, b) => (b.x > a.x ? b : a));
      ghosts.push({ relation: "maternal-aunt-uncle", label: `${mother.label}’s brother or sister`, x: right.x + NODE_W + GAP_X, y: right.y + dy });
    }
    if (kids.length) {
      const right = kids.reduce((a, b) => (b.x > a.x ? b : a));
      ghosts.push({ relation: "sibling", label: "Your brother or sister", x: right.x + NODE_W + GAP_X, y: right.y + dy });
    }
  }

  const xs = [0, layout.width, ...ghosts.flatMap((g) => [g.x, g.x + GHOST_W])];
  const ys = [0, layout.height, ...ghosts.flatMap((g) => [g.y, g.y + GHOST_H])];
  return {
    layout,
    ghosts,
    bounds: { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) },
    byId,
    selfId: self?.id,
  };
}

export const centerOf = (n: Placed) => ({ x: n.x + NODE_W / 2, y: n.y + NODE_H / 2 });

// ---------- Paths ----------

type Pt = [number, number];

/** Parses layoutTree's elbow paths ("M x y V y H x V y") into points. */
function parseElbow(d: string): Pt[] {
  const pts: Pt[] = [];
  const re = /([MHV])\s*(-?[\d.]+)(?:\s+(-?[\d.]+))?/g;
  let m: RegExpExecArray | null;
  let x = 0;
  let y = 0;
  while ((m = re.exec(d))) {
    if (m[1] === "M") {
      x = Number(m[2]);
      y = Number(m[3]);
    } else if (m[1] === "H") x = Number(m[2]);
    else y = Number(m[2]);
    pts.push([x, y]);
  }
  return pts;
}

/** A polyline with quarter-round corners (radius r, clamped to half of each segment). */
export function roundedPath(points: Pt[], r = 10): string {
  const pts = points.filter((p, i) => i === 0 || p[0] !== points[i - 1][0] || p[1] !== points[i - 1][1]);
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const inLen = Math.hypot(cx - px, cy - py);
    const outLen = Math.hypot(nx - cx, ny - cy);
    const collinear = (cx - px) * (ny - cy) - (cy - py) * (nx - cx) === 0;
    if (collinear) {
      d += ` L${cx} ${cy}`;
      continue;
    }
    const rr = Math.min(r, inLen / 2, outLen / 2);
    const ax = cx - ((cx - px) / inLen) * rr;
    const ay = cy - ((cy - py) / inLen) * rr;
    const bx = cx + ((nx - cx) / outLen) * rr;
    const by = cy + ((ny - cy) / outLen) * rr;
    d += ` L${ax} ${ay} Q${cx} ${cy} ${bx} ${by}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${last[0]} ${last[1]}`;
}

/** layoutTree's edges with rounded elbows. */
export function roundedEdges(layout: Layout, r = 10) {
  return layout.edges.map((d) => roundedPath(parseElbow(d), r));
}

interface Family {
  parents: Placed[];
  kids: Placed[];
}

function families(people: Person[], byId: Map<string, Placed>) {
  const at = (p?: Person) => (p ? byId.get(p.id) : undefined);
  const list = (...ps: (Person | undefined)[]) => ps.map(at).filter(Boolean) as Placed[];
  const father = of(people, "father")[0];
  const mother = of(people, "mother")[0];
  return {
    paternal: {
      parents: list(of(people, "paternal-grandfather")[0], of(people, "paternal-grandmother")[0]),
      kids: list(...of(people, "paternal-aunt-uncle"), father),
    },
    maternal: {
      parents: list(of(people, "maternal-grandfather")[0], of(people, "maternal-grandmother")[0]),
      kids: list(mother, ...of(people, "maternal-aunt-uncle")),
    },
    nuclear: { parents: list(father, mother), kids: list(of(people, "self")[0], ...of(people, "sibling")) },
  } satisfies Record<string, Family>;
}

const cx = (p: Placed) => p.x + NODE_W / 2;

/** Parent → child, along the family's couple line, drop and sibling bar (same geometry as layoutTree). */
function descent(f: Family, parent: Placed, kid: Placed): Pt[] {
  const bottom = f.parents[0].y + NODE_H;
  const coupleY = bottom + BAR;
  const mid = f.parents.length === 2 ? (cx(f.parents[0]) + cx(f.parents[1])) / 2 : cx(f.parents[0]);
  const sibY = kid.y - BAR;
  return [
    [cx(parent), bottom],
    [cx(parent), coupleY],
    [mid, coupleY],
    [mid, sibY],
    [cx(kid), sibY],
    [cx(kid), kid.y],
  ];
}

/** Sibling → sibling along the sibling bar. */
function across(a: Placed, b: Placed): Pt[] {
  const sibY = a.y - BAR;
  return [
    [cx(a), a.y],
    [cx(a), sibY],
    [cx(b), sibY],
    [cx(b), b.y],
  ];
}

/** The path from a relative to "you" (drawn evergreen when selected, lumen when an answer arrives). Empty for "you". */
export function lineagePath(people: Person[], scene: Scene, id: string): string {
  const person = people.find((p) => p.id === id);
  if (!person || person.relation === "self") return "";
  const fam = families(people, scene.byId);
  const me = scene.selfId ? scene.byId.get(scene.selfId) : undefined;
  const node = scene.byId.get(id);
  if (!me || !node) return "";
  const father = of(people, "father")[0];
  const mother = of(people, "mother")[0];
  const dadP = father ? scene.byId.get(father.id) : undefined;
  const momP = mother ? scene.byId.get(mother.id) : undefined;
  const parts: Pt[][] = [];
  const toMe = (parent?: Placed) => parent && fam.nuclear.parents.length && parts.push(descent(fam.nuclear, parent, me));

  switch (person.relation) {
    case "father":
    case "mother":
      toMe(node);
      break;
    case "paternal-grandfather":
    case "paternal-grandmother":
      if (dadP) parts.push(descent(fam.paternal, node, dadP));
      toMe(dadP);
      break;
    case "maternal-grandfather":
    case "maternal-grandmother":
      if (momP) parts.push(descent(fam.maternal, node, momP));
      toMe(momP);
      break;
    case "paternal-aunt-uncle":
      if (dadP) parts.push(across(node, dadP));
      toMe(dadP);
      break;
    case "maternal-aunt-uncle":
      if (momP) parts.push(across(node, momP));
      toMe(momP);
      break;
    case "sibling":
      parts.push(across(node, me));
      break;
  }
  return parts.map((p) => roundedPath(p)).join(" ");
}

/** Direction-aware nearest neighbour for arrow-key navigation between relatives. */
export function neighbour(scene: Scene, fromId: string, key: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight"): string | undefined {
  const from = scene.byId.get(fromId);
  if (!from) return undefined;
  const a = centerOf(from);
  let best: { id: string; score: number } | undefined;
  for (const n of scene.layout.nodes) {
    if (n.id === fromId) continue;
    const b = centerOf(n);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const primary = key === "ArrowLeft" ? -dx : key === "ArrowRight" ? dx : key === "ArrowUp" ? -dy : dy;
    const cross = key === "ArrowLeft" || key === "ArrowRight" ? Math.abs(dy) : Math.abs(dx);
    if (primary <= 8 || cross > primary * 1.6) continue;
    const score = primary + cross * 2.2;
    if (!best || score < best.score) best = { id: n.id, score };
  }
  return best?.id;
}
