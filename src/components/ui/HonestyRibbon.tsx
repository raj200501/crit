import { HONESTY } from "@/content/site";

/** The synthetic-demo notice on app routes and /invite. Render it inside <header> so axe's `region` rule passes. */
export function HonestyRibbon() {
  return (
    <div role="note" className="flex min-h-8 items-center justify-center bg-mist px-4 py-1.5 text-left text-caption text-ink-2 sm:text-center print:hidden">
      <p className="flex items-baseline gap-2">
        <span aria-hidden className="relative -top-px inline-block size-1.5 shrink-0 rounded-full bg-evergreen-600" />
        <span>{HONESTY.ribbon}</span>
      </p>
    </div>
  );
}
