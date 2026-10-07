// Browser-only helpers for the summary actions: the QR image, the FHIR download and the clipboard.
import { toFhirBundle } from "@/lib/fhir";
import type { FamilyTree } from "@/lib/types";

/** Version 40 at error correction L holds 2,953 bytes; past that there's no QR, only the link. */
export const QR_MAX_URL = 2900;

/**
 * An SVG QR code as a data: URL (img-src allows data:), so it stays crisp from the 160 px rail to the 560 px check-in pass.
 * Error correction L, margin 2 (DESIGN §12.8a). Returns null when the URL is too long to encode.
 */
export async function qrDataUrl(url: string): Promise<string | null> {
  if (url.length > QR_MAX_URL) return null;
  const QR = await import("qrcode");
  try {
    const svg = await QR.toString(url, { type: "svg", errorCorrectionLevel: "L", margin: 2, color: { dark: "#0A1F1B", light: "#FFFFFF" } });
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch {
    return null;
  }
}

export function fhirFileName(tree: FamilyTree) {
  return `family-history-${tree.patientName.toLowerCase().replace(/\W+/g, "-")}.fhir.json`;
}

/** The FHIR R4 Bundle of FamilyMemberHistory resources, saved as a file (nothing leaves the browser). */
export function downloadFhir(tree: FamilyTree) {
  const blob = new Blob([JSON.stringify(toFhirBundle(tree), null, 2)], { type: "application/fhir+json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fhirFileName(tree);
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 0);
}

/** Clipboard write with a textarea fallback (older Safari, or a page without clipboard permission). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.className = "fixed top-0 left-0 opacity-0";
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
