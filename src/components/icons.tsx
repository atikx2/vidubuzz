import { cn } from "@/lib/utils";

/** Original wordmark: a play chevron inside a gradient tile. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 36 36" className="size-8 shrink-0" aria-hidden="true">
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
        vidu
        <span className="bg-gradient-to-r from-brand-400 to-accent-500 bg-clip-text text-transparent">
          buzz
        </span>
      </span>
    </span>
  );
}

/** Default avatar shown until a channel/model has real artwork in R2. */
export function DefaultAvatar({
  name,
  className,
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
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full text-[10px] font-semibold text-white/90 ring-1 ring-white/10",
        className,
      )}
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
