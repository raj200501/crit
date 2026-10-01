import type { FamilyTree, Person, Relation } from "./types";
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
    examples: "atrial fibrillation (AFib), arrhythmia, pacemaker, implanted defibrillator",
    condition: "Arrhythmia",
  },
  {
    id: "sudden",
    label: "Sudden or unexplained death",
    examples: "died suddenly or in their sleep, unexplained drowning or car crash, collapsed during exercise",
    condition: "Sudden unexplained death",
  },
  {
    id: "cardiomyopathy",
    label: "Heart muscle disease",
    examples: "cardiomyopathy, thick or enlarged heart, heart failure at a young age",
    condition: "Cardiomyopathy",
  },
  {
    id: "faint",
    label: "Fainting or an inherited rhythm condition",
    examples: "unexplained fainting, long QT syndrome, Brugada syndrome",
    condition: "Fainting or inherited rhythm condition",
  },
  {
    id: "fh",
    label: "Very high cholesterol",
    examples: "familial hypercholesterolemia, cholesterol treated from a young age",
    condition: "Very high cholesterol",
  },
  {
    id: "stroke",
    label: "Stroke or aneurysm",
    examples: "stroke, mini-stroke (TIA), aortic aneurysm",
    condition: "Stroke or aneurysm",
  },
];

export const FIRST_DEGREE: Relation[] = ["mother", "father", "sibling"];

export function sexOf(p: Person) {
  return p.sex;
}

export interface Flag {
  personId: string;
  title: string;
  detail: string;
}

const has = (name: string, ...terms: string[]) => terms.some((t) => name.includes(t));

/**
 * Patterns a cardiology team usually wants to hear about. These are prompts for the
 * conversation, not a risk score or a diagnosis.
 */
export function flagsFor(tree: FamilyTree, views: PersonView[]): Flag[] {
  const flags: Flag[] = [];
  for (const v of views) {
    const p = v.person;
    if (p.relation === "self") continue;
    const firstDegree = FIRST_DEGREE.includes(p.relation);
    for (const r of v.conditions) {
      const name = normalizeCondition(r.condition);
      const age = r.ageAtOnset;
      const where = `${p.label}${firstDegree ? " (first-degree)" : ""}`;
      const ageText = age != null ? `${r.approximate ? "about " : ""}age ${age}` : "age not known";
      if (has(name, "sudden", "unexplained death", "died suddenly") && (age == null || age < 50)) {
        flags.push({ personId: p.id, title: "Sudden or unexplained death at a young age", detail: `${where}: ${r.condition}, ${ageText}.` });
      } else if (has(name, "cardiomyopathy", "long qt", "brugada", "inherited rhythm")) {
        flags.push({ personId: p.id, title: "Possible inherited heart condition", detail: `${where}: ${r.condition}, ${ageText}.` });
      } else if (has(name, "heart attack", "coronary", "angina", "bypass", "stent")) {
        const cutoff = p.sex === "female" ? 65 : p.sex === "male" ? 55 : null;
        if (firstDegree && age != null && cutoff != null && age < cutoff) {
          flags.push({
            personId: p.id,
            title: "Early heart disease in a parent or sibling",
            detail: `${where}: ${r.condition}, ${ageText} (before ${cutoff} for a ${p.sex === "female" ? "woman" : "man"}).`,
          });
        }
      } else if (has(name, "arrhythmia", "fibrillation", "afib") && age != null && age < 50) {
        flags.push({ personId: p.id, title: "Irregular heartbeat at a young age", detail: `${where}: ${r.condition}, ${ageText}.` });
      } else if (has(name, "cholesterol", "hypercholesterolemia")) {
        flags.push({ personId: p.id, title: "Very high cholesterol in the family", detail: `${where}: ${r.condition}, ${ageText}.` });
      }
    }
    if (v.status === "conflicting" && v.cardiac) {
      flags.push({ personId: p.id, title: "Reports disagree", detail: `${p.label}: ${v.reason}. Worth clarifying what happened and when.` });
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
