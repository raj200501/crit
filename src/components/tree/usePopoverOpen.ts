"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Calls `fn` each time the native popover around `ref` opens (to reset a form and move focus into it). */
export function useOnPopoverOpen(ref: RefObject<HTMLElement | null>, fn: () => void) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  useEffect(() => {
    const pop = ref.current?.closest<HTMLElement>("[popover]");
    if (!pop) return;
    const onToggle = (e: Event) => {
      if ((e as ToggleEvent).newState === "open") fnRef.current();
    };
    pop.addEventListener("toggle", onToggle);
    return () => pop.removeEventListener("toggle", onToggle);
  }, [ref]);
}
