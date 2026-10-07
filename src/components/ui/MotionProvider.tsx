"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// domAnimation (animations + exit + gestures, no layout/drag) arrives in its own chunk after first paint.
// Until it loads, m.* elements render their initial/static styles; animations start once the features arrive.
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

// Use `m.div` (not `motion.div`): strict LazyMotion throws on the full `motion` component.
// reducedMotion="user" only stops transforms; JS loops must still check useReducedMotion().
// Everything that renders an `m.*` element (including the root layout's <Toaster />) must sit inside this provider.
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
