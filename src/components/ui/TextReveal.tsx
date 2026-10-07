import { Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "./cn";

export interface TextRevealProps {
  /** The full sentence. It is also rendered once as an sr-only copy. */
  text: string;
  /** A phrase inside `text` set in Newsreader italic, muted, and kept still (the family's "vague voice"). */
  accent?: { text: string; style: "italic-muted" };
  /** "all" animates every non-accent word; "after-accent" animates only the words after the accent. */
  animate?: "all" | "after-accent";
  /** Groups a phrase inside `text` in one non-wrapping span and appends `decoration` (e.g. an aria-hidden SVG underline). */
  mark?: { text: string; className?: string; decoration?: ReactNode };
  as?: "h1" | "h2" | "p";
  id?: string;
  className?: string;
}

type Seg = { words: string[]; kind: "plain" | "accent" | "mark" };

function split(text: string, accent?: string, mark?: string): Seg[] {
  // Cut the sentence at the accent and mark phrases (first occurrence each), in order.
  const cuts: { start: number; end: number; kind: Seg["kind"] }[] = [];
  for (const [phrase, kind] of [
    [accent, "accent"],
    [mark, "mark"],
  ] as const) {
    if (!phrase) continue;
    const start = text.indexOf(phrase);
    if (start >= 0) cuts.push({ start, end: start + phrase.length, kind });
  }
  cuts.sort((a, b) => a.start - b.start);
  const segs: Seg[] = [];
  let at = 0;
  const words = (s: string) => s.split(/\s+/).filter(Boolean);
  for (const c of cuts) {
    if (c.start < at) continue; // overlapping phrases: keep the first
    if (c.start > at) segs.push({ words: words(text.slice(at, c.start)), kind: "plain" });
    segs.push({ words: words(text.slice(c.start, c.end)), kind: c.kind });
    at = c.end;
  }
  if (at < text.length) segs.push({ words: words(text.slice(at)), kind: "plain" });
  return segs.filter((s) => s.words.length);
}

type Word = { w: string; delay: number | null };
type Part = { kind: Seg["kind"]; words: Word[] };

// Pure layout pass: which words animate and with what delay (70 ms stagger over animated words only).
function plan(segs: Seg[], hasAccent: boolean, animate: "all" | "after-accent"): Part[] {
  let index = 0;
  let pastAccent = !hasAccent || animate === "all";
  return segs.map((seg) => {
    if (seg.kind === "accent") {
      pastAccent = true;
      return { kind: seg.kind, words: seg.words.map((w) => ({ w, delay: null })) };
    }
    const still = !pastAccent;
    return { kind: seg.kind, words: seg.words.map((w) => ({ w, delay: still ? null : index++ * 70 })) };
  });
}

function Words({ words }: { words: Word[] }) {
  return words.map(({ w, delay }, i) => (
    <Fragment key={i}>
      <span
        className={cn("inline-block", delay !== null && "motion-safe:animate-word-in")}
        style={delay !== null ? ({ animationDelay: `${delay}ms` } satisfies CSSProperties) : undefined}
      >
        {w}
      </span>{" "}
    </Fragment>
  ));
}

/**
 * Word-by-word focus-pull (blur 10 px → 0, y 0.2em → 0, 70 ms stagger, 900 ms expo). CSS only, so it runs at first paint.
 * Opacity never starts at 0, so an H1 stays the LCP element. Screen readers get one sr-only sentence.
 */
export function TextReveal({ text, accent, animate = "all", mark, as: Tag = "h2", id, className }: TextRevealProps) {
  const parts = plan(split(text, accent?.text, mark?.text), Boolean(accent), animate);
  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {parts.map((part, i) => {
          if (part.kind === "accent") {
            return (
              <span key={i} className="font-display font-light text-fg-3 italic">
                <Words words={part.words} />
              </span>
            );
          }
          if (part.kind === "mark") {
            return (
              <Fragment key={i}>
                <span className={cn("relative inline-block whitespace-nowrap", mark?.className)}>
                  <Words words={part.words} />
                  {mark?.decoration}
                </span>{" "}
              </Fragment>
            );
          }
          return <Words key={i} words={part.words} />;
        })}
      </span>
    </Tag>
  );
}
