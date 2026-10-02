"use client";

import { useEffect, useRef, useState } from "react";
import { buildInvite, inviteUrl } from "@/lib/share";
import { actions, deviceId } from "@/lib/store";
import { formatCondition, type PersonView } from "@/lib/status";
import type { FamilyTree, Relation, Report } from "@/lib/types";
import AnswerForm, { type Answer } from "./AnswerForm";
import { Check, Close, Link as LinkIcon, Lock } from "./icons";
import styles from "./PersonPanel.module.css";

const RELATION_TEXT: Record<Relation, string> = {
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

const STATUS_TEXT = {
  known: "Known",
  conflicting: "Conflicting",
  unknown: "Unknown",
  declined: "Declined",
} as const;

export default function PersonPanel({
  view,
  tree,
  onClose,
  focusOnOpen,
}: {
  view: PersonView;
  tree: FamilyTree;
  onClose: () => void;
  /** Move focus here (and scroll into view on narrow screens) when opened by the user. */
  focusOnOpen?: boolean;
}) {
  const p = view.person;
  const isSelf = p.relation === "self";
  const [mode, setMode] = useState<"view" | "answer" | "invite" | "edit">("view");
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!focusOnOpen || !heading.current) return;
    heading.current.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 1040px)").matches) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      heading.current.closest("section")?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
  }, [focusOnOpen]);

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
    setMode("view");
  };

  return (
    <section className={`card ${styles.panel}`} aria-label={`${p.label} details`}>
      <header className={styles.head}>
        <div>
          <p className={styles.rel}>{RELATION_TEXT[p.relation]}</p>
          <h2 className={styles.name} ref={heading} tabIndex={-1}>
            {p.label}
            {p.deceased ? <span className={styles.dagger}> † deceased</span> : null}
          </h2>
          {!isSelf ? (
            <div className={styles.statusRow}>
              <span className={`chip chip-${view.status}`}>{STATUS_TEXT[view.status]}</span>
              {view.verified ? (
                <span className="chip chip-record">
                  <Check size={11} /> From a portal record
                </span>
              ) : null}
              {view.reason && !view.verified ? <span className={styles.reason}>{view.reason}</span> : null}
            </div>
          ) : null}
        </div>
        <button className={`btn btn-ghost btn-sm ${styles.close}`} onClick={onClose} aria-label="Close">
          <Close size={16} />
        </button>
      </header>

      {mode === "answer" ? (
        <AnswerForm
          subject={isSelf ? "you" : p.label}
          self={isSelf}
          allowDecline={false}
          compact
          submitLabel="Add to tree"
          onSubmit={save}
          onCancel={() => setMode("view")}
        />
      ) : mode === "invite" ? (
        <InviteBox tree={tree} view={view} onDone={() => setMode("view")} />
      ) : mode === "edit" ? (
        <EditPerson view={view} onDone={() => setMode("view")} onRemoved={onClose} />
      ) : (
        <>
          <div className={styles.section}>
            <h3 className={styles.h3}>{isSelf ? "Your own heart history" : "What we know"}</h3>
            {isSelf ? <p className={styles.tip}>Shown on your summary under &ldquo;Your own history&rdquo;.</p> : null}
            {view.reports.length === 0 ? (
              <p className="muted">Nothing yet.</p>
            ) : (
              <ul className={styles.reports}>
                {view.reports.map((r) => (
                  <ReportRow key={r.id} r={r} canRemove={r.source === "patient" || (r.source === "self" && r.reportedById === "self")} />
                ))}
              </ul>
            )}
          </div>

          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={() => setMode("answer")}>
              {isSelf ? "Add your own history" : "Add what you know"}
            </button>
            {!isSelf && !p.deceased ? (
              <button className="btn btn-secondary" onClick={() => setMode("invite")}>
                <LinkIcon size={14} /> Ask {shortName(p.label)} directly
              </button>
            ) : null}
            {!isSelf && p.deceased ? (
              <p className={styles.tip}>
                {shortName(p.label)} has passed away. Ask a relative who knew them; their answers show up here with their name attached.
              </p>
            ) : null}
            {!isSelf ? (
              <button className="btn btn-ghost btn-sm" onClick={() => setMode("edit")}>
                Edit details
              </button>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

function ReportRow({ r, canRemove }: { r: Report; canRemove: boolean }) {
  const what =
    r.kind === "condition"
      ? formatCondition(r)
      : r.kind === "no-history"
        ? "No heart history"
        : r.kind === "declined"
          ? "Prefers not to share"
          : "Doesn’t know";
  const from =
    r.source === "record"
      ? `From ${r.record?.system ?? "a portal record"}, shared by ${r.reportedBy}`
      : r.source === "self"
        ? `${r.reportedBy}, about themself`
        : r.source === "patient"
          ? `${r.reportedBy} (you)`
          : `${r.reportedBy} said`;
  return (
    <li className={`${styles.report} ${r.source === "record" ? styles.recordRow : ""}`}>
      <div className={styles.reportMain}>
        <b>{what}</b>
        {r.kind === "declined" ? <Lock size={12} className={styles.lockIcon} /> : null}
        {r.note && r.kind !== "declined" ? <q className={styles.note}>{r.note}</q> : null}
        <small>
          {r.source === "record" ? <Check size={11} /> : null} {from} · {new Date(r.reportedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          {r.record?.recordedDate ? ` · on problem list since ${r.record.recordedDate.slice(0, 4)}` : ""}
        </small>
      </div>
      {canRemove ? (
        <button className="btn btn-ghost btn-sm" onClick={() => actions.removeReport(r.id)} aria-label="Remove this entry">
          <Close size={13} />
        </button>
      ) : null}
    </li>
  );
}

function InviteBox({ tree, view, onDone }: { tree: FamilyTree; view: PersonView; onDone: () => void }) {
  const p = view.person;
  const [url] = useState(() => inviteUrl(window.location.origin, buildInvite(tree, p, deviceId())));
  const [copied, setCopied] = useState(false);
  // Only mark someone as invited once the link has actually left this screen.
  const markSent = () => actions.createInvite(p.id);
  const message = `Hi! I'm getting ready for a ${tree.visit?.specialty.toLowerCase() ?? "doctor's"} visit and I'm putting together our family's heart history. Could you answer a few quick questions? It takes about 2 minutes: ${url}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      markSent();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Family heart history", text: message });
        markSent();
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  };

  return (
    <div className={styles.invite}>
      <h3 className={styles.h3}>Ask {shortName(p.label)} to fill in their branch</h3>
      <p className={styles.tip}>
        They answer on their own phone, with no account. They can also share one fact from their MyChart without sharing their whole chart.
      </p>
      <textarea className={`input ${styles.msg}`} readOnly value={message} rows={5} aria-label="Invite message" />
      <div className={styles.inviteActions}>
        <button className="btn btn-primary" onClick={share}>
          Send…
        </button>
        <button className="btn btn-secondary" onClick={copy}>
          {copied ? "Copied" : "Copy message"}
        </button>
        <a className="btn btn-ghost" href={url} target="_blank" rel="noopener noreferrer" onClick={markSent}>
          Preview as {shortName(p.label)}
        </a>
      </div>
      <p className={styles.small}>
        <Lock size={11} /> The answers ride inside the link itself (after the #), which browsers never send to a server.
      </p>
      <button className="btn btn-ghost btn-sm" onClick={onDone}>
        Done
      </button>
    </div>
  );
}

function EditPerson({ view, onDone, onRemoved }: { view: PersonView; onDone: () => void; onRemoved: () => void }) {
  const p = view.person;
  const [label, setLabel] = useState(p.label);
  const [sex, setSex] = useState(p.sex);
  const [deceased, setDeceased] = useState(!!p.deceased);
  const [ageAtDeath, setAgeAtDeath] = useState(p.ageAtDeath != null ? String(p.ageAtDeath) : "");
  const [cause, setCause] = useState(p.causeOfDeath ?? "");
  const removable = !["self", "mother", "father"].includes(p.relation);
  return (
    <form
      className={styles.edit}
      onSubmit={(e) => {
        e.preventDefault();
        const age = Number.parseInt(ageAtDeath, 10);
        actions.updatePerson(p.id, {
          label: label.trim() || p.label,
          sex,
          deceased: deceased || undefined,
          ageAtDeath: deceased && Number.isFinite(age) && age >= 0 && age < 130 ? age : undefined,
          causeOfDeath: deceased ? cause.trim() || undefined : undefined,
        });
        onDone();
      }}
    >
      <label className="field">
        <span className="field-label">Name</span>
        <input className="input" value={label} onChange={(e) => setLabel(e.target.value.slice(0, 40))} />
      </label>
      <label className="field">
        <span className="field-label">Sex</span>
        <select className="input" value={sex} onChange={(e) => setSex(e.target.value as typeof sex)}>
          <option value="unknown">Not set</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
        <span className="field-hint">Used only for age cutoffs on the summary (e.g. early heart disease).</span>
      </label>
      <label className={styles.check}>
        <input type="checkbox" checked={deceased} onChange={(e) => setDeceased(e.target.checked)} /> Has passed away
      </label>
      {deceased ? (
        <div className={styles.deathRow}>
          <label className="field">
            <span className="field-label">Age at death</span>
            <input
              className="input"
              inputMode="numeric"
              placeholder="e.g. 66"
              value={ageAtDeath}
              onChange={(e) => setAgeAtDeath(e.target.value.replace(/\D/g, "").slice(0, 3))}
            />
          </label>
          <label className="field">
            <span className="field-label">Cause, if known</span>
            <input className="input" placeholder="e.g. heart attack, sudden, cancer" value={cause} onChange={(e) => setCause(e.target.value.slice(0, 80))} />
          </label>
          <span className="field-hint">Was it sudden or unexpected? Say so in the cause; it matters to the cardiologist.</span>
        </div>
      ) : null}
      <div className={styles.inviteActions}>
        {removable ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              actions.removePerson(p.id);
              onRemoved();
            }}
          >
            Remove from tree
          </button>
        ) : null}
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}

export function shortName(label: string) {
  return label.replace(/\s*\(you\)$/, "");
}
