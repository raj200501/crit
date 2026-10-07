"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A sideways-scrolling box for the pedigree on phones. It opens centred on the patient's generation (the middle of the
 * tree), and only while it actually overflows is it a focusable, labelled region (so a keyboard can scroll it).
 */
export function CenterScroll({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let centred = false;
    const check = () => {
      const over = el.scrollWidth > el.clientWidth + 1;
      setOverflows(over);
      if (over && !centred) {
        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
        centred = true;
      }
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      {...(overflows ? { tabIndex: 0, role: "region", "aria-label": label } : {})}
    >
      {children}
    </div>
  );
}
