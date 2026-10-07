"use client";

import { Link2, PenLine, Plus, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { actions } from "@/lib/store";
import type { PersonView } from "@/lib/status";
import type { FamilyTree, Report } from "@/lib/types";
import AnswerForm, { type Answer } from "./AnswerForm";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { cn } from "./ui/cn";
import { Eyebrow } from "./ui/Eyebrow";
import { IconButton } from "./ui/IconButton";
import { PedigreeGlyph, shapeForSex } from "./ui/PedigreeGlyph";
import { StatusPill } from "./ui/StatusPill";
import { AutoHeight } from "./person/AutoHeight";
import { useEnter } from "./person/useEnter";
import { EditPerson } from "./person/EditPerson";
import { InviteBox } from "./person/InviteBox";
import { ReceiptTimeline } from "./person/ReceiptTimeline";
import { VoicePair, voicesOf } from "./person/VoicePair";
import { canRemove, hasFinding, nodeStatus, notAsked, pronoun, relationLine, shortDate, shortName } from "./tree/model";

export { shortName } from "./tree/model";

export type PanelMode = "view" | "answer" | "invite" | "edit";

export interface PersonPanelProps {
  view: PersonView;
  tree: FamilyTree;
  onClose: () => void;
  /** Move focus to the name when opened by the user. */
  focusOnOpen?: boolean;
  /** From ?mode= (DESIGN §11.4). */
  initialMode?: "view" | "answer" | "invite";
  /** Internal (visit-ready checklist and gap links): open the edit form on this field. */
  initialEdit?: "age" | "cause";
  /** Invited and waiting. */
  pending?: boolean;
}

/**
 * Everything about one relative (DESIGN §12.3): who they are, what was said and by whom (receipts, with conflicts as two
 * voices), what's still unknown, and the actions. The root stays `<section aria-label="{label} details">` on desktop
 * (inline inspector) and on phones (inside the bottom sheet); the h2 is the sheet's label and the focus target.
 */
export default function PersonPanel({ view, tree, onClose, focusOnOpen, initialMode, initialEdit, pending }: PersonPanelProps) {
  const p = view.person;
  const isSelf = p.relation === "self";
  const short = shortName(p.label);
  const them = p.sex === "male" ? "him" : p.sex === "female" ? "her" : "them";
  const [mode, setMode] = useState<PanelMode>(initialEdit ? "edit" : (initialMode ?? "view"));
  const [editField, setEditField] = useState(initialEdit);
  const heading = useRef<HTMLHeadingElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const firstMode = useRef(true);
  const titleId = `person-${p.id}-title`;
  // mode changes crossfade (the height animates in AutoHeight)
  useEnter(body, { duration: 180 }, [mode]);

  useEffect(() => {
    if (!focusOnOpen) return;
    // a frame later, so a sheet's showModal() has run and the heading is focusable
    const raf = requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [focusOnOpen]);

  // Mode changes move focus to the new content (back to the name when returning to the overview of this person).
  useEffect(() => {
    if (firstMode.current) {
      firstMode.current = false;
      return;
    }
    const raf = requestAnimationFrame(() => {
      // a form that already took focus (a gap's "Add" focuses its field) keeps it
      if (mode !== "view" && body.current?.contains(document.activeElement)) return;
      (mode === "view" ? heading.current : body.current)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  const go = (next: PanelMode, field?: "age" | "cause") => {
    setEditField(field);
    setMode(next);
  };

  const save = (answers: Answer[]) => {
    const now = new Date().toISOString();
    actions.addReports(
      answers.map((a) => ({
        ...a,
        personId: p.id,
        reportedBy: tree.patientName === "You" ? "You" : tree.patientName,
        reportedById: "self",
        source: isSelf ? "self" : "patient",
        reportedAt: now,
      })),
    );
    go("view");
  };

  const ns = nodeStatus(view, pending);
  const invite = [...tree.invites].filter((i) => i.personId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  return (
    <section aria-label={`${p.label} details`} className="flex flex-col">
      <header className="flex items-start gap-4 pb-5">
        <span className={cn("mt-1 grid size-14 shrink-0 place-items-center rounded-2xl", isSelf ? "bg-ink" : "bg-canvas ring-1 ring-line")}>
          <PedigreeGlyph
            shape={shapeForSex(p.sex)}
            status={ns}
            finding={hasFinding(view)}
            deceased={p.deceased}
            record={view.verified}
            proband={isSelf}
            size={40}
            tone={isSelf ? "night" : "paper"}
          />
        </span>
        <div className="min-w-0 flex-1">
          <Eyebrow>{relationLine(p)}</Eyebrow>
          <h2 id={titleId} ref={heading} tabIndex={-1} className="mt-1 font-display text-display-m font-book break-words text-fg outline-none">
            {p.label}
          </h2>
          {p.deceased ? (
            <p className="mt-1 flex items-center gap-2 text-small text-fg-2">
              <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-ink-2">
                <rect x="2.5" y="2.5" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 15 15 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Passed away{p.ageAtDeath != null ? ` at ${p.ageAtDeath}` : ""}
              {p.causeOfDeath ? ` · ${p.causeOfDeath}` : ""}
            </p>
          ) : null}
          {!isSelf ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {ns !== "self" ? <StatusPill status={ns} /> : null}
              {view.verified ? (
                <Badge tone="record" icon={<Link2 />}>
                  From a portal record
                </Badge>
              ) : null}
            </div>
          ) : null}
          {!isSelf && invite ? (
            <p className="mt-2.5 font-mono text-eyebrow text-fg-3 uppercase">
              Asked directly {shortDate(invite.createdAt)}
              {invite.answeredAt ? ` · answered ${shortDate(invite.answeredAt)}` : " · waiting"}
            </p>
          ) : null}
        </div>
        <IconButton label="Close" title="Close" icon={<X />} onClick={onClose} className="-mt-1.5 -mr-2" />
      </header>

      <AutoHeight step={mode}>
        <div key={mode} ref={body} tabIndex={-1} className="border-t border-line pt-5 outline-none">
          {mode === "answer" ? (
            <AnswerForm
              subject={isSelf ? "you" : p.label}
              self={isSelf}
              allowDecline={false}
              compact
              submitLabel="Add to tree"
              onSubmit={save}
              onCancel={() => go("view")}
            />
          ) : mode === "invite" ? (
            <InviteBox tree={tree} view={view} onDone={() => go("view")} />
          ) : mode === "edit" ? (
            <EditPerson view={view} focusField={editField} onDone={() => go("view")} onRemoved={onClose} />
          ) : (
            <Overview view={view} isSelf={isSelf} short={short} them={them} onGo={go} />
          )}
        </div>
      </AutoHeight>
    </section>
  );
}

function Overview({
  view,
  isSelf,
  short,
  them,
  onGo,
}: {
  view: PersonView;
  isSelf: boolean;
  short: string;
  them: string;
  onGo: (mode: PanelMode, field?: "age" | "cause") => void;
}) {
  const p = view.person;
  const voices = view.status === "conflicting" ? voicesOf(view.reports) : null;
  const rest = voices ? view.reports.filter((r) => r.id !== voices[0].id && r.id !== voices[1].id) : view.reports;
  const remove = (id: string) => actions.removeReport(id);
  const removable = (r: Report) => canRemove(r);

  const gaps: { label: string; aria: string; go: () => void }[] = [];
  if (!isSelf && p.deceased && p.ageAtDeath == null) gaps.push({ label: "age at death", aria: "Add age at death", go: () => onGo("edit", "age") });
  if (!isSelf && p.deceased && !p.causeOfDeath) {
    const how = `how ${pronoun(p)} died`;
    gaps.push({ label: how, aria: `Add ${how}`, go: () => onGo("edit", "cause") });
  }
  if (!isSelf && view.status === "unknown") gaps.push({ label: "their heart history", aria: "Add their heart history", go: () => onGo("answer") });

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby={`know-${p.id}`} className="flex flex-col gap-4">
        <div>
          <h3 id={`know-${p.id}`} className="font-mono text-eyebrow font-medium text-fg-3 uppercase">
            {isSelf ? "Your own heart history" : "What we know"}
          </h3>
          {isSelf ? <p className="mt-1 text-small text-fg-3">Shown on your summary under &ldquo;Your own history&rdquo;.</p> : null}
        </div>
        {voices ? <VoicePair voices={voices} removable={removable} onRemove={remove} /> : null}
        {rest.length ? (
          <ReceiptTimeline reports={rest} removable={removable} onRemove={remove} />
        ) : !voices ? (
          <p className="rounded-md border border-dashed border-line-strong px-4 py-3.5 text-small text-fg-2">
            {isSelf
              ? "Nothing yet. If you’ve had any heart condition yourself, add it here."
              : notAsked(view)
                ? `No one has answered about ${short} yet.`
                : `Nothing confirmed about ${short} yet.`}
          </p>
        ) : null}
      </section>

      {gaps.length ? (
        <div className="rounded-md bg-sunken/70 px-4 py-3">
          <p className="text-small text-fg-2">
            <span className="font-medium text-fg">Still unknown: </span>
            {gaps.map((g, i) => (
              <span key={g.label}>
                {i ? <span aria-hidden> · </span> : null}
                {g.label}{" "}
                <button
                  type="button"
                  aria-label={g.aria}
                  onClick={g.go}
                  className="cursor-pointer rounded-xs font-medium text-brand underline decoration-brand/30 underline-offset-2 hover:text-brand-strong hover:decoration-current"
                >
                  Add
                </button>
              </span>
            ))}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Button iconLeft={<Plus />} fullWidth onClick={() => onGo("answer")}>
          {isSelf ? "Add your own history" : "Add what you know"}
        </Button>
        {!isSelf && !p.deceased ? (
          <Button variant="secondary" iconLeft={<Send />} fullWidth onClick={() => onGo("invite")}>
            Ask {short} directly
          </Button>
        ) : null}
        {!isSelf && p.deceased ? (
          <p className="rounded-md bg-sunken/70 px-4 py-3 text-small text-fg-2">
            {short} has passed away. Ask a relative who knew {them}; their answers show up here with their name attached.
          </p>
        ) : null}
        {!isSelf ? (
          <Button variant="ghost" iconLeft={<PenLine />} fullWidth onClick={() => onGo("edit")}>
            Edit details
          </Button>
        ) : null}
      </div>
    </div>
  );
}
