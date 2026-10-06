import { getVideoPage, trendingChannels, trendingPornstars } from "@/data/mock";
import { GRID, homeSections } from "@/data/site-sections";
import Pagination from "./Pagination";
import PersonCard from "./PersonCard";
import SectionHeader from "./SectionHeader";
import VideoGrid from "./VideoGrid";

export default function HomeSections({ page }: { page: number }) {
  const { items, page: current, totalPages } = getVideoPage(page, GRID.perPage);

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7">
      {/* ---------- Trending Videos ---------- */}
      <section aria-labelledby="sec-trending-videos">
        <div id="sec-trending-videos">
          <SectionHeader section={homeSections.trendingVideos} />
        </div>
        <VideoGrid videos={items} />
        <Pagination page={current} totalPages={totalPages} basePath="/" />
      </section>

      {/* ---------- Trending Pornstars ---------- */}
      <section aria-labelledby="sec-trending-pornstars" className="mt-14">
        <div id="sec-trending-pornstars">
          <SectionHeader section={homeSections.trendingPornstars} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {trendingPornstars.map((p) => (
            <PersonCard key={p.slug} person={p} kind="pornstar" />
          ))}
        </div>
      </section>

      {/* ---------- Trending Channels ---------- */}
      <section aria-labelledby="sec-trending-channels" className="mt-14">
        <div id="sec-trending-channels">
          <SectionHeader section={homeSections.trendingChannels} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {trendingChannels.map((c) => (
            <PersonCard key={c.slug} person={c} kind="channel" />
          ))}
        </div>
      </section>
    </div>
  );
}
