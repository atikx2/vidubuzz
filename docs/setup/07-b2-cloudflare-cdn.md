# B2 + Cloudflare CDN — সেটআপ গাইড

তারিখ: ২০২৬-১০-০৭ · সিদ্ধান্ত: **ব্যবহারকারীর পছন্দ, এভাবেই এগোচ্ছি**

---

## আগে একটা ভালো খবর — আমার আগের হিসাবটা ভুল ছিল

গত নোটে লিখেছিলাম "B2-র ফ্রি ১ GB/দিন মানে ৪৮০p-তে দিনে ~২২টা ভিউ"। **ওটা
তখনই সত্যি যখন CDN থাকে না।** আপনি যেটা চাইছেন — সামনে Cloudflare — সেখানে
হিসাবটা পুরো আলাদা:

> ১ GB/দিন হলো **origin থেকে টানার** সীমা, **ভিউয়ের** সীমা নয়।

ক্যাশ হেডার ঠিক থাকলে একটা ভিডিও Cloudflare একবার B2 থেকে টানে, তারপর সেই
edge থেকে যত খুশি ভিউ দেয় — B2 আর ছোঁয়াই হয় না। অর্থাৎ:

| | ক্যাশ ছাড়া | ক্যাশসহ |
|---|---|---|
| দিনে ১ GB মানে | ~২২টা **ভিউ** | ~২২টা **cache miss** |
| জনপ্রিয় ভিডিওতে ভিউ | ২২ | কার্যত **সীমাহীন** |

তাই আপনার পছন্দটা কাজের। **কিন্তু পুরোটাই নিচের ধাপ ২-এর উপর নির্ভর করে** —
ওটা বাদ পড়লে Cloudflare কিছুই ক্যাশ করবে না, প্রতিবার B2 থেকে টানবে, আর
ফ্রি কোটা দুপুরের আগেই শেষ।

---

## ০. যা লাগবে

| | |
|---|---|
| Backblaze অ্যাকাউন্ট | ✅ কার্ড ছাড়া হয় |
| Cloudflare অ্যাকাউন্ট | ✅ কার্ড ছাড়া হয় |
| **একটা ডোমেইন, Cloudflare-এ nameserver বসানো** | ⚠️ **এটাই একমাত্র আটকানোর জায়গা** |

Cloudflare শুধু **নিজের zone**-এর ট্রাফিক proxy করতে পারে। তাই `*.pages.dev`
বা B2-র হোস্টনেমের সামনে CDN বসানো যায় না — একটা নিজের ডোমেইন লাগবেই
(`cdn.vidubuzz.com` টাইপ সাবডোমেইন বানানোর জন্য)।

ডোমেইন ~$১০/বছর। Namecheap/Porkbun PayPal নেয়, বাংলাদেশি রিসেলাররা অনেকে
bKash নেয় — Cloudflare Registrar-এ কার্ড লাগে, তাই ওটা বাদ।

**ডোমেইন না থাকা পর্যন্ত:** `.env`-এ সরাসরি B2 URL বসিয়ে কাজ চালান
(`https://f003.backblazeb2.com/file/vidubuzz-media`)। সব চলবে, শুধু CDN
থাকবে না। ডোমেইন এলে env দুটো লাইন বদলালেই CDN চালু — কোড বদলাতে হবে না।

---

## ১. Backblaze দিকে

1. `backblaze.com` → সাইনআপ (ইমেইল, কার্ড নয়) → **B2 Cloud Storage**
2. দুটো বাকেট, দুটোই **Public**:
   - `vidubuzz-media` — thumbnail, storyboard frame, avatar
   - `vidubuzz-video` — `.mp4` রেন্ডিশন
3. **Caps & Alerts** → চারটে ক্যাপই `$0` → কখনো বিল আসবে না
4. বাকেটের **friendly URL** টুকে রাখুন। দেখতে এমন:
   `https://f003.backblazeb2.com/file/vidubuzz-media/...`
   এখানে `f003` অংশটা অ্যাকাউন্টভেদে আলাদা (`f000`–`f005`) — আপনারটা কপি করুন।

### ২. ⚠️ cache-control হেডার — সবচেয়ে জরুরি ধাপ

প্রতিটা বাকেটে → **Bucket Settings** → **Bucket Info** → এটা বসান:

```json
{"cache-control":"public, max-age=31536000, immutable"}
```

এটা না দিলে Cloudflare ক্যাশই করবে না, প্রতিবার B2 থেকে টানবে — উপরের
পুরো সুবিধাটা নষ্ট।

এক বছরের TTL দেওয়া নিরাপদ কারণ **আমাদের key গুলো অপরিবর্তনীয়**:
`videos/0/12/12_480p.mp4` ফাইলটা কখনো বদলায় না। ভিডিও আপডেট করতে হলে নতুন
id বা নতুন key দেব, পুরোনোটা overwrite করব না।

---

## ৩. Cloudflare দিকে

### ৩.১ DNS

**DNS** → **Add record**:

| | |
|---|---|
| Type | `CNAME` |
| Name | `cdn` |
| Target | `f003.backblazeb2.com` *(আপনার নম্বর)* |
| Proxy status | **Proxied (কমলা মেঘ)** ← এটা অন থাকতেই হবে |

ভিডিওর জন্য আলাদা আরেকটা (`video`) একই ভাবে।

### ৩.২ Transform Rule — URL থেকে `/file/bucket/` লুকানো

এটা ছাড়া URL হবে `cdn.vidubuzz.com/file/vidubuzz-media/...` — কুৎসিত আর
বাকেটের নাম ফাঁস হয়।

**Rules** → **Transform Rules** → **Rewrite URL** → **Create**:

- Name: `B2 media rewrite`
- When incoming requests match →
  ```
  (http.host eq "cdn.vidubuzz.com")
  ```
- Path → **Rewrite to** → **Dynamic**:
  ```
  concat("/file/vidubuzz-media", http.request.uri.path)
  ```

ভিডিওর জন্য একই জিনিস `video.vidubuzz.com` আর `vidubuzz-video` দিয়ে।

> বানানোর পর রুলটা **নিজে থেকে চালু হয় না** — টগল অন করতে ভুলবেন না।

ফল: `cdn.vidubuzz.com/contents/videos_screenshots/0/12/360x203/1.jpg`
→ পেছনে `f003.backblazeb2.com/file/vidubuzz-media/contents/...`

### ৩.৩ Cache Rule

**Caching** → **Cache Rules** → **Create**:

- When → `(http.host in {"cdn.vidubuzz.com" "video.vidubuzz.com"})`
- Then → **Eligible for cache**
- **Edge TTL** → *Use cache-control header if present* (ধাপ ২-এর হেডারটা কাজে লাগবে)
- **Browser TTL** → *Respect origin*

### ৩.৪ অন্য বাকেট আটকানো (ঐচ্ছিক কিন্তু ভালো)

Transform rule শুধু আপনার দুটো বাকেটেই ম্যাপ করে, তাই অন্য বাকেট এমনিতেই
পৌঁছানো যায় না। বাড়তি সুরক্ষা চাইলে একটা Redirect Rule দিয়ে `/file/*`-কে
৪০৪-এ পাঠিয়ে দিন।

---

## ৪. অ্যাপে বসানো

`.env` (`.env.example` কপি করে):

```bash
NEXT_PUBLIC_IMAGE_BASE=https://cdn.vidubuzz.com
NEXT_PUBLIC_VIDEO_BASE=https://video.vidubuzz.com
```

ডোমেইন না থাকলে ততক্ষণ:

```bash
NEXT_PUBLIC_IMAGE_BASE=https://f003.backblazeb2.com/file/vidubuzz-media
NEXT_PUBLIC_VIDEO_BASE=https://f003.backblazeb2.com/file/vidubuzz-video
```

`src/lib/storage.ts` দুটোই সামলায় — key layout এক, তাই পরে শুধু URL বদলালেই হবে।

---

## ৫. কাজ করছে কিনা যাচাই

ফাইল একটা আপলোড করে ব্রাউজারে খুলুন, দুবার রিফ্রেশ করুন। তারপর:

```bash
curl -sI https://cdn.vidubuzz.com/contents/videos_screenshots/0/12/360x203/1.jpg \
  | grep -i "cf-cache-status\|cache-control\|content-type"
```

দেখতে চাই:

```
cf-cache-status: HIT                 ← ক্যাশ কাজ করছে
cache-control: public, max-age=31536000, immutable
content-type: image/jpeg
```

`cf-cache-status: MISS` বারবার এলে → ধাপ ২-এর Bucket Info হেডারটা বসেনি,
অথবা Cache Rule চালু হয়নি।

---

## ৬. যে সীমাগুলো মাথায় রাখবেন

| | |
|---|---|
| **প্রতি ফাইল সর্বোচ্চ ৫১২ MB** ক্যাশ হয় (Free/Pro/Business একই) | ৪৮০p/৭২০p-তে সমস্যা নেই; বড় ফাইল ক্যাশ হবে না, সরাসরি B2 থেকে যাবে → কোটা পুড়বে |
| **কম জনপ্রিয় ফাইল ক্যাশ থেকে মুছে যায়** | TTL যাই হোক। তাই লম্বা লেজের পুরোনো ভিডিও বারবার origin-এ যাবে |
| **প্রতিটা Cloudflare PoP আলাদা ক্যাশ** | ঢাকা, সিঙ্গাপুর, ফ্রাঙ্কফুর্ট — আলাদা আলাদা করে টানবে |
| **ToS** | ভিডিও CDN দিয়ে সার্ভ করতে পেইড সার্ভিস লাগে। ছোট ট্রাফিকে কিছু হয় না; বড় হলে ঝুঁকি আছে |

### ঝামেলা হলে এক লাইনে পিছু হটা

Cloudflare থেকে সতর্কবার্তা এলে, বা ভিডিও হঠাৎ
`cloudflare-terms-of-service-abuse.com`-এ রিডাইরেক্ট হতে থাকলে:

1. DNS-এ `video` রেকর্ডের কমলা মেঘ **ধূসর** করে দিন (DNS only)
2. `.env`-এ `NEXT_PUBLIC_VIDEO_BASE` সরাসরি B2 URL-এ ফেরত দিন

ছবি Cloudflare-এর পেছনেই থাকবে (ওটা নিয়ে কোনো সমস্যা নেই), শুধু ভিডিও
সরাসরি B2 থেকে যাবে। সাইট চলতেই থাকবে। এই জন্যই কোডে image আর video-র
base আলাদা রাখা হয়েছে।

---

## ৭. চেকলিস্ট

- [ ] Backblaze সাইনআপ
- [ ] `vidubuzz-media` + `vidubuzz-video` — দুটোই Public
- [ ] Caps & Alerts → চারটে `$0`
- [ ] **দুটো বাকেটেই Bucket Info-তে cache-control** ← বাদ দিলে সব বৃথা
- [ ] ডোমেইন কিনে Cloudflare-এ nameserver
- [ ] `cdn` + `video` CNAME, দুটোই Proxied
- [ ] দুটো Transform Rule, দুটোই **enabled**
- [ ] Cache Rule
- [ ] `.env` ভরা
- [ ] `cf-cache-status: HIT` দেখা গেছে
