import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // p4455-style URLs: every route ends in a slash, one canonical form only.
  trailingSlash: true,
  images: {
    // Cloudflare R2 public bucket / custom domain will go here later.
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "cdn.vidubuzz.com" },
    ],
  },
  // Sandbox live-preview runs behind the e2b proxy host.
  allowedDevOrigins: ["*.e2b.app"],
};

export default nextConfig;
