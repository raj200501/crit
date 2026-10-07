import { PROOF_POINTS } from "@/content/site";
import { Cite } from "../ui/Cite";
import { cn } from "../ui/cn";

/** Numbered evidence rows, each with its citation. */
export function ProofList({ items = PROOF_POINTS, className }: { items?: readonly { text: string; cite: number }[]; className?: string }) {
  return (
    <ol className={cn("flex flex-col divide-y divide-line border-y border-line", className)}>
      {items.map((p, i) => (
        <li key={p.text} className="flex gap-4 py-5">
          <span className="pt-0.5 font-mono text-small text-brand tabular-nums">{String(i + 1).padStart(2, "0")}</span>
          <p className="text-body text-fg">
            {p.text}
            <Cite n={p.cite} />
          </p>
        </li>
      ))}
    </ol>
  );
}
