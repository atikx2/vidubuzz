import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Original wordmark: stacked "play chevron" inside a rounded tile. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 36 36" className="h-8 w-8 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="vb-logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="55%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ff2d78" />
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="33" height="33" rx="10" fill="url(#vb-logo-g)" />
        <path d="M14.2 11.6 24 18l-9.8 6.4z" fill="#0b0b11" />
        <path d="M11.2 14.3v7.4" stroke="#0b0b11" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span className="text-[19px] font-semibold tracking-tight">
        vidu<span className="bg-gradient-to-r from-brand-400 to-accent-500 bg-clip-text text-transparent">buzz</span>
      </span>
    </span>
  );
}

export const SearchIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const AccountIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.8 20c.9-3.7 3.8-5.6 7.2-5.6s6.3 1.9 7.2 5.6" />
  </svg>
);

export const MenuIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ChevronLeft = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </svg>
);

export const ChevronRight = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M9.5 5.5 16 12l-6.5 6.5" />
  </svg>
);

export const PlayIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M8 5.3v13.4L19 12z" />
  </svg>
);

export const VideoIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="2.8" y="5.8" width="13" height="12.4" rx="2.6" />
    <path d="m16.6 13.4 4.6 2.9V7.7l-4.6 2.9z" />
  </svg>
);

/** Default avatar used when a channel/model has no uploaded image yet. */
export function DefaultAvatar({
  name,
  className = "",
  variant = "star",
}: {
  name: string;
  className?: string;
  variant?: "star" | "channel";
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full text-[10px] font-semibold text-white/90 ring-1 ring-white/10 ${className}`}
      style={{
        background:
          variant === "channel"
            ? "linear-gradient(140deg,#2a2a3b,#15151f)"
            : "linear-gradient(140deg,#3b2550,#1a1426)",
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
