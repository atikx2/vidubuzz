import Link from "next/link";
import { Play } from "lucide-react";

import type { Video } from "@/lib/types";
import { formatDuration, formatViews, placeholderGradient, timeAgo } from "@/lib/format";
import { DefaultAvatar } from "./icons";
import MetaScroller from "./MetaScroller";
import HoverCard from "./motion/HoverCard";
import { Badge } from "./ui/badge";

export default function VideoCard({ video }: { video: Video }) {
  const href = `/${video.slug}/`;

  const chip =
    "flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.05] py-[3px] pl-[3px] pr-2.5 text-[11.5px] text-muted-foreground ring-1 ring-border transition-colors hover:bg-white/[0.09] hover:text-foreground";

  return (
    <HoverCard className="h-full">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-shadow duration-300 hover:shadow-[0_18px_45px_-20px_rgba(168,85,247,0.55)] hover:ring-primary/35">
        {/* ---------- thumbnail (16:9, wide) ---------- */}
        <Link href={href} className="relative block aspect-video overflow-hidden" title={video.title}>
          {video.thumbUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbUrl}
              alt={video.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span
              aria-hidden="true"
              className="block size-full transition-transform duration-500 group-hover:scale-105"
              style={{ background: placeholderGradient(video.id) }}
            />
          )}

          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />

          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="grid size-12 translate-y-1 scale-90 place-items-center rounded-full bg-black/45 text-white opacity-0 ring-1 ring-white/25 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
              <Play className="ml-0.5 size-5 fill-current" />
            </span>
          </span>

          <Badge variant="overlay" className="absolute left-2 top-2">
            {video.quality}
          </Badge>

          <Badge
            variant="overlay"
            className="absolute bottom-2 right-2 text-[11px] font-medium tabular-nums"
          >
            {formatDuration(video.duration)}
          </Badge>

          <span className="absolute bottom-2 left-2 text-[11px] font-medium text-white/85 drop-shadow">
            {formatViews(video.views)} views · {timeAgo(video.publishedAt)}
          </span>
        </Link>

        {/* ---------- body ---------- */}
        <div className="flex flex-col gap-2 px-3 pb-3 pt-2.5">
          {/* title: strictly one line, ellipsis on overflow */}
          <h3 className="min-w-0">
            <Link
              href={href}
              title={video.title}
              className="block truncate text-[13.5px] font-medium leading-5 text-foreground/92 transition-colors hover:text-primary"
            >
              {video.title}
            </Link>
          </h3>

          {/* channel + models — scrolls when it overflows */}
          <MetaScroller>
            <Link href={`/channels/${video.channel.slug}/`} title={video.channel.name} className={chip}>
              <DefaultAvatar
                name={video.channel.name}
                variant="channel"
                className="size-[18px] text-[8px]"
              />
              <span className="whitespace-nowrap">{video.channel.name}</span>
            </Link>

            {video.pornstars.map((p) => (
              <Link key={p.slug} href={`/pornstars/${p.slug}/`} title={p.name} className={chip}>
                <DefaultAvatar name={p.name} variant="star" className="size-[18px] text-[8px]" />
                <span className="whitespace-nowrap">{p.name}</span>
              </Link>
            ))}
          </MetaScroller>
        </div>
      </article>
    </HoverCard>
  );
}
