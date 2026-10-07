import { Globe, Info, ListChecks, LoaderCircle, Send } from "lucide-react";
import { useId } from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export interface PortalOptionCardProps {
  asker: string;
  connecting: boolean;
  error: string | null;
  onConnect: () => void;
  onSimulate: () => void;
}

/**
 * "Share one fact from your patient portal": the pre-sign-in explainer (where you'll sign in, what we see, where it goes),
 * Connect MyChart (→ Opening…) and the labeled offline fallback. The SMART launch itself is unchanged (src/lib/smart.ts).
 */
export function PortalOptionCard({ asker, connecting, error, onConnect, onSimulate }: PortalOptionCardProps) {
  const titleId = useId();
  const steps = [
    { icon: Globe, text: "You’ll sign in on your health system’s own page, not ours. Check the address bar." },
    { icon: ListChecks, text: "We briefly see your problem list so you can choose; everything else is discarded on this page." },
    { icon: Send, text: `Sharing goes to ${asker}, once.` },
  ];
  return (
    <section
      aria-labelledby={titleId}
      className="relative isolate overflow-clip rounded-lg border border-brand/35 bg-surface p-5 shadow-[0_1px_2px_rgb(10_31_27/0.04),0_12px_32px_-16px_rgb(14_107_87/0.35)]"
    >
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--color-evergreen-50),rgb(255_255_255/0)_62%)]" />
      <div className="flex flex-wrap gap-1.5">
        <Badge tone="brand" mono>
          Fastest
        </Badge>
        <Badge mono className="bg-white/80 ring-1 ring-line ring-inset">
          Demo sandbox
        </Badge>
      </div>
      <h2 id={titleId} className="mt-3.5 text-title font-strong text-fg">
        Share one fact from your patient portal
      </h2>
      <ol className="mt-3.5 flex flex-col gap-3">
        {steps.map(({ icon: Icon, text }, i) => (
          <li key={i} className="flex gap-3 text-ui text-fg-2">
            <span aria-hidden className="mt-px grid size-7 shrink-0 place-items-center rounded-full border border-brand/25 bg-white text-evergreen-700">
              <Icon className="size-3.5" strokeWidth={2} />
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-col gap-2">
        <Button size="lg" fullWidth onClick={onConnect} disabled={connecting} iconLeft={connecting ? <LoaderCircle className="animate-spin" /> : undefined}>
          {connecting ? "Opening…" : "Connect MyChart"}
        </Button>
        {error ? (
          <div role="alert" className="flex items-start gap-2.5 rounded-md bg-mist px-3.5 py-3 text-small text-fg-2">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-3" />
            <div className="flex min-w-0 flex-col gap-1">
              <p>
                <span className="font-strong text-fg">Couldn&rsquo;t reach the sandbox.</span> You can use a simulated record instead; it&rsquo;s clearly
                labeled as made-up.
              </p>
              <p className="line-clamp-2 text-caption text-fg-3 [overflow-wrap:anywhere]">{error}</p>
            </div>
          </div>
        ) : null}
        <Button variant="link" onClick={onSimulate} className="self-center text-small">
          Use a simulated record (sandbox offline)
        </Button>
      </div>
      <p className="mt-1 text-center font-mono text-eyebrow text-fg-3 uppercase">SMART on FHIR sandbox · made-up patients</p>
    </section>
  );
}
