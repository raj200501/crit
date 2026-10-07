import type { ReactNode } from "react";
import { Lockup } from "../brand/Lockup";
import { Card } from "../ui/Card";
import { HonestyRibbon } from "../ui/HonestyRibbon";
import { AskerMark } from "./AskerMark";

/**
 * The relative's phone shell (DESIGN §12.6): honesty ribbon, a 56 px bar (Lockup · "for {asker}"), an optional progress
 * header, then one task per screen in <main>. Phones get the full screen; from 640 px the same 440 px column sits in an
 * overlay card on the aurora, so it still reads as a phone. `overflow-clip` (not hidden) keeps sticky action bars working.
 */
export function Frame({ asker, progress, children }: { asker?: string; progress?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface sm:aurora sm:px-6 sm:py-10 lg:py-14">
      <Card
        tier="overlay"
        className="mx-auto flex w-full flex-1 flex-col overflow-clip sm:max-w-[440px] sm:flex-none sm:rounded-xl sm:min-h-[min(844px,calc(100dvh-5rem))] max-sm:rounded-none max-sm:border-0 max-sm:shadow-none"
      >
        <header data-shell="relative" className="bg-surface">
          <HonestyRibbon />
          <div className="flex h-14 items-center justify-between gap-3 border-b border-line px-4 sm:px-6">
            <Lockup href="/" size={24} surface="white" />
            {asker ? (
              <p className="flex min-w-0 items-center gap-2 text-small text-fg-2">
                <AskerMark name={asker} size="sm" />
                <span className="truncate">
                  for <span className="font-strong text-fg">{asker}</span>
                </span>
              </p>
            ) : null}
          </div>
          {progress}
        </header>
        <main id="main" tabIndex={-1} className="flex flex-1 flex-col px-4 text-[17px] leading-[1.55] sm:px-6">
          {children}
        </main>
      </Card>
      <p className="mt-6 hidden text-center text-caption text-fg-3 sm:block">Stemma, the family health tree · a student prototype by Team 709 · No account. No app.</p>
    </div>
  );
}
