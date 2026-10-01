import type { FamilyTree, Person } from "./types";

// Synthetic demo family. Matches the crit deck and demo video:
// uncle's AFib verified from a portal record, father's history conflicting,
// grandfather unknown, grandmother declined. Not a real patient.

const people: Person[] = [
  { id: "self", relation: "self", label: "Alex (you)", sex: "unknown" },
  { id: "mom", relation: "mother", label: "Mom", sex: "female" },
  { id: "dad", relation: "father", label: "Dad", sex: "male", deceased: true },
  { id: "dev", relation: "paternal-aunt-uncle", label: "Uncle Dev", sex: "male" },
  { id: "pgf", relation: "paternal-grandfather", label: "Grandpa Ray", sex: "male", deceased: true },
  { id: "pgm", relation: "paternal-grandmother", label: "Grandma June", sex: "female" },
  { id: "mgf", relation: "maternal-grandfather", label: "Grandpa Luis", sex: "male" },
  { id: "mgm", relation: "maternal-grandmother", label: "Grandma Rosa", sex: "female" },
];

export function demoTree(): FamilyTree {
  return {
    id: "demo",
    patientName: "Alex",
    visit: { specialty: "Cardiology", date: "2026-10-14", practice: "Cardiology Associates (demo)" },
    people: structuredClone(people),
    reports: [
      {
        id: "r-dev-record",
        personId: "dev",
        kind: "condition",
        condition: "Atrial fibrillation",
        ageAtOnset: 34,
        reportedBy: "Uncle Dev",
        reportedById: "dev",
        source: "record",
        reportedAt: "2026-09-28T18:12:00Z",
        record: {
          system: "MyChart (demo sandbox)",
          reference: "Condition/demo-afib-2009",
          code: { system: "http://snomed.info/sct", code: "49436004", display: "Atrial fibrillation" },
          recordedDate: "2009-04-02",
        },
      },
      {
        id: "r-dad-mom",
        personId: "dad",
        kind: "condition",
        condition: "Heart attack",
        ageAtOnset: 60,
        reportedBy: "Mom",
        reportedById: "mom",
        source: "relative",
        reportedAt: "2026-09-27T14:03:00Z",
      },
      {
        id: "r-dad-dev",
        personId: "dad",
        kind: "condition",
        condition: "Angina",
        ageAtOnset: 58,
        approximate: true,
        note: "I think it was chest pain, not a full heart attack. He was around 58.",
        reportedBy: "Uncle Dev",
        reportedById: "dev",
        source: "relative",
        reportedAt: "2026-09-28T18:15:00Z",
      },
      {
        id: "r-mom-self",
        personId: "mom",
        kind: "no-history",
        reportedBy: "Mom",
        reportedById: "mom",
        source: "self",
        reportedAt: "2026-09-27T14:01:00Z",
      },
      {
        id: "r-pgm-self",
        personId: "pgm",
        kind: "declined",
        reportedBy: "Grandma June",
        reportedById: "pgm",
        source: "self",
        reportedAt: "2026-09-29T16:40:00Z",
      },
      {
        id: "r-pgf-dev",
        personId: "pgf",
        kind: "dont-know",
        note: "He passed before I was old enough to ask.",
        reportedBy: "Uncle Dev",
        reportedById: "dev",
        source: "relative",
        reportedAt: "2026-09-28T18:17:00Z",
      },
    ],
    invites: [
      { id: "i-mom", personId: "mom", token: "demo-mom", createdAt: "2026-09-26T20:00:00Z", answeredAt: "2026-09-27T14:03:00Z" },
      { id: "i-dev", personId: "dev", token: "demo-dev", createdAt: "2026-09-26T20:00:00Z", answeredAt: "2026-09-28T18:17:00Z" },
      { id: "i-pgm", personId: "pgm", token: "demo-pgm", createdAt: "2026-09-26T20:01:00Z", answeredAt: "2026-09-29T16:40:00Z" },
    ],
    synthetic: true,
    updatedAt: "2026-09-29T16:40:00Z",
  };
}

/** A fresh tree: you, parents, and four grandparents. Aunts, uncles and siblings get added as needed. */
export function blankTree(patientName = "You"): FamilyTree {
  const base: Person[] = [
    { id: "self", relation: "self", label: `${patientName} (you)`, sex: "unknown" },
    { id: "mom", relation: "mother", label: "Mother", sex: "female" },
    { id: "dad", relation: "father", label: "Father", sex: "male" },
    { id: "pgf", relation: "paternal-grandfather", label: "Father's father", sex: "male" },
    { id: "pgm", relation: "paternal-grandmother", label: "Father's mother", sex: "female" },
    { id: "mgf", relation: "maternal-grandfather", label: "Mother's father", sex: "male" },
    { id: "mgm", relation: "maternal-grandmother", label: "Mother's mother", sex: "female" },
  ];
  return {
    id: `t-${Date.now().toString(36)}`,
    patientName,
    people: base,
    reports: [],
    invites: [],
    synthetic: true,
    updatedAt: new Date().toISOString(),
  };
}
