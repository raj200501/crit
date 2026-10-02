// Logic tests for status derivation, red flags, reply import and what leaves the browser.
// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { flagsFor } from "../src/lib/clinical";
import { blankTree, demoTree } from "../src/lib/demo";
import { toFhirBundle } from "../src/lib/fhir";
import { shareableTree } from "../src/lib/redact";
import { cleanTree } from "../src/lib/sanitize";
import { askAbout } from "../src/lib/share";
import { viewPerson, viewTree } from "../src/lib/status";
import type { FamilyTree, Person, Report } from "../src/lib/types";

let n = 0;
const rep = (personId: string, r: Partial<Report>): Report => ({
  id: `r${++n}`,
  personId,
  kind: "condition",
  reportedBy: "Someone",
  source: "relative",
  reportedAt: `2026-09-${String(10 + n).padStart(2, "0")}T00:00:00Z`,
  ...r,
});
const view = (t: FamilyTree, id: string) => viewPerson(t, t.people.find((p) => p.id === id)!);
const titles = (t: FamilyTree) => flagsFor(t, viewTree(t)).map((f) => f.title);
const withPeople = (t: FamilyTree, ...people: Person[]) => ({ ...t, people: [...t.people, ...people] });

test("demo family derives the statuses shown in the deck", () => {
  const t = demoTree();
  assert.equal(view(t, "dev").status, "known");
  assert.equal(view(t, "dev").verified, true);
  assert.equal(view(t, "dad").status, "conflicting");
  assert.equal(view(t, "dad").headline, "Heart attack at 60?");
  assert.equal(view(t, "mom").status, "known");
  assert.equal(view(t, "pgf").status, "unknown");
  assert.equal(view(t, "pgm").status, "declined");
  assert.deepEqual(titles(t), ["Irregular heartbeat at a young age", "Reports disagree"]);
});

test("an unrelated portal fact does not hide another relative's early heart attack", () => {
  const t = blankTree("Alex");
  t.reports = [
    rep("dad", { condition: "Heart attack or coronary artery disease", ageAtOnset: 48, reportedBy: "Mom" }),
    rep("dad", { condition: "Essential hypertension", ageAtOnset: 40, reportedBy: "Dad", source: "record", record: { system: "MyChart", reference: "x" } }),
  ];
  assert.ok(titles(t).includes("Early heart disease in a parent or sibling"));
});

test("a firsthand answer naming another condition keeps the reported one flagged and marks disagreement", () => {
  const t = blankTree("Alex");
  t.reports = [
    rep("dad", { condition: "Heart attack or coronary artery disease", ageAtOnset: 48, reportedBy: "Mom" }),
    rep("dad", { condition: "Arrhythmia", ageAtOnset: 60, reportedBy: "Dad", source: "self" }),
  ];
  assert.equal(view(t, "dad").status, "conflicting");
  assert.ok(titles(t).includes("Early heart disease in a parent or sibling"));
});

test("early heart disease is flagged for a sibling whose sex is not set", () => {
  const t = withPeople(blankTree("Alex"), { id: "sam", relation: "sibling", label: "Sam", sex: "unknown" });
  t.reports = [rep("sam", { condition: "Heart attack or coronary artery disease", ageAtOnset: 40 })];
  assert.ok(titles(t).includes("Early heart disease in a parent or sibling"));
  t.reports = [rep("sam", { condition: "Heart attack or coronary artery disease", ageAtOnset: 60 })];
  const f = flagsFor(t, viewTree(t)).find((x) => x.title === "Early heart disease in a parent or sibling");
  assert.match(f!.detail, /sex not recorded/);
});

test("a reporter who adds a condition is not a disagreement; disjoint lists are", () => {
  const t = blankTree("Alex");
  t.reports = [
    rep("dad", { condition: "Heart attack", reportedBy: "Mom" }),
    rep("dad", { condition: "Heart attack", reportedBy: "Uncle" }),
    rep("dad", { condition: "Stroke or TIA", reportedBy: "Uncle" }),
  ];
  assert.equal(view(t, "dad").status, "known");
  t.reports = [rep("dad", { condition: "Heart attack", reportedBy: "Mom" }), rep("dad", { condition: "Angina", reportedBy: "Uncle" })];
  assert.equal(view(t, "dad").status, "conflicting");
});

test("aortic disease, cardiac arrest survivors and inherited rhythm conditions are flagged; ordinary cholesterol is not", () => {
  const t = blankTree("Alex");
  t.reports = [
    rep("pgf", { condition: "Aortic aneurysm or dissection", ageAtOnset: 70 }),
    rep("mgf", { condition: "Survived cardiac arrest or has an ICD", ageAtOnset: 62 }),
    rep("mgm", { condition: "Inherited rhythm condition (long QT, Brugada, CPVT)" }),
    rep("pgm", { condition: "High cholesterol", ageAtOnset: 55 }),
    rep("mom", { condition: "Unexplained fainting", ageAtOnset: 60 }),
  ];
  const got = titles(t);
  assert.ok(got.includes("Aortic aneurysm or dissection in the family"));
  assert.ok(got.includes("Survived cardiac arrest or has a defibrillator"));
  assert.ok(got.includes("Worth asking about an inherited heart condition"));
  assert.ok(!got.some((x) => x.toLowerCase().includes("cholesterol")));
  assert.ok(!got.some((x) => x.toLowerCase().includes("fainting")));
});

test("a decline hides other relatives' reports but keeps what the patient knows", () => {
  const t = demoTree();
  t.reports.push(rep("pgm", { condition: "Heart attack", ageAtOnset: 50, reportedBy: "Mom" }));
  t.reports.push(rep("pgm", { condition: "Cardiomyopathy", reportedBy: "Alex", source: "patient" }));
  const v = view(t, "pgm");
  assert.equal(v.status, "declined");
  assert.deepEqual(
    v.conditions.map((r) => r.condition),
    ["Cardiomyopathy"],
  );
  const shared = shareableTree(t);
  assert.ok(!shared.reports.some((r) => r.personId === "pgm" && r.reportedBy === "Mom"));
  assert.equal(shared.invites.length, 0);
  const fmh = toFhirBundle(t).entry.find((e) => (e.resource as { id: string }).id === "fmh-pgm")!.resource as { condition?: { code: { text: string } }[] };
  assert.deepEqual(
    fmh.condition?.map((c) => c.code.text),
    ["Cardiomyopathy"],
  );
});

test("mother is asked about father; uncle is not asked about mother", () => {
  const t = demoTree();
  const mom = t.people.find((p) => p.id === "mom")!;
  const dev = t.people.find((p) => p.id === "dev")!;
  assert.ok(askAbout(t, mom).some((a) => a.id === "dad"));
  assert.ok(!askAbout(t, dev).some((a) => a.id === "mom"));
});

test("stored trees are validated: junk reports are dropped instead of crashing", () => {
  const t = demoTree() as unknown as Record<string, unknown>;
  (t.reports as unknown[]).push(
    null,
    5,
    { personId: "dad", kind: "condition", source: "relative" },
    { personId: "nobody", kind: "dont-know", source: "self", id: "z" },
  );
  const clean = cleanTree(t)!;
  assert.equal(clean.reports.length, demoTree().reports.length);
  assert.equal(cleanTree({ nope: true }), null);
});
