import type { ReactNode } from "react";
import { cn } from "./cn";

export type SectionTheme = "paper" | "white" | "mist" | "night";

const THEME = {
  paper: "",
  white: "bg-white",
  mist: "bg-mist",
  night: "",
} as const;

export interface SectionProps {
  id?: string;
  theme?: SectionTheme;
  grain?: boolean;
  /** What the floating SiteNav should look like over this band. Defaults to the band's theme. */
  navTheme?: "paper" | "night";
  "aria-labelledby"?: string;
  "aria-label"?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * A page band. Night bands set data-theme="night", so every primitive inside switches through the --ui-* vars.
 * SiteNav watches data-nav-theme to turn into night glass over dark bands.
 */
export function Section({ id, theme = "paper", grain, navTheme, className, children, ...aria }: SectionProps) {
  const dataTheme = theme === "night" ? "night" : "paper";
  return (
    <section
      id={id}
      data-theme={dataTheme}
      data-nav-theme={navTheme ?? dataTheme}
      className={cn("bg-bg py-20 text-fg lg:py-32", THEME[theme], grain && "grain", className)}
      {...aria}
    >
      {children}
    </section>
  );
}
