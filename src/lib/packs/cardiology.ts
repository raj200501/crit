// The cardiology pack: the heart questions and the family-history criteria named in cardiology guidelines. Every string
// and rule here is the one Stemma had before visit types existed (moved from src/lib/clinical.ts and AnswerForm.tsx).
import { isCardiac, normalizeCondition } from "../conditions";
import type { PersonView } from "../status";
import type { FamilyTree } from "../types";
import { HEART_CHOICES } from "./choices";
import { clarifyItems, finish, FIRST_DEGREE, has, reportedFact, SECOND_DEGREE, ageTextOf, sourceOf, suddenFact, whoOf } from "./shared";
import type { Flag, SpecialtyPack, Tier } from "./types";

// Presentation-only grouping of the HEART_CHOICES ids (DESIGN §12.4). Unknown ids fall into "Other".
const GROUPS: { title: string; ids: string[] }[] = [
  { title: "Arteries & cholesterol", ids: ["mi", "fh", "stroke"] },
  { title: "Rhythm", ids: ["arrhythmia", "inherited-rhythm", "faint"] },
  { title: "Sudden events", ids: ["arrest", "sudden"] },
  { title: "Heart muscle & aorta", ids: ["cardiomyopathy", "aortic"] },
];

export const BASIS = {
  ascvd: "ACC/AHA 2018 cholesterol guideline (premature ASCVD); still a risk enhancer in the 2026 ACC/AHA dyslipidemia guideline",
  fh: "Dutch Lipid Clinic and Simon Broome criteria (first-degree relative); 2026 ACC/AHA dyslipidemia guideline",
  fhSecond: "Simon Broome Register criteria, 1991 (first- or second-degree adult relative with total cholesterol above 290 mg/dL)",
  cardiomyopathy: "AHA/ACC 2024 HCM guideline; ESC 2025 DCM family consensus",
  aortic: "ACC/AHA 2022 aortic disease guideline",
  arrhythmia: "Inherited-arrhythmia diagnostic criteria count family history (score not computed)",
  sudden: "APHRS/HRS 2020 sudden unexplained death consensus",
  none: "No verified family-history criterion",
} as const;

export const CRITERIA_FOOTNOTE = "ACC/AHA 2018 and 2026 (lipids), Simon Broome and Dutch Lipid Clinic (familial hypercholesterolemia), AHA/ACC 2024 (HCM), ESC 2025 (DCM), ACC/AHA 2022 (aorta), APHRS/HRS 2020 (sudden death)";

/**
 * The aorta itself: an aneurysm, a dissection or a widened root (docs/research.md §3.1, ACC/AHA 2022). An aortic valve
 * problem is not aortic disease: "bicuspid aortic valve", "aortic stenosis" and "aortic regurgitation" name the valve.
 * A dissection counts unless it names another artery (a coronary or carotid tear is not an aortic one).
 */
function aorticDisease(name: string): boolean {
  const aorta = has(name, "aort");
  if (has(name, "dissection") && (aorta || !has(name, "coronary", "carotid", "vertebral", "scad"))) return true;
  if (!aorta) return false;
  return has(name, "aneurysm", "dilat", "enlarg", "root", "tear") || !has(name, "valve", "stenosis", "regurgitation", "insufficiency");
}

/**
 * The clinician's review list, in three tiers. Descriptive, never imperative or diagnostic; shown only
 * on the clinician document. Every condition report counts, whoever made it.
 */
export function reviewItems(tree: FamilyTree, views: PersonView[]): Flag[] {
  const items: Flag[] = [];
  const cardioPeople = new Set<string>();

  for (const v of views) {
    const p = v.person;
    if (p.relation === "self") continue;
    const first = FIRST_DEGREE.includes(p.relation);
    const second = SECOND_DEGREE.includes(p.relation);
    const add = (tier: Tier, title: string, detail: string, basis?: string) => items.push({ personId: p.id, tier, title, detail, basis });
    const who = whoOf(p);

    for (const r of v.conditions) {
      const name = normalizeCondition(r.condition);
      const age = r.ageAtOnset;
      const ageText = ageTextOf(r);
      const src = sourceOf(r);
      const line = `${who}: ${reportedFact(r)}.`;

      if (has(name, "sudden", "unexplained death", "died suddenly", "cardiac arrest", "heart stopped", "resuscitat", "defibrillator", "icd")) {
        if (age != null && age < 40) add("guideline", "Sudden death or cardiac arrest before 40", line, BASIS.sudden);
        else add("noted", "Sudden death or cardiac arrest", `${line} Ask age, circumstances and autopsy.`, BASIS.sudden);
      } else if (has(name, "long qt", "brugada", "cpvt", "inherited rhythm")) {
        if (first || second) add("guideline", "Named inherited arrhythmia in the family", line, BASIS.arrhythmia);
        else add("noted", "Named inherited arrhythmia in the family", line, BASIS.none);
      } else if (has(name, "cardiomyopathy", "thick heart", "enlarged heart", "weak heart")) {
        cardioPeople.add(p.id);
        if (first) add("guideline", "Cardiomyopathy in a parent or sibling", line, BASIS.cardiomyopathy);
        else add("noted", "Cardiomyopathy in a relative", line, BASIS.none);
      } else if (aorticDisease(name)) {
        if (first) add("guideline", "Aortic aneurysm or dissection in a parent or sibling", line, BASIS.aortic);
        else add("noted", "Aortic aneurysm or dissection in a relative", line, BASIS.none);
      } else if (has(name, "dissection") && !has(name, "marfan", "bicuspid")) {
        // A tear in another artery (coronary, carotid): no verified family-history criterion, and not the premature
        // coronary heart disease the next rule means. It still shows in the family history table.
        continue;
      } else if (has(name, "marfan", "bicuspid")) {
        // Not in the verified guideline text (docs/research.md §3.1): ask about it, never alert on it.
        add("noted", "Marfan syndrome or bicuspid aortic valve in a relative", line, BASIS.none);
      } else if (has(name, "heart attack", "coronary", "angina", "bypass", "stent")) {
        if (!first) continue;
        if (age == null) {
          // An age criterion, so it lives here and never in the shared "to clarify" items.
          add("clarify", "Age not known for heart disease in a parent or sibling", `${line} Early means before 55 for a man, 65 for a woman.`);
          continue;
        }
        const cutoff = p.sex === "female" ? 65 : 55;
        if (age < cutoff) {
          const basis = p.sex === "female" ? "before 65 for a woman" : p.sex === "male" ? "before 55 for a man" : "before 55 for a man or 65 for a woman";
          add("guideline", "Early heart disease in a parent or sibling", `${who}: ${r.condition}, ${ageText} (${basis}), ${src}.`, BASIS.ascvd);
        } else if (p.sex === "unknown" && age < 65) {
          add("noted", "Heart disease in a parent or sibling, sex not recorded", `${line} Early if she is female (before 65).`, BASIS.ascvd);
        }
      } else if (has(name, "cholesterol", "hypercholesterol", "ldl")) {
        const explicit = name === "very high cholesterol" || has(name, "very high", "familial", "inherited", "ldl");
        if (explicit && first) add("guideline", "Very high cholesterol in a parent or sibling", `${line} Level not reported.`, BASIS.fh);
        else if (explicit && second) add("guideline", "Very high cholesterol in a grandparent, aunt or uncle", `${line} Level not reported.`, BASIS.fhSecond);
        else if (age != null && age < 40) add("noted", "High cholesterol at a young age", line, BASIS.none);
      } else if (has(name, "arrhythmia", "fibrillation", "afib", "pacemaker")) {
        if (age != null && age < 60) add("noted", "Irregular heartbeat", line, BASIS.none);
      } else if (has(name, "stroke", "tia")) {
        const cutoff = p.sex === "male" ? 55 : 65;
        if (first && age != null && age < cutoff) add("noted", "Early stroke in a parent or sibling", line, BASIS.none);
      } else if (has(name, "faint", "syncope", "passed out")) {
        if (age != null && age < 40) add("noted", "Unexplained fainting at a young age", line, BASIS.none);
      }
    }

    // A death the patient marked "sudden or unexpected" (Edit details), under the same rule as a reported sudden death.
    // A report that already says so gives the same title, and the de-duplication below keeps one. The cause the patient
    // gave goes in the line, so the clinician can tell an unexplained death from, say, an accident.
    if (p.deceased && p.suddenDeath) {
      const a = p.ageAtDeath;
      const l = `${who}: ${suddenFact(p, tree)}.`;
      if (a != null && a < 40) add("guideline", "Sudden death or cardiac arrest before 40", l, BASIS.sudden);
      else add("noted", "Sudden death or cardiac arrest", `${l} Ask age, circumstances and autopsy.`, BASIS.sudden);
    }

    // --- To clarify ---
    items.push(...clarifyItems(v));
  }

  // Cardiomyopathy in two or more first- or second-degree relatives.
  const cmRelatives = views.filter(
    (v) => cardioPeople.has(v.person.id) && (FIRST_DEGREE.includes(v.person.relation) || SECOND_DEGREE.includes(v.person.relation)),
  );
  if (cmRelatives.length >= 2 && !items.some((i) => i.tier === "guideline" && i.title.startsWith("Cardiomyopathy"))) {
    items.push({
      personId: cmRelatives[0].person.id,
      tier: "guideline",
      title: "Cardiomyopathy in two or more relatives",
      detail: `${cmRelatives.map((v) => v.person.label).join(", ")}.`,
      basis: BASIS.cardiomyopathy,
    });
  }

  return finish(items);
}

export const CARDIOLOGY: SpecialtyPack = {
  id: "cardiology",
  choices: HEART_CHOICES,
  groups: GROUPS,
  other: {
    title: "Something else heart-related",
    description: "In your own words, like Marfan syndrome or a bicuspid valve",
    placeholder: "e.g. heart murmur, valve surgery",
  },
  notePlaceholder: "e.g. “He had chest pain in his late 50s, I think it was angina.”",
  words: {
    docEyebrow: "Pre-visit family heart history",
    topic: "the family’s heart health",
    ownHeading: "Your own heart history",
    ownEmpty: "Nothing yet. If you’ve had any heart condition yourself, add it here.",
    gap: "their heart history",
    findingLegend: "Heart condition reported",
    findingFilter: "Heart-related condition reported",
    pedigreeNote: "Filled symbols mean a heart condition was reported.",
    suggested: "Suggested: heart-related",
    suggestedEmpty: "No heart-related conditions on this problem list.",
    clinician: "their cardiologist",
    sexHint: "Used only for age cutoffs on the summary (e.g. early heart disease).",
    careTeam:
      "Your care team gets a separate version through the practice link or the check-in QR. It adds family-history criteria from cardiology guidelines for your clinician to review. It doesn’t diagnose anyone.",
  },
  careTeam: {
    showCount: true,
    reviewNote: "Family-history criteria named in cardiology guidelines, matched to what was reported. For the clinician to interpret; not a diagnosis or a risk score.",
    noneMatched: "No guideline family-history criteria matched what was reported. Gaps below may still matter.",
    notedHeading: "Also noted · no guideline criterion",
    footer: ` Criteria: ${CRITERIA_FOOTNOTE}.`,
    chartLine: `Patient-reported family history for clinician review. Not a diagnosis or a risk score. Criteria versions: ${CRITERIA_FOOTNOTE}.`,
  },
  isFinding: isCardiac,
  isSuggested: isCardiac,
  reviewItems,
  criteria: true,
};
