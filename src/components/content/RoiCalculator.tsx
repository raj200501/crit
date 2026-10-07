"use client";

import { RotateCcw } from "lucide-react";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { PILOT } from "@/content/site";
import { clampInput, formatUsd, ROI_LIMITS, staffTimeValuePerMonth } from "./roi";

type Key = keyof typeof ROI_LIMITS;

const DEFAULTS: Record<Key, string> = {
  patients: "40",
  minutes: String(PILOT.roiAssumptions.minutesSaved),
  costPerHour: String(PILOT.roiAssumptions.staffCostPerHour),
};

const FIELDS: { key: Key; label: string; assumption: boolean; prefix?: string; suffix?: string; slider: [number, number] }[] = [
  { key: "patients", label: "New patients per month", assumption: false, slider: [0, 200] },
  { key: "minutes", label: "Minutes saved per new patient", assumption: true, suffix: "min", slider: [0, 30] },
  { key: "costPerHour", label: "Loaded staff cost per hour", assumption: true, prefix: "$", suffix: "/ h", slider: [15, 80] },
];

/**
 * DESIGN §10.3.4: one output only, "≈ $X of staff time per month" (minutes × patients × cost ÷ 60), with both
 * assumptions labeled. No savings claim; the caveat is PILOT.roiCaveat. The math is in roi.ts (unit-tested).
 */
export function RoiCalculator({ className }: { className?: string }) {
  const uid = useId();
  const [raw, setRaw] = useState<Record<Key, string>>(DEFAULTS);
  const v = { patients: clampInput(raw.patients, "patients"), minutes: clampInput(raw.minutes, "minutes"), costPerHour: clampInput(raw.costPerHour, "costPerHour") };
  const value = staffTimeValuePerMonth(v);
  const changed = (Object.keys(DEFAULTS) as Key[]).some((k) => raw[k] !== DEFAULTS[k]);
  const id = (k: Key) => `${uid}-${k}`;

  return (
    <div className={cn("grid overflow-hidden rounded-xl border border-line bg-surface shadow-md lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] print:grid-cols-[1.4fr_1fr] print:shadow-none", className)}>
      <div className="flex flex-col gap-7 p-6 sm:p-8 print:gap-1.5 print:p-3">
        {FIELDS.map((f) => {
          const n = v[f.key];
          return (
            <div key={f.key} className="flex flex-col gap-3 print:flex-row print:items-center print:justify-between print:gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor={id(f.key)} className="text-ui font-strong text-fg print:text-[11px]">
                  {f.label}
                </label>
                {f.assumption ? (
                  <Badge mono className="print:h-auto print:bg-transparent print:px-0 print:text-[9px]">
                    Assumption
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-center gap-4">
                {/* pointer shortcut; the number field is the labeled control (arrow keys step it) */}
                <input
                  type="range"
                  aria-hidden
                  tabIndex={-1}
                  min={f.slider[0]}
                  max={f.slider[1]}
                  step={1}
                  value={Math.min(f.slider[1], Math.max(f.slider[0], n))}
                  onChange={(e) => setRaw((r) => ({ ...r, [f.key]: e.target.value }))}
                  className="h-11 min-w-0 flex-1 cursor-pointer accent-evergreen-600 print:hidden"
                />
                <div className="relative flex w-32 shrink-0 items-center print:w-auto">
                  {f.prefix ? <span aria-hidden className="pointer-events-none absolute left-3 text-body text-fg-3">{f.prefix}</span> : null}
                  <input
                    id={id(f.key)}
                    type="number"
                    inputMode="numeric"
                    min={ROI_LIMITS[f.key].min}
                    max={ROI_LIMITS[f.key].max}
                    step={ROI_LIMITS[f.key].step}
                    value={raw[f.key]}
                    onChange={(e) => setRaw((r) => ({ ...r, [f.key]: e.target.value }))}
                    className={cn(
                      "min-h-11 w-full rounded-sm border border-input bg-surface py-2 text-right text-body text-fg tabular-nums shadow-xs transition-[border-color] duration-(--dur-hover) hover:border-fg-2 focus:border-brand focus-visible:outline-offset-0 print:min-h-0 print:border-0 print:p-0 print:text-[12px] print:shadow-none",
                      f.prefix ? "pl-7" : "pl-3",
                      f.suffix ? "pr-12" : "pr-3",
                    )}
                  />
                  {f.suffix ? <span aria-hidden className="pointer-events-none absolute right-3 text-small whitespace-nowrap text-fg-3 print:static print:ml-1 print:text-[11px]">{f.suffix}</span> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative flex flex-col justify-between gap-6 border-t border-line bg-mist p-6 sm:p-8 lg:border-t-0 lg:border-l print:gap-1 print:bg-transparent print:p-3">
        <div>
          <p className="font-mono text-eyebrow text-fg-3 uppercase">Value of staff time</p>
          <output htmlFor={FIELDS.map((f) => id(f.key)).join(" ")} aria-live="polite" className="mt-3 block print:mt-1">
            <span className="block font-display text-stat font-book text-fg tabular-nums lining-nums print:text-[30px]">≈ {formatUsd(value)}</span>
            <span className="mt-2 block text-lead text-fg-2 print:mt-0 print:text-[11px]">of staff time per month</span>
          </output>
          <p className="mt-4 font-mono text-caption text-fg-3 tabular-nums print:mt-1 print:text-[9px]">
            {v.minutes} min × {v.patients} patients × ${v.costPerHour}/h ÷ 60
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <p className="max-w-[34ch] text-small text-fg-2 print:text-[10px]">{PILOT.roiCaveat}</p>
          <Button variant="ghost" size="sm" iconLeft={<RotateCcw />} onClick={() => setRaw(DEFAULTS)} disabled={!changed} className="-ml-3.5 max-sm:h-11 print:hidden">
            Reset to the defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
