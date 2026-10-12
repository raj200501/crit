// A deterministic corpus of cardiology-era trees (no visit type, no pack on any report), used to prove that the
// specialty-pack change leaves every cardiology output byte-identical to 8f6541b. Pure data: imports only types, so the
// fixture generator could run it against the 8f6541b source tree too (see tests/packs.test.ts, "identical output").
import type { FamilyTree, Person, Relation, Report, ReportKind, Sex, SourceKind } from "../../src/lib/types";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Condition strings a cardiology tree held before visit types: every heart card, the demo's, and free text that no new
 * rule touches. Left out on purpose: "Other cancer…" / "Other heart disease…" (the detail bases of sameCondition) and
 * free text starting with a general card's stored name ("Diabetes", "Breast cancer", "High blood pressure"…), whose
 * pedigree abbreviation changes by design (spec B.4, F9, F10).
 */
export const CORPUS_CONDITIONS = [
  "Heart attack or coronary artery disease",
  "Arrhythmia",
  "Survived cardiac arrest or has an ICD",
  "Sudden unexplained death",
  "Cardiomyopathy",
  "Inherited rhythm condition (long QT, Brugada, CPVT)",
  "Unexplained fainting",
  "Very high cholesterol",
  "Aortic aneurysm or dissection",
  "Stroke or TIA",
  "Heart attack",
  "Angina",
  "Atrial fibrillation",
  "High cholesterol",
  "Hypertrophic cardiomyopathy",
  "Marfan syndrome",
  "Bicuspid aortic valve",
  "Coronary artery dissection",
  "Essential hypertension",
  "Migraine",
  "Asthma",
  "Heart murmur",
  "Type 2 diabetes mellitus",
  "Prostate cancer",
  "Pacemaker",
  "MI",
];

const RELATIVES: Relation[] = ["sibling", "paternal-aunt-uncle", "maternal-aunt-uncle"];
const SEXES: Sex[] = ["female", "male", "unknown"];
const SOURCES: SourceKind[] = ["patient", "relative", "self", "record"];

export function corpusTree(seed: number): FamilyTree {
  const rnd = mulberry32(seed * 7919 + 17);
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)];
  const chance = (p: number) => rnd() < p;
  const sex = (fallback: Sex): Sex => (chance(0.15) ? pick(SEXES) : fallback);
  const death = (p: Person): Person => {
    if (!chance(0.3)) return p;
    return {
      ...p,
      deceased: true,
      ageAtDeath: chance(0.6) ? 20 + Math.floor(rnd() * 70) : undefined,
      causeOfDeath: chance(0.5) ? pick(["heart attack", "cancer", "accident", "stroke", "in her sleep"]) : undefined,
      suddenDeath: chance(0.3) ? true : undefined,
    };
  };
  const people: Person[] = [
    { id: "self", relation: "self", label: "Sam (you)", sex: pick(SEXES) },
    death({ id: "mom", relation: "mother", label: "Mother", sex: sex("female") }),
    death({ id: "dad", relation: "father", label: "Father", sex: sex("male") }),
    death({ id: "pgf", relation: "paternal-grandfather", label: "Father's father", sex: sex("male") }),
    death({ id: "pgm", relation: "paternal-grandmother", label: "Father's mother", sex: sex("female") }),
    death({ id: "mgf", relation: "maternal-grandfather", label: "Mother's father", sex: sex("male") }),
    death({ id: "mgm", relation: "maternal-grandmother", label: "Mother's mother", sex: sex("female") }),
  ];
  const extra = Math.floor(rnd() * 4);
  for (let i = 0; i < extra; i++) people.push(death({ id: `x${i}`, relation: pick(RELATIVES), label: `Relative ${i}`, sex: pick(SEXES) }));

  const reporters = ["Mom", "Uncle Dev", "Sam", "Aunt Kay", "Grandpa Luis"];
  const reports: Report[] = [];
  let minute = 0;
  for (const p of people) {
    const n = Math.floor(rnd() * (p.relation === "self" ? 3 : 5));
    for (let i = 0; i < n; i++) {
      const roll = rnd();
      let kind: ReportKind = roll < 0.62 ? "condition" : roll < 0.8 ? "no-history" : roll < 0.92 ? "dont-know" : "declined";
      let source: SourceKind = pick(SOURCES);
      if (kind === "declined") source = "self";
      if (source === "record") kind = "condition";
      const self = source === "self" || source === "record";
      minute += 1 + Math.floor(rnd() * 90);
      const r: Report = {
        id: `r${seed}-${reports.length}`,
        personId: p.id,
        kind,
        condition: kind === "condition" ? pick(CORPUS_CONDITIONS) : undefined,
        ageAtOnset: kind === "condition" && chance(0.7) ? 5 + Math.floor(rnd() * 80) : undefined,
        approximate: kind === "condition" && chance(0.3) ? true : undefined,
        note: chance(0.25) && kind !== "declined" ? pick(["I think so.", "He never talked about it.", "Ask Aunt Kay."]) : undefined,
        reportedBy: self ? p.label : source === "patient" ? "Sam" : pick(reporters),
        reportedById: self ? p.id : source === "patient" ? "self" : undefined,
        source,
        reportedAt: new Date(Date.UTC(2026, 8, 1, 0, minute)).toISOString(),
        record:
          source === "record"
            ? { system: "MyChart (demo sandbox)", reference: `Condition/c${reports.length}`, recordedDate: chance(0.5) ? "2011-03-04" : undefined }
            : undefined,
      };
      reports.push(r);
    }
  }
  const visit = pick([undefined, { specialty: "Cardiology", date: "2026-10-14" }, { specialty: "Dermatology", date: "", practice: "Skin Care (demo)" }]);
  return {
    id: `corpus-${seed}`,
    patientName: "Sam",
    ...(visit ? { visit } : {}),
    people,
    reports,
    invites: people
      .filter((p) => p.relation !== "self" && chance(0.3))
      .map((p, i) => ({ id: `i${i}`, personId: p.id, token: `t${i}`, createdAt: "2026-09-01T00:00:00Z", answeredAt: chance(0.5) ? "2026-09-02T00:00:00Z" : undefined })),
    synthetic: true,
    updatedAt: "2026-09-30T12:00:00Z",
  };
}

/** JSON that keeps keys whose value is undefined (node:assert/strict tells them apart from missing keys). */
export const keepUndefined = (v: unknown) => JSON.stringify(v, (_k, x) => (x === undefined ? "__undefined__" : x));

/** The FHIR bundle with its random fullUrls and clock timestamp replaced by fixed tokens. */
export function tokenizeFhir(bundle: unknown): string {
  return JSON.stringify(bundle, null, 2)
    .replace(/"urn:uuid:[0-9a-f-]{36}"/g, '"urn:uuid:FULLURL"')
    .replace(/"timestamp": "[^"]+"/, '"timestamp": "TIMESTAMP"');
}
