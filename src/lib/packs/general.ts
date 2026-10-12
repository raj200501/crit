// The general pack: questions for any visit that isn't cardiology, and a care-team list with NO guideline criteria.
// It only lists what each relative reported, as reported, plus the same "to clarify" items as cardiology (disagreements,
// unknowns, declines, missing death details). No age cutoffs, no thresholds, no "early", no risk score. Criteria for
// another specialty need a clinician's sign-off first (spec non-goals), so none exist here.
import { capitalize, CARDIAC_TERMS, GENERAL_NON_HEART_TERMS } from "../conditions";
import type { PersonView } from "../status";
import type { FamilyTree } from "../types";
import { askedAbout, GENERAL_CHOICES } from "./choices";
import { clarifyItems, finish, reportedFact, suddenFact, whoOf } from "./shared";
import type { Flag, SpecialtyPack } from "./types";

export const GENERAL_GROUPS = [
  { title: "Heart & circulation", ids: ["mi", "heart", "stroke", "hbp", "fh"] },
  { title: "Diabetes", ids: ["diabetes"] },
  { title: "Cancer", ids: ["breast", "ovarian", "colorectal", "cancer-other"] },
];

/** Problem-list words the record picker suggests for a general visit: the heart terms, what the general cards ask
 *  about, and names linked to a listed cancer (BRCA, Lynch syndrome, colon polyps). Narrower than "any condition" on
 *  purpose, so a relative's whole problem list never shows as suggested. */
export const GENERAL_TERMS = [...CARDIAC_TERMS, ...GENERAL_NON_HEART_TERMS, "brca", "lynch", "polyp", "adenoma"];

/** One plain "noted" line per relative with anything reported, plus the shared "to clarify" items. Never a guideline
 *  item, never a basis. */
export function generalReviewItems(tree: FamilyTree, views: PersonView[]): Flag[] {
  const items: Flag[] = [];
  for (const v of views) {
    const p = v.person;
    if (p.relation === "self") continue;
    const facts = v.conditions.map((r) => reportedFact(r));
    if (p.deceased && p.suddenDeath) facts.push(suddenFact(p, tree));
    if (facts.length) items.push({ personId: p.id, tier: "noted", title: whoOf(p), detail: `${capitalize(facts.join("; "))}.`, basis: undefined });
    items.push(...clarifyItems(v));
  }
  return finish(items);
}

export const GENERAL: SpecialtyPack = {
  id: "general",
  choices: GENERAL_CHOICES,
  groups: GENERAL_GROUPS,
  other: {
    title: "Something else not listed",
    description: "In your own words, like osteoporosis or colon polyps",
    // Short enough to show whole in the card at 320 px (placeholders don't wrap); plain words for hemochromatosis [N10].
    placeholder: "e.g. too much iron",
  },
  notePlaceholder: "e.g. “She had breast cancer in her 40s, I think.”",
  words: {
    docEyebrow: "Pre-visit family health history",
    topic: "the family’s health history",
    ownHeading: "Your own health history",
    ownEmpty: "Nothing yet. If you’ve had a condition from the list yourself, add it here.",
    gap: "their health history",
    findingLegend: "Condition reported",
    findingFilter: "Condition reported",
    pedigreeNote: "Filled symbols mean a condition was reported.",
    suggested: "Suggested for this visit",
    suggestedEmpty: "Nothing on this problem list matches this visit’s questions.",
    clinician: "their doctor",
    sexHint: "Used for the symbols on the family chart and for words like aunt or uncle.",
    careTeam:
      "Your care team gets a separate version through the practice link or the check-in QR. It lists the same facts, laid out for your clinician. It doesn’t diagnose anyone.",
  },
  careTeam: {
    showCount: false,
    reviewNote:
      "No guideline criteria are applied for this visit type yet. What each relative reported is listed below, as reported, for the clinician to interpret. Not a diagnosis or a risk score.",
    noneMatched: "No conditions were reported. Gaps below may still matter.",
    notedHeading: "Reported conditions · no criteria applied",
    notedLimit: 6,
    footer: ` No guideline criteria applied. Asked about: ${askedAbout(GENERAL_CHOICES)}. Relatives covered: parents, siblings, grandparents, aunts and uncles; not the patient’s children, nieces, nephews or cousins.`,
    chartLine: `Patient-reported family history for clinician review. Not a diagnosis or a risk score. No guideline criteria applied for this visit type. Asked about: ${askedAbout(GENERAL_CHOICES)}.`,
  },
  // In a general visit any reported condition fills the symbol.
  isFinding: (c) => !!c?.trim(),
  isSuggested: (c) => {
    const s = (c ?? "").toLowerCase();
    return GENERAL_TERMS.some((t) => s.includes(t));
  },
  reviewItems: generalReviewItems,
  criteria: false,
};
