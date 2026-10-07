import { ChevronDown, Hand, ShieldCheck, Users } from "lucide-react";
import { useId } from "react";
import { HEART_CHOICES } from "@/lib/clinical";
import { Button } from "../ui/Button";
import { CheckboxCard } from "../ui/CheckboxCard";
import { Eyebrow } from "../ui/Eyebrow";
import { AskerMark } from "./AskerMark";
import { teamOf, withArticle } from "./describe";
import { ActionHint, StepActions, StepTitle } from "./StepLayout";

export interface WelcomeProps {
  /** The invitee, as the asker labels them ("Grandpa Luis"). */
  me: string;
  asker: string;
  /** "cardiology visit" (from the invite), if the asker set a visit. */
  visit?: string;
  /** How many other relatives the invitee is asked about. */
  others: number;
  adult: boolean;
  onAdult: (adult: boolean) => void;
  onStart: () => void;
  onDecline: () => void;
}

/** The letter: who asked, why, who sees it, the questions, 18+, Start. No time estimate (AMENDMENTS A2). */
export function Welcome({ me, asker, visit, others, adult, onAdult, onStart, onDecline }: WelcomeProps) {
  const hintId = useId();
  const about = others === 0 ? "about you" : others === 1 ? "about you and one relative" : "about you and a few relatives";
  const rows = [
    {
      icon: Users,
      lead: "Who sees it:",
      text: `${asker}, and ${teamOf(asker, visit)} if ${asker} shares the summary.`,
    },
    { icon: Hand, lead: "You choose.", text: "“I’d rather not share” is always an option." },
    { icon: ShieldCheck, lead: "This doesn’t diagnose anyone.", text: "No account. No app." },
  ];
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-5 pt-6 pb-8 sm:pt-7">
        {/* The letter */}
        <section className="relative isolate overflow-clip rounded-lg border border-line bg-surface p-5 shadow-sm">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_0%_0%,rgb(207_245_231/0.9),transparent_70%),radial-gradient(50%_50%_at_100%_0%,rgb(214_233_255/0.6),transparent_70%)]"
          />
          <div className="flex items-start justify-between gap-4">
            <AskerMark name={asker} className="motion-safe:animate-fade-up" />
            <Eyebrow className="pt-1 text-right">For {me}</Eyebrow>
          </div>
          <StepTitle className="mt-5">{asker} asked for your help.</StepTitle>
          <p className="mt-3 text-fg-2">
            {asker} is getting ready for {visit ? withArticle(visit) : "a doctor’s visit"} and is asking about the family&rsquo;s heart health. A few
            questions {about}. Skip anything.
          </p>
        </section>

        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
          {rows.map(({ icon: Icon, lead, text }) => (
            <li key={lead} className="flex gap-3.5 px-4 py-3.5">
              <span aria-hidden className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-evergreen-50 text-evergreen-700">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <p className="text-ui text-fg-2">
                <span className="font-strong text-fg">{lead}</span> {text}
              </p>
            </li>
          ))}
        </ul>

        <details className="group rounded-lg border border-line bg-surface open:shadow-xs">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 text-ui font-strong text-fg select-none [&::-webkit-details-marker]:hidden">
            See the questions
            <ChevronDown aria-hidden className="size-5 text-fg-3 transition-transform duration-(--dur-ui) group-open:rotate-180" />
          </summary>
          <div className="border-t border-line px-4 pt-3 pb-4 text-ui text-fg-2">
            <p>For you, and for anyone else {asker} asks about: has anyone had&hellip;</p>
            <ul className="mt-2.5 grid gap-1.5">
              {[...HEART_CHOICES.map((c) => c.label), "Something else heart-related"].map((label) => (
                <li key={label} className="flex items-baseline gap-2.5">
                  <span aria-hidden className="relative -top-0.5 size-1.5 shrink-0 rotate-45 rounded-[1px] bg-evergreen-600" />
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-small text-fg-3">With an age if you know it. &ldquo;None of these&rdquo;, &ldquo;I don&rsquo;t know&rdquo; and &ldquo;I&rsquo;d rather not share&rdquo; are always there.</p>
          </div>
        </details>

        <CheckboxCard size="lg" checked={adult} onChange={onAdult} title="I’m 18 or older." />
        <Button variant="ghost" size="lg" fullWidth onClick={onDecline} className="-mt-1">
          I&rsquo;d rather not share
        </Button>
      </div>
      <StepActions>
        <Button size="lg" fullWidth disabled={!adult} onClick={onStart} aria-describedby={adult ? undefined : hintId} iconRight={adult ? <ArrowGlyph /> : undefined}>
          Start
        </Button>
        {adult ? null : <ActionHint id={hintId}>Confirm you&rsquo;re 18 or older to start.</ActionHint>}
      </StepActions>
    </div>
  );
}

/** A small arrow that nudges right on hover (the button is the `group/btn`). */
export function ArrowGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="transition-transform duration-(--dur-hover) ease-out-quart group-hover/btn:translate-x-0.5 motion-reduce:transition-none">
      <path d="M3 8h9.5M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
