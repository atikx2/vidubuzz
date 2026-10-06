# Competitor Teardown #2 — letsporn.com

> Research date: 2026-10-07
> এটা p4455-এর **সম্পূর্ণ বিপরীত স্ট্র্যাটেজি**, এবং আমাদের জন্য অনেক বেশি প্রাসঙ্গিক।

---

## 0. TL;DR

1. প্ল্যাটফর্ম: **KVS (Kernel Video Sharing)** — অ্যাডাল্ট টিউব ইন্ডাস্ট্রির স্ট্যান্ডার্ড কমার্শিয়াল CMS।
2. কনটেন্ট আসে **লাইসেন্সড স্টুডিও ফিড** থেকে (Blacked, JoyMii, Club SweetHearts...) — `/channels/` সেকশনটাই আসলে স্টুডিও পার্টনার লিস্ট।
3. ইনডেক্স সাইজ p4455-এর ~৫% — কিন্তু প্রতিটা পেজ **আসল কনটেন্ট সমৃদ্ধ**।
4. **robots.txt-টাই এই সাইটের সবচেয়ে মূল্যবান জিনিস** — শল্যচিকিৎসকের মতো নিখুঁত crawl budget কন্ট্রোল।
5. মনিটাইজেশন = স্টুডিও অ্যাফিলিয়েট। এবং এটাই একইসাথে কনটেন্ট সোর্সিং-এর সমাধান।

---

## 1. প্ল্যাটফর্ম শনাক্তকরণ — KVS

প্রমাণ (সব KVS-এর স্বাক্ষর):

```
img.letsporn.com/contents/videos_screenshots/28000/28201/360x203/1.jpg
img.letsporn.com/contents/content_sources/400/s1_Blacked.jpg
img.letsporn.com/contents/models/1411/s1_Aria-Lee.jpg
/player/float.php, /player/html.php, /get_file/, /related_videos_html/
?function=get_block, ?mode=async, ?action=trace&id=
/sitemap/?type=videos&from_links_videos=N
```

**KVS** = পেইড PHP স্ক্রিপ্ট (one-time license), এই ইন্ডাস্ট্রিতে প্রায় সব বড় টিউব এটা চালায়।
আমরা এটা কিনব না — Next.js-এ বানাব — কিন্তু **ওদের ডেটা মডেল আর URL কনভেনশন প্রমাণিত**, তাই সেটা অনুসরণ করা বুদ্ধিমানের কাজ।

### ইমেজ পাথের বুদ্ধিমত্তা
```
videos_screenshots/28000/28201/360x203/1.jpg
                   ^^^^^  ^^^^^  ^^^^^^^ ^
                   bucket  id     size   frame নম্বর
```
- **Bucket** = `floor(id/1000)*1000` → এক ফোল্ডারে ১০০০-এর বেশি ফোল্ডার জমে না (ফাইলসিস্টেম পারফরম্যান্স)
- প্রতি ভিডিওতে **১০+ স্ক্রিনশট**, একাধিক সাইজে (`360x203` গ্রিডে, `240x135` সাইডবারে)
- `preview_720p.mp4` + তার `.jpg` → hover/scrub প্রিভিউ

p4455-ও ১০ ফ্রেম করে, কিন্তু letsporn সেগুলো **রেসপন্সিভ সাইজে** দেয় — মোবাইলে ছোট ফাইল, LCP ভালো।

---

## 2. URL আর্কিটেকচার — p4455-এর চেয়ে ভালো

```
/{slug}-{id}                      ← ★ ভিডিও পেজ
/categories                       হাব
/categories/{slug}                ক্যাটাগরি
/channels                         হাব
/channels/{slug}                  ★ স্টুডিও/সোর্স পেজ
/pornstars                        হাব
/pornstars/{slug}                 পারফর্মার পেজ
/explore  /charts                 ডিসকভারি হাব
/best-of-this-week                টাইম-উইন্ডো পেজ
de.letsporn.com/{একই path}        ★ ভাষা সাবডোমেইন
```

### কেন `/{slug}-{id}` > p4455-এর শুধু `/{slug}/`

| | p4455 (`/title-slug/`) | letsporn (`/title-slug-28201`) |
|---|---|---|
| একই টাইটেল দুইবার | ভাঙে → `-2`, `-3` suffix | সমস্যা নেই, ID আলাদা |
| টাইটেল এডিট করলে | URL বদলায়, রিডাইরেক্ট চেইন | ID ধরে রেখে সহজে হ্যান্ডল |
| DB লুকআপ | slug ইনডেক্সে string ম্যাচ | integer PK — দ্রুততর |
| কীওয়ার্ড ভ্যালু | সর্বোচ্চ | প্রায় একই (ID শেষে, ক্ষতি নেই) |

**সিদ্ধান্ত: vidubuzz-এ `/{slug}-{id}` নেব।** p4455-এর `__trashed-244`, `-2`, `-3` জঞ্জাল এতে হবেই না।

---

## 3. ★ robots.txt — এই রিসার্চের সবচেয়ে দামি জিনিস

p4455: `Disallow:` (ফাঁকা, সব খোলা)
letsporn: **৫০+ নিয়ম**, প্রতিটা উদ্দেশ্যপ্রণোদিত।

```
# ১. Faceted navigation ফাঁদ — সবচেয়ে বড় crawl budget ঘাতক
Disallow: *?sort=popular-month
Disallow: *?sort=popular-week
Disallow: *?sort=popular-today
Disallow: *?sort=best-month          (… best-week, best-today)
Disallow: *category=*                 ← query-param ভার্সন ব্লক, শুধু /categories/x path রাখা
Disallow: *?playlist=*
Disallow: */pornstars?gender=male$    ← ফিল্টার কম্বিনেশন বিস্ফোরণ
Disallow: */pornstars?sort=*&gender=*&country=*

# ২. AJAX/ইন্টারনাল এন্ডপয়েন্ট
Disallow: /*mode=async*$
Disallow: /*function=get_block*$
Disallow: /related_videos_html/*
Disallow: /player/float.php
Disallow: /function/0/*

# ৩. ইনডেক্স করার মতো কিছু নেই
Disallow: */search?q=*
Disallow: /embed/*
Disallow: /download/
Disallow: /get_file/
Disallow: /link/*                     ← অ্যাফিলিয়েট আউটবাউন্ড লিংক
Disallow: /captcha/*

# ৪. অ্যাকাউন্ট পেজ
Disallow: /login  /signup  /logout/  /payments/  /upgrade/
Disallow: /reset-password  /resend-confirmation/  /feedback/

# ৫. অ্যাডমিন
Disallow: /admin/  /npadm/  /agent.php
```

### কেন এটা এত গুরুত্বপূর্ণ

একটা ক্যাটাগরি পেজে যদি ৬টা sort অপশন × ৩টা টাইম উইন্ডো × ২০ পেজ pagination থাকে,
তাহলে **একটা** ক্যাটাগরি থেকে ৩৬০টা প্রায়-অভিন্ন URL তৈরি হয়।
১৫০টা ক্যাটাগরি = **৫৪,০০০ জাঙ্ক URL**, যেগুলো Googlebot-এর সময় খেয়ে ফেলে
আর আসল ভিডিও পেজগুলো crawl হয় না।

letsporn এটা গোড়াতেই বন্ধ করেছে। **vidubuzz-এ দিন ১ থেকেই এই robots.txt থাকবে** —
পরে ঠিক করা অনেক কঠিন, কারণ ততদিনে জাঙ্ক ইনডেক্স হয়ে বসে থাকে।

> ⚠️ `Disallow` একা যথেষ্ট না। ব্লক করা পেজে `<meta robots="noindex,follow">` **দেওয়া যায় না**
> (Google ব্লক করা পেজ পড়তেই পারে না, তাই noindex দেখবে না)।
> সঠিক কৌশল: sort/filter URL-এ `rel=canonical` → পরিষ্কার ভার্সনের দিকে, **এবং** robots-এ Disallow।

---

## 4. ক্যাটাগরি সিস্টেম — গুচ্ছবদ্ধ, বর্ণনা সহ

`/categories` শুধু ট্যাগের তালিকা না। সেকশনে ভাগ করা, প্রতি সেকশনে হেডিং + বর্ণনা:

```
General Categories  — "A little bit of everything"
   Amateur (1.8K) · Blowjob (9.8K) · Doggystyle (7.6K) · Lesbian (3.6K)
   PoV (3.6K) · Deepthroat (3.4K) · Handjob (2.5K) · Outdoor (2.1K) …
Actions             — "Get ready for some intense action"
   69 · …
(আরও সেকশন)
```

প্রতিটা ক্যাটাগরি কার্ডে: থাম্বনেইল + নাম + **ভিডিও সংখ্যা**।
`title` অ্যাট্রিবিউটে সবসময় full keyword — `"Amateur Porn Videos"`, শুধু `"Amateur"` না।

**কপি করার মতো তিনটা জিনিস:**
1. ক্যাটাগরি **গ্রুপিং** — ফ্ল্যাট ১৫০টা ট্যাগের তালিকার চেয়ে ভালো UX + ভালো semantic structure
2. প্রতিটায় **ভিডিও কাউন্ট** — ইউজারকে জানায়, আর আমাদের thin-page গার্ডও দেয়
3. anchor/`title` টেক্সটে **full keyword phrase**, শুধু ট্যাগ নাম না

লক্ষণীয়: `Celebrity` ক্যাটাগরিতে মাত্র **২টা** ভিডিও। মানে ওরা thin পেজও রাখছে —
এটা ওদের দুর্বলতা, আমরা ১০-এর কম হলে `noindex` করব।

---

## 5. ভিডিও পেজের শারীরস্থান

```
┌─ <h1> Strong romance from behind for thirsty Aria Lee
├─ 304K views · 8 months ago · rating 500
├─ [Blacked ▸ logo]  → /channels/blacked
│    └─ "Join Now - 50% Discount" → /link/blacked   ★ অ্যাফিলিয়েট CTA
├─ পারফর্মার কার্ড: Anton Harden (138 videos) · Aria Lee (31 videos)
├─ ক্যাটাগরি চিপ ×৬: Big Ass · Big Cock · Blowjob · Doggystyle · Interracial · Romantic
├─ ★ ইউনিক লিখিত বর্ণনা (২–৩ বাক্যের আসল প্যারাগ্রাফ)
├─ "More by Blacked" — ১০টা একই চ্যানেলের ভিডিও
└─ পারফর্মার-ভিত্তিক আরও সেকশন
```

### p4455-এর তুলনায় তিনটা বড় পার্থক্য

| | p4455 | letsporn |
|---|---|---|
| লিখিত বর্ণনা | **নেই** | প্রতি ভিডিওতে ইউনিক প্যারাগ্রাফ |
| Entity লিংক | ১টা actor চিপ | চ্যানেল + একাধিক পারফর্মার, ছবি ও কাউন্ট সহ |
| Related লজিক | এলোমেলো "More like this" | **চ্যানেল-ভিত্তিক** + পারফর্মার-ভিত্তিক, আলাদা ব্লকে |

ওই **ইউনিক বর্ণনাটাই** letsporn-কে কম URL নিয়েও র‍্যাঙ্ক করতে দেয় —
পেজে আসল টেক্সট থাকায় Google-এর কাছে এটা thin page না।
সস্তায় স্কেল করার উপায়: স্টুডিও ফিডের description ফিল্ড + টেমপ্লেট, অথবা AI দিয়ে
প্রতি ভিডিওতে ২ বাক্য জেনারেট করে ইউনিক রাখা।

প্লেয়ার: `preview_720p.mp4` স্ক্রাব প্রিভিউ, 720p/480p সিলেক্টর, **"Resume watching"**
(localStorage-এ পজিশন) — এগুলো dwell time বাড়ায়, যা র‍্যাঙ্কিং সিগন্যাল।

---

## 6. ★ কনটেন্ট সোর্স — আপনার প্রশ্নের উত্তর এখানেই

`/channels/` পেজে যে নামগুলো: **Blacked, Blacked Raw, JoyMii, Bang POV, 8K Teens,
Club SweetHearts, She Seduced Me, Broken Sluts, Nookies Originals** —
এগুলো র‍্যান্ডম আপলোডার না, **আসল পেইড স্টুডিও**।

ভিডিও পেজে চ্যানেলের পাশে বাটন: **"Join Now - 50% Discount"** → `/link/blacked`

এটাই পুরো ব্যবসায়িক মডেল, এবং এটা **সম্পূর্ণ বৈধ**:

```
১. স্টুডিওর অ্যাফিলিয়েট প্রোগ্রামে সাইন আপ
      (বড় নেটওয়ার্ক: অনেক স্টুডিও এক জায়গায়)
          ↓
২. ওরা নিজেরাই দেয়: ভিডিও ফিড (trailer বা পূর্ণ দৃশ্য), থাম্বনেইল,
   টাইটেল, বর্ণনা, পারফর্মারের নাম — সব মেটাডেটা সহ
          ↓
৩. আপনি হোস্ট/এমবেড করেন — ওদের দেওয়া অনুমতিতেই
          ↓
৪. ইউজার স্টুডিওতে সাবস্ক্রাইব করলে আপনি কমিশন পান
```

**কেন এটা আপনার জন্য সঠিক পথ:**

- কনটেন্ট **ওরা নিজেরাই দিচ্ছে**, প্রচারের জন্য — তাই অনুমতি নিয়ে কোনো প্রশ্নই ওঠে না
- পারফর্মারের **নাম ব্যবহারের অধিকারও** ফিডের সাথেই আসে (স্টুডিও আগেই release নিয়ে রেখেছে)
- মেটাডেটা রেডিমেড → ingestion pipeline সহজ, ম্যানুয়াল কাজ নেই
- স্ক্র্যাপিং লাগে না, DMCA ঝুঁকি নেই, পেমেন্ট প্রসেসরও খুশি
- ইউনিক description ফিডেই থাকে — উপরের ৫ নম্বর পয়েন্টের সমাধান ফ্রি

এটাই সেই "legal vabe use korbo" জিনিসটার বাস্তব রূপ। **আমাদের ingestion pipeline এই
ফিড ফরম্যাট ধরেই ডিজাইন করা উচিত** — CSV/XML/JSON feed importer, scraper নয়।

---

## 7. মাল্টি-ল্যাঙ্গুয়েজ ও নেটওয়ার্ক

**ভাষা:** `de.letsporn.com` সাবডোমেইন। ভিডিও পেজ থেকে সরাসরি একই ভিডিওর জার্মান
ভার্সনে লিংক (`de.letsporn.com/strong-romance-…-28201` — **slug + ID অভিন্ন**)।
পরিষ্কার hreflang pair। একই কনটেন্ট থেকে দ্বিগুণ ট্রাফিক।

> vidubuzz-এ প্রযোজ্য: Bangla + English চাইলে `bn.` সাবডোমেইন বা `/bn/` path।
> **ID অভিন্ন রাখলে** hreflang ম্যাপিং স্বয়ংক্রিয় হয়ে যায়।

**নেটওয়ার্ক:** প্রতি পেজের হেডারে AnyGay, GayPornHD, BoysPornPics-এ লিংক।
একই মালিকের একাধিক সাইট, sitewide ক্রস-লিংক — niche ভাগ করে সবগুলোই র‍্যাঙ্ক করায়।

**বিজ্ঞাপন:** নেভিগেশনে "TikTok AI", "Jerk Off AI", "Live Sex" —
দেখতে নেভ আইটেম, আসলে `?action=trace&id=` দিয়ে ট্র্যাক করা অ্যাড স্লট, ঘুরিয়ে ঘুরিয়ে দেখানো।
robots-এ `/*?action=*$` ব্লক করা, তাই SEO-তে কোনো দূষণ নেই।

---

## 8. ইনডেক্স স্কেল — মান বনাম পরিমাণ

| | ফাইল |
|---|---:|
| `type=videos` | **68** |
| `type=models` | 10 |
| `type=playlists` | 1 |
| categories / sponsors / main | 3 |
| **মোট** | **82** |

সব sitemap-এ `lastmod` আছে (`2026-10-06`) — p4455-এ নেই। Google-কে বলে দেয় কী বদলেছে।

**p4455: ~৫৪০ sitemap, ~১০ লাখ URL — অধিকাংশই thin/duplicate**
**letsporn: ~৮২ sitemap, আনুমানিক ৫০–৮০ হাজার URL — প্রতিটায় আসল কনটেন্ট**

দুটোই কাজ করে, কিন্তু সম্পূর্ণ ভিন্ন উপায়ে:

| | p4455 | letsporn |
|---|---|---|
| কৌশল | পরিমাণ / স্প্যাম | মান / ব্র্যান্ড |
| Crawl নীতি | সব খোলা | শল্যচিকিৎসা |
| পেজে টেক্সট | নেই | ইউনিক বর্ণনা |
| কনটেন্ট | অনুমতিহীন | লাইসেন্সড স্টুডিও |
| আয় | ছদ্মবেশী পপ-আন্ডার অ্যাড | স্টুডিও অ্যাফিলিয়েট |
| ডোমেইন আয়ু | রোটেট করতে হয় | স্থায়ী |
| টেকসই? | ❌ (lalamasa মৃত) | ✅ |

---

## 9. vidubuzz-এর জন্য চূড়ান্ত সিদ্ধান্ত

দুই সাইট থেকে সেরাটা নিয়ে:

| বিষয় | সিদ্ধান্ত | উৎস |
|---|---|---|
| URL | `/{slug}-{id}` | letsporn |
| হাব পেজ | `/browse` → সব taxonomy | p4455-এর help-map ধারণা |
| Taxonomy | categories (গুচ্ছবদ্ধ) + channels + performers + tags | letsporn |
| ইমেজ পাথ | `/{bucket}/{id}/{size}/{n}.jpg` | letsporn |
| প্রিভিউ | ১০ ফ্রেম, ২ সাইজ + স্ক্রাব mp4 | দুটোই |
| robots.txt | শল্যচিকিৎসা — সব sort/filter/async ব্লক | **letsporn ★** |
| Sitemap | সেগমেন্টেড + `lastmod` | letsporn |
| Schema | `VideoObject` JSON-LD | **কারও নেই — আমাদের এজ** |
| স্ট্রিমিং | HLS adaptive | **কারও নেই — আমাদের এজ** |
| পেজ টেক্সট | প্রতি ভিডিওতে ইউনিক বর্ণনা | letsporn |
| Thin-page গার্ড | <১০ ভিডিও হলে `noindex` | **উন্নতি (দুজনেই ব্যর্থ)** |
| ভাষা | `/bn/` + `/en/`, ID অভিন্ন | letsporn |
| কনটেন্ট সোর্স | **স্টুডিও অ্যাফিলিয়েট ফিড** | **letsporn ★** |
| আয় | অ্যাফিলিয়েট কমিশন | letsporn |

### আমাদের তিনটা এজ (দুজনের কারোরই নেই)
1. **`VideoObject` JSON-LD** → SERP-এ thumbnail + duration সহ video rich result
2. **HLS adaptive streaming** → মোবাইলে কম buffering, বেশি dwell time
3. **Core Web Vitals** → Next.js + `next/image` + ISR; দুটো সাইটই পুরনো PHP স্ট্যাক

---

## 10. পরবর্তী ধাপ

- [ ] কোন অ্যাফিলিয়েট নেটওয়ার্ক/স্টুডিও — ফিড ফরম্যাট দেখে importer বানাতে হবে
- [ ] ভাষা সিদ্ধান্ত (Bangla / English / দুটোই)
- [ ] ক্যাটাগরি ভোকাবুলারি ড্রাফট (গুচ্ছবদ্ধ, letsporn মডেলে)
- [ ] Next.js স্ক্যাফোল্ড: `/{slug}-{id}`, `/browse`, robots.txt, sitemap, JSON-LD
- [ ] ডামি ডেটা দিয়ে লাইভ প্রিভিউ
