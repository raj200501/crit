"use client";

import { useEffect, useState } from "react";

/**
 * Scroll-spy: the id of the last element (in document order) whose top has scrolled past `offset` px from the top of
 * the viewport, or null above the first one. At the very bottom of the page the last id wins, so a short final
 * section still lights up. One rAF-throttled scroll listener; Lenis drives native scroll, so it sees every frame.
 */
export function useScrollSpy(ids: readonly string[], offset = 140): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const els = key
      .split("|")
      .map((id) => (id ? document.getElementById(id) : null))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      let current: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top - offset <= 1) current = el.id;
        else break;
      }
      const doc = document.documentElement;
      if (current && window.innerHeight + window.scrollY >= doc.scrollHeight - 2) current = els[els.length - 1].id;
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, [key, offset]);

  return active;
}
