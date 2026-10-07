import type { ReactNode } from "react";
import { cn } from "./cn";
import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";

export interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}

/** Eyebrow → 16 px → display title → 16 px → lead. The same stack on every marketing section. */
export function SectionHeading({ eyebrow, title, lead, align = "left", as: Tag = "h2", id, className }: SectionHeadingProps) {
  return (
    <Reveal className={cn("flex flex-col gap-4", align === "center" && "items-center text-center", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Tag id={id} className="max-w-[22ch] font-display text-display-l font-book text-fg">
        {title}
      </Tag>
      {lead ? <p className="max-w-[60ch] text-lead text-fg-2">{lead}</p> : null}
    </Reveal>
  );
}
