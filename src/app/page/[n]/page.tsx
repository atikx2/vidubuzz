import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeSections from "@/components/HomeSections";
import { videos } from "@/data/mock";
import { GRID } from "@/data/site-sections";

const totalPages = Math.max(1, Math.ceil(videos.length / GRID.perPage));

interface Props {
  params: Promise<{ n: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  const page = Number.parseInt(n, 10);
  return {
    title: `Trending Videos — Page ${page}`,
    alternates: { canonical: `/page/${page}/` },
    // paginated pages stay crawlable but out of the index
    robots: { index: false, follow: true },
  };
}

export default async function PaginatedHome({ params }: Props) {
  const { n } = await params;
  const page = Number.parseInt(n, 10);
  if (!Number.isFinite(page) || page < 1 || page > totalPages) notFound();
  return <HomeSections page={page} />;
}
