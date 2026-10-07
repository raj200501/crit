import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export interface DocPreviewProps {
  /** A server-rendered <SummaryDocument>. */
  children: ReactNode;
  /** Tailwind height classes for the visible crop. */
  heightClassName?: string;
  className?: string;
}

/**
 * The real document, cropped and faded: a picture of the page, not a second copy of it. It is inert and hidden from
 * assistive tech (each page links to the readable version), so its headings never compete with the page outline.
 */
export function DocPreview({ children, heightClassName = "h-[24rem]", className }: DocPreviewProps) {
  return (
    <div aria-hidden inert className={cn("relative overflow-hidden select-none", heightClassName, className)}>
      <div className="[&_article]:rounded-none! [&_article]:border-0!">{children}</div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-white via-white/85 to-white/0" />
    </div>
  );
}
