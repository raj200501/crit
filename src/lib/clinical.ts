import type { FamilyTree, Relation } from "./types";
import { formatCondition, isCardiac, normalizeCondition, type PersonView } from "./status";

// Guided cardiac questions: plain words with examples, because patients answer
// "any family history?" with "no" until someone names the condition.

export interface Choice {
  id: string;
  label: string;
  examples: string;
  /** Condition name stored in the report. */
  condition: string;
}

export const HEART_CHOICES: Choice[] = [
  {
    id: "mi",
    label: "Heart attack or blocked arteries",
    examples: "stent, bypass surgery, angina (chest pain from the heart)",
    condition: "Heart attack or coronary artery disease",
  },
  {
    id: "arrhythmia",
    label: "Irregular heartbeat",
    examples: "atrial fibrillation (AFib), arrhythmia, pacemaker",
    condition: "Arrhythmia",
  },
  {
    id: "arrest",
    label: "Survived a cardiac arrest, or has an implanted defibrillator",
    examples: "heart stopped and was restarted with CPR or a shock, has an ICD",
    condition: "Survived cardiac arrest or has an ICD",
  },
  {
    id: "sudden",
    label: "Sudden or unexplained death",
    examples: "died suddenly or in their sleep, unexplained drowning or car crash, died after collapsing during exercise",
    condition: "Sudden unexplained death",
  },
  {
    id: "cardiomyopathy",
    label: "Heart muscle disease",
    examples: "cardiomyopathy, thick or enlarged heart, heart failure at a young age",
    condition: "Cardiomyopathy",
  },
  {
    id: "inherited-rhythm",
    label: "A diagnosed inherited rhythm condition",
    examples: "long QT syndrome, Brugada syndrome, CPVT",
    condition: "Inherited rhythm condition (long QT, Brugada, CPVT)",
  },
  {
    id: "faint",
    label: "Unexplained fainting",
    examples: "passed out without warning, or while exercising",
    condition: "Unexplained fainting",
  },
  {
    id: "fh",
    label: "Very high cholesterol",
    examples: "familial hypercholesterolemia, cholesterol treated from a young age",
    condition: "Very high cholesterol",
  },
  {
    id: "aortic",
    label: "Aortic aneurysm or tear",
    examples: "aortic aneurysm, aortic dissection, Marfan syndrome",
    condition: "Aortic aneurysm or dissection",
  },
  {
    id: "stroke",
    label: "Stroke",
    examples: "stroke or mini-stroke (TIA)",
    condition: "Stroke or TIA",
  },
];

export const FIRST_DEGREE: Relation[] = ["mother", "father", "sibling"];
export const SECOND_DEGREE: Relation[] = [
  "paternal-grandfather",
  "paternal-grandmother",
  "maternal-grandfather",
  "maternal-grandmother",
  "paternal-aunt-uncle",
  "maternal-aunt-uncle",
];

/** guideline = a family-history criterion named in a cardiology guideline; noted = heart-related but no
 *  verified criterion; clarify = gaps and disagreements worth asking about. */
export type Tier = "guideline" | "noted" | "clarify";

export interface Flag {
  personId: string;
  tier: Tier;
  title: string;
  detail: string;
  /** Guideline (with year) the rule comes from; shown on the clinician document. */
  basis?: string;
}

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

const has = (name: string, ...terms: string[]) => terms.some((t) => name.includes(t));

function sideOf(r: Relation) {
  if (r.startsWith("paternal") || r === "father") return "father's side";
  if (r.startsWith("maternal") || r === "mother") return "mother's side";
  return "";
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
    const side = sideOf(p.relation);
    const add = (tier: Tier, title: string, detail: string, basis?: string) => items.push({ personId: p.id, tier, title, detail, basis });

    for (const r of v.conditions) {
      const name = normalizeCondition(r.condition);
      const age = r.ageAtOnset;
      const who = `${p.label}${side ? ` (${side})` : ""}`;
      const ageText = age != null ? `${r.approximate ? "about " : ""}age ${age}` : "age not known";
      const src = r.source === "record" ? "from a portal record" : r.source === "self" ? "self-reported" : `reported by ${r.reportedBy}`;
      const line = `${who}: ${r.condition}, ${ageText}, ${src}.`;

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
      } else if (has(name, "aort", "dissection", "marfan")) {
        if (first) add("guideline", "Aortic aneurysm or dissection in a parent or sibling", line, BASIS.aortic);
        else add("noted", "Aortic aneurysm or dissection in a relative", line, BASIS.none);
      } else if (has(name, "heart attack", "coronary", "angina", "bypass", "stent")) {
        if (!first) continue;
        if (age == null) {
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

    // --- To clarify ---
    if (v.status === "conflicting") {
      const said = [...v.conditions, ...v.reports.filter((r) => r.kind === "no-history")]
        .map(
          (r) =>
            `${r.reportedBy} says ${r.kind === "no-history" ? "no heart history" : formatCondition(r).toLowerCase().replace(", age ", " at ").replace("about age", "about")}`,
        )
        .join("; ");
      add("clarify", `Reports disagree: ${p.label}`, `${said}.`);
    }
    if ((first || p.relation.endsWith("grandfather") || p.relation.endsWith("grandmother")) && v.status === "unknown") {
      add("clarify", `${p.label}: unknown`, `${v.headline}.`);
    }
    if (v.status === "declined") add("clarify", `${p.label}: declined to share`, "Only what the patient knows firsthand is shown.");
    if (first && p.deceased && (p.ageAtDeath == null || !p.causeOfDeath)) {
      add(
        "clarify",
        `${p.label} (deceased): ${p.ageAtDeath == null && !p.causeOfDeath ? "age and cause" : p.ageAtDeath == null ? "age" : "cause"} of death not recorded`,
        "Ask how old they were and what happened.",
      );
    }
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

  const seen = new Set<string>();
  const order: Record<Tier, number> = { guideline: 0, noted: 1, clarify: 2 };
  return items.filter((f) => (seen.has(f.personId + f.title) ? false : (seen.add(f.personId + f.title), true))).sort((a, b) => order[a.tier] - order[b.tier]);
}

export function stillToConfirm(views: PersonView[]) {
  return views.filter((v) => v.person.relation !== "self" && (v.status === "unknown" || v.status === "conflicting"));
}

export { isCardiac };
