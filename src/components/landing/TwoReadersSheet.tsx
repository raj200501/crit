"use client";

import { useState, type ReactNode } from "react";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { FadeSwap } from "./FadeSwap";
import { DOC_BRIDGE } from "./legacyBridge";

type Reader = "patient" | "clinician";
const OPTIONS = [
  { value: "patient", label: "What you see" },
  { value: "clinician", label: "What your cardiologist sees" },
] as const;

/**
 * §8.9 The sheet on the mist desk: one real SummaryDocument per reader (server-rendered slots), crossfaded in 220 ms.
 * The sheet carries one of the product's only two border beams.
 */
export function TwoReadersSheet({ patientDoc, clinicianDoc }: { patientDoc: ReactNode; clinicianDoc: ReactNode }) {
  const [reader, setReader] = useState<Reader>("patient");
  const [switched, setSwitched] = useState(false);
  return (
    <div className="flex flex-col items-center gap-8">
      <SegmentedControl
        label="Who reads it"
        options={OPTIONS}
        value={reader}
        onChange={(v) => {
          setSwitched(true);
          setReader(v);
        }}
        className="max-w-full shadow-xs"
      />
      <div className="relative w-full max-w-[860px]">
        {/* the sheet is the brightest object on the page: a soft lumen pool under it */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[8%] -bottom-10 h-40 rounded-full bg-[radial-gradient(closest-side,rgb(127_230_197/0.45),transparent)] blur-2xl"
        />
        <BorderBeam mode="loop" radius={12} className="relative shadow-paper" contentClassName="overflow-hidden bg-white">
          <FadeSwap id={reader} animate={switched} className={`${DOC_BRIDGE} [&_article]:border-transparent`}>
            {reader === "patient" ? patientDoc : clinicianDoc}
          </FadeSwap>
        </BorderBeam>
      </div>
    </div>
  );
}
