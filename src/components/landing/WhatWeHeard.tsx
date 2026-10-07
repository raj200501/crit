import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { INTERVIEWS } from "@/content/site";

/** §8.11 One verbatim quote, then what we learned (paraphrased, so no quotation marks). No photos, names or carousel. */
export function WhatWeHeard() {
  return (
    <Section theme="paper" aria-labelledby="heard-title">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <h2 id="heard-title" className="sr-only">
          What we heard
        </h2>
        <Reveal className="flex flex-col items-center gap-10 text-center">
          <Eyebrow className="max-w-[60ch]">{INTERVIEWS.base}</Eyebrow>
          <figure className="relative flex flex-col items-center">
            <span aria-hidden className="pointer-events-none font-display text-[5.5rem] leading-[0.6] font-light text-brand select-none">
              &ldquo;
            </span>
            <blockquote className="mt-4 max-w-[22ch] font-display text-display-l font-light text-fg italic">
              <p>{INTERVIEWS.quote.text}</p>
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3 text-small text-fg-2">
              <span aria-hidden className="h-px w-8 bg-brand max-sm:hidden" />
              {INTERVIEWS.quote.who}
              <span aria-hidden className="h-px w-8 bg-brand max-sm:hidden" />
            </figcaption>
          </figure>
        </Reveal>
        <div className="mt-16 border-t border-line pt-10 lg:mt-20">
          <h3 className="text-title font-strong text-fg">{INTERVIEWS.learnedTitle}</h3>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {INTERVIEWS.learned.map((l, i) => (
              <Reveal as="li" key={l.who} delay={i * 0.07} className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-6 shadow-xs">
                <span className="font-mono text-eyebrow text-brand-strong uppercase">{l.who}</span>
                <p className="text-body text-fg">{l.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
