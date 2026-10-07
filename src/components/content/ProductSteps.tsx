import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { SmsBubble } from "@/components/site/SmsBubble";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { PedigreeGlyph } from "@/components/ui/PedigreeGlyph";
import { SourceChip } from "@/components/ui/SourceChip";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { DEMO, glyphFor, inviteFragment, inviteMessage, report, SITE_HOST, viewOf } from "./demoFamily";
import { DocPreview } from "./DocPreview";

/** Step 1: the fixed slots, father's side and mother's side, all "not asked yet"; the mother's side is where you start. */
function SideOfFamily() {
  const g = (x: number, y: number, shape: "square" | "circle") => <PedigreeGlyph as="g" x={x} y={y} size={26} shape={shape} status="pending" />;
  const line = "stroke-line-strong";
  return (
    <div className="flex h-full flex-col justify-center px-5 py-4 sm:px-8">
      <div aria-hidden className="mb-2 grid grid-cols-2 gap-3 font-mono text-eyebrow text-fg-3 uppercase">
        <span className="pl-1">Father&rsquo;s side</span>
        <span className="pl-1 text-known-ink">Mother&rsquo;s side · start here</span>
      </div>
      <svg viewBox="0 0 320 172" aria-hidden focusable="false" className="w-full overflow-visible">
        <rect x={2} y={2} width={154} height={124} rx={14} className="fill-aurora-sky/45" />
        <rect
          x={164}
          y={2}
          width={154}
          height={124}
          rx={14}
          className="fill-aurora-mint/70 stroke-known/30 transition-[fill-opacity] duration-(--dur-hover) group-hover/spot:fill-aurora-mint"
          strokeWidth={1}
        />
        <g fill="none" strokeWidth={1.25} className={line}>
          <path d="M61 38H99M80 38V91" />
          <path d="M221 38H259M240 38V91" />
          <path d="M93 104H227M160 104V139" />
        </g>
        {g(48, 38, "square")}
        {g(112, 38, "circle")}
        {g(208, 38, "square")}
        {g(272, 38, "circle")}
        {g(80, 104, "square")}
        {g(240, 104, "circle")}
        <PedigreeGlyph as="g" x={160} y={152} size={28} shape="diamond" status="self" />
      </svg>
    </div>
  );
}

/** Step 2: the real invite text (AMENDMENTS A2) with the real link shape. */
function InviteText() {
  const { fragment } = inviteFragment("mom");
  const url = `${SITE_HOST}/invite#${fragment.slice(0, 8)}…`;
  return (
    <div className="flex h-full flex-col justify-center gap-3 px-5 py-5 sm:px-8">
      <p aria-hidden className="font-mono text-eyebrow text-fg-3 uppercase">
        To: Mom · from Alex&rsquo;s phone
      </p>
      <SmsBubble from="me" preview={{ title: "Family health history", site: SITE_HOST }} className="items-end">
        {inviteMessage(DEMO.patientName, url)}
      </SmsBubble>
    </div>
  );
}

function Fact({ what, chip }: { what: string; chip: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-md border border-line bg-surface px-3.5 py-2.5 shadow-xs">
      <span className="text-small font-strong text-fg">{what}</span>
      {chip}
    </div>
  );
}

/** Step 3: Dad's two voices, both kept, and Grandma June's "no", kept too. */
function TwoVoices() {
  const dad = viewOf("dad");
  const june = viewOf("pgm");
  const mom = report("r-dad-mom");
  const dev = report("r-dad-dev");
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 px-5 py-5 sm:px-8">
      <div className="flex items-center gap-3">
        <PedigreeGlyph {...glyphFor(dad)} size={40} />
        <span className="text-ui font-strong text-fg">{dad.person.label}</span>
        <StatusPill status="conflicting" size="sm" />
      </div>
      <Fact what={`${mom.condition} · ${mom.ageAtOnset}`} chip={<SourceChip kind="relative" who={mom.reportedBy} date={mom.reportedAt} />} />
      <p className="flex items-center gap-2 font-mono text-eyebrow text-known-ink uppercase">
        <span aria-hidden className="h-px flex-1 bg-known/40" />
        Both kept · names attached
        <span aria-hidden className="h-px flex-1 bg-known/40" />
      </p>
      <Fact what={`${dev.condition} · about ${dev.ageAtOnset}`} chip={<SourceChip kind="relative" who={dev.reportedBy} date={dev.reportedAt} />} />
      <div className="mt-1 flex items-center gap-3 border-t border-line pt-3">
        <PedigreeGlyph {...glyphFor(june)} size={28} />
        <span className="text-small font-medium text-fg">{june.person.label}</span>
        <StatusPill status="declined" size="sm" />
      </div>
    </div>
  );
}

/** Step 4: the real patient summary, as a sheet on the desk. */
function OnePage({ doc }: { doc: ReactNode }) {
  return (
    <div className="relative h-72 overflow-hidden bg-mist">
      <div className="absolute inset-x-5 top-5 rotate-[-1.2deg] rounded-paper bg-white shadow-paper transition-transform duration-(--dur-panel) ease-out-quart group-hover/spot:rotate-0 sm:inset-x-8 motion-reduce:transition-none">
        <DocPreview heightClassName="h-[17rem]">{doc}</DocPreview>
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Build by side of family",
    body: "Start with your mother's side. Fixed slots for parents and grandparents, so nobody lands on the wrong side of the family.",
  },
  {
    n: "02",
    title: "One text link per relative",
    body: "No app, no account. The text itself carries no health information. Relatives answer for themselves, and they can say no.",
  },
  {
    n: "03",
    title: "Keep the doubt",
    body: "Every answer keeps its source. Mom says heart attack at 60. Uncle Dev says angina at about 58. Both are kept, with names. Grandma June chose not to share, and that choice is kept.",
  },
  {
    n: "04",
    title: "Walk in with one page",
    body: "Facts, gaps and questions for you. A separate care-team version for your cardiologist.",
  },
] as const;

/** §10.4.3 The product in four steps: each card holds a small fragment of the real product, built from P1 primitives. */
export function ProductSteps({ patientDoc, className }: { patientDoc: ReactNode; className?: string }) {
  const stages = [<SideOfFamily key="1" />, <InviteText key="2" />, <TwoVoices key="3" />, <OnePage key="4" doc={patientDoc} />];
  return (
    <ol className={cn("grid gap-4 md:grid-cols-2 lg:gap-5", className)}>
      {STEPS.map((s, i) => (
        <li key={s.n} className="min-w-0">
          <SpotlightCard className="h-full overflow-hidden shadow-xs">
            <div className="flex h-full flex-col">
              <div className="bg-dots relative flex min-h-72 flex-col border-b border-line bg-canvas [--dots-size:18px] *:flex-1">{stages[i]}</div>
              <div className="flex flex-1 flex-col gap-2 p-6 sm:p-7">
                <p className="font-mono text-eyebrow text-brand tabular-nums">Step {s.n}</p>
                <h3 className="text-title font-strong text-fg">{s.title}</h3>
                <p className="max-w-[48ch] text-body text-fg-2">{s.body}</p>
                {i === 3 ? (
                  <Button href="/summary" variant="link" iconRight={<ArrowRight />} className="mt-1 self-start">
                    Open the pre-visit summary
                  </Button>
                ) : null}
              </div>
            </div>
          </SpotlightCard>
        </li>
      ))}
    </ol>
  );
}
