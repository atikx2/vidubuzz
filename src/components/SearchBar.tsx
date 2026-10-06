"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { pornstars, videos } from "@/data/mock";
import { formatDuration, formatViews, placeholderGradient } from "@/lib/format";
import { DefaultAvatar, SearchIcon, CloseIcon } from "./icons";

interface Props {
  autoFocus?: boolean;
  onDone?: () => void;
  className?: string;
}

/**
 * Live search over video titles AND model names.
 * Runs client-side against the mock catalogue for now; swap the `results`
 * memo for a debounced fetch to /api/search once the DB is wired up.
 */
export default function SearchBar({ autoFocus = false, onDone, className = "" }: Props) {
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

  return (
    <div ref={boxRef} className={`relative w-full ${className}`}>
      <div className="flex items-center gap-2 rounded-full bg-ink-800/90 px-3.5 py-2 ring-1 ring-white/[0.08] transition focus-within:bg-ink-800 focus-within:ring-brand-500/50">
        <SearchIcon className="h-[18px] w-[18px] shrink-0 text-mute-400" />
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
          className="no-bar w-full bg-transparent text-[13.5px] text-white placeholder:text-mute-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="shrink-0 text-mute-400 transition-colors hover:text-white"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="vb-fade-in absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl bg-ink-850/97 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-xl">
          {total === 0 ? (
            <p className="px-4 py-5 text-center text-[13px] text-mute-400">
              No results for “{q.trim()}”
            </p>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto py-1.5">
              {results.models.length > 0 && (
                <>
                  <p className="px-4 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-wider text-mute-400">
                    Models
                  </p>
                  {results.models.map((m, i) => (
                    <Link
                      key={m.slug}
                      href={`/pornstars/${m.slug}/`}
                      onClick={() => onDone?.()}
                      className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                        active === i ? "bg-white/[0.07]" : "hover:bg-white/[0.05]"
                      }`}
                    >
                      <DefaultAvatar name={m.name} className="h-8 w-8 text-[11px]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-white/90">{m.name}</span>
                        <span className="block text-[11px] text-mute-400">{m.videoCount} videos</span>
                      </span>
                    </Link>
                  ))}
                </>
              )}

              {results.clips.length > 0 && (
                <>
                  <p className="px-4 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-mute-400">
                    Videos
                  </p>
                  {results.clips.map((v, i) => {
                    const idx = results.models.length + i;
                    return (
                      <Link
                        key={v.id}
                        href={`/${v.slug}/`}
                        onClick={() => onDone?.()}
                        className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                          active === idx ? "bg-white/[0.07]" : "hover:bg-white/[0.05]"
                        }`}
                      >
                        <span
                          className="h-[34px] w-[60px] shrink-0 rounded-md ring-1 ring-white/10"
                          style={{ background: placeholderGradient(v.id) }}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-white/90">{v.title}</span>
                          <span className="block text-[11px] text-mute-400">
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
        </div>
      )}
    </div>
  );
}
