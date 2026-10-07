import type { Metadata } from "next";
import { ArrowRight, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { PageHero } from "@/components/content/PageHero";
import { PricingTable } from "@/components/content/PricingTable";
import { PrintButton } from "@/components/content/PrintButton";
import { RoiCalculator } from "@/components/content/RoiCalculator";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HONESTY, PILOT, pilotHref, SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Pilot",
  description: "A paid 8–12 week pilot for independent NYC cardiology practices: pricing, the metrics we agree on first, and the go/no-go. Prints on one page.",
};

// DESIGN §10.3 + §14: this brief prints on ONE Letter page (SiteNav and SiteFooter are print:hidden). Every band below
// carries print: variants that tighten it; site.spec.ts and shell.spec.ts count the PDF's pages.
const PRINT_PAGE = "@page { size: Letter; margin: 0.4in 0.5in; }";

function Band({ id, eyebrow, title, lead, children, className }: { id: string; eyebrow: string; title: string; lead?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-4 py-16 lg:py-24 print:py-0 print:pt-2.5", className)}>
      <Container className="print:px-0">
        <div className="flex flex-col gap-3 print:gap-0.5">
          <Eyebrow className="print:hidden">{eyebrow}</Eyebrow>
          <h2 id={`${id}-title`} className="max-w-[26ch] font-display text-display-m font-book text-fg print:max-w-none print:text-[15px] print:leading-tight print:font-normal">
            {title}
          </h2>
          {lead ? <p className="max-w-[60ch] text-lead text-fg-2 print:hidden">{lead}</p> : null}
        </div>
        <div className="mt-10 print:mt-1.5">{children}</div>
      </Container>
    </section>
  );
}

/** Hero aside (screen only): the pilot's arc, from agreeing the metrics to the go/no-go. */
function PilotArc() {
  const steps = [
    { when: "Before we start", what: "We agree the metrics and the go/no-go with you." },
    { when: "8–12 weeks", what: "The intake link goes out with your new-patient paperwork. You get the care-team summaries." },
    { when: "At the end", what: "We continue only if it worked. The fee is credited toward an annual contract." },
  ];
  return (
    <div className="relative mx-auto max-w-[30rem] print:hidden lg:mr-0">
      <div className="rounded-xl border border-line bg-surface p-6 shadow-lg sm:p-8">
        <span className="absolute -top-3.5 right-6 -rotate-4 rounded-xs border-[3px] border-double border-brand bg-surface px-2.5 py-1 font-mono text-eyebrow font-medium text-brand-strong uppercase shadow-sm">
          {PILOT.stamp}
        </span>
        <p className="font-mono text-eyebrow text-fg-3 uppercase">How the pilot runs</p>
        <ol className="relative mt-6 flex flex-col gap-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-line-strong">
          {steps.map((s, i) => (
            <li key={s.when} className="relative flex gap-5">
              <span
                aria-hidden
                className={cn(
                  "relative mt-1.5 size-[15px] shrink-0 rounded-full border-2",
                  i === steps.length - 1 ? "border-brand bg-evergreen-50 shadow-[0_0_0_4px_rgb(127_230_197/0.3)]" : "border-brand bg-surface",
                )}
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-mono text-eyebrow text-known-ink uppercase">{s.when}</span>
                <span className="text-body text-fg-2">{s.what}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-7 border-t border-line pt-5 text-small font-strong text-fg">{PILOT.never}</p>
      </div>
    </div>
  );
}

export default function PilotPage() {
  return (
    <main id="main" className="print:text-[11px]">
      <style>{PRINT_PAGE}</style>
      {/* print only: the brief names itself (SiteNav and the footer don't print) */}
      <p className="hidden border-b border-ink pb-1.5 font-mono text-[9px] tracking-[0.08em] text-ink uppercase print:flex print:justify-between">
        <span>Family Health Tree · Pilot brief</span>
        <span>Student prototype · synthetic demo data</span>
      </p>
      <PageHero
        eyebrow="Pilot"
        title="A paid 8–12 week pilot for independent NYC cardiology practices."
        size="l"
        lead="We’re recruiting 1–3 practices to test whether this saves staff time and helps clinicians, and whether it’s worth paying for."
        className="print:[&_h1]:mt-1 print:[&_h1]:text-[21px] print:[&_h1]:leading-tight print:[&_p:first-child]:hidden"
        aside={<PilotArc />}
      >
        <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
          <Button href={pilotHref()} size="lg" iconRight={<ArrowRight />} className="max-sm:w-full">
            Request a pilot conversation
          </Button>
          <PrintButton variant="secondary" size="lg" className="max-sm:w-full" />
        </div>
        <ul className="mt-8 flex flex-wrap gap-2 print:hidden" aria-label="The pilot in brief">
          {["8–12 weeks", "1–3 practices", "$500–1,000 flat", "Credited toward an annual contract"].map((t) => (
            <li key={t} className="rounded-full border border-line-strong bg-surface/70 px-3 py-1 font-mono text-eyebrow text-fg-2 uppercase print:px-2 print:py-0">
              {t}
            </li>
          ))}
        </ul>
      </PageHero>

      <Band
        id="pricing"
        eyebrow="Pricing"
        title="Free for families. A flat fee for practices."
        lead="Patients and relatives never pay. Practices pay a flat fee that never depends on referrals."
        className="bg-white print:bg-transparent"
      >
        <PricingTable className="pt-4 print:pt-0" />
        <p className="mt-6 max-w-[68ch] text-small text-fg-2 print:mt-1.5 print:max-w-none print:text-[10px]">
          <span aria-hidden className="mr-1 text-fg-3">
            *
          </span>
          {PILOT.beforeRealData}
        </p>
      </Band>

      <Band id="metrics" eyebrow="Metrics" title="Metrics we agree on before we start">
        <ol className="grid gap-x-10 gap-y-0 border-t border-line md:grid-cols-2 print:grid-cols-2 print:gap-x-5">
          {PILOT.metrics.map((m, i) => (
            <li key={m} className="flex gap-4 border-b border-line py-4 text-body text-fg-2 print:gap-2 print:py-1 print:text-[10.5px] print:leading-snug">
              <span aria-hidden className="pt-0.5 font-mono text-small text-brand tabular-nums print:pt-0 print:text-[10px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{m}</span>
            </li>
          ))}
        </ol>
        <p className="mt-8 flex max-w-[68ch] gap-3 rounded-lg border-l-[3px] border-brand bg-evergreen-50 px-5 py-4 text-body font-strong text-fg print:mt-2 print:max-w-none print:px-3 print:py-1.5 print:text-[11px]">
          <span className="font-mono text-eyebrow font-medium whitespace-nowrap text-known-ink uppercase print:text-[9px]">Go / no-go</span>
          <span>{PILOT.goNoGo}</span>
        </p>
      </Band>

      <Band
        id="roi"
        eyebrow="ROI calculator"
        title="What the staff time could be worth"
        lead="A rough sense of scale, using your own numbers. Both defaults are assumptions, not results."
        className="bg-white print:bg-transparent"
      >
        <RoiCalculator />
      </Band>

      <Band id="contact" eyebrow="Contact" title="Talk to us" className="pb-24 lg:pb-32 print:pb-0">
        <div className="flex flex-col items-start gap-6 rounded-xl border border-line bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8 print:gap-1 print:border-0 print:p-0 print:shadow-none">
          {SITE.pilotEmail ? (
            <div className="flex flex-col gap-2">
              <p className="text-lead text-fg print:text-[11px]">Tell us about your practice, your EHR and a good time to talk.</p>
              <Button href={pilotHref()} iconLeft={<Mail />} className="self-start print:hidden">
                Request a pilot conversation
              </Button>
            </div>
          ) : (
            <p className="max-w-[48ch] text-lead text-fg print:text-[11px]">Contact details are shared at the pitch and in our Team Hub.</p>
          )}
          <PrintButton variant="secondary" />
        </div>
        <p className="mt-3 hidden text-[9px] text-ink-3 print:block">{HONESTY.team}</p>
      </Band>
    </main>
  );
}
