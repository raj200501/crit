import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../ui/cn";

export const STEP_COUNT = 4;

/**
 * Back + four thin segments + "STEP 2 OF 4 · PICK WHAT TO SHARE". Rendered in the shell's <header> on the four numbered
 * steps (hidden on welcome and sent), so it stays mounted between steps and the segment fill glides (scale, 280 ms).
 */
export function ProgressHeader({ index, label, onBack }: { index: number; label: string; onBack: () => void }) {
  return (
    <div className="border-b border-line px-4 pt-1.5 pb-3 sm:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack} iconLeft={<ChevronLeft strokeWidth={2.25} />} className="-ml-3 gap-1 pr-3.5 pl-2">
          Back
        </Button>
        <div aria-hidden className="grid flex-1 grid-cols-4 gap-1.5">
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <span key={i} className="h-1 overflow-hidden rounded-full bg-mist-2">
              <span
                className={cn(
                  "block h-full origin-left rounded-full bg-evergreen-600 transition-transform duration-(--dur-panel) ease-out-quart",
                  i < index ? "scale-x-100" : "scale-x-0",
                )}
              />
            </span>
          ))}
        </div>
      </div>
      <p className="mt-1 font-mono text-eyebrow font-medium text-fg-3 uppercase">
        <span className="text-fg">
          Step {index} of {STEP_COUNT}
        </span>{" "}
        · {label}
      </p>
    </div>
  );
}
