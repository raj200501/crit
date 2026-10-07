import { ArrowRight } from "lucide-react";
import HeroPoster from "@/components/hero/HeroPoster";
import type { StoryModel } from "@/components/hero/story";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { pilotCta, SITE } from "@/content/site";
import { InView } from "./InView";

/** §8.13 The closing night band: the hero's static night poster at 30% (no WebGL) whose lit relatives twinkle, then
 *  the two ways in. */
export function FinalCta({ model }: { model: StoryModel }) {
  return (
    <Section theme="night" grain aria-labelledby="final-title" className="relative overflow-hidden py-28 lg:py-40">
      <InView mode="pause" className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <HeroPoster model={model} theme="night" twinkle className="h-[84%] w-auto max-w-none opacity-30" />
      </InView>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(42%_38%_at_50%_50%,rgb(11_21_20/0.92),rgb(11_21_20/0.55)_55%,transparent_100%)]"
      />
      <Reveal className="relative mx-auto flex w-full max-w-[1240px] flex-col items-center gap-10 px-4 text-center sm:px-6 lg:px-8">
        <h2
          id="final-title"
          className="max-w-[18ch] bg-linear-to-b from-ivory to-ivory-2 bg-clip-text pb-[0.08em] font-display text-display-l font-book text-transparent"
        >
          Walk in knowing who, what, and at what age.
        </h2>
        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <Button
            href={SITE.demoHref}
            size="lg"
            iconRight={
              <ArrowRight className="transition-transform duration-(--dur-hover) ease-out-quart group-hover/btn:translate-x-0.5 motion-reduce:transition-none" />
            }
          >
            Try the demo family
          </Button>
          <Button href={pilotCta().href} variant="secondary" size="lg">
            {pilotCta().label}
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
