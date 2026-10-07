import { ChevronDown } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "./cn";

export interface AccordionProps {
  items: readonly { q: string; a: ReactNode }[];
  /** Only one item open at a time (native <details name>). Default true. */
  exclusive?: boolean;
  className?: string;
}

/** Zero-JS disclosure list built on <details>/<summary>. */
export function Accordion({ items, exclusive = true, className }: AccordionProps) {
  const name = useId();
  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((it) => (
        <details key={it.q} name={exclusive ? name : undefined} className="group/acc">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-ui font-strong text-fg marker:hidden [&::-webkit-details-marker]:hidden">
            <span>{it.q}</span>
            <ChevronDown aria-hidden className="size-5 shrink-0 text-fg-3 transition-transform duration-(--dur-ui) ease-out-quart group-open/acc:rotate-180" />
          </summary>
          <div className="pb-5 text-body text-fg-2">{it.a}</div>
        </details>
      ))}
    </div>
  );
}
