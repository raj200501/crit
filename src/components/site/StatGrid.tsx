import { STATS } from "@/content/site";
import { cn } from "../ui/cn";
import { StatTicker } from "../ui/StatTicker";

export interface Stat {
  id: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  bar?: boolean;
  label: string;
  source: string;
  cite: number;
}

/** 4 / 2 / 1 columns of cited stats with range bars. `animated={false}` renders static numerals (no tickers). */
export function StatGrid({ stats = STATS, animated = true, className }: { stats?: readonly Stat[]; animated?: boolean; className?: string }) {
  return (
    <div className={cn("grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((s) => (
        <StatTicker
          key={s.id}
          value={s.value}
          decimals={s.decimals}
          prefix={s.prefix}
          suffix={s.suffix}
          bar={s.bar}
          label={s.label}
          source={s.source}
          cite={s.cite}
          animated={animated}
          className="min-w-0"
        />
      ))}
    </div>
  );
}
