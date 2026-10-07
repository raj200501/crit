"use client";

import { m, useReducedMotion } from "motion/react";
import { Check, ChevronDown, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { completeMyChartConnect, stashPortalResult } from "@/lib/smart";
import { Lockup } from "./brand/Lockup";
import { readInviteReturn } from "./relative/returnPoint";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { cn } from "./ui/cn";
import { Eyebrow } from "./ui/Eyebrow";
import { HonestyRibbon } from "./ui/HonestyRibbon";

// The OAuth code can be exchanged only once; guard against effects running twice.
let started = false;

/** Plain words for the errors a relative can actually hit; the raw message stays behind "Technical details". */
function plainError(raw: string): string {
  if (/state/i.test(raw) && /(no|not found|missing)/i.test(raw)) return "This page was opened without a sign-in.";
  if (/fetch|network|load failed|timed? ?out/i.test(raw)) return "We couldn’t reach the sandbox. It may be offline.";
  if (/denied|access_denied|cancel/i.test(raw)) return "The sign-in was cancelled.";
  return "The sign-in didn’t finish.";
}

/**
 * /connect/callback (DESIGN §12.6): finishes the SMART sign-in, stashes the conditions for the invite that asked, and
 * goes back. Branded progress while it reads; "Couldn't connect" + Go back on failure. The exchange guard and the
 * redirect are unchanged. The minimal header (honesty ribbon + Lockup) shows in every state.
 */
export default function ConnectCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started) return;
    started = true;
    completeMyChartConnect()
      .then(({ result, returnTo, owner }) => {
        const saved = readInviteReturn();
        let target = new URL(returnTo, window.location.origin);
        let key = owner;
        // The lib falls back to a bare /invite when its return key is gone (Back → Approve again): use ours instead.
        if (saved && (target.origin !== window.location.origin || !target.hash)) {
          target = new URL(saved.href);
          key = saved.owner || owner;
        }
        // Ours is kept (not cleared) so Back from the picker → Approve again still finds the invite.
        stashPortalResult(result, key);
        window.location.replace(target.origin === window.location.origin ? target.href : "/");
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <div className="flex min-h-dvh flex-col aurora">
      <header data-shell="minimal" className="bg-surface/85">
        <HonestyRibbon />
        <div className="border-b border-line">
          <div className="container-page flex h-14 items-center">
            <Lockup href="/" size={24} />
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex flex-1 items-center justify-center px-4 py-12">
        <Card tier="overlay" className="w-full max-w-[440px] rounded-xl p-6 sm:p-8">
          <Eyebrow>SMART sandbox · made-up patients</Eyebrow>
          {error ? (
            <div className="mt-5 flex flex-col items-start gap-3">
              <span aria-hidden className="grid size-11 place-items-center rounded-full bg-mist text-fg-2">
                <Info className="size-5" strokeWidth={1.75} />
              </span>
              <h1 className="font-display text-[1.75rem] leading-tight font-book text-fg">Couldn&rsquo;t connect</h1>
              <p className="text-ui text-fg-2">
                <span className="font-strong text-fg">{plainError(error)}</span> Go back to your invite and try again, use the simulated record, or
                answer yourself.
              </p>
              <Button onClick={() => window.location.replace(readInviteReturn()?.href ?? "/")} className="mt-2">
                Go back
              </Button>
              <details className="group mt-1 w-full text-caption text-fg-3">
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-sm font-medium text-fg-2 select-none [&::-webkit-details-marker]:hidden">
                  Technical details
                  <ChevronDown aria-hidden className="size-4 transition-transform duration-(--dur-ui) group-open:rotate-180" />
                </summary>
                <p className="font-mono text-eyebrow [overflow-wrap:anywhere]">{error}</p>
              </details>
            </div>
          ) : (
            <Reading />
          )}
        </Card>
      </main>
    </div>
  );
}

const STEPS = ["Signed in", "Reading your problem list", "Choose what to share"] as const;

function Reading() {
  const reduce = useReducedMotion();
  return (
    <div className="mt-5 flex flex-col gap-6">
      <ol aria-label="Connecting" className="grid grid-cols-3">
        {STEPS.map((label, i) => {
          const state = i === 0 ? "done" : i === 1 ? "now" : "next";
          return (
            <li key={label} className="relative flex flex-col items-center gap-2 text-center">
              {i > 0 ? <span aria-hidden className={cn("absolute top-3 right-1/2 h-0.5 w-full -translate-y-1/2", i === 1 ? "bg-evergreen-600" : "bg-mist-2")} /> : null}
              <span
                aria-hidden
                className={cn(
                  "relative z-1 grid size-6 place-items-center rounded-full",
                  state === "done" && "bg-evergreen-600 text-white",
                  state === "now" && "bg-white ring-2 ring-evergreen-600",
                  state === "next" && "bg-white ring-2 ring-mist-2",
                )}
              >
                {state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : null}
                {state === "now" ? <span className="size-2.5 rounded-full bg-evergreen-600" /> : null}
              </span>
              <span className={cn("px-1 text-caption", state === "next" ? "text-fg-3" : "text-fg")}>
                {label}
                <span className="sr-only">{state === "done" ? " (done)" : state === "now" ? " (in progress)" : " (next)"}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[1.625rem] leading-tight font-book text-fg">Reading your record from the sandbox&hellip;</h1>
        <p className="text-ui text-fg-2">Nothing is saved yet.</p>
      </div>
      {/* Indeterminate progress: a sliding evergreen bar; parked in the middle under reduced motion. */}
      <div aria-hidden className="relative h-1 overflow-hidden rounded-full bg-evergreen-50">
        <m.span
          className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-[linear-gradient(90deg,transparent,var(--color-evergreen-600)_30%,var(--color-evergreen-600)_70%,transparent)]"
          initial={{ x: "-100%" }}
          animate={{ x: reduce ? "75%" : "250%" }}
          transition={reduce ? { duration: 0 } : { duration: 1.4, ease: [0.37, 0, 0.63, 1], repeat: Infinity }}
        />
      </div>
    </div>
  );
}
