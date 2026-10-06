import type { Channel, Pornstar, Quality, Video } from "@/lib/types";

/**
 * Placeholder catalogue used until the real ingestion pipeline lands.
 * Names/titles here are invented filler — they exist only to exercise the
 * layout (truncation, overflow scrolling, pagination). Real rows will come
 * from the licensed studio feed importer.
 */

// deterministic PRNG so SSR and client render identically
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const CHANNEL_NAMES = [
  "Velvet Studio", "Northline Media", "Aurora Films", "Crimson Lane",
  "Blue Harbour", "Still Water Pictures", "Lumen House", "Paper Moon",
  "Ember & Oak", "Nightfall Collective", "Golden Ratio", "Soft Focus Co",
];

const STAR_NAMES = [
  "Ava Lindgren", "Mira Castellanos", "Noa Feldmann", "Iris Wang",
  "Lena Moreau", "Sasha Petrov", "Nadia Rahman", "Elif Demir",
  "Kira Novak", "Yuki Tanaka", "Rosa Delgado", "Freya Olsen",
  "Talia Okafor", "Juno Bellini", "Esme Laurent", "Nina Kovac",
];

const TITLE_PARTS_A = [
  "Golden hour rooftop session with", "Slow morning light and", "Behind the scenes cut featuring",
  "Rainy window afternoon starring", "Studio test reel with", "Unedited long take with",
  "Late night city lights and", "Quiet countryside weekend with", "First collaboration between",
  "Director's extended cut featuring", "Candid handheld footage of", "Soft lamp interior shoot with",
];

const TITLE_PARTS_B = [
  "shot entirely on location in a converted warehouse loft",
  "with natural light only and no colour grading applied",
  "in a single unbroken ninety second take",
  "using the new anamorphic lens package",
  "during the summer production block",
  "featuring an extended conversation segment",
  "recorded in full 4K at high frame rate",
  "as part of the ongoing documentary series",
];

const TAGS = [
  "amateur", "hd", "4k", "romantic", "outdoor", "pov", "solo", "couple",
  "vertical", "behind-the-scenes", "long-form", "studio", "natural-light", "handheld",
];

const QUALITIES: Quality[] = ["4K", "1080p", "720p", "480p"];

export const channels: Channel[] = CHANNEL_NAMES.map((name, i) => ({
  slug: slugify(name),
  name,
  avatarUrl: null,
  videoCount: 120 + ((i * 337) % 2400),
}));

export const pornstars: Pornstar[] = STAR_NAMES.map((name, i) => ({
  slug: slugify(name),
  name,
  avatarUrl: null,
  videoCount: 8 + ((i * 53) % 190),
}));

const TOTAL_VIDEOS = 480;

export const videos: Video[] = Array.from({ length: TOTAL_VIDEOS }, (_, i) => {
  const r = rng(i + 1);
  const id = 10_000 + i;
  const a = TITLE_PARTS_A[Math.floor(r() * TITLE_PARTS_A.length)];
  const star0 = STAR_NAMES[Math.floor(r() * STAR_NAMES.length)];
  // ~45% get a long tail so we can see 1-line truncation working
  const tail = r() < 0.45 ? ` ${TITLE_PARTS_B[Math.floor(r() * TITLE_PARTS_B.length)]}` : "";
  const title = `${a} ${star0}${tail}`;

  // 1-5 pornstars; the high end is what makes the meta row overflow & scroll
  const starCount = 1 + Math.floor(r() * 5);
  const picked = new Set<number>();
  while (picked.size < starCount) picked.add(Math.floor(r() * STAR_NAMES.length));

  const tagCount = 2 + Math.floor(r() * 4);
  const pickedTags = new Set<string>();
  while (pickedTags.size < tagCount) pickedTags.add(TAGS[Math.floor(r() * TAGS.length)]);

  const minutesAgo = Math.floor(r() * 60 * 24 * 300);

  return {
    id,
    slug: `${slugify(title).slice(0, 72).replace(/-$/, "")}-${id}`,
    title,
    duration: 120 + Math.floor(r() * 3400),
    quality: QUALITIES[Math.floor(r() * QUALITIES.length)],
    views: 400 + Math.floor(r() * 900_000),
    publishedAt: new Date(Date.UTC(2026, 9, 7) - minutesAgo * 60_000).toISOString(),
    thumbUrl: null,
    channel: channels[Math.floor(r() * channels.length)],
    pornstars: [...picked].map((n) => pornstars[n]),
    tags: [...pickedTags],
  } satisfies Video;
});

export function getVideoPage(page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(videos.length / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * perPage;
  return {
    items: videos.slice(start, start + perPage),
    page: current,
    totalPages,
    totalItems: videos.length,
  };
}

export const trendingPornstars = pornstars.slice(0, 12);
export const trendingChannels = channels.slice(0, 12);
