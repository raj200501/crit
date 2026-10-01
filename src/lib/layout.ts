import type { Person, Relation } from "./types";

// Three-generation pedigree layout: grandparents, parents with their siblings, then the patient
// and siblings. Paternal side on the left, maternal on the right, as in a standard pedigree.

export const NODE_W = 188;
export const NODE_H = 82;
const GAP_X = 22;
const ROW_Y = [0, 170, 340];
const BAR = 20;

export interface Placed {
  id: string;
  x: number;
  y: number;
}

export interface Layout {
  nodes: Placed[];
  edges: string[];
  width: number;
  height: number;
}

const of = (people: Person[], ...relations: Relation[]) => people.filter((p) => relations.includes(p.relation));
const cx = (p: Placed) => p.x + NODE_W / 2;

export function layoutTree(people: Person[]): Layout {
  const father = of(people, "father")[0];
  const mother = of(people, "mother")[0];
  const patSibs = of(people, "paternal-aunt-uncle");
  const matSibs = of(people, "maternal-aunt-uncle");
  const self = of(people, "self")[0];
  const sibs = of(people, "sibling");
  const pgf = of(people, "paternal-grandfather")[0];
  const pgm = of(people, "paternal-grandmother")[0];
  const mgf = of(people, "maternal-grandfather")[0];
  const mgm = of(people, "maternal-grandmother")[0];

  const placed = new Map<string, Placed>();
  const put = (p: Person | undefined, x: number, y: number) => {
    if (p) placed.set(p.id, { id: p.id, x, y });
  };

  // Row 1: [paternal aunts/uncles] father mother [maternal aunts/uncles]
  const row1 = [...patSibs, father, mother, ...matSibs].filter(Boolean) as Person[];
  row1.forEach((p, i) => put(p, i * (NODE_W + GAP_X), ROW_Y[1]));

  const groupCenter = (group: (Person | undefined)[]) => {
    const xs = group.filter(Boolean).map((p) => cx(placed.get(p!.id)!));
    return xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0;
  };

  // Row 0: each grandparent couple centered over its children.
  const patCenter = groupCenter([...patSibs, father]);
  const matCenter = groupCenter([mother, ...matSibs]);
  let patLeft = patCenter - GAP_X / 2 - NODE_W;
  let matLeft = matCenter - GAP_X / 2 - NODE_W;
  const overlap = patLeft + 2 * NODE_W + GAP_X + GAP_X * 2 - matLeft;
  if ((pgf || pgm) && (mgf || mgm) && overlap > 0) {
    patLeft -= overlap / 2;
    matLeft += overlap / 2;
  }
  put(pgf, patLeft, ROW_Y[0]);
  put(pgm, patLeft + NODE_W + GAP_X, ROW_Y[0]);
  put(mgf, matLeft, ROW_Y[0]);
  put(mgm, matLeft + NODE_W + GAP_X, ROW_Y[0]);

  // Row 2: the patient (and siblings) under the parents.
  const kids = [self, ...sibs].filter(Boolean) as Person[];
  const parentsCenter = groupCenter([father, mother]);
  const kidsWidth = kids.length * NODE_W + (kids.length - 1) * GAP_X;
  kids.forEach((p, i) => put(p, parentsCenter - kidsWidth / 2 + i * (NODE_W + GAP_X), ROW_Y[2]));

  // Normalize so the leftmost node sits at x = 0.
  const minX = Math.min(...[...placed.values()].map((p) => p.x));
  for (const p of placed.values()) p.x -= minX;

  const edges: string[] = [];
  const at = (p?: Person) => (p ? placed.get(p.id) : undefined);

  const family = (a: Placed | undefined, b: Placed | undefined, children: (Placed | undefined)[], rowTop: number) => {
    const kidsPlaced = children.filter(Boolean) as Placed[];
    const parents = [a, b].filter(Boolean) as Placed[];
    if (parents.length === 0 || kidsPlaced.length === 0) return;
    const bottom = parents[0].y + NODE_H;
    const coupleY = bottom + BAR;
    if (parents.length === 2) {
      edges.push(`M${cx(parents[0])} ${bottom} V${coupleY} H${cx(parents[1])} V${bottom}`);
    } else {
      edges.push(`M${cx(parents[0])} ${bottom} V${coupleY}`);
    }
    const mid = parents.length === 2 ? (cx(parents[0]) + cx(parents[1])) / 2 : cx(parents[0]);
    const sibY = rowTop - BAR;
    edges.push(`M${mid} ${coupleY} V${sibY}`);
    const xs = [mid, ...kidsPlaced.map(cx)];
    edges.push(`M${Math.min(...xs)} ${sibY} H${Math.max(...xs)}`);
    for (const k of kidsPlaced) edges.push(`M${cx(k)} ${sibY} V${k.y}`);
  };

  family(at(pgf), at(pgm), [...patSibs, father].map(at), ROW_Y[1]);
  family(at(mgf), at(mgm), [mother, ...matSibs].map(at), ROW_Y[1]);
  family(at(father), at(mother), kids.map(at), ROW_Y[2]);

  const nodes = [...placed.values()];
  const width = Math.max(...nodes.map((n) => n.x + NODE_W));
  const height = Math.max(...nodes.map((n) => n.y + NODE_H));
  return { nodes, edges, width, height };
}
