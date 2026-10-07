"use client";

import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";

export const TOUR_KEY = "fht:tour:v1";

export interface TourStop {
  personId: string;
  text: string;
  /** The last stop offers a direct action. */
  ask?: string;
}

/** The demo storyline (DESIGN §12.1). Only shown on the demo tree. */
export const TOUR_STOPS: TourStop[] = [
  { personId: "dad", text: "Mom and Uncle Dev disagree about Dad. We keep both, with names." },
  { personId: "dev", text: "Uncle Dev shared AFib from his own patient portal (demo sandbox)." },
  { personId: "pgm", text: "Grandma June said no. Only she can, and her wish wins." },
  { personId: "mgf", text: "Try it: ask Grandpa Luis.", ask: "Ask Grandpa Luis" },
];

export function tourDone(): boolean {
  try {
    return window.localStorage.getItem(TOUR_KEY) === "done";
  } catch {
    return false;
  }
}

export function markTourDone() {
  try {
    window.localStorage.setItem(TOUR_KEY, "done");
  } catch {
    /* storage blocked: the tour just won't remember */
  }
}

export interface TourProps {
  index: number;
  stops: TourStop[];
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onAsk: () => void;
  className?: string;
}

/**
 * A non-modal coach card docked at the canvas's bottom-left, above the toolbar (phones: above the tab bar, collapsible).
 * aria-live="polite" announces each stop; the anchored relative gets a lumen ring on the canvas.
 */
export function Tour({ index, stops, onNext, onBack, onSkip, onAsk, className }: TourProps) {
  const [collapsed, setCollapsed] = useState(false);
  const stop = stops[index];
  const last = index === stops.length - 1;
  return (
    <section
      aria-label="Demo tour"
      className={cn(
        "z-20 lg:absolute lg:bottom-16 lg:left-3 lg:w-[22rem]",
        "max-lg:fixed max-lg:inset-x-3 max-lg:bottom-[calc(76px+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-lg border border-line bg-raised/95 p-4 shadow-lg backdrop-blur-md motion-safe:animate-fade-up">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-lumen to-transparent" />
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-mono text-eyebrow font-medium text-fg-3 uppercase">
            <span aria-hidden className="size-2 rounded-full bg-evergreen-600 shadow-[0_0_0_3px_rgb(127_230_197/0.45)]" />
            Demo tour · {index + 1} / {stops.length}
          </p>
          <button
            type="button"
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
            className="-my-2 -mr-2 inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-small font-medium text-fg-2 hover:bg-sunken hover:text-fg lg:hidden"
          >
            {collapsed ? "Show" : "Hide"}
            {collapsed ? <ChevronUp aria-hidden className="size-4" /> : <ChevronDown aria-hidden className="size-4" />}
          </button>
        </div>
        <div className={cn(collapsed && "max-lg:hidden")}>
          <p aria-live="polite" className="mt-2.5 text-ui text-fg">
            {stop.text}
          </p>
          <div aria-hidden className="mt-3 flex gap-1.5">
            {stops.map((s, i) => (
              <span
                key={s.personId}
                className={cn("h-1 flex-1 rounded-full transition-colors duration-(--dur-ui)", i <= index ? "bg-evergreen-600" : "bg-mist-2")}
              />
            ))}
          </div>
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {last && stop.ask ? (
              <Button size="sm" iconLeft={<Send />} onClick={onAsk} className="max-lg:h-11">
                {stop.ask}
              </Button>
            ) : (
              <Button size="sm" onClick={onNext} className="max-lg:h-11">
                Next
              </Button>
            )}
            {index > 0 ? (
              <Button variant="ghost" size="sm" onClick={onBack} className="max-lg:h-11">
                Back
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={onSkip} className="ml-auto text-fg-2 max-lg:h-11">
              {last ? "Finish" : "Skip tour"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
