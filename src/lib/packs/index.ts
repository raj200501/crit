// Which specialty pack a tree uses. Absent means cardiology: every tree, invite and reply made before visit types.
import type { FamilyTree } from "../types";
import { CARDIOLOGY } from "./cardiology";
import type { Choice, SpecialtyPack } from "./types";

export * from "./types";
export * from "./none";
export { askedAbout, GENERAL_CHOICES, HEART_CHOICES } from "./choices";
export { CARDIOLOGY } from "./cardiology";

/** The pack for a tree. Only cardiology exists so far; the visit type picks between packs once a second one does. */
export function packFor(tree: Pick<FamilyTree, "visit">): SpecialtyPack {
  void tree.visit;
  return CARDIOLOGY;
}

const grouped = new WeakMap<SpecialtyPack, { title: string; choices: Choice[] }[]>();

/** The pack's cards in its presentation groups (unknown ids fall into "Other"). Memoized per pack. */
export function groupedChoices(pack: SpecialtyPack): { title: string; choices: Choice[] }[] {
  const hit = grouped.get(pack);
  if (hit) return hit;
  const byId = new Map(pack.choices.map((c) => [c.id, c]));
  const used = new Set<string>();
  const groups = pack.groups
    .map((g) => ({
      title: g.title,
      choices: g.ids.flatMap((id) => {
        const c = byId.get(id);
        if (!c) return [];
        used.add(id);
        return [c];
      }),
    }))
    .filter((g) => g.choices.length);
  const rest = pack.choices.filter((c) => !used.has(c.id));
  const out = rest.length ? [...groups, { title: "Other", choices: rest }] : groups;
  grouped.set(pack, out);
  return out;
}
