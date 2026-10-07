import { useId, type ReactNode } from "react";
import type { UiStatus } from "./status";

export type GlyphShape = "circle" | "square" | "diamond";
export type GlyphStatus = UiStatus | "self";
export type GlyphTone = "paper" | "night" | "print";

export interface PedigreeGlyphProps {
  /** Map from Person.sex: female → circle, male → square, unknown → diamond. */
  shape: GlyphShape;
  status: GlyphStatus;
  /** Heart condition reported: fills the core (NSGC "affected"). Pass `view.cardiac && view.status !== "declined"`. */
  finding?: boolean;
  deceased?: boolean;
  /** A portal record backs a fact: small filled square at the top right. */
  record?: boolean;
  /** The patient: arrow at the bottom left (always drawn for status "self"). */
  proband?: boolean;
  /** Pixels for as="svg"; parent SVG units for as="g". Default 32. */
  size?: number;
  tone?: GlyphTone;
  /** "g" draws inside a parent <svg>, centred on (x, y). */
  as?: "svg" | "g";
  x?: number;
  y?: number;
  /** If set: role="img" with a <title>. Otherwise aria-hidden. */
  title?: string;
  className?: string;
}

/** Helper: Person.sex → glyph shape. */
export function shapeForSex(sex: "female" | "male" | "unknown"): GlyphShape {
  return sex === "female" ? "circle" : sex === "male" ? "square" : "diamond";
}

type Palette = {
  known: string;
  conflict: string;
  unknown: string;
  declined: string;
  pending: string;
  self: string;
  fill: string;
  finding: string;
  slash: string;
  record: string;
  recordEdge: string;
};

const PALETTE: Record<GlyphTone, Palette> = {
  paper: {
    known: "var(--color-known)",
    conflict: "var(--color-conflict)",
    unknown: "var(--color-unknown)",
    declined: "var(--color-declined)",
    pending: "var(--color-pending)",
    self: "var(--color-ink)",
    fill: "var(--color-white)",
    finding: "var(--color-finding)",
    slash: "var(--color-ink-2)",
    record: "var(--color-record)",
    recordEdge: "var(--color-white)",
  },
  night: {
    known: "var(--fht-known)",
    conflict: "var(--fht-conflict)",
    unknown: "var(--fht-unknown)",
    declined: "var(--fht-declined)",
    pending: "var(--fht-fog)",
    self: "var(--fht-light)",
    fill: "var(--color-night-900)",
    finding: "var(--color-ivory)",
    slash: "var(--color-ivory-2)",
    record: "var(--fht-record)",
    recordEdge: "var(--color-night-900)",
  },
  print: {
    known: "#000",
    conflict: "#000",
    unknown: "#555",
    declined: "#555",
    pending: "#777",
    self: "#000",
    fill: "#fff",
    finding: "#000",
    slash: "#000",
    record: "#000",
    recordEdge: "#fff",
  },
};

const R = 11; // shape radius in the −16…16 viewBox

function Shape({ shape, r = R, dx = 0, ...p }: { shape: GlyphShape; r?: number; dx?: number } & React.SVGProps<SVGElement>) {
  const props = p as React.SVGProps<SVGCircleElement & SVGRectElement & SVGPolygonElement>;
  if (shape === "circle") return <circle cx={dx} cy={0} r={r} {...props} />;
  if (shape === "square") return <rect x={dx - r} y={-r} width={r * 2} height={r * 2} rx={1.5} {...props} />;
  const d = r * 1.22; // diamonds read smaller than squares at the same radius
  return <polygon points={`${dx},${-d} ${dx + d},0 ${dx},${d} ${dx - d},0`} strokeLinejoin="round" {...props} />;
}

/**
 * One SVG grammar for nodes, panels, phone screens, the hero poster and the printed pedigree.
 * Ring = certainty, fill = heart condition reported, slash = deceased, square chip = portal record, arrow = the patient.
 */
export function PedigreeGlyph({
  shape,
  status,
  finding,
  deceased,
  record,
  proband,
  size = 32,
  tone = "paper",
  as = "svg",
  x = 0,
  y = 0,
  title,
  className,
}: PedigreeGlyphProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const c = PALETTE[tone];
  const showArrow = proband || status === "self";
  const ring: Record<GlyphStatus, string> = {
    known: c.known,
    conflicting: c.known,
    unknown: c.unknown,
    declined: c.declined,
    pending: c.pending,
    self: c.self,
  };
  const stroke = ring[status];

  const defs: ReactNode[] = [];
  let outline: ReactNode;
  if (status === "conflicting") {
    defs.push(
      <clipPath key="l" id={`${uid}-l`}>
        <rect x={-17} y={-17} width={17} height={34} />
      </clipPath>,
      <clipPath key="r" id={`${uid}-r`}>
        <rect x={0} y={-17} width={17} height={34} />
      </clipPath>,
    );
    outline = (
      <>
        <Shape shape={shape} dx={-1} fill="none" stroke={c.known} strokeWidth={2} clipPath={`url(#${uid}-l)`} />
        <Shape shape={shape} dx={1} fill="none" stroke={c.conflict} strokeWidth={2} strokeDasharray="4 3" clipPath={`url(#${uid}-r)`} />
      </>
    );
  } else if (status === "declined") {
    outline = <Shape shape={shape} fill="none" stroke={stroke} strokeWidth={1.25} />;
  } else if (status === "unknown") {
    outline = <Shape shape={shape} fill="none" stroke={stroke} strokeWidth={2} strokeDasharray="4 3" />;
  } else if (status === "pending") {
    outline = <Shape shape={shape} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="0.5 3" strokeLinecap="round" />;
  } else {
    outline = <Shape shape={shape} fill="none" stroke={stroke} strokeWidth={2} />;
  }
  if (status === "declined") {
    defs.push(
      <pattern key="h" id={`${uid}-h`} width={4} height={4} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1={0} y1={0} x2={0} y2={4} stroke={c.declined} strokeWidth={1.2} />
      </pattern>,
    );
  }

  const body = (
    <>
      {title ? <title>{title}</title> : null}
      {defs.length ? <defs>{defs}</defs> : null}
      <Shape shape={shape} fill={c.fill} stroke="none" />
      {status === "declined" ? <Shape shape={shape} fill={`url(#${uid}-h)`} fillOpacity={0.6} stroke="none" /> : null}
      {finding ? <Shape shape={shape} r={R - 3} fill={c.finding} stroke="none" /> : null}
      {outline}
      {deceased ? <line x1={-15} y1={15} x2={15} y2={-15} stroke={c.slash} strokeWidth={1.5} strokeLinecap="round" /> : null}
      {record ? <rect x={7.5} y={-15.5} width={7} height={7} rx={1} fill={c.record} stroke={c.recordEdge} strokeWidth={1.25} /> : null}
      {showArrow ? (
        <g stroke={c.self} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1={-15.5} y1={15.5} x2={-9.5} y2={9.5} />
          <polyline points="-13,9.2 -9.2,9.2 -9.2,13" />
        </g>
      ) : null}
    </>
  );

  const a11y = title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };
  if (as === "g") {
    const k = size / 32;
    return (
      <g transform={`translate(${x} ${y}) scale(${k})`} className={className} {...a11y}>
        {body}
      </g>
    );
  }
  return (
    <svg viewBox="-16 -16 32 32" width={size} height={size} fill="none" className={className} {...a11y} focusable="false">
      {body}
    </svg>
  );
}
