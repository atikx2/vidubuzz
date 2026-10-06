/**
 * Storage layer — deliberately provider-agnostic.
 *
 * Backblaze B2 and Cloudflare R2 are both S3-compatible and both serve plain
 * HTTPS GETs, so nothing in the app needs to know which one is behind it.
 * Switching providers is an env-var change, not a code change.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * WHY THERE ARE **TWO** BASE URLS
 * ──────────────────────────────────────────────────────────────────────────
 * Cloudflare's Self-Serve Subscription Agreement says you must buy a paid
 * service (Developer Platform / Images / Stream) to serve *video and other
 * large files* through their CDN. Small images that are part of a web page
 * are normal CDN traffic; a tube site's worth of MP4s is not. Cloudflare does
 * enforce this — offending accounts get video requests redirected to
 * `cloudflare-terms-of-service-abuse.com/streaming.mp4`.
 *
 * So:
 *   IMAGE_BASE  → may sit behind Cloudflare (proxied / orange cloud). Small files.
 *   VIDEO_BASE  → must NOT be proxied by Cloudflare on a free plan. Point it
 *                 straight at the storage provider's own hostname, or at a
 *                 DNS-only (grey cloud) subdomain.
 *
 * Once the account is on Workers Paid, both can be moved onto R2 behind
 * Cloudflare by changing these two variables to the same value.
 */

/**
 * Each base may be a comma-separated list of origins, e.g.
 *   NEXT_PUBLIC_VIDEO_BASE="https://v1.vidubuzz.com,https://v2.vidubuzz.com"
 *
 * Files are spread across them by a hash of the object key, so a given file
 * always resolves to the same origin (stable URLs => stable CDN cache, stable
 * SEO). Useful for spreading a library over several buckets or providers, or
 * for migrating B2 -> R2 one shard at a time.
 */
function parseBases(v: string | undefined): string[] {
  return (v ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

/** Images: thumbnails, storyboard frames, avatars. */
export const IMAGE_BASES = parseBases(process.env.NEXT_PUBLIC_IMAGE_BASE);

/** Video: the MP4 renditions. */
export const VIDEO_BASES = parseBases(process.env.NEXT_PUBLIC_VIDEO_BASE);

/** First origin, or "" — kept for callers that just want "is it configured". */
export const IMAGE_BASE = IMAGE_BASES[0] ?? "";
export const VIDEO_BASE = VIDEO_BASES[0] ?? "";

/** FNV-1a. Small, stable across runtimes, good enough to spread keys evenly. */
function hashKey(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministically pick one origin for a key. */
function pickBase(bases: string[], key: string): string | null {
  if (bases.length === 0) return null;
  if (bases.length === 1) return bases[0];
  return bases[hashKey(key) % bases.length];
}

/**
 * letsporn-style bucketing: 1,000 ids per directory. Keeps any single prefix
 * listable and keeps B2/R2 key distribution even.
 *   id 1234 -> 1000,  id 999 -> 0,  id 2_500_000 -> 2500000
 */
export function idBucket(id: number): number {
  return Math.floor(id / 1000) * 1000;
}

/** Thumbnail sizes we pre-generate. No on-the-fly resizing: that costs money. */
export const THUMB = {
  /** main grid card */
  grid: "360x203",
  /** related / sidebar */
  related: "240x135",
} as const;

export type ThumbSize = (typeof THUMB)[keyof typeof THUMB];

/** Video renditions, p4455-style progressive MP4 (no HLS while on free tiers). */
export const RENDITIONS = ["480p", "720p", "1080p"] as const;
export type Rendition = (typeof RENDITIONS)[number];

/* ── key builders ────────────────────────────────────────────────────────── */

/** Poster / grid thumbnail. `frame` 1..10 gives the hover storyboard frames. */
export function thumbKey(id: number, size: ThumbSize = THUMB.grid, frame = 1): string {
  return `contents/videos_screenshots/${idBucket(id)}/${id}/${size}/${frame}.jpg`;
}

/** Short silent loop shown on hover. */
export function previewKey(id: number): string {
  return `previews/${idBucket(id)}/${id}/preview.mp4`;
}

/** A playable rendition. */
export function videoKey(id: number, rendition: Rendition): string {
  return `videos/${idBucket(id)}/${id}/${id}_${rendition}.mp4`;
}

/** Model / channel avatar. */
export function avatarKey(kind: "models" | "content_sources", id: number): string {
  return `${kind}/${idBucket(id)}/${id}/avatar.jpg`;
}

/* ── url builders ────────────────────────────────────────────────────────── */

/**
 * Absolute URL for an image key. Returns null when no base is configured yet,
 * which is the current state — callers fall back to the CSS gradient
 * placeholder, so the site works with zero storage wired up.
 */
export function imageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (/^https?:\/\//.test(key)) return key;
  const base = pickBase(IMAGE_BASES, key);
  return base ? `${base}/${key.replace(/^\/+/, "")}` : null;
}

/** Absolute URL for a video key. Null until VIDEO_BASE is configured. */
export function videoUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (/^https?:\/\//.test(key)) return key;
  const base = pickBase(VIDEO_BASES, key);
  return base ? `${base}/${key.replace(/^\/+/, "")}` : null;
}

/**
 * Every rendition that exists for a video, highest quality last.
 * `available` comes from the DB; we never guess, because a 404 inside a
 * <video> element is a silent failure for the user.
 */
export function videoSources(
  id: number,
  available: readonly Rendition[],
): { rendition: Rendition; src: string }[] {
  return available
    .filter((r) => RENDITIONS.includes(r))
    .sort((a, b) => RENDITIONS.indexOf(a) - RENDITIONS.indexOf(b))
    .map((r) => ({ rendition: r, src: videoUrl(videoKey(id, r)) ?? "" }))
    .filter((s) => s.src !== "");
}

/** True once real media is wired up — handy for conditional UI. */
export const mediaConfigured = IMAGE_BASES.length > 0;
export const videoConfigured = VIDEO_BASES.length > 0;
