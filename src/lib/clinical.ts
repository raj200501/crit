import type { FamilyTree, Relation } from "./types";
import { isCardiac, normalizeCondition, type PersonView } from "./status";

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

export interface Flag {
  personId: string;
  title: string;
  detail: string;
}

const has = (name: string, ...terms: string[]) => terms.some((t) => name.includes(t));

/**
 * Patterns a cardiology team usually wants to hear about. These are prompts for the
 * conversation, not a risk score or a diagnosis. Every condition report counts, whoever made it.
 */
export function flagsFor(tree: FamilyTree, views: PersonView[]): Flag[] {
  const flags: Flag[] = [];
  for (const v of views) {
    const p = v.person;
    if (p.relation === "self") continue;
    const firstDegree = FIRST_DEGREE.includes(p.relation);
    const add = (title: string, detail: string) => flags.push({ personId: p.id, title, detail });
    for (const r of v.conditions) {
      const name = normalizeCondition(r.condition);
      const age = r.ageAtOnset;
      const where = `${p.label}${firstDegree ? " (first-degree)" : ""}`;
      const ageText = age != null ? `${r.approximate ? "about " : ""}age ${age}` : "age not known";
      const line = `${where}: ${r.condition}, ${ageText}.`;

      if (has(name, "sudden", "unexplained death", "died suddenly")) {
        if (age == null) add("Sudden or unexplained death (age not known)", `${line} Ask how old they were.`);
        else if (age < 50) add("Sudden or unexplained death at a young age", line);
      } else if (has(name, "cardiac arrest", "heart stopped", "resuscitat", "defibrillator", "icd")) {
        add("Survived cardiac arrest or has a defibrillator", line);
      } else if (has(name, "cardiomyopathy", "long qt", "brugada", "cpvt", "inherited rhythm")) {
        add("Worth asking about an inherited heart condition", line);
      } else if (has(name, "aort", "dissection", "marfan")) {
        add("Aortic aneurysm or dissection in the family", line);
      } else if (has(name, "faint", "syncope", "passed out")) {
        if (age != null && age < 40) add("Unexplained fainting at a young age", line);
      } else if (has(name, "heart attack", "coronary", "angina", "bypass", "stent")) {
        if (!firstDegree) continue;
        if (age == null) {
          add("Heart disease in a parent or sibling, age not known", `${line} Early means before 55 for a man, 65 for a woman.`);
          continue;
        }
        const cutoff = p.sex === "male" ? 55 : 65;
        if (age >= cutoff) continue;
        const basis =
          p.sex === "female"
            ? "before 65 for a woman"
            : p.sex === "male"
              ? "before 55 for a man"
              : age < 55
                ? "before 55 for a man or 65 for a woman"
                : "before 65 for a woman; sex not recorded";
        add("Early heart disease in a parent or sibling", `${where}: ${r.condition}, ${ageText} (${basis}).`);
      } else if (has(name, "stroke", "tia")) {
        const cutoff = p.sex === "male" ? 55 : 65;
        if (firstDegree && age != null && age < cutoff) add("Early stroke in a parent or sibling", line);
      } else if (has(name, "arrhythmia", "fibrillation", "afib")) {
        if (age != null && age < 50) add("Irregular heartbeat at a young age", line);
      } else if (has(name, "cholesterol", "hypercholesterol")) {
        const explicit = name === "very high cholesterol" || has(name, "very high", "familial", "inherited");
        if (explicit) add("Very high cholesterol in the family", line);
        else if (age != null && age < 40) add("High cholesterol at a young age", line);
      }
    }
    if (v.status === "conflicting" && v.cardiac) {
      add("Reports disagree", `${p.label}: ${v.reason}. Worth clarifying what happened and when.`);
    }
  }
  // One flag per person+title; red flags before "reports disagree".
  const seen = new Set<string>();
  return flags
    .filter((f) => (seen.has(f.personId + f.title) ? false : (seen.add(f.personId + f.title), true)))
    .sort((a, b) => Number(a.title === "Reports disagree") - Number(b.title === "Reports disagree"));
}

export function stillToConfirm(views: PersonView[]) {
  return views.filter((v) => v.person.relation !== "self" && (v.status === "unknown" || v.status === "conflicting"));
}

export { isCardiac };
