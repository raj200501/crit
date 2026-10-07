import Link from "next/link";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "link" | "danger" | "brand";
export type ButtonSize = "sm" | "md" | "lg";

// Full literal class strings (Tailwind can't see `btn-${variant}`).
const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-cta text-cta-fg shadow-glow hover:bg-cta-hover hover:[--ui-glow:rgb(127_230_197/0.85)]",
  secondary: "border border-line-strong bg-surface text-fg shadow-xs hover:border-fg/30 hover:bg-sunken",
  ghost: "text-fg hover:bg-sunken",
  link: "rounded-xs text-brand hover:text-brand-strong",
  danger: "border border-danger/40 bg-surface text-danger hover:bg-danger-bg dark:border-transparent dark:bg-danger-bg dark:hover:bg-danger-bg/85",
  brand: "bg-evergreen-600 text-white shadow-sm hover:bg-evergreen-700",
};
const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3.5 text-small",
  md: "h-11 gap-2 px-5 text-ui",
  lg: "h-13 gap-2 px-6 text-body",
};
const LINK_SIZE: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 text-small",
  md: "h-11 gap-1.5 text-ui",
  lg: "h-13 gap-2 text-body",
};

export const buttonBase =
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-medium whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,box-shadow,scale,opacity] duration-(--dur-hover) ease-out-quart " +
  "active:scale-[.98] active:duration-(--dur-press) motion-reduce:active:scale-100 " +
  // No pointer-events-none on :disabled: a native disabled button ignores clicks anyway, and the not-allowed cursor needs hit-testing.
  // Anchors can't be disabled natively, so aria-disabled ones do drop pointer events.
  "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

/** Class string for a button look on any element (e.g. a <summary> or a <label>). */
export function buttonClasses({ variant = "primary", size = "md", fullWidth, className }: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; className?: string } = {}) {
  return cn(buttonBase, variant === "link" ? LINK_SIZE[size] : SIZE[size], VARIANT[variant], fullWidth && "w-full", className);
}

interface Own {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Internal paths render next/link; http(s) and mailto: render a plain <a>. */
  href?: string;
  /** Opens in a new tab (target=_blank rel=noopener noreferrer) and adds an ArrowUpRight. */
  external?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** Keeps the width, shows a spinner, sets aria-busy and disables the button. */
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement | HTMLAnchorElement>;
}
export type ButtonProps = Own &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Own> &
  Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel" | "download" | "hrefLang">;

export function Button({
  variant = "primary",
  size = "md",
  href,
  external,
  iconLeft,
  iconRight,
  loading,
  fullWidth,
  className,
  children,
  ref,
  type,
  disabled,
  target,
  rel,
  download,
  hrefLang,
  ...rest
}: ButtonProps) {
  const classes = buttonClasses({ variant, size, fullWidth, className });
  const label =
    variant === "link" ? (
      <span className="relative before:absolute before:inset-x-0 before:-bottom-0.5 before:h-px before:bg-current before:opacity-30 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-(--dur-ui) after:ease-out-quart group-hover/btn:after:scale-x-100 group-focus-visible/btn:after:scale-x-100">
        {children}
      </span>
    ) : (
      children
    );
  const inner = (
    <>
      {iconLeft ? <span aria-hidden className={cn("inline-flex [&_svg]:size-[1.1em]", loading && "opacity-0")}>{iconLeft}</span> : null}
      <span className={cn("inline-flex items-center", loading && "opacity-0")}>{label}</span>
      {iconRight ? <span aria-hidden className={cn("inline-flex [&_svg]:size-[1.1em]", loading && "opacity-0")}>{iconRight}</span> : null}
      {external ? (
        <>
          <ArrowUpRight aria-hidden className="size-[1.05em]" />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      ) : null}
      {loading ? (
        <span className="absolute inset-0 grid place-items-center" aria-hidden>
          <LoaderCircle className="size-[1.2em] animate-spin" />
        </span>
      ) : null}
    </>
  );

  if (href && !disabled && !loading) {
    const anchorProps = {
      className: cn("group/btn", classes),
      target: external ? "_blank" : target,
      rel: external ? "noopener noreferrer" : rel,
      download,
      hrefLang,
      ...(rest as AnchorHTMLAttributes<HTMLAnchorElement>),
    };
    if (/^(https?:|mailto:|tel:)/.test(href) || download !== undefined) {
      return (
        <a ref={ref as Ref<HTMLAnchorElement>} href={href} {...anchorProps}>
          {inner}
        </a>
      );
    }
    return (
      <Link ref={ref as Ref<HTMLAnchorElement>} href={href} {...anchorProps}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type={type ?? "button"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn("group/btn", classes)}
      {...rest}
    >
      {inner}
    </button>
  );
}
