"use client";

import { useEffect } from "react";

const KEY = "fht:present";

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
}

/** Shift+P toggles present mode (bigger type, stronger hairlines) for projectors. Mirrors to sessionStorage. */
export function PresentModeHotkey() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.metaKey || e.ctrlKey || e.altKey || e.key.toLowerCase() !== "p" || isTyping(e.target)) return;
      const root = document.documentElement;
      const on = !root.hasAttribute("data-present");
      root.toggleAttribute("data-present", on);
      try {
        if (on) sessionStorage.setItem(KEY, "1");
        else sessionStorage.removeItem(KEY);
      } catch {
        // storage blocked: the attribute still toggles for this page
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
