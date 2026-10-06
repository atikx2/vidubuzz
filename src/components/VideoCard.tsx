import Link from "next/link";
import type { Video } from "@/lib/types";
import { formatDuration, formatViews, placeholderGradient, timeAgo } from "@/lib/format";
import { DefaultAvatar, PlayIcon } from "./icons";
import MetaScroller from "./MetaScroller";

export default function VideoCard({ video }: { video: Video }) {
  const href = `/${video.slug}/`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-ink-850 ring-1 ring-white/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-20px_rgba(168,85,247,0.55)] hover:ring-brand-500/35">
      {/* ---- thumbnail (16:9, wide) ---- */}
      <Link href={href} className="relative block aspect-video overflow-hidden" title={video.title}>
        {video.thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbUrl}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden="true"
            className="block h-full w-full transition-transform duration-500 group-hover:scale-105"
            style={{ background: placeholderGradient(video.id) }}
          />
        )}

        {/* readability veil */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />

        {/* play affordance */}
        <span className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="grid h-12 w-12 translate-y-1 scale-90 place-items-center rounded-full bg-black/45 text-white opacity-0 ring-1 ring-white/25 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
            <PlayIcon className="ml-0.5 h-5 w-5" />
          </span>
        </span>

        {/* quality */}
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
          {video.quality}
        </span>

        {/* duration */}
        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white ring-1 ring-white/10 backdrop-blur-sm">
          {formatDuration(video.duration)}
        </span>

        {/* views + age */}
        <span className="absolute bottom-2 left-2 text-[11px] font-medium text-white/85 drop-shadow">
          {formatViews(video.views)} views · {timeAgo(video.publishedAt)}
        </span>
      </Link>

      {/* ---- body ---- */}
      <div className="flex flex-col gap-2 px-3 pb-3 pt-2.5">
        {/* title: strictly one line, ellipsis on overflow */}
        <h3 className="min-w-0">
          <Link
            href={href}
            title={video.title}
            className="block truncate text-[13.5px] font-medium leading-5 text-white/92 transition-colors hover:text-brand-400"
          >
            {video.title}
          </Link>
        </h3>

        {/* channel + pornstars — scrolls when it overflows */}
        <MetaScroller>
          <Link
            href={`/channels/${video.channel.slug}/`}
            title={video.channel.name}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.05] py-[3px] pl-[3px] pr-2.5 text-[11.5px] text-mute-300 ring-1 ring-white/[0.07] transition-colors hover:bg-white/[0.09] hover:text-white"
          >
            <DefaultAvatar name={video.channel.name} variant="channel" className="h-[18px] w-[18px] text-[8px]" />
            <span className="whitespace-nowrap">{video.channel.name}</span>
          </Link>

          {video.pornstars.map((p) => (
            <Link
              key={p.slug}
              href={`/pornstars/${p.slug}/`}
              title={p.name}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.05] py-[3px] pl-[3px] pr-2.5 text-[11.5px] text-mute-300 ring-1 ring-white/[0.07] transition-colors hover:bg-white/[0.09] hover:text-white"
            >
              <DefaultAvatar name={p.name} variant="star" className="h-[18px] w-[18px] text-[8px]" />
              <span className="whitespace-nowrap">{p.name}</span>
            </Link>
          ))}
        </MetaScroller>
      </div>
    </article>
  );
}
