// Presentation-only derivations for the /tree workspace (DESIGN §12.1–12.3). Reads src/lib, never writes it.
import type { PersonView } from "@/lib/status";
import type { FamilyTree, Person, Relation, Report } from "@/lib/types";
import type { UiStatus } from "@/components/ui/status";

/** What a node shows: the lib status, split so "not asked yet" and "invited, waiting" read differently from "nobody knows". */
export type NodeStatus = UiStatus | "self";
/** The legend filter (TreeView `highlight`). */
export type Highlight = "known" | "conflicting" | "unknown" | "declined" | "pending" | "finding" | null;

/** Nobody has said anything yet (no "don't know" either). */
export function notAsked(v: PersonView) {
  return v.status === "unknown" && !v.reports.some((r) => r.kind === "dont-know");
}

export function nodeStatus(v: PersonView, pending?: boolean): NodeStatus {
  if (v.person.relation === "self") return "self";
  if (v.status === "unknown") return pending || notAsked(v) ? "pending" : "unknown";
  return v.status;
}

/** NSGC "affected": a heart condition was reported (never for someone who declined). */
export const hasFinding = (v: PersonView) => v.cardiac && v.status !== "declined";

/** Mono status word on a node (DESIGN §12.2). */
export function statusWord(ns: NodeStatus, pending?: boolean): string {
  switch (ns) {
    case "known":
      return "Known";
    case "conflicting":
      return "Disagree";
    case "unknown":
      return "Unknown";
    case "declined":
      return "Declined";
    case "pending":
      return pending ? "Invited · waiting" : "Not asked";
    default:
      return "You";
  }
}

export function matchesHighlight(v: PersonView, ns: NodeStatus, h: Highlight) {
  if (!h) return true;
  if (h === "finding") return hasFinding(v);
  return ns === h;
}

/** Counts for the legend filter: the lib's counts(), with "unknown" split into unknown vs not asked / waiting. */
export function legendCounts(views: PersonView[], pendingIds: Set<string>) {
  const out = { known: 0, conflicting: 0, unknown: 0, declined: 0, pending: 0, finding: 0 };
  for (const v of views) {
    if (v.person.relation === "self") continue;
    const ns = nodeStatus(v, pendingIds.has(v.person.id));
    if (ns !== "self") out[ns] += 1;
    if (hasFinding(v)) out.finding += 1;
  }
  return out;
}

export const RELATION_TEXT: Record<Relation, string> = {
  self: "You",
  mother: "Your mother",
  father: "Your father",
  sibling: "Your brother or sister",
  "paternal-grandfather": "Your father’s father",
  "paternal-grandmother": "Your father’s mother",
  "maternal-grandfather": "Your mother’s father",
  "maternal-grandmother": "Your mother’s mother",
  "paternal-aunt-uncle": "Your father’s brother or sister",
  "maternal-aunt-uncle": "Your mother’s brother or sister",
};

export function sideOf(r: Relation): "father" | "mother" | null {
  if (r === "father" || r.startsWith("paternal")) return "father";
  if (r === "mother" || r.startsWith("maternal")) return "mother";
  return null;
}

/** "Your father · Father’s side" (the panel eyebrow). */
export function relationLine(p: Person) {
  const side = sideOf(p.relation);
  return side ? `${RELATION_TEXT[p.relation]} · ${side === "father" ? "Father’s" : "Mother’s"} side` : RELATION_TEXT[p.relation];
}

export function shortName(label: string) {
  return label.replace(/\s*\(you\)$/, "");
}

export const pronoun = (p: Person) => (p.sex === "male" ? "he" : p.sex === "female" ? "she" : "they");

/** Generation index used by the list view and the entrance stagger. */
export function generationOf(r: Relation): 0 | 1 | 2 {
  if (r.includes("grand")) return 0;
  if (r === "self" || r === "sibling") return 2;
  return 1;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Sep 27" in UTC, so server and client agree. */
export function shortDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** The visit date ("Oct 14"); "date not set" when empty. */
export function formatVisitDate(iso: string) {
  if (!iso) return "date not set";
  return shortDate(iso);
}

/** "Heart attack · age 60" (the receipt's fact line). */
export function factLine(r: Report): string {
  if (r.kind === "no-history") return "No heart history";
  if (r.kind === "declined") return "Chose not to share";
  if (r.kind === "dont-know") return "Doesn’t know";
  const name = r.condition ?? "Condition";
  return r.ageAtOnset == null ? name : `${name} · ${r.approximate ? "about " : ""}age ${r.ageAtOnset}`;
}

/** SourceChip kind for a report. */
export function sourceKind(r: Report): "self" | "relative" | "patient" | "record" {
  return r.source;
}

/** Reports the patient may remove (their own entries), exactly as before the redesign. */
export const canRemove = (r: Report) => r.source === "patient" || (r.source === "self" && r.reportedById === "self");

// ---------- Visit-ready checklist (never describes health) ----------

export type ReadyKey = "parents" | "deaths" | "ask" | "review";
export interface ReadyItem {
  key: ReadyKey;
  label: string;
  done: boolean;
  /** Where the item's link goes: a person + panel mode, or the summary. */
  target?: { personId: string; mode: "answer" | "edit" | "invite"; field?: "age" | "cause" } | { href: string };
}

export function visitReady(tree: FamilyTree): ReadyItem[] {
  const about = (id: string | undefined) => (id ? tree.reports.some((r) => r.personId === id) : false);
  const mom = tree.people.find((p) => p.relation === "mother");
  const dad = tree.people.find((p) => p.relation === "father");
  const parentsDone = !!mom && !!dad && about(mom.id) && about(dad.id);
  const parentTarget = mom && !about(mom.id) ? mom : dad && !about(dad.id) ? dad : (mom ?? dad);

  const deceased = tree.people.filter((p) => p.deceased && p.relation !== "self");
  const missingCause = deceased.find((p) => !p.causeOfDeath);

  const invited = new Set(tree.invites.map((i) => i.personId));
  const askable =
    tree.people.find((p) => p.relation !== "self" && !p.deceased && !invited.has(p.id)) ?? tree.people.find((p) => p.relation !== "self" && !p.deceased);

  return [
    {
      key: "parents",
      label: "Add what you know about your parents",
      done: parentsDone,
      target: parentTarget ? { personId: parentTarget.id, mode: "answer" } : undefined,
    },
    {
      key: "deaths",
      label: "Note how anyone who passed away died",
      done: deceased.every((p) => !!p.causeOfDeath),
      target: missingCause ? { personId: missingCause.id, mode: "edit", field: "cause" } : undefined,
    },
    {
      key: "ask",
      label: "Ask one relative directly",
      done: tree.invites.length >= 1,
      target: askable ? { personId: askable.id, mode: "invite" } : undefined,
    },
    { key: "review", label: "Review your summary", done: !!tree.reviewedAt, target: { href: "/summary" } },
  ];
}
