/**
 * Homepage section headings.
 *
 * These are intentionally kept in one place because they are SEO-visible
 * (<h2> on the homepage) AND must be editable from the admin panel later.
 * When the DB lands, this file becomes the seed/default and the admin writes
 * to a `site_sections` table with the exact same shape.
 */

export interface SectionConfig {
  key: string;
  /** rendered as <h2> — this is the one that ranks */
  heading: string;
  /** optional supporting line under the heading */
  subheading?: string;
  /** "View All" destination; omit to hide the button */
  viewAllHref?: string;
  viewAllLabel?: string;
}

export const homeSections: Record<string, SectionConfig> = {
  trendingVideos: {
    key: "trendingVideos",
    heading: "Trending Videos",
    subheading: "Most watched HD videos updated every hour",
    viewAllHref: "/videos",
    viewAllLabel: "View All",
  },
  trendingPornstars: {
    key: "trendingPornstars",
    heading: "Trending Pornstars",
    subheading: "Top rated models trending this week",
    viewAllHref: "/pornstars",
    viewAllLabel: "View All",
  },
  trendingChannels: {
    key: "trendingChannels",
    heading: "Trending Channels",
    subheading: "Popular studios and verified channels",
    viewAllHref: "/channels",
    viewAllLabel: "View All",
  },
};

/** Grid shape — desktop 4 cols x 6 rows, mobile 1 col x 24 rows */
export const GRID = {
  perPage: 24,
  desktopColumns: 4,
  desktopRows: 6,
} as const;
