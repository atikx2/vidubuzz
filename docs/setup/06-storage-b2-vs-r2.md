# স্টোরেজ: Backblaze B2 না Cloudflare R2 — কার্ড ছাড়া কী করা যায়

তারিখ: ২০২৬-১০-০৭ · অবস্থা: **B2 দিয়ে শুরু, কোড দুটোতেই চলবে**

---

## এক লাইনে

**B2 ঠিক আছে — কার্ড লাগে না।** কিন্তু "B2 + Cloudflare CDN দিয়ে ভিডিও সার্ভ"
অংশটা Cloudflare-এর শর্ত ভাঙে, আর ওরা ধরলে ভিডিও বন্ধ করে দেয়। তাই **ছবি
Cloudflare-এর ভেতর দিয়ে, ভিডিও Cloudflare-কে পাশ কাটিয়ে** — এই ভাগটাই আসল সমাধান।

---

## ১. কার্ড লাগে কি লাগে না

| | কার্ড ছাড়া অ্যাকাউন্ট? | ফ্রি কী পাওয়া যায় |
|---|---|---|
| **Backblaze B2** | ✅ **হ্যাঁ** | ১০ GB স্টোরেজ, **দিনে ১ GB ডাউনলোড**, ২৫০০ Class B + ২৫০০ Class C ট্রানজ্যাকশন/দিন |
| **Cloudflare R2** | ❌ না | ১০ GB, ১M Class A, ১০M Class B — কিন্তু চালু করতেই পেমেন্ট মেথড লাগে |
| Cloudflare Workers/Pages/D1 | ✅ হ্যাঁ | কার্ড ছাড়াই চলে |

Backblaze নিজেই লিখেছে: *"10GB for free... and you don't need to give us a
credit card to create an account."* — তাই আপনার সমস্যার এই অংশটা B2 সত্যিই মেটায়।

### Cloudflare-এ পেমেন্ট নিয়ে দুটো কথা (সময় বাঁচবে)

- Cloudflare PayPal, Google Pay, Apple Pay নেয়। **কিন্তু** recurring
  সাবস্ক্রিপশনের টাকা PayPal-এর পেছনে থাকা কার্ড থেকেই কাটে — PayPal ব্যালেন্স
  থেকে না। অর্থাৎ PayPal দিয়েও শেষমেশ একটা কার্ড লাগে।
- Cloudflare-এর বিলিং ডকে পরিষ্কার লেখা: **"Gift cards and pre-payment cards
  may not be accepted"** — তাই প্রিপেইড/ভার্চুয়াল কার্ড কিনে R2 চালু করার
  চেষ্টায় সময় নষ্ট না করাই ভালো, কাজ না-ও করতে পারে।

---

## ২. ⚠️ যে ফাঁদটা আপনার প্ল্যানে আছে

আপনি বলেছেন "B2 + Cloudflare CDN"। এই জোড়াটা জনপ্রিয়, কারণ Bandwidth Alliance-এর
কল্যাণে B2 → Cloudflare egress **ফ্রি**। কিন্তু:

> Cloudflare-এর বর্তমান Self-Serve চুক্তি:
> *"Cloudflare offers specific Paid Services (e.g., the Developer Platform,
> Images, and Stream) that you must use in order to serve video and other
> large files via the CDN."*

ব্যাখ্যা যেটা দাঁড়ায়:

- কনটেন্ট **Cloudflare-এর নিজের সার্ভিসে** থাকলে (R2, Stream) → ঠিক আছে
- কনটেন্ট **বাইরে** থাকলে আর Cloudflare CDN দিয়ে গেলে (= B2 + orange cloud) → **নিষিদ্ধ**

আর এটা কাগুজে নিয়ম নয়, ওরা প্রয়োগ করে। ভুক্তভোগীদের রিপোর্ট: সাইট
ডিঅ্যাক্টিভেট, আর সব `.mp4` রিকোয়েস্ট জোর করে
`cloudflare-terms-of-service-abuse.com/streaming.mp4`-এ রিডাইরেক্ট।

Backblaze-ও নিজের ব্লগে ভদ্রভাবে সতর্ক করে রেখেছে:
*"make sure you understand if there are limits on your media downloads from
those vendors by checking the terms of service for your CDN account. Some
service levels do restrict downloads of media content."*

**আর তিক্ত অংশটা:** Bandwidth Alliance-এর ফ্রি egress পেতে হলে ট্রাফিক
Cloudflare দিয়েই যেতে হবে — যেটা ভিডিওর বেলায় ঠিক নিষিদ্ধ কাজটা। অর্থাৎ ফ্রি
প্ল্যানে "B2 + Cloudflare = ফ্রি ভিডিও ব্যান্ডউইথ" সুবিধাটা **ব্যবহারযোগ্য নয়**।

---

## ৩. যে সাজানোটা আসলে কাজ করে (ফ্রি, কার্ড ছাড়া, নিয়মের ভেতরে)

দুটো আলাদা হোস্টনেম — এটাই পুরো কৌশল।

```
ব্রাউজার
   │
   ├── HTML / CSS / JS / thumbnail ──► Cloudflare Pages   (proxied, ফ্রি) ✅
   │                                    ছোট ফাইল, স্বাভাবিক ওয়েব ট্রাফিক
   │
   └── .mp4 ভিডিও ────────────────────► Backblaze B2 সরাসরি              ✅
                                        Cloudflare ছুঁবেই না → শর্ত ভাঙে না
```

ভিডিও URL হবে B2-র নিজের হোস্টনেম, যেমন
`https://f003.backblazeb2.com/file/vidubuzz-video/videos/0/12/12_480p.mp4`
— অথবা পরে ডোমেইন কিনলে একটা **grey-cloud (DNS only)** সাবডোমেইন।

### সত্যি কথাটা: ফ্রি সীমা খুবই ছোট

B2-র ফ্রি ডাউনলোড **দিনে ১ GB**। এর মানে:

| রেন্ডিশন | ১০ মিনিটের ফাইল | দিনে কত ভিউ |
|---|---|---|
| ৪৮০p (~৬০০ kbps) | ~৪৫ MB | **~২২** |
| ৭২০p (~১.৫ Mbps) | ~১১০ MB | **~৯** |
| ১০৮০p (~৩ Mbps) | ~২২৫ MB | **~৪** |

**এটা লঞ্চ আর টেস্ট করার বাজেট, ট্রাফিক চালানোর বাজেট নয়।** আসল ভিজিটর এলে
পেমেন্ট মেথড লাগবেই — ভিডিও সার্ভ করা সত্যিই খরচের কাজ, কোনো ফ্রি টিয়ারেই
এটা ফ্রি হয় না।

তাই যতদিন ফ্রি, ততদিন:

- শুধু **৪৮০p** রাখুন, একটাই রেন্ডিশন
- ছোট ক্লিপ (২–৫ মিনিট) দিয়ে শুরু করুন
- B2 ড্যাশবোর্ডে **Caps & Alerts**-এ ক্যাপ বসিয়ে দিন, যাতে কখনো বিল না আসে

---

## ৪. কোডে কী করা হয়েছে

`src/lib/storage.ts` — প্রোভাইডার-নিরপেক্ষ। B2 আর R2 দুটোই S3-সামঞ্জস্যপূর্ণ আর
সাধারণ HTTPS GET-এ ফাইল দেয়, তাই অ্যাপের জানার দরকারই নেই পেছনে কে আছে।

দুটো আলাদা বেস URL, যাতে উপরের ভাগটা কোডেই পাকা থাকে:

```ts
NEXT_PUBLIC_IMAGE_BASE   // ছবি — Cloudflare-এর পেছনে রাখা যাবে
NEXT_PUBLIC_VIDEO_BASE   // ভিডিও — Cloudflare proxy করবে না
```

key বানানোর ফাংশন (letsporn-এর bucket প্যাটার্ন, ১০০০ id প্রতি ফোল্ডার):

```
contents/videos_screenshots/{bucket}/{id}/360x203/1.jpg   গ্রিড থাম্ব
contents/videos_screenshots/{bucket}/{id}/360x203/1..10   hover storyboard
videos/{bucket}/{id}/{id}_480p.mp4                        রেন্ডিশন
previews/{bucket}/{id}/preview.mp4                        hover লুপ
models/{bucket}/{id}/avatar.jpg
```

দুটো env খালি থাকলে `imageUrl()` / `videoUrl()` **null** ফেরত দেয় আর সাইট
আগের মতোই CSS-gradient placeholder দেখায় — অর্থাৎ স্টোরেজ ছাড়াই সব চলে।

**পরে R2-তে যেতে চাইলে:** কার্ড জোগাড় হলে দুটো env ভেরিয়েবল বদলে R2-র URL
বসিয়ে দিলেই হবে। key layout একই, তাই ফাইল শুধু কপি করে নিলে চলবে —
কোডের একটা লাইনও বদলাবে না।

---

## ৫. R2 বনাম B2 — টাকা এলে কোনটা

| | B2 | R2 |
|---|---|---|
| স্টোরেজ | $0.006/GB-মাস | $0.015/GB-মাস |
| Egress (সরাসরি) | $0.01/GB | **$0 সবসময়** |
| Egress (Cloudflare হয়ে) | $0, **কিন্তু ভিডিওর বেলায় পেইড প্ল্যান লাগবে** | $0 |
| অপারেশন | Class A/B/C ফ্রি (pay-as-you-go) | Class A $4.50/M, Class B $0.36/M |
| কার্ড | লাগে না | লাগে |

- **স্টোরেজে B2 আড়াই গুণ সস্তা।**
- **ব্যান্ডউইথে R2 জেতে** — egress চিরকাল $0, আর Workers Paid ($5) থাকলে
  Cloudflare দিয়ে ভিডিও সার্ভ করা বৈধ।
- টিউব সাইটে ব্যান্ডউইথই প্রধান খরচ, স্টোরেজ নয়। তাই **$5 দেওয়ার সামর্থ্য
  হলে R2 + Workers Paid-ই শেষ গন্তব্য।** B2 হলো সেই পর্যন্ত পৌঁছানোর সেতু।

---

## ৬. এখন করণীয়

- [ ] `backblaze.com/b2/sign-up.html` — ইমেইল দিয়ে সাইনআপ (কার্ড লাগবে না)
- [ ] দুটো পাবলিক বাকেট: `vidubuzz-media` (ছবি), `vidubuzz-video` (ভিডিও)
- [ ] **Caps & Alerts**-এ চারটে ক্যাপই `$0` বসান — তাহলে কখনো বিল আসবে না
- [ ] বাকেটের ফ্রেন্ডলি URL কপি করে `.env`-এ `NEXT_PUBLIC_IMAGE_BASE` /
      `NEXT_PUBLIC_VIDEO_BASE`-এ বসান (`.env.example` দেখুন)
- [ ] ভিডিও ডোমেইন যেন **কখনো** Cloudflare-এ orange cloud না হয়
