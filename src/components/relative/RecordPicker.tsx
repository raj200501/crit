import { ChevronDown, Link2 } from "lucide-react";
import { useId, useState } from "react";
import { SANDBOX_LABEL, type PortalCondition, type PortalResult } from "@/lib/smart";
import { Button } from "../ui/Button";
import { cn } from "../ui/cn";
import { CheckboxCard } from "../ui/CheckboxCard";
import { Eyebrow } from "../ui/Eyebrow";
import { Input } from "../ui/Input";
import { ActionHint, StepLayout } from "./StepLayout";

export interface RecordPickerProps {
  portal: PortalResult;
  asker: string;
  onShare: (picked: PortalCondition[]) => void;
  onCancel: () => void;
}

/**
 * Pick what to share from the problem list, Apple-style: heart-related first, the rest behind a toggle, and **nothing
 * pre-ticked** (DESIGN §12.9 R4). The share button counts live and names the asker. Same age parsing as before.
 */
export function RecordPicker({ portal, asker, onShare, onCancel }: RecordPickerProps) {
  const hintId = useId();
  const heart = portal.conditions.filter((c) => c.cardiac);
  const rest = portal.conditions.filter((c) => !c.cardiac);
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [showRest, setShowRest] = useState(false);
  const [ages, setAges] = useState<Record<string, string>>(() =>
    Object.fromEntries(portal.conditions.map((c) => [c.id, c.ageAtOnset != null ? String(c.ageAtOnset) : ""])),
  );
  const toggle = (id: string, on: boolean) =>
    setPicked((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  const n = picked.size;

  const row = (c: PortalCondition) => {
    const since = c.onset ?? c.recordedDate;
    return (
      <CheckboxCard
        size="lg"
        key={c.id}
        checked={picked.has(c.id)}
        onChange={(on) => toggle(c.id, on)}
        title={c.display}
        description={
          <span className="mt-0.5 block font-mono text-eyebrow font-medium tracking-[0.06em] text-fg-3 uppercase">
            {since ? `On your problem list since ${since.slice(0, 4)}` : "No date in the record"}
          </span>
        }
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`age-${c.id}`} className="text-small font-medium text-fg">
            How old were you when it started?
          </label>
          <Input
            id={`age-${c.id}`}
            inputMode="numeric"
            autoComplete="off"
            className="w-24"
            value={ages[c.id] ?? ""}
            onChange={(e) => setAges((a) => ({ ...a, [c.id]: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
            aria-label={`Age when ${c.display} started`}
          />
        </div>
      </CheckboxCard>
    );
  };

  return (
    <StepLayout
      title={`Pick what to share with ${asker}`}
      lead="Only what you tick is shared. Nothing else from the chart leaves this page."
      actions={
        <>
          <Button
            size="lg"
            fullWidth
            disabled={n === 0}
            aria-describedby={n === 0 ? hintId : undefined}
            onClick={() =>
              onShare(
                portal.conditions
                  .filter((c) => picked.has(c.id))
                  .map((c) => {
                    const age = Number.parseInt(ages[c.id] ?? "", 10);
                    return { ...c, ageAtOnset: Number.isFinite(age) && age >= 0 && age < 130 ? age : undefined };
                  }),
              )
            }
          >
            Share {n} {n === 1 ? "fact" : "facts"} with {asker}
          </Button>
          {n === 0 ? <ActionHint id={hintId}>Tick what you want to share.</ActionHint> : null}
        </>
      }
    >
      {/* The printout: where the list came from */}
      <div className="overflow-clip rounded-lg border border-line bg-surface">
        <div className="flex items-center gap-2.5 border-b border-dashed border-line-strong bg-record-bg/60 px-4 py-3">
          <Link2 aria-hidden className="size-4 shrink-0 text-record" strokeWidth={2.25} />
          <p className="text-small text-fg-2">
            {portal.simulated ? (
              <>
                <span className="font-strong text-fg">Simulated record</span> (the sandbox is offline, so this is made-up data)
              </>
            ) : (
              <>
                Connected to {SANDBOX_LABEL} as <span className="font-strong text-fg">{portal.patientName}</span> (a made-up sandbox patient)
              </>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2.5 p-3 sm:p-4">
          <Eyebrow className="px-1">Suggested: heart-related</Eyebrow>
          {heart.length ? (
            heart.map(row)
          ) : (
            <p className="px-1 text-ui text-fg-2">
              No heart-related conditions on this problem list. That doesn&rsquo;t mean none happened; you can answer yourself instead.
            </p>
          )}
          {rest.length ? (
            <Button
              variant="ghost"
              onClick={() => setShowRest((s) => !s)}
              aria-expanded={showRest}
              iconRight={<ChevronDown className={cn("transition-transform duration-(--dur-ui)", showRest && "rotate-180")} />}
              className="self-start px-3 text-small text-brand hover:text-brand-strong"
            >
              {showRest ? "Hide" : "Show"} {rest.length} other {rest.length === 1 ? "condition" : "conditions"} in the record
            </Button>
          ) : null}
          {showRest ? <div className="flex flex-col gap-2.5">{rest.map(row)}</div> : null}
        </div>
      </div>
      <p className="text-small text-fg-3">
        A record date is often when a problem was added to the list, not when it was diagnosed. Fix the age if you know better.
      </p>
      <Button variant="ghost" size="lg" fullWidth onClick={onCancel} className="-mt-2">
        Answer myself instead
      </Button>
    </StepLayout>
  );
}
