import { Info } from "lucide-react";
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { cn } from "./cn";

export interface FieldProps {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** Announce the error (role="alert"). Set it only after a submit attempt. */
  announceError?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label above, hint below (ink-3, 14 px), error with an Info icon. Wires aria-describedby / aria-invalid onto the child. */
export function Field({ label, htmlFor, hint, error, announceError, className, children }: FieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const child =
    isValidElement(children) && describedBy
      ? cloneElement(children as ReactElement<{ "aria-describedby"?: string; "aria-invalid"?: boolean }>, {
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : undefined,
        })
      : children;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-small font-medium text-fg">
        {label}
      </label>
      {child}
      {hint ? (
        <p id={hintId} className="text-small text-fg-3">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role={announceError ? "alert" : undefined} className="flex items-start gap-1.5 text-small font-medium text-danger dark:text-danger-night">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
