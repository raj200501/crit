"use client";

import { Check, Hand, ShieldCheck, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { HONESTY } from "@/content/site";

// Five static screens of the relative's flow (DESIGN §12.6, with AMENDMENTS A2), rebuilt from P1 primitives with the
// demo's names. Display only: the controls are drawn, not focusable, so the real flow is one link away.
const ASKER = "Alex";
const INVITEE = "Grandpa Luis";

const SCREENS = [
  { value: "welcome", label: "Welcome" },
  { value: "choose", label: "Choose" },
  { value: "pick", label: "Pick" },
  { value: "check", label: "Check" },
  { value: "sent", label: "Sent" },
] as const;
type ScreenId = (typeof SCREENS)[number]["value"];

const DESCRIPTIONS: Record<ScreenId, string> = {
  welcome: "Grandpa Luis's phone, screen 1 of 5: Alex asked for your help.",
  choose: "Grandpa Luis's phone, screen 2 of 5: share one fact from your patient portal, or answer yourself.",
  pick: "Grandpa Luis's phone, screen 3 of 5: pick what to share from the record. Nothing is ticked.",
  check: "Grandpa Luis's phone, screen 4 of 5: check your answers before sending.",
  sent: "Grandpa Luis's phone, screen 5 of 5: sent.",
};

/** A drawn checkbox (not an input). */
function Box({ on }: { on?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[5px] border-[1.5px]",
        on ? "border-brand bg-brand text-white" : "border-input bg-surface",
      )}
    >
      {on ? <Check className="size-3.5" strokeWidth={3} /> : null}
    </span>
  );
}

function Shell({ step, label, children, cta }: { step?: number; label?: string; children: ReactNode; cta?: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-white text-ink">
      {/* status bar under the notch */}
      <div aria-hidden className="flex h-10 shrink-0 items-end justify-between px-6 pb-1 font-mono text-eyebrow font-medium text-ink">
        <span>9:41</span>
        <span className="flex items-end gap-0.5">
          <span className="h-1.5 w-[3px] rounded-[1px] bg-ink" />
          <span className="h-2 w-[3px] rounded-[1px] bg-ink" />
          <span className="h-2.5 w-[3px] rounded-[1px] bg-ink" />
        </span>
      </div>
      <p className="flex shrink-0 items-center gap-1.5 bg-mist px-4 py-1 text-caption text-ink-2">
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-evergreen-600" />
        {HONESTY.heroPillShort}
      </p>
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-4">
        <LogoMark size={22} tone="paper" />
        <span className="text-caption text-ink-3">for {ASKER}</span>
      </div>
      {step ? (
        <div className="shrink-0 px-4 pt-3">
          <div aria-hidden className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-evergreen-600" : "bg-mist-2")} />
            ))}
          </div>
          <p className="mt-2 font-mono text-eyebrow text-ink-3 uppercase">
            Step {step} of 4 · {label}
          </p>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">{children}</div>
      {cta ? <div className="shrink-0 border-t border-line bg-white px-4 pt-3 pb-5">{cta}</div> : null}
    </div>
  );
}

function Welcome() {
  return (
    <Shell
      cta={
        // The same order as the real bar: the 18+ tick (ticked, so Start is enabled as the app would show it), then Start.
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2.5 rounded-md border border-brand bg-evergreen-50 px-3 py-2 text-small font-strong">
            <Box on /> I&rsquo;m 18 or older.
          </span>
          <span className={buttonClasses({ size: "md", fullWidth: true })}>Start</span>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <span aria-hidden className="relative grid size-11 place-items-center">
          <span className="absolute size-8 rotate-45 rounded-[6px] bg-evergreen-600" />
          <span className="relative font-display text-lead text-white">A</span>
        </span>
        <p className="font-mono text-eyebrow text-ink-3 uppercase">For {INVITEE}</p>
        <p className="font-display text-[1.625rem] leading-[1.1] font-book tracking-[-0.015em]">{ASKER} asked for your help.</p>
        <p className="text-small text-ink-2">
          {ASKER} is getting ready for a cardiology visit and is asking about the family&rsquo;s heart health. A few questions about you and a few relatives.
          Skip anything.
        </p>
        <ul className="flex flex-col gap-2 text-caption text-ink-2">
          {[
            [Users, `Who sees it: ${ASKER}, and ${ASKER}'s cardiology team if ${ASKER} shares the summary.`],
            [Hand, "You choose. “I'd rather not share” is always an option."],
            [ShieldCheck, "This doesn't diagnose anyone. No account. No app."],
          ].map(([Icon, text]) => {
            const I = Icon as typeof Users;
            return (
              <li key={text as string} className="flex gap-2">
                <I aria-hidden className="mt-px size-4 shrink-0 text-evergreen-600" />
                <span>{text as string}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Shell>
  );
}

function Choose() {
  return (
    <Shell step={1} label="About you">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 rounded-md border border-evergreen-600/40 bg-evergreen-50/60 p-3">
          <span className="flex gap-1.5">
            <Badge tone="brand" mono>
              From your own record
            </Badge>
            <Badge mono>Demo sandbox</Badge>
          </span>
          <p className="text-small font-strong">Share one fact from your patient portal</p>
          <p className="text-caption text-ink-2">
            You&rsquo;ll sign in on your health system&rsquo;s own page, not ours. Check the address bar. We briefly see your problem list so you can choose;
            everything else is discarded on this page.
          </p>
          <span className={buttonClasses({ size: "sm", fullWidth: true, className: "h-10" })}>Connect MyChart</span>
          <span className="self-center text-caption font-medium text-evergreen-700 underline underline-offset-2">Use a simulated record (sandbox offline)</span>
        </div>
        <p className="text-small font-strong">Or answer yourself</p>
        <ul aria-label="Example answers" className="flex flex-wrap gap-1.5">
          {["Heart attack", "AFib", "Stent", "Not sure", "I'd rather not share"].map((c) => (
            <li key={c} className="rounded-full border border-line-strong px-2.5 py-1 text-caption">
              {c}
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}

function Pick() {
  return (
    <Shell
      step={2}
      label="Pick what to share"
      cta={
        <div className="flex flex-col gap-1.5">
          <span className={buttonClasses({ size: "md", fullWidth: true, className: "opacity-50" })}>Share 0 facts with {ASKER}</span>
          <span className="text-center text-caption text-ink-3">Tick what you want to share.</span>
        </div>
      }
    >
      <div className="flex flex-col gap-2.5">
        <p className="text-caption text-ink-2">
          <span className="font-strong text-ink">Simulated record</span> (the sandbox is offline, so this is made-up data).
        </p>
        <p className="font-mono text-eyebrow text-ink-3 uppercase">Suggested: heart-related</p>
        <span className="flex gap-2.5 rounded-md border border-line-strong p-3">
          <Box />
          <span className="flex flex-col gap-0.5">
            <span className="text-small font-strong">Atrial fibrillation</span>
            <span className="font-mono text-eyebrow text-ink-3 uppercase">On your problem list since 2009</span>
          </span>
        </span>
        <span className="text-caption font-medium text-evergreen-700">Show 1 other condition in the record</span>
        <p className="text-caption text-ink-3">A record date is often when a problem was added to the list, not when it was diagnosed.</p>
      </div>
    </Shell>
  );
}

function CheckAnswers() {
  return (
    <Shell step={4} label="Check and send" cta={<span className={buttonClasses({ variant: "brand", size: "md", fullWidth: true })}>Send to {ASKER}</span>}>
      <div className="flex flex-col gap-3">
        <p className="font-display text-[1.5rem] leading-[1.1] font-book tracking-[-0.015em]">Here&rsquo;s what {ASKER} will see</p>
        <div className="rounded-md border border-line-strong">
          <p className="border-b border-line px-3 py-2 text-small font-strong">{INVITEE} (you)</p>
          <div className="flex items-start justify-between gap-2 px-3 py-2.5">
            <span className="flex flex-col gap-0.5">
              <span className="text-small">Atrial fibrillation, age 34</span>
              <span className="font-mono text-eyebrow text-record uppercase">From your portal record</span>
            </span>
            <span className="text-caption font-medium text-evergreen-700 underline underline-offset-2">Change</span>
          </div>
        </div>
        <span className="flex items-start gap-2.5 rounded-md border border-evergreen-600 bg-evergreen-50 p-3 text-small font-strong">
          <Box on /> Share these answers with {ASKER}.
        </span>
      </div>
    </Shell>
  );
}

function Sent() {
  return (
    <Shell>
      <div className="flex h-full flex-col items-start gap-4 pt-6">
        <span aria-hidden className="grid size-14 place-items-center rounded-full bg-evergreen-600 text-white shadow-[0_10px_30px_-8px_rgb(14_107_87/0.6)]">
          <svg viewBox="0 0 24 24" className="size-7" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              pathLength={1}
              stroke="currentColor"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="[stroke-dasharray:1] motion-safe:animate-[draw_600ms_var(--ease-out-expo)_200ms_both]"
            />
          </svg>
        </span>
        <p className="font-display text-[1.625rem] leading-[1.1] font-book tracking-[-0.015em]">Sent. Thank you, {INVITEE}.</p>
        <div className="flex flex-col gap-2">
          <p className="font-mono text-eyebrow text-ink-3 uppercase">What happens next</p>
          <ul className="flex flex-col gap-2 text-small text-ink-2">
            <li>{ASKER} sees your answers in their tree.</li>
            <li>If {ASKER} shares a summary with their cardiologist, your answers are on it with your name.</li>
            <li>Want something removed? Tell {ASKER}.</li>
          </ul>
        </div>
        <span className={buttonClasses({ variant: "secondary", size: "md", fullWidth: true, className: "mt-auto mb-5" })}>Send my answers to {ASKER}</span>
      </div>
    </Shell>
  );
}

const RENDER: Record<ScreenId, () => ReactNode> = { welcome: Welcome, choose: Choose, pick: Pick, check: CheckAnswers, sent: Sent };

/** §8.7 The relative's phone: five screens, switched by thumbnails with a 220 ms crossfade. No autoplay. */
export function PhoneScreens() {
  const [screen, setScreen] = useState<ScreenId>("welcome");
  return (
    <div className="flex flex-col items-center gap-6">
      <PhoneFrame label={DESCRIPTIONS[screen]} className="w-[min(100%,320px)]">
        {SCREENS.map((s) => {
          const Screen = RENDER[s.value];
          const active = s.value === screen;
          return (
            <div
              key={s.value}
              aria-hidden={!active || undefined}
              className={cn(
                "absolute inset-0 transition-[opacity,visibility] duration-(--dur-ui) ease-out-quart",
                active ? "visible opacity-100" : "invisible opacity-0",
              )}
            >
              <Screen />
            </div>
          );
        })}
      </PhoneFrame>
      <SegmentedControl
        label="Relative's screens"
        options={SCREENS}
        value={screen}
        onChange={setScreen}
        className="max-w-full overflow-x-auto [scrollbar-width:none] [&>button]:px-3"
      />
    </div>
  );
}
