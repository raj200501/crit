import { cn } from "../ui/cn";

const SIZE = {
  // the diamond is a square rotated 45°: its diagonal spans the box (side × √2 ≈ box)
  lg: { box: "size-14", diamond: "inset-[8px] rounded-[9px]", text: "text-[1.375rem]" },
  sm: { box: "size-7", diamond: "inset-[4px] rounded-[5px]", text: "text-[0.8125rem]" },
} as const;

/**
 * The asker's initial inside an evergreen diamond: the proband mark from the logo, because in their own tree the asker
 * is "you". Decorative (the name is always written next to it).
 */
export function AskerMark({ name, size = "lg", className }: { name: string; size?: keyof typeof SIZE; className?: string }) {
  const s = SIZE[size];
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  return (
    <span aria-hidden className={cn("relative inline-grid shrink-0 place-items-center", s.box, className)}>
      <span
        className={cn(
          "absolute rotate-45 bg-evergreen-600",
          s.diamond,
          size === "lg" && "shadow-[0_10px_28px_-6px_rgb(127_230_197/0.9),inset_0_1px_0_rgb(255_255_255/0.22)]",
        )}
      />
      <span className={cn("relative font-display leading-none font-medium text-white", s.text)}>{initial}</span>
    </span>
  );
}
