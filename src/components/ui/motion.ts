// Motion tokens. Durations mirror the --dur-* custom properties in globals.css (seconds here, ms there).
export const EASE = { outExpo: [0.19, 1, 0.22, 1], outQuart: [0.25, 1, 0.5, 1], inOutSine: [0.37, 0, 0.63, 1], emph: [0.2, 0, 0, 1] } as const;
export const DUR = { press: 0.12, hover: 0.18, ui: 0.22, panel: 0.28, reveal: 0.56, headline: 0.9, count: 1.4, ripple: 1.2 } as const;
export const SPRING = {
  glide: { type: "spring", stiffness: 500, damping: 40 }, // segmented/nav layoutId pill
  scroll: { stiffness: 140, damping: 30 }, // tracing lines (useSpring)
} as const;
export const STAGGER = { words: 0.07, list: 0.04, cards: 0.07 } as const;

/** True when the user asked the OS for reduced motion. Safe on the server (returns false). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
