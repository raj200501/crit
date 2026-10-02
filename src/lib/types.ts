// Core data model. Every fact is a Report with a source, so the tree never
// flattens disagreement: status is derived from reports, not stored.

export type Sex = "female" | "male" | "unknown";

export type Relation =
  | "self"
  | "mother"
  | "father"
  | "sibling"
  | "paternal-grandfather"
  | "paternal-grandmother"
  | "maternal-grandfather"
  | "maternal-grandmother"
  | "paternal-aunt-uncle"
  | "maternal-aunt-uncle";

/** Derived, never stored. Mirrors the deck legend. */
export type Status = "known" | "conflicting" | "unknown" | "declined";

/** Where a report came from. "record" means pulled from a patient portal (e.g. MyChart via FHIR). */
export type SourceKind = "patient" | "relative" | "self" | "record";

export type ReportKind =
  /** A specific condition (with optional age at onset). */
  | "condition"
  /** Reporter states there is no heart history. */
  | "no-history"
  /** The person chose not to share. Only the person themself can decline. */
  | "declined"
  /** Reporter does not know. */
  | "dont-know";

export interface RecordProvenance {
  /** e.g. "MyChart (SMART sandbox)" */
  system: string;
  /** FHIR resource reference, e.g. "Condition/abc123" */
  reference: string;
  /** SNOMED/ICD code if the record had one */
  code?: { system: string; code: string; display: string };
  recordedDate?: string;
  /** When the relative pulled it from their portal. */
  retrievedAt?: string;
}

export interface Report {
  id: string;
  /** Person the report is about. */
  personId: string;
  kind: ReportKind;
  condition?: string;
  /** Age when it started (or happened). */
  ageAtOnset?: number;
  /** True when the reporter said "about". */
  approximate?: boolean;
  /** Free-text note in the reporter's own words. */
  note?: string;
  /** Display name of who said it ("Mom", "Uncle Dev", "Alex"). */
  reportedBy: string;
  /** Person id of the reporter when they are in the tree. */
  reportedById?: string;
  source: SourceKind;
  /** ISO date-time */
  reportedAt: string;
  record?: RecordProvenance;
}

export interface Person {
  id: string;
  relation: Relation;
  /** What the patient calls them ("Mom", "Uncle Dev"). */
  label: string;
  sex: Sex;
  deceased?: boolean;
  ageAtDeath?: number;
  causeOfDeath?: string;
}

export interface Invite {
  id: string;
  personId: string;
  /** Opaque token used in the invite link. */
  token: string;
  createdAt: string;
  answeredAt?: string;
}

export interface FamilyTree {
  id: string;
  patientName: string;
  visit?: { specialty: string; date: string; practice?: string };
  people: Person[];
  reports: Report[];
  invites: Invite[];
  /** Set when the patient has reviewed the summary. */
  reviewedAt?: string;
  sharedAt?: string;
  /** Synthetic demo data; never real patient information. */
  synthetic: boolean;
  updatedAt: string;
}
