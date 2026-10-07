// Presentation-only derivations for the pre-visit summary, the care-team view and the practice demo (DESIGN §12.8).
// Reads src/lib, never writes it. Server-safe (no hooks), so SummaryDocument can render as a Server Component.
import { FIRST_DEGREE, SECOND_DEGREE } from "@/lib/clinical";
import { formatCondition, normalizeCondition, type PersonView } from "@/lib/status";
import type { FamilyTree, Person, Report } from "@/lib/types";
import type { SourceKind } from "@/components/ui/SourceChip";
import type { UiStatus } from "@/components/ui/status";

export type Audience = "patient" | "clinician";

/** What a pedigree symbol shows: the lib status, with "nobody has said anything yet" drawn as "Not asked yet". */
export type NodeStatus = UiStatus | "self";

export function notAsked(v: PersonView) {
  return v.status === "unknown" && !v.reports.some((r) => r.kind === "dont-know");
}

export function nodeStatus(v: PersonView): NodeStatus {
  if (v.person.relation === "self") return "self";
  if (v.status === "unknown") return notAsked(v) ? "pending" : "unknown";
  return v.status;
}

/** NSGC "affected": a heart condition was reported (never drawn for someone who declined). */
export const hasFinding = (v: PersonView) => v.cardiac && v.status !== "declined";

/** Epic-style relation names (FAMILY_HX RELATION_C), using the recorded sex where it narrows the word. */
export function relationName(p: Person): string {
  const s = p.sex;
  switch (p.relation) {
    case "self":
      return "Patient";
    case "mother":
      return "Mother";
    case "father":
      return "Father";
    case "sibling":
      return s === "male" ? "Brother" : s === "female" ? "Sister" : "Sibling";
    case "paternal-grandfather":
      return "Paternal grandfather";
    case "paternal-grandmother":
      return "Paternal grandmother";
    case "maternal-grandfather":
      return "Maternal grandfather";
    case "maternal-grandmother":
      return "Maternal grandmother";
    case "paternal-aunt-uncle":
      return s === "male" ? "Paternal uncle" : s === "female" ? "Paternal aunt" : "Father’s sibling";
    case "maternal-aunt-uncle":
      return s === "male" ? "Maternal uncle" : s === "female" ? "Maternal aunt" : "Mother’s sibling";
  }
}

/** First-degree first, heart-related first, then disagreement → known → unknown → declined (the document's reading order). */
export function documentOrder(views: PersonView[]): PersonView[] {
  const rank = (v: PersonView) => {
    const degree = FIRST_DEGREE.includes(v.person.relation) ? 0 : SECOND_DEGREE.includes(v.person.relation) ? 1 : 2;
    const heart = v.cardiac ? 0 : 1;
    const status = { conflicting: 0, known: 1, unknown: 2, declined: 3 }[v.status];
    return degree * 100 + heart * 10 + status;
  };
  return views.filter((v) => v.person.relation !== "self").sort((a, b) => rank(a) - rank(b));
}

/** Generations drawn on the pedigree (the patient's, parents', grandparents'). */
export function generations(people: Person[]): number {
  const parents = people.some((p) => ["mother", "father", "paternal-aunt-uncle", "maternal-aunt-uncle"].includes(p.relation));
  const grands = people.some((p) => p.relation.endsWith("grandfather") || p.relation.endsWith("grandmother"));
  return 1 + (parents ? 1 : 0) + (grands ? 1 : 0);
}

// ---------- Dates ----------
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Oct 14, 2026" for a YYYY-MM-DD date (parsed by hand, so the time zone can't shift the day). */
export function fmtDay(date: string | undefined, opts: { year?: boolean } = {}): string | null {
  if (!date) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.slice(0, 10));
  if (!m) return null;
  const [, y, mo, d] = m;
  return `${MONTHS[Number(mo) - 1]} ${Number(d)}${opts.year === false ? "" : `, ${y}`}`;
}

/** Weekday + day for a YYYY-MM-DD date ("Wed, Oct 14"). */
export function fmtWeekday(date: string): string {
  const [y, mo, d] = date.split("-").map(Number);
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
  return `${wd}, ${MONTHS[mo - 1]} ${d}`;
}

/** A timestamp in the reader's time zone ("Oct 6", or "Oct 6, 2026"). Wrap the output in suppressHydrationWarning. */
export function fmtStamp(iso: string | undefined, opts: { year?: boolean; time?: boolean } = {}): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    ...(opts.year ? { year: "numeric" } : {}),
    ...(opts.time ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

// ---------- Sources ----------
/** Who said it, for chips: "you" on the patient copy, the patient's name on the care-team copy. */
export function chipWho(r: Report, audience: Audience, patientName: string): string | undefined {
  if (r.source === "patient") return audience === "patient" ? "you" : patientName;
  if (r.source === "relative") return r.reportedBy;
  return undefined;
}

/** Epic "source of information" wording (D4 §5.2): Self-reported / Reported by Mom / Portal record (on problem list since 2009). */
export function sourceText(r: Report, patientName: string): string {
  if (r.source === "record") return `Portal record${r.record?.recordedDate ? ` (on problem list since ${r.record.recordedDate.slice(0, 4)})` : ""}`;
  if (r.source === "self") return "Self-reported";
  if (r.source === "patient") return `Reported by ${patientName}`;
  return `Reported by ${r.reportedBy}`;
}

/** Age at onset as a chart cell: "60", "~58" or "—". */
export function ageText(r: Report | undefined): string {
  if (!r || r.ageAtOnset == null) return "—";
  return `${r.approximate ? "~" : ""}${r.ageAtOnset}`;
}

// ---------- Pedigree annotations ----------
const ABBR: [RegExp, string][] = [
  [/atrial fibrillation|afib|a-fib/, "AF"],
  [/heart attack or coronary/, "MI/CAD"],
  [/heart attack|myocardial/, "MI"],
  [/coronary/, "CAD"],
  [/angina/, "angina"],
  [/very high cholesterol|familial hyper/, "v. high chol."],
  [/cholesterol/, "high chol."],
  [/hypertrophic cardiomyopathy/, "HCM"],
  [/cardiomyopathy/, "CM"],
  [/inherited rhythm|long qt|brugada|cpvt/, "inh. rhythm"],
  [/survived cardiac arrest|cardiac arrest|icd/, "SCA/ICD"],
  [/sudden/, "SUD"],
  [/aort/, "aortic"],
  [/stroke|tia/, "stroke/TIA"],
  [/faint|syncope/, "syncope"],
  [/arrhythmia/, "arrhythmia"],
  [/pacemaker/, "pacemaker"],
  [/hypertension/, "HTN"],
];

export function abbreviate(condition: string | undefined): string {
  const n = normalizeCondition(condition);
  for (const [re, short] of ABBR) if (re.test(n)) return short;
  const words = (condition ?? "").trim().split(/\s+/).slice(0, 2).join(" ");
  return words.length > 14 ? `${words.slice(0, 13)}…` : words || "?";
}

/** Short NSGC-style lines under a pedigree symbol: "AF 34", "MI 60 / angina ~58", "d. ?". */
export function annotations(v: PersonView): string[] {
  const lines: string[] = [];
  const conds = v.conditions;
  if (conds.length) {
    const parts = [...new Set(conds.map((r) => `${abbreviate(r.condition)}${r.ageAtOnset != null ? ` ${r.approximate ? "~" : ""}${r.ageAtOnset}` : ""}`))];
    const joined = parts.join(" / ");
    // one line when it fits under the symbol; otherwise one line per condition (at most two, then "+n")
    if (joined.length <= 15) lines.push(joined);
    else {
      lines.push(...parts.slice(0, 2));
      if (parts.length > 2) lines[lines.length - 1] += ` +${parts.length - 2}`;
    }
  } else if (v.status === "known" && v.reports.some((r) => r.kind === "no-history")) {
    lines.push("no heart hx");
  }
  if (v.person.deceased) lines.push(`d. ${v.person.ageAtDeath ?? "?"}`);
  return lines;
}

// ---------- Rows (the care-team table, in Epic order, and "Copy as chart text") ----------
export interface FamilyRow {
  personId: string;
  view: PersonView;
  relation: string;
  name: string;
  problem: string;
  age: string;
  source: string;
  comments: string;
  /** The reports this row stands on, for the provenance popover. */
  reports: Report[];
  /** First row of this person (carries the relation cell) and how many rows the person has. */
  first: boolean;
  span: number;
}

const quote = (s: string) => `“${s.replace(/\s+/g, " ").trim()}”`;

export function familyRows(tree: FamilyTree, views: PersonView[]): FamilyRow[] {
  const out: FamilyRow[] = [];
  for (const v of documentOrder(views)) {
    const p = v.person;
    const base = { personId: p.id, view: v, relation: relationName(p), name: p.label };
    const rows: Omit<FamilyRow, "first" | "span" | keyof typeof base>[] = [];
    if (v.status === "declined") {
      const own = v.reports.filter((r) => r.kind === "declined");
      rows.push({ problem: "Declined to share", age: "—", source: own.length ? "Self-reported" : "—", comments: "Only what the patient knows firsthand is shown.", reports: own });
      for (const r of v.conditions) {
        rows.push({ problem: r.condition ?? "Condition", age: ageText(r), source: sourceText(r, tree.patientName), comments: "The patient’s own knowledge.", reports: [r] });
      }
    } else if (v.status === "unknown") {
      const dk = v.reports.filter((r) => r.kind === "dont-know");
      const notes = dk.filter((r) => r.note).map((r) => `${r.reportedBy}: ${quote(r.note!)}`);
      rows.push({
        problem: "Unknown",
        age: "—",
        source: dk.length ? [...new Set(dk.map((r) => sourceText(r, tree.patientName)))].join(", ") : "—",
        comments: [v.headline, ...notes].join(". "),
        reports: dk,
      });
    } else {
      const none = v.reports.filter((r) => r.kind === "no-history");
      v.conditions.forEach((r, i) => {
        const bits: string[] = [];
        if (i === 0 && v.status === "conflicting") bits.push("Reports disagree; all kept");
        if (r.note) bits.push(quote(r.note));
        rows.push({ problem: r.condition ?? "Condition", age: ageText(r), source: sourceText(r, tree.patientName), comments: bits.join(". "), reports: [r] });
      });
      for (const r of none) {
        rows.push({
          problem: "No heart history",
          age: "—",
          source: sourceText(r, tree.patientName),
          comments: !v.conditions.length || v.status !== "conflicting" ? "" : "Contradicts a reported condition",
          reports: [r],
        });
      }
    }
    if (p.deceased) {
      const died = `Deceased${p.ageAtDeath != null ? ` at ${p.ageAtDeath}` : ""}${p.causeOfDeath ? `, ${p.causeOfDeath}` : ""}`;
      rows[0] = { ...rows[0], comments: [died, rows[0].comments].filter(Boolean).join(". ") };
    }
    rows.forEach((r, i) => out.push({ ...base, ...r, first: i === 0, span: rows.length }));
  }
  return out;
}

/** The provenance behind a set of reports, as plain serializable data (for the client popover island). */
export interface ProvEntry {
  id: string;
  kind: SourceKind;
  who: string;
  /** What they said: "Heart attack, age 60", "No heart history", "Declined to share", "Doesn't know". */
  what: string;
  when?: string;
  note?: string;
  record?: { system: string; recordedDate?: string };
}

export function provenance(reports: Report[], audience: Audience, patientName: string): ProvEntry[] {
  return reports.map((r) => ({
    id: r.id,
    kind: r.source,
    who: r.source === "patient" ? (audience === "patient" ? "You" : patientName) : r.reportedBy,
    what:
      r.kind === "condition"
        ? formatCondition(r)
        : r.kind === "no-history"
          ? "No heart history"
          : r.kind === "declined"
            ? "Chose not to share"
            : "Doesn’t know",
    when: r.reportedAt,
    note: r.note,
    record: r.record ? { system: r.record.system, recordedDate: r.record.recordedDate } : undefined,
  }));
}

// ---------- Keys ----------
/** FNV-1a, hex. Short, stable keys for "this exact content" (clinician review in this browser). */
export function contentHash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
