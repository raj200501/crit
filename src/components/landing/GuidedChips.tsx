import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { CHIP_EXAMPLES } from "@/content/site";

/** §8.5 A compact mist band: the guided questions' real example words, in a marquee with a Pause control. */
export function GuidedChips() {
  return (
    <Section theme="mist" aria-labelledby="chips-title" className="overflow-hidden py-16 lg:py-20">
      <Reveal className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:px-8">
        <h2 id="chips-title" className="font-display text-display-m font-book text-fg">
          Guided questions, not a blank box.
        </h2>
        <p className="max-w-[44ch] text-lead text-fg-2">Plain words and real examples, so &ldquo;any heart history?&rdquo; isn&rsquo;t a guessing game.</p>
      </Reveal>
      <div className="mx-auto mt-10 w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <Marquee items={CHIP_EXAMPLES} label="Examples the questions use" className="[&>button]:-ml-3" />
      </div>
    </Section>
  );
}
