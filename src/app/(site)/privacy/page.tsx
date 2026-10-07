import type { Metadata } from "next";
import { ArrowRight, Check, CircleX, Clock, Eye, Lock, ShieldCheck, Trash, UserCheck, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { DocsLayout } from "@/components/content/DocsLayout";
import { glyphFor, inviteFragment, report, SITE_HOST, viewOf } from "@/components/content/demoFamily";
import { PageHero } from "@/components/content/PageHero";
import type { TocItem } from "@/components/content/Toc";
import { UrlBarVisual } from "@/components/content/UrlBarVisual";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { iconFor } from "@/components/ui/iconMap";
import { PedigreeGlyph } from "@/components/ui/PedigreeGlyph";
import { SourceChip } from "@/components/ui/SourceChip";
import { StatusPill } from "@/components/ui/StatusPill";
import { MECHANISMS, NEVER, PROTOTYPE_VS_PILOT } from "@/content/site";

export const metadata: Metadata = {
  title: "Security & privacy",
  description: "Stemma's security and privacy: what's true in this prototype today, what changes before any real patient data, and what we'll never do.",
};

// Hard-coded on purpose (DESIGN §10.2). Keep in sync with next.config.ts: site.spec.ts compares this list with the
// Content-Security-Policy header the server actually sends.
const CSP: { directive: string; value: string; plain: string }[] = [
  { directive: "default-src", value: "'self'", plain: "Anything not listed below: this site only." },
  { directive: "script-src", value: "'self' 'unsafe-inline'", plain: "Scripts from this site only (plus its own inline boot code)." },
  { directive: "style-src", value: "'self' 'unsafe-inline'", plain: "Styles from this site only." },
  { directive: "img-src", value: "'self' data: blob:", plain: "Images from this site, or generated in the page (the QR code)." },
  { directive: "font-src", value: "'self'", plain: "Fonts are served from this site, never a font CDN." },
  { directive: "connect-src", value: "'self' https://launch.smarthealthit.org https://fhir.epic.com", plain: "This site, the public SMART sandbox, and Epic’s developer sandbox (fhir.epic.com, allowed as a backup and not used today). Nothing else." },
  { directive: "object-src", value: "'none'", plain: "No plugins." },
  { directive: "base-uri", value: "'self'", plain: "Links can't be re-pointed to another site." },
  { directive: "form-action", value: "'self'", plain: "Forms can only submit to this site." },
  { directive: "frame-ancestors", value: "'none'", plain: "No other site can frame these pages." },
  { directive: "upgrade-insecure-requests", value: "", plain: "Always HTTPS." },
];

const TOC: TocItem[] = [
  { id: "prototype", text: "In this prototype", level: 2 },
  { id: "mychart", text: "The patient-portal demo", level: 2 },
  { id: "relatives", text: "Relatives stay in control", level: 2 },
  { id: "pilot", text: "Before any real patient data", level: 2 },
  { id: "never", text: "What we’ll never do", level: 2 },
  { id: "delete", text: "Delete it", level: 2 },
];

function Part({ id, eyebrow, title, lead, children }: { id: string; eyebrow: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-14 border-t border-line pt-14 pb-16 first-of-type:border-t-0 first-of-type:pt-0 lg:scroll-mt-5">
      <p className="font-mono text-eyebrow text-brand uppercase">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-3 max-w-[24ch] font-display text-display-m font-book text-fg">
        {title}
      </h2>
      {lead ? <p className="mt-4 max-w-[62ch] text-lead text-fg-2">{lead}</p> : null}
      <div className="mt-10 flex flex-col gap-10">{children}</div>
    </section>
  );
}

function H3({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-title font-strong text-fg", className)}>{children}</h3>;
}

/** Hero aside: the prototype's spec sheet, as a night window. */
function AtAGlance() {
  const rows: [string, string][] = [
    ["Account", "None"],
    ["Database", "None"],
    ["Analytics, ads", "None"],
    ["Your tree lives in", "This browser"],
    ["Link data", "After the #, never sent"],
    ["The family", "Made up"],
  ];
  return (
    <Card tier="window" bezel bezelClassName="mx-auto max-w-[30rem] lg:mr-0" className="p-6 sm:p-8">
      <p className="flex items-center justify-between font-mono text-eyebrow text-fg-3 uppercase">
        <span>This prototype · today</span>
        <span className="flex items-center gap-1.5 text-brand">
          <span aria-hidden className="size-1.5 rounded-full bg-brand shadow-[0_0_8px_var(--color-lumen)]" />
          Synthetic
        </span>
      </p>
      <dl className="mt-6 flex flex-col">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-3 border-t border-line py-3 first:border-t-0">
            <dt className="shrink-0 text-small text-fg-2">{k}</dt>
            <span aria-hidden className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-line-strong" />
            <dd className="text-right font-mono text-small text-fg">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default function PrivacyPage() {
  const { fragment, payload } = inviteFragment("mom");
  const dev = report("r-dev-record");
  const june = viewOf("pgm");

  return (
    <main id="main">
      <PageHero
        eyebrow="Trust"
        title="Security & privacy"
        // shell.spec (P1) reads this h1 with toHaveText, so it stays a plain heading
        reveal={false}
        lead="What’s true in this prototype today, what changes before any real patient data, and what we’ll never do."
        aside={<AtAGlance />}
      >
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          <Button href="#prototype" variant="link" iconRight={<ArrowRight />}>
            How the prototype handles data
          </Button>
          <Button href="#never" variant="link" iconRight={<ArrowRight />}>
            What we&rsquo;ll never do
          </Button>
        </div>
      </PageHero>

      <section aria-label="Security and privacy details" data-theme="paper" className="bg-paper py-16 lg:py-24">
        <DocsLayout toc={TOC}>
          {/* ---------- In this prototype ---------- */}
          <Part
            id="prototype"
            eyebrow="Today"
            title="In this prototype"
            lead="No account, no database, no analytics. The demo family is made up, and everything you add stays in this browser."
          >
            <ul className="grid gap-4 sm:grid-cols-2">
              {MECHANISMS.map((m) => {
                const Icon = iconFor(m.icon);
                return (
                  <li key={m.title} className="flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-5 shadow-xs">
                    {Icon ? (
                      <span aria-hidden className="grid size-10 place-items-center rounded-sm bg-evergreen-50 text-brand">
                        <Icon className="size-5" strokeWidth={1.75} />
                      </span>
                    ) : null}
                    <span className="text-ui font-strong text-fg">{m.title}</span>
                    <span className="text-small text-fg-2">{m.body}</span>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col gap-5">
              <H3>What the # holds, and who sees it</H3>
              <p className="max-w-[62ch] text-body text-fg-2">
                Invite, reply and summary links put their data after the <span className="font-mono text-fg">#</span>. Browsers keep that part to
                themselves: it never reaches a server, and pages send no referrer.
              </p>
              <UrlBarVisual host={SITE_HOST} path="/invite" fragment={fragment} decoded={payload as unknown as Record<string, unknown>} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-line bg-surface p-5 shadow-xs">
                <p className="font-mono text-small text-fg">Referrer-Policy: no-referrer</p>
                <p className="mt-2 text-small text-fg-2">Sent with every page, so a link you follow from here doesn&rsquo;t learn which page you were on.</p>
              </div>
              <div className="rounded-lg border border-line bg-surface p-5 shadow-xs">
                <p className="flex items-center gap-2 text-ui font-strong text-fg">
                  <ShieldCheck aria-hidden className="size-4 text-brand" strokeWidth={2} />
                  Inputs from links are validated before use.
                </p>
                <p className="mt-2 text-small text-fg-2">A link that doesn&rsquo;t decode, or a reply to an invite you never sent, is refused.</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <H3>The content security policy</H3>
              <p className="max-w-[62ch] text-body text-fg-2">Every page carries this header. It is the whole list of places this site may load from or talk to.</p>
              <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-xs">
                <p className="border-b border-line bg-sunken px-5 py-2.5 font-mono text-eyebrow text-fg-3 uppercase">Content-Security-Policy</p>
                <dl data-csp className="divide-y divide-line">
                  {CSP.map((c) => (
                    <div key={c.directive} className="grid gap-1 px-5 py-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-6">
                      <dt className="min-w-0 font-mono text-small [overflow-wrap:anywhere]">
                        <span data-csp-directive className="text-fg">
                          {c.directive}
                        </span>
                        {c.value ? (
                          <>
                            {" "}
                            <span data-csp-value className="text-known-ink">
                              {c.value}
                            </span>
                          </>
                        ) : null}
                      </dt>
                      <dd className="text-small text-fg-2">{c.plain}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Part>

          {/* ---------- MyChart ---------- */}
          <Part
            id="mychart"
            eyebrow="Patient portals"
            title="The patient-portal demo"
            lead="A real SMART on FHIR standalone launch (OAuth 2 with PKCE) against the public SMART Health IT sandbox, with made-up patients."
          >
            <div className="grid grid-cols-[minmax(0,1fr)] gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
              <ul className="flex flex-col gap-4 text-body text-fg-2">
                <li className="flex gap-3">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-known" strokeWidth={2.5} />
                  <span>The relative sees their problem list and ticks what to share. Everything else is discarded on that page.</span>
                </li>
                <li className="flex gap-3">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-known" strokeWidth={2.5} />
                  <span>
                    Shared facts are labeled &ldquo;from a portal record&rdquo;, with &ldquo;on problem list since {dev.record?.recordedDate?.slice(0, 4) ?? "2009"}&rdquo;. Never
                    &ldquo;verified&rdquo;.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-known" strokeWidth={2.5} />
                  <span>A record date is often when a problem was added to the list, not when it was diagnosed.</span>
                </li>
              </ul>
              <figure className="rounded-lg border border-line bg-surface p-5 shadow-sm">
                <figcaption className="font-mono text-eyebrow text-fg-3 uppercase">A relative&rsquo;s portal · demo sandbox · made-up record</figcaption>
                <ul className="mt-4 flex flex-col gap-2">
                  <li className="flex items-center gap-3 rounded-md border border-known/40 bg-known-bg/60 px-3.5 py-2.5">
                    <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-xs bg-evergreen-600 text-white">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className="min-w-0 flex-1 text-small text-fg">
                      <span className="font-strong">{dev.condition}</span> · on problem list since {dev.record?.recordedDate?.slice(0, 4)}
                    </span>
                    <span className="sr-only">(shared)</span>
                  </li>
                  {["Essential hypertension · since 2015", "Seasonal allergies · since 1998"].map((t) => (
                    <li key={t} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-line px-3.5 py-2.5">
                      <span aria-hidden className="size-5 shrink-0 rounded-xs border-2 border-ink-4" />
                      <span className="min-w-0 flex-1 text-small text-fg-2">{t}</span>
                      <span className="basis-full pl-8 font-mono text-eyebrow text-fg-3 uppercase sm:basis-auto sm:pl-0 sm:whitespace-nowrap">Not shared · not stored</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                  <span className="text-small text-fg-2">On the tree it reads:</span>
                  <SourceChip kind="record" date={dev.record?.recordedDate} />
                </div>
              </figure>
            </div>
          </Part>

          {/* ---------- Relatives ---------- */}
          <Part id="relatives" eyebrow="Relatives" title="Relatives stay in control" lead="Every relative answers for themselves, from their own phone, and can say no.">
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: UserCheck, title: "An 18+ check comes first.", body: "Before any question, the relative confirms they're an adult." },
                {
                  icon: Lock,
                  title: "“I’d rather not share” is always there.",
                  body: "And only that person can decline for themselves. Nobody declines on someone else's behalf.",
                },
                { icon: UserRound, title: "Answers carry their name.", body: "Every fact says who told it and when, so nothing is anonymous or blended." },
                {
                  icon: Eye,
                  title: "They see who will see it.",
                  body: "The patient, and the patient's care team if the patient shares the summary.",
                },
              ].map((r) => (
                <li key={r.title} className="flex min-w-0 gap-4 rounded-lg border border-line bg-surface p-5 shadow-xs">
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-sm bg-evergreen-50 text-brand">
                    <r.icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-ui font-strong text-fg">{r.title}</span>
                    <span className="text-small text-fg-2">{r.body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-mist px-5 py-4">
              <PedigreeGlyph {...glyphFor(june)} size={36} title={`${june.person.label}: chose not to share`} />
              <p className="min-w-0 flex-1 text-body text-fg">
                {june.person.label} chose not to share. That choice is kept, on the tree and on the summary.
              </p>
              <StatusPill status="declined" />
            </div>
          </Part>

          {/* ---------- Pilot ---------- */}
          <Part id="pilot" eyebrow="Before a pilot" title="Before any real patient data" lead="The prototype is built so that nothing real ever needs to touch it. A pilot changes that, so it starts with these.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-line bg-surface p-5 shadow-xs sm:p-6">
                <p className="font-mono text-eyebrow text-fg-3 uppercase">Prototype today</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {PROTOTYPE_VS_PILOT.today.map((t) => (
                    <li key={t} className="flex gap-3 text-body text-fg-2">
                      <Check aria-hidden className="mt-1 size-4 shrink-0 text-known" strokeWidth={2.5} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-line bg-surface p-5 shadow-xs sm:p-6">
                <p className="font-mono text-eyebrow text-fg-3 uppercase">Before any real patient data</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {PROTOTYPE_VS_PILOT.pilot.map((t) => (
                    <li key={t} className="flex gap-3 text-body text-fg-2">
                      <Clock aria-hidden className="mt-1 size-4 shrink-0 text-fg-3" strokeWidth={2} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex max-w-[62ch] flex-col gap-4 text-body text-fg-2">
              <p>
                In the pilot, we will operate as a HIPAA business associate: we&rsquo;ll sign BAAs with practices and use only infrastructure vendors that
                sign BAAs with us.
              </p>
              <p>The pilot is being designed for the FTC Health Breach Notification Rule and state health-privacy laws (WA, CA, CT, NV; NY pending).</p>
            </div>
            <p className="max-w-[30ch] border-l-2 border-brand pl-5 font-display text-[1.625rem] leading-snug font-light text-fg italic">
              {PROTOTYPE_VS_PILOT.refusal}
            </p>
          </Part>

          {/* ---------- Never ---------- */}
          <Part id="never" eyebrow="Never" title="What we’ll never do">
            <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface shadow-xs">
              {NEVER.map((t) => (
                <li key={t} className="flex gap-4 px-5 py-4 text-body text-fg">
                  <CircleX aria-hidden className="mt-1 size-5 shrink-0 text-fg-3" strokeWidth={1.75} />
                  <span>
                    <span className="sr-only">We will never </span>
                    {t}
                  </span>
                </li>
              ))}
            </ul>
            <p className="max-w-[62ch] rounded-lg border border-line bg-mist p-5 text-body text-fg-2">
              <span className="font-strong text-fg">A note on GINA.</span> Life, disability and long-term-care insurers can legally ask about family
              history. We never share with them.
            </p>
          </Part>

          {/* ---------- Delete ---------- */}
          <Part id="delete" eyebrow="Your copy" title="Delete it">
            <div className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5 shadow-xs sm:flex-row sm:items-center sm:p-6">
              <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-md bg-danger-bg text-danger">
                <Trash className="size-5" strokeWidth={1.75} />
              </span>
              <p className="min-w-0 flex-1 text-body text-fg-2">
                Everything lives in this browser. On your tree, &ldquo;Delete everything stored here&rdquo; removes it.
              </p>
              <Button href="/tree" variant="secondary" iconRight={<ArrowRight />}>
                Open your tree
              </Button>
            </div>
          </Part>

          <p className="border-t border-line pt-8">
            <Button href="/research#2-privacy-and-compliance" variant="link" iconRight={<ArrowRight />} className="h-auto max-w-full text-left whitespace-normal">
              Read the research on privacy and compliance
            </Button>
          </p>
        </DocsLayout>
      </section>
    </main>
  );
}
