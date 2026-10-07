import { ArrowRight, FileText, Printer, QrCode } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Cite } from "@/components/ui/Cite";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FDA_LINE } from "@/content/site";
import { TwoReadersSheet } from "./TwoReadersSheet";

/** §8.9 "You see facts and questions. Your cardiologist sees the criteria." One page, two readers, on the mist desk. */
export function TwoReaders({ patientDoc, clinicianDoc }: { patientDoc: ReactNode; clinicianDoc: ReactNode }) {
  return (
    <Section id="two-readers" theme="mist" aria-labelledby="two-readers-title" className="overflow-hidden">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="two-readers-title"
          align="center"
          eyebrow="One page, two readers"
          title="You see facts and questions. Your cardiologist sees the criteria."
          className="[&_h2]:max-w-[24ch]"
        />
        <Reveal className="mt-10 lg:mt-12">
          <TwoReadersSheet patientDoc={patientDoc} clinicianDoc={clinicianDoc} />
        </Reveal>
        <Reveal className="mx-auto mt-14 flex max-w-[60ch] flex-col items-center gap-6 text-center">
          <p className="text-body text-fg-2">
            {FDA_LINE.text}
            <Cite n={FDA_LINE.cite} />
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            <li>
              <Badge icon={<Printer />}>Prints on one Letter page</Badge>
            </li>
            <li>
              <Badge icon={<QrCode />}>QR or read-only link</Badge>
            </li>
            <li>
              <Badge icon={<FileText />}>FHIR FamilyMemberHistory</Badge>
            </li>
          </ul>
          <div className="flex flex-col items-center gap-x-6 gap-y-2 sm:flex-row">
            <Button href="/summary" variant="secondary" iconRight={<ArrowRight />}>
              Open the pre-visit summary
            </Button>
            <Button href="/practice" variant="link" iconRight={<ArrowRight />}>
              See the practice view
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
