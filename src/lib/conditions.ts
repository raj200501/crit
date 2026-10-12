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

/** The non-heart topics the general cards ask about: high blood pressure, diabetes and any cancer ("Another cancer" is
 *  open, so every cancer name counts). */
export const GENERAL_NON_HEART_TERMS = [
  "hypertension",
  "high blood pressure",
  "diabet",
  "cancer",
  "carcinoma",
  "malignan",
  "neoplasm",
  "tumor",
  "tumour",
  "leukemia",
  "leukaemia",
  "lymphoma",
  "melanoma",
  "myeloma",
  "sarcoma",
];

/** Heart words that name an event or a symptom, not a heart condition: no general card asks about them. */
const HEART_EVENT_TERMS = new Set(["sudden", "unexplained death", "died suddenly", "faint", "syncope"]);

/**
 * What the general question cards ask about, read by topic: any heart or circulation condition (the heart terms, since
 * "Other heart disease" is open; not sudden deaths or fainting, which no general card names), high blood pressure,
 * diabetes and any cancer. The free-text card, "Something else not listed", is by its own name not on the list, so a
 * migraine or osteoporosis is not covered.
 */
export const GENERAL_LIST_TERMS = [...CARDIAC_TERMS.filter((t) => !HEART_EVENT_TERMS.has(t)), ...GENERAL_NON_HEART_TERMS];

/** The condition is one the general cards asked about (see GENERAL_LIST_TERMS). */
export function onGeneralList(condition: string | undefined): boolean {
  const c = (condition ?? "").toLowerCase();
  return GENERAL_LIST_TERMS.some((t) => c.includes(t));
}

export function formatCondition(r: Report): string {
  const name = r.condition ?? "Condition";
  if (r.ageAtOnset == null) return name;
  return `${name}, ${r.approximate ? "about " : ""}age ${r.ageAtOnset}`;
}

/** Normalized stored conditions of the cards that ask "What kind?" (saved as `${condition}: ${kind}`). */
export const DETAIL_BASES = ["other cancer", "other heart disease"];

/**
 * Two normalized condition names that name the same thing: equal, or one is a "What kind?" answer and the other its
 * plain form ("other cancer: prostate" and "other cancer"). Two different kinds still differ. No heart card or demo
 * condition starts with a detail base, so for them this is `===`.
 */
export function sameCondition(a: string, b: string) {
  if (a === b) return true;
  return DETAIL_BASES.some((base) => (a === base && b.startsWith(`${base}:`)) || (b === base && a.startsWith(`${base}:`)));
}

export function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
