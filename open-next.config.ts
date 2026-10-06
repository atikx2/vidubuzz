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
