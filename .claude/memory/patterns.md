# Patterns đã chốt — không tranh luận lại

> Quy ước kỹ thuật đã thống nhất. Không review lại trừ khi có lý do mới.

---

## Backend (bot, api, core, astrology, ai, pdf)

**Module resolution:**
NodeNext. Imports của `.ts` files PHẢI có extension `.js` (ví dụ `export * from './types.js'`). Không "sửa" thành `.ts`.

---

## Data modeling — Shared AI cache pattern (CHỐT)

Mọi feature có AI sinh output **deterministic theo input params** (cùng input → output gần như nhau) BẮT BUỘC dùng pattern 2 bảng:

| Bảng | PK | Vai trò | Scope share |
|---|---|---|---|
| `<feature>_charts` (submission) | `id` (uuid) | Per-user history row. Lưu input fields + `birthHash`. **KHÔNG chứa AI output.** | Per-user (FK `userId`) |
| `<feature>_analyses` (cache) | `birth_hash` | AI output (markdown text hoặc JSONB structured). | **Cross-user** — N user cùng combo → 1 row |

**Hash:** `sha256(input1|input2|...).slice(0,16)` (16 hex = 64 bits, collision-safe đến hàng tỷ user). Tên column convention: `birth_hash varchar(32)`.

**Indexes bắt buộc trên `<feature>_charts`:**
- `(user_id, created_at)` — composite cho `/lich-su` query `WHERE user_id=X ORDER BY created_at DESC`.
- `(birth_hash)` — single, cho JOIN tới analyses.
- `(user_id, birth_hash)` UNIQUE — idempotent insert + dedup (1 user submit cùng combo 2 lần → 1 row).

**Indexes trên `<feature>_analyses`:** không cần thêm — PK `birth_hash` đủ.

**Server flow (`getXxx(userId, input)`):**
```ts
const birthHash = computeBirthHash(input);

const [reading, chartId] = await Promise.all([
  resolveReading(input, birthHash),   // analyses cache → Deepseek + INSERT ON CONFLICT
  ensureUserChart(userId, input, birthHash), // chart row INSERT ON CONFLICT
]);

return { id: chartId, reading };
```

`resolveReading` dùng **inflight Map theo birthHash** (KHÔNG userId) → 2 user khác nhau cùng miss đồng thời chỉ gọi Deepseek 1 lần.

**Race-safety:** `INSERT ... ON CONFLICT DO NOTHING` + `SELECT` lại để lấy row id chuẩn (nếu race với instance khác).

**Hiện đang áp dụng:**
- Tu-Vi: `charts` + `analyses` + `deep_readings` (compound PK `(birthHash, year)`).
- Tu-Tru: `bat_tu_charts` + `bat_tu_analyses` (markdown TEXT).
- Hoang-Dao: `hoang_dao_charts` + `hoang_dao_analyses` (PersonalizedReading JSONB).

**Khi KHÔNG dùng pattern này:**
- AI output phụ thuộc vào dữ liệu user-specific KHÔNG nằm trong hash (vd: real-time user state) → khó share, để per-user.
- AI output cố tình varied per call (creative writing). → bỏ cache.
- Daily/temporal global cache (như `daily_horoscope`): PK theo time-bucket (date `YYYY-MM-DD`) thay vì hash — 1 row chia sẻ toàn bộ user trong cùng bucket.

**Anti-pattern đã vấp (2026-05-13, fix bằng migration 0005):**
Ban đầu `hoang_dao_charts` lưu `reading` JSONB inline + dedup theo `(userId, signEn, gender, status, goal)`. Mỗi user mới với cùng combo → gọi Deepseek lại từ đầu. Fix: split thành `hoang_dao_charts` (chỉ submission record) + `hoang_dao_analyses` (shared cache) qua `birth_hash`. Lý do nhớ: AI output deterministic theo input, không phụ thuộc user → không có lý do để per-user.

---

## Migration & schema conventions

**Tạo migration:**
```bash
cd packages/db && pnpm exec drizzle-kit generate
```
Drizzle-kit sẽ hỏi interactive khi rename column → trả lời cẩn thận. Nếu cần data-preserving migration phức tạp (vd: backfill column từ logic SHA256), tự viết SQL trong `migrations/XXXX_name.sql` + thêm entry vào `_journal.json` + copy `0XXX_snapshot.json` từ revision trước rồi patch.

**Apply migration:**
```bash
cd packages/db && pnpm migrate
```
`src/migrate.ts` chạy `drizzle-orm/postgres-js/migrator` rồi seed `prices` + `subscription_plans` (idempotent qua `ON CONFLICT DO NOTHING`).

**pgcrypto sẵn sàng:** Migration runner đã `CREATE EXTENSION IF NOT EXISTS pgcrypto` → dùng được `gen_random_uuid()` cho PK default + `digest('input', 'sha256')` cho backfill hash trong SQL.

**Tên column convention:**
- Time: `created_at`, `updated_at`, `completed_at`, `expires` (Auth.js) — `timestamp { mode: 'date' }`.
- FK: `<entity>_id` text, `.references(...)` với `onDelete: 'cascade'` cho child records của user/auth.
- Hash: `birth_hash varchar(32)` (lưu 16 hex char + buffer).
- JSON: dùng `jsonb` cho structured, `text` cho markdown thuần.

**Index naming:** `<table>_<purpose>_idx` cho non-unique, `<table>_<purpose>_uniq` cho unique. Vd: `charts_user_created_idx`, `hoang_dao_charts_user_hash_uniq`.

---

**Env loading:**
Root `.env` cho bot + api (qua `tsx --env-file=../../.env`). Next.js đọc `apps/web/.env.local` riêng — update cả 2 nơi cho `NEXT_PUBLIC_*`.

**Package exports:**
Mọi `@tuvi/*` workspace expose source trực tiếp: `"main": "./src/index.ts"`. Không consume `dist/`.

**AI client:**
`openai` SDK chỉ dùng như HTTP client, `baseURL` override về Deepseek. Không bao giờ gọi `api.openai.com`.

**Mọi call Deepseek BẮT BUỘC wrap qua `aiCall(fn, label)`:**
`aiCall` từ `@tuvi/ai` = `pLimit(64)` semaphore (default, override qua `AI_CONCURRENCY`) + `withRetry` exponential backoff cho 429/5xx/network + timing log `[ai:label] Xms`. KHÔNG dùng `client.chat.completions.create` trực tiếp — bypass semaphore + không có retry → có thể flood Deepseek + fail vì transient error.

```ts
return aiCall(async () => {
  const completion = await client.chat.completions.create({ ... });
  // ... validate
  if (finishReason === 'length') {
    const err = new Error('...') as Error & { status: number };
    err.status = 500;  // mark retryable
    throw err;
  }
  return result;
}, 'feature:label');
```

**Mark retryable errors với `status = 500`:** `finish_reason === 'length'`, schema parse fail, JSON syntax error — tất cả mark retryable vì `temperature > 0` có thể fix lần sau. KHÔNG mark retryable: auth error (401), bad request (400) — fail-fast.

**Default `AI_CONCURRENCY = 64`** — cho Deepseek paid tier (không hard cap concurrent, chỉ RPM ~5000). Free tier nên `AI_CONCURRENCY=16` để tránh 429.

**Seed deterministic cho mọi call Deepseek (BẮT BUỘC):**

Mọi `client.chat.completions.create` PHẢI có `seed` derive từ cache key (`birthHash`, `dateStr`, v.v.). Lý do: cache share-cross-user chỉ "chính danh" khi regenerate ra cùng output. Không seed = cache là "đông cứng random". Có seed = cache memoize cho deterministic computation.

Helper:
```ts
import { seedFromHash } from '@tuvi/ai';
const seed = seedFromHash(birthHash); // parseInt 7 hex đầu → int
```

Khi chia parallel multi-call cho cùng input (vd `analyzeChart` 6 sections, `analyzeDeepReadings` 4 nhánh, `analyzeNamHienTai` main+months) → mỗi nhánh dùng `seed + offset` để output không "đồng pha" wording.

Khi cache key có thêm dimension (vd `deepReadings` PK = `(birthHash, year)`) → seed phải bao gồm dimension đó (`seed = seedFromHash(birthHash) + year`).

Daily horoscope không có birthHash → seed = `sha256(dateStr|groupTag).slice(0,7)` qua `seedForDailyGroup()`.

**Lưu ý độ tin cậy:** Deepseek doc ghi `seed` là "best-effort", ~95-98% reproducible trong 1 model version. Model upgrade có thể đổi output (track qua `system_fingerprint`). Đủ cho use case content generation, KHÔNG dùng cho computation đòi hỏi 100% deterministic.

---

## Frontend (web)

**Next.js version:** 14 App Router + SSR, TailwindCSS.

**transpilePackages:** Bắt buộc list mọi `@tuvi/*` package mà web import (hiện chỉ có `@tuvi/core`). Thêm package mới vào graph → thêm vào `next.config.js`.

**Font:** Toàn bộ web dùng **SF Pro Display** (load qua `@import 'https://fonts.cdnfonts.com/css/sf-pro-display'` trong `globals.css`). Tailwind config map cả `sans` lẫn `serif` → SF Pro Display, nên các heading đang dùng `font-serif` vẫn render SF Pro (phân biệt bằng `font-weight`/`text-size` thôi, không phải bằng family). Fallback stack: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Segoe UI", system-ui, sans-serif` — máy Apple dùng SF native, Windows/Android dùng CDN woff2.

**PDF fonts KHÔNG đổi:** `@tuvi/pdf` vẫn dùng Noto Sans TTF (Regular/Bold/Italic) vì PDFKit cần TTF + Noto Sans render tốt dấu tiếng Việt trong file output. Đừng thay SF Pro vào PDF.

**Toast notification:**
Hệ thống toast custom ở `apps/web/src/components/ui/toast.tsx` (singleton emitter, không phụ thuộc package nào). Import `{ toast }` từ đó, gọi `toast.success(msg)` / `toast.error(msg)` / `toast.info(msg)`. `<Toaster />` mount sẵn trong root layout.

**Khi nào fire toast:**
- **Submit form** (POST `/api/*/submit`, topup-request, admin actions, v.v.): success → `toast.success('Đã ...')`, error → `toast.error('Thất bại: ...')`. Mục đích cho user feedback ngay khi action hoàn tất, không phải đợi hết flow.
- **Async background fetch** (AI analyze, deep readings, dữ liệu phụ load sau): success → `toast.success('... xong')`, error → `toast.error('Lỗi ...')`. Đặc biệt quan trọng với AI vì user không biết khi nào xong.
- **KHÔNG dùng `toast.info`** cho việc thông thường — nó dễ thành noise. Chỉ dùng khi có thông báo trung tính cần user biết (vd: "Bạn vừa logout do hết session").

**Toast message rule:**
Báo **kết quả thực sự**, không expose internal state. Không phân biệt cache hit / cache miss trong message — đối với user, cả 2 đều là "luận giải xong". Ví dụ: dùng `'Luận giải Tử Vi xong'` thay vì `cached ? 'Đã có sẵn...' : 'Luận giải xong'`. Backend trả `cached: true/false` cứ trả (debug + analytics), nhưng FE đừng leak ra UI text. Nguyên tắc: user không cần biết tech detail của hệ thống cache.

---

## Brand palette — Dark + Gold Mystic (2026-05-28 pivot)

**TUYỆT ĐỐI KHÔNG dùng tím / indigo / violet / fuchsia / plum** trên toàn site. Cũng KHÔNG dùng light gray / pure white làm background chính (chỉ allow trong parchment scoped sections). Pivot từ cream/đồng cổ warm-light → cosmic dark + gold metallic (2026-05-28, 45+ files migrated, phases 01-08).

**Cosmic dark + gold palette (source: `apps/web/src/styles/tokens.ts`):**

| Token                    | Hex       | Vai trò                                          |
| ------------------------ | --------- | ------------------------------------------------ |
| Cosmic (body bg)         | `#05060a` | page background, darkest anchor                 |
| Ink (panel bg)           | `#0b0d14` | panel / card surface, slightly raised            |
| Raised (card bg)         | `#14121a` | card raised background, elevated element         |
| Veil (hover/active)      | `#1c1a24` | hover state, active raised, interactive feedback |
| Cream (text on dark)     | `#f4ecd6` | body text on dark bg, primary readability        |
| Mute (subtitle/hint)     | `#b8a47c` | subtitle, hint text, secondary readability       |
| Faint (disabled)         | `#7a6d4f` | disabled text, lowest contrast                   |
| Gold (border/accent)     | `#c89146` | default border, accent highlight, interactive   |
| Gold Light (gradient)    | `#e9d4b6` | light accent, cream gradient stop, text light    |
| Gold Shine (bright)      | `#f4d57a` | bright highlight, sparkle, glow                 |
| Gold Metal (classic)     | `#d4af37` | classic gold metallic, premium accent            |
| Gold Deep (dark accent)  | `#8a5a1f` | dark gold, warm accent, gradient deep stop       |
| Mountain (Eastern)       | `#4a6c7a` | Eastern accent, cool tone, secondary link        |
| Vermilion (warning)      | `#c8361d` | warning, danger badge, hắc đạo accent           |
| Jade (success)           | `#6b9080` | success, lành accent, positive feedback          |
| Parchment (scroll only)  | `#e9d4b6` | scoped scroll frame bg only, NOT page bg         |
| Parchment Deep (scroll)  | `#c9a96e` | scoped parchment border, NOT page element        |
| Parchment Text (scroll)  | `#3a2410` | scoped parchment text only, NOT page text        |

**Tailwind alias (xem `tailwind.config.ts`):**
- `brand-cosmic` → `#05060a` (page bg)
- `brand-gold` → `#c89146` (default accent/border)
- `brand-cream` → `#f4ecd6` (text on dark)
- `brand-mountain` → `#4a6c7a` (Eastern accent)
- `brand-vermilion` → `#c8361d` (warning/danger)
- Legacy alias `brand-purple` removed (đã pivot từ `#5a3a1a`).

**Design primitives (bắt buộc dùng):**
- `GoldButton` — button với gold border + cream text + cosmic bg, hover → gold bg + cosmic text
- `MysticCard` — card cosmic bg + veil border + raised element inside
- `ScrollFrame` — parchment scoped bg (KHÔNG page), cream gradient stop
- `GoldText` — heading text với gold accent inline (tên, icon)
- `CosmicBg` — page/section background cosmic-gradient hoặc cosmic-solid
- `ZodiacIcon` — 12 sao hoàng đạo icon gold metallic + cosmic shadow

Mọi component dùng **hex trực tiếp** từ bảng trên (`bg-[#05060a]`, `text-[#f4ecd6]`, `border-[#c89146]`...) chứ không bịa màu mới hay dùng tailwind palette mặc định.

---

## Design rhythm giữa các section (dark cosmic + gold focus)

**2 section liền kề: kết nối tonal, khác biệt về medium.** Không lặp ảnh (mất rhythm, pha loãng concept), nhưng cũng KHÔNG bắt buộc tương phản tone — dễ gây cảm giác "2 trang khác nhau dán vào nhau, không liên quan".

**Rule đúng khi render section mới / swap bg:**
1. **Different medium** — section trước dùng ảnh? → section này dùng gradient/solid. Trước dùng gradient? → section này có thể dùng ảnh hoặc gradient khác rõ rệt (parchment scroll solid, cosmic dark, gold shimmer).
2. **Connected tonal palette** — chọn 2-3 màu từ Brand palette dark+gold, tạo gradient cosmic (`#05060a → #0b0d14 → #14121a`) hoặc gold tonal (`#8a5a1f → #c89146 → #f4d57a`). Bg section sau phải nằm trong cùng family với section trước (cùng cosmic dark, hoặc cùng gold shimmer).
3. **UI complementary với bg**:
   - Bg cosmic dark (`#05060a`/`#0b0d14`/`#14121a`) → UI gold (`#c89146`/`#f4d57a`) + cream text (`#f4ecd6`) + mountain accent (`#4a6c7a`).
   - Bg parchment scroll ONLY (`#e9d4b6`) → UI parchment-text (`#3a2410`) heading + gold border (`#c89146`) + mountain link (`#4a6c7a`).
   - NO light gray / pure white page bg — cosmic dark là default page, parchment là scoped only.
4. **Section identity qua role (East tone / West tone watermark)**:
   - Hero = ấn tượng → cosmic dark gradient hoặc ảnh artistic overlay cosmic, UI gold + cream + East mountain watermark.
   - Tool/divination = không gian suy ngẫm → cosmic solid hoặc gold shimmer gradient, UI gold accent + cream text, West vermilion watermark subtle.
   - CTA cuối = quyết liệt → cosmic-to-gold gradient hoặc solid gold-deep, UI cream + cosmic contrast.
   - Parchment scroll frame = reflection/history → parchment solid scoped, UI parchment-text + gold border, East watermark.

**Gradient cosmic chuẩn (dùng thay cho warm cream cũ):**
```
from-[#05060a] via-[#0b0d14] to-[#14121a]
```
Glow phụ: `bg-[#c89146]/20` (gold) + `bg-[#4a6c7a]/15` (mountain) blur. Sparkle radial: `#f4d57a` + `#c89146`.

**Gradient gold shimmer (section accent):**
```
from-[#8a5a1f] via-[#c89146] to-[#f4d57a]
```
Use case: feature highlight, CTA area, premium badge.

**Watermark tone (subtle identity):**
- **East tone** (mountain/jade): sao hoàng đạo section, tâm linh theme → subtle `mountain-500/10` overlay, golden zodiac icon with mountain glow.
- **West tone** (vermilion/gold deep): warning/hắc đạo section, danger/hắc accent → subtle `vermilion/10` overlay, gold deep shine.

**Ví dụ hiện có (tham khảo):**
- Home Hero: ảnh `sakura-yuhi.jpg` overlay cosmic dark gradient + UI gold + cream + zodiac constellation East tone watermark.
- HoangDao Hero: cosmic dark gradient chuẩn + sparkle gold + heading cream + accent gold. Card grid: cosmic cards trên cosmic bg (unified medium).
- LunarCalendar (scoped): parchment solid section ONLY + parchment-text UI + gold border + East watermark subtle.
- Daily Horoscope: cosmic dark base + 12 sao cards gold shimmer accent + cream text + West vermilion watermark 10% opacity.

**Anti-pattern đã vấp (và fix 2026-05-28):**
- Cream/gold warm-light section liền cosmic dark → tone break, không liên kết. Fix: pivot ALL sections sang cosmic dark, parchment ONLY trong scroll scope.
- Dùng tailwind palette mặc định (`gray-50`, `gray-100`, `purple-*`, `indigo-*`) "cho nhanh" → phá unified palette. Fix: chỉ hex từ Brand palette cosmic+gold.
- Không seed watermark identity (East/West) → các section lẻ lẻ. Fix: thêm subtle `mountain/10` hoặc `vermilion/10` overlay qua `before/after` pseudo-element.
- Section mới KHÔNG kiểm tra pixel gold → text không nổi trên cosmic. Fix: dùng chuẩn complementary trên bảng.
- Light gray background "an toàn" trong form input area → không match cosmic theme. Fix: ink bg (`#0b0d14`) + gold border + cream text.

**Khi có thêm section mới — checklist:**
- Section ngay trước dùng medium nào? Ảnh / cosmic-gradient / gold-shimmer / parchment-scoped?
- Section mới chọn medium khác, pick 2-3 màu từ Brand palette cosmic+gold.
- East tone (mountain/jade) hay West tone (vermilion/gold-deep) watermark subtle?
- UI color complementary: bg cosmic → UI gold/cream; bg parchment → UI parchment-text/gold.
- KIỂM TRA: KHÔNG có cream/light-gray page bg, KHÔNG có hex tím/indigo/violet/fuchsia/plum, KHÔNG có tailwind class `purple-*/indigo-*/violet-*/fuchsia-*/gray-50/gray-100`.
- Test: scroll toàn trang → mỗi section rõ identity qua East/West watermark nhưng vẫn "cùng 1 bộ phim cosmic dark + gold mystic".

---

## Vietnamese content

Tất cả user-facing copy (bot messages, web UI, PDF) là tiếng Việt. Code/comment vẫn dùng tiếng Anh. Label tiếng Việt đã chuẩn hóa trong `packages/core` (`PALACE_LABELS_VI`, `CANH_GIO`, `ANALYSIS_TITLES`) — không hardcode lại ở chỗ khác.

---

## Bot step numbering

2 scheme tách biệt, KHÔNG merge:
- Input phase: "Bước 1/5 … 5/5" (nhập name, gender, date, time, place)
- Processing phase: "Đang xử lý · 1/4 … 4/4" (chart → AI → PDF → send)

Số 4 ở processing độc lập với số section AI (6) — đừng đồng bộ.
