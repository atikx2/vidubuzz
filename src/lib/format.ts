/** 7382 -> "7.4K", 1_250_000 -> "1.3M" */
export function formatViews(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const v = n / 1000;
    return `${v < 10 ? v.toFixed(1).replace(/\.0$/, "") : Math.round(v)}K`;
  }
  const v = n / 1_000_000;
  return `${v < 10 ? v.toFixed(1).replace(/\.0$/, "") : Math.round(v)}M`;
}

/** 419 -> "6:59", 4215 -> "1:10:15" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** ISO date -> "3 days ago" (stable, no locale drift between server/client) */
export function timeAgo(iso: string, now = Date.UTC(2026, 9, 7)): string {
  const diff = Math.max(0, now - Date.parse(iso));
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

/**
 * Deterministic placeholder artwork until R2 media is wired up.
 * Same id always yields the same gradient, so SSR and client agree.
 */
export function placeholderGradient(seed: number | string): string {
  const s = typeof seed === "number" ? seed : [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const h1 = (s * 47) % 360;
  const h2 = (h1 + 55 + (s % 45)) % 360;
  return `linear-gradient(135deg, hsl(${h1} 62% 26%) 0%, hsl(${h2} 58% 14%) 55%, hsl(${(h2 + 25) % 360} 50% 9%) 100%)`;
}
