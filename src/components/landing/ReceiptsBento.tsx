import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { PedigreeGlyph } from "@/components/ui/PedigreeGlyph";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SourceChip } from "@/components/ui/SourceChip";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { StatusPill } from "@/components/ui/StatusPill";
import type { PersonReceipt, ReceiptLine } from "./receipts";

/** Dad's conflicting glyph as two layered halves (solid evergreen left, dashed amber right) that part by 2 px on hover. */
function SplitGlyph({ p, size }: { p: PersonReceipt; size: number }) {
  const half = (side: "l" | "r") => (
    <span
      aria-hidden
      className={cn(
        "absolute inset-0 transition-transform duration-(--dur-panel) ease-out-quart motion-reduce:transition-none",
        side === "l"
          ? "[clip-path:inset(0_50%_0_0)] group-focus-within/spot:-translate-x-0.5 group-hover/spot:-translate-x-0.5"
          : "[clip-path:inset(0_0_0_50%)] group-focus-within/spot:translate-x-0.5 group-hover/spot:translate-x-0.5",
      )}
    >
      <PedigreeGlyph shape={p.shape} status="conflicting" finding={p.finding} deceased={p.deceased} size={size} className="size-full" />
    </span>
  );
  return (
    <span className="relative block shrink-0" style={{ width: size, height: size }}>
      {half("l")}
      {half("r")}
    </span>
  );
}

function Glyph({ p, size = 40 }: { p: PersonReceipt; size?: number }) {
  return (
    <span className="grid size-14 shrink-0 place-items-center rounded-md border border-line bg-paper">
      <PedigreeGlyph shape={p.shape} status={p.glyph} finding={p.finding} deceased={p.deceased} record={p.record} size={size} />
    </span>
  );
}

function Tile({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <SpotlightCard className={cn("min-w-0 shadow-xs transition-shadow duration-(--dur-hover) hover:shadow-md", className)}>
      <div className="flex h-full flex-col gap-4 p-6">{children}</div>
    </SpotlightCard>
  );
}

function TileTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-title font-strong text-fg">{children}</h3>;
}

function VoiceCard({ line, tone }: { line: ReceiptLine; tone: "known" | "conflict" }) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col gap-2.5 rounded-md border border-line bg-surface p-4 pl-5 shadow-sm",
        "before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full",
        tone === "known" ? "before:bg-known" : "before:bg-[repeating-linear-gradient(to_bottom,var(--color-conflict)_0_5px,transparent_5px_8px)]",
      )}
    >
      <p className="text-lead font-strong text-fg">
        {line.fact}
        {line.age ? (
          <>
            <span className="px-2 font-normal text-fg-3">·</span>
            <span className="tabular-nums">{line.age}</span>
          </>
        ) : null}
      </p>
      <SourceChip kind={line.kind} who={line.who} date={line.date} className="self-start" />
      {line.note ? <p className="text-small text-fg-2 italic">&ldquo;{line.note}&rdquo;</p> : null}
    </div>
  );
}

/** §8.6 Six real product fragments (glyphs, pills, source chips), never icon illustrations. */
export function ReceiptsBento({ receipts }: { receipts: Record<string, PersonReceipt> }) {
  const { dad, dev, pgf: ray, pgm: june, mgf: luis } = receipts;
  const [mom, uncle] = dad.lines.filter((l) => l.kind !== "record");
  const devRecord = dev.lines.find((l) => l.kind === "record");
  const rayNote = ray.lines.find((l) => l.note);
  return (
    <Section theme="paper" aria-labelledby="receipts-title">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="receipts-title"
          eyebrow="Provenance"
          title="Every answer keeps its receipt."
          lead="Known, conflicting, unknown, declined. Shown by shape and words, never by color alone, and never as a risk score."
        />
        <Reveal className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-16 lg:auto-rows-[minmax(12rem,auto)] lg:grid-cols-6">
          {/* 1 · 4×2 */}
          <Tile className="max-lg:order-1 md:col-span-2 lg:col-span-4 lg:row-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <p className="font-mono text-eyebrow text-fg-3 uppercase">Dad · father&rsquo;s side</p>
                <TileTitle>Two voices, both kept.</TileTitle>
              </div>
              <StatusPill status="conflicting" />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center pt-2">
              <span className="relative grid size-28 place-items-center rounded-lg border border-line bg-paper shadow-sm">
                <span aria-hidden className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(closest-side,rgb(127_230_197/0.35),transparent)]" />
                <SplitGlyph p={dad} size={72} />
              </span>
              <p className="mt-5 rounded-full border border-brand/30 bg-known-bg px-3 py-1 font-mono text-eyebrow text-brand-strong uppercase">
                Both kept · names attached
              </p>
              {/* one thread per voice: solid evergreen to Mom's answer, dashed amber to Uncle Dev's */}
              <svg aria-hidden focusable="false" viewBox="0 0 400 40" preserveAspectRatio="none" className="h-9 w-full max-sm:hidden">
                <path d="M196 0 C196 26 100 14 100 40" fill="none" stroke="var(--color-known)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                <path
                  d="M204 0 C204 26 300 14 300 40"
                  fill="none"
                  stroke="var(--color-conflict)"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="mt-4 grid w-full gap-3 sm:mt-0 sm:grid-cols-2 sm:items-start sm:gap-4">
                {mom ? <VoiceCard line={mom} tone="known" /> : null}
                {uncle ? <VoiceCard line={uncle} tone="conflict" /> : null}
              </div>
            </div>
          </Tile>

          {/* 2 · from his own portal record */}
          <Tile className="max-lg:order-3 lg:col-span-2">
            <div className="flex items-center gap-3">
              <Glyph p={dev} />
              <StatusPill status="known" size="sm" />
            </div>
            <TileTitle>From his own portal record.</TileTitle>
            {devRecord ? (
              <div className="flex flex-col gap-2 border-l-2 border-record pl-3">
                <p className="text-ui font-strong text-fg">
                  {devRecord.fact} <span className="px-1 font-normal text-fg-3">·</span> <span className="tabular-nums">{devRecord.age}</span>
                </p>
                <SourceChip kind="record" date={devRecord.date} className="self-start whitespace-normal [&>span]:whitespace-normal" />
              </div>
            ) : null}
            <p className="text-small text-fg-2">Labeled with where it came from. Never &ldquo;verified&rdquo;.</p>
          </Tile>

          {/* 3 · a gap stays visible */}
          <Tile className="max-lg:order-5 lg:col-span-2">
            <div className="flex items-center gap-3">
              <Glyph p={ray} />
              <StatusPill status="unknown" size="sm" />
            </div>
            <TileTitle>A gap stays visible.</TileTitle>
            <p className="text-body text-fg-2">
              <span className="font-strong text-fg">Unknown</span> · Uncle Dev doesn&rsquo;t know.
            </p>
            {rayNote?.note ? <p className="border-l-2 border-line-strong pl-3 text-small text-fg-2 italic">&ldquo;{rayNote.note}&rdquo;</p> : null}
          </Tile>

          {/* 4 · no is an answer */}
          <Tile className="max-lg:order-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <Glyph p={june} />
              <StatusPill status="declined" size="sm" />
            </div>
            <TileTitle>No is an answer.</TileTitle>
            <p className="text-body text-fg-2">Grandma June chose not to share. That choice is kept.</p>
          </Tile>

          {/* 5 · not asked yet */}
          <Tile className="max-lg:order-2 lg:col-span-2">
            <div className="flex items-center gap-3">
              <Glyph p={luis} />
              <StatusPill status="pending" size="sm" />
            </div>
            <TileTitle>Not asked yet.</TileTitle>
            <Button
              href="/tree?person=mgf&mode=invite"
              variant="secondary"
              iconRight={<ArrowRight className="transition-transform duration-(--dur-hover) group-hover/btn:translate-x-0.5 motion-reduce:transition-none" />}
              className="mt-auto self-start"
            >
              Ask Grandpa Luis
            </Button>
          </Tile>

          {/* 6 · built for the chart */}
          <Tile className="max-lg:order-6 md:max-lg:col-span-2 lg:col-span-2">
            <TileTitle>Built for the chart.</TileTitle>
            <figure aria-label="FHIR example" data-theme="night" className="mt-auto rounded-md border border-line bg-night px-4 py-3.5">
              <pre className="font-mono text-caption leading-relaxed break-words whitespace-pre-wrap text-ivory-2">
                <code>
                  <span className="text-lumen">resourceType</span>: <span className="text-ivory">&quot;FamilyMemberHistory&quot;</span>
                  {"\n"}
                  <span className="text-lumen">relationship</span>: <span className="text-ivory">FTH</span>
                  {"\n"}
                  <span className="text-lumen">note</span>: <span className="text-ivory">&quot;reported by Mom&quot;</span>
                </code>
              </pre>
            </figure>
          </Tile>
        </Reveal>
      </div>
    </Section>
  );
}
