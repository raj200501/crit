// The Clearing (DESIGN §9.3): scroll progress p (0..1 over the pinned hero section) → what the stage shows.
// Pure and DOM-free (no "use client"), so story.ts and node --test can import it.

/** Where the pedigree sits inside the stage, in % of the stage: centre (cx, cy) and maximum size (pw, ph). */
export interface Plate {
  cx: number;
  cy: number;
  pw: number;
  ph: number;
}

/** Scroll progress marks (fractions of the pinned section's scroll distance). */
export const CLEAR = { copyEnd: 0.04, openStart: 0.025, frameEnd: 0.06, expandEnd: 0.14, storyEnd: 0.82, flattenEnd: 0.9, clearEnd: 0.97 } as const;
// copyEnd: the headline column has faded out before the night reaches it (dark ink over night reads as mud).
// openStart: the clip starts opening a moment later, then eases out (expo) to full-bleed by expandEnd.

/** Full-bleed stage: the tree sits right of the chapter cards. (ph 76, not 80: at 16:10 the width binds anyway, and
 *  76 keeps the flatten glide under 0.5 % per 0.001 of scroll, DESIGN §9.5.) */
export const PLATE_STAGE: Plate = { cx: 62, cy: 52, pw: 62, ph: 76 };
/** The summary sheet's pedigree slot (the paper poster in the clearing layer uses the same box). Right of centre, so the
 *  plate never glides under the chapter card, and the caption takes the chapter column. */
export const PLATE_SHEET: Plate = { cx: 60, cy: 42, pw: 40, ph: 38 };

/** Pinned mode (CSS decides it too, under html[data-js]). Everything else is "flow" mode: no pin, stacked chapters. */
export const PINNED_QUERY = "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Scroll progress at which each of the four chapters starts (Build, Invite, Answers, Page). */
export const CHAPTER_STARTS = [
  CLEAR.expandEnd,
  CLEAR.expandEnd + (CLEAR.storyEnd - CLEAR.expandEnd) / 3,
  CLEAR.expandEnd + (2 * (CLEAR.storyEnd - CLEAR.expandEnd)) / 3,
  CLEAR.storyEnd,
] as const;

/**
 * The window's chrome inside the hero slot, in px: the bezel shell's padding, the label strip at the top and the
 * caption + controls at the bottom. The tree is fitted into what is left (side = share of the inner width).
 */
export const SLOT = { bezel: 8, top: 64, bottom: 106, side: 0.86 } as const;

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface SlotGeometry {
  /** clip-path insets (px) that cut the full-bleed window down to the slot's inner rect. */
  clip: { t: number; r: number; b: number; l: number };
  /** The pedigree plate inside that rect, in % of the stage. */
  plate: Plate;
}

/** Measure once: the slot (bezel shell) relative to the stage. Mirrored by the inline script below. */
export function slotGeometry(stage: Box, slot: Box): SlotGeometry {
  const b = SLOT.bezel;
  const l = slot.left - stage.left + b;
  const t = slot.top - stage.top + b;
  const w = Math.max(1, slot.width - 2 * b);
  const h = Math.max(1, slot.height - 2 * b);
  const clip = { t, l, r: stage.width - (l + w), b: stage.height - (t + h) };
  const plate: Plate = {
    cx: ((l + w / 2) / stage.width) * 100,
    cy: ((t + SLOT.top + (h - SLOT.top - SLOT.bottom) / 2) / stage.height) * 100,
    pw: ((w * SLOT.side) / stage.width) * 100,
    ph: (Math.max(1, h - SLOT.top - SLOT.bottom) / stage.height) * 100,
  };
  return { clip, plate };
}

/**
 * Inline script (runs before first paint, right after the stage is parsed): in pinned mode it writes the slot geometry
 * to <html> as --hero-clip-* and --hero-cx/cy/pw/ph, so at p = 0 the window is exactly the slot (no full-bleed flash).
 * Same math as slotGeometry(); kept in one place so the two can't drift.
 */
export function clearingBootScript(stageId: string, slotId: string): string {
  // Hand-written ES5 (no Function#toString: minifiers rename identifiers). Numbers come from SLOT.
  const { bezel: B, top: T, bottom: M, side: S } = SLOT;
  return (
    `try{var h=document.documentElement;if(h.hasAttribute('data-js')&&matchMedia(${JSON.stringify(PINNED_QUERY)}).matches){` +
    `var s=document.getElementById(${JSON.stringify(stageId)}),o=document.getElementById(${JSON.stringify(slotId)});` +
    `if(s&&o){var a=s.getBoundingClientRect(),c=o.getBoundingClientRect(),` +
    `l=c.left-a.left+${B},t=c.top-a.top+${B},w=Math.max(1,c.width-${2 * B}),g=Math.max(1,c.height-${2 * B}),d=h.style;` +
    `d.setProperty('--hero-clip-t',t+'px');d.setProperty('--hero-clip-l',l+'px');` +
    `d.setProperty('--hero-clip-r',(a.width-l-w)+'px');d.setProperty('--hero-clip-b',(a.height-t-g)+'px');` +
    `d.setProperty('--hero-cx',String((l+w/2)/a.width*100));` +
    `d.setProperty('--hero-cy',String((t+${T}+(g-${T}-${M})/2)/a.height*100));` +
    `d.setProperty('--hero-pw',String(w*${S}/a.width*100));` +
    `d.setProperty('--hero-ph',String(Math.max(1,g-${T}-${M})/a.height*100))}}}catch(e){}`
  );
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** 0..1 position of p inside [a, b]. */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPlate = (a: Plate, b: Plate, t: number): Plate => ({
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
  pw: lerp(a.pw, b.pw, t),
  ph: lerp(a.ph, b.ph, t),
});

export type ChapterIndex = -1 | 0 | 1 | 2 | 3;

export interface ClearingFrame {
  p: number;
  /** 0 = window is the slot, 1 = full-bleed (expo eased). */
  expand: number;
  /** 0..1 over chapter 4 (the plate glides into the sheet's pedigree slot). */
  flatten: number;
  /** 0..1: the paper layer fading in. */
  clear: number;
  plate: Plate;
  /** -1 outside the story; 0..3 = Build, Invite, Answers, Page. */
  chapter: ChapterIndex;
  /** 0..1 progress inside the current chapter (drives the card's progress hairline). */
  chapterProgress: number;
}

/** Pure: unit-tested for continuity. slotPlate comes from the measured #hero-slot. */
/** The chapter card's column in the pinned stage (left edge, width), shared by the CSS and the receipt placement. */
export const CHAPTER_COLUMN = { width: 416, left: (w: number) => Math.max(32, (w - 1240) / 2 + 32) } as const;

/**
 * PLATE_STAGE fitted to a real stage: centred in the room between the chapter card and the chapter dots, and never so
 * wide that a relative's label slides under the card (relatives span 67.5 % of the plate; labels add ~60 px a side).
 * At 1440 × 900 this is { cx: 67.9, cy: 52, pw: 62, ph: 76 }; at 1024 × 768 the plate narrows to fit.
 */
export function stagePlateFor(w: number, h: number): Plate {
  if (w <= 0 || h <= 0) return PLATE_STAGE;
  const left = CHAPTER_COLUMN.left(w) + CHAPTER_COLUMN.width + 40;
  const right = w - 72;
  const room = Math.max(240, right - left);
  const plateW = Math.min((PLATE_STAGE.pw / 100) * w, (room - 120) / 0.675);
  return { cx: ((left + right) / 2 / w) * 100, cy: PLATE_STAGE.cy, pw: (plateW / w) * 100, ph: PLATE_STAGE.ph };
}

export function frameAt(p: number, slotPlate: Plate, stagePlate: Plate = PLATE_STAGE): ClearingFrame {
  const expand = easeOutExpo(seg(p, CLEAR.openStart, CLEAR.expandEnd));
  const flatten = seg(p, CLEAR.storyEnd, CLEAR.flattenEnd);
  const clear = seg(p, CLEAR.flattenEnd, CLEAR.clearEnd);
  // The clip opens with an expo ease; the plate moves linearly with scroll, so the tree never jumps (unit-tested).
  const plate = flatten > 0 ? lerpPlate(stagePlate, PLATE_SHEET, flatten) : lerpPlate(slotPlate, stagePlate, seg(p, 0, CLEAR.expandEnd));
  const s = seg(p, CLEAR.expandEnd, CLEAR.storyEnd) * 3;
  let chapter: ChapterIndex = -1;
  let chapterProgress = 0;
  if (p >= CLEAR.expandEnd && p <= CLEAR.flattenEnd) {
    if (p >= CLEAR.storyEnd) {
      chapter = 3;
      chapterProgress = flatten;
    } else {
      const i = Math.min(2, Math.floor(s));
      chapter = i as 0 | 1 | 2;
      chapterProgress = clamp01(s - i);
    }
  }
  return { p, expand, flatten, clear, plate, chapter, chapterProgress };
}
