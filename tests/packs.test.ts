// Specialty packs (spec: scratchpad anydoc/spec.md). First, proof that extracting the cardiology pack changed nothing:
// the fixtures in tests/fixtures were computed at 8f6541b, before any pack code existed (tests/helpers/outputs.ts says
// how), and every cardiology output must still match them byte for byte.
// Run: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BASIS, CRITERIA_FOOTNOTE, HEART_CHOICES, reviewItems, stillToConfirm } from "../src/lib/clinical";
import { demoTree } from "../src/lib/demo";
import { toFhirBundle } from "../src/lib/fhir";
import { CARDIOLOGY, groupedChoices } from "../src/lib/packs";
import * as cardiology from "../src/lib/packs/cardiology";
import { shareableTree } from "../src/lib/redact";
import { buildInvite, encodePayload } from "../src/lib/share";
import { viewTree } from "../src/lib/status";
import type { FamilyTree } from "../src/lib/types";
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
