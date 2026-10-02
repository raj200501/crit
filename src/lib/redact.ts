import { viewTree } from "./status";
import type { FamilyTree, Report } from "./types";

/**
 * The minimum a practice needs to render the summary: no invites, no internal ids beyond what the
 * page keys on, and nothing secondhand about a relative who declined (only their decline and what
 * the patient knows themself). Used for the read-only link/QR and anything else that leaves the browser.
 */
export function shareableTree(tree: FamilyTree): FamilyTree {
  const declined = new Set(
    viewTree(tree)
      .filter((v) => v.status === "declined")
      .map((v) => v.person.id),
  );
  const firsthand = (r: Report) => r.source === "self" || r.source === "record";
  const reports: Report[] = tree.reports
    .filter((r) => !declined.has(r.personId) || (r.kind === "declined" && firsthand(r)) || (r.kind === "condition" && r.source === "patient"))
    .map((r) => ({
      id: r.id,
      personId: r.personId,
      kind: r.kind,
      condition: r.condition,
      ageAtOnset: r.ageAtOnset,
      approximate: r.approximate,
      note: r.kind === "condition" ? r.note : undefined,
      reportedBy: r.reportedBy,
      source: r.source,
      reportedAt: r.reportedAt,
      record: r.record ? { system: r.record.system, reference: "", recordedDate: r.record.recordedDate } : undefined,
    }));
  return {
    id: tree.id,
    patientName: tree.patientName,
    visit: tree.visit,
    people: tree.people.map(({ id, relation, label, sex, deceased }) => ({ id, relation, label, sex, deceased })),
    reports,
    invites: [],
    reviewedAt: tree.reviewedAt,
    synthetic: tree.synthetic,
    updatedAt: tree.updatedAt,
  };
}
