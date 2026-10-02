// Everything that arrives from a link or from storage is untrusted: validate shape, types and
// lengths before it reaches the tree, so a malformed or forged link can't break or poison it.

import type { FamilyTree, Invite, Person, RecordProvenance, Relation, Report, ReportKind, Sex, SourceKind } from "./types";

const KINDS = new Set<ReportKind>(["condition", "no-history", "declined", "dont-know"]);
const SOURCES = new Set<SourceKind>(["patient", "relative", "self", "record"]);
const SEXES = new Set<Sex>(["female", "male", "unknown"]);
const RELATIONS = new Set<Relation>([
  "self",
  "mother",
  "father",
  "sibling",
  "paternal-grandfather",
  "paternal-grandmother",
  "maternal-grandfather",
  "maternal-grandmother",
  "paternal-aunt-uncle",
  "maternal-aunt-uncle",
]);

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.slice(0, max) : undefined);
const isDate = (v: unknown): v is string => typeof v === "string" && !Number.isNaN(Date.parse(v));

function cleanRecord(v: unknown): RecordProvenance | undefined {
  if (!isObj(v)) return undefined;
  const system = str(v.system, 80);
  if (!system) return undefined;
  const code =
    isObj(v.code) && str(v.code.code, 40)
      ? { system: str(v.code.system, 120) ?? "", code: str(v.code.code, 40)!, display: str(v.code.display, 120) ?? "" }
      : undefined;
  return { system, reference: str(v.reference, 200) ?? "", recordedDate: isDate(v.recordedDate) ? String(v.recordedDate).slice(0, 10) : undefined, code };
}

export function cleanReport(v: unknown): Omit<Report, "id"> | null {
  if (!isObj(v)) return null;
  const kind = v.kind as ReportKind;
  const source = v.source as SourceKind;
  const personId = str(v.personId, 64);
  if (!personId || !KINDS.has(kind) || !SOURCES.has(source)) return null;
  const condition = kind === "condition" ? str(v.condition, 120) : undefined;
  if (kind === "condition" && !condition) return null;
  const age =
    typeof v.ageAtOnset === "number" && Number.isFinite(v.ageAtOnset) && v.ageAtOnset >= 0 && v.ageAtOnset < 130 ? Math.round(v.ageAtOnset) : undefined;
  return {
    personId,
    kind,
    condition,
    ageAtOnset: kind === "condition" ? age : undefined,
    approximate: v.approximate === true ? true : undefined,
    // A decline carries no free text, so nothing can ride along with it.
    note: kind === "declined" ? undefined : str(v.note, 280),
    reportedBy: str(v.reportedBy, 60) ?? "Someone",
    reportedById: str(v.reportedById, 64),
    source,
    reportedAt: isDate(v.reportedAt) ? String(v.reportedAt) : new Date(0).toISOString(),
    record: source === "record" ? cleanRecord(v.record) : undefined,
  };
}

function cleanPerson(v: unknown): Person | null {
  if (!isObj(v)) return null;
  const id = str(v.id, 64);
  const label = str(v.label, 60);
  if (!id || !label || !RELATIONS.has(v.relation as Relation)) return null;
  return {
    id,
    label,
    relation: v.relation as Relation,
    sex: SEXES.has(v.sex as Sex) ? (v.sex as Sex) : "unknown",
    deceased: v.deceased === true ? true : undefined,
    ageAtDeath: typeof v.ageAtDeath === "number" && v.ageAtDeath >= 0 && v.ageAtDeath < 130 ? v.ageAtDeath : undefined,
    causeOfDeath: str(v.causeOfDeath, 120),
  };
}

function cleanInvite(v: unknown): Invite | null {
  if (!isObj(v)) return null;
  const id = str(v.id, 64);
  const personId = str(v.personId, 64);
  if (!id || !personId) return null;
  return {
    id,
    personId,
    token: str(v.token, 64) ?? id,
    createdAt: isDate(v.createdAt) ? String(v.createdAt) : new Date(0).toISOString(),
    answeredAt: isDate(v.answeredAt) ? String(v.answeredAt) : undefined,
  };
}

/** Returns a well-formed tree, or null when the input is not a tree at all. */
export function cleanTree(v: unknown): FamilyTree | null {
  if (!isObj(v) || !Array.isArray(v.people) || !Array.isArray(v.reports)) return null;
  const id = str(v.id, 64);
  if (!id) return null;
  const people = v.people.map(cleanPerson).filter((p): p is Person => !!p);
  if (!people.some((p) => p.relation === "self")) return null;
  const ids = new Set(people.map((p) => p.id));
  const reports = v.reports
    .map((r) => {
      const c = cleanReport(r);
      const rid = isObj(r) ? str(r.id, 64) : undefined;
      return c && rid && ids.has(c.personId) ? { ...c, id: rid } : null;
    })
    .filter((r): r is Report => !!r);
  const visit =
    isObj(v.visit) && str(v.visit.specialty, 40)
      ? { specialty: str(v.visit.specialty, 40)!, date: str(v.visit.date, 10) ?? "", practice: str(v.visit.practice, 80) }
      : undefined;
  return {
    id,
    patientName: str(v.patientName, 40) ?? "You",
    visit,
    people,
    reports,
    invites: Array.isArray(v.invites) ? v.invites.map(cleanInvite).filter((i): i is Invite => !!i && ids.has(i.personId)) : [],
    reviewedAt: isDate(v.reviewedAt) ? String(v.reviewedAt) : undefined,
    sharedAt: isDate(v.sharedAt) ? String(v.sharedAt) : undefined,
    synthetic: v.synthetic !== false,
    updatedAt: isDate(v.updatedAt) ? String(v.updatedAt) : new Date(0).toISOString(),
  };
}
