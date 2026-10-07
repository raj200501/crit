// Read-only preview of a reply import for /reply's before → after rows (DESIGN §12.7). Nothing here writes the tree.
import { cleanReport } from "@/lib/sanitize";
import { askAbout, type ReplyPayload } from "@/lib/share";
import { viewPerson, type PersonView } from "@/lib/status";
import type { FamilyTree, Person, Report } from "@/lib/types";
import type { UiStatus } from "../ui/status";

/** Sorts after every stored report, the way the real import stamps "now" (kept constant so renders stay pure). */
const PREVIEW_AT = "9999-12-31T00:00:00.000Z";

/**
 * The tree as `actions.importReply` (src/lib/store.ts) would leave it, computed without saving: only the invitee and the
 * relatives they were asked about, declines only about themself, and their newer answers replace their older ones.
 * Returns null when the import would be refused (different tree, not invited).
 */
export function previewImport(tree: FamilyTree, reply: ReplyPayload): { tree: FamilyTree; touched: Set<string> } | null {
  if (reply.t !== tree.id) return null;
  const invitee = tree.people.find((p) => p.id === reply.p);
  if (!invitee || !tree.invites.some((i) => i.personId === invitee.id)) return null;
  const allowed = new Set([invitee.id, ...askAbout(tree, invitee).map((a) => a.id)]);
  const incoming = (Array.isArray(reply.reports) ? reply.reports : [])
    .map(cleanReport)
    .filter((r): r is Omit<Report, "id"> => !!r && allowed.has(r.personId))
    .flatMap((r): Omit<Report, "id">[] => {
      const aboutSelf = r.personId === invitee.id;
      if (!aboutSelf && r.kind === "declined") return [];
      const source = aboutSelf ? (r.source === "record" && r.record ? "record" : "self") : "relative";
      return [{ ...r, source, record: source === "record" ? r.record : undefined, reportedBy: invitee.label, reportedById: invitee.id, reportedAt: PREVIEW_AT }];
    });
  const touched = new Set(incoming.map((r) => r.personId));
  const kept = tree.reports.filter((r) => !(r.reportedById === invitee.id && r.source !== "patient" && touched.has(r.personId)));
  return { tree: { ...tree, reports: [...kept, ...incoming.map((r, i) => ({ ...r, id: `preview-${i}` }))] }, touched };
}

export interface DiffRow {
  person: Person;
  before: PersonView;
  after: PersonView;
}

/** One row per person the reply changes, in tree order, with their view before and after. */
export function replyDiff(tree: FamilyTree, reply: ReplyPayload): DiffRow[] | null {
  const preview = previewImport(tree, reply);
  if (!preview) return null;
  return tree.people
    .filter((p) => preview.touched.has(p.id))
    .map((person) => ({ person, before: viewPerson(tree, person), after: viewPerson(preview.tree, person) }));
}

/** The lib's "unknown" splits into "Not asked yet" (nobody said anything) and "Unknown" (someone said they don't know). */
export function uiStatus(v: PersonView): UiStatus {
  if (v.status === "unknown") return v.reports.some((r) => r.kind === "dont-know") ? "unknown" : "pending";
  return v.status;
}
