"use client";

import { ArrowUpRight, Check, Copy, Eye, Lock, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buildInvite, inviteUrl } from "@/lib/share";
import { actions, deviceId } from "@/lib/store";
import type { PersonView } from "@/lib/status";
import type { FamilyTree } from "@/lib/types";
import { LogoMark } from "@/components/brand/LogoMark";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { toast } from "@/components/ui/Toast";
import { shortDate, shortName } from "@/components/tree/model";

/**
 * The invite text, exactly as AMENDMENTS A2 specifies: no health information, no visit, no time claim.
 * (A tree started without a name says "it's me" rather than "it's You".)
 */
export function inviteMessage(patientName: string, url: string) {
  const name = patientName === "You" ? "me" : patientName;
  return `Hi, it's ${name}. I'm putting together our family health history and would love your help. Here's a private link; you can answer, skip, or say no: ${url}`;
}

const ROW =
  "group/row flex min-h-12 w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-ui font-medium text-fg transition-colors duration-(--dur-hover) hover:bg-sunken focus-visible:-outline-offset-2";
const TILE =
  "grid size-8 shrink-0 place-items-center rounded-full bg-sunken text-fg-2 transition-colors duration-(--dur-hover) group-hover/row:bg-surface group-hover/row:text-fg [&_svg]:size-4";

/** "Ask {name} directly" (DESIGN §12.5): the text as it will arrive, a link preview with no health information, three ways to send. */
export function InviteBox({ tree, view, onDone }: { tree: FamilyTree; view: PersonView; onDone: () => void }) {
  const p = view.person;
  const short = shortName(p.label);
  const asker = tree.patientName === "You" ? "Your relative" : tree.patientName;
  const [url] = useState(() => inviteUrl(window.location.origin, buildInvite(tree, p, deviceId())));
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const invite = [...tree.invites].filter((i) => i.personId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  // Only mark someone as invited once the link has actually left this screen.
  const markSent = () => actions.createInvite(p.id);
  const message = inviteMessage(tree.patientName, url);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      markSent();
      setCopied(true);
      toast({ title: "Copied", body: `Paste it into a text to ${short}.` });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Family health history", text: message });
        markSent();
      } catch {
        /* user cancelled */
      }
    } else {
      void copy();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-title font-strong text-fg">Ask {short} directly</h3>
        <p className="mt-1 text-small text-fg-2">
          They answer on their own phone, with no account. They can also share one fact from their patient portal without sharing their whole chart.
        </p>
      </div>

      <figure className="rounded-lg border border-line bg-paper p-4">
        <figcaption className="mb-3 flex items-center justify-between font-mono text-eyebrow text-fg-3 uppercase">
          <span>Text message</span>
          <span>To {short}</span>
        </figcaption>
        <textarea
          readOnly
          aria-label="Invite message"
          rows={4}
          value={message}
          onFocus={(e) => e.currentTarget.select()}
          // a copy by hand (Ctrl/Cmd+C, long-press Copy) sends the link too, so the reply is accepted later
          onCopy={markSent}
          onCut={markSent}
          className={cn(
            "block w-full max-w-[34ch] resize-none rounded-[20px_20px_20px_6px] bg-mist px-4 py-3 text-ui leading-snug text-fg shadow-xs",
            // the long link fades out visually; the value always carries the full URL
            "[mask-image:linear-gradient(to_bottom,#000_58%,transparent_96%)] focus:[mask-image:none] focus-visible:outline-offset-2",
          )}
        />
        <div className="mt-2 flex max-w-[34ch] items-center gap-3 rounded-[14px] border border-line bg-surface p-3 shadow-xs">
          <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-paper ring-1 ring-line">
            <LogoMark size={24} surface="paper" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-small font-strong text-fg">{asker} asked for your help</span>
            <span className="block truncate text-caption text-fg-3">Stemma</span>
          </span>
        </div>
      </figure>

      <div
        role="group"
        aria-label={`Send the invite to ${short}`}
        className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface shadow-xs"
      >
        <button type="button" onClick={share} className={ROW}>
          <span aria-hidden className={cn(TILE, "bg-ink text-white group-hover/row:bg-ink group-hover/row:text-white")}>
            <Share2 />
          </span>
          <span className="flex-1">Send…</span>
          <span aria-hidden className="text-caption font-normal text-fg-3">
            Share sheet
          </span>
        </button>
        <button type="button" onClick={copy} className={ROW}>
          <span aria-hidden className={cn(TILE, copied && "bg-evergreen-50 text-evergreen-700")}>
            {copied ? <Check /> : <Copy />}
          </span>
          <span className="flex-1">{copied ? "Copied" : "Copy message"}</span>
          <span aria-hidden className="text-caption font-normal text-fg-3">
            {copied ? "On your clipboard" : "Paste into any text"}
          </span>
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" onClick={markSent} className={ROW}>
          <span aria-hidden className={TILE}>
            <Eye />
          </span>
          <span className="flex-1">Preview as {short}</span>
          <span className="sr-only"> (opens in a new tab)</span>
          <ArrowUpRight
            aria-hidden
            className="size-4 text-fg-3 transition-transform duration-(--dur-hover) group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5"
          />
        </a>
      </div>

      <p className="flex items-start gap-2.5 text-small text-fg-2">
        <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
        <span>
          The text has no health information. {tree.patientName === "You" ? "Your" : `${tree.patientName}’s`} questions ride after the # in the link, which
          never reaches a server.
        </span>
      </p>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="font-mono text-eyebrow text-fg-3 uppercase">
          {invite ? (invite.answeredAt ? `Answered ${shortDate(invite.answeredAt)}` : `Link created ${shortDate(invite.createdAt)}`) : "Not sent yet"}
        </p>
        <Button variant="ghost" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
