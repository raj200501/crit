// /pilot ROI calculator math (DESIGN §10.3). Pure, unit-tested in tests/research.test.ts.
// One output only: the value of staff time per month. No "you'll save" claims; the caveat is PILOT.roiCaveat.

export interface RoiInputs {
  /** New patients per month. */
  patients: number;
  /** Minutes of staff time saved per new patient (an assumption). */
  minutes: number;
  /** Loaded staff cost per hour, in dollars (an assumption). */
  costPerHour: number;
}

export const ROI_LIMITS = {
  patients: { min: 0, max: 2000, step: 1 },
  minutes: { min: 0, max: 60, step: 1 },
  costPerHour: { min: 0, max: 300, step: 1 },
} as const;

/** Parses a number field: empty, negative or non-numeric input counts as 0; values above the limit are capped. */
export function clampInput(raw: string | number, key: keyof typeof ROI_LIMITS): number {
  const n = typeof raw === "number" ? raw : Number(String(raw).replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(ROI_LIMITS[key].max, n);
}

/** ≈ minutes × patients × cost ÷ 60, in dollars per month. */
export function staffTimeValuePerMonth({ patients, minutes, costPerHour }: RoiInputs): number {
  const p = clampInput(patients, "patients");
  const m = clampInput(minutes, "minutes");
  const c = clampInput(costPerHour, "costPerHour");
  return (m * p * c) / 60;
}

/** "$200", "$1,250" (whole dollars). */
export function formatUsd(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}
