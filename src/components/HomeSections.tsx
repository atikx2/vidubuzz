import { getVideoPage, trendingChannels, trendingPornstars } from "@/data/mock";
import { GRID, homeSections } from "@/data/site-sections";
import Pagination from "./Pagination";
import PersonCard from "./PersonCard";
import SectionHeader from "./SectionHeader";
import VideoCard from "./VideoCard";
import { Reveal, RevealGrid, RevealItem } from "./motion/Reveal";

export default function HomeSections({ page }: { page: number }) {
  const { items, page: current, totalPages } = getVideoPage(page, GRID.perPage);

  const personGrid = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7">
      {/* ---------------- Trending Videos ---------------- */}
      <section aria-labelledby="sec-trending-videos">
        <div id="sec-trending-videos">
          <SectionHeader section={homeSections.trendingVideos} />
        </div>

        {/* Mobile 1 col x 24 rows · Desktop 4 cols x 6 rows */}
        <RevealGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((v) => (
            <RevealItem key={v.id}>
              <VideoCard video={v} />
            </RevealItem>
          ))}
        </RevealGrid>

        <Pagination page={current} totalPages={totalPages} basePath="/" />
      </section>

      {/* ---------------- Trending Pornstars ---------------- */}
      <section aria-labelledby="sec-trending-pornstars" className="mt-14">
        <Reveal>
          <div id="sec-trending-pornstars">
            <SectionHeader section={homeSections.trendingPornstars} />
          </div>
        </Reveal>

        <RevealGrid className={personGrid}>
          {trendingPornstars.map((p) => (
            <RevealItem key={p.slug}>
              <PersonCard person={p} kind="pornstar" />
            </RevealItem>
          ))}
        </RevealGrid>
      </section>

      {/* ---------------- Trending Channels ---------------- */}
      <section aria-labelledby="sec-trending-channels" className="mt-14">
        <Reveal>
          <div id="sec-trending-channels">
            <SectionHeader section={homeSections.trendingChannels} />
          </div>
        </Reveal>

        <RevealGrid className={personGrid}>
          {trendingChannels.map((c) => (
            <RevealItem key={c.slug}>
              <PersonCard person={c} kind="channel" />
            </RevealItem>
          ))}
        </RevealGrid>
      </section>
    </div>
  );
}
