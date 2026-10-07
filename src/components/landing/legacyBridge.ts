// TEMPORARY bridge (P3). The landing embeds the real TreeView (P5) and SummaryDocument (P7). Until those packages land
// their restyles, both still read the pre-revamp CSS variables from the legacy layer (orange finding fills, 2.5:1 greys).
// These classes re-point those variables to the Clearing tokens on the landing's own wrappers only, so the embeds read
// on-brand without touching P5/P7 files. Once P5/P7 merge, their components stop reading these variables and the bridge
// is a no-op; the integrator can delete this file and its two uses (ProductTour, TwoReadersSheet).

/** For <TreeView> (legacy TreeView.module.css). Finding = ink fill (NSGC "affected"); the patient = evergreen, like the logo's diamond. */
export const TREE_BRIDGE = [
  "[--accent:var(--color-ink)] [--navy:var(--color-evergreen-700)]",
  "[--known:var(--color-known)] [--conflict:var(--color-conflict)] [--conflict-soft:var(--color-conflict-bg)] [--conflict-ink:var(--color-conflict-ink)]",
  "[--unknown:var(--color-unknown)] [--declined:var(--color-declined-ink)] [--declined-soft:var(--color-declined-bg)]",
  "[--verified:var(--color-record)] [--verified-soft:var(--color-record-bg)]",
  "[--ink:var(--color-ink)] [--muted:var(--color-ink-3)] [--faint:var(--color-ink-3)] [--surface:var(--color-white)]",
  "[--line:rgb(10_31_27/0.12)] [--line-strong:rgb(10_31_27/0.22)] [--radius:14px] [--shadow:var(--shadow-md)]",
  // the legacy selected ring is a hard-coded orange glow; the heart badge has a peach border
  "[&_button[aria-pressed=true]]:shadow-[0_0_0_3px_rgb(14_107_87/0.3),var(--shadow-md)]",
  "[&_span[title=Heart-related]]:border-line-strong",
].join(" ");

/** For <SummaryDocument> (legacy SummaryDocument.module.css). Names and the review band stay ink on mist: no alert hue. */
export const DOC_BRIDGE = [
  "[--accent:var(--color-ink)] [--accent-soft:var(--color-mist)]",
  "[--known:var(--color-known-ink)] [--known-soft:var(--color-known-bg)]",
  // "To clarify" rows sit on --conflict-soft: keep them a calm neutral (no amber wash beside the clinician review band)
  "[--conflict:var(--color-conflict)] [--conflict-soft:var(--color-paper)] [--conflict-ink:var(--color-conflict-ink)]",
  "[--declined:var(--color-declined-ink)] [--declined-soft:var(--color-declined-bg)]",
  "[--ink:var(--color-ink)] [--ink-2:var(--color-ink-2)] [--muted:var(--color-ink-3)] [--faint:var(--color-ink-3)]",
  "[--line:rgb(10_31_27/0.12)] [--line-strong:rgb(10_31_27/0.2)] [--surface-2:var(--color-paper)] [--surface-3:var(--color-mist)]",
  "[--shadow:none]",
].join(" ");
