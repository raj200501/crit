// Which specialty pack a tree uses. Absent means cardiology: every tree, invite and reply made before visit types.
import type { FamilyTree } from "../types";
import { CARDIOLOGY } from "./cardiology";
import { GENERAL } from "./general";
import type { Choice, PackId, SpecialtyPack } from "./types";
import { VISIT_TYPES } from "./visits";

export * from "./types";
export * from "./none";
export * from "./visits";
export { askedAbout, GENERAL_CHOICES, HEART_CHOICES } from "./choices";
export { CARDIOLOGY } from "./cardiology";
export { GENERAL } from "./general";

export const PACKS: Record<PackId, SpecialtyPack> = { cardiology: CARDIOLOGY, general: GENERAL };

/** A pack id from a link or storage: anything but "general" (missing, forged, "__proto__") is cardiology. */
export function packById(id: unknown): SpecialtyPack {
  return id === "general" ? GENERAL : CARDIOLOGY;
}

/** No visit, or a visit saved before visit types (no `type`), is cardiology. */
export function packIdForVisit(visit?: FamilyTree["visit"]): PackId {
  return VISIT_TYPES.find((t) => t.id === visit?.type)?.pack ?? "cardiology";
}

export const packFor = (tree: Pick<FamilyTree, "visit">): SpecialtyPack => PACKS[packIdForVisit(tree.visit)];

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
