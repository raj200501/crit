import type { ReactNode } from "react";
import { cn } from "./cn";

export interface PhoneFrameProps {
  children?: ReactNode;
  /** Screen-reader description of what the phone shows. */
  label: string;
  /** Degrees of 3D tilt (0 = flat). */
  tilt?: number;
  className?: string;
}

/** A CSS phone (never an iframe: X-Frame-Options is DENY). 390:844 screen, max 320 px wide. */
export function PhoneFrame({ children, label, tilt = 0, className }: PhoneFrameProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("relative mx-auto w-full max-w-[320px]", className)}
      style={tilt ? { transform: `perspective(1600px) rotateY(${-tilt}deg) rotateX(${tilt / 3}deg)` } : undefined}
    >
      <div className="edge-highlight rounded-[44px] bg-ink p-2.5 shadow-lg ring-1 ring-black/40">
        <div data-theme="paper" className="relative aspect-[390/844] overflow-hidden rounded-[34px] bg-white text-ink">
          <div aria-hidden className="absolute top-2.5 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" />
          {children}
        </div>
      </div>
    </div>
  );
}
