// Status vocabulary shared by StatusPill, PedigreeGlyph and StatusLegend (DESIGN §3.1, AMENDMENTS A3).
import { ArrowLeftRight, Check, CircleQuestionMark, Ellipsis, Lock, type LucideIcon } from "lucide-react";

export type UiStatus = "known" | "conflicting" | "unknown" | "declined" | "pending";

export const STATUS_LABEL: Record<UiStatus, string> = {
  known: "Known",
  conflicting: "Reports disagree",
  unknown: "Unknown",
  declined: "Chose not to share",
  pending: "Not asked yet",
};
/** The clinical document says "Declined to share"; everything else is the same word. */
export const STATUS_LABEL_CLINICAL: Record<UiStatus, string> = { ...STATUS_LABEL, declined: "Declined to share" };

export const STATUS_ICON: Record<UiStatus, LucideIcon> = {
  known: Check,
  conflicting: ArrowLeftRight,
  unknown: CircleQuestionMark,
  declined: Lock,
  pending: Ellipsis,
};

/** Chip text + background + 1 px ring, as full literal class strings. */
export const STATUS_CHIP: Record<UiStatus, string> = {
  known: "bg-known-bg text-known-ink ring-known/45",
  conflicting: "bg-conflict-bg text-conflict-ink ring-conflict/55",
  unknown: "bg-unknown-bg text-unknown-ink ring-unknown/45",
  declined: "bg-declined-bg text-declined-ink ring-declined/50",
  pending: "bg-pending-bg text-pending-ink ring-pending/45",
};
export const STATUS_TEXT: Record<UiStatus, string> = {
  known: "text-known-ink",
  conflicting: "text-conflict-ink",
  unknown: "text-unknown-ink",
  declined: "text-declined-ink",
  pending: "text-pending-ink",
};
