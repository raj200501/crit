// Logic tests for status derivation, red flags, reply import and what leaves the browser.
// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { BASIS, HEART_CHOICES, reviewItems, type Tier } from "../src/lib/clinical";
import { blankTree, demoTree } from "../src/lib/demo";
import { toFhirBundle } from "../src/lib/fhir";
import { shareableTree } from "../src/lib/redact";
import { cleanTree } from "../src/lib/sanitize";
import { askAbout } from "../src/lib/share";
import { familyRows } from "../src/components/summary/model";
import { addTarget } from "../src/components/tree/GhostNodes";
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
const titles = (t: FamilyTree, tier: Tier = "guideline") =>
  reviewItems(t, viewTree(t))
    .filter((f) => f.tier === tier)
    .map((f) => f.title);
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
  assert.deepEqual(titles(t), ["Very high cholesterol in a grandparent, aunt or uncle"]);
  // AF in a relative has no verified family-history criterion: noted, not a guideline match.
  assert.deepEqual(titles(t, "noted"), ["Irregular heartbeat"]);
  const clarify = titles(t, "clarify");
  assert.ok(clarify.includes("Reports disagree: Dad"));
  assert.ok(clarify.includes("Grandpa Ray: unknown"));
  assert.ok(clarify.includes("Grandma June: declined to share"));
  assert.ok(clarify.some((x) => x.startsWith("Dad (deceased)")));
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
  assert.deepEqual(titles(t), []);
  assert.deepEqual(titles(t, "noted"), ["Heart disease in a parent or sibling, sex not recorded"]);
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

test("guideline tier follows the verified rules: first-degree aorta, early sudden death, named arrhythmias", () => {
  const t = blankTree("Alex");
  t.reports = [
    rep("mom", { condition: "Aortic aneurysm or dissection", ageAtOnset: 70 }),
    rep("pgf", { condition: "Aortic aneurysm or dissection", ageAtOnset: 70 }),
    rep("mgf", { condition: "Survived cardiac arrest or has an ICD", ageAtOnset: 35 }),
    rep("mgm", { condition: "Inherited rhythm condition (long QT, Brugada, CPVT)" }),
    rep("pgm", { condition: "High cholesterol", ageAtOnset: 55 }),
    rep("dad", { condition: "Unexplained fainting", ageAtOnset: 60, reportedBy: "Mom" }),
  ];
  const got = titles(t);
  assert.ok(got.includes("Aortic aneurysm or dissection in a parent or sibling"));
  assert.ok(got.includes("Sudden death or cardiac arrest before 40"));
  assert.ok(got.includes("Named inherited arrhythmia in the family"));
  assert.ok(titles(t, "noted").includes("Aortic aneurysm or dissection in a relative")); // grandparent: noted only
  assert.ok(!got.some((x) => x.toLowerCase().includes("cholesterol")));
  assert.ok(!got.some((x) => x.toLowerCase().includes("fainting")));
});

test("Marfan syndrome and a bicuspid aortic valve are 'also noted', never a guideline item", () => {
  for (const condition of ["Marfan syndrome", "Bicuspid aortic valve"]) {
    const t = blankTree("Alex");
    t.reports = [rep("mom", { condition, ageAtOnset: 30 })];
    assert.deepEqual(titles(t), [], condition);
    assert.deepEqual(titles(t, "noted"), ["Marfan syndrome or bicuspid aortic valve in a relative"], condition);
    for (const f of reviewItems(t, viewTree(t)).filter((x) => x.tier === "noted")) assert.equal(f.basis, BASIS.none);
  }
  // an aortic valve problem is not aortic disease; an aneurysm or a tear still is, whatever else is named with it
  const t = blankTree("Alex");
  t.reports = [rep("mom", { condition: "Aortic valve stenosis" })];
  assert.deepEqual(reviewItems(t, viewTree(t)).filter((f) => f.tier !== "clarify"), []);
  t.reports = [rep("mom", { condition: "Bicuspid aortic valve with an aortic aneurysm" })];
  assert.deepEqual(titles(t), ["Aortic aneurysm or dissection in a parent or sibling"]);
  t.reports = [rep("mom", { condition: "Brain aneurysm" })];
  assert.deepEqual(titles(t), []);
});

test("the aortic card's examples no longer name Marfan syndrome", () => {
  const aortic = HEART_CHOICES.find((c) => c.id === "aortic")!;
  assert.ok(!/marfan/i.test(aortic.examples));
  assert.match(aortic.examples, /aneurysm/);
});

test("a death marked sudden or unexpected feeds the sudden-death rule: guideline before 40, else also noted", () => {
  const died = (age: number | undefined, sudden = true): FamilyTree => {
    const t = blankTree("Alex");
    t.people = t.people.map((p) => (p.id === "dad" ? { ...p, deceased: true, ageAtDeath: age, suddenDeath: sudden || undefined } : p));
    return t;
  };
  const at38 = reviewItems(died(38), viewTree(died(38))).filter((f) => f.personId === "dad" && f.tier !== "clarify");
  assert.deepEqual(
    at38.map((f) => [f.tier, f.title, f.basis]),
    [["guideline", "Sudden death or cardiac arrest before 40", BASIS.sudden]],
  );
  assert.equal(at38[0].detail, "Father (father's side): died suddenly or unexpectedly, age 38, reported by Alex.");
  assert.deepEqual(titles(died(62)), []);
  assert.deepEqual(titles(died(62), "noted"), ["Sudden death or cardiac arrest"]);
  assert.match(reviewItems(died(undefined), viewTree(died(undefined))).find((f) => f.tier === "noted")!.detail, /age not known.*Ask age, circumstances and autopsy\./);
  // not marked sudden: no item; the switch and a report saying the same thing give one item, not two
  assert.deepEqual(titles(died(38, false)), []);
  const both = died(38);
  both.reports = [rep("dad", { condition: "Sudden unexplained death", ageAtOnset: 38, reportedBy: "Mom" })];
  assert.deepEqual(titles(both), ["Sudden death or cardiac arrest before 40"]);
});

test("the demo family's review list is unchanged by the sudden-death switch", () => {
  const t = demoTree();
  assert.deepEqual(
    reviewItems(t, viewTree(t)).map((f) => `${f.tier}: ${f.title}`),
    [
      "guideline: Very high cholesterol in a grandparent, aunt or uncle",
      "noted: Irregular heartbeat",
      "clarify: Reports disagree: Dad",
      "clarify: Dad (deceased): age and cause of death not recorded",
      "clarify: Grandpa Ray: unknown",
      "clarify: Grandma June: declined to share",
      "clarify: Grandpa Luis: unknown",
    ],
  );
  assert.ok(!t.people.some((p) => p.suddenDeath));
});

test("sudden death is sanitized, kept on the care-team copy, and shown in the family row and the FHIR note", () => {
  const t = demoTree();
  t.people = t.people.map((p) =>
    p.id === "dad" ? { ...p, ageAtDeath: 38, causeOfDeath: "Collapsed while jogging", suddenDeath: true } : p.id === "mom" ? { ...p, suddenDeath: true } : p,
  );
  const clean = cleanTree(JSON.parse(JSON.stringify(t)))!;
  assert.equal(clean.people.find((p) => p.id === "dad")!.suddenDeath, true);
  assert.equal(clean.people.find((p) => p.id === "mom")!.suddenDeath, undefined, "only someone who passed away can have died suddenly");
  const forged = cleanTree({ ...JSON.parse(JSON.stringify(t)), people: t.people.map((p) => (p.id === "dad" ? { ...p, suddenDeath: "yes" } : p)) })!;
  assert.equal(forged.people.find((p) => p.id === "dad")!.suddenDeath, undefined);

  // the practice link carries age, cause and "sudden", so the care team gets the same rule
  const shared = shareableTree(clean);
  const dad = shared.people.find((p) => p.id === "dad")!;
  assert.deepEqual([dad.ageAtDeath, dad.causeOfDeath, dad.suddenDeath], [38, "Collapsed while jogging", true]);
  assert.equal(shared.people.find((p) => p.id === "mom")!.suddenDeath, undefined);
  assert.ok(titles(shared).includes("Sudden death or cardiac arrest before 40"));
  assert.ok(!titles(shareableTree(demoTree())).some((x) => x.startsWith("Sudden")));

  const row = familyRows(shared, viewTree(shared)).find((r) => r.personId === "dad" && r.first)!;
  assert.match(row.comments, /^Deceased at 38, Collapsed while jogging, sudden or unexpected\./);
  const fmh = toFhirBundle(shared).entry.find((e) => (e.resource as { id: string }).id === "fmh-dad")!.resource as { note?: { text: string }[] };
  assert.equal(fmh.note?.[0].text, "Cause of death (reported): Collapsed while jogging; sudden or unexpected");
  const noCause = { ...shared, people: shared.people.map((p) => (p.id === "dad" ? { ...p, causeOfDeath: undefined } : p)) };
  const fmh2 = toFhirBundle(noCause).entry.find((e) => (e.resource as { id: string }).id === "fmh-dad")!.resource as { note?: { text: string }[] };
  assert.equal(fmh2.note?.[0].text, "Death reported as sudden or unexpected");
});

test("'Add a relative to {person}' adds a sibling of that person, using only relations the tree has", () => {
  const t = withPeople(demoTree(), { id: "sam", relation: "sibling", label: "Sam", sex: "unknown" });
  const target = (id: string) => addTarget(t.people.find((p) => p.id === id)!, t);
  for (const id of ["self", "sam"]) assert.deepEqual(target(id), { relation: "sibling", label: "Your brother or sister" });
  for (const id of ["dad", "pgf", "pgm", "dev"]) assert.deepEqual(target(id), { relation: "paternal-aunt-uncle", label: "Dad’s brother or sister" });
  for (const id of ["mom", "mgf", "mgm"]) assert.deepEqual(target(id), { relation: "maternal-aunt-uncle", label: "Mom’s brother or sister" });
});

test("every guideline item cites its basis", () => {
  const t = demoTree();
  for (const f of reviewItems(t, viewTree(t)).filter((x) => x.tier === "guideline")) assert.ok(f.basis && /\d{4}/.test(f.basis));
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
