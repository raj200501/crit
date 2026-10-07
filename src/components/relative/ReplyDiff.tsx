import { ArrowRight, Link2 } from "lucide-react";
import type { PersonView } from "@/lib/status";
import { cn } from "../ui/cn";
import { PedigreeGlyph, shapeForSex } from "../ui/PedigreeGlyph";
import { STATUS_LABEL, type UiStatus } from "../ui/status";
import { StatusPill } from "../ui/StatusPill";
import { uiStatus, type DiffRow } from "./replyPreview";

/** Before → after per person (DESIGN §12.7): the glyph grammar, the status word and the headline, read-only. */
export function ReplyDiff({ rows }: { rows: DiffRow[] }) {
  // People whose page changes come first; a reply that only agrees with what's there says "No change".
  const marked = rows.map((r) => ({ ...r, same: describeState(r.before) === describeState(r.after) }));
  const ordered = [...marked.filter((r) => !r.same), ...marked.filter((r) => r.same)];
  return (
    <ul className="flex flex-col divide-y divide-line">
      {ordered.map(({ person, before, after, same }) => (
        <li key={person.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-ui font-strong text-fg">{person.label}</h3>
            {same ? <span className="font-mono text-eyebrow font-medium text-fg-3 uppercase">No change</span> : null}
          </div>
          {same ? (
            <State view={after} muted />
          ) : (
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1.35fr)] items-start gap-x-2.5 sm:gap-x-4">
              <State view={before} muted />
              <span aria-hidden className="mt-2 grid size-7 place-items-center rounded-full bg-mist text-fg-3">
                <ArrowRight className="size-3.5" strokeWidth={2.25} />
              </span>
              <State view={after} />
            </div>
          )}
          <p className="sr-only">{same ? `No change: ${describeState(after)}.` : `Before: ${describeState(before)}. After: ${describeState(after)}.`}</p>
        </li>
      ))}
    </ul>
  );
}

/** "Not asked yet" and "Chose not to share" say it all; the lib's headline would only repeat them. */
const hasHeadline = (s: UiStatus) => s === "known" || s === "conflicting" || s === "unknown";

function describeState(v: PersonView) {
  const status = uiStatus(v);
  return `${STATUS_LABEL[status]}${hasHeadline(status) ? `, ${v.headline}` : ""}${v.verified ? ", from a portal record (demo)" : ""}`;
}

function State({ view, muted }: { view: PersonView; muted?: boolean }) {
  const status = uiStatus(view);
  const finding = view.cardiac && view.status !== "declined";
  return (
    <div aria-hidden className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <PedigreeGlyph shape={shapeForSex(view.person.sex)} status={status} finding={finding} deceased={view.person.deceased} record={view.verified} size={30} />
        <StatusPill status={status} size="sm" />
      </div>
      {hasHeadline(status) ? <p className={cn("text-small", muted ? "text-fg-3" : "text-fg")}>{view.headline}</p> : null}
      {view.verified && !muted ? (
        <p className="flex items-center gap-1.5 font-mono text-eyebrow font-medium text-record uppercase">
          <Link2 className="size-3.5 shrink-0" strokeWidth={2.25} />
          From a portal record (demo)
        </p>
      ) : null}
    </div>
  );
}
