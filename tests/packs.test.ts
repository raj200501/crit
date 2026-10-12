// Specialty packs (spec: scratchpad anydoc/spec.md). First, proof that extracting the cardiology pack changed nothing:
// the fixtures in tests/fixtures were computed at 8f6541b, before any pack code existed (tests/helpers/outputs.ts says
// how), and every cardiology output must still match them byte for byte.
// Run: npm test
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BASIS, CRITERIA_FOOTNOTE, HEART_CHOICES, reviewItems, stillToConfirm } from "../src/lib/clinical";
import { normalizeCondition, sameCondition } from "../src/lib/conditions";
import { blankTree, demoTree } from "../src/lib/demo";
import { toFhirBundle } from "../src/lib/fhir";
import { askedAbout, CARDIOLOGY, GENERAL, GENERAL_CHOICES, groupedChoices, noneAbbr, noneFhir, nonePhrase, packById, packFor, type Flag } from "../src/lib/packs";
import * as cardiology from "../src/lib/packs/cardiology";
import { shareableTree } from "../src/lib/redact";
import { buildInvite, encodePayload } from "../src/lib/share";
import { cleanReport, cleanTree } from "../src/lib/sanitize";
import { isCardiac, viewTree } from "../src/lib/status";
import type { FamilyTree, Relation, Report } from "../src/lib/types";
import { STATUS_LABEL, STATUS_LABEL_CLINICAL } from "../src/components/ui/status";
import { chartText } from "../src/components/summary/chartText";
import { abbreviate, annotations, documentOrder, familyRows, hasFinding as summaryFinding, provenance } from "../src/components/summary/model";
import { factLine, hasFinding as treeFinding } from "../src/components/tree/model";
import { describeAnswer } from "../src/components/relative/describe";
import { corpusTree, keepUndefined, tokenizeFhir } from "./helpers/corpus";
import { stubCssModules } from "./helpers/css-stub";
import { hashed, outputs, type Lib } from "./helpers/outputs";

process.env.TZ = "UTC";
const FIXTURES = path.join(__dirname, "fixtures");
const fixture = (name: string) => readFileSync(path.join(FIXTURES, name), "utf8");
const json = <T,>(name: string) => JSON.parse(fixture(name)) as T;
/** Fixtures write `undefined` as "__undefined__" (JSON has no undefined); put it back for deep-strict equality. */
function revive<T>(v: T): T {
  if (Array.isArray(v)) return v.map(revive) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === "__undefined__" ? undefined : revive(x)])) as T;
  return v;
}

async function currentLib(): Promise<Lib> {
  stubCssModules();
  const SummaryDocument = (await import("../src/components/SummaryDocument")).default;
  return {
    viewTree,
    reviewItems,
    stillToConfirm,
    familyRows,
    annotations,
    documentOrder,
    provenance,
    hasFindingSummary: summaryFinding,
    hasFindingTree: treeFinding,
    chartText,
    toFhirBundle,
    shareableTree,
    buildInvite,
    encodePayload,
    factLine,
    describeAnswer,
    abbreviate,
    renderSummary: (tree: FamilyTree, audience) => renderToStaticMarkup(createElement(SummaryDocument, { tree, audience })),
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Identical output (spec E.1.2, E.1.13, E.2.3)

test("identical output: the demo's every cardiology output equals 8f6541b, field by field", async () => {
  const want = json<{ demo: Record<string, string> }>("cardiology-outputs.json").demo;
  const got = outputs(await currentLib(), demoTree());
  assert.deepEqual(Object.keys(got).sort(), Object.keys(want).sort());
  for (const k of Object.keys(want)) assert.equal(got[k], want[k], `demo ${k} differs from 8f6541b`);
});

test("identical output: 200 generated cardiology trees match 8f6541b (reviewItems, views, rows, FHIR, links, both summary copies)", async () => {
  const { corpus, corpusSize } = json<{ corpus: Record<string, string>[]; corpusSize: number }>("cardiology-outputs.json");
  const lib = await currentLib();
  assert.equal(corpus.length, corpusSize);
  corpus.forEach((want, i) => {
    const got = hashed(outputs(lib, corpusTree(i + 1)));
    for (const k of Object.keys(want)) assert.equal(got[k], want[k], `corpus tree ${i + 1}: ${k} differs from 8f6541b`);
  });
});

test("identical output: the demo's /view link, Mom's invite and the FHIR file are byte-identical to 8f6541b", () => {
  const demo = demoTree();
  assert.equal(JSON.stringify(shareableTree(demo)), fixture("shareable-demo.json").trimEnd());
  const mom = demo.people.find((p) => p.id === "mom")!;
  assert.equal(encodePayload(buildInvite(demo, mom, "d-test")), fixture("invite-demo-mom.txt").trimEnd());
  assert.equal(tokenizeFhir(toFhirBundle(demo)), fixture("fhir-demo.json").trimEnd());
});

test("identical output: the cardiology pack is today's questions, groups, criteria and full Flag objects", () => {
  assert.equal(CARDIOLOGY.choices, HEART_CHOICES);
  assert.equal(cardiology.BASIS, BASIS);
  assert.equal(cardiology.CRITERIA_FOOTNOTE, CRITERIA_FOOTNOTE);
  assert.equal(CARDIOLOGY.reviewItems, reviewItems);
  assert.deepEqual(JSON.parse(JSON.stringify(groupedChoices(CARDIOLOGY))), json("cardiology-groups.json"));
  const demo = demoTree();
  // deep-strict: `basis: undefined` keys on the clarify items must still be there (not missing)
  assert.deepStrictEqual(CARDIOLOGY.reviewItems(demo, viewTree(demo)), revive(json("cardiology-flags-demo.json")));
  assert.equal(keepUndefined(CARDIOLOGY.reviewItems(demo, viewTree(demo))), keepUndefined(revive(json("cardiology-flags-demo.json"))));
});

test("identical output: every heart card and demo condition abbreviates as at 8f6541b", () => {
  for (const [condition, short] of Object.entries(json<Record<string, string>>("abbr-8f6541b.json"))) assert.equal(abbreviate(condition), short, condition);
});

test("identical output: for cardiology data `finding` is exactly `cardiac`", () => {
  for (let i = 1; i <= 50; i++) for (const v of viewTree(corpusTree(i))) assert.equal(v.finding, v.cardiac);
  for (const v of viewTree(demoTree())) assert.equal(v.finding, v.cardiac);
});

// ---------------------------------------------------------------------------------------------------------------
// The general pack and pack selection (spec E.1, E.2)

let seq = 0;
const rep = (personId: string, r: Partial<Report>): Report => ({
  id: `g${++seq}`,
  personId,
  kind: "condition",
  reportedBy: "Sam",
  reportedById: "self",
  source: "patient",
  reportedAt: `2026-10-${String(1 + (seq % 27)).padStart(2, "0")}T00:00:00Z`,
  ...r,
});
const primaryCare = (): FamilyTree => blankTree("Sam", { specialty: "Primary care", date: "2026-10-20", type: "primary-care" });
const viewOf = (t: FamilyTree, id: string) => viewTree(t).find((v) => v.person.id === id)!;
const CRITERIA_WORDS = /before \d+|\bearly\b|criteri|guideline|basis/i;

test("defaults: no visit, a demo or legacy visit, an unknown type or link id all mean cardiology", () => {
  assert.equal(packFor(blankTree()).id, "cardiology");
  assert.equal(packFor(demoTree()).id, "cardiology");
  assert.equal(packFor({ visit: { specialty: "Dermatology", date: "" } }).id, "cardiology");
  assert.equal(packFor({ visit: { specialty: "Primary care", date: "", type: "primary-care" } }).id, "general");
  assert.equal(packFor({ visit: { specialty: "Dermatology", date: "", type: "other" } }).id, "general");
  assert.equal(packFor({ visit: { specialty: "Cardiology", date: "", type: "cardiology" } }).id, "cardiology");
  for (const id of [undefined, "x", 5, "__proto__", "cardiology", {}]) assert.equal(packById(id), CARDIOLOGY, String(id));
  assert.equal(packById("general"), GENERAL);
});

test("the general pack never yields a guideline item, a basis or criteria wording, whatever was reported", () => {
  const conditions = [
    ...new Set([
      ...GENERAL_CHOICES.flatMap((c) => [c.condition, ...(c.detail ? [`${c.condition}: prostate`, `${c.condition}: heart failure`] : [])]),
      ...HEART_CHOICES.map((c) => c.condition),
      "Aortic dissection",
      "Marfan syndrome",
      "Heart attack",
      "Angina",
      "High cholesterol",
      "Atrial fibrillation",
      "Hypertrophic cardiomyopathy",
      "Migraine",
    ]),
  ];
  const relations: Relation[] = [
    "mother",
    "father",
    "sibling",
    "paternal-grandfather",
    "paternal-grandmother",
    "maternal-grandfather",
    "maternal-grandmother",
    "paternal-aunt-uncle",
    "maternal-aunt-uncle",
  ];
  let checked = 0;
  for (const condition of conditions)
    for (const relation of relations)
      for (const sex of ["female", "male", "unknown"] as const)
        for (const age of [undefined, 20, 35, 39, 50, 64, 70]) {
          const t = primaryCare();
          t.people.push({ id: "x", relation, label: "Relative", sex, deceased: true, ageAtDeath: 38, suddenDeath: true });
          t.reports = [rep("x", { condition, ageAtOnset: age, approximate: age === 50 || undefined })];
          for (const f of GENERAL.reviewItems(t, viewTree(t))) {
            assert.notEqual(f.tier, "guideline", `${condition} / ${relation}`);
            assert.equal(f.basis, undefined);
            assert.ok(f.tier === "noted" || f.tier === "clarify");
            assert.doesNotMatch(`${f.title} ${f.detail}`, CRITERIA_WORDS, `${condition} / ${relation} / ${age}`);
            checked++;
          }
        }
  assert.ok(checked > 5000, String(checked));
  assert.equal(GENERAL.criteria, false);
  assert.equal(CARDIOLOGY.criteria, true);
});

test("general 'to clarify' items equal cardiology's for the demo family; noted lines are plain facts", () => {
  const t = demoTree();
  const g = { ...t, visit: { ...t.visit!, type: "primary-care" as const } };
  const clarify = (items: Flag[]) => items.filter((f) => f.tier === "clarify");
  const cardiologyClarify = clarify(CARDIOLOGY.reviewItems(t, viewTree(t)));
  assert.deepStrictEqual(clarify(GENERAL.reviewItems(g, viewTree(g))), cardiologyClarify);
  assert.deepEqual(
    cardiologyClarify.map((f) => f.title),
    ["Reports disagree: Dad", "Dad (deceased): age and cause of death not recorded", "Grandpa Ray: unknown", "Grandma June: declined to share", "Grandpa Luis: unknown"],
  );
  assert.equal(cardiologyClarify[0].detail, "Mom says heart attack at 60; Uncle Dev says angina, about 58.");

  const s = primaryCare();
  s.reports = [rep("mom", { condition: "Breast cancer", ageAtOnset: 45 })];
  assert.deepStrictEqual(
    GENERAL.reviewItems(s, viewTree(s)).filter((f) => f.tier === "noted"),
    [{ personId: "mom", tier: "noted", title: "Mother (mother's side)", detail: "Breast cancer, age 45, reported by Sam.", basis: undefined }],
  );
  s.reports.push(rep("mom", { condition: "Diabetes" }));
  assert.equal(GENERAL.reviewItems(s, viewTree(s))[0].detail, "Breast cancer, age 45, reported by Sam; Diabetes, age not known, reported by Sam.");
});

test("a 'none' reads in its own question set's words; a tampered pack falls back to cardiology", () => {
  const cardio: Report = rep("mgf", { kind: "no-history", condition: undefined, source: "self", reportedBy: "Grandpa Luis" });
  const general: Report = { ...cardio, id: "g-none", pack: "general" };
  for (const t of [demoTree(), primaryCare()]) {
    t.reports = [cardio];
    assert.equal(factLine(cardio), "No heart history");
    assert.equal(describeAnswer(cardio), "No heart history");
    assert.equal(provenance([cardio], "clinician", "Sam")[0].what, "No heart history");
    assert.equal(familyRows(t, viewTree(t)).find((r) => r.personId === "mgf")!.problem, "No heart history");
    assert.equal(viewOf(t, "mgf").headline, "No heart history");
  }
  assert.equal(factLine(general), "None on the list");
  assert.equal(describeAnswer(general), "None on the list");
  assert.equal(nonePhrase(general), "none of the conditions on the list");
  assert.equal(noneAbbr(general), "none listed");
  assert.equal("None on the list".length, "No heart history".length);
  assert.equal(noneFhir(general), `none of the conditions asked about (${askedAbout(GENERAL_CHOICES)})`);
  const t = primaryCare();
  t.reports = [general];
  const note = (toFhirBundle(t).entry.find((e) => e.resource.id === "fmh-mgf")!.resource as { note: { text: string }[] }).note[0].text;
  assert.match(note, /^Grandpa Luis reported none of the conditions asked about \(heart attack or blocked arteries, .*another cancer\) on /);
  for (const pack of ["x", "__proto__", 5, null]) {
    const forged = { ...cardio, pack } as unknown as Report;
    assert.equal(describeAnswer(forged), "No heart history", String(pack));
  }
});

test("a 'none' covers only the questions it was asked: no false disagreement after a visit-type switch", () => {
  // Mom said "None of these" to the heart questions herself; the tree is now a primary-care visit.
  const t = primaryCare();
  const none = rep("mom", { kind: "no-history", condition: undefined, source: "self", reportedBy: "Mother", reportedById: "mom" });
  t.reports = [none, rep("mom", { condition: "Breast cancer", ageAtOnset: 45 })];
  assert.equal(viewOf(t, "mom").status, "known");
  t.reports = [none, rep("mom", { condition: "Heart attack or coronary artery disease", ageAtOnset: 60 })];
  assert.equal(viewOf(t, "mom").status, "conflicting");
  // a secondhand cardiology none narrows the same way
  const second = rep("mom", { kind: "no-history", condition: undefined, reportedBy: "Aunt Kay", reportedById: undefined, source: "relative" });
  t.reports = [second, rep("mom", { condition: "Diabetes" })];
  assert.equal(viewOf(t, "mom").status, "known");
  t.reports = [second, rep("mom", { condition: "Stroke or TIA" })];
  assert.equal(viewOf(t, "mom").status, "conflicting");
  // a general none covers what the general cards asked about, in a general tree and in a cardiology tree, and never
  // what "Something else not listed" holds: "None on the list" plus a migraine is not a disagreement
  const gnone = { ...none, id: "gn", pack: "general" as const };
  const c = blankTree("Sam");
  for (const tree of [t, c]) {
    // free text from "Something else not listed", and the heart cards no general card names (a death, a faint)
    for (const condition of ["Migraine", "Osteoporosis", "Hemochromatosis (too much iron)", "Colon polyps", "Sudden unexplained death", "Unexplained fainting"]) {
      tree.reports = [gnone, rep("mom", { condition })];
      assert.equal(viewOf(tree, "mom").status, "known", condition);
      assert.equal(viewOf(tree, "mom").reason, "Reported by Sam", condition);
    }
    const listed = [
      ...GENERAL_CHOICES.flatMap((ch) => [ch.condition, ...(ch.detail ? [`${ch.condition}: prostate`] : [])]),
      ...HEART_CHOICES.map((ch) => ch.condition).filter((c) => !/sudden|fainting/i.test(c)),
      "Type 2 diabetes mellitus",
      "Essential hypertension",
      "Malignant neoplasm of breast",
      "Atrial fibrillation",
    ];
    for (const condition of listed) {
      tree.reports = [gnone, rep("mom", { condition })];
      assert.equal(viewOf(tree, "mom").status, "conflicting", condition);
    }
  }
  // in a cardiology tree a cardiology none still contradicts any condition, exactly as at 8f6541b
  c.reports = [none, rep("mom", { condition: "Breast cancer" })];
  assert.equal(viewOf(c, "mom").status, "conflicting");
  c.reports = [none, rep("mom", { condition: "Migraine" })];
  assert.equal(viewOf(c, "mom").status, "conflicting");
});

test("a 'none' that doesn't speak to a condition is never called a contradiction, nor counted as agreeing", () => {
  // Primary care: Mom's own heart "none", then two breast cancer reports whose ages differ. The disagreement is the ages.
  const t = primaryCare();
  const none = rep("mom", { kind: "no-history", condition: undefined, source: "self", reportedBy: "Mother", reportedById: "mom" });
  t.reports = [none, rep("mom", { condition: "Breast cancer", ageAtOnset: 45 }), rep("mom", { condition: "Breast cancer", ageAtOnset: 52, reportedBy: "Aunt Kay", source: "relative" })];
  const v = viewOf(t, "mom");
  assert.equal(v.status, "conflicting");
  assert.equal(v.reason, "2 reports disagree");
  const row = familyRows(t, viewTree(t)).find((r) => r.personId === "mom" && r.problem === "No heart history")!;
  assert.equal(row.comments, "");
  // the same heart "none" against a heart condition still contradicts it
  t.reports = [none, rep("mom", { condition: "Heart attack or coronary artery disease", ageAtOnset: 60 })];
  assert.equal(familyRows(t, viewTree(t)).find((r) => r.personId === "mom" && r.problem === "No heart history")!.comments, "Contradicts a reported condition");
  // Mom's heart "none" and Sam's breast cancer: known, reported by Sam (Mom didn't "agree" about a cancer)
  t.reports = [none, rep("mom", { condition: "Breast cancer", ageAtOnset: 45 })];
  assert.equal(viewOf(t, "mom").reason, "Reported by Sam");
});

test("status words are unchanged, and a general tree yields only the derived statuses", () => {
  assert.deepEqual(STATUS_LABEL, { known: "Known", conflicting: "Reports disagree", unknown: "Unknown", declined: "Chose not to share", pending: "Not asked yet" });
  assert.deepEqual(STATUS_LABEL_CLINICAL, { ...STATUS_LABEL, declined: "Declined to share" });
  for (let i = 1; i <= 40; i++) {
    const t = corpusTree(i);
    t.visit = { specialty: "Primary care", date: "", type: "primary-care" };
    for (const v of viewTree(t)) assert.ok(["known", "conflicting", "unknown", "declined"].includes(v.status));
  }
});

test("every general card has a source and plain examples; nothing patient-facing says risk, should or diagnose", () => {
  for (const c of GENERAL_CHOICES) {
    assert.ok(c.source && c.source.length > 10, c.id);
    assert.doesNotMatch(`${c.label} ${c.examples}`, /risk|should|diagnos/i, c.id);
  }
  assert.ok(!GENERAL_CHOICES.some((c) => /type 2 diabetes/i.test(c.condition)), "no card records a diabetes type nobody gave");
  const patientWords = { ...GENERAL.words } as Record<string, string>;
  delete patientWords.careTeam; // says it "doesn't diagnose anyone", like cardiology's
  for (const w of [...Object.values(patientWords), GENERAL.other.title, GENERAL.other.description, GENERAL.other.placeholder, GENERAL.notePlaceholder])
    assert.doesNotMatch(w, /risk|should|diagnos|criteri|guideline/i, w);
  assert.doesNotMatch(GENERAL.words.careTeam, /criteri|guideline|risk/i);
  // shared conditions store the same name as the heart card, so a switch keeps comparable answers
  for (const id of ["mi", "stroke", "fh"]) {
    assert.equal(GENERAL_CHOICES.find((c) => c.id === id)!.condition, HEART_CHOICES.find((c) => c.id === id)!.condition, id);
  }
  // the care-team copy says plainly that no criteria apply
  assert.match(GENERAL.careTeam.reviewNote, /^No guideline criteria are applied for this visit type yet\./);
  assert.match(
    GENERAL.careTeam.footer,
    /No guideline criteria applied\. Asked about: heart attack or blocked arteries, .* Relatives covered: parents, siblings, grandparents, aunts and uncles; not the patient’s children, nieces, nephews or cousins\.$/,
  );
});

test("grouping covers every card exactly once, in both packs", () => {
  for (const pack of [CARDIOLOGY, GENERAL]) {
    const ids = groupedChoices(pack).flatMap((g) => g.choices.map((c) => c.id));
    assert.deepEqual([...ids].sort(), pack.choices.map((c) => c.id).sort(), pack.id);
    assert.ok(!groupedChoices(pack).some((g) => g.title === "Other"), pack.id);
  }
  assert.deepEqual(
    groupedChoices(GENERAL).map((g) => g.title),
    ["Heart & circulation", "Diabetes", "Cancer"],
  );
});

test("record picker suggestions: the general set suggests what its cards ask about, never the whole problem list", () => {
  const list = ["Essential hypertension", "Type 2 diabetes mellitus", "Malignant neoplasm of breast", "Atrial fibrillation", "Major depressive disorder", "Seasonal allergic rhinitis"];
  assert.deepEqual(list.filter((c) => GENERAL.isSuggested(c)), list.slice(0, 4));
  for (const c of list) assert.equal(CARDIOLOGY.isSuggested(c), isCardiac(c), c);
  for (const id of ["hbp", "diabetes", "breast", "ovarian", "colorectal", "cancer-other"]) assert.ok(GENERAL_CHOICES.some((c) => c.id === id), id);
});

test("finding: equals cardiac for the demo; any condition is a finding in a general visit", () => {
  for (const v of viewTree(demoTree())) assert.equal(v.finding, v.cardiac);
  const t = primaryCare();
  t.reports = [rep("mom", { condition: "Migraine" })];
  assert.equal(viewOf(t, "mom").finding, true);
  assert.equal(viewOf(t, "mom").cardiac, false);
});

test("no import cycle: each pack module loads first in a fresh process", () => {
  // tsx compiles these .ts files as CommonJS here, so `require` evaluates the graph from the named module first; a cycle
  // would hand a module a half-built neighbour and the call below would throw.
  const none = path.join(__dirname, "../src/lib/packs/none.ts");
  for (const m of ["packs/none", "packs/shared", "packs/general", "packs/cardiology", "packs/index", "status", "sanitize", "clinical"]) {
    const first = path.join(__dirname, "../src/lib", `${m}.ts`);
    const src = `require(${JSON.stringify(first)}); process.stdout.write(require(${JSON.stringify(none)}).noneFhir({ pack: "general" }));`;
    const out = execFileSync(process.execPath, ["--import", "tsx", "--input-type=commonjs", "-e", src], { encoding: "utf8" });
    assert.match(out, /^none of the conditions asked about \(heart attack or blocked arteries, .*another cancer\)$/, m);
  }
});

test("pedigree abbreviations: general cards go first and are anchored, so free text can't borrow a heart label", () => {
  assert.equal(abbreviate("Other cancer: leukemia, initially lymphoma"), "cancer");
  assert.equal(abbreviate("Other heart disease: heart failure"), "heart dis.");
  assert.equal(abbreviate("Diabetes"), "diabetes");
  assert.equal(abbreviate("High blood pressure"), "HTN");
  assert.equal(abbreviate("Breast cancer"), "breast ca.");
  assert.equal(abbreviate("Ovarian, fallopian tube or peritoneal cancer"), "ovarian ca.");
  assert.equal(abbreviate("Colon or rectal cancer"), "CRC");
  for (const c of [...HEART_CHOICES.map((x) => x.condition), ...demoTree().reports.flatMap((r) => (r.condition ? [r.condition] : []))])
    assert.doesNotMatch(c, /^(other cancer|other heart disease|high blood pressure|diabetes|breast cancer|ovarian, fallopian|colon or rectal cancer)/i, c);
});

test("a 'What kind?' answer agrees with its plain form; two different kinds still disagree", () => {
  const t = primaryCare();
  t.reports = [rep("dad", { condition: "Other cancer: prostate", reportedBy: "Mother" }), rep("dad", { condition: "Other cancer", reportedBy: "Uncle" })];
  assert.equal(viewOf(t, "dad").status, "known");
  t.reports = [rep("dad", { condition: "Other cancer: prostate", reportedBy: "Mother" }), rep("dad", { condition: "Other cancer: breast", reportedBy: "Uncle" })];
  assert.equal(viewOf(t, "dad").status, "conflicting");
  const names = HEART_CHOICES.map((c) => normalizeCondition(c.condition));
  for (const a of names) for (const b of names) assert.equal(sameCondition(a, b), a === b);
});

test("invite visit phrase keeps acronyms; a general tree's invite carries k, a cardiology one never does", () => {
  const withVisit = (specialty: string, type?: "other" | "primary-care"): FamilyTree => ({ ...demoTree(), visit: { specialty, date: "", ...(type ? { type } : {}) } });
  const mom = demoTree().people.find((p) => p.id === "mom")!;
  assert.equal(buildInvite(withVisit("GI", "other"), mom).s, "GI visit");
  assert.equal(buildInvite(withVisit("ENT", "other"), mom).s, "ENT visit");
  assert.equal(buildInvite(withVisit("OB/GYN", "other"), mom).s, "OB/GYN visit");
  assert.equal(buildInvite(withVisit("Primary care", "primary-care"), mom).s, "primary care visit");
  assert.equal(buildInvite(withVisit("Cardiology"), mom).s, "cardiology visit");
  assert.equal(buildInvite(withVisit("Primary care", "primary-care"), mom).k, "general");
  assert.ok(!("k" in buildInvite(demoTree(), mom)));
  assert.ok(!("k" in buildInvite(withVisit("Dermatology"), mom)), "a legacy untyped visit stays cardiology");
});

test("sanitize: visit.type kept only for the three ids; a none's pack kept only when general", () => {
  const base = JSON.parse(JSON.stringify(demoTree()));
  for (const type of ["cardiology", "primary-care", "other"]) assert.equal(cleanTree({ ...base, visit: { ...base.visit, type } })!.visit!.type, type);
  for (const type of ["neurology", 5, "__proto__", null]) {
    const v = cleanTree({ ...base, visit: { ...base.visit, type } })!.visit!;
    assert.ok(!("type" in v), String(type));
    assert.equal(packFor({ visit: v }).id, "cardiology");
  }
  assert.equal(cleanTree({ ...base, visit: { type: "primary-care", date: "" } })!.visit, undefined, "no specialty: no visit");
  // a tree saved before visit types: no type key, no pack key, cardiology
  const legacy = cleanTree({ ...base, visit: { specialty: "Dermatology", date: "2026-10-20" } })!;
  assert.ok(!("type" in legacy.visit!));
  assert.ok(legacy.reports.every((r) => !("pack" in r)));
  assert.equal(packFor(legacy).id, "cardiology");
  const r = { personId: "mom", kind: "no-history", source: "self", reportedBy: "Mom", reportedAt: "2026-10-01T00:00:00Z" };
  assert.equal(cleanReport({ ...r, pack: "general" })!.pack, "general");
  for (const pack of ["cardiology", "x", 5, "__proto__", {}]) assert.ok(!("pack" in cleanReport({ ...r, pack })!), String(pack));
  for (const kind of ["condition", "declined", "dont-know"]) assert.ok(!("pack" in cleanReport({ ...r, kind, condition: "Diabetes", pack: "general" })!), kind);
});

test("links: a general tree's /view payload keeps its visit type and each general none's pack", () => {
  const t = primaryCare();
  t.reports = [rep("mom", { kind: "no-history", condition: undefined, source: "self", reportedBy: "Mother", pack: "general" }), rep("dad", { condition: "Diabetes" })];
  const shared = shareableTree(t);
  assert.equal(shared.visit!.type, "primary-care");
  assert.equal(shared.reports.find((x) => x.kind === "no-history")!.pack, "general");
  assert.ok(!("pack" in shared.reports.find((x) => x.kind === "condition")!));
  const back = cleanTree(JSON.parse(JSON.stringify(shared)))!;
  assert.equal(packFor(back).id, "general");
  assert.equal(back.reports.find((x) => x.kind === "no-history")!.pack, "general");
});

test("chart text: general says no criteria were applied; cardiology keeps its criteria versions line", () => {
  assert.match(chartText(primaryCare()), /No guideline criteria applied for this visit type\. Asked about: heart attack or blocked arteries, .*another cancer\.$/);
  assert.doesNotMatch(chartText(primaryCare()), /Criteria versions|ACC\/AHA/);
  assert.match(chartText(demoTree()), /Criteria versions: ACC\/AHA 2018/);
});

test("care-team copy (rendered): general band has no count, no criteria and no basis; patients never see criteria", async () => {
  await currentLib();
  const SummaryDocument = (await import("../src/components/SummaryDocument")).default;
  const html = (tree: FamilyTree, audience: "patient" | "clinician") => renderToStaticMarkup(createElement(SummaryDocument, { tree, audience }));
  const t = primaryCare();
  t.people.push({ id: "sis", relation: "sibling", label: "Sister", sex: "female" });
  t.reports = [rep("sis", { condition: "Breast cancer", ageAtOnset: 41 })];
  for (const id of ["pgf", "pgm", "mgf", "mgm"]) t.reports.push(rep(id, { condition: "Diabetes" }));
  for (let i = 0; i < 4; i++) {
    t.people.push({ id: `au${i}`, relation: "maternal-aunt-uncle", label: `Aunt ${i}`, sex: "female" });
    t.reports.push(rep(`au${i}`, { condition: "High blood pressure" }));
  }
  const care = html(t, "clinician");
  assert.match(care, /For clinician review<\/h2>/);
  assert.doesNotMatch(care, /For clinician review <span/);
  assert.match(care, /No guideline criteria are applied for this visit type yet\./);
  assert.match(care, /Reported conditions · no criteria applied/);
  assert.doesNotMatch(care, /Basis:|No guideline family-history criteria matched/);
  assert.match(care, /Pre-visit family health history/);
  assert.match(care, /And 3 more relatives in the table below\./);
  // first-degree first: the sister (added last) is among the six shown
  const band = care.slice(care.indexOf("Reported conditions"), care.indexOf("more relatives in the table below"));
  assert.match(band, /Sister\./);
  const patient = html(t, "patient");
  assert.doesNotMatch(patient, /Basis:|guideline|criteri|For clinician review/i);
  assert.match(patient, /Pre-visit family health history/);
  // the demo's care-team copy keeps its count, its criteria and no extra footer line
  const demo = html(demoTree(), "clinician");
  assert.match(demo, /For clinician review <span[^>]*>\(1\)<\/span>/);
  assert.doesNotMatch(demo, /None on the list/);
  // a general none left in a cardiology tree: the footer says which questions it covered
  const back = demoTree();
  back.reports.push(rep("mgf", { kind: "no-history", condition: undefined, source: "self", reportedBy: "Grandpa Luis", pack: "general" }));
  assert.match(html(back, "clinician"), /“None on the list” answers covered: heart attack or blocked arteries, .*another cancer\./);
});
