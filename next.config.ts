import type { NextConfig } from "next";

/**
 * Two build modes.
 *
 *  STATIC_EXPORT=1  → `output: "export"`. Emits real .html files. On Cloudflare
 *                     these are served straight from the assets binding, so the
 *                     Worker is never invoked for a page view: zero CPU, zero
 *                     requests billed, the 10 ms limit cannot be hit. Costs you
 *                     ISR, middleware, API routes and server actions.
 *
 *  (default)        → OpenNext build. Pages are still prerendered at build time,
 *                     so no React rendering happens per request — the Worker
 *                     only does a route match + cache read (a few ms). Keeps the
 *                     door open for ISR/API routes once there is a budget.
 */
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(staticExport ? { output: "export" as const } : {}),

  reactStrictMode: true,

  // p4455-style URLs: every route ends in a slash, one canonical form only.
  // Also makes static export emit <route>/index.html.
  trailingSlash: true,

  images: {
    // next/image optimisation needs Cloudflare Images (paid) — we pre-generate
    // every thumbnail size into R2 instead, so the optimiser stays off.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "cdn.vidubuzz.com" },
    ],
  },

  // Sandbox live preview runs behind the e2b proxy host.
  allowedDevOrigins: ["*.e2b.app"],
};

export default nextConfig;
