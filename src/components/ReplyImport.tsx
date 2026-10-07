"use client";

import { ArrowRight, Check, Info } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { cleanReport } from "@/lib/sanitize";
import { decodePayload, type ReplyPayload } from "@/lib/share";
import { actions, useTree, type ImportResult } from "@/lib/store";
import type { Report } from "@/lib/types";
import { useHash } from "@/lib/useHash";
import { describeAnswer } from "./relative/describe";
import { ReplyDiff } from "./relative/ReplyDiff";
import { replyDiff, type DiffRow } from "./relative/replyPreview";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Eyebrow } from "./ui/Eyebrow";

/**
 * /reply (DESIGN §12.7): a relative's answers arrive in the link. Shows who answered, what changes in the tree
 * (before → after, computed read-only), and adds them on "Add to my tree". Guards and import logic are unchanged.
 */
export default function ReplyImport() {
  const tree = useTree();
  const hash = useHash();
  const reply = useMemo<ReplyPayload | null | undefined>(() => {
    if (hash === null) return undefined;
    const r = decodePayload<ReplyPayload>(hash);
    return r && r.v === 1 && typeof r.t === "string" && typeof r.p === "string" && Array.isArray(r.reports) ? r : null;
  }, [hash]);
  const shown = useMemo(() => (reply ? reply.reports.map(cleanReport).filter((r): r is Omit<Report, "id"> => !!r) : []), [reply]);
  const [result, setResult] = useState<ImportResult | null>(null);
  // The diff as it was before the import (afterwards the tree already holds the answers).
  const [frozen, setFrozen] = useState<DiffRow[] | null>(null);

  const nameOf = (id: string) => tree.people.find((p) => p.id === id)?.label ?? "Someone not in your tree";
  const from = reply ? (tree.people.find((p) => p.id === reply.p)?.label ?? String(reply.b ?? "A relative").slice(0, 60)) : "";
  const matches = reply ? reply.t === tree.id : false;
  const invited = reply ? tree.invites.some((i) => i.personId === reply.p) : false;
  const live = useMemo(() => (reply && matches && invited ? replyDiff(tree, reply) : null), [reply, matches, invited, tree]);
  const diff = frozen ?? live;
  const count = shown.length;

  return (
    <main id="main" tabIndex={-1} className="min-h-[calc(100dvh-var(--app-header-h))] bg-mist/50 px-4 py-10 sm:py-14">
      <Card tier="floating" className="mx-auto flex w-full max-w-[560px] flex-col gap-6 p-5 sm:p-8">
        {reply === undefined ? <p className="py-6 text-center text-small text-fg-3">Opening answers&hellip;</p> : null}

        {reply === null ? (
          <div className="flex flex-col items-start gap-3">
            <span aria-hidden className="grid size-11 place-items-center rounded-full bg-mist text-fg-2">
              <Info className="size-5" strokeWidth={1.75} />
            </span>
            <h1 className="font-display text-[1.75rem] leading-tight font-book text-fg">This link is incomplete</h1>
            <p className="text-fg-2">Ask your relative to send the whole link again, including everything after the #.</p>
          </div>
        ) : null}

        {reply ? (
          <>
            <header className="flex items-center gap-4">
              <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-evergreen-50 font-display text-[1.375rem] leading-none text-evergreen-700 ring-1 ring-brand/25">
                {from.replace(/^(Grandpa|Grandma|Uncle|Aunt)\s+/i, "").slice(0, 1).toUpperCase()}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Eyebrow>Answers from a relative</Eyebrow>
                <h1 className="font-display text-[1.75rem] leading-tight font-book text-fg">
                  {count} {count === 1 ? "answer" : "answers"} from {from}
                </h1>
              </div>
            </header>

            {diff && diff.length ? (
              <section aria-labelledby="reply-changes" className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                  <h2 id="reply-changes" className="text-small font-strong text-fg">
                    {result && !result.error ? "What changed in your tree" : "What changes in your tree"}
                  </h2>
                  <span className="font-mono text-eyebrow text-fg-3 uppercase">Before → after</span>
                </div>
                <ReplyDiff rows={diff} />
              </section>
            ) : (
              <section aria-labelledby="reply-contents" className="flex flex-col gap-2">
                <h2 id="reply-contents" className="border-b border-line pb-2 text-small font-strong text-fg">
                  What the link says
                </h2>
                <ul className="divide-y divide-line">
                  {shown.map((r, i) => (
                    <li key={i} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-4">
                      <span className="text-ui font-strong text-fg">{nameOf(r.personId)}</span>
                      <span className="text-ui text-fg-2">
                        {describeAnswer(r)}
                        {r.source === "record" ? " (from a portal record)" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!matches ? (
              <Callout>These answers belong to a different tree than the one in this browser. Open the link on the device where you built your tree.</Callout>
            ) : !invited ? (
              <Callout>You haven&rsquo;t invited {from} from this tree, so these answers can&rsquo;t be added. Send them an invite first.</Callout>
            ) : result?.error ? (
              <Callout>These answers couldn&rsquo;t be added.</Callout>
            ) : result ? (
              <div className="flex flex-col gap-4 rounded-lg bg-evergreen-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p role="status" className="flex items-center gap-2.5 text-ui font-strong text-evergreen-700">
                  <span aria-hidden className="grid size-6 place-items-center rounded-full bg-evergreen-600 text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  Added {result.added} {result.added === 1 ? "answer" : "answers"} to your tree
                </p>
                <Button href={`/tree?person=${encodeURIComponent(reply.p)}`} iconRight={<ArrowRight />}>
                  Open my tree
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  fullWidth
                  onClick={() => {
                    setFrozen(live);
                    setResult(actions.importReply(reply));
                  }}
                >
                  Add to my tree
                </Button>
                <p className="text-center text-small text-fg-3">Nothing is added until you click. Their answers keep their name and date.</p>
              </div>
            )}
          </>
        ) : null}
      </Card>
    </main>
  );
}

/** Calm guard state: mist, an Info icon, plain words (no alert hue). */
function Callout({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-3 rounded-lg bg-mist px-4 py-3.5 text-ui text-fg-2">
      <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-fg-3" strokeWidth={1.75} />
      <span>{children}</span>
    </p>
  );
}
