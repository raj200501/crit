// Every cardiology output the specialty-pack change could touch, computed from one tree with whichever source tree's
// functions are passed in. The fixture tests/fixtures/cardiology-outputs.json holds these for the demo and the corpus,
// computed at 8f6541b; tests/packs.test.ts recomputes them on the current code and compares.
import { createHash } from "node:crypto";
import type { FamilyTree, Person, Report } from "../../src/lib/types";
import { keepUndefined, tokenizeFhir } from "./corpus";

/* eslint-disable @typescript-eslint/no-explicit-any -- the 8f6541b and current signatures differ in optional params */
type Fn = (...args: any[]) => any;
export interface Lib {
  viewTree: Fn;
  reviewItems: Fn;
  stillToConfirm: Fn;
  familyRows: Fn;
  annotations: Fn;
  documentOrder: Fn;
  provenance: Fn;
  hasFindingSummary: Fn;
  hasFindingTree: Fn;
  chartText: Fn;
  toFhirBundle: Fn;
  shareableTree: Fn;
  buildInvite: Fn;
  encodePayload: Fn;
  factLine: Fn;
  describeAnswer: Fn;
  abbreviate: Fn;
  renderSummary?: (tree: FamilyTree, audience: "patient" | "clinician") => string;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const hash = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 24);

/** Readable values, field by field (PersonView gains a key, so views are compared on today's fields only). */
export function outputs(lib: Lib, tree: FamilyTree): Record<string, string> {
  const views = lib.viewTree(tree) as { person: Person; status: string; headline: string; reason?: string; verified: boolean; cardiac: boolean; conditions: Report[]; reports: Report[] }[];
  const out: Record<string, string> = {
    views: keepUndefined(
      views.map((v) => ({ id: v.person.id, status: v.status, headline: v.headline, reason: v.reason, verified: v.verified, cardiac: v.cardiac, conditions: v.conditions.map((r) => r.id), reports: v.reports.map((r) => r.id) })),
    ),
    findings: JSON.stringify(views.map((v) => [lib.hasFindingSummary(v), lib.hasFindingTree(v)])),
    flags: keepUndefined(lib.reviewItems(tree, views)),
    stillToConfirm: JSON.stringify((lib.stillToConfirm(views) as typeof views).map((v) => v.person.id)),
    // every row field but `view` (a PersonView, compared above on its own fields)
    rows: keepUndefined(
      (lib.familyRows(tree, views) as Record<string, unknown>[]).map((row) => ({
        ...Object.fromEntries(Object.entries(row).filter(([k]) => k !== "view" && k !== "reports")),
        reports: (row.reports as Report[]).map((r) => r.id),
      })),
    ),
    annotations: JSON.stringify(views.map((v) => lib.annotations(v))),
    order: JSON.stringify((lib.documentOrder(views) as typeof views).map((v) => v.person.id)),
    provenancePatient: keepUndefined(lib.provenance(tree.reports, "patient", tree.patientName)),
    provenanceClinician: keepUndefined(lib.provenance(tree.reports, "clinician", tree.patientName)),
    chartText: lib.chartText(tree),
    fhir: tokenizeFhir(lib.toFhirBundle(tree)),
    shareable: JSON.stringify(lib.shareableTree(tree)),
    invites: JSON.stringify(tree.people.filter((p) => p.relation !== "self").map((p) => lib.encodePayload(lib.buildInvite(tree, p, "d-test")))),
    factLines: JSON.stringify(tree.reports.map((r) => lib.factLine(r))),
    describe: JSON.stringify(tree.reports.map((r) => lib.describeAnswer(r))),
    abbreviations: JSON.stringify(tree.reports.map((r) => lib.abbreviate(r.condition))),
  };
  if (lib.renderSummary) {
    out.summaryPatient = lib.renderSummary(tree, "patient");
    out.summaryClinician = lib.renderSummary(tree, "clinician");
  }
  return out;
}

export const hashed = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, hash(v)]));
