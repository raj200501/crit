// PLACEHOLDER created by P1 so SiteNav, SiteFooter and the HonestyPill (/privacy#prototype) never 404.
// P4 owns this route (DESIGN §10.2) and replaces this file. Keep id="prototype": HonestyPill links to it.
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { iconFor } from "@/components/ui/iconMap";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MECHANISMS, NEVER, PROTOTYPE_VS_PILOT } from "@/content/site";

export const metadata: Metadata = { title: "Security & privacy" };

const h2 = "font-display text-display-m font-book text-fg";

export default function PrivacyPage() {
  return (
    <main id="main">
      <div aria-hidden className="h-20 print:hidden" />
      <Container className="pt-12 pb-12 lg:pt-16">
        <SectionHeading
          as="h1"
          title="Security & privacy"
          lead="What's true in this prototype today, what changes before any real patient data, and what we'll never do."
        />
      </Container>

      <section id="prototype" aria-labelledby="prototype-title">
        <Container className="py-12">
          <h2 id="prototype-title" className={h2}>
            In this prototype
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {MECHANISMS.map((m) => {
              const Icon = iconFor(m.icon);
              return (
                <li key={m.title} className="flex min-w-0 gap-4 rounded-lg border border-line bg-surface p-5 shadow-xs">
                  {Icon ? (
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-sm bg-sunken text-brand">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </span>
                  ) : null}
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-ui font-strong text-fg">{m.title}</span>
                    <span className="text-small text-fg-2">{m.body}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section id="pilot" aria-labelledby="pilot-title">
        <Container className="py-12">
          <h2 id="pilot-title" className={h2}>
            Before any real patient data
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div className="min-w-0">
              <h3 className="font-mono text-eyebrow text-fg-3 uppercase">Today</h3>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-body text-fg-2">
                {PROTOTYPE_VS_PILOT.today.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="min-w-0">
              <h3 className="font-mono text-eyebrow text-fg-3 uppercase">Before a pilot uses real data</h3>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-body text-fg-2">
                {PROTOTYPE_VS_PILOT.pilot.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-6 max-w-[68ch] text-body text-fg">{PROTOTYPE_VS_PILOT.refusal}</p>
        </Container>
      </section>

      <section id="never" aria-labelledby="never-title">
        <Container className="pt-12 pb-20 lg:pb-32">
          <h2 id="never-title" className={h2}>
            What we&rsquo;ll never do
          </h2>
          <ul className="mt-6 flex max-w-[68ch] list-disc flex-col gap-2 pl-5 text-body text-fg-2">
            {NEVER.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <Button href="/research" variant="link" iconRight={<ArrowRight />} className="mt-8">
            Read the research on privacy and compliance
          </Button>
        </Container>
      </section>
    </main>
  );
}
