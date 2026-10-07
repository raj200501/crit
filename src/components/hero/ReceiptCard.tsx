// The hover/focus receipt for one relative in the Night Window: who they are, the status word, and every answer with
// who said it and how they know. A paper card floating over the night (paper inside night is the supported depth),
// built only from the story model, so it never claims more than the app would show.

import { ArrowRight, Send } from "lucide-react";
import type { CSSProperties, Ref } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { PedigreeGlyph } from "@/components/ui/PedigreeGlyph";
import { SourceChip } from "@/components/ui/SourceChip";
import { StatusPill } from "@/components/ui/StatusPill";
import { STATUS_LABEL } from "@/components/ui/status";
import type { NodeState, ReceiptEntry, SceneNode } from "./story";

export interface ReceiptCardProps {
  node: SceneNode;
  state: NodeState;
  /** viewTree() headline at this keyframe ("Heart attack at 60?"). */
  headline: string;
  entries: ReceiptEntry[];
  finding: boolean;
  record: boolean;
  /** "Cardiology visit · Oct 14" for the patient's own card. */
  visitLine?: string;
  /** Narrow windows (phones): a shorter card that docks to the top or bottom of the window. */
  compact?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}

/** Plain-text receipt, announced through the window's status region and used as the card's accessible description. */
export function receiptText({ node, state, entries, visitLine }: Pick<ReceiptCardProps, "node" | "state" | "entries" | "visitLine">): string {
  if (node.isSelf) return `${node.label}. ${visitLine ?? "The patient"}.`;
  const lines = entries.map((e) => `${e.who}: ${e.text.toLowerCase()}${e.since ? `, on problem list since ${e.since}` : ""}`);
  const tail = state === "conflicting" ? " Both kept, with names." : state === "pending" ? " Nobody has asked yet." : "";
  return `${node.label}. ${STATUS_LABEL[state]}.${lines.length ? ` ${lines.join(". ")}.` : ""}${tail}`;
}

/** Where the card's link goes: the same person in the live demo (Grandpa Luis: straight to his invite). */
export function receiptLink(node: SceneNode, state: NodeState): { href: string; text: string; primary: boolean } {
  if (node.isSelf) return { href: "/tree", text: `Open ${node.name}’s tree`, primary: false };
  // Only a living relative can be asked; the app never offers an invite to someone who passed away.
  if (state === "pending" && !node.deceased) return { href: `/tree?person=${node.id}&mode=invite`, text: `Ask ${node.name}`, primary: true };
  return { href: `/tree?person=${node.id}`, text: `Open ${node.name} in the demo`, primary: false };
}

export function ReceiptCard({ node, state, headline, entries, finding, record, visitLine, compact, id, className, style, ref }: ReceiptCardProps) {
  const link = receiptLink(node, state);
  const fact = !compact && !node.isSelf && (state === "known" || state === "conflicting") && headline;
  const pill = node.isSelf ? (
    <span className="inline-flex h-6 items-center rounded-full bg-mist px-2 text-caption font-medium text-ink-2">The patient</span>
  ) : (
    <StatusPill status={state} size="sm" />
  );
  return (
    <div
      ref={ref}
      id={id}
      data-theme="paper"
      role="group"
      aria-label={`${node.name}: receipt`}
      className={cn(
        "pointer-events-auto rounded-lg border border-line bg-white text-left text-ink",
        "[box-shadow:0_1px_0_rgb(255_255_255/.9)_inset,0_24px_60px_-18px_rgb(0_0_0/.55),0_8px_20px_-8px_rgb(0_0_0/.35)]",
        compact ? "p-3" : "w-[18.5rem] max-w-[calc(100cqw-24px)] p-4",
        className,
      )}
      style={style}
    >
      <div className={cn("flex items-center", compact ? "gap-2.5" : "gap-3")}>
        <PedigreeGlyph
          shape={node.shape}
          status={node.isSelf ? "self" : state}
          finding={finding}
          deceased={node.deceased}
          record={record}
          proband={node.isSelf}
          size={compact ? 28 : 34}
          tone="paper"
          className="shrink-0"
        />
        {compact ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-ui font-strong tracking-[-0.01em] text-ink">{node.label}</p>
            {pill}
          </div>
        ) : (
          <div className="min-w-0">
            <p className="truncate text-ui font-strong tracking-[-0.01em] text-ink">{node.label}</p>
            <div className="mt-1">{pill}</div>
          </div>
        )}
      </div>

      {fact ? <p className="mt-3 font-display text-[1.375rem] leading-tight font-book tracking-[-0.01em] text-ink">{headline}</p> : null}

      {node.isSelf ? (
        <p className={cn("text-small text-ink-2", compact ? "mt-2" : "mt-3")}>
          {visitLine ? <span className="block font-medium text-ink">{visitLine}</span> : null}
          Starts the tree and sends one text link per relative.
        </p>
      ) : entries.length ? (
        <ul className={cn(compact ? "mt-2 grid gap-x-4 gap-y-1.5 @min-xl:grid-cols-2" : "mt-3 space-y-2.5")}>
          {entries.map((e, i) => (
            <li key={i} className={cn("border-l-2 pl-2.5", e.source === "record" ? "border-record/60" : "border-line-strong")}>
              <p className="text-small leading-snug text-ink">
                <span className="font-medium">{e.who}:</span> {e.text}
              </p>
              {e.since ? <p className="text-caption text-ink-3">On problem list since {e.since}</p> : null}
              {e.note && !compact ? <p className="mt-0.5 text-caption text-ink-3 italic">“{e.note}”</p> : null}
              <SourceChip kind={e.source} who={e.who.replace(/’s portal record$/, "")} date={e.date} className={compact ? "mt-0.5" : "mt-1"} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={cn("text-small text-ink-2", compact ? "mt-2" : "mt-3")}>{state === "pending" ? "Nobody has asked yet. The gap stays on the tree." : "No answers yet."}</p>
      )}

      {state === "conflicting" && !compact ? (
        <p className="mt-3 flex items-center gap-2 font-mono text-eyebrow font-medium tracking-[0.08em] text-conflict-ink uppercase">
          <span aria-hidden className="h-px flex-1 bg-conflict/40" />
          Both kept · names attached
          <span aria-hidden className="h-px flex-1 bg-conflict/40" />
        </p>
      ) : null}

      <div className={cn(compact ? "mt-1.5 flex items-center justify-between gap-3" : "mt-3 border-t border-line pt-1")}>
        {link.primary ? (
          <Button href={link.href} size="sm" variant="primary" className={compact ? "mt-1" : "mt-2"} iconLeft={<Send />} iconRight={<ArrowRight />}>
            {link.text}
          </Button>
        ) : (
          <Button href={link.href} size="sm" variant="link" iconRight={<ArrowRight />}>
            {link.text}
          </Button>
        )}
        {compact && state === "conflicting" ? (
          <span className="font-mono text-eyebrow font-medium tracking-[0.08em] whitespace-nowrap text-conflict-ink uppercase">Both kept</span>
        ) : null}
      </div>
    </div>
  );
}
