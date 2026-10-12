// Condition names: normalizing, the heart-term test and display. A leaf module (imports only types), so status.ts and
// the specialty packs can both use it without an import cycle.
import type { Report } from "./types";

const SYNONYMS: Record<string, string> = {
  afib: "atrial fibrillation",
  "a-fib": "atrial fibrillation",
  "a fib": "atrial fibrillation",
  "irregular heartbeat": "arrhythmia",
  "heart attack": "heart attack",
  mi: "heart attack",
  "myocardial infarction": "heart attack",
  "high cholesterol": "high cholesterol",
  hcm: "hypertrophic cardiomyopathy",
};

export function normalizeCondition(name: string | undefined): string {
  const n = (name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  return SYNONYMS[n] ?? n;
}

export const CARDIAC_TERMS = [
  "heart",
  "cardi",
  "arrhythm",
  "fibrillation",
  "afib",
  "angina",
  "coronary",
  "bypass",
  "stent",
  "qt",
  "brugada",
  "sudden",
  "unexplained death",
  "died suddenly",
  "cardiac arrest",
  "aort",
  "marfan",
  "faint",
  "syncope",
  "cholesterol",
  "aneurysm",
  "pacemaker",
  "defibrillator",
  "valve",
  "stroke",
];

export function isCardiac(condition: string | undefined): boolean {
  const c = (condition ?? "").toLowerCase();
  return CARDIAC_TERMS.some((t) => c.includes(t));
}

export function formatCondition(r: Report): string {
  const name = r.condition ?? "Condition";
  if (r.ageAtOnset == null) return name;
  return `${name}, ${r.approximate ? "about " : ""}age ${r.ageAtOnset}`;
}

export function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
