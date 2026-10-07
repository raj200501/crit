import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "./cn";

const VARIANT = {
  ghost: "text-fg-2 hover:bg-sunken hover:text-fg",
  secondary: "border border-line-strong bg-surface text-fg shadow-xs hover:bg-sunken",
  primary: "bg-cta text-cta-fg hover:bg-cta-hover",
} as const;
const SIZE = { sm: "size-9 [&_svg]:size-4", md: "size-11 [&_svg]:size-5" } as const;

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Required: becomes the aria-label. */
  label: string;
  icon: ReactNode;
  size?: keyof typeof SIZE;
  variant?: keyof typeof VARIANT;
  ref?: Ref<HTMLButtonElement>;
}

/** A round icon-only button: 36 px (sm, desktop toolbars) or 44 px (md, touch). */
export function IconButton({ label, icon, size = "md", variant = "ghost", className, type, ref, ...rest }: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      aria-label={label}
      className={cn(
        "inline-grid shrink-0 cursor-pointer place-items-center rounded-full transition-[background-color,color,scale] duration-(--dur-hover) active:scale-[.96] disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:bg-sunken aria-pressed:text-fg motion-reduce:active:scale-100",
        SIZE[size],
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      <span aria-hidden className="inline-grid place-items-center">
        {icon}
      </span>
    </button>
  );
}
