import { ArrowUp } from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/components/ui/cn";
import { MobileToc, Toc, type TocItem } from "./Toc";

export interface DocsLayoutProps {
  toc: readonly TocItem[];
  tocLabel?: string;
  /** Show "Back to top" after the content (long documents). */
  backToTop?: boolean;
  className?: string;
  /** Classes for the reading column. */
  columnClassName?: string;
  children?: ReactNode;
}

/**
 * Reading layout for long pages: a sticky table of contents on the left from 1024 px (scroll-spy), a reading column
 * capped at 68ch, and on smaller screens a sticky "On this page" bar instead.
 */
export function DocsLayout({ toc, tocLabel = "On this page", backToTop, className, columnClassName, children }: DocsLayoutProps) {
  return (
    <Container className={cn("grid gap-x-16 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)]", className)}>
      <aside className="hidden lg:block">
        <Toc items={toc} label={tocLabel} />
      </aside>
      <div className={cn("min-w-0", columnClassName)}>
        <MobileToc items={toc} label={tocLabel} className="mb-10 lg:hidden" />
        {children}
        {backToTop ? (
          <p className="mt-16 border-t border-line pt-6">
            <a href="#main" className="inline-flex min-h-11 items-center gap-2 rounded-full text-small font-medium text-brand hover:text-brand-strong">
              <ArrowUp aria-hidden className="size-4" />
              Back to top
            </a>
          </p>
        ) : null}
      </div>
    </Container>
  );
}
