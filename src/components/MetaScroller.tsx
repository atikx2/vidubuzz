"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Horizontal rail for the channel + pornstar line on a video card.
 *
 * Requirement: when a video has many models the names must not be cut off —
 * the row scrolls so every name can be seen. Behaviour:
 *   - always swipeable / drag-scrollable (touch + trackpad)
 *   - on hover (pointer devices) it auto-scrolls to the end and back
 *   - a right-edge fade hints that there is more content
 *   - no-op entirely when the content already fits
 */
export default function MetaScroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const [overflows, setOverflows] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setOverflows(el.scrollWidth - el.clientWidth > 4);
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  const stop = () => {
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  };

  const animateTo = (target: number, speed = 0.45, then?: () => void) => {
    const el = ref.current;
    if (!el) return;
    const step = () => {
      const node = ref.current;
      if (!node) return;
      const delta = target - node.scrollLeft;
      if (Math.abs(delta) < 0.6) {
        node.scrollLeft = target;
        raf.current = null;
        then?.();
        return;
      }
      node.scrollLeft += delta * speed * 0.14 + Math.sign(delta) * 0.35;
      raf.current = requestAnimationFrame(step);
    };
    stop();
    raf.current = requestAnimationFrame(step);
  };

  const onEnter = () => {
    const el = ref.current;
    if (!el || !overflows) return;
    const max = el.scrollWidth - el.clientWidth;
    // pause briefly, run to the end, pause, come back
    window.setTimeout(() => {
      if (!ref.current) return;
      animateTo(max, 0.45, () => {
        window.setTimeout(() => animateTo(0, 0.6), 700);
      });
    }, 180);
  };

  const onLeave = () => {
    stop();
    animateTo(0, 0.9);
  };

  return (
    <div className="relative min-w-0">
      <div
        ref={ref}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="no-bar flex items-center gap-1.5 overflow-x-auto overscroll-x-contain scroll-smooth"
      >
        {children}
      </div>
      {overflows && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-ink-850 to-transparent"
        />
      )}
    </div>
  );
}
