import { ArrowUpRight } from "lucide-react";
import OneFactBeam from "@/components/hero/OneFactBeam";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhoneScreens } from "./PhoneScreens";

/** §8.7 "Grandpa answers from his phone." The relative's five screens, and sharing one fact from a portal record. */
export function RelativesSection() {
  return (
    <Section theme="white" aria-labelledby="relatives-title" className="overflow-hidden">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="relatives-title"
          eyebrow="For relatives"
          title="Grandpa answers from his phone. No app, no account."
          lead="He sees who asked and who will see it, can say no, and can share one fact from his own patient portal instead of typing it."
        />
        <div className="mt-12 grid items-center gap-14 lg:mt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal className="relative flex flex-col items-center gap-4">
            {/* soft aurora pool under the phone */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-[12%] left-1/2 -z-0 size-[min(28rem,110%)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(207_245_231/0.9),rgb(214_233_255/0.5)_55%,transparent)] blur-2xl"
            />
            <div className="relative w-full">
              <PhoneScreens />
            </div>
            <Button href="/tree?person=mgf&mode=invite" variant="link" iconRight={<ArrowUpRight />} className="relative">
              Open the real relative flow
            </Button>
          </Reveal>
          <Reveal delay={0.08} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="font-mono text-eyebrow text-fg-3 uppercase">His record, his choice</p>
              <p className="max-w-[46ch] text-body text-fg-2">Only what you tick is shared. Nothing else from the chart leaves this page.</p>
            </div>
            <OneFactBeam />
          </Reveal>
        </div>
        <p className="mt-14 border-t border-line pt-6 text-center font-mono text-eyebrow text-fg-3 uppercase">
          Demo: a real SMART on FHIR sign-in against a public sandbox with made-up patients
        </p>
      </div>
    </Section>
  );
}
