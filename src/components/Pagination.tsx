"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "./icons";

interface Props {
  page: number;
  totalPages: number;
  /** page 1 -> basePath, page n -> `${basePath}page/n/` */
  basePath?: string;
}

/** 1 … 4 5 [6] 7 8 … 20 — always shows first & last */
function buildRange(page: number, total: number): (number | "gap")[] {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);

  const out: (number | "gap")[] = [1];
  const from = Math.max(2, page - 2);
  const to = Math.min(total - 1, page + 2);

  if (from > 2) out.push("gap");
  for (let i = from; i <= to; i++) out.push(i);
  if (to < total - 1) out.push("gap");
  out.push(total);

  return out;
}

export default function Pagination({ page, totalPages, basePath = "/" }: Props) {
  const router = useRouter();
  const [jump, setJump] = useState("");

  if (totalPages <= 1) return null;

  const hrefFor = (n: number) => (n === 1 ? basePath : `${basePath}page/${n}/`);
  const range = buildRange(page, totalPages);

  const go = () => {
    const n = Number.parseInt(jump, 10);
    if (!Number.isFinite(n)) return;
    const clamped = Math.min(Math.max(1, n), totalPages);
    setJump("");
    router.push(hrefFor(clamped));
  };

  const cell =
    "grid h-9 min-w-9 place-items-center rounded-lg px-2.5 text-[13px] font-medium tabular-nums transition-colors";
  const idle = "text-mute-300 ring-1 ring-white/[0.07] hover:bg-white/[0.07] hover:text-white";
  const off = "pointer-events-none opacity-35";

  return (
    <nav
      aria-label="Pagination"
      className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap"
    >
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Link
          href={hrefFor(page - 1)}
          aria-label="Previous page"
          className={`${cell} ${idle} ${page <= 1 ? off : ""}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        {range.map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-[13px] text-mute-400" aria-hidden="true">
              …
            </span>
          ) : item === page ? (
            <span
              key={item}
              aria-current="page"
              className={`${cell} bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-lg shadow-brand-600/25`}
            >
              {item}
            </span>
          ) : (
            <Link key={item} href={hrefFor(item)} className={`${cell} ${idle}`}>
              {item}
            </Link>
          ),
        )}

        <Link
          href={hrefFor(page + 1)}
          aria-label="Next page"
          className={`${cell} ${idle} ${page >= totalPages ? off : ""}`}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* jump-to-page */}
      <div className="flex items-center gap-2">
        <span className="text-[12.5px] text-mute-400">Go to</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={jump}
          onChange={(e) => setJump(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              go();
            }
          }}
          placeholder={String(page)}
          aria-label={`Page number, 1 to ${totalPages}`}
          className="no-spin h-9 w-[70px] rounded-lg bg-ink-800 px-2.5 text-center text-[13px] tabular-nums text-white ring-1 ring-white/[0.08] transition focus:outline-none focus:ring-brand-500/55"
        />
        <button
          type="button"
          onClick={go}
          className="h-9 rounded-lg bg-white/[0.07] px-3.5 text-[12.5px] font-semibold text-white ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.12]"
        >
          Go
        </button>
        <span className="hidden text-[12.5px] text-mute-400 sm:inline">of {totalPages}</span>
      </div>
    </nav>
  );
}
