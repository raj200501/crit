import { viewTree } from "./status";
import type { FamilyTree, Person, Relation } from "./types";

// Export the tree as FHIR R4 FamilyMemberHistory resources (US Core 9 adds Family Health
// History via USCDI v6). Statuses map to FHIR so nothing is lost: unknown and declined become
// dataAbsentReason, conflicting keeps every reported condition with who said it.

const ROLE: Record<Relation, { code: string; display: string } | null> = {
  self: null,
  mother: { code: "MTH", display: "mother" },
  father: { code: "FTH", display: "father" },
  sibling: { code: "SIB", display: "sibling" },
  "paternal-grandfather": { code: "PGRFTH", display: "paternal grandfather" },
  "paternal-grandmother": { code: "PGRMTH", display: "paternal grandmother" },
  "maternal-grandfather": { code: "MGRFTH", display: "maternal grandfather" },
  "maternal-grandmother": { code: "MGRMTH", display: "maternal grandmother" },
  "paternal-aunt-uncle": { code: "EXT", display: "extended family member (paternal aunt or uncle)" },
  "maternal-aunt-uncle": { code: "EXT", display: "extended family member (maternal aunt or uncle)" },
};

function roleFor(p: Person) {
  const r = ROLE[p.relation];
  if (!r) return null;
  if (p.relation === "paternal-aunt-uncle" && p.sex !== "unknown")
    return p.sex === "male" ? { code: "PUNCLE", display: "paternal uncle" } : { code: "PAUNT", display: "paternal aunt" };
  if (p.relation === "maternal-aunt-uncle" && p.sex !== "unknown")
    return p.sex === "male" ? { code: "MUNCLE", display: "maternal uncle" } : { code: "MAUNT", display: "maternal aunt" };
  if (p.relation === "sibling" && p.sex !== "unknown") return p.sex === "male" ? { code: "BRO", display: "brother" } : { code: "SIS", display: "sister" };
  return r;
}

export function toFhirBundle(tree: FamilyTree) {
  const views = viewTree(tree);
  const entries = views
    .filter((v) => v.person.relation !== "self")
    .map((v) => {
      const p = v.person;
      const role = roleFor(p)!;
      const resource: Record<string, unknown> = {
        resourceType: "FamilyMemberHistory",
        id: `fmh-${p.id}`,
        meta: { profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-familymemberhistory"] },
        status: v.status === "unknown" || v.status === "declined" ? "health-unknown" : v.status === "conflicting" ? "partial" : "completed",
        patient: { display: tree.patientName },
        date: tree.updatedAt.slice(0, 10),
        name: p.label,
        relationship: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode", code: role.code, display: role.display }], text: role.display },
        sex: p.sex === "unknown" ? undefined : { coding: [{ system: "http://hl7.org/fhir/administrative-gender", code: p.sex, display: p.sex }] },
        deceasedBoolean: p.deceased ? true : undefined,
      };
      if (v.status === "declined") {
        resource.dataAbsentReason = {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/history-absent-reason", code: "withheld", display: "Information Withheld" }],
        };
      } else if (v.status === "unknown") {
        resource.dataAbsentReason = {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/history-absent-reason", code: "unable-to-obtain", display: "Unable To Obtain" }],
        };
      }
      // v.conditions already leaves out secondhand reports about someone who declined.
      const conditions = v.conditions;
      if (conditions.length) {
        resource.condition = conditions.map((r) => ({
          code: r.record?.code
            ? { coding: [{ system: r.record.code.system, code: r.record.code.code, display: r.record.code.display }], text: r.condition }
            : { text: r.condition },
          onsetAge: r.ageAtOnset != null ? { value: r.ageAtOnset, unit: "a", system: "http://unitsofmeasure.org", code: "a" } : undefined,
          note: [
            {
              text: `${r.source === "record" ? `Retrieved from ${r.record?.system ?? "a patient portal"} (${r.record?.reference ?? ""})` : `Reported by ${r.reportedBy}`} on ${r.reportedAt.slice(0, 10)}${r.approximate ? "; age approximate" : ""}${r.note ? `: "${r.note}"` : ""}`,
            },
          ],
        }));
      }
      const notes: { text: string }[] = [];
      if (v.status === "conflicting") notes.push({ text: `Reports disagree (${v.reason}). All reports kept.` });
      (v.status === "declined" ? [] : v.reports)
        .filter((r) => r.kind === "no-history")
        .forEach((r) => notes.push({ text: `${r.reportedBy} reported no heart history on ${r.reportedAt.slice(0, 10)}.` }));
      if (notes.length) resource.note = notes;
      return { fullUrl: `urn:uuid:${crypto.randomUUID()}`, resource: JSON.parse(JSON.stringify(resource)) };
    });
  return {
    resourceType: "Bundle",
    type: "collection",
    timestamp: new Date().toISOString(),
    meta: { tag: [{ system: "urn:family-health-tree", code: "synthetic-demo", display: "Synthetic demo data" }] },
    entry: entries,
  };
}
