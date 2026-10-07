import { Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { Eyebrow } from "../ui/Eyebrow";
import { toast } from "../ui/Toast";
import { StepActions, StepTitle } from "./StepLayout";
import { ArrowGlyph } from "./Welcome";

export interface SentScreenProps {
  asker: string;
  /** The invitee's label, for "Thank you, Grandpa Luis." */
  me: string;
  /** The reply link (answers ride after the #). */
  link: string;
  /** The answers were written straight into the asker's tree (same-browser demo). */
  sameBrowser: boolean;
  /** Where "Open {asker}'s tree" goes. */
  treeHref: string;
}

/** Sent: a check that draws in (600 ms; static under reduced motion), what happens next, and the way back to the asker. */
export function SentScreen({ asker, me, link, sameBrowser, treeHref }: SentScreenProps) {
  const [copied, setCopied] = useState(false);
  const message = useMemo(() => `Done! Here are my answers for your family health tree: ${link}`, [link]);

  const send = async () => {
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
    toast({ title: "Copied", body: `Paste it in a message to ${asker}.` });
  };

  const next = [
    `${asker} sees your answers in their tree.`,
    `If ${asker} shares a summary with their cardiologist, your answers are on it with your name.`,
    `Want something removed? Tell ${asker}.`,
  ];

  return (
    <div className="relative isolate flex flex-1 flex-col">
      <div
        aria-hidden
        className="absolute inset-x-[-16px] top-0 -z-10 h-72 bg-[radial-gradient(60%_70%_at_12%_0%,rgb(207_245_231/0.85),transparent_72%),radial-gradient(45%_55%_at_95%_0%,rgb(214_233_255/0.55),transparent_70%)] sm:inset-x-[-24px]"
      />
      <div className="flex flex-col gap-6 pt-8 pb-8">
        <DoneMark />
        <div className="flex flex-col gap-3">
          <StepTitle>
            Sent. Thank you, {me}.
          </StepTitle>
          {sameBrowser ? (
            <p className="rounded-md bg-evergreen-50 px-4 py-3 text-ui text-evergreen-700">Your answers are in {asker}&rsquo;s tree (demo: same browser).</p>
          ) : (
            <p className="text-fg-2">
              Send this link back to {asker}. Opening it adds your answers to their tree. The answers are inside the link itself; nothing is stored on a
              server.
            </p>
          )}
        </div>
        <section aria-labelledby="sent-next" className="flex flex-col gap-3">
          <Eyebrow as="h2" id="sent-next">
            What happens next
          </Eyebrow>
          <ol className="flex flex-col gap-3">
            {next.map((line, i) => (
              <li key={i} className="flex gap-3 text-fg-2">
                <span aria-hidden className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line-strong font-mono text-eyebrow text-fg-2">
                  {i + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </section>
        <p className="text-small text-fg-3">Stemma, the family health tree · a student prototype by Team 709</p>
      </div>
      <StepActions>
        {sameBrowser ? (
          <Button href={treeHref} size="lg" fullWidth iconRight={<ArrowGlyph />}>
            Open {asker}&rsquo;s tree
          </Button>
        ) : null}
        <Button variant={sameBrowser ? "secondary" : "primary"} size="lg" fullWidth onClick={send} iconLeft={<Share2 />}>
          {copied ? "Copied" : `Send my answers to ${asker}`}
        </Button>
      </StepActions>
    </div>
  );
}

/** An evergreen disc whose check draws in once (pathLength 1 + the `draw` keyframes), with one soft ring. */
function DoneMark() {
  return (
    <span aria-hidden className="relative grid size-16 place-items-center">
      <span className="absolute inset-0 rounded-full bg-evergreen-600/25 motion-safe:animate-ripple" />
      <span className="relative grid size-16 place-items-center rounded-full bg-evergreen-600 shadow-[0_12px_32px_-10px_rgb(127_230_197/0.95)]">
        <svg viewBox="0 0 24 24" className="size-8" fill="none">
          <path
            d="M5.5 12.5l4.2 4.2 8.8-9.4"
            pathLength={1}
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1"
            className="motion-safe:animate-draw motion-safe:[animation-delay:120ms] motion-safe:[animation-duration:600ms]"
          />
        </svg>
      </span>
    </span>
  );
}
