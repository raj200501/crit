"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { decodePayload, replyUrl, type InvitePayload, type ReplyPayload } from "@/lib/share";
import { useHash } from "@/lib/useHash";
import { clearPortalResult, peekPortalResult, SANDBOX_LABEL, startMyChartConnect, type PortalResult } from "@/lib/smart";
import { actions, deviceId, getTree, hasSavedTree } from "@/lib/store";
import type { Report } from "@/lib/types";
import AnswerForm, { type Answer } from "./AnswerForm";
import { Check, Heart, Lock, Logo } from "./icons";
import styles from "./InviteFlow.module.css";

type Step = "welcome" | "self" | "portal" | "others" | "review" | "sent";
type Draft = Omit<Report, "id">;

interface Saved {
  step: Step;
  drafts: Draft[];
  done: string[];
  /** The reply link, kept so a reload of the thank-you step can still send it. */
  link?: string;
  /** Whether the answers were written straight into the patient's tree in this browser. */
  sameBrowser?: boolean;
}

const keyFor = (p: InvitePayload) => `fht:invite:${p.t}:${p.p}`;

export default function InviteFlow() {
  const hash = useHash();
  const payload = useMemo<InvitePayload | null | undefined>(() => {
    if (hash === null) return undefined;
    const p = decodePayload<InvitePayload>(hash);
    return p && p.v === 1 ? p : null;
  }, [hash]);

  if (payload === undefined) return <Frame />;
  if (payload === null) {
    return (
      <Frame>
        <h1 className={styles.h1}>This link doesn&rsquo;t look complete</h1>
        <p className={styles.lead}>Ask the person who sent it to copy the whole link again, including everything after the #.</p>
        <Link className="btn btn-secondary" href="/">
          What is Family Health Tree?
        </Link>
      </Frame>
    );
  }
  return <InviteSession key={`${payload.t}:${payload.p}`} payload={payload} />;
}

/** Progress survives the round trip to the MyChart sandbox via sessionStorage. */
function restore(payload: InvitePayload): Required<Saved> & { portal: PortalResult | null } {
  let saved: Saved | null = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(keyFor(payload)) || "null") as Saved | null;
  } catch {
    saved = null;
  }
  const portal = peekPortalResult(keyFor(payload));
  const link = saved?.link ?? "";
  let step: Step = portal ? "portal" : (saved?.step ?? "welcome");
  if (step === "sent" && !link) step = "review"; // never show the thank-you step without a link to send
  return { step, drafts: saved?.drafts ?? [], done: saved?.done ?? [], link, sameBrowser: !!saved?.sameBrowser, portal };
}

function InviteSession({ payload }: { payload: InvitePayload }) {
  const [init] = useState(() => restore(payload));
  const [step, setStep] = useState<Step>(init.step);
  const [drafts, setDrafts] = useState<Draft[]>(init.drafts);
  const [done, setDone] = useState<string[]>(init.done);
  const [portal, setPortal] = useState<PortalResult | null>(init.portal);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [replyLink, setReplyLink] = useState(init.link);
  const [adult, setAdult] = useState(init.step !== "welcome");
  const [confirmShare, setConfirmShare] = useState(false);
  const [sameBrowser, setSameBrowser] = useState(init.sameBrowser);

  useEffect(() => {
    const saved: Saved = { step, drafts, done, link: replyLink, sameBrowser };
    sessionStorage.setItem(keyFor(payload), JSON.stringify(saved));
  }, [payload, step, drafts, done, replyLink, sameBrowser]);

  const me = payload.l;
  const asker = payload.n;
  const now = () => new Date().toISOString();
  const base = { reportedBy: me, reportedById: payload.p };

  const addSelf = (answers: Answer[]) => {
    const own: Draft[] = answers.map((a) => ({ ...a, ...base, personId: payload.p, source: "self", reportedAt: now() }));
    setDrafts((d) => [...d.filter((x) => !(x.personId === payload.p && x.source === "self")), ...own]);
    setStep(answers[0]?.kind === "declined" || payload.a.length === 0 ? "review" : "others");
  };

  const addAbout = (personId: string, answers: Answer[]) => {
    const about: Draft[] = answers.map((a) => ({ ...a, ...base, personId, source: "relative", reportedAt: now() }));
    setDrafts((d) => [...d.filter((x) => !(x.personId === personId && x.source === "relative")), ...about]);
    setDone((d) => [...new Set([...d, personId])]);
  };

  const connect = async () => {
    setConnecting(true);
    setConnectError(null);
    try {
      await startMyChartConnect(window.location.href, keyFor(payload));
    } catch (e) {
      setConnecting(false);
      setConnectError(e instanceof Error ? e.message : "Could not reach the sandbox.");
    }
  };

  const send = () => {
    const at = now();
    const reply: ReplyPayload = { v: 1, t: payload.t, p: payload.p, b: me, at, reports: drafts.map((d) => ({ ...d, reportedAt: at })) };
    // Only when this is the patient's own browser (the demo) do the answers go straight into their tree.
    const same = !!payload.d && payload.d === deviceId() && hasSavedTree() && getTree().id === payload.t;
    const imported = same ? actions.importReply(reply) : null;
    setSameBrowser(!!imported && !imported.error);
    setReplyLink(replyUrl(window.location.origin, reply));
    setStep("sent");
  };

  return (
    <Frame asker={asker}>
      {step === "welcome" ? (
        <section className={styles.stack}>
          <p className="kicker">For {me}</p>
          <h1 className={styles.h1}>
            {asker} is getting ready for a {payload.s ?? "doctor’s visit"} and asked about the family&rsquo;s heart health.
          </h1>
          <p className={styles.lead}>
            A few questions about you{payload.a.length ? ` and ${payload.a.length === 1 ? "one other relative" : "a few relatives"} you might know about` : ""}.
            About 2 minutes. Skip anything you don&rsquo;t know.
          </p>
          <ul className={styles.promises}>
            <li>
              <Lock size={14} /> Your answers go to {asker}, who may share a summary with their cardiology team. Nothing is stored on our servers.
            </li>
            <li>
              <Check size={14} /> You choose what to share, and &ldquo;I&rsquo;d rather not&rdquo; is always an option.
            </li>
            <li>
              <Heart size={14} /> This helps the doctor ask better questions. It doesn&rsquo;t diagnose anyone.
            </li>
          </ul>
          <label className={styles.confirm}>
            <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
            <span>I&rsquo;m 18 or older.</span>
          </label>
          <button className="btn btn-primary btn-block" onClick={() => setStep("self")} disabled={!adult}>
            Start
          </button>
          <button
            className="btn btn-ghost btn-block"
            onClick={() => {
              setDrafts([{ ...base, kind: "declined", personId: payload.p, source: "self", reportedAt: now() }]);
              setStep("review");
            }}
          >
            I&rsquo;d rather not share
          </button>
        </section>
      ) : null}

      {step === "self" ? (
        <section className={styles.stack}>
          <p className="kicker">About you</p>
          <div className={styles.portalCard}>
            <div>
              <b>Faster: share from MyChart</b>
              <p>Sign in to your patient portal and pick the one fact to share. Your full chart stays private.</p>
              <small>Demo uses the public SMART on FHIR sandbox with a made-up patient.</small>
            </div>
            <button className="btn btn-accent" onClick={connect} disabled={connecting}>
              {connecting ? "Opening…" : "Connect MyChart"}
            </button>
            {connectError ? (
              <>
                <p className={styles.error}>{connectError}</p>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setPortal(simulatedRecord());
                    setStep("portal");
                  }}
                >
                  Use a simulated record (sandbox offline)
                </button>
              </>
            ) : null}
          </div>
          <p className={styles.or}>or answer yourself</p>
          <AnswerForm subject="you" self allowDecline submitLabel="Next" onSubmit={addSelf} />
        </section>
      ) : null}

      {step === "portal" && portal ? (
        <PortalPicker
          portal={portal}
          onShare={(picked) => {
            const recs: Draft[] = picked.map((c) => ({
              ...base,
              personId: payload.p,
              kind: "condition",
              condition: c.display,
              ageAtOnset: c.ageAtOnset,
              source: "record",
              reportedAt: now(),
              record: {
                system: portal.simulated ? "Simulated portal record" : SANDBOX_LABEL,
                reference: `Condition/${c.id}`,
                code: c.code,
                recordedDate: c.recordedDate?.slice(0, 10),
                retrievedAt: now(),
              },
            }));
            setDrafts((d) => [...d.filter((x) => !(x.personId === payload.p && (x.source === "self" || x.source === "record"))), ...recs]);
            clearPortalResult();
            setPortal(null);
            setStep(payload.a.length ? "others" : "review");
          }}
          onCancel={() => {
            clearPortalResult();
            setPortal(null);
            setStep("self");
          }}
        />
      ) : null}

      {step === "others" ? (
        <section className={styles.stack}>
          <p className="kicker">Anyone else you know about?</p>
          <h1 className={styles.h2}>{asker}&rsquo;s tree has a few people you might know better.</h1>
          <p className={styles.lead}>Optional. Add what you remember, even roughly.</p>
          <div className={styles.people}>
            {payload.a.map((o) => (
              <OtherPerson
                key={o.id}
                label={o.l}
                answered={done.includes(o.id)}
                summary={drafts.filter((d) => d.personId === o.id && d.source === "relative")}
                onAnswer={(a) => addAbout(o.id, a)}
              />
            ))}
          </div>
          <button className="btn btn-primary btn-block" onClick={() => setStep("review")}>
            Review and send
          </button>
        </section>
      ) : null}

      {step === "review" ? (
        <section className={styles.stack}>
          <p className="kicker">Review</p>
          <h1 className={styles.h2}>Here&rsquo;s what {asker} will see</h1>
          <ul className={styles.review}>
            {drafts.length === 0 ? <li className="muted">Nothing to send yet.</li> : null}
            {drafts.map((d, i) => (
              <li key={i}>
                <span className={styles.who}>{d.personId === payload.p ? "You" : (payload.a.find((a) => a.id === d.personId)?.l ?? "Relative")}</span>
                <span>
                  {describe(d)}
                  {d.source === "record" ? (
                    <span className="chip chip-record" style={{ marginLeft: 8 }}>
                      <Check size={11} /> from record
                    </span>
                  ) : null}
                  {d.note && d.kind !== "declined" ? <q className={styles.reviewNote}>{d.note}</q> : null}
                </span>
              </li>
            ))}
          </ul>
          {drafts.length ? (
            <label className={styles.confirm}>
              <input type="checkbox" checked={confirmShare} onChange={(e) => setConfirmShare(e.target.checked)} />
              <span>Share these answers with {asker}.</span>
            </label>
          ) : null}
          <button className="btn btn-primary btn-block" onClick={send} disabled={drafts.length === 0 || !confirmShare}>
            Send to {asker}
          </button>
          <button
            className="btn btn-ghost btn-block"
            onClick={() => {
              setDrafts([]);
              setDone([]);
              setStep("welcome");
            }}
          >
            Start over
          </button>
        </section>
      ) : null}

      {step === "sent" ? <Sent asker={asker} link={replyLink} sameBrowser={sameBrowser} /> : null}
    </Frame>
  );
}

function describe(d: Draft) {
  if (d.kind === "declined") return "Prefers not to share";
  if (d.kind === "dont-know") return "Doesn’t know";
  if (d.kind === "no-history") return "No heart history";
  return `${d.condition}${d.ageAtOnset != null ? `, ${d.approximate ? "about " : ""}age ${d.ageAtOnset}` : ""}`;
}

function PortalPicker({ portal, onShare, onCancel }: { portal: PortalResult; onShare: (c: PortalResult["conditions"]) => void; onCancel: () => void }) {
  const heart = portal.conditions.filter((c) => c.cardiac);
  const rest = portal.conditions.filter((c) => !c.cardiac);
  const [picked, setPicked] = useState<Set<string>>(() => new Set(heart.map((c) => c.id)));
  const [showRest, setShowRest] = useState(false);
  const [ages, setAges] = useState<Record<string, string>>(() =>
    Object.fromEntries(portal.conditions.map((c) => [c.id, c.ageAtOnset != null ? String(c.ageAtOnset) : ""])),
  );
  const toggle = (id: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const row = (c: PortalResult["conditions"][number]) => (
    <div key={c.id} className={`${styles.portalRow} ${picked.has(c.id) ? styles.portalOn : ""}`}>
      <label className={styles.portalMain}>
        <input type="checkbox" checked={picked.has(c.id)} onChange={() => toggle(c.id)} />
        <span>
          <b>{c.display}</b>
          <small>
            {c.onset ? `On the problem list since ${c.onset.slice(0, 4)}` : "No date in the record"}
            {c.ageAtOnset != null ? ` (age ${c.ageAtOnset})` : ""}
          </small>
        </span>
        {c.cardiac ? <span className="chip chip-accent">heart</span> : null}
      </label>
      {picked.has(c.id) ? (
        <label className={styles.portalAge}>
          How old were you when it started?
          <input
            className="input"
            inputMode="numeric"
            value={ages[c.id] ?? ""}
            onChange={(e) => setAges((a) => ({ ...a, [c.id]: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
            aria-label={`Age when ${c.display} started`}
          />
        </label>
      ) : null}
    </div>
  );
  return (
    <section className={styles.stack}>
      <p className="kicker">From your record</p>
      <h1 className={styles.h2}>Pick what to share</h1>
      <p className={styles.lead}>
        {portal.simulated ? (
          <>
            <b>Simulated record</b> (the sandbox is offline, so this is made-up data).
          </>
        ) : (
          <>
            Connected to {SANDBOX_LABEL} as <b>{portal.patientName}</b> (a made-up sandbox patient).
          </>
        )}{" "}
        Only what you tick is shared. Nothing else from the chart leaves this page.
      </p>
      <div className={styles.portalList}>
        {heart.length ? (
          heart.map(row)
        ) : (
          <p className="muted">No heart-related conditions on this problem list. That doesn&rsquo;t mean none happened; you can answer yourself instead.</p>
        )}
      </div>
      {rest.length ? (
        <button className="btn btn-ghost btn-sm" onClick={() => setShowRest((s) => !s)}>
          {showRest ? "Hide" : "Show"} {rest.length} other conditions in the record
        </button>
      ) : null}
      {showRest ? <div className={styles.portalList}>{rest.map(row)}</div> : null}
      <p className={styles.hintSmall}>
        A record date is often when a problem was added to the list, not when it was diagnosed. Fix the age if you know better.
      </p>
      <button
        className="btn btn-primary btn-block"
        disabled={picked.size === 0}
        onClick={() =>
          onShare(
            portal.conditions
              .filter((c) => picked.has(c.id))
              .map((c) => {
                const n = Number.parseInt(ages[c.id] ?? "", 10);
                return { ...c, ageAtOnset: Number.isFinite(n) && n >= 0 && n < 130 ? n : undefined };
              }),
          )
        }
      >
        Share {picked.size} {picked.size === 1 ? "fact" : "facts"}
      </button>
      <button className="btn btn-ghost btn-block" onClick={onCancel}>
        Answer myself instead
      </button>
    </section>
  );
}

function OtherPerson({ label, answered, summary, onAnswer }: { label: string; answered: boolean; summary: Draft[]; onAnswer: (a: Answer[]) => void }) {
  const [open, setOpen] = useState(false);
  const first = label.split(" (")[0];
  return (
    <div className={`${styles.person} ${answered ? styles.personDone : ""}`}>
      <div className={styles.personHead}>
        <div>
          <b>{label}</b>
          {answered ? <small>{summary.map(describe).join(" · ")}</small> : null}
        </div>
        {!open ? (
          <div className={styles.personActions}>
            <button className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>
              {answered ? "Change" : "Add what I know"}
            </button>
            {!answered ? (
              <button className="btn btn-ghost btn-sm" onClick={() => onAnswer([{ kind: "dont-know" }])}>
                Don&rsquo;t know
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {open ? (
        <AnswerForm
          subject={first}
          compact
          submitLabel="Save"
          onSubmit={(a) => {
            onAnswer(a);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function Sent({ asker, link, sameBrowser }: { asker: string; link: string; sameBrowser: boolean }) {
  const [copied, setCopied] = useState(false);
  const message = useMemo(() => `Done! Here are my answers for your family health tree: ${link}`, [link]);
  return (
    <section className={styles.stack}>
      <div className={styles.doneIcon}>
        <Check size={28} />
      </div>
      <h1 className={styles.h1}>Thank you</h1>
      {sameBrowser ? (
        <>
          <p className={styles.lead}>Your answers are in {asker}&rsquo;s tree (demo: same browser).</p>
          <Link className="btn btn-primary btn-block" href="/tree">
            Open {asker}&rsquo;s tree
          </Link>
        </>
      ) : (
        <p className={styles.lead}>
          Send this link back to {asker}. Opening it adds your answers to their tree. The answers are inside the link itself; nothing is stored on a server.
        </p>
      )}
      <div className={styles.replyBox}>
        <button
          className="btn btn-secondary btn-block"
          onClick={async () => {
            if (navigator.share) {
              try {
                await navigator.share({ text: message });
                return;
              } catch {
                /* fall back to copy */
              }
            }
            await navigator.clipboard?.writeText(message);
            setCopied(true);
          }}
        >
          {copied ? "Copied" : `Send my answers to ${asker}`}
        </button>
      </div>
      <p className={styles.small}>Family Health Tree · a student prototype by Team 709</p>
    </section>
  );
}

function Frame({ children, asker }: { children?: React.ReactNode; asker?: string }) {
  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <Link href="/" className={styles.brand}>
          <Logo size={20} /> Family Health Tree
        </Link>
        {asker ? <span className={styles.for}>for {asker}</span> : null}
      </header>
      <div className={styles.banner}>Prototype with made-up data. Please don&rsquo;t enter real health information.</div>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

/** Demo-day fallback when the public sandbox is unreachable: a clearly labeled, made-up record. */
function simulatedRecord(): PortalResult {
  return {
    patientName: "Simulated patient",
    simulated: true,
    conditions: [
      {
        id: "simulated-afib",
        display: "Atrial fibrillation",
        code: { system: "http://snomed.info/sct", code: "49436004", display: "Atrial fibrillation" },
        onset: "2009-04-02",
        ageAtOnset: 34,
        cardiac: true,
        recordedDate: "2009-04-02",
      },
      { id: "simulated-htn", display: "Essential hypertension", onset: "2015-06-10", ageAtOnset: 40, cardiac: false, recordedDate: "2015-06-10" },
    ],
  };
}
