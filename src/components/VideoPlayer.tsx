"use client";

import { useMemo, useRef, useState } from "react";
import { Play, Settings2 } from "lucide-react";

import type { Quality, Video } from "@/lib/types";
import { placeholderGradient } from "@/lib/format";
import { videoKey, videoUrl, type Rendition } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

/**
 * Progressive MP4 player with a manual quality switch — the p4455 model.
 *
 * Deliberately not HLS: on operation-priced object storage a 10s-segment HLS
 * stream costs roughly 6x the GET requests of a progressive file, and it needs
 * a segmenting pipeline we cannot run for free. The <video> element handles
 * range requests, so seeking still works.
 *
 * Switching quality keeps the current timestamp.
 */
export default function VideoPlayer({ video }: { video: Video }) {
  const sources = useMemo(() => {
    const order: Quality[] = ["480p", "720p", "1080p", "4K"];
    return video.renditions
      .slice()
      .sort((a, b) => order.indexOf(a) - order.indexOf(b))
      .map((q) => ({ quality: q, src: videoUrl(videoKey(video.id, q as Rendition)) }))
      .filter((s): s is { quality: Quality; src: string } => Boolean(s.src));
  }, [video]);

  // Start on the lowest rendition: cheapest for us, fastest to first frame on
  // the mobile connections most of our traffic will arrive on.
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  const current = sources[active];

  function switchTo(i: number) {
    const el = ref.current;
    const t = el?.currentTime ?? 0;
    const wasPlaying = el ? !el.paused : false;
    setActive(i);
    requestAnimationFrame(() => {
      const next = ref.current;
      if (!next) return;
      next.currentTime = t;
      if (wasPlaying) void next.play();
    });
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black ring-1 ring-border">
      <div className="relative aspect-video">
        {current ? (
          <video
            ref={ref}
            key={current.src}
            src={current.src}
            controls
            playsInline
            preload="metadata"
            poster={undefined}
            className="size-full bg-black"
            onPlay={() => setStarted(true)}
          />
        ) : (
          /* No storage configured yet — show the placeholder rather than a
             broken <video>, so the page is still reviewable end to end. */
          <div
            className="grid size-full place-items-center"
            style={{ background: placeholderGradient(video.id) }}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-black/45 ring-1 ring-white/20 backdrop-blur">
                <Play className="size-7 translate-x-[2px] fill-white text-white" />
              </span>
              <p className="max-w-xs text-pretty px-4 text-[13px] text-white/70">
                Media storage is not connected yet. Set NEXT_PUBLIC_VIDEO_BASE to start
                streaming.
              </p>
            </div>
          </div>
        )}
      </div>

      {sources.length > 1 && (
        <div className="flex items-center gap-2 border-t border-border bg-card/80 px-3 py-2">
          <Settings2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="mr-1 text-[11px] uppercase tracking-wide text-muted-foreground">
            Quality
          </span>
          {sources.map((s, i) => (
            <Button
              key={s.quality}
              size="sm"
              variant={i === active ? "secondary" : "ghost"}
              className={cn("h-7 px-2.5 text-[12px]", i === active && "ring-1 ring-primary/40")}
              aria-pressed={i === active}
              onClick={() => switchTo(i)}
            >
              {s.quality}
            </Button>
          ))}
          {!started && (
            <span className="ml-auto hidden text-[11px] text-muted-foreground sm:block">
              Starts at {sources[0].quality} to save data
            </span>
          )}
        </div>
      )}
    </div>
  );
}
