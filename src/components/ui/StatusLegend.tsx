import { cn } from "./cn";
import { PedigreeGlyph, type GlyphTone } from "./PedigreeGlyph";
import { STATUS_LABEL, STATUS_LABEL_CLINICAL, type UiStatus } from "./status";

export type LegendItem = UiStatus | "finding" | "deceased" | "record" | "proband";

const DEFAULT_ITEMS: LegendItem[] = ["known", "conflicting", "unknown", "declined", "pending", "finding", "deceased", "record", "proband"];

const EXTRA_LABEL = {
  finding: "Heart condition reported",
  deceased: "Passed away",
  record: "From a portal record (demo)",
  proband: "The patient",
} as const;

export interface StatusLegendProps {
  items?: readonly LegendItem[];
  compact?: boolean;
  context?: "patient" | "clinical";
  tone?: GlyphTone;
  /** The list's accessible name (e2e contract: "Legend"). */
  label?: string;
  className?: string;
}

/** Glyph + word for every mark the pedigree uses. Required next to any pedigree. */
export function StatusLegend({ items = DEFAULT_ITEMS, compact, context = "patient", tone = "paper", label = "Legend", className }: StatusLegendProps) {
  const words = context === "clinical" ? STATUS_LABEL_CLINICAL : STATUS_LABEL;
  const size = compact ? 16 : 22;
  return (
    <ul aria-label={label} className={cn("flex flex-wrap items-center", compact ? "gap-x-3 gap-y-1 text-caption" : "gap-x-5 gap-y-2 text-small", "text-fg-2", className)}>
      {items.map((item) => {
        const glyph =
          item === "finding" ? (
            <PedigreeGlyph shape="circle" status="known" finding size={size} tone={tone} />
          ) : item === "deceased" ? (
            <PedigreeGlyph shape="square" status="known" deceased size={size} tone={tone} />
          ) : item === "record" ? (
            <PedigreeGlyph shape="square" status="known" record size={size} tone={tone} />
          ) : item === "proband" ? (
            <PedigreeGlyph shape="diamond" status="self" size={size} tone={tone} />
          ) : (
            <PedigreeGlyph shape="circle" status={item} size={size} tone={tone} />
          );
        const text = item in EXTRA_LABEL ? EXTRA_LABEL[item as keyof typeof EXTRA_LABEL] : words[item as UiStatus];
        return (
          <li key={item} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            {glyph}
            <span>{text}</span>
          </li>
        );
      })}
    </ul>
  );
}
