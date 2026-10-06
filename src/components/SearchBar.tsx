"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";

import { pornstars, videos } from "@/data/mock";
import { formatDuration, formatViews, placeholderGradient } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DefaultAvatar } from "./icons";

interface Props {
  autoFocus?: boolean;
  onDone?: () => void;
  className?: string;
}

/**
 * Live search over video titles AND model names.
 *
 * Runs 100% in the browser against a prebuilt index, so it costs no Worker
 * CPU at all. When the catalogue outgrows the bundle, swap the `results`
 * memo for a debounced fetch of a static JSON shard — still zero CPU.
 */
export default function SearchBar({ autoFocus = false, onDone, className }: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return { models: [], clips: [] };
    return {
      models: pornstars.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 3),
      clips: videos.filter((v) => v.title.toLowerCase().includes(term)).slice(0, 6),
    };
  }, [q]);

  const flat = useMemo(
    () => [
      ...results.models.map((m) => `/pornstars/${m.slug}/`),
      ...results.clips.map((v) => `/${v.slug}/`),
    ],
    [results],
  );

  const total = flat.length;
  const showPanel = open && q.trim().length >= 2;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      onDone?.();
      return;
    }
    if (!showPanel) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(1, total));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + total) % Math.max(1, total));
    } else if (e.key === "Enter" && active >= 0 && flat[active]) {
      window.location.href = flat[active];
    }
  }

  const row = "flex items-center gap-3 px-4 py-2 transition-colors";
  const label =
    "px-4 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <div ref={boxRef} className={cn("relative w-full", className)}>
      <div className="flex items-center gap-2 rounded-full bg-secondary/90 px-3.5 py-2 ring-1 ring-border transition focus-within:bg-secondary focus-within:ring-2 focus-within:ring-ring/55">
        <Search className="size-[18px] shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          type="search"
          placeholder="Search videos or models…"
          aria-label="Search videos or models"
          className="no-bar w-full bg-transparent text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl bg-popover/97 shadow-2xl shadow-black/60 ring-1 ring-border backdrop-blur-xl"
          >
            {total === 0 ? (
              <p className="px-4 py-5 text-center text-[13px] text-muted-foreground">
                No results for “{q.trim()}”
              </p>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto py-1.5">
                {results.models.length > 0 && (
                  <>
                    <p className={label}>Models</p>
                    {results.models.map((m, i) => (
                      <Link
                        key={m.slug}
                        href={`/pornstars/${m.slug}/`}
                        onClick={() => onDone?.()}
                        className={cn(row, active === i ? "bg-white/[0.07]" : "hover:bg-white/[0.05]")}
                      >
                        <DefaultAvatar name={m.name} className="size-8 text-[11px]" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-foreground/90">
                            {m.name}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            {m.videoCount} videos
                          </span>
                        </span>
                      </Link>
                    ))}
                  </>
                )}

                {results.clips.length > 0 && (
                  <>
                    <p className={label}>Videos</p>
                    {results.clips.map((v, i) => {
                      const idx = results.models.length + i;
                      return (
                        <Link
                          key={v.id}
                          href={`/${v.slug}/`}
                          onClick={() => onDone?.()}
                          className={cn(
                            row,
                            active === idx ? "bg-white/[0.07]" : "hover:bg-white/[0.05]",
                          )}
                        >
                          <span
                            className="h-[34px] w-[60px] shrink-0 rounded-md ring-1 ring-border"
                            style={{ background: placeholderGradient(v.id) }}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] text-foreground/90">
                              {v.title}
                            </span>
                            <span className="block text-[11px] text-muted-foreground">
                              {formatDuration(v.duration)} · {formatViews(v.views)} views
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
