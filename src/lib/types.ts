export type Quality = "4K" | "1080p" | "720p" | "480p";

export interface Person {
  /** URL slug — used for /{slug}/ routes */
  slug: string;
  name: string;
  /** R2 object key once real media is wired up; null => default icon */
  avatarUrl?: string | null;
}

export interface Channel extends Person {
  videoCount: number;
}

export interface Pornstar extends Person {
  videoCount: number;
}

export interface Video {
  id: number;
  /** flat root-level slug, p4455 style: /{slug}/ — unique at DB level */
  slug: string;
  title: string;
  /** seconds */
  duration: number;
  quality: Quality;
  views: number;
  publishedAt: string; // ISO
  /** R2 key for the poster frame; null => generated placeholder */
  thumbUrl?: string | null;
  channel: Channel;
  pornstars: Pornstar[];
  tags: string[];
}
