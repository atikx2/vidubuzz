import type { Metadata } from "next";
import { notFound } from "next/navigation";

import HomeSections from "@/components/HomeSections";
import { videos } from "@/data/mock";
import { GRID } from "@/data/site-sections";

const totalPages = Math.max(1, Math.ceil(videos.length / GRID.perPage));

/**
 * Prerender every pagination page at build time.
 *
 * This is the whole trick for staying inside the 10 ms CPU budget: the
 * Worker never renders these at request time, it just hands back a file
 * that already exists. Static asset responses do not burn Worker CPU.
 */
export function generateStaticParams() {
  return Array.from({ length: totalPages - 1 }, (_, i) => ({ n: String(i + 2) }));
}

/** Anything not prerendered 404s instead of falling back to SSR. */
export const dynamicParams = false;
export const dynamic = "force-static";

interface Props {
  params: Promise<{ n: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  const page = Number.parseInt(n, 10);
  return {
    title: `Trending Videos — Page ${page}`,
    alternates: { canonical: `/page/${page}/` },
    // crawlable, but kept out of the index so near-duplicate pages
    // don't eat crawl budget
    robots: { index: false, follow: true },
  };
}

export default async function PaginatedHome({ params }: Props) {
  const { n } = await params;
  const page = Number.parseInt(n, 10);
  if (!Number.isFinite(page) || page < 2 || page > totalPages) notFound();
  return <HomeSections page={page} />;
}
