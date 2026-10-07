import { ArrowRight } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { FAQ } from "@/content/site";

/** §8.12 "Straight answers." The heading sits left (sticky on wide screens), the accordion right. */
export function FaqSection() {
  return (
    <Section theme="paper" aria-labelledby="faq-title" className="border-t border-line">
      <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:px-8">
        <Reveal className="flex flex-col items-start gap-4 lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Questions</Eyebrow>
          <h2 id="faq-title" className="font-display text-display-l font-book text-fg">
            Straight answers.
          </h2>
          <Button href="/privacy" variant="link" iconRight={<ArrowRight />} className="mt-2">
            Security &amp; privacy
          </Button>
        </Reveal>
        <Reveal delay={0.06}>
          <Accordion items={FAQ} className="[&_summary]:text-lead [&_summary]:transition-colors [&_summary:hover]:text-brand-strong" />
        </Reveal>
      </div>
    </Section>
  );
}
