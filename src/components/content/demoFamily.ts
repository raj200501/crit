// Read-only views of the synthetic demo family for the content pages (presentation only; src/lib stays untouched).
import { shapeForSex, type PedigreeGlyphProps } from "@/components/ui/PedigreeGlyph";
import type { UiStatus } from "@/components/ui/status";
import { demoTree } from "@/lib/demo";
import { buildInvite, encodePayload } from "@/lib/share";
import { viewTree, type PersonView } from "@/lib/status";
import type { FamilyTree, Report } from "@/lib/types";

export const DEMO = demoTree();
export const DEMO_VIEWS = viewTree(DEMO);

/** How the deployed site's host reads in mocks (shortened like a phone's address bar would). */
export const SITE_HOST = "family-health-tree…vercel.app";

export function viewOf(id: string, views: PersonView[] = DEMO_VIEWS): PersonView {
  const v = views.find((x) => x.person.id === id);
  if (!v) throw new Error(`demo person ${id} missing`);
  return v;
}

/** The UI status word: "unknown" with nothing reported at all reads as "not asked yet". */
export function uiStatus(v: PersonView): UiStatus {
  if (v.status === "unknown" && v.reports.length === 0) return "pending";
  return v.status;
}

/** PedigreeGlyph props for a person, following the §3.1 grammar. */
export function glyphFor(v: PersonView): Pick<PedigreeGlyphProps, "shape" | "status" | "finding" | "deceased" | "record" | "proband"> {
  const self = v.person.relation === "self";
  return {
    shape: shapeForSex(v.person.sex),
    status: self ? "self" : uiStatus(v),
    finding: v.cardiac && v.status !== "declined",
    deceased: v.person.deceased,
    record: v.verified,
    proband: self,
  };
}

/** A report by id from the demo tree. */
export function report(id: string, tree: FamilyTree = DEMO): Report {
  const r = tree.reports.find((x) => x.id === id);
  if (!r) throw new Error(`demo report ${id} missing`);
  return r;
}

/** The real invite fragment for a relative (base64url JSON: it starts "eyJ"), and what it decodes to. */
export function inviteFragment(personId: string, tree: FamilyTree = DEMO) {
  const person = tree.people.find((p) => p.id === personId);
  if (!person) throw new Error(`demo person ${personId} missing`);
  const payload = buildInvite(tree, person);
  return { fragment: encodePayload(payload), payload };
}

/** AMENDMENTS A2: the invite text, exactly. No specialty, no "heart history", no time estimate. */
export function inviteMessage(patientName: string, url: string): string {
  return `Hi, it's ${patientName}. I'm putting together our family health history and would love your help. Here's a private link; you can answer, skip, or say no: ${url}`;
}

/** AMENDMENTS A2: the practice's text to the patient (no health information, no time estimate). */
export const PRACTICE_SMS_PREFIX = "Cardiology Associates: before your visit on Oct 14, you can put together your family history here:";
