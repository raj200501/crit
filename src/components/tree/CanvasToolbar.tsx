"use client";

import { Keyboard, List, LocateFixed, Maximize2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Kbd } from "@/components/ui/Kbd";
import { Popover } from "@/components/ui/Popover";

export interface CanvasToolbarProps {
  zoom: number | null;
  onFit: () => void;
  onCenter?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  /** Desktop only: switch to the list view (phones use the Tree | List control above the canvas). */
  onShowList?: () => void;
}

// 44 px on phones, 36 px from 1024 px (desktop toolbars only, DESIGN §6.4).
const ICON = "lg:size-9 lg:[&_svg]:size-4";

/** The floating glass toolbar at the canvas's bottom centre (DESIGN §12.1). */
export function CanvasToolbar({ zoom, onFit, onCenter, onZoomIn, onZoomOut, onShowList }: CanvasToolbarProps) {
  return (
    <div data-no-pan className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center px-3">
      <div
        role="group"
        aria-label="Canvas controls"
        className="glass pointer-events-auto flex items-center gap-0.5 rounded-full border border-line p-1 shadow-md"
      >
        <IconButton label="Fit" title="Fit (0)" icon={<Maximize2 />} onClick={onFit} className={ICON} />
        {onCenter ? <IconButton label="Center on me" title="Center on me (C)" icon={<LocateFixed />} onClick={onCenter} className={ICON} /> : null}
        <span aria-hidden className="mx-1 h-5 w-px bg-line-strong" />
        <IconButton label="Zoom out" title="Zoom out (−)" icon={<Minus />} onClick={onZoomOut} className={ICON} />
        <span aria-hidden className="w-11 text-center font-mono text-caption text-fg-2 tabular-nums">
          {zoom == null ? "" : `${zoom}%`}
        </span>
        <IconButton label="Zoom in" title="Zoom in (+)" icon={<Plus />} onClick={onZoomIn} className={ICON} />
        {onShowList ? (
          <>
            <span aria-hidden className="mx-1 h-5 w-px bg-line-strong max-lg:hidden" />
            <Button variant="ghost" size="sm" aria-pressed={false} iconLeft={<List />} onClick={onShowList} className="max-lg:hidden">
              List view
            </Button>
            <Popover
              align="end"
              label="Keyboard shortcuts"
              trigger={{
                variant: "ghost",
                size: "sm",
                "aria-label": "Keyboard shortcuts",
                title: "Keyboard shortcuts",
                className: "size-9 px-0 text-fg-2 max-lg:hidden",
                label: <Keyboard aria-hidden className="size-4" />,
              }}
            >
              <div className="w-64 p-2">
                <p className="pb-2 font-mono text-eyebrow text-fg-3 uppercase">On the canvas</p>
                <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 text-small text-fg-2">
                  <dt className="flex gap-1">
                    <Kbd>←</Kbd>
                    <Kbd>→</Kbd>
                  </dt>
                  <dd>Move between relatives</dd>
                  <dt className="flex gap-1">
                    <Kbd>Enter</Kbd>
                  </dt>
                  <dd>Open details</dd>
                  <dt className="flex gap-1">
                    <Kbd>+</Kbd>
                    <Kbd>−</Kbd>
                  </dt>
                  <dd>Zoom</dd>
                  <dt>
                    <Kbd>0</Kbd>
                  </dt>
                  <dd>Fit the tree</dd>
                  <dt>
                    <Kbd>C</Kbd>
                  </dt>
                  <dd>Center on me</dd>
                  <dt className="font-mono text-caption text-fg-2">Drag</dt>
                  <dd>Pan (or scroll the wheel)</dd>
                </dl>
              </div>
            </Popover>
          </>
        ) : null}
      </div>
    </div>
  );
}
