// Pieces every pack's care-team list shares: relation groups, how a reported fact reads, and the "to clarify" items
// (disagreements, unknowns, declines, missing death details). None of these is a criterion.
import { formatCondition } from "../conditions";
import type { PersonView } from "../status";
import type { FamilyTree, Person, Relation, Report } from "../types";
import { nonePhrase } from "./none";
import type { Flag } from "./types";

export const FIRST_DEGREE: Relation[] = ["mother", "father", "sibling"];
export const SECOND_DEGREE: Relation[] = [
  "paternal-grandfather",
  "paternal-grandmother",
  "maternal-grandfather",
  "maternal-grandmother",
  "paternal-aunt-uncle",
  "maternal-aunt-uncle",
];

export const has = (name: string, ...terms: string[]) => terms.some((t) => name.includes(t));

export function sideOf(r: Relation) {
  if (r.startsWith("paternal") || r === "father") return "father's side";
  if (r.startsWith("maternal") || r === "mother") return "mother's side";
  return "";
}

/** "Grandma Rosa (mother's side)". */
export function whoOf(p: Person) {
  const side = sideOf(p.relation);
  return `${p.label}${side ? ` (${side})` : ""}`;
}

/** "about age 58" / "age 60" / "age not known". */
export const ageTextOf = (r: Report) => (r.ageAtOnset != null ? `${r.approximate ? "about " : ""}age ${r.ageAtOnset}` : "age not known");

/** "from a portal record" / "self-reported" / "reported by Mom". */
export const sourceOf = (r: Report) => (r.source === "record" ? "from a portal record" : r.source === "self" ? "self-reported" : `reported by ${r.reportedBy}`);

/** "Very high cholesterol, about age 35, reported by Mom" (no who, no period). */
export const reportedFact = (r: Report) => `${r.condition}, ${ageTextOf(r)}, ${sourceOf(r)}`;

/** "died suddenly or unexpectedly (cause given: …), age 38, reported by Alex" (no who, no period). */
export function suddenFact(p: Person, tree: FamilyTree) {
  const a = p.ageAtDeath;
  const cause = p.causeOfDeath ? ` (cause given: ${p.causeOfDeath})` : "";
  return `died suddenly or unexpectedly${cause}, ${a != null ? `age ${a}` : "age not known"}, reported by ${tree.patientName}`;
}

/** The "to clarify" items for one person: who disagrees with whom, who is unknown or declined, what's missing about a
 *  death. Same for every pack; no age cutoffs. */
export function clarifyItems(v: PersonView): Flag[] {
  const p = v.person;
  const first = FIRST_DEGREE.includes(p.relation);
  const items: Flag[] = [];
  // The same object shape as cardiology's add(), `basis: undefined` key included (deep-strict equality tells them apart).
  const add = (title: string, detail: string) => items.push({ personId: p.id, tier: "clarify", title, detail, basis: undefined });
  if (v.status === "conflicting") {
    const said = [...v.conditions, ...v.reports.filter((r) => r.kind === "no-history")]
      .map(
        (r) =>
          `${r.reportedBy} says ${r.kind === "no-history" ? nonePhrase(r) : formatCondition(r).toLowerCase().replace(", age ", " at ").replace("about age", "about")}`,
      )
      .join("; ");
    add(`Reports disagree: ${p.label}`, `${said}.`);
  }
  if ((first || p.relation.endsWith("grandfather") || p.relation.endsWith("grandmother")) && v.status === "unknown") {
    add(`${p.label}: unknown`, `${v.headline}.`);
  }
  if (v.status === "declined") add(`${p.label}: declined to share`, "Only what the patient knows firsthand is shown.");
  if (first && p.deceased && (p.ageAtDeath == null || !p.causeOfDeath)) {
    add(
      `${p.label} (deceased): ${p.ageAtDeath == null && !p.causeOfDeath ? "age and cause" : p.ageAtDeath == null ? "age" : "cause"} of death not recorded`,
      "Ask how old they were and what happened.",
    );
  }
  return items;
}

/** One item per person and title, criteria first, then noted, then to clarify. */
export function finish(items: Flag[]): Flag[] {
  const seen = new Set<string>();
  const order: Record<Flag["tier"], number> = { guideline: 0, noted: 1, clarify: 2 };
  return items.filter((f) => (seen.has(f.personId + f.title) ? false : (seen.add(f.personId + f.title), true))).sort((a, b) => order[a.tier] - order[b.tier]);
}

export function stillToConfirm(views: PersonView[]) {
  return views.filter((v) => v.person.relation !== "self" && (v.status === "unknown" || v.status === "conflicting"));
}
