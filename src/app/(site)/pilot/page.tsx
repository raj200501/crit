// PLACEHOLDER created by P1 so SiteFooter, PilotCard and the pilotHref() fallback (/pilot#contact) never 404.
// P4 owns this route (DESIGN §10.3: pricing table, ROI calculator, one-Letter-page print) and replaces this file.
// Keep id="contact": pilotHref() links to it when NEXT_PUBLIC_PILOT_EMAIL is unset.
import type { Metadata } from "next";
import { PilotCard } from "@/components/site/PilotCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PILOT, pilotHref, SITE } from "@/content/site";

export const metadata: Metadata = { title: "Pilot" };

const h2 = "font-display text-display-m font-book text-fg print:text-[22px]";
// DESIGN §14: the brief prints on one Letter page (SiteNav and SiteFooter are print:hidden)
const printTight = "print:pt-0! print:pb-3.5!";

export default function PilotPage() {
  return (
    <main id="main">
      <div aria-hidden className="h-20 print:hidden" />
      <Container className={`pt-12 pb-12 lg:pt-16 print:[&_h1]:text-[30px] ${printTight}`}>
        <SectionHeading
          as="h1"
          eyebrow="Pilot"
          title="A paid 8–12 week pilot for independent NYC cardiology practices."
          lead="We're recruiting 1–3 practices to test whether this saves staff time and helps clinicians, and whether it's worth paying for."
        />
      </Container>
      <Container className={`pb-12 ${printTight}`}>
        <PilotCard headingAs="h2" ctas={false} className="max-w-[640px]" />
        <p className="mt-4 max-w-[68ch] text-small text-fg-2">{PILOT.after}</p>
        <p className="mt-2 max-w-[68ch] text-small text-fg-2">{PILOT.beforeRealData}</p>
      </Container>
      <section aria-labelledby="metrics-title">
        <Container className={`py-12 ${printTight}`}>
          <h2 id="metrics-title" className={h2}>
            Metrics we agree on before we start
          </h2>
          <ol className="mt-6 flex max-w-[68ch] list-decimal flex-col gap-2 pl-5 text-body text-fg-2 print:mt-2 print:gap-0.5 print:text-[13px]">
            {PILOT.metrics.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ol>
          <p className="mt-6 max-w-[68ch] text-body font-strong text-fg">{PILOT.goNoGo}</p>
        </Container>
      </section>
      <section id="contact" aria-labelledby="contact-title">
        <Container className={`pt-12 pb-20 lg:pb-32 ${printTight}`}>
          <h2 id="contact-title" className={h2}>
            Talk to us
          </h2>
          {SITE.pilotEmail ? (
            <Button href={pilotHref()} className="mt-6">
              Request a pilot conversation
            </Button>
          ) : (
            <p className="mt-4 max-w-[68ch] text-body text-fg-2">Contact details are shared at the pitch and in our Team Hub.</p>
          )}
        </Container>
      </section>
    </main>
  );
}
