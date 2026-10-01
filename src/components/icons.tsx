// Small inline icons (no icon font, no extra dependency).
type P = { size?: number; className?: string; title?: string };

const svg = (size: number, className: string | undefined, title: string | undefined, children: React.ReactNode, viewBox = "0 0 24 24") => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    className={className}
    aria-hidden={title ? undefined : true}
    role={title ? "img" : undefined}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {title ? <title>{title}</title> : null}
    {children}
  </svg>
);

export const Heart = ({ size = 14, className, title }: P) =>
  svg(
    size,
    className,
    title,
    <path
      d="M12 20.5s-7.6-4.6-9.5-9.3C1.2 7.9 3.3 4.5 6.7 4.5c2.1 0 3.6 1.1 4.6 2.6 1-1.5 2.5-2.6 4.6-2.6 3.4 0 5.5 3.4 4.2 6.7-1.9 4.7-8.1 9.3-8.1 9.3z"
      fill="currentColor"
      stroke="none"
    />,
  );

export const Check = ({ size = 14, className, title }: P) => svg(size, className, title, <polyline points="4.5 12.5 9.5 17.5 19.5 7" />);

export const Lock = ({ size = 14, className, title }: P) =>
  svg(
    size,
    className,
    title,
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>,
  );

export const Link = ({ size = 14, className, title }: P) =>
  svg(
    size,
    className,
    title,
    <>
      <path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.2 1.2" />
      <path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.2-1.2" />
    </>,
  );

export const Plus = ({ size = 14, className, title }: P) => svg(size, className, title, <path d="M12 5v14M5 12h14" />);

export const Arrow = ({ size = 14, className, title }: P) => svg(size, className, title, <path d="M5 12h14M13 6l6 6-6 6" />);

export const Back = ({ size = 14, className, title }: P) => svg(size, className, title, <path d="M19 12H5M11 6l-6 6 6 6" />);

export const Clock = ({ size = 14, className, title }: P) =>
  svg(
    size,
    className,
    title,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>,
  );

export const Doc = ({ size = 14, className, title }: P) =>
  svg(
    size,
    className,
    title,
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>,
  );

export const Alert = ({ size = 14, className, title }: P) =>
  svg(
    size,
    className,
    title,
    <>
      <path d="M12 3 2 20h20z" />
      <path d="M12 10v4M12 17.5v.01" />
    </>,
  );

export const Close = ({ size = 14, className, title }: P) => svg(size, className, title, <path d="M6 6l12 12M18 6 6 18" />);

/** Pedigree glyph used as the logo: square + circle joined, child below. */
export const Logo = ({ size = 22, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 22 22" className={className} aria-hidden>
    <rect x="2" y="2" width="7" height="7" rx="1.5" fill="var(--accent)" />
    <circle cx="16.5" cy="5.5" r="3.5" fill="var(--accent)" />
    <path d="M5.5 9v4h11V9M11 13v3.2" stroke="var(--accent)" strokeWidth="1.8" fill="none" />
    <circle cx="11" cy="18.5" r="2.6" fill="currentColor" />
  </svg>
);
