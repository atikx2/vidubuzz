/**
 * ⚠️  THIS FILE IS DELIBERATELY **NOT** IN THE REPOSITORY ROOT.
 *
 * It is the OpenNext adapter config, which is only needed by the *other* build
 * mode (`npm run cf:build`). `npm run cf:enable` copies it back to the root
 * when that path is actually being used, and `cf:build` / `cf:deploy` do that
 * automatically.
 *
 * Why it must stay out of the root:
 *
 * Wrangler ships with framework autoconfiguration ON by default
 * (`autoconfig: true`). On `wrangler deploy` it looks at the project root and,
 * if all three of these are present, silently re-routes the command:
 *
 *     1. next.config.(ts|js|mts|mjs)
 *     2. open-next.config.(ts|js)          <-- this file, at the root
 *     3. @opennextjs/cloudflare in node_modules
 *
 * ...it prints "OpenNext project detected" and runs
 * `opennextjs-cloudflare deploy` instead. The static build never emits
 * `.open-next/`, so that delegation dies with:
 *
 *     ERROR Could not find compiled Open Next config, did you run the build command?
 *
 * Three consecutive Cloudflare Workers Builds failed on exactly this, after the
 * build step itself had passed. Having a `wrangler.jsonc` in the repo does NOT
 * prevent the hijack — only the `--config` CLI flag (or `--no-autoconfig`)
 * does, and Cloudflare's stock deploy command is a bare `npx wrangler deploy`.
 *
 * Keep `next.config.ts` at the root and this file here. That combination makes
 * `wrangler deploy` take the plain static-assets path, which is the zero-cost
 * architecture this project runs on.
 */

import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Minimal config — good enough to deploy and preview.
 *
 * When ISR matters (it will, once the catalogue is real) create the
 * `vidubuzz-cache` R2 bucket, uncomment the binding in wrangler.jsonc and
 * switch this to:
 *
 *   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
 *   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
 */
export default defineCloudflareConfig({});
