"use client";

import { ArrowRight, Download, Plus, Printer, QrCode, Share2, ZoomIn } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Lockup } from "@/components/brand/Lockup";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { HonestyPill } from "@/components/site/HonestyPill";
import { PilotCard } from "@/components/site/PilotCard";
import { ProofList } from "@/components/site/ProofList";
import { SmsBubble } from "@/components/site/SmsBubble";
import { StatGrid } from "@/components/site/StatGrid";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { CheckboxCard } from "@/components/ui/CheckboxCard";
import { Cite } from "@/components/ui/Cite";
import { cn } from "@/components/ui/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Field } from "@/components/ui/Field";
import { FlowDiagram } from "@/components/ui/FlowDiagram";
import { HonestyRibbon } from "@/components/ui/HonestyRibbon";
import { IconButton } from "@/components/ui/IconButton";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Kbd } from "@/components/ui/Kbd";
import { Marquee } from "@/components/ui/Marquee";
import { PedigreeGlyph, type GlyphShape, type GlyphStatus } from "@/components/ui/PedigreeGlyph";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { Popover } from "@/components/ui/Popover";
import { ProductFrame } from "@/components/ui/ProductFrame";
import { RadioSegment } from "@/components/ui/RadioSegment";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Sheet } from "@/components/ui/Sheet";
import { SourceChip } from "@/components/ui/SourceChip";
import { SourceTag } from "@/components/ui/SourceTag";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { StatusLegend } from "@/components/ui/StatusLegend";
import { StatusPill } from "@/components/ui/StatusPill";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { Switch } from "@/components/ui/Switch";
import { TextReveal } from "@/components/ui/TextReveal";
import { toast } from "@/components/ui/Toast";
import { CHIP_EXAMPLES, FAQ, FLOW, STATS } from "@/content/site";

type Tone = "paper" | "night";

const STATUSES = ["known", "conflicting", "unknown", "declined", "pending"] as const;
const SHAPES: GlyphShape[] = ["circle", "square", "diamond"];

const SWATCHES = [
  ["paper", "bg-paper"],
  ["white", "bg-white"],
  ["mist", "bg-mist"],
  ["mist-2", "bg-mist-2"],
  ["canvas", "bg-canvas"],
  ["ink", "bg-ink"],
  ["ink-2", "bg-ink-2"],
  ["ink-3", "bg-ink-3"],
  ["ink-4", "bg-ink-4"],
  ["evergreen-700", "bg-evergreen-700"],
  ["evergreen-600", "bg-evergreen-600"],
  ["evergreen-50", "bg-evergreen-50"],
  ["lumen", "bg-lumen"],
  ["lumen-200", "bg-lumen-200"],
  ["aurora-mint", "bg-aurora-mint"],
  ["aurora-sky", "bg-aurora-sky"],
  ["aurora-lilac", "bg-aurora-lilac"],
  ["night", "bg-night"],
  ["night-900", "bg-night-900"],
  ["night-800", "bg-night-800"],
  ["ivory", "bg-ivory"],
  ["ivory-2", "bg-ivory-2"],
  ["ivory-3", "bg-ivory-3"],
  ["known", "bg-known"],
  ["conflict", "bg-conflict"],
  ["unknown", "bg-unknown"],
  ["declined", "bg-declined"],
  ["pending", "bg-pending"],
  ["record", "bg-record"],
  ["danger", "bg-danger"],
] as const;

const TYPE = [
  ["display-xl", "font-display font-book text-display-xl", "Who, what, and at what age."],
  ["display-l", "font-display font-book text-display-l", "Every answer keeps its receipt."],
  ["display-m", "font-display font-book text-display-m", "Alex’s family"],
  ["stat", "font-display font-book text-stat tabular-nums lining-nums", "57.6%"],
  ["title", "text-title font-strong", "Has Dad ever had any of these?"],
  ["lead", "text-lead text-fg-2", "Relatives fill in their own branch from one text link."],
  ["body", "text-body", "Mom says heart attack at 60. Uncle Dev says angina at about 58. Both are kept."],
  ["ui", "text-ui font-medium", "Add what you know"],
  ["small", "text-small text-fg-2", "Changing the tree clears this."],
  ["caption", "text-caption text-fg-3", "Heart attack · age 60"],
  ["eyebrow", "font-mono text-eyebrow uppercase text-fg-3", "Told by Mom · Sep 27"],
] as const;

function Group({ title, note, children, className }: { title: string; note?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("border-t border-line pt-8", className)}>
      <h3 className="font-mono text-eyebrow text-fg-3 uppercase">{title}</h3>
      {note ? <p className="mt-1 text-small text-fg-3">{note}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return <span className="font-mono text-eyebrow text-fg-3 uppercase">{children}</span>;
}

export function Gallery({ tone }: { tone: Tone }) {
  const night = tone === "night";
  const glyphTone = night ? "night" : "paper";
  const id = (s: string) => `${tone}-${s}`;
  const [check, setCheck] = useState(true);
  const [cards, setCards] = useState<Record<string, boolean>>({ mi: true, faint: false });
  const [age, setAge] = useState("60");
  const [other, setOther] = useState<string>("none");
  const [aud, setAud] = useState<"patient" | "clinician">("patient");
  const [sw, setSw] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [tab, setTab] = useState("tree");
  const [beamOnce, setBeamOnce] = useState(0);
  const sheetBtn = useRef<HTMLButtonElement>(null);

  return (
    <section
      data-theme={tone}
      data-nav-theme={tone}
      aria-labelledby={id("title")}
      className={cn("bg-bg py-16 text-fg lg:py-24", night && "grain")}
    >
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <Eyebrow>{night ? "data-theme=\"night\"" : "data-theme=\"paper\" (default)"}</Eyebrow>
        <h2 id={id("title")} className="mt-2 font-display text-display-m font-book">
          {night ? "Night band" : "Paper"}
        </h2>

        <div className="mt-10 flex flex-col gap-12">
          <Group title="Brand">
            <Row className="gap-6">
              <LogoMark />
              <LogoMark size={40} />
              <Wordmark />
              <Lockup />
              <Lockup href="/" />
              <HonestyPill size="sm" />
              <HonestyPill />
            </Row>
            {!night ? (
              <div className="mt-6 overflow-hidden rounded-sm border border-line">
                <HonestyRibbon />
              </div>
            ) : null}
          </Group>

          <Group title="Color tokens" note="Status chips use *-ink on *-bg; rings use the base status color.">
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10">
              {SWATCHES.map(([name, cls]) => (
                <li key={name} className="flex flex-col gap-1.5">
                  <span className={cn("h-12 rounded-sm border border-line", cls)} />
                  <span className="truncate font-mono text-eyebrow text-fg-3">{name}</span>
                </li>
              ))}
            </ul>
          </Group>

          <Group title="Type scale">
            <div className="flex flex-col gap-5">
              {TYPE.map(([name, cls, sample]) => (
                <div key={name} className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:items-baseline">
                  <Label>{name}</Label>
                  <p className={cls}>{sample}</p>
                </div>
              ))}
            </div>
          </Group>

          <Group title="TextReveal · SectionHeading · Cite · SourceTag · Kbd">
            <TextReveal
              as="p"
              text="Turn “heart problems run in the family” into who, what, and at what age."
              accent={{ text: "“heart problems run in the family”", style: "italic-muted" }}
              animate="after-accent"
              className="max-w-[18ch] font-display text-display-l font-book"
            />
            <div className="mt-10">
              <SectionHeading eyebrow="Provenance" title="Every answer keeps its receipt." lead="Known, reports disagree, unknown, chose not to share. Shown by shape and words, never by color alone, and never as a risk score." />
            </div>
            <Row className="mt-8 gap-6">
              <p className="text-body">
                57.6% {STATS[0].label}
                <Cite n={87} />
              </p>
              <p className="text-body">
                Two sources
                <Cite n={[72, 83]} />
              </p>
              <SourceTag cite={87}>Sweden · 25,302 people</SourceTag>
              <span className="text-small text-fg-2">
                <Kbd>+</Kbd> <Kbd>−</Kbd> <Kbd>0</Kbd> <Kbd>C</Kbd> zoom, fit, center
              </span>
            </Row>
          </Group>

          <Group title="Button" note="Rows: variants. Columns: sizes, then static hover, focus, disabled and loading.">
            <div className="flex flex-col gap-4">
              {(["primary", "secondary", "ghost", "link", "danger", "brand"] as const).map((v) => (
                <Row key={v}>
                  <span className="w-20">
                    <Label>{v}</Label>
                  </span>
                  <Button variant={v} size="sm">
                    Small
                  </Button>
                  <Button variant={v}>Medium</Button>
                  <Button variant={v} size="lg" iconRight={<ArrowRight />}>
                    Large
                  </Button>
                  <Button
                    variant={v}
                    className={cn(
                      v === "primary" && "bg-cta-hover [--ui-glow:rgb(127_230_197/0.85)]",
                      (v === "secondary" || v === "ghost") && "bg-sunken",
                      v === "danger" && "bg-danger-bg",
                      v === "brand" && "bg-evergreen-700",
                    )}
                  >
                    Hover
                  </Button>
                  <Button variant={v} className="outline-2 outline-offset-2 outline-focus">
                    Focus
                  </Button>
                  <Button variant={v} disabled>
                    Disabled
                  </Button>
                  <Button variant={v} loading>
                    Loading
                  </Button>
                </Row>
              ))}
              <Row>
                <span className="w-20">
                  <Label>links</Label>
                </span>
                <Button href="/tree" iconLeft={<Plus />}>
                  Internal href
                </Button>
                <Button href="https://launch.smarthealthit.org" variant="secondary" external>
                  External
                </Button>
                <Button variant="link" href="/research" iconRight={<ArrowRight />}>
                  Read the research
                </Button>
                <Button fullWidth variant="secondary" className="sm:w-auto">
                  Full width on phones
                </Button>
              </Row>
            </div>
          </Group>

          <Group title="IconButton">
            <Row>
              <IconButton label="Zoom in" icon={<ZoomIn />} size="sm" />
              <IconButton label="Print" icon={<Printer />} />
              <IconButton label="Share" icon={<Share2 />} variant="secondary" />
              <IconButton label="Show QR code" icon={<QrCode />} variant="primary" />
              <IconButton label="Download" icon={<Download />} variant="secondary" aria-pressed />
              <IconButton label="Download (disabled)" icon={<Download />} variant="secondary" disabled />
            </Row>
          </Group>

          <Group title="Badge · StatusPill · SourceChip">
            <Row>
              <Badge>Synthetic demo data</Badge>
              <Badge tone="brand">Reviewed</Badge>
              <Badge tone="record">From a portal record</Badge>
              <Badge tone="danger">Can’t be undone</Badge>
              <Badge mono>Prototype</Badge>
            </Row>
            <Row className="mt-4">
              {STATUSES.map((s) => (
                <StatusPill key={s} status={s} />
              ))}
            </Row>
            <Row className="mt-3">
              {STATUSES.map((s) => (
                <StatusPill key={s} status={s} size="sm" context="clinical" />
              ))}
            </Row>
            <Row className="mt-4">
              <SourceChip kind="relative" who="Mom" date="2026-09-27" />
              <SourceChip kind="self" date="2026-09-27" />
              <SourceChip kind="patient" who="Alex" date="2026-09-28" />
              <SourceChip kind="record" date="2009-03-14" />
              <SourceChip kind="relative" who="Uncle Dev" date="2026-09-28" onOpen={() => toast({ title: "Provenance", body: "Told by Uncle Dev on Sep 28." })} />
            </Row>
          </Group>

          <Group title="PedigreeGlyph" note="Ring = certainty · fill = heart condition reported · slash = passed away · square chip = portal record · arrow = the patient.">
            <div className="flex flex-col gap-4">
              {SHAPES.map((shape) => (
                <Row key={shape} className="gap-5">
                  <span className="w-20">
                    <Label>{shape}</Label>
                  </span>
                  {(["known", "conflicting", "unknown", "declined", "pending", "self"] as GlyphStatus[]).map((s) => (
                    <PedigreeGlyph key={s} shape={shape} status={s} tone={glyphTone} title={`${shape}, ${s}`} />
                  ))}
                  <PedigreeGlyph shape={shape} status="known" finding tone={glyphTone} title={`${shape}, heart condition reported`} />
                  <PedigreeGlyph shape={shape} status="conflicting" finding deceased tone={glyphTone} title={`${shape}, reports disagree, passed away`} />
                  <PedigreeGlyph shape={shape} status="known" finding record tone={glyphTone} title={`${shape}, from a portal record`} />
                  <PedigreeGlyph shape={shape} status="unknown" deceased tone={glyphTone} size={48} title={`${shape}, unknown, passed away, 48px`} />
                </Row>
              ))}
              <Row className="gap-5">
                <span className="w-20">
                  <Label>print</Label>
                </span>
                <span className="inline-flex gap-3 rounded-sm bg-white p-2">
                  {(["known", "conflicting", "unknown", "declined", "pending", "self"] as GlyphStatus[]).map((s) => (
                    <PedigreeGlyph key={s} shape="square" status={s} finding={s === "known"} tone="print" />
                  ))}
                </span>
                <svg viewBox="0 0 120 40" width={180} height={60} aria-label="Glyphs drawn inside a parent SVG" role="img">
                  <line x1={20} y1={20} x2={100} y2={20} stroke="currentColor" strokeOpacity={0.3} />
                  <PedigreeGlyph as="g" x={20} y={20} size={24} shape="square" status="known" finding tone={glyphTone} />
                  <PedigreeGlyph as="g" x={60} y={20} size={24} shape="circle" status="conflicting" tone={glyphTone} />
                  <PedigreeGlyph as="g" x={100} y={20} size={24} shape="diamond" status="self" tone={glyphTone} />
                </svg>
              </Row>
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <StatusLegend tone={glyphTone} label={`Legend (${tone})`} />
              <StatusLegend tone={glyphTone} compact context="clinical" label={`Compact legend (${tone})`} />
            </div>
          </Group>

          <Group title="Card tiers · bezel · interactive">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(["section", "floating", "overlay", "document", "window"] as const).map((t) => (
                <Card key={t} tier={t} className="p-5">
                  <Label>{t}</Label>
                  <p className="mt-2 text-small text-fg-2">Tier “{t}”.</p>
                </Card>
              ))}
              <Card tier="floating" bezel className="p-5">
                <Label>floating + bezel</Label>
                <p className="mt-2 text-small text-fg-2">Inner radius = outer − padding.</p>
              </Card>
              <Card tier="section" interactive className="p-5">
                <Label>interactive</Label>
                <p className="mt-2 text-small text-fg-2">Lifts −2 px on hover and focus-within.</p>
                <Button size="sm" variant="secondary" className="mt-3">
                  Focus me
                </Button>
              </Card>
              <SpotlightCard className="p-5">
                <Label>SpotlightCard</Label>
                <p className="mt-2 text-small text-fg-2">Move the mouse over me.</p>
              </SpotlightCard>
            </div>
          </Group>

          <Group
            title="Paper inside this band"
            note={'A document card (data-theme="paper") keeps paper tokens and opts out of dark: utilities, even inside a night band.'}
          >
            <Card tier="document" className="flex max-w-xl flex-col gap-3 p-5">
              <Row>
                <PedigreeGlyph shape="square" status="known" finding tone="paper" title="Dad, heart condition reported" />
                <PedigreeGlyph shape="circle" status="known" finding record tone="paper" title="Grandma, from a portal record" />
                <Badge tone="brand">Reviewed</Badge>
                <Badge tone="record">From a portal record</Badge>
                <SourceChip kind="record" date="2009-03-14" />
              </Row>
              <p className="text-small text-ink-2">
                Atrial fibrillation, <span className="font-medium text-record">from a portal record</span> (demo sandbox). On problem list since 2009.
              </p>
            </Card>
          </Group>

          <Group title="BorderBeam" note="loop: rotates only while in view. once: one 2.4 s lap, then a static gradient border.">
            <div className="grid gap-6 md:grid-cols-2">
              <BorderBeam contentClassName="p-6">
                <Label>loop</Label>
                <p className="mt-2 text-small text-fg-2">Used on the landing “two readers” sheet.</p>
              </BorderBeam>
              <div className="flex flex-col gap-3">
                <BorderBeam key={beamOnce} mode="once" active={beamOnce > 0} radius={4} contentClassName="p-6">
                  <Label>once</Label>
                  <p className="mt-2 text-small text-fg-2">Used on the reviewed /summary sheet.</p>
                </BorderBeam>
                <Button size="sm" variant="secondary" onClick={() => setBeamOnce((n) => n + 1)} className="self-start">
                  Mark reviewed (run once)
                </Button>
              </div>
            </div>
          </Group>

          <Group title="ProductFrame · PhoneFrame">
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <ProductFrame
                title="family-health-tree · demo"
                tabs={[
                  { id: "tree", label: "Tree" },
                  { id: "summary", label: "My summary" },
                  { id: "care", label: "Care-team version" },
                ]}
                value={tab}
                onChange={setTab}
                actions={
                  <Button variant="link" size="sm" href="/tree">
                    Open the full demo
                  </Button>
                }
              >
                <div className="grid size-full place-items-center bg-canvas bg-dots p-6 text-center text-small text-ink-2">
                  <span>
                    Tab: <strong className="text-fg">{tab}</strong> (the real TreeView / SummaryDocument go here)
                  </span>
                </div>
              </ProductFrame>
              <PhoneFrame label="A relative’s phone showing the invite welcome screen">
                <div className="flex h-full flex-col gap-4 px-5 pt-14 pb-6">
                  <Eyebrow>For Grandpa Luis</Eyebrow>
                  <p className="font-display text-[1.75rem] leading-tight">Alex asked for your help.</p>
                  <p className="text-small text-ink-2">A few questions about you and a few relatives. Skip anything.</p>
                  <div className="mt-auto rounded-full bg-ink py-3 text-center text-ui font-medium text-white">Start</div>
                </div>
              </PhoneFrame>
            </div>
          </Group>

          <Group title="Marquee">
            <Marquee items={CHIP_EXAMPLES} label={`Examples the questions use (${tone})`} />
          </Group>

          <Group title="StatTicker / StatGrid" note="Server renders the final value; counts once when scrolled into view.">
            <StatGrid stats={STATS} />
            <div className="mt-10">
              <StatGrid stats={STATS.slice(0, 2)} animated={false} className="lg:grid-cols-2" />
            </div>
          </Group>

          <Group title="FlowDiagram" note="Two pulse cycles, then it stops. Replay restarts. Phones get a vertical list.">
            <FlowDiagram {...FLOW} />
          </Group>

          <Group title="Accordion · Popover">
            <div className="grid gap-10 lg:grid-cols-2">
              <Accordion items={FAQ.slice(0, 3)} />
              <div className="flex flex-col items-start gap-4">
                <Popover trigger={{ label: "Viewing as Alex (patient)" }} label={`Demo views (${tone})`}>
                  {({ close }) => (
                    <ul className="flex flex-col">
                      {["Patient · family tree", "Patient · pre-visit summary", "Practice · care-team view"].map((t) => (
                        <li key={t}>
                          <button type="button" onClick={close} className="flex min-h-11 w-full items-center rounded-sm px-3 text-left text-ui hover:bg-sunken">
                            {t}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Popover>
                <Popover trigger={{ label: "Popover (end-aligned)", variant: "ghost" }} align="end" label={`Provenance (${tone})`}>
                  <div className="max-w-xs p-3 text-small text-fg-2">
                    <SourceChip kind="record" date="2009-03-14" />
                    <p className="mt-2">On problem list since 2009. A record date is often when a problem was added to the list, not when it was diagnosed.</p>
                  </div>
                </Popover>
              </div>
            </div>
          </Group>

          <Group title="Forms">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="flex flex-col gap-5">
                <Field label="Your first name" htmlFor={id("name")} hint="Only stored in this browser.">
                  <Input id={id("name")} defaultValue="Alex" autoComplete="off" />
                </Field>
                <Field label="Age" htmlFor={id("age")} error="Enter an age between 0 and 120." announceError>
                  <Input id={id("age")} inputMode="numeric" placeholder="Age" defaultValue="160" />
                </Field>
                <Field label="Note" htmlFor={id("note")}>
                  <Textarea id={id("note")} defaultValue="I think it was chest pain, not a full heart attack." />
                </Field>
                <Field label="Side of the family" htmlFor={id("side")}>
                  <Select id={id("side")} defaultValue="mother">
                    <option value="mother">Mother’s side</option>
                    <option value="father">Father’s side</option>
                  </Select>
                </Field>
                <Field label="Disabled" htmlFor={id("dis")}>
                  <Input id={id("dis")} disabled defaultValue="Can’t edit" />
                </Field>
                <Checkbox label="I’m 18 or older." checked={check} onChange={(e) => setCheck(e.target.checked)} />
                <Switch label="Mark reviewed by clinician (demo, this browser only)" checked={sw} onChange={setSw} />
                <Switch label="Has passed away" checked={false} onChange={() => {}} disabled />
              </div>
              <div className="flex flex-col gap-3">
                <CheckboxCard
                  checked={cards.mi}
                  onChange={(v) => setCards((c) => ({ ...c, mi: v }))}
                  title="Heart attack or blocked arteries"
                  description="Stent, bypass surgery, angina"
                >
                  <Field label="About how old were they?" htmlFor={id("mi-age")}>
                    <Input id={id("mi-age")} inputMode="numeric" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="max-w-32" />
                  </Field>
                </CheckboxCard>
                <CheckboxCard checked={cards.faint} onChange={(v) => setCards((c) => ({ ...c, faint: v }))} title="Unexplained fainting" description="Passing out during exercise or for no clear reason" />
                <CheckboxCard checked={false} onChange={() => {}} title="Disabled option" disabled />
                <RadioSegment
                  name={id("other")}
                  label="Other answers"
                  value={other}
                  onChange={setOther}
                  options={[
                    { value: "none", label: "None of these" },
                    { value: "dont-know", label: "I don’t know" },
                    { value: "decline", label: "I’d rather not share" },
                  ]}
                />
                <SegmentedControl
                  label="Who reads it"
                  value={aud}
                  onChange={setAud}
                  options={[
                    { value: "patient", label: "My summary" },
                    { value: "clinician", label: "Care-team version" },
                  ]}
                />
                <SegmentedControl
                  size="sm"
                  label="Story chapter"
                  value="build"
                  onChange={() => {}}
                  options={[
                    { value: "build", label: "Build" },
                    { value: "invite", label: "Invite" },
                    { value: "answers", label: "Answers" },
                    { value: "page", label: "Page" },
                  ]}
                />
              </div>
            </div>
          </Group>

          <Group title="Sheet · StickyActionBar · Toast">
            <Row>
              <Button ref={sheetBtn} variant="secondary" onClick={() => setSheet(true)}>
                Open sheet
              </Button>
              <Button variant="secondary" onClick={() => toast({ title: "Copied" })}>
                Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  toast({ title: "Grandpa Luis answered", body: "Atrial fibrillation, from a portal record (demo)", tone: "brand", action: { label: "View", onClick: () => {} } })
                }
              >
                Toast with action
              </Button>
            </Row>
            <Sheet open={sheet} onClose={() => setSheet(false)} label={`Example sheet (${tone})`} tone={tone} returnFocusTo={sheetBtn} footer={<Button fullWidth onClick={() => setSheet(false)}>Done</Button>}>
              <h4 className="pr-10 font-display text-display-m font-book">Dad</h4>
              <p className="mt-2 text-body text-fg-2">Bottom sheet under 1024 px (drag the grabber; snaps at 55% and 92%), right panel at ≥ 1024 px. Esc closes and focus returns.</p>
              <div className="mt-4 flex flex-col gap-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <Card key={i} className="p-4 text-small text-fg-2">
                    Report row {i + 1}
                  </Card>
                ))}
              </div>
            </Sheet>
            <div className="mt-6 h-48 overflow-y-auto rounded-md border border-line bg-surface" data-lenis-prevent>
              <div className="p-4 text-small text-fg-2">
                <p>Scroll this pane: the bar sticks to its bottom.</p>
                <div className="h-56" />
              </div>
              <StickyActionBar>
                <Button fullWidth>Next</Button>
              </StickyActionBar>
            </div>
            <div className="mt-6 max-w-sm">
              <Label>static toast</Label>
              <div className="glass mt-2 flex items-start gap-3 rounded-md border border-line p-3.5 shadow-lg">
                <div>
                  <p className="text-ui font-strong">Grandpa Luis answered</p>
                  <p className="mt-0.5 text-small text-fg-2">Atrial fibrillation, from a portal record (demo)</p>
                  <span className="mt-1.5 inline-block text-small font-medium text-brand">View</span>
                </div>
              </div>
            </div>
          </Group>

          <Group title="Marketing blocks · PilotCard · SmsBubble · ProofList">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="flex flex-col gap-6">
                <ProofList />
                <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
                  <SmsBubble from="them">Cardiology Associates: before your visit on Oct 14, you can put together your family history here: [link]</SmsBubble>
                  <SmsBubble from="me" preview={{ title: "Alex asked for your help", site: "Family Health Tree" }}>
                    Hi, it’s Alex. I’m putting together our family health history and would love your help. Here’s a private link; you can answer, skip, or say no.
                  </SmsBubble>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <PilotCard />
                <PilotCard compact ctas={false} />
              </div>
            </div>
          </Group>
        </div>
      </div>
    </section>
  );
}
