// content/site.ts names icons as strings (so it stays free of React); components map them here.
import { Download, EyeOff, FileText, Link2, Lock, Network, QrCode, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";

export const ICONS = { Download, EyeOff, FileText, Link2, Lock, Network, QrCode, ShieldCheck, Smartphone } as const satisfies Record<string, LucideIcon>;
export type IconName = keyof typeof ICONS;

export function iconFor(icon: IconName | LucideIcon | undefined): LucideIcon | undefined {
  if (!icon) return undefined;
  return typeof icon === "string" ? ICONS[icon] : icon;
}
