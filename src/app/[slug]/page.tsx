import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, ThumbsUp, Clock, Tag as TagIcon } from "lucide-react";

import { getVideoBySlug, moreFromChannel, relatedVideos, videos } from "@/data/mock";
import { formatDuration, formatViews, timeAgo } from "@/lib/format";
import { thumbKey, imageUrl, videoKey, videoUrl, THUMB } from "@/lib/storage";
import type { Rendition } from "@/lib/storage";
import { DefaultAvatar } from "@/components/icons";
import VideoPlayer from "@/components/VideoPlayer";
import VideoGrid from "@/components/VideoGrid";
import { Reveal } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-static";
export const dynamicParams = false;

const SITE = "https://vidubuzz.com";

/** Every video is prerendered at build time — zero Worker CPU per view. */
export function generateStaticParams() {
  return videos.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const video = getVideoBySlug(slug);
  if (!video) return { title: "Not found" };

  const stars = video.pornstars.map((p) => p.name).join(", ");
  const description = `Watch ${video.title} — ${formatDuration(video.duration)} of ${video.quality} video featuring ${stars} on ${video.channel.name}.`;

  return {
    title: `${video.title} — ViduBuzz`,
    description,
    alternates: { canonical: `${SITE}/${video.slug}/` },
    openGraph: {
      type: "video.other",
      title: video.title,
      description,
      url: `${SITE}/${video.slug}/`,
    },
  };
}

export default async function VideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video = getVideoBySlug(slug);
  if (!video) notFound();

  const stars = video.pornstars;
  const more = moreFromChannel(video, 10);
  const related = relatedVideos(video, 12);

  const poster = imageUrl(thumbKey(video.id, THUMB.grid));
  const contentUrl = videoUrl(videoKey(video.id, (video.renditions[0] ?? "480p") as Rendition));

  /* ── VideoObject JSON-LD ───────────────────────────────────────────────
     Neither competitor ships reliable structured data. This is the cheapest
     ranking edge available to us, so every video page carries it.           */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: `${video.title} — ${formatDuration(video.duration)}, ${video.quality}.`,
    uploadDate: video.publishedAt,
    duration: `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`,
    ...(poster ? { thumbnailUrl: [poster] } : {}),
    ...(contentUrl ? { contentUrl } : {}),
    isFamilyFriendly: false,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: { "@type": "WatchAction" },
      userInteractionCount: video.views,
    },
    ...(stars.length
      ? { actor: stars.map((p) => ({ "@type": "Person", name: p.name })) }
      : {}),
    publisher: { "@type": "Organization", name: "ViduBuzz" },
  };

  const metaItem = "flex items-center gap-1.5 text-[13px] text-muted-foreground";

  return (
    <>
      <script
        type="application/ld+json"
        // Static, build-time generated object — no user input is interpolated.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto w-full max-w-[1400px] px-3 pb-16 pt-4 sm:px-5">
        <VideoPlayer video={video} />

        {/* ── title + meta ─────────────────────────────────────────────── */}
        <header className="mt-5">
          <h1 className="text-balance text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
            {video.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className={metaItem}>
              <Eye className="size-4" aria-hidden="true" />
              {formatViews(video.views)} views
            </span>
            <span className={metaItem}>
              <Clock className="size-4" aria-hidden="true" />
              <time dateTime={video.publishedAt}>{timeAgo(video.publishedAt)}</time>
            </span>
            <span className={metaItem}>
              <ThumbsUp className="size-4 text-primary" aria-hidden="true" />
              <span className="font-medium text-foreground">{video.rating}%</span>
            </span>
            <Badge variant="secondary">{video.quality}</Badge>
            <Badge variant="secondary">{formatDuration(video.duration)}</Badge>
          </div>

          {/* rating bar */}
          <div
            className="mt-3 h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/10"
            role="img"
            aria-label={`${video.rating}% of viewers liked this`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-accent-500)]"
              style={{ width: `${video.rating}%` }}
            />
          </div>
        </header>

        {/* ── channel + pornstars ──────────────────────────────────────── */}
        <section aria-label="Featured in" className="mt-6 flex flex-wrap gap-2.5">
          <PersonChip
            href={`/channels/${video.channel.slug}/`}
            name={video.channel.name}
            sub={`${video.channel.videoCount} videos`}
            kind="Channel"
            variant="channel"
          />
          {stars.map((p) => (
            <PersonChip
              key={p.slug}
              href={`/pornstars/${p.slug}/`}
              name={p.name}
              sub={`${p.videoCount} videos`}
              kind="Model"
              variant="star"
            />
          ))}
        </section>

        {/* ── tags ─────────────────────────────────────────────────────── */}
        <section aria-label="Tags" className="mt-5">
          <h2 className="sr-only">Tags</h2>
          <div className="flex flex-wrap items-center gap-2">
            <TagIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            {video.tags.map((t) => (
              <Link
                key={t}
                href={`/t/${t.toLowerCase().replace(/\s+/g, "-")}/`}
                className="rounded-full bg-white/[0.05] px-3 py-1 text-[12.5px] text-muted-foreground ring-1 ring-border transition-colors hover:bg-white/[0.09] hover:text-foreground"
              >
                {t}
              </Link>
            ))}
          </div>
        </section>

        {/* ── unique prose: thin pages do not rank ─────────────────────── */}
        <section className="mt-6 max-w-3xl rounded-2xl bg-card/60 p-4 ring-1 ring-border">
          <h2 className="text-sm font-semibold">About this video</h2>
          <p className="mt-2 text-pretty text-[13.5px] leading-relaxed text-muted-foreground">
            {video.title} runs {formatDuration(video.duration)} in {video.quality}
            {stars.length > 0 && (
              <>
                {" "}
                and features {stars.map((p) => p.name).join(", ")}
              </>
            )}
            . Published by {video.channel.name} {timeAgo(video.publishedAt)} and watched{" "}
            {formatViews(video.views)} times, it currently holds a {video.rating}% approval
            rating. Browse more under {video.tags.slice(0, 3).join(", ")}.
          </p>
        </section>

        {/* ── more from channel ────────────────────────────────────────── */}
        {more.length > 0 && (
          <Reveal className="mt-12">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">
                More from {video.channel.name}
              </h2>
              <Link
                href={`/channels/${video.channel.slug}/`}
                className="shrink-0 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                View all
              </Link>
            </div>
            <VideoGrid videos={more} />
          </Reveal>
        )}

        {/* ── related ──────────────────────────────────────────────────── */}
        {related.length > 0 && (
          <Reveal className="mt-12">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Related videos</h2>
            <VideoGrid videos={related} />
          </Reveal>
        )}
      </article>
    </>
  );
}

function PersonChip({
  href,
  name,
  sub,
  kind,
  variant,
}: {
  href: string;
  name: string;
  sub: string;
  kind: string;
  variant: "star" | "channel";
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl bg-card px-3 py-2 ring-1 ring-border transition-colors hover:bg-white/[0.06] hover:ring-primary/35"
    >
      <DefaultAvatar name={name} variant={variant} className="size-8 shrink-0 rounded-full" />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium leading-tight">{name}</span>
        <span className="block truncate text-[11px] leading-tight text-muted-foreground">
          {kind} · {sub}
        </span>
      </span>
    </Link>
  );
}
