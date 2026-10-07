# ViduBuzz — Agent Handoff

Read this before touching anything. It is the complete context from the
previous session, written so a new agent can pick up cold from a fresh git
clone.

Last updated: 2026-10-07

---

## 0. The single most important rule

**Build only what the owner asked for, then stop and confirm.**

The previous session lost the owner's trust by building a video page nobody
asked for. It was reverted. The owner's words:

> *"ami tmk ato kicu baray korte boli nai"* — I didn't ask you to build all
> this extra stuff.

Work in small chunks. Show the chunk. Wait. Then continue.

---

## 1. Who you are working with

- The owner writes in **Banglish / Bangla**. Reply in the same register —
  Bangla prose with English technical terms. Repo docs are in Bangla;
  this file is in English because it is agent-facing.
- **He works from a phone.** He cannot use an in-IDE preview. Any instruction
  you give must be followable in a mobile browser. Deliverables need a
  publicly reachable URL, which in practice means deploying.
- **Budget is zero.** He has no credit card. Do not propose anything that
  requires one, and do not re-pitch the $5 Workers Paid plan — he has already
  said no. Architect inside the free tiers.
- He prefers being told the truth over being agreed with. When he proposed
  B2 + Cloudflare CDN, flagging the Cloudflare ToS problem was welcomed. When
  a previous estimate turned out wrong, correcting it openly was welcomed.

---

## 2. What the product is

An adult video tube site aimed at global search ranking. Legal, licensed
content only.

### Hard boundaries the previous agent held, and you should too

- No NCII / "leaked" content, no named-real-person nude lists, no pirated
  premium siterips.
- **No scraper pulling video or metadata off other tube sites.** A licensed
  feed importer is fine; a crawler that steals is not.
- No real adult imagery anywhere in the repo. The UI uses generated
  CSS-gradient placeholders and original SVG icons.

The owner has stated he holds rights to his own content and will only use
legal material. **This is settled — do not raise compliance warnings again.**
It was litigated three times already and he found it tiresome.

---

## 3. Current state

### Live status

**Not deployed yet.** This is the active blocker. See §8.

### What is built

| Route | Status |
|---|---|
| `/` | ✅ homepage |
| `/page/{n}/` | ✅ pages 2–20, prerendered |
| everything else | ❌ 404 |

Header nav links to `/videos`, `/categories`, `/pornstars`, `/channels`,
`/tags`, `/account` — **all currently 404.** Known, accepted for now.

Build output: **23 routes, all static.** `npm run build` must keep showing
`○ (Static)` or `● (SSG)` for every route and zero `ƒ (Dynamic)`. That is the
acceptance test for the whole architecture (§5).

### Tech stack — locked by the owner, do not substitute

Next.js 15 (App Router) · TypeScript · Tailwind v4 · **shadcn/ui** ·
**Framer Motion**.

> **The shadcn CLI cannot run in this sandbox** — `ui.shadcn.com` is
> unreachable (TLS refused). `npx shadcn init` and `shadcn add` both fail.
> Components are hand-written into `src/components/ui/` following shadcn
> conventions (CVA + Radix + `cn()`). `components.json` exists for aliases
> only. **Do not retry the CLI.** Present: `button`, `input`, `sheet`,
> `badge`.

### File map

```
src/app/
  layout.tsx          root layout
  globals.css         Tailwind v4 + shadcn oklch tokens. :root IS the dark
                      theme — no .dark class, no flash, no second theme
  page.tsx            homepage (force-static)
  page/[n]/page.tsx   pagination (generateStaticParams, dynamicParams false)

src/components/
  Header.tsx          desktop: logo / search / account+menu
                      mobile:  menu / logo / search+account (Radix Sheet)
  SearchBar.tsx       live client-side search over titles AND model names
  VideoCard.tsx       wide thumb, 1-line truncating title, scrolling meta row
  MetaScroller.tsx    ResizeObserver overflow detect, rAF hover auto-scroll,
                      edge fade, always swipeable
  Pagination.tsx      1 2 3 … 20 + number input + Go
  PersonCard.tsx      pornstar / channel card
  VideoGrid.tsx       responsive grid
  HomeSections.tsx    the three homepage sections
  SectionHeader.tsx   reads from site-sections.ts
  Footer.tsx, icons.tsx (Logo + DefaultAvatar only; lucide covers the rest)
  motion/Reveal.tsx   Reveal, RevealGrid, RevealItem — whileInView, once
  motion/HoverCard.tsx transform-only spring lift
  ui/                 hand-written shadcn primitives

src/lib/
  types.ts            Quality, Person, Channel, Pornstar, Video
  format.ts           formatViews, formatDuration, timeAgo, placeholderGradient
  storage.ts          provider-agnostic media URLs — see §6
  utils.ts            cn()

src/data/
  mock.ts             seeded LCG PRNG. 480 videos, 12 channels, 16 models.
                      Data is GENERATED, not literal, so it does not bloat
                      the client bundle.
  site-sections.ts    SectionConfig + homeSections + GRID (perPage 24).
                      Seed for the future admin-editable site_sections table.

docs/research/        competitor teardowns (p4455, letsporn)
docs/setup/           Cloudflare, costs, B2 vs R2, B2+CDN walkthrough
```

### Motion rules

Every Framer Motion wrapper early-returns a plain `div` under
`useReducedMotion`. Keep that. All motion components are `"use client"`,
which is also why they cost zero Worker CPU.

---

## 4. The homepage spec (the owner's own words, paraphrased)

This is the agreed scope. It is **done**. Do not extend it without asking.

- **Header.** Desktop: SVG logo left, search bar centred (live results
  matching video name *or* model name), account icon + menu icon right.
  Mobile: menu left, logo centred, search + account right.
- **Section 1 — "Trending Videos".** 24 boxes per page. Desktop 4 cols × 6
  rows, mobile 1 col × 24 rows.
- **Video box.** Thumbnail rendered somewhat wide, title below. Title is
  **exactly one line**, overflow truncates with `...`. Under the title:
  channel icon + name, and pornstar icon + name(s). That meta line must
  **scroll** so every pornstar name stays reachable.
- **Pagination.** Style `1, 2, 3, 5, 15, 20` **plus a number input** — type a
  page, click, jump.
- **Section 2 — "Trending Pornstars"** with a **View All** button.
- **Section 3 — "Trending Channels"**, same pattern.
- **All section titles must be editable from an admin panel** and written to
  rank in SEO. (Admin panel not built yet; `site-sections.ts` is the seed.)

---

## 5. The zero-budget architecture — why everything is static

Cloudflare Workers Free gives **10 ms CPU per request** and 100k requests/day.
Server-rendering React blows the CPU budget. So:

> **Prerender everything at build time. Serve it as static assets.**

Static assets are served by Cloudflare's asset layer, *outside* the Worker.
No code runs, so neither the CPU limit nor the request cap applies, and it
costs nothing.

shadcn/ui and Framer Motion are client-side, so the owner's locked stack
costs **0 ms Worker CPU** — bundle size only. Search and the pagination jump
run in the browser over in-bundle data; no request-time DB work.

### Two build modes

| | **Static (default, in use)** | **OpenNext (for later)** |
|---|---|---|
| build | `npm run build:static` | `npm run cf:build` |
| output | `out/` — real `.html` | `.open-next/` |
| config | `wrangler.jsonc` (no `main`) | `wrangler.opennext.jsonc` |
| deploy | `npx wrangler deploy` | `npm run cf:deploy` |
| Worker runs per page view? | **no** | yes (cache read, no React render) |
| 10 ms limit applies? | **no** | yes, but comfortably under |
| ISR / API routes / admin | ✗ | ✓ |

A correction worth preserving, because it is easy to get wrong: with OpenNext,
prerendered HTML does **not** land in `.open-next/assets` as loose files. It
goes into the incremental cache (`.open-next/cache/.../route-cache/APP_PAGE/`)
and the Worker runs once per request to read it. Low CPU, but not zero. The
static mode is the only genuinely zero-Worker path.

Switch to OpenNext when the admin panel or a real database arrives.

---

## 6. Storage — B2 + Cloudflare CDN

The owner **cannot activate Cloudflare R2** because it demands a payment
method. **Backblaze B2 needs no card** (10 GB storage, 1 GB/day download).
So B2 is the storage, Cloudflare is the CDN. This is his decision, made after
being shown the risk below.

### `src/lib/storage.ts`

Provider-agnostic. B2 and R2 are both S3-compatible and both serve plain
HTTPS GETs, so nothing in the app knows which is behind it. Moving to R2 later
is an env change, not a code change.

Two env vars, deliberately separate:

```bash
NEXT_PUBLIC_IMAGE_BASE   # thumbnails, storyboard frames, avatars
NEXT_PUBLIC_VIDEO_BASE   # the MP4 renditions
```

Either may be a **comma-separated list** of origins. Files spread across them
by an FNV-1a hash of the object key, so a given file always resolves to the
same origin — stable URLs mean stable CDN cache and stable SEO. Verified:
199/201/200 across 3 origins over 600 files.

Both empty ⇒ `imageUrl()` / `videoUrl()` return `null` and the UI falls back
to gradient placeholders. The site builds and runs with no storage at all.

### Key layout (borrowed from letsporn, 1000 ids per directory)

```
contents/videos_screenshots/{bucket}/{id}/360x203/1.jpg   grid thumb
contents/videos_screenshots/{bucket}/{id}/360x203/1..10   hover storyboard
contents/videos_screenshots/{bucket}/{id}/240x135/1.jpg   related thumb
videos/{bucket}/{id}/{id}_480p.mp4                        rendition
previews/{bucket}/{id}/preview.mp4                        hover loop
models/{bucket}/{id}/avatar.jpg
content_sources/{bucket}/{id}/avatar.jpg
```

Thumbnails are **pre-generated** at both sizes. Never use `next/image`
optimisation or Cloudflare Images — both cost money. `images.unoptimized` is
already set.

### ⚠️ The Cloudflare ToS trap — tell the owner once, do not nag

Cloudflare's self-serve agreement:

> *"Cloudflare offers specific Paid Services (e.g., the Developer Platform,
> Images, and Stream) that you must use in order to serve video and other
> large files via the CDN."*

Content hosted **on** a Cloudflare service (R2, Stream) is fine. Content
hosted **outside** and cached by the CDN — exactly B2 + orange cloud — is not.
Enforcement is real: offending accounts get `.mp4` requests redirected to
`cloudflare-terms-of-service-abuse.com/streaming.mp4`.

A bitter corollary: the Bandwidth Alliance free-egress benefit requires
routing through Cloudflare, which is the prohibited part. So "B2 + Cloudflare
= free video bandwidth" is **not usable** on a free plan.

The owner knows and chose to proceed. **The escape hatch is already built:**
image and video bases are separate, so if Cloudflare ever objects, grey-cloud
the video hostname and point `NEXT_PUBLIC_VIDEO_BASE` straight at B2. Images
keep their CDN, the site keeps working, no code changes.

### The one setup step everyone forgets

In **each** B2 bucket → Bucket Settings → Bucket Info:

```json
{"cache-control":"public, max-age=31536000, immutable"}
```

Without it Cloudflare caches nothing, pulls from B2 on every request, and the
free quota dies before noon. A one-year TTL is safe because our keys are
immutable — files are never overwritten, new content gets a new id.

With caching working, **1 GB/day is a limit on origin pulls, not on views.**
A cached video serves effectively unlimited views. That reframes the free tier
from "~22 views/day" to "~22 cache misses/day".

### Limits to remember

- Cloudflare caches at most **512 MB per file** (Free/Pro/Business).
- Unpopular assets are evicted regardless of TTL, so the long tail keeps
  hitting origin.
- Each Cloudflare PoP caches independently.
- B2 free: 10 GB storage ≈ 220 videos at 480p/10min, 1 GB/day download,
  2500 Class B + 2500 Class C transactions/day. Set all four **Caps & Alerts
  to $0** so a bill can never appear.

### Multiple B2 accounts — asked about, answered no

Technically possible via the sharding above, but Backblaze's Acceptable Use
Policy forbids it: *"Circumvent, or attempt to circumvent, storage space
limits, pricing, or other Service restrictions."* Penalty is termination,
i.e. the whole library vanishes. One account holds ~220 videos; past that,
B2 is $0.006/GB — 100 GB is $0.60/month. Recommend paying, not multi-accounting.

### Video format decision: progressive MP4, not HLS

p4455 serves plain `.mp4` in two qualities with a manual toggle. On
operation-priced object storage that is **cheaper**: a 10s-segment HLS stream
costs ~30 GETs per view versus ~5 for a progressive file (at 1M views/month,
~$7 vs $0). It also needs no segmenting pipeline. The cost is no adaptive
bitrate, so weak mobile connections buffer — mitigate with a manual quality
switch and 480p-first. Revisit HLS when there is budget and traffic; the R2/B2
key layout does not change.

---

## 7. SEO and crawl strategy

This is where the project intends to win. Both competitors are weak here.

### URL technique — taken from p4455, locked

- **Flat root-level slug: `/{slug}/`.** No `/video/` prefix, no numeric id
  suffix in the public URL.
- **`trailingSlash: true`.** Every internal `href` must end in `/`, otherwise
  Next issues a 308 redirect. This bit the previous session once.
- Slug uniqueness enforced at the DB layer.

### The 3-click crawl rule

p4455's `/help-map/` hub reaches any deep page in **three clicks** from the
homepage. Googlebot rewards shallow depth; pages buried deeper get crawled
rarely or not at all. Our equivalent is a static **`/browse/`** hub that links
every category, tag, model and channel, so nothing in the catalogue is more
than three clicks from `/`.

Plan the hub before the catalogue grows. Retro-fitting crawl depth is painful.

### Crawl budget protection

Competitors leak enormous numbers of junk URLs. letsporn's facet math:
6 sorts × 3 time windows × 20 pages = 360 duplicates per category; across
~150 categories that is **~54,000 junk URLs**. Googlebot spends its budget
there instead of on real pages.

So:

- Open `robots.txt`, but **block facet params** (`?sort=`, `?when=`, etc.).
- `/page/{n}/` is `index: false, follow: true` — already implemented.
- **Thin-page guard:** any tag/category with fewer than ~10 videos gets
  `noindex`.
- Strict canonical on every page.
- **410 Gone** for deleted posts, not 404 and not a soft redirect. p4455 leaves
  live `/__trashed-244/` pages in the index — a defect to avoid.
- One durable domain. No mirror-domain churn (p4455 is a mirror of
  mydesi.net; that habit wrecks accumulated authority).

### Structured data — the cheapest win available

Neither competitor ships reliable `VideoObject` JSON-LD. Every video page
should carry it: name, description, uploadDate, duration (ISO 8601),
thumbnailUrl, contentUrl, interactionStatistic, actor[], publisher.

A working implementation existed in the reverted commit `bde6594` — lift it
from there rather than rewriting.

### Sitemaps

`/sitemap/{n}.xml` shards, referenced from `robots.txt`. Keep each under
50k URLs.

---

## 8. 🔴 ACTIVE BLOCKER — read this first

**The site has never deployed successfully.**

### What is set up

Cloudflare **Workers** project `vidubuzz` (not Pages), connected to GitHub
`atikx2/vidubuzz` via Workers Builds. Account id in the dashboard URL:
`3c3dd5db09d87b8d1aee5b4b2459b369`.

Build settings as of the last screenshot:
- Build command: `npm run build:static`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`

### Problem 1 — `main` is empty (confirmed)

`main` contains **only `README.md`**. No `package.json`, so
`npm run build:static` dies with `npm error code ENOENT`.

All the work lives on branch **`arena/1311b051-vidubuzz`** and in
**PR #1** → https://github.com/atikx2/vidubuzz/pull/1

**The owner was about to merge that PR.** If it is merged, `main` has
everything and this problem is gone. Check first:

```bash
git ls-tree -r --name-only origin/main | head
```

### Problem 2 — deploy command mismatch (fixed, verify it stuck)

`wrangler.jsonc` used to point `main` at `.open-next/worker.js`, which
`build:static` never produces, so the deploy step failed even when the build
passed. Fixed by swapping which config is the default:

- `wrangler.jsonc` → static assets from `out/`, **no `main`**
- `wrangler.opennext.jsonc` → the Worker build

So Cloudflare's stock `npx wrangler deploy` now works with **no dashboard
changes**. Verify with:

```bash
npm run build:static && npx wrangler deploy --dry-run
# expect: Read 92 files from out/, Total Upload ~0.31 KiB, no worker bundle
```

### Problem 3 — still unexplained ❗

The Workers Builds check on PR #1 **kept failing** even after problem 2 was
fixed. The previous agent could not see why — no access to the owner's
Cloudflare account, and everything passes locally:

| check | result |
|---|---|
| `npm run build:static` | ✅ 22 html files |
| `npx wrangler deploy --dry-run` | ✅ 92 files, 0.31 KiB, no worker |
| `npx wrangler versions upload --dry-run` | ✅ |
| `npm run cf:build` | ✅ |

**First thing to do: ask the owner for the Cloudflare build log.** There is a
**"Copy build log"** button on the build page. Do not guess at the cause —
the previous session burned several turns speculating. Get the log.

Note a red check does **not** block merging PR #1 (`MERGEABLE` + `UNSTABLE`).

---

## 9. Deployment reference

### Static (current path)

```bash
npm run build:static          # STATIC_EXPORT=1 next build  -> out/
npx wrangler deploy           # reads wrangler.jsonc, assets only
```

Cloudflare dashboard equivalents: build `npm run build:static`,
deploy `npx wrangler deploy`, root `/`.

If using **Pages** instead of Workers: build command `npm run build:static`,
output directory `out`. Note the branch selector is **not** on the create
screen — it appears afterwards under Settings → Builds → Branch control.
That confused the owner once.

### OpenNext (later)

```bash
npm run cf:build
npm run cf:deploy
```

`wrangler.opennext.jsonc` has `d1_databases` and `r2_buckets` pre-staged as
comments, plus `WORKER_SELF_REFERENCE` (omitting it causes 500s on
workers.dev).

### Known deploy facts

- Pin Next to **15.x**.
- **Never** use `export const runtime = "edge"` — unsupported by the adapter.
- Node.js middleware is unsupported.
- ISR needs an R2 bucket plus `r2IncrementalCache` in `open-next.config.ts`.

---

## 10. Database plan

**Cloudflare D1.** Free, no card. MVP schema: `Video / Creator / Tag /
Category`. Tags attach to **both video pages and model/pornstar pages** — the
owner asked for this explicitly.

- D1 free: 10 DBs, 500 MB/DB, 5 GB/account, 50 queries per invocation.
- Since 2026-09-01 the free daily caps are **hard failures**: 5M rows read,
  100k written. "Rows read" means rows *scanned*, so an unindexed SELECT burns
  quota fast. **Index everything you filter on.**
- D1 paid caps at 10 GB per database and cannot be raised.

**Neon was evaluated and rejected** — by the owner, after seeing that it does
not reduce CPU time and its free tier (100 CU-hours ≈ 4 days awake, 300–500 ms
cold start, single region) is worse than D1 here. Do not reopen it unless he
does. Past 10 GB the path is Hyperdrive + `pg` ≥ 8.16.3, which is far off
(1–2 GB covers ~1M videos).

---

## 11. Roadmap

Nothing below is approved. **Ask before building any of it.**

| | Route | Note |
|---|---|---|
| 1 | `/{slug}/` | video page. A full implementation exists in reverted commit `bde6594` — restore it rather than rewriting. Includes the VideoObject JSON-LD and a progressive-MP4 player with quality toggle. |
| 2 | `/pornstars/{slug}/`, `/channels/{slug}/` | linked from video pages; tags attach here too |
| 3 | `/t/{tag}/`, `/c/{category}/` | where search traffic actually lands; apply the ≥10-video noindex guard |
| 4 | `/browse/` | the 3-click crawl hub (§7) |
| 5 | `/latest/` | |
| 6 | `/search?q=` | client-side, noindex |
| 7 | `/sitemap/{n}.xml`, `robots.txt` | |
| 8 | admin panel | section headings first; needs the OpenNext mode |

Video page anatomy agreed with the owner: player → H1 exact title → views +
relative age → rating → channel card with CTA → pornstar cards → category/tag
chips → unique prose → "More by {channel}" (10) → related grid.

---

## 12. Gotchas that cost the previous session time

- **The sandbox wipes `node_modules` and resets `.git` between tool calls.**
  Run `[ -d node_modules/next ] || npm ci` before builds. If a push is
  rejected as non-fast-forward, `git fetch` then rebase onto
  `origin/arena/1311b051-vidubuzz`; the working tree is usually already
  correct and conflicts resolve to "take mine".
- **bash has no outbound network** except localhost. `curl` to external hosts
  returns empty with exit 0. Use the web tools for research.
- `fetch_page` returns Markdown, not raw HTML — you cannot inspect `<head>`,
  canonical tags, hreflang or JSON-LD on competitor sites.
- `lalamasa.mobi` is a dead domain. Do not re-fetch.
- `.env` is gitignored; `.env.example` is committed and documents both bases.
- Watch hand-authored seed data for encoding slips — a Cyrillic character
  once got into `STAR_NAMES`.

---

## 13. Competitor intel worth keeping

**p4455.com** (really `mydesi.net`; p4455 is a mirror)
- Infrastructure, verified 2026-10-07: thumbnails on
  `mydesi-static.b-cdn.net` = **Bunny CDN** (`?class=` is Bunny Optimizer);
  video on `server35.myd-cdn.com` = **their own rented origin boxes**, at
  least 35 of them. **Not R2, not S3.** Progressive MP4, two qualities,
  no HLS. Dynamic actions on a separate `dash.mydesi.net` PHP backend.
- 10 storyboard frames per video for hover preview.
- Defects to avoid: live `/__trashed-244/` pages, UUID/thin titles, mixed
  http/https, no reliable JSON-LD.

**letsporn.com** — KVS, studio-licensed.
- Bucketed media paths — adopted, see §6.
- Facet-trap math — see §7.
- Grouped category sections with prose, thumbnail + count per card.
- "Channels" are licensed studio feeds with per-channel `/link/{channel}`
  affiliate CTAs; revenue is signup commission. If this is pursued, build a
  **feed importer, never a scraper**.
- i18n via `de.letsporn.com` with slug parity for clean hreflang.

**Our intended edge:** VideoObject JSON-LD, strict canonical and noindex
discipline, 410 Gone for deletions, one durable domain, the ≥10-video
thin-page guard, and eventually HLS.

---

## 14. Still unanswered by the owner

- Language / market: Bangla, English, or both?
- Which studio affiliate network supplies the feed?
- Whether the Cloudflare build failure (§8) is resolved.

Do not re-ask the questions he has already skipped — he ignored a prompt about
niche direction and stack once, and the stack is now locked anyway.
