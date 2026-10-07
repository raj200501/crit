import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge must know the custom scale, or it drops classes it thinks conflict
// (without this, cn("text-display-xl", "text-fg") returns "text-fg").
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display-xl", "display-l", "display-m", "stat", "title", "lead", "body", "ui", "small", "caption", "eyebrow"],
      radius: ["paper"],
      shadow: ["paper", "window", "glow", "raise-night"],
      "font-weight": ["book", "strong"],
      ease: ["out-expo", "out-quart", "in-out-sine", "emph"],
      animate: ["word-in", "fade-up", "marquee", "ripple", "draw"],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
