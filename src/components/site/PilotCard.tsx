import { ArrowRight } from "lucide-react";
import { PILOT, pilotHref } from "@/content/site";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { cn } from "../ui/cn";

export interface PilotCardProps {
  compact?: boolean;
  /** Show "Request a pilot conversation" and "Pilot details". Default true. */
  ctas?: boolean;
  /** Heading level for the headline (default h3). */
  headingAs?: "h2" | "h3";
  className?: string;
}

/** The proposed-pilot offer, rendered entirely from PILOT (content/site.ts). */
export function PilotCard({ compact, ctas = true, headingAs: H = "h3", className }: PilotCardProps) {
  return (
    <Card tier="floating" className={cn("relative", compact ? "p-5" : "p-6 sm:p-8", className)}>
      <span className="inline-block -rotate-4 rounded-xs border-[3px] border-double border-brand px-2.5 py-1 font-mono text-eyebrow font-medium text-brand-strong uppercase">
        {PILOT.stamp}
      </span>
      <H className={cn("mt-5 font-strong text-fg", compact ? "text-ui" : "text-title")}>{PILOT.headline}</H>
      <ul className="mt-5 flex flex-col gap-1.5">
        {PILOT.terms.map((t) => (
          <li key={t} className={cn("font-mono text-fg tabular-nums", compact ? "text-ui" : "text-lead")}>
            {t}
          </li>
        ))}
      </ul>
      <p className="mt-5 font-strong text-fg">{PILOT.never}</p>
      <p className="mt-1 text-fg-2">{PILOT.free}</p>
      {ctas ? (
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button href={pilotHref()}>Request a pilot conversation</Button>
          <Button href="/pilot" variant="link" iconRight={<ArrowRight />}>
            Pilot details
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
