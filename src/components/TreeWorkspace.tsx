"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { stillToConfirm } from "@/lib/clinical";
import { actions, useTree } from "@/lib/store";
import { counts, viewTree, type PersonView } from "@/lib/status";
import type { FamilyTree, Person, Relation } from "@/lib/types";
import PersonPanel from "./PersonPanel";
import TreeView, { Legend } from "./TreeView";
import { Arrow, Plus } from "./icons";
import styles from "./TreeWorkspace.module.css";

export default function TreeWorkspace() {
  const tree = useTree();
  const views = useMemo(() => viewTree(tree), [tree]);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [adding, setAdding] = useState<Relation | null>(null);
  const [editingVisit, setEditingVisit] = useState(false);
  const [starting, setStarting] = useState(false);

  const c = counts(views);
  const pending = new Set(tree.invites.filter((i) => !i.answeredAt).map((i) => i.personId));
  const todo = stillToConfirm(views);
  const selectedView = views.find((v) => v.person.id === selected);
  const generations = new Set(tree.people.map((p) => (p.relation.includes("grand") ? 0 : p.relation === "self" || p.relation === "sibling" ? 2 : 1))).size;

  const activity = [...tree.reports].sort((a, b) => b.reportedAt.localeCompare(a.reportedAt)).slice(0, 6);
  const nameOf = (id: string) => tree.people.find((p) => p.id === id)?.label ?? "Someone";

  return (
    <main className={styles.main}>
      <section className={styles.top}>
        <div>
          <p className="kicker">Your family health tree</p>
          <h1 className={styles.title}>{tree.patientName === "You" ? "Your family" : `${tree.patientName}’s family`}</h1>
          <div className={styles.meta}>
            <span className="chip">
              {c.relatives} relatives · {generations} generations
            </span>
            {tree.visit ? (
              <button className="chip chip-accent" onClick={() => setEditingVisit(true)} title="Edit visit">
                {tree.visit.specialty} visit · {formatDate(tree.visit.date)}
              </button>
            ) : (
              <button className="chip chip-accent" onClick={() => setEditingVisit(true)}>
                <Plus size={12} /> Add your upcoming visit
              </button>
            )}
            <span className="chip chip-known">{c.known} known</span>
            {c.conflicting ? <span className="chip chip-conflicting">{c.conflicting} conflicting</span> : null}
            <span className="chip chip-unknown">{c.unknown} unknown</span>
            {c.declined ? <span className="chip chip-declined">{c.declined} declined</span> : null}
          </div>
        </div>
        <div className={styles.topActions}>
          <Link href="/summary" className="btn btn-accent">
            Pre-visit summary <Arrow size={14} />
          </Link>
        </div>
      </section>

      {editingVisit ? <VisitEditor onDone={() => setEditingVisit(false)} /> : null}

      <div className={styles.grid}>
        <section className={`card ${styles.treeCard}`} aria-label="Tree">
          <div className={styles.treeHead}>
            <span className={styles.treeHint}>Tap a relative to add what you know or invite them.</span>
            <div className={styles.addRow}>
              <button className="btn btn-ghost btn-sm" onClick={() => setAdding("paternal-aunt-uncle")}>
                <Plus size={13} /> Father&rsquo;s sibling
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setAdding("maternal-aunt-uncle")}>
                <Plus size={13} /> Mother&rsquo;s sibling
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setAdding("sibling")}>
                <Plus size={13} /> Your sibling
              </button>
            </div>
          </div>
          {adding ? (
            <AddRelative
              relation={adding}
              onDone={(id) => {
                setAdding(null);
                if (id) setSelected(id);
              }}
            />
          ) : null}
          <TreeView views={views} selectedId={selected} onSelect={setSelected} pendingIds={pending} />
          <div className={styles.legend}>
            <Legend />
          </div>
        </section>

        <aside className={styles.side}>
          {selectedView ? (
            <PersonPanel
              key={selectedView.person.id}
              view={selectedView}
              tree={tree}
              focusOnOpen
              onClose={() => {
                const id = selectedView.person.id;
                setSelected(undefined);
                // Return keyboard focus to the relative the panel was opened from.
                requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-person-id="${id}"]`)?.focus());
              }}
            />
          ) : (
            <Overview
              views={views}
              todo={todo}
              onPick={setSelected}
              onStart={() => setStarting(true)}
              starting={starting}
              onCancelStart={() => setStarting(false)}
            />
          )}

          <section className={`card ${styles.activity}`} aria-label="Activity">
            <h2 className={styles.h2}>Activity</h2>
            {activity.length === 0 ? (
              <p className="muted">Nothing yet. Add what you know or invite a relative.</p>
            ) : (
              <ul>
                {activity.map((r) => (
                  <li key={r.id}>
                    <span className={`${styles.dot} ${r.source === "record" ? styles.dotRecord : ""}`} aria-hidden />
                    <span>
                      <b>{r.reportedBy}</b>{" "}
                      {r.kind === "declined"
                        ? "prefers not to share"
                        : r.kind === "dont-know"
                          ? `doesn’t know about ${nameOf(r.personId)}`
                          : r.kind === "no-history"
                            ? `${r.reportedById === r.personId ? "has" : `says ${nameOf(r.personId)} has`} no heart history`
                            : `${r.source === "record" ? "shared from MyChart" : r.reportedById === r.personId ? "added" : `says ${nameOf(r.personId)} had`}: ${r.condition}${r.ageAtOnset != null ? `, ${r.approximate ? "about " : ""}age ${r.ageAtOnset}` : ""}`}
                      <small>{timeAgo(r.reportedAt)}</small>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

function Overview({
  views,
  todo,
  onPick,
  onStart,
  starting,
  onCancelStart,
}: {
  views: PersonView[];
  todo: PersonView[];
  onPick: (id: string) => void;
  onStart: () => void;
  starting: boolean;
  onCancelStart: () => void;
}) {
  const [name, setName] = useState("");
  const tree = useTree();
  return (
    <section className={`card ${styles.overview}`}>
      <h2 className={styles.h2}>Start here</h2>
      <ol className={styles.steps}>
        <li>
          <b>Add what you know.</b> Tap a relative and tick anything that fits. Guesses are fine; mark them as rough.
        </li>
        <li>
          <b>Ask relatives directly.</b> Send a link. They answer for themselves on their phone, and can share a fact from MyChart.
        </li>
        <li>
          <b>Walk in prepared.</b> Review the one-page summary and bring it to your visit.
        </li>
      </ol>
      {todo.length ? (
        <div className={styles.todo}>
          <p className={styles.todoTitle}>Still to confirm</p>
          <div className={styles.todoList}>
            {todo.map((v) => (
              <button key={v.person.id} className={`chip chip-${v.status}`} onClick={() => onPick(v.person.id)}>
                {v.person.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className={styles.reset}>
        {tree.synthetic && tree.id === "demo" ? <span className="muted">You&rsquo;re viewing the demo family.</span> : null}
        {starting ? (
          <form
            className={styles.startForm}
            onSubmit={(e) => {
              e.preventDefault();
              if (!confirmReplace(tree)) return;
              actions.startBlank(name);
              onCancelStart();
            }}
          >
            <input
              className="input"
              placeholder="Your first name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              aria-label="Your first name"
            />
            <button className="btn btn-primary btn-sm" type="submit">
              Start
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={onCancelStart}>
              Cancel
            </button>
          </form>
        ) : (
          <div className={styles.resetButtons}>
            <button className="btn btn-secondary btn-sm" onClick={onStart}>
              Start my own tree
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => confirmReplace(tree) && actions.loadDemo()}>
              {tree.id === "demo" ? "Reset demo family" : "Load the demo family"}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => window.confirm("Delete everything this app stored in this browser? This can't be undone.") && actions.clearAll()}
            >
              Delete everything stored here
            </button>
          </div>
        )}
      </div>
      <span className="visually-hidden">{views.length} people in tree</span>
    </section>
  );
}

/** The tree lives only in this browser, so replacing it is permanent: ask first unless it is the demo. */
function confirmReplace(tree: FamilyTree) {
  if (tree.id === "demo") return true;
  const pending = tree.invites.filter((i) => !i.answeredAt).length;
  return window.confirm(
    `This replaces your tree in this browser (${tree.people.length} people, ${tree.reports.length} answers${pending ? `, ${pending} pending invites` : ""}). It can't be undone, and replies to earlier invites won't import. Continue?`,
  );
}

function AddRelative({ relation, onDone }: { relation: Relation; onDone: (id?: string) => void }) {
  const [label, setLabel] = useState("");
  const [sex, setSex] = useState<Person["sex"]>("unknown");
  const title =
    relation === "sibling"
      ? "Add your brother or sister"
      : relation === "paternal-aunt-uncle"
        ? "Add your father’s brother or sister"
        : "Add your mother’s brother or sister";
  return (
    <form
      className={styles.addForm}
      onSubmit={(e) => {
        e.preventDefault();
        if (!label.trim()) return;
        onDone(actions.addPerson(relation, label.trim(), sex));
      }}
    >
      <b>{title}</b>
      <input
        className="input"
        placeholder="What you call them, e.g. Aunt Priya"
        value={label}
        onChange={(e) => setLabel(e.target.value.slice(0, 40))}
        aria-label="Name"
        autoFocus
      />
      <select className="input" value={sex} onChange={(e) => setSex(e.target.value as Person["sex"])} aria-label="Sex">
        <option value="unknown">Sex (optional)</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
      </select>
      <div className={styles.addActions}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDone()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={!label.trim()}>
          Add
        </button>
      </div>
    </form>
  );
}

function VisitEditor({ onDone }: { onDone: () => void }) {
  const tree = useTree();
  const [specialty, setSpecialty] = useState(tree.visit?.specialty ?? "Cardiology");
  const [date, setDate] = useState(tree.visit?.date ?? "");
  return (
    <form
      className={`card ${styles.visit}`}
      onSubmit={(e) => {
        e.preventDefault();
        actions.setVisit({ specialty: specialty.trim() || "Cardiology", date, practice: tree.visit?.practice });
        onDone();
      }}
    >
      <label className="field">
        <span className="field-label">Visit</span>
        <input className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value.slice(0, 40))} />
      </label>
      <label className="field">
        <span className="field-label">Date</span>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <div className={styles.addActions}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-sm">
          Save
        </button>
      </div>
    </form>
  );
}

export function formatDate(iso: string) {
  if (!iso) return "date not set";
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
