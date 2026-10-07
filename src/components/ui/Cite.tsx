import { Fragment } from "react";
import { cn } from "./cn";

/** Superscript source link(s) into /research#source-N. Arrays render "87, 32". Never below 12 px (DESIGN §3.2 type floor). */
export function Cite({ n, label, className }: { n: number | readonly number[]; label?: string; className?: string }) {
  const list = typeof n === "number" ? [n] : n;
  return (
    <sup className={cn("ml-0.5 font-mono text-[max(0.7em,12px)] font-medium text-brand", className)}>
      {list.map((k, i) => (
        <Fragment key={k}>
          {i > 0 ? ", " : null}
          <a href={`/research#source-${k}`} aria-label={label ? `${label}, source ${k}` : `Source ${k}`} className="underline-offset-2 hover:underline">
            {k}
          </a>
        </Fragment>
      ))}
    </sup>
  );
}
