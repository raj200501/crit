// TEMPORARY bridge (P4). /for-practices and /how-it-works embed the real SummaryDocument (P7). Until P7 lands its
// restyle, the document still reads the pre-revamp CSS variables from the legacy layer (orange accents, 2.5:1 greys).
// These classes re-point those variables to Clearing tokens on P4's own wrappers only, so the embed reads on-brand
// without touching P7 files. Once P7 merges, the document stops reading these variables and the bridge is a no-op;
// the integrator can delete this file and its uses (AnnotatedDocument, DocPreview).
export const DOC_BRIDGE = [
  // names of relatives with a heart condition and the review band stay ink on mist: no alert hue (DESIGN §3.1 rules)
  "[--accent:var(--color-ink)] [--accent-soft:var(--color-mist)]",
  "[--known:var(--color-known-ink)] [--known-soft:var(--color-known-bg)]",
  // "To clarify" rows sit on --conflict-soft: a calm neutral next to the clinician review band
  "[--conflict:var(--color-conflict)] [--conflict-soft:var(--color-paper)] [--conflict-ink:var(--color-conflict-ink)]",
  "[--declined:var(--color-declined-ink)] [--declined-soft:var(--color-declined-bg)]",
  "[--ink:var(--color-ink)] [--ink-2:var(--color-ink-2)] [--muted:var(--color-ink-3)] [--faint:var(--color-ink-3)]",
  "[--line:rgb(10_31_27/0.12)] [--line-strong:rgb(10_31_27/0.2)] [--surface-2:var(--color-paper)] [--surface-3:var(--color-mist)]",
  "[--shadow:none]",
].join(" ");
