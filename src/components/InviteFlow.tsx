"use client";

import { Info } from "lucide-react";
import { addTransitionType, startTransition, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { decodePayload, replyUrl, type InvitePayload, type ReplyPayload } from "@/lib/share";
import { useHash } from "@/lib/useHash";
import { clearPortalResult, peekPortalResult, SANDBOX_LABEL, startMyChartConnect, type PortalResult } from "@/lib/smart";
import { actions, deviceId, getTree, hasSavedTree } from "@/lib/store";
import AnswerForm, { type Answer } from "./AnswerForm";
import { CheckAnswers } from "./relative/CheckAnswers";
import { describeAnswer, type Draft } from "./relative/describe";
import { Frame } from "./relative/Frame";
import { OthersList } from "./relative/OthersList";
import { PortalOptionCard } from "./relative/PortalOptionCard";
import { ProgressHeader } from "./relative/ProgressHeader";
import { saveInviteReturn } from "./relative/returnPoint";
import { seedArrivalBaseline } from "./tree/useArrivals";
import { RecordPicker } from "./relative/RecordPicker";
import { SentScreen } from "./relative/SentScreen";
import { ActionHint, STEP_BACK, STEP_FORWARD, StepLayout, StepTitle, StepTransition } from "./relative/StepLayout";
import { Welcome } from "./relative/Welcome";
import { Button } from "./ui/Button";
import { CheckboxCard } from "./ui/CheckboxCard";

type Step = "welcome" | "self" | "portal" | "others" | "review" | "sent";

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

/** Progress labels for the four numbered steps (welcome and sent have no progress header). */
const PROGRESS: Partial<Record<Step, [number, string]>> = {
  self: [1, "About you"],
  portal: [2, "Pick what to share"],
  others: [3, "Others you know"],
  review: [4, "Check and send"],
};

export default function InviteFlow() {
  const hash = useHash();
  const payload = useMemo<InvitePayload | null | undefined>(() => {
    if (hash === null) return undefined;
    const p = decodePayload<InvitePayload>(hash);
    return p && p.v === 1 ? p : null;
  }, [hash]);

  if (payload === undefined) {
    return (
      <Frame>
        <p className="m-auto py-16 text-small text-fg-3 motion-safe:animate-[fade-up_560ms_var(--ease-out-expo)_400ms_both]">Opening your invite&hellip;</p>
      </Frame>
    );
  }
  if (payload === null) {
    return (
      <Frame>
        <div className="flex flex-col items-start gap-4 py-10">
          <span aria-hidden className="grid size-12 place-items-center rounded-full bg-mist text-fg-2">
            <Info className="size-6" strokeWidth={1.75} />
          </span>
          <StepTitle>This link doesn&rsquo;t look complete</StepTitle>
          <p className="text-fg-2">Ask the person who sent it to copy the whole link again, including everything after the #.</p>
          <Button variant="secondary" href="/" className="mt-2">
            What is Family Health Tree?
          </Button>
        </div>
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
  if (step === "portal" && !portal) step = "self"; // the fetched record is gone (e.g. "Answer myself instead" in another tab)
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
  /** Set by a "Change" on the check-answers screen: the edited step returns straight to review. */
  const [changing, setChanging] = useState<string | null>(null);

  // A layout effect, so the save lands in the same commit: passive effects can wait for a step's view transition to finish,
  // and a reload in that window would otherwise restore the previous step.
  useLayoutEffect(() => {
    const saved: Saved = { step, drafts, done, link: replyLink, sameBrowser };
    sessionStorage.setItem(keyFor(payload), JSON.stringify(saved));
  }, [payload, step, drafts, done, replyLink, sameBrowser]);

  // A new screen starts at the top with focus on its heading (or on the card a "Change" link opened). Layout effect, so it
  // happens before the view transition captures the new screen.
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const target = document.querySelector<HTMLElement>("[data-step-focus]") ?? document.querySelector<HTMLElement>("[data-step-heading]");
    window.scrollTo(0, 0);
    target?.focus({ preventScroll: true });
    if (target?.hasAttribute("data-step-focus")) target.scrollIntoView({ block: "center" });
  }, [step]);

  const me = payload.l;
  const asker = payload.n;
  const now = () => new Date().toISOString();
  const base = { reportedBy: me, reportedById: payload.p };
  const selfDrafts = drafts.filter((d) => d.personId === payload.p);
  const selfDeclined = selfDrafts.some((d) => d.kind === "declined");

  /** Every step change goes through here: a transition tagged with its direction, so the screens slide (§12.6). */
  const go = (next: Step, dir: typeof STEP_FORWARD | typeof STEP_BACK = STEP_FORWARD) => {
    startTransition(() => {
      addTransitionType(dir);
      setStep(next);
    });
  };
  /** After the self answers: others (if there's anyone to ask about), else review. A "Change" returns to review. */
  const afterSelf = (declined: boolean) => {
    if (changing) {
      setChanging(null);
      go("review");
    } else go(declined || payload.a.length === 0 ? "review" : "others");
  };

  const addSelf = (answers: Answer[]) => {
    const own: Draft[] = answers.map((a) => ({ ...a, ...base, personId: payload.p, source: "self", reportedAt: now() }));
    setDrafts((d) => [...d.filter((x) => !(x.personId === payload.p && x.source === "self")), ...own]);
    afterSelf(answers[0]?.kind === "declined");
  };

  const addAbout = (personId: string, answers: Answer[]) => {
    const about: Draft[] = answers.map((a) => ({ ...a, ...base, personId, source: "relative", reportedAt: now() }));
    setDrafts((d) => [...d.filter((x) => !(x.personId === personId && x.source === "relative")), ...about]);
    setDone((d) => [...new Set([...d, personId])]);
    if (changing === personId) {
      setChanging(null);
      go("review");
    }
  };

  const connect = async () => {
    setConnecting(true);
    setConnectError(null);
    try {
      // Our own return point for /connect/callback's Go back and its fallback (src/lib's key is consumed on success).
      saveInviteReturn(window.location.href, keyFor(payload));
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
    if (same) seedArrivalBaseline(getTree()); // "Open Alex's tree" in this tab then plays the arrival (DESIGN §11.3)
    const imported = same ? actions.importReply(reply) : null;
    setSameBrowser(!!imported && !imported.error);
    setReplyLink(replyUrl(window.location.origin, reply));
    go("sent");
  };

  const back = () => {
    if (step === "portal") {
      clearPortalResult();
      setPortal(null);
    }
    if (changing) {
      setChanging(null);
      go("review", STEP_BACK);
      return;
    }
    if (step === "self") go("welcome", STEP_BACK);
    else if (step === "portal" || step === "others") go("self", STEP_BACK);
    else if (step === "review") go(!adult ? "welcome" : payload.a.length && !selfDeclined ? "others" : "self", STEP_BACK);
  };

  const progress = PROGRESS[step];

  let screen: ReactNode = null;
  if (step === "welcome") {
    screen = (
      <Welcome
        me={me}
        asker={asker}
        visit={payload.s}
        others={payload.a.length}
        adult={adult}
        onAdult={setAdult}
        onStart={() => go("self")}
        onDecline={() => {
          setDrafts([{ ...base, kind: "declined", personId: payload.p, source: "self", reportedAt: now() }]);
          go("review");
        }}
      />
    );
  } else if (step === "self") {
    screen = (
      <StepLayout title="About you" lead={<>Share one fact from your patient portal, or answer a few questions yourself. Skip anything you don&rsquo;t know.</>}>
        {selfDrafts.length ? (
          <div className="flex flex-col gap-3 rounded-lg border border-brand/30 bg-evergreen-50/60 p-4">
            <p className="text-small text-fg-2">
              <span className="font-strong text-fg">Your answer so far:</span> {selfDrafts.map(describeAnswer).join(" · ")}
              {selfDrafts.some((d) => d.source === "record") ? " (from your portal record)" : ""}
            </p>
            <Button variant="secondary" fullWidth onClick={() => afterSelf(selfDeclined)}>
              Keep it and continue
            </Button>
          </div>
        ) : null}
        <PortalOptionCard
          asker={asker}
          connecting={connecting}
          error={connectError}
          onConnect={connect}
          onSimulate={() => {
            setPortal(simulatedRecord());
            go("portal");
          }}
        />
        <section aria-labelledby="answer-yourself" className="flex flex-col gap-4 border-t border-line pt-6">
          <h2 id="answer-yourself" className="text-title font-strong text-fg">
            Or answer yourself
          </h2>
          <AnswerForm variant="page" stickyActions subject="you" self allowDecline submitLabel="Next" onSubmit={addSelf} />
        </section>
      </StepLayout>
    );
  } else if (step === "portal" && portal) {
    screen = (
      <RecordPicker
        portal={portal}
        asker={asker}
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
          if (changing) {
            setChanging(null);
            go("review");
          } else go(payload.a.length ? "others" : "review");
        }}
        onCancel={() => {
          clearPortalResult();
          setPortal(null);
          go("self", STEP_BACK);
        }}
      />
    );
  } else if (step === "others") {
    screen = (
      <StepLayout
        title={<>{asker}&rsquo;s tree has a few people you might know better.</>}
        lead="Optional. Add what you remember, even roughly."
        actions={
          <Button
            size="lg"
            fullWidth
            onClick={() => {
              setChanging(null);
              go("review");
            }}
          >
            Review and send
          </Button>
        }
      >
        <OthersList people={payload.a} done={done} drafts={drafts} onAnswer={addAbout} initialOpen={changing} formVariant="page" />
      </StepLayout>
    );
  } else if (step === "review") {
    const declinedOnly = drafts.length > 0 && drafts.every((d) => d.kind === "declined");
    const canSend = drafts.length > 0 && confirmShare;
    screen = (
      <StepLayout
        title={<>Here&rsquo;s what {asker} will see</>}
        actions={
          <>
            <Button variant="brand" size="lg" fullWidth onClick={send} disabled={!canSend} aria-describedby={canSend ? undefined : "send-hint"}>
              Send to {asker}
            </Button>
            {canSend ? null : (
              <ActionHint id="send-hint">{drafts.length ? `Tick “Share these answers with ${asker}.” to send.` : "Nothing to send yet."}</ActionHint>
            )}
          </>
        }
      >
        {declinedOnly ? (
          <p className="rounded-md bg-declined-bg px-4 py-3 text-ui text-declined-ink">
            Got it. {asker} will see that you&rsquo;d rather not share. Nothing else is sent.
          </p>
        ) : null}
        {drafts.length === 0 ? <p className="text-fg-2">Nothing to send yet.</p> : null}
        <CheckAnswers
          selfId={payload.p}
          me={me}
          people={payload.a}
          drafts={drafts}
          onChange={(id) => {
            setChanging(id);
            go(id === payload.p ? (adult ? "self" : "welcome") : "others", STEP_BACK);
          }}
        />
        {drafts.length ? (
          <CheckboxCard size="lg" checked={confirmShare} onChange={setConfirmShare} title={`Share these answers with ${asker}.`} />
        ) : null}
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          className="-mt-2"
          onClick={() => {
            setDrafts([]);
            setDone([]);
            setConfirmShare(false);
            setChanging(null);
            go("welcome", STEP_BACK);
          }}
        >
          Start over
        </Button>
      </StepLayout>
    );
  } else if (step === "sent") {
    screen = <SentScreen asker={asker} me={me} link={replyLink} sameBrowser={sameBrowser} treeHref={`/tree?person=${encodeURIComponent(payload.p)}`} />;
  }

  return (
    <Frame asker={asker} progress={progress ? <ProgressHeader index={progress[0]} label={progress[1]} onBack={back} /> : null}>
      <StepTransition step={step}>{screen}</StepTransition>
    </Frame>
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
