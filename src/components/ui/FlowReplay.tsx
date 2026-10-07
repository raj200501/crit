"use client";

import { RotateCcw } from "lucide-react";
import type { MouseEvent } from "react";

/** The tiny client island inside FlowDiagram: restarts the beam pulses. Hidden under reduced motion. */
export function FlowReplay() {
  const replay = (e: MouseEvent<HTMLButtonElement>) => {
    const fig = e.currentTarget.closest("[data-flow]");
    fig?.querySelectorAll<SVGPathElement>("[data-beam]").forEach((p) => {
      p.getAnimations().forEach((a) => {
        a.cancel();
        a.play();
      });
    });
  };
  return (
    <button
      type="button"
      onClick={replay}
      className="hidden min-h-11 items-center gap-1.5 rounded-full font-medium text-brand underline-offset-4 hover:underline xl:inline-flex motion-reduce:!hidden [&_svg]:size-4"
    >
      <RotateCcw aria-hidden />
      Replay
    </button>
  );
}
