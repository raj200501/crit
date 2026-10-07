// Server-side model for the landing's receipt cards. It runs in the page (a Server Component), so lib/status
// never ships to the browser for the landing: the client islands get plain JSON built from viewTree().
import { viewTree, type PersonView } from "@/lib/status";
import type { FamilyTree, Relation, Report } from "@/lib/types";
import type { GlyphShape, GlyphStatus } from "@/components/ui/PedigreeGlyph";
import type { SourceKind } from "@/components/ui/SourceChip";
import type { UiStatus } from "@/components/ui/status";

export interface ReceiptLine {
  id: string;
  /** "Heart attack", "No heart history", "Chose not to share", "Doesn't know". */
  fact: string;
  /** "60", "about 58". */
  age?: string;
  /** The reporter's own words. */
  note?: string;
  kind: SourceKind;
  who: string;
  /** ISO date for the SourceChip: the report date, or the record date for portal facts. */
  date?: string;
}

export interface PersonReceipt {
  id: string;
  label: string;
  /** label without "(you)", for "Open {name} in the demo". */
  name: string;
  relation: string;
  shape: GlyphShape;
  /** "self" for the patient; "pending" when nobody has been asked yet. */
  status: UiStatus | "self";
  glyph: GlyphStatus;
  finding: boolean;
  deceased: boolean;
  record: boolean;
  headline: string;
  lines: ReceiptLine[];
}

const RELATION: Record<Relation, string> = {
  self: "The patient",
  mother: "Mother",
  father: "Father",
  sibling: "Sibling",
  "paternal-grandfather": "Father's father",
  "paternal-grandmother": "Father's mother",
  "maternal-grandfather": "Mother's father",
  "maternal-grandmother": "Mother's mother",
  "paternal-aunt-uncle": "Father's brother or sister",
  "maternal-aunt-uncle": "Mother's brother or sister",
};

const SHAPE = { female: "circle", male: "square", unknown: "diamond" } as const;

function line(r: Report): ReceiptLine {
  const kind: SourceKind = r.source;
  const base = { id: r.id, kind, who: r.reportedBy, note: r.note, date: r.source === "record" ? r.record?.recordedDate : r.reportedAt };
  if (r.kind === "condition") {
    const age = r.ageAtOnset == null ? undefined : `${r.approximate ? "about " : ""}${r.ageAtOnset}`;
    return { ...base, fact: r.condition ?? "Condition", age };
  }
  if (r.kind === "no-history") return { ...base, fact: "No heart history" };
  if (r.kind === "declined") return { ...base, fact: "Chose not to share" };
  return { ...base, fact: "Doesn't know" };
}

export function uiStatus(v: PersonView): UiStatus {
  // lib/status folds "nobody asked yet" into unknown; the UI shows it as its own state (dotted ring).
  return v.status === "unknown" && v.reports.length === 0 ? "pending" : v.status;
}

export function receiptFor(v: PersonView): PersonReceipt {
  const self = v.person.relation === "self";
  const status = self ? "self" : uiStatus(v);
  return {
    id: v.person.id,
    label: v.person.label,
    name: v.person.label.replace(/\s*\(you\)$/, ""),
    relation: RELATION[v.person.relation],
    shape: SHAPE[v.person.sex],
    status,
    glyph: status,
    finding: v.cardiac && v.status !== "declined",
    deceased: Boolean(v.person.deceased),
    record: v.verified,
    headline: v.headline,
    lines: v.reports.map(line),
  };
}

/** Receipts for every person in the tree, keyed by id. */
export function receiptsFor(tree: FamilyTree): Record<string, PersonReceipt> {
  return Object.fromEntries(viewTree(tree).map((v) => [v.person.id, receiptFor(v)]));
}
