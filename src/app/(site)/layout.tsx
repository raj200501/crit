import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { SmoothScroll } from "@/components/site/SmoothScroll";

// Marketing route group: same URLs, shared floating nav + night footer, Lenis smooth scroll.
// SiteNav is fixed, so each page's first band pads its own top (the nav floats over the hero).
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <SmoothScroll />
      {children}
      <SiteFooter />
    </>
  );
}
