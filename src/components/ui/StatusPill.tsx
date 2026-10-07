import { cn } from "./cn";
import { STATUS_CHIP, STATUS_ICON, STATUS_LABEL, STATUS_LABEL_CLINICAL, type UiStatus } from "./status";

export interface StatusPillProps {
  status: UiStatus;
  /** "clinical" says "Declined to share" instead of "Chose not to share". */
  context?: "patient" | "clinical";
  size?: "sm" | "md";
  label?: string;
  className?: string;
}

/** Icon + word, never color alone. */
export function StatusPill({ status, context = "patient", size = "md", label, className }: StatusPillProps) {
  const Icon = STATUS_ICON[status];
  const text = label ?? (context === "clinical" ? STATUS_LABEL_CLINICAL : STATUS_LABEL)[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium whitespace-nowrap ring-1 ring-inset",
        size === "sm" ? "h-6 px-2 text-caption [&_svg]:size-3.5" : "h-7 px-2.5 text-small [&_svg]:size-4",
        STATUS_CHIP[status],
        className,
      )}
    >
      <Icon aria-hidden strokeWidth={2.25} />
      {text}
    </span>
  );
}
