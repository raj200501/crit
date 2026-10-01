"use client";

// Demo "Connect MyChart": a real SMART on FHIR standalone patient launch (OAuth2 + PKCE)
// against the public SMART Health IT sandbox, which serves synthetic (Synthea) patients.
// A production version would register with Epic (fhir.epic.com) or go through an aggregator.

import { isCardiac } from "./status";

const SANDBOX = "https://launch.smarthealthit.org/v/r4";
/** Synthetic sandbox patient with atrial fibrillation in their record. */
export const DEMO_PATIENT = "7099b4c5-6f47-4293-9690-f2afb23b9dd6";
export const SANDBOX_LABEL = "MyChart (SMART sandbox)";
const RETURN_KEY = "fht:smart:return";

function b64url(s: string) {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Launcher options: patient-standalone, preselected synthetic patient, skip the fake login, keep the consent screen. */
function sandboxIss() {
  const sim = [3, DEMO_PATIENT, "", "AUTO", 1, 0, 0, "", "", "", "", "", "", "", 0, 1, ""];
  return `${SANDBOX}/sim/${b64url(JSON.stringify(sim))}/fhir`;
}

export async function startMyChartConnect(returnTo: string) {
  sessionStorage.setItem(RETURN_KEY, returnTo);
  const { authorize } = await import("fhirclient/browser");
  await authorize({
    iss: sandboxIss(),
    clientId: "family-health-tree-demo",
    scope: "openid fhirUser launch/patient patient/Patient.read patient/Condition.read",
    redirectUri: `${window.location.origin}/connect/callback`,
    pkceMode: "ifSupported",
  });
}

export interface PortalCondition {
  id: string;
  display: string;
  code?: { system: string; code: string; display: string };
  onset?: string;
  ageAtOnset?: number;
  cardiac: boolean;
  recordedDate?: string;
}

export interface PortalResult {
  patientName: string;
  conditions: PortalCondition[];
}

type Coding = { system?: string; code?: string; display?: string };
type FhirCondition = {
  id?: string;
  code?: { text?: string; coding?: Coding[] };
  onsetDateTime?: string;
  recordedDate?: string;
  clinicalStatus?: { coding?: Coding[] };
};

function ageAt(birth: string | undefined, when: string | undefined) {
  if (!birth || !when) return undefined;
  const b = new Date(birth);
  const w = new Date(when);
  let age = w.getUTCFullYear() - b.getUTCFullYear();
  if (w.getUTCMonth() < b.getUTCMonth() || (w.getUTCMonth() === b.getUTCMonth() && w.getUTCDate() < b.getUTCDate())) age--;
  return age >= 0 && age < 130 ? age : undefined;
}

/** Finish the OAuth redirect and read the patient's own conditions. */
export async function completeMyChartConnect(): Promise<{ result: PortalResult; returnTo: string }> {
  const { ready } = await import("fhirclient/browser");
  const client = await ready();
  const patient = (await client.patient.read()) as { birthDate?: string; name?: { given?: string[]; family?: string }[] };
  const bundle = (await client.request(`Condition?patient=${client.patient.id}&_count=100`, { pageLimit: 2, flat: true })) as FhirCondition[];

  const seen = new Set<string>();
  const conditions: PortalCondition[] = [];
  for (const c of bundle) {
    const coding = c.code?.coding?.find((x) => x.system?.includes("snomed")) ?? c.code?.coding?.[0];
    const display = (c.code?.text || coding?.display || "Condition").replace(/\s*\((disorder|finding|situation)\)\s*$/i, "");
    const key = display.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    conditions.push({
      id: c.id ?? key,
      display,
      code: coding?.code ? { system: coding.system ?? "", code: coding.code, display: coding.display ?? display } : undefined,
      onset: c.onsetDateTime,
      ageAtOnset: ageAt(patient.birthDate, c.onsetDateTime),
      cardiac: isCardiac(display),
      recordedDate: c.recordedDate ?? c.onsetDateTime,
    });
  }
  conditions.sort((a, b) => Number(b.cardiac) - Number(a.cardiac) || a.display.localeCompare(b.display));
  const n = patient.name?.[0];
  const returnTo = sessionStorage.getItem(RETURN_KEY) || "/invite";
  sessionStorage.removeItem(RETURN_KEY);
  return { result: { patientName: [n?.given?.join(" "), n?.family].filter(Boolean).join(" ") || "Sandbox patient", conditions }, returnTo };
}

const RESULT_KEY = "fht:smart:result";

export function stashPortalResult(r: PortalResult) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(r));
}

/** Read (without consuming) the conditions fetched on the callback page. */
export function peekPortalResult(): PortalResult | null {
  const raw = sessionStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PortalResult;
  } catch {
    return null;
  }
}

export function clearPortalResult() {
  sessionStorage.removeItem(RESULT_KEY);
}
