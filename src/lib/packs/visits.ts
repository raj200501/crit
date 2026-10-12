// The visit types a patient can pick, and the pack each one uses. A leaf module (imports only types), so sanitize.ts can
// validate a stored visit type without loading the packs.
import type { PackId, VisitType } from "./types";

export const VISIT_TYPES: readonly { id: VisitType; label: string; specialty: string | null; pack: PackId }[] = [
  { id: "cardiology", label: "Cardiology", specialty: "Cardiology", pack: "cardiology" },
  { id: "primary-care", label: "Primary care or wellness visit", specialty: "Primary care", pack: "general" },
  { id: "other", label: "Other specialist", specialty: null, pack: "general" },
];

export const VISIT_TYPE_IDS: ReadonlySet<string> = new Set(VISIT_TYPES.map((t) => t.id));

/** A typed specialty that is cardiology ("Cardiologist", "cardiology follow-up") goes to the cardiology pack. */
export const isCardiologyText = (s: string) => /cardi/i.test(s);
