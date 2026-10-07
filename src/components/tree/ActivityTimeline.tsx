import type { ReactNode } from "react";
import { formatCondition, type PersonView } from "@/lib/status";
import type { FamilyTree, Report } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PedigreeGlyph, shapeForSex } from "@/components/ui/PedigreeGlyph";
import { SourceChip } from "@/components/ui/SourceChip";
import { hasFinding, nodeStatus, shortDate } from "./model";

const B = ({ children }: { children: ReactNode }) => <span className="font-medium text-fg">{children}</span>;

/** One activity sentence: who said what about whom (facts only, no judgement). */
function sentence(r: Report, nameOf: (id: string) => string): ReactNode {
  const who = r.reportedById === "self" ? "You" : r.reportedBy;
  const subject = nameOf(r.personId);
  const aboutSelf = r.reportedById === r.personId || (r.reportedById === "self" && r.personId === "self");
  const fact = r.kind === "condition" ? formatCondition(r) : "";
  if (r.kind === "declined")
    return (
      <>
        <B>{who}</B> chose not to share
      </>
    );
  if (r.kind === "dont-know")
    return (
      <>
        <B>{who}</B> doesn’t know about <B>{subject}</B>
      </>
    );
  if (r.kind === "no-history")
    return aboutSelf ? (
      <>
        <B>{who}</B> {who === "You" ? "have" : "has"} no heart history
      </>
    ) : (
      <>
        <B>{who}</B> says <B>{subject}</B> has no heart history
      </>
    );
  if (r.source === "record")
    return (
      <>
        <B>{who}</B> shared from a portal record: {fact}
      </>
    );
  if (aboutSelf)
    return (
      <>
        <B>{who}</B> added {who === "You" ? "your own history" : "their own history"}: {fact}
      </>
    );
  if (r.reportedById === "self")
    return (
      <>
        <B>You</B> added about <B>{subject}</B>: {fact}
      </>
    );
  return (
    <>
      <B>{who}</B> says <B>{subject}</B> had: {fact}
    </>
  );
}

export interface ActivityTimelineProps {
  tree: FamilyTree;
  views: PersonView[];
  pendingIds: Set<string>;
  /** Report ids that arrived while this page was open (or since the last visit this session). */
  newIds: Set<string>;
  onStart: () => void;
}

/** The latest answers, newest first: a glyph avatar, a sentence, a mono date and the source chip (DESIGN §12.1). */
export function ActivityTimeline({ tree, views, pendingIds, newIds, onStart }: ActivityTimelineProps) {
  const byId = new Map(views.map((v) => [v.person.id, v]));
  const nameOf = (id: string) => byId.get(id)?.person.label ?? "Someone";
  const rows = [...tree.reports].sort((a, b) => b.reportedAt.localeCompare(a.reportedAt)).slice(0, 6);
  return (
    <section aria-labelledby="activity-title">
      <h2 id="activity-title" className="font-mono text-eyebrow font-medium text-fg-3 uppercase">
        Activity
      </h2>
      {rows.length === 0 ? (
        <div className="mt-3 rounded-md border border-dashed border-line-strong p-4">
          <p className="text-small text-fg-2">No one has answered yet. Start with your mother’s side.</p>
          <Button size="sm" className="mt-3 max-lg:h-11" onClick={onStart}>
            Add what you know
          </Button>
        </div>
      ) : (
        <ol className="relative mt-2 before:absolute before:top-5 before:bottom-5 before:left-[15px] before:w-px before:bg-line">
          {rows.map((r) => {
            const v = byId.get(r.personId);
            const isNew = newIds.has(r.id);
            return (
              <li key={r.id} className="relative flex gap-3 py-2.5">
                <span aria-hidden className="relative z-1 grid size-8 shrink-0 place-items-center rounded-full bg-surface ring-1 ring-line">
                  {v ? (
                    <PedigreeGlyph
                      shape={shapeForSex(v.person.sex)}
                      status={nodeStatus(v, pendingIds.has(v.person.id))}
                      finding={hasFinding(v)}
                      deceased={v.person.deceased}
                      proband={v.person.relation === "self"}
                      size={20}
                    />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-small text-fg-2">
                    {sentence(r, nameOf)}
                    {isNew ? (
                      <Badge tone="brand" mono className="ml-2 h-5 align-[1px]">
                        New
                      </Badge>
                    ) : null}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <SourceChip
                      kind={r.source}
                      who={r.reportedById === "self" ? "you" : r.reportedBy}
                      date={r.source === "record" ? r.record?.recordedDate : undefined}
                      system={r.record?.system}
                    />
                    <time dateTime={r.reportedAt} className="font-mono text-eyebrow text-fg-3 uppercase">
                      {shortDate(r.reportedAt)}
                    </time>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
