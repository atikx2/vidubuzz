# Cloudflare Setup — ধাপে ধাপে

> লক্ষ্য: মোবাইল থেকে খোলা যায় এমন একটা পাবলিক preview URL, আর তার উপর
> বসানো ডেটাবেস + মিডিয়া স্টোরেজ।

---

## ০. আগে জেনে রাখুন — দুটো জরুরি সিদ্ধান্ত

### Pages নয়, Workers

**Cloudflare Pages এখন আর Next.js-এর জন্য রেকমেন্ডেড না।** পুরনো
`@cloudflare/next-on-pages` অ্যাডাপ্টার superseded, আর ওটা শুধু Edge runtime
সাপোর্ট করত (মানে image optimization, ISR, অনেক ফিচার কাজ করত না)।

Cloudflare এখন নিজেই **Workers + `@opennextjs/cloudflare`** রেকমেন্ড করে।
আমি সেটাই কনফিগার করে রেখেছি। আপনি Pages-এ deploy করতে গেলে ভুগবেন।

### ভিডিও CDN দিয়ে সার্ভ করা যাবে না (ফ্রি প্ল্যানে)

এটা সবচেয়ে বড় ফাঁদ, বেশিরভাগ টিউব সাইট এখানেই ধরা খায়।

Cloudflare **বৈধ অ্যাডাল্ট কনটেন্ট ক্যাটাগরি হিসেবে নিষিদ্ধ করে না** — তাদের
acceptable-use নিয়ম অবৈধ জিনিস (CSAM, trafficking) টার্গেট করে, বৈধ সাইট না।

**কিন্তু** Service-Specific Terms বলে: Free / Pro / Business গ্রাহকদের
**CDN দিয়ে ভিডিও ও বড় ফাইল সার্ভ করতে হলে একটা পেইড প্রোডাক্ট কিনতে হবে**
(Developer Platform, Images, বা Stream)। না কিনে করলে Cloudflare CDN অ্যাক্সেস
সীমিত বা বন্ধ করে দিতে পারে।

**আমাদের সমাধান:** ভিডিও **R2**-তে রাখব। R2 একটা পেইড প্রোডাক্ট (ফ্রি টিয়ার আছে)
এবং এটাই ভিডিও সার্ভ করার অনুমোদিত পথ। R2-এর **egress একদম ফ্রি** — এটাই
Cloudflare-এ যাওয়ার মূল কারণ, কারণ ভিডিও সাইটে ব্যান্ডউইথই সবচেয়ে বড় খরচ।

> ❌ ভুল: ভিডিও নিজের সার্ভারে রেখে orange-cloud proxy করা
> ✅ ঠিক: ভিডিও R2-তে, R2 custom domain দিয়ে সার্ভ

---

## ০.৫ দুটো বিল্ড মোড — কোনটা এখন নেবেন

রিপোতে এখন **দুটো** বিল্ড মোড আছে। দুটোই কাজ করে, দুটোই টেস্ট করা।

| | **A — Static Export** ⭐ এখন এটা নিন | **B — OpenNext Worker** |
|---|---|---|
| কমান্ড | `npm run build:static` | `npm run cf:build` |
| আউটপুট | `out/` — আসল `.html` ফাইল | `.open-next/` — Worker বান্ডল |
| পেজ লোডে Worker চলে? | **না, একদমই না** | হ্যাঁ (শুধু cache পড়ে) |
| ১০ms CPU লিমিট | **প্রযোজ্যই নয়** | লাগার কথা না, তবে লিমিটটা আছে |
| রিকোয়েস্ট লিমিট (১ লাখ/দিন) | **প্রযোজ্যই নয়** | প্রযোজ্য |
| কার্ড লাগে? | না | না |
| খরচ | **$0, সবসময়** | $0 (ফ্রি টিয়ারে) |
| ভবিষ্যতে ISR / API route / admin panel | ❌ পাবেন না | ✅ পাবেন |

**এখন A নিন।** সাইটের সব পেজ এমনিতেই static, তাই B-এর বাড়তি সুবিধা এই মুহূর্তে
আপনি ব্যবহারই করছেন না — শুধু ঝুঁকিটা নিচ্ছেন। পরে যখন admin panel বা ডেটাবেস
লাগবে, তখন এক লাইনে B-তে যাওয়া যাবে, কোড বদলাতে হবে না।

### কেন A-তে ১০ms সমস্যা *হতেই পারে না*

Cloudflare-এ static file সার্ভ হয় **assets binding** দিয়ে, যেটা Worker-এর
বাইরের জিনিস। `.html` ফাইলটা সরাসরি CDN থেকে যায় — আপনার কোড চলেই না। তাই
CPU-ও নেই, রিকোয়েস্ট বিলিংও নেই।

B-তে কী হয় সেটাও পরিষ্কার করে বলি, কারণ আগে আমি একটু সরল করে বলেছিলাম:
HTML build-এর সময়েই বানানো হয়ে যায়, কিন্তু সেটা Cloudflare-এ **cache-এ**
জমা থাকে, আলাদা ফাইল হিসেবে নয়। তাই প্রতি রিকোয়েস্টে Worker একবার চলে —
route মিলিয়ে cache থেকে HTML পড়ে পাঠায়। React রেন্ডার হয় না, তাই খরচ
কয়েক মিলিসেকেন্ড, ১০ms-এর অনেক নিচে। **শূন্য নয়, তবে নিরাপদ।**

### A দিয়ে ফোন থেকেই deploy (কার্ড ছাড়া)

1. ফোনের ব্রাউজারে `dash.cloudflare.com` → **Workers & Pages** → **Create**
2. **Pages** ট্যাব → **Connect to Git** → `atikx2/vidubuzz` সিলেক্ট করুন
3. ব্রাঞ্চ: `arena/1311b051-vidubuzz`
4. সেটিংস:
   - Framework preset: **None**
   - Build command: `npm run build:static`
   - Build output directory: `out`
5. **Save and Deploy** → ২–৩ মিনিট পর `https://vidubuzz.pages.dev` পাবেন

এই URL ফোনে খুলবে, কাউকে পাঠানো যাবে, আর খরচ শূন্য।

> দ্রষ্টব্য: এখানে Pages ব্যবহার করছি কারণ এটা **খাঁটি static site** —
> উপরে "Pages নয়, Workers" বলেছিলাম সেটা Next.js-এর **SSR** deploy-এর
> ক্ষেত্রে সত্যি (`@cloudflare/next-on-pages` বাতিল হয়েছে)। static export-এ
> সেই সমস্যা নেই, Cloudflare নিজেই এই পথটা সাজেস্ট করে।

---

## ১. কী কী অ্যাকাউন্ট লাগবে

| # | অ্যাকাউন্ট | খরচ | কখন লাগবে |
|---|---|---|---|
| 1 | **Cloudflare** | ফ্রি | এখনই — সব এখানেই |
| 2 | **GitHub** | ফ্রি | ✅ আপনার আছে |
| 3 | **ডোমেইন** | ~$10/বছর | পরে — শুরুতে ফ্রি `.workers.dev` সাবডোমেইন |
| 4 | **Workers Paid** | **$5/মাস** | R2 চালু করার সময় |

**শুরু করতে শুধু ১ নম্বরটাই লাগবে।** ফ্রি অ্যাকাউন্টেই preview URL পেয়ে যাবেন।
R2 (ভিডিও আপলোড) ধরার সময় $5/মাসের Workers Paid নিতে হবে — কার্ড লাগবে।

**ডোমেইন** এখনই কিনতে হবে না। `vidubuzz.workers.dev` দিয়েই মোবাইলে দেখতে পারবেন।
পরে কিনলে Cloudflare Registrar থেকে নেবেন (at-cost দামে বিক্রি করে, markup নেই)।

---

## ২. Preview চালু করা (১০ মিনিট)

### ধাপ ২.১ — Cloudflare অ্যাকাউন্ট

1. https://dash.cloudflare.com/sign-up — ইমেইল দিয়ে সাইন আপ
2. ইমেইল ভেরিফাই করুন
3. ডোমেইন যোগ করতে বললে **skip** করুন, এখন দরকার নেই

### ধাপ ২.২ — GitHub-এ কোড (✅ করা আছে)

কোড ইতিমধ্যে `main` ব্রাঞ্চে merge করা। কনফিগ ফাইলগুলোও আছে:
`wrangler.jsonc`, `infra/open-next.config.ts`, আর `package.json`-এ `cf:*` স্ক্রিপ্ট।

> ⚠️ **গুরুত্বপূর্ণ:** `open-next.config.ts` ইচ্ছাকৃতভাবে রিপো-রুটে **নেই**, `infra/`-তে
> আছে। কারণ wrangler ডিফল্টভাবে framework autoconfiguration চালায় — রুটে
> `next.config.ts` + `open-next.config.ts` দুটোই থাকলে `npx wrangler deploy`
> নিজে deploy না করে `opennextjs-cloudflare deploy`-কে ডাকে, আর static বিল্ড
> `.open-next/` বানায় না বলে সেটা `Could not find compiled Open Next config`
> দিয়ে fail করে। OpenNext পথ ব্যবহার করতে হলে আগে `npm run cf:enable`। বিস্তারিত
> `AGENTS.md` §8-এ।

### ধাপ ২.৩ — Worker তৈরি ও GitHub যুক্ত করা

ড্যাশবোর্ডে:

```
Workers & Pages  →  Create  →  Workers  →  Import a repository
```

1. GitHub অ্যাকাউন্ট connect করুন, `atikx2/vidubuzz` রিপো বেছে নিন
2. **Branch:** `arena/1311b051-vidubuzz`
3. বিল্ড সেটিংস:

| ফিল্ড | মান |
|---|---|
| Project name | `vidubuzz` |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` |
| Build output directory | *(ফাঁকা রাখুন)* |

4. **Save and Deploy**

~৯০ সেকেন্ড পর URL পাবেন:

```
https://vidubuzz.<your-subdomain>.workers.dev
```

**এই লিংকটা ফোনে খুলুন** — এখন থেকে প্রতিটা `git push`-এ অটো আপডেট হবে।

### বিকল্প: CLI থেকে deploy

ড্যাশবোর্ড ঝামেলা মনে হলে:

```bash
npx wrangler login     # ব্রাউজার খুলে অনুমতি চাইবে
npm run cf:deploy
```

> ⚠️ আমি সার্ভার থেকে deploy করতে পারব না — আপনার Cloudflare অ্যাকাউন্টের
> লগইন দরকার, আর আমি কখনো আপনার পাসওয়ার্ড বা API টোকেন চাইব না।
> `wrangler login` আপনার ব্রাউজারে চলবে। অথবা ড্যাশবোর্ড থেকে GitHub যুক্ত করলে
> আমাকে কিছুই করতে হবে না — push করলেই deploy হবে।

### Preview deployment (প্রতি ব্রাঞ্চে আলাদা URL)

Workers → Settings → **Builds** → *Preview branches* চালু করুন।
তাহলে প্রতিটা non-production ব্রাঞ্চ নিজের আলাদা URL পাবে — main-এ merge করার
আগে ফোনে টেস্ট করতে পারবেন।

---

## ৩. ডেটাবেস — হ্যাঁ, Cloudflare-এই রাখা যাবে (D1)

**D1** = Cloudflare-এর serverless SQLite, Workers-এর সাথে নেটিভ ইন্টিগ্রেটেড।
আলাদা কোনো হোস্টিং লাগবে না, connection pooling-এর ঝামেলা নেই।

### লিমিট

| | Free | Workers Paid ($5/মা) |
|---|---|---|
| ডেটাবেস সংখ্যা | 10 | 50,000 |
| প্রতি DB সাইজ | 500 MB | **10 GB** |
| মোট স্টোরেজ | 5 GB | 1 TB |
| Rows read/দিন | 5M (হার্ড লিমিট) | অনেক বেশি |
| Rows written/দিন | 100K | অনেক বেশি |

> ⚠️ সেপ্টেম্বর ২০২৬ থেকে ফ্রি টিয়ারের লিমিট **হার্ড** — অতিক্রম করলে
> কুয়েরি ফেইল করবে। আর "rows read" মানে রিকোয়েস্ট সংখ্যা না, **কুয়েরি ইঞ্জিন
> যত রো স্ক্যান করে** তত। index ছাড়া একটা SELECT বিশাল কোটা খেয়ে ফেলতে পারে।
> **শিক্ষা: প্রতিটা ফিল্টার কলামে index দিতেই হবে।**

### আমাদের কেসে D1 ঠিক আছে কি?

হ্যাঁ — কারণ **ভিডিও ফাইল D1-এ যাবে না**, ওগুলো R2-তে। D1-এ শুধু মেটাডেটা:

```
videos    — id, slug, title, duration, views, thumb_key, r2_key
channels  — id, slug, name
models    — id, slug, name
tags      — id, slug, name
জয়েন টেবিল
```

১০ লাখ ভিডিওর মেটাডেটাও ~1-2 GB-র বেশি হবে না। 10 GB-তে আরামে ধরবে
(আনুমানিক ২–৪ কোটি রো)।

D1 **read-heavy** কাজে দারুণ (রাইট ~500–2000/সে পর্যন্ত), আর টিউব সাইট
৯৫% পড়া, ৫% লেখা। পুরোপুরি মানানসই।

### কখন D1 ছাড়তে হবে

- ডেটা ১০ GB ছাড়ালে
- ভারী রাইট লোড (রিয়েল-টাইম ভিউ কাউন্টার প্রতি ভিউতে DB রাইট — এটা **KV বা
  Durable Object**-এ রাখবেন, D1-এ না)
- তখন বিকল্প: Neon/Supabase Postgres + **Hyperdrive** (Cloudflare-এর
  connection pooler)

### তৈরি করার কমান্ড

```bash
npx wrangler d1 create vidubuzz-db
```

আউটপুটে `database_id` দেবে → `wrangler.jsonc`-এর কমেন্ট করা `d1_databases`
ব্লকটা uncomment করে ওখানে বসিয়ে দিন।

---

## ৪. R2 — ভিডিও ও ছবি

### কেন R2

| | R2 | AWS S3 |
|---|---|---|
| স্টোরেজ | $0.015/GB/মা | ~$0.023/GB/মা |
| **Egress (ডাউনলোড)** | **$0 — ফ্রি** | ~$0.09/GB |

ভিডিও সাইটে egress-ই সব। ১০ TB/মাস ট্রাফিকে S3-তে ~$900, R2-তে **$0**।
এটাই Cloudflare বেছে নেওয়ার একমাত্র সবচেয়ে বড় কারণ।

ফ্রি টিয়ার: ১০ GB স্টোরেজ/মাস। তার বেশি লাগলে Workers Paid ($5/মা) + ব্যবহার অনুযায়ী।

### বাকেট তৈরি

```bash
npx wrangler r2 bucket create vidubuzz-media    # ভিডিও + থাম্বনেইল
npx wrangler r2 bucket create vidubuzz-cache    # OpenNext ISR cache
```

তারপর `wrangler.jsonc`-এর `r2_buckets` ব্লক uncomment করুন।

### পাবলিক অ্যাক্সেস

R2 বাকেট ডিফল্টে প্রাইভেট। ভিডিও সার্ভ করতে:

```
R2 → bucket → Settings → Custom Domain → cdn.vidubuzz.com
```

`.r2.dev` ডিফল্ট ডোমেইন **প্রোডাকশনে ব্যবহার করবেন না** (rate-limited)।
custom domain লাগবে — মানে এই ধাপে ডোমেইন কিনতে হবে।

### ফোল্ডার স্ট্রাকচার (letsporn-এর bucket প্যাটার্ন)

```
videos/{bucket}/{id}/hls/master.m3u8      ← HLS প্লেলিস্ট
videos/{bucket}/{id}/hls/720p/*.ts
thumbs/{bucket}/{id}/360x203/1..10.jpg    ← গ্রিড
thumbs/{bucket}/{id}/240x135/1..10.jpg    ← সাইডবার
previews/{bucket}/{id}/preview.mp4        ← hover স্ক্রাব

bucket = floor(id/1000)*1000
```

এক ফোল্ডারে অসংখ্য ফাইল জমা আটকাতে এই bucket ভাগ — `03-letsporn-teardown.md`-এ
বিস্তারিত আছে।

---

## ৫. খরচের বাস্তব হিসাব

| পর্যায় | কী | $/মাস |
|---|---|---|
| **এখন (preview)** | Workers Free | **$0** |
| **লঞ্চ** | Workers Paid + D1 + R2 (ছোট) | **~$5–10** |
| ডোমেইন | Cloudflare Registrar | ~$1 (বার্ষিক ~$10) |
| **স্কেল** (10 TB/মা) | R2 egress ফ্রি, শুধু স্টোরেজ+ops | **~$30–60** |

তুলনায় একই ট্রাফিক AWS/Vercel-এ **$900+**। পার্থক্যটা পুরোটাই egress।

---

## ৬. কী ইতিমধ্যে করা আছে

- [x] `@opennextjs/cloudflare` + `wrangler` ইনস্টল
- [x] Next 15.5.27-এ আপগ্রেড (adapter-এর পিয়ার রিকোয়ারমেন্ট)
- [x] `wrangler.jsonc` — assets binding, nodejs_compat, self-reference
- [x] `infra/open-next.config.ts` (রুটে নয় — উপরের সতর্কতা দেখুন)
- [x] `cf:enable` / `cf:build` / `cf:preview` / `cf:deploy` স্ক্রিপ্ট
- [x] `.gitignore` — `.open-next/`, `.wrangler/`, `.dev.vars`
- [x] বিল্ড যাচাই: **সফল**, bundle 826 KB gzipped (লিমিট 64 MiB)
- [x] `wrangler deploy --dry-run`: **পাস**
- [x] কোনো `export const runtime = "edge"` নেই (adapter সাপোর্ট করে না)

## ৭. এখন আপনার পালা

1. Cloudflare-এ সাইন আপ (ফ্রি)
2. Workers & Pages → Create → Workers → Import a repository
3. রিপো + ব্রাঞ্চ বেছে উপরের বিল্ড সেটিংস বসান
4. Deploy → URL ফোনে খুলুন

ডোমেইন, R2, D1 — এগুলো preview দেখার পর ধরলেই হবে।

---

## ৮. লোকাল টেস্ট (ঐচ্ছিক)

```bash
npm run cf:preview
```

আসল Cloudflare রানটাইম (workerd)-এ লোকালি চালাবে। `next dev`-এর চেয়ে ধীর,
কিন্তু প্রোডাকশন-নির্ভুল — deploy করার আগে ISR, middleware, D1/R2 binding
টেস্ট করার জন্য এটাই ব্যবহার করবেন।
