import type { ReactNode } from "react";
import { LogoMark } from "../brand/LogoMark";
import { cn } from "../ui/cn";

export interface SmsBubbleProps {
  from: "me" | "them";
  children?: ReactNode;
  /** A link-preview card under the bubble. It never carries health information. */
  preview?: { title: string; site: string };
  className?: string;
}

/** A display-only text-message bubble (P5's InviteBox restyles its own textarea to match). */
export function SmsBubble({ from, children, preview, className }: SmsBubbleProps) {
  const me = from === "me";
  return (
    <div className={cn("flex flex-col gap-2", me ? "items-end" : "items-start", className)}>
      <p
        className={cn(
          "max-w-[34ch] px-4 py-2.5 text-ui break-words",
          me ? "rounded-[20px_20px_6px_20px] bg-evergreen-600 text-white" : "rounded-[20px_20px_20px_6px] bg-mist text-ink",
        )}
      >
        {children}
      </p>
      {preview ? (
        <div data-theme="paper" className="flex max-w-[34ch] items-center gap-3 rounded-md border border-line bg-surface p-2.5 pr-4 text-fg shadow-xs">
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-sm bg-mist">
            <LogoMark size={24} tone="paper" surface="var(--color-mist)" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-small font-strong">{preview.title}</span>
            <span className="block truncate text-caption text-fg-3">{preview.site}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
