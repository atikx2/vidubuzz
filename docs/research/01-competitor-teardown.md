# Competitor Teardown — p4455.com (Mydesi.net mirror)

> Research date: 2026-10-07
> Purpose: বুঝে নেওয়া ওরা টেকনিক্যালি কীভাবে rank করছে, যাতে vidubuzz-এ একই
> আর্কিটেকচার **legal, licensed কনটেন্ট + legal tag/keyword** দিয়ে বানানো যায়।

---

## 0. TL;DR — ৫ লাইনে

1. এটা কোনো custom tube script না — **plain WordPress**, কিন্তু অস্বাভাবিক বড় স্কেলে চালানো।
2. ওদের র‍্যাঙ্কিং-এর আসল অস্ত্র **কনটেন্টের মান না, ইনডেক্স ভলিউম** — sitemap-এ আনুমানিক **১০ লাখ+ URL**।
3. Origin সার্ভার শুধু HTML দেয়। থাম্ব, ভিডিও, প্রিভিউ ফ্রেম, এমনকি **sitemap পর্যন্ত আলাদা CDN হোস্টে** — তাই origin কখনো ধীর হয় না।
4. Publishing velocity পাগলাটে: related গ্রিডে "52 seconds ago", "1 minute ago" দেখা যায়। প্রতিদিন হাজার হাজার পোস্ট, সম্পূর্ণ অটোমেটেড।
5. একটা hub পেজ (`/help-map/`) পুরো সাইটের crawl path কন্ট্রোল করে।

---

## 1. Stack ও Infrastructure ম্যাপ

| লেয়ার | কী ব্যবহার করছে | কেন গুরুত্বপূর্ণ |
|---|---|---|
| CMS | WordPress (permalink `/%postname%/`, native `wp-sitemap.xml`) | সস্তা, কিন্তু স্কেলে ভঙ্গুর |
| HTML origin | `p4455.com` (একাধিক mirror ডোমেইনের একটি; `<title>` বলছে "Mydesi.net") | ডোমেইন ব্লক হলে পরেরটায় সুইচ |
| Grid thumbnails | `mydesi-static.b-cdn.net/thumb/{id}.jpg?class=myd` | **BunnyCDN** + named transform preset |
| Preview frames | `static.myd-cdn.com/pview/{id}/frame_01..10.jpg?class=vtum` | প্রতি ভিডিওতে ১০টা স্টোরিবোর্ড ফ্রেম |
| Video files | `server35.myd-cdn.com/{id}.mp4`, `{id}_480p.mp4` | progressive MP4, HD/SD, **numbered server shards** (server35 = কমপক্ষে ৩৫টা স্টোরেজ নোড) |
| Sitemap origin | `originx.myd-cdn.com` | sitemap-ও CDN থেকে — crawl load origin-এ পড়ে না |
| Dynamic actions | `dash.mydesi.net` (follow / report / favorite) | সব state-ful কাজ আলাদা অ্যাপে → **মূল পেজ 100% cacheable** |
| Ads | `datav.myd-cdn.com/goo.php` | cloaked redirect, "Mom Fucking"/"love me" বাটনের ছদ্মবেশে |

**মূল শিক্ষা:** ওরা *read path* আর *write path* সম্পূর্ণ আলাদা করেছে। যে পেজে ইউজার আসে সেটা সম্পূর্ণ static — তাই লক্ষ লক্ষ পেজ সার্ভ করেও সার্ভার মরে না।

`?class=myd` / `?class=vtum` — BunnyCDN Optimizer-এর named preset. একবার কনফিগার করে URL-এ নাম দিলেই resize/WebP হয়ে যায়।

---

## 2. URL ও Taxonomy আর্কিটেকচার

```
/                                 → trending homepage
/page/2/                          → pagination
/latest/                          → freshness feed
/{video-title-slug}/              → ★ video page (root level, কোনো /video/ prefix নেই)
/category/{slug}/                 → category (amateur, hard, …)
/actor/{slug}/                    → ★ entity page per performer/channel
/countries/                       → country hub
/photos/  /photos/{slug}/         → photo gallery vertical
/stories/ /stories/{slug}/        → text story vertical
/help-map/                        → ★ master hub page
```

তিনটা জিনিস ★ দিয়ে চিহ্নিত — এগুলোই আসল SEO ইঞ্জিন।

### ২.১ Flat root-level slug
`/college-girlfriend-hardcore-sex/` — কোনো `/video/`, কোনো `?id=`, কোনো ডেট ফোল্ডার নেই।
URL = টাইটেল = টার্গেট কীওয়ার্ড। সবচেয়ে ছোট সম্ভাব্য URL depth, সর্বোচ্চ keyword proximity।

### ২.২ তিনটা আলাদা content vertical
Videos + Photos + Stories — একই নিশে **তিনগুণ keyword surface**। একই কীওয়ার্ডে ভিডিও পেজ, গ্যালারি পেজ আর গল্প পেজ, তিনটাই SERP-এ লড়তে পারে।

### ২.৩ `/help-map/` — আসল চালাকি
একটা মাত্র পেজ, যেখান থেকে সব বড় list পেজে লিংক:
`All countries list`, `All Youtubers`, `Top Indian Actors`, `All Tango Stars`,
`Webseries sites`, `Cam Stars`, `Onlyfans Stars`, `App Actors`, `Faphouse Channels`,
`Xvideos.red Profiles`, `Stripchat Models`, `Premium Siterips`

Googlebot হোমপেজ → help-map → list পেজ → হাজার হাজার entity পেজ — **৩ ক্লিকে পুরো সাইট crawlable**।
এটাই pure hub-and-spoke internal linking।

> ⚠️ ওদের এই লিস্টগুলোর *কনটেন্ট* (রিয়েল মানুষের নামে "nude list", পাইরেটেড siterip) আমরা কপি করব না।
> আমরা কপি করব **স্ট্রাকচারটা**: এক পেজ থেকে সব hub-এ লিংক।

---

## 3. ইনডেক্স স্কেল — আসল সংখ্যা

`wp-sitemap.xml` থেকে গোনা (WordPress ডিফল্ট ২০০০ URL / ফাইল):

| Sitemap type | ফাইল সংখ্যা | আনুমানিক URL |
|---|---:|---:|
| `posts-post` (videos) | **399** | ~798,000 |
| `posts-story` | 86 | ~172,000 |
| `posts-photos` | 30+ | ~60,000+ |
| `taxonomies-actors` | 14 | ~28,000 |
| `taxonomies-post_tag` | 5 | ~10,000 |
| category / countries / অন্যান্য | 6 | কয়েক হাজার |
| **মোট** | **~540 ফাইল** | **≈ ১০ লাখ+ URL** |

**robots.txt:**
```
User-agent: *
Disallow:
```
কিচ্ছু ব্লক করা নেই। সব খোলা। এটা একটা সচেতন সিদ্ধান্ত — maximum crawl surface।

**এটাই ওদের পুরো স্ট্র্যাটেজির মর্মকথা:** কোয়ালিটি দিয়ে না, **ভলিউম** দিয়ে জেতা।
১০ লাখ পেজের প্রতিটা যদি মাসে গড়ে ৫ জন ভিজিটরও আনে, সেটা মাসে ৫০ লাখ ভিজিট।
কোনো একটা পেজকে #১ করার দরকারই নেই।

---

## 4. একটা Video পেজের শারীরস্থান

`/college-girlfriend-hardcore-sex/` ভেঙে দেখলে:

```
┌─ Sticky bar: "All content free · updated every 5 minutes"   ← freshness signal
├─ Video.js player (HD/SD quality selector, rotate, captions UI)
├─ <h1> College Girlfriend Hardcore Sex                        ← exact keyword
├─ Chips: [Amateur] [Hard] [mmsvibex521]                       ← category + actor লিংক
├─ Actions: Follow · Embed · Report · Favorite · Download      ← সব dash.* সাবডোমেইনে
├─ Download: [HD 1080p] [SD 480p]                              ← direct mp4 লিংক
├─ 10 × preview frames (frame_01…frame_10, #img_N anchor সহ)   ← ★
└─ "More like this" — 8টা related ভিডিও গ্রিড                  ← ★ internal link mesh
```

দুটো জিনিস বিশেষভাবে নজর করার মতো:

**(ক) ১০টা preview frame** — প্রতিটা আলাদা `<img>`, আলাদা anchor।
ফল: Google Images-এ প্রতি ভিডিও থেকে ১০টা entry, পেজে dwell time বাড়ে,
আর ইউজার প্লে না করেই কনটেন্ট বুঝতে পারে (bounce কমে)।

**(খ) গ্রিড কার্ডে inline `<video>` ট্যাগ** — মার্কআপে "Your browser does not support the video tag" ফলব্যাক আছে, মানে hover করলে ছোট প্রিভিউ ক্লিপ চলে। CTR booster।

---

## 5. যে ১০টা মেকানিক আসলে কাজ করছে (এবং legal নিশে হুবহু কপি করা যায়)

| # | মেকানিক | vidubuzz-এ কীভাবে |
|---|---|---|
| 1 | Flat root-level keyword slug | `/{slug}/`, কোনো prefix না |
| 2 | বিশাল programmatic long-tail ইনভেন্টরি | প্রতি ভিডিও = একটা আলাদা landing page |
| 3 | Hub page → list page → entity page (৩ ক্লিক) | আমাদের নিজস্ব `/browse/` hub |
| 4 | Per-entity পেজ (`/actor/{slug}/`) | আমাদের **verified creator/channel** পেজ |
| 5 | Freshness loop ("X minutes ago" + constant publish) | relative timestamp + স্থির publishing schedule |
| 6 | সব মিডিয়া CDN-এ, origin শুধু HTML | Bunny/Cloudflare R2 + image transform preset |
| 7 | Sitemap আলাদা হোস্টে, segment করা | auto-generated, ৫০k URL/ফাইল limit মেনে |
| 8 | Preview frame storyboard = image search surface | ffmpeg দিয়ে ১০ ফ্রেম অটো-এক্সট্র্যাক্ট |
| 9 | Related grid = প্রতি পেজে internal link | tag-overlap ভিত্তিক related |
| 10 | Dynamic action আলাদা endpoint-এ → full page cache | API route আলাদা, পেজ static/ISR |

এর সাথে আমরা যা **যোগ** করব (ওদের নেই, আর এটাই আমাদের এজ):

- **`VideoObject` JSON-LD schema** — ওদের পেজে ঠিকমতো নেই। এটা থাকলে Google SERP-এ
  thumbnail + duration সহ video rich result পাওয়া যায়। বিশাল CTR সুবিধা।
- **HLS adaptive streaming** — ওরা progressive MP4 দিচ্ছে (HD/SD manual toggle)।
  HLS দিলে buffering কমে, mobile-এ dwell time বাড়ে।
- **পরিষ্কার canonical + `noindex` ডিসিপ্লিন** — নিচে দেখুন।

---

## 6. যা কপি করা যাবে না (এবং করা উচিতও না)

### ৬.১ লিগ্যাল — এগুলো আমাদের মডেলে নেই
- Non-consensual / "leak" কনটেন্ট, নাম ধরে রিয়েল মানুষের nude list
- "Premium siterips", OnlyFans/Xvideos.red চুরি করা কনটেন্ট
- incest / "teen" ফ্রেমিং — payment processor আর প্রায় সব জুরিসডিকশনে রেড লাইন
- Cloaked ad redirect (`goo.php`) — Google-এর cloaking পলিসি ভঙ্গ, ম্যানুয়াল পেনাল্টি

### ৬.২ টেকনিক্যাল ভুল — ওরা করছে, আমরা করব না
| ওদের সমস্যা | প্রমাণ | আমাদের সমাধান |
|---|---|---|
| ডিলিট করা পোস্ট ইনডেক্সে | `/__trashed-244/` লাইভ ও লিংকড | 410 Gone + sitemap থেকে বাদ |
| Thin / duplicate টাইটেল | `image-560516`, `5de9ff1c-12aa-47be-…` | টাইটেল বাধ্যতামূলক, hash slug নিষিদ্ধ |
| Hash-suffixed ডুপ্লিকেট | `…-896627c8`, `…-103a74cc` | dedupe + canonical |
| Mixed HTTP/HTTPS | sitemap-এ `http://originx…` | সব HTTPS |
| কোনো কিছু ব্লক করা নেই | `Disallow:` ফাঁকা | pagination/filter পেজে `noindex,follow` |
| Domain rotation নির্ভরতা | lalamasa.mobi **ইতিমধ্যে মৃত** | একটা ডোমেইন, brand authority গড়া |

> **lalamasa.mobi এখন আর নেই** — "Website not found", ডোমেইন কোনো সার্ভারে bound না।
> churn-and-burn মডেলের পরিণতি ঠিক এটাই। আমরা উল্টো পথে যাব: একটা ডোমেইন, দীর্ঘমেয়াদি authority।

---

## 7. vidubuzz-এর জন্য প্রস্তাবিত আর্কিটেকচার

```
Next.js (App Router) + TypeScript + Tailwind
  ├─ PostgreSQL (Prisma)        — video, creator, tag, category, license record
  ├─ Object storage + CDN       — Bunny / Cloudflare R2 + Stream
  ├─ ffmpeg worker              — HLS transcode + ১০ preview frame + sprite
  └─ Redis                      — view counter, trending

রাউট:
  /                             ISR 5min   trending
  /latest/                      ISR 1min   freshness feed
  /{slug}/                      ISR        video page + VideoObject JSON-LD
  /c/{category}/                ISR        category hub
  /t/{tag}/                     ISR        tag page   ← long-tail ইঞ্জিন
  /creator/{slug}/              ISR        verified creator entity page
  /browse/                      static     master hub (ওদের help-map-এর জায়গায়)
  /search?q=                    noindex
  /sitemap/[n].xml              auto, 50k URL/file
  /robots.txt                   pagination + search ব্লক, বাকি সব open

Compliance (legal অপারেশনের জন্য বাধ্যতামূলক, পরে বসানো যায় না):
  ├─ Age verification gate
  ├─ প্রতি ভিডিওতে license / consent record (কোন সোর্স, কী পারমিশন)
  ├─ DMCA / takedown ফর্ম + response SLA
  └─ Creator verification (ID + বয়স প্রমাণ) আপলোডের আগে
```

### কীওয়ার্ড স্ট্র্যাটেজি — legal tag দিয়ে একই ভলিউম
ওদের ভলিউম আসে illegal entity নাম থেকে। আমাদের আসবে **combination tag** থেকে:

```
/t/{category}-{attribute}-{format}/
```
যেমন: category (১৫) × attribute (৪০) × format/quality (৮) = **৪,৮০০ বৈধ tag পেজ**,
প্রতিটায় অন্তত ১০টা ভিডিও থাকলে তবেই পেজটা index হবে (thin page গার্ড)।
এটাই programmatic SEO — কোনো রিয়েল মানুষের নাম ছাড়াই ছয় অঙ্কের URL ইনভেন্টরি।

---

## 8. সিদ্ধান্ত নেওয়া বাকি

1. **কনটেন্ট সোর্স** — লাইসেন্স কোথা থেকে? (studio feed / content partner API / নিজস্ব creator আপলোড?)
   এটার উপরই ingestion pipeline-এর ডিজাইন দাঁড়াবে।
2. **ভাষা ও মার্কেট** — Bangla / Hindi / English? Geo টার্গেট কোথায়?
   (hreflang আর tag ভোকাবুলারি এর উপর নির্ভর করে)
3. **স্কেল টার্গেট** — লঞ্চে কত ভিডিও? ১ হাজার না ১ লাখ?
4. **হোস্টিং + CDN বাজেট** — ভিডিও ব্যান্ডউইথই সবচেয়ে বড় খরচ।
5. **Monetization** — ad network / membership / creator revenue share?

---

## 9. পরবর্তী ধাপ

- [ ] আরও কম্পিটিটর লিংক রিভিউ (ইউজার দেবেন)
- [ ] উপরের ৫টা সিদ্ধান্ত চূড়ান্ত
- [ ] Tag taxonomy ভোকাবুলারি ড্রাফট
- [ ] Next.js স্ক্যাফোল্ড + ডেটা মডেল
- [ ] লাইভ প্রিভিউ

---

## 10. ইনফ্রাস্ট্রাকচার — ওরা আসলে কী ব্যবহার করে (২০২৬-১০-০৭ যাচাই)

হোমপেজ ও একটা ভিডিও পেজের asset URL দেখে পাওয়া গেল।

| কী | হোস্ট | আসল প্ল্যাটফর্ম |
|---|---|---|
| Thumbnail | `mydesi-static.b-cdn.net/thumb/{id}.jpg?class=myd` | **Bunny CDN** |
| Storyboard frame ×10 | `static.myd-cdn.com/pview/{id}/frame_01..10.jpg?class=vtum` | নিজস্ব ডোমেইন, পেছনে Bunny Optimizer |
| ভিডিও HD | `server35.myd-cdn.com/{id}.mp4` | **নিজস্ব নম্বরওয়ালা origin সার্ভার** |
| ভিডিও SD | `server35.myd-cdn.com/{id}_480p.mp4` | একই সার্ভার |
| Follow / report / favorite | `dash.mydesi.net/*.php` | আলাদা PHP ব্যাকএন্ড |
| Ad redirect | `datav.myd-cdn.com/goo.php` | — |

### যা এর থেকে বোঝা যায়

1. **Cloudflare R2 নয়।** `b-cdn.net` হলো Bunny-র pull zone hostname, আর `?class=`
   হলো Bunny Optimizer-এর নামযুক্ত image preset — অর্থাৎ ওরা thumbnail আগে থেকে
   বানিয়ে রাখে না, রিকোয়েস্টের সময় রিসাইজ করায়।
2. **HLS নেই।** সরাসরি progressive `.mp4`, মাত্র দুটো রেন্ডিশন (HD + SD), ইউজার
   হাতে বদলায়। adaptive bitrate নেই।
3. **`server35`** মানে অন্তত ৩৫টা origin বক্স — ভাড়া করা dedicated/storage সার্ভার,
   object storage নয়। ক্লাসিক টিউব প্যাটার্ন: unmetered bandwidth-এর সস্তা বক্স।
4. **`p4455.com` আসল ব্র্যান্ড নয়** — টাইটেল বলছে `Mydesi.net`। p4455 একটা mirror
   ডোমেইন, ব্লক এড়ানোর জন্য।

### আমাদের প্ল্যানে এর প্রভাব

- **Egress-এ আমরা এগিয়ে।** Bunny প্রতি GB বিল করে; R2-তে egress চিরকাল $0।
  বড় হলে এই পার্থক্যটাই সবচেয়ে বড়।
- **কিন্তু একটা জিনিস আমাদের বদলানো উচিত।** আগে ঠিক করেছিলাম ১০-সেকেন্ডের
  সেগমেন্টে HLS। R2-র বিলিং **অপারেশন-ভিত্তিক** (Class B: $0.36/মিলিয়ন,
  ১০M ফ্রি), তাই:

  | | প্রতি ভিউ GET | ১০ লক্ষ ভিউ/মাসে |
  |---|---|---|
  | HLS ১০s সেগমেন্ট | ~৩০ | ৩০M ops → **~$৭/মাস** |
  | Progressive MP4 | ~৫ | ৫M ops → **$০ (ফ্রি টিয়ারে)** |

  অর্থাৎ শূন্য বাজেটে p4455-এর মডেলটাই (২–৩টা MP4 রেন্ডিশন + ম্যানুয়াল
  quality টগল) সস্তা **এবং** সহজ — সেগমেন্টিং পাইপলাইনই লাগে না।
- **দাম দিতে হয় UX-এ:** adaptive bitrate না থাকায় দুর্বল মোবাইল নেটওয়ার্কে
  বাফার করবে। টাকা আর ট্রাফিক এলে HLS-এ যাওয়া যাবে — R2 key layout একই থাকবে।
- **Thumbnail আমরা আগেই বানিয়ে রাখব** (`360x203`, `240x135`), কারণ Cloudflare-এ
  on-the-fly রিসাইজ পেইড (Cloudflare Images)। এটা আমাদের প্ল্যানে আগে থেকেই আছে।
