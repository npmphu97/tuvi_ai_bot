# PAGES.md — Bản đồ trang Next.js (Vận Mệnh)

> Tổng hợp toàn bộ trang user-facing + admin trong `apps/web/src/app/`. Mỗi section ghi URL, mục đích, tính năng, auth gate, API gọi và flow chính.

---

## `/`

**Mục đích:** Trang chủ landing — giới thiệu thương hiệu Vận Mệnh và 4 dịch vụ chính.

**Tính năng:**
- Hero "運命 · Vận Mệnh" với ngày dương hôm nay (client-side render qua `toLocaleDateString`).
- Service grid "Tám cánh cửa Huyền Học" — card link tới Tử Vi / Tứ Trụ / Tarot / Hoàng Đạo (một số card `comingSoon` hiển thị "Hệ thống đang triển khai", không click được).
- 12 con giáp interactive — click chọn 1 con để xem rating Tổng quan/Tài lộc/Tình duyên/Sức khỏe (data tĩnh từ `home-data.ts`).
- 12 cung hoàng đạo "Hôm nay" — hiển thị banner "Mặt Trời đang chiếu cung X" + grid 12 card daily reading (data load qua hook `useDailyHoroscope`).
- Lục Diệu theo giờ — 6 card highlight giờ hiện tại.
- Articles section — render 6 bài blog mới nhất (`getAllPosts().slice(0,6)`).

**Auth gate:** Không.
**API gọi:** `/api/horoscope/daily` (qua `useDailyHoroscope`).
**Flow:** SSR render `HomeClient` với prop `featuredPosts`. Client hook fetch daily horoscope sau mount.

---

## `/dang-nhap`

**Mục đích:** Đăng nhập tài khoản qua Google OAuth hoặc Email magic link.

**Tính năng:**
- Detect provider qua env (`GOOGLE_CLIENT_ID`, `EMAIL_SERVER_HOST`) — thiếu env thì hide nút.
- Nút "Đăng nhập với Google" → `signIn('google', { callbackUrl })`.
- Form email + "Gửi link đăng nhập" → `signIn('nodemailer', { email, callbackUrl })`.
- Hiển thị error banner nếu `?error=...` trong URL.
- Bypass: nếu session đã có → redirect về `callbackUrl` ngay từ server.

**Auth gate:** Không (ngược lại: redirect nếu đã login).
**API gọi:** Auth.js `/api/auth/signin/google`, `/api/auth/signin/nodemailer`.
**Flow:** SSR check session → redirect nếu đã login. Client `LoginClient` gọi `signIn()` từ `next-auth/react`.

---

## `/dang-nhap/check-email`

**Mục đích:** Trang xác nhận tĩnh sau khi user nhập email — thông báo đã gửi magic link.

**Tính năng:** Chỉ text + icon "📨" + link về trang chủ. Không có form, không có data fetch.
**Auth gate:** Không.

---

## `/xem-tu-vi`

**Mục đích:** Form lập lá số Tử Vi Đẩu Số 14 chính tinh.

**Form fields:**
- `name` (Họ tên, bắt buộc), `birthPlace` (Nơi sinh, không bắt buộc).
- `gender` (Nam/Nữ — SegmentChoice).
- `calendar` (Dương lịch/Âm lịch — nếu âm thì convert sang dương qua `lunarToSolar`).
- `day`, `month`, `year` (number input, validate 1900-2100).
- `hour` (select 12 canh giờ Tý-Hợi).

**Tính năng:**
- Banner phí "5.000đ/lần — tối thiểu nạp 20.000đ".
- Sau submit hiển thị: BasicInfo, sơ đồ Iztrolabe (react-iztro lazy-load), VietnameseCenter overlay, DeepReadings (6 section AI + 4 deep readings).
- Banner số dư không đủ → link "Nạp tiền vào ví →".

**Auth gate:** Có — chưa login push `/dang-nhap?callbackUrl=/xem-tu-vi`. Charge **5.000đ**.
**API gọi:**
- `POST /api/tuvi/submit` (charge + tạo chart).
- `POST /api/tuvi/<chartId>/analyze` (6 section AI, parallel).
- `POST /api/tuvi/<chartId>/deep-readings` (đại hạn + 12 cung).

**Flow:** Form → buildBirthInfo → `emitOptimisticBalance(-5k)` → POST submit. 402 INSUFFICIENT_BALANCE → banner. OK → setChart + parallel fetch analyze + deep-readings + `trackPurchase('tu-vi', chartId)` GA4.

---

## `/tu-vi/[chartId]`

**Mục đích:** Xem lại lá số Tử Vi đã lập (history detail).

**Tính năng:** Render lại Iztrolabe + BasicInfo + 6 section AI + DeepReadings từ data đã cache trong DB.
**Auth gate:** Bắt buộc login. Chỉ owner xem được; admin xem được mọi chart.
**API gọi:** Server-side load qua Drizzle (`charts`, `analyses`, `deepReadings`). Client có thể trigger re-fetch nếu cache miss.
**Flow:** SSR `auth()` → query `charts` by `id` + filter `userId` (admin bypass) → query `analyses` by `birthHash` + `deepReadings` by `(birthHash, currentYear)` → render `ChartDetailClient`. `robots: noindex`.

---

## `/tu-tru-bat-tu`

**Mục đích:** Form lập Tứ Trụ Bát Tự (8 chữ Can Chi).

**Form fields:**
- `name`, `birthPlace`, `gender` (Nam/Nữ).
- `day`, `month`, `year`, `hour` (12 canh giờ — quy đổi sang civil hour `hour*2`).
- Chỉ nhập dương lịch (không có toggle âm).

**Tính năng:**
- 4 card intro Năm/Tháng/Ngày/Giờ trụ hiển thị trước khi có kết quả.
- Phí 5.000đ/lần. Banner số dư không đủ link `/vi-cua-toi`.
- Sau submit render `TuTruResultView` với chart + AI markdown.

**Auth gate:** Bắt buộc — chưa login push `/dang-nhap?callbackUrl=/tu-tru-bat-tu`. **5.000đ**.
**API gọi:** `POST /api/tu-tru/submit` (charge + chart + AI async). `TuTruResultView` có thể trigger `/api/tu-tru/<chartId>/analyze` nếu chưa có markdown.
**Flow:** Form → `emitOptimisticBalance(-5k)` → POST submit → 402 → banner; OK → setChart + setChartId + `trackPurchase('tu-tru', chartId)`.

---

## `/tu-tru/[chartId]`

**Mục đích:** Xem lại Tứ Trụ đã lập (history detail).

**Tính năng:** Render `TuTruResultView` với chart + markdown AI từ DB cache. Link "← Lịch sử" + "Lập lá số khác".
**Auth gate:** Bắt buộc — owner-only, admin bypass.
**API gọi:** SSR query Drizzle `batTuCharts` + `batTuAnalyses`. Client refetch analyze nếu cần.
**Flow:** SSR auth → query DB → render. `robots: noindex`.

---

## `/xem-tarot`

**Mục đích:** Trải bài Tarot Rider-Waite-Smith 78 lá với AI luận giải cá nhân hóa.

**4 step (`form` → `pick` → `submitting` → `result`):**

1. **Form:** `name`, `gender` (Nam/Nữ), `field` (love/career/finance/health/general), `question` (textarea ≤500 ký tự, không bắt buộc), `numCards` (1/3/5/7/10). Banner phí 5.000đ.
2. **Pick:** Render 78 lá grid với casino dealing animation (28ms stagger × 550ms duration). Click 1 lá → flying animation lật vào tray phía trên. 50% xác suất lá ngược. Nút "⟲ Tráo bài lại" + "← Bỏ lá cuối".
3. **Submitting:** Auto-submit khi đủ `numCards` (delay 1.2s). Hiển thị mini cards + chip "Đã trừ 5.000đ" khi nhận Supabase Realtime balance event.
4. **Result:** Flip animation từng lá (450ms each), sau đó hiển thị intro + per-card paragraph + overall + answer (nếu có question). Nút "↻ Rút mới" và link "Lịch sử Tarot →".

**Auth gate:** Bắt buộc. **5.000đ**/lần.
**API gọi:** `POST /api/tarot/submit` với `{name, gender, field, question, numCards, cards: DrawnCard[]}`.
**Flow:** Subscribe Supabase Realtime `subscribeWallet` để hiển thị `liveCharge`. Submit → emitOptimisticBalance → fetch. 402 → back to form; OK → setResult + `trackPurchase('tarot', chartId)`.

---

## `/xem-tarot/[chartId]`

**Mục đích:** Xem lại trải bài Tarot đã rút.

**Tính năng:** Fetch result cũ qua API, render `ResultView` (intro + per-card + overall + answer). Hiển thị "Không tìm thấy" nếu 404.
**Auth gate:** Bắt buộc — owner-only, admin bypass (qua API).
**API gọi:** `GET /api/tarot/<chartId>`.
**Flow:** Client-side `useEffect` fetch trên mount. 401 → redirect login. 404 → error message.

---

## `/hoang-dao`

**Mục đích:** Tổng quan 12 cung hoàng đạo Tây Phương + form luận giải cá nhân.

**Tính năng:**
- Hero hiển thị "Hôm nay" + cung hôm nay (Mặt Trời chiếu cung).
- Grid 12 ZodiacCard với daily reading từ `useDailyHoroscope` — click → link `/hoang-dao/<slug>`.
- Form `HoroscopeForm`: `day/month/year` (dương lịch) → `getSignFromDate` xác định cung; `gender`, `status` (single/dating/married/divorced), `goal` (career/love/wealth/health/study/family).
- Banner phí 5.000đ + banner số dư không đủ.
- Submit → redirect `/hoang-dao/luan-giai?sign=...&gender=...&status=...&goal=...`.

**Auth gate:** Form bắt buộc auth (push login nếu thiếu); xem 12 card daily thì không cần.
**API gọi:** `/api/horoscope/daily` (qua hook).
**Flow:** Client-only form, không fetch ở trang này — chuyển query param sang `/luan-giai`.

---

## `/hoang-dao/[slug]`

**Mục đích:** Trang nội dung tĩnh chi tiết từng cung (Bạch Dương → Song Ngư).

**Tính năng:**
- `generateStaticParams` từ `ZODIAC_DETAILS` (12 slug).
- Render `HoangDaoDetail` với overview, tính cách, vận trình, neighbors (cung trước/sau), related (3 cung liên quan).
- JSON-LD Article + Breadcrumb schema.

**Auth gate:** Không.
**API gọi:** Không (static data).
**Flow:** SSG. 404 nếu slug không khớp.

---

## `/hoang-dao/luan-giai`

**Mục đích:** Trang kết quả luận giải cá nhân hóa cho cung hoàng đạo (sau khi submit form ở `/hoang-dao`).

**Tính năng:**
- Đọc query param `sign`, `gender`, `status`, `goal`. Validate, invalid → message "Tham số không hợp lệ" + nút quay lại.
- Tự động fetch luận giải khi mount. Hiển thị header cung (symbol, tên, range, element, chips bối cảnh).
- Loading skeleton "Hệ thống đang luận giải… 15-30 giây".
- Hiển thị 4 section: Tính cách (strengths/weaknesses/thinkingStyle), Tình yêu, Sự nghiệp & tài chính, Lời khuyên hành động.
- Banner số dư không đủ + 401 → push login.

**Auth gate:** Bắt buộc. **5.000đ**/lần.
**API gọi:** `POST /api/horoscope/personalize` với `{signEn, gender, status, goal}`.
**Flow:** useEffect fetch → emitOptimisticBalance → setReading + `trackPurchase('horoscope', id)`.

---

## `/ngay-tot`

**Mục đích:** Lịch vạn niên tra ngày hoàng đạo, can chi, giờ tốt cho cưới hỏi/khai trương/v.v.

**Tính năng (client-only — `NgayTotClient`):**
- Calendar month-view bắt đầu Thứ Hai.
- Lọc theo loại việc (`khaitruong`, `cuoihoi`, `xuathanh`, `kykethopdong`, `dongtho`, `nhapha`, `antang`, `khaitruongkho`).
- Mỗi ngày tính `dayMeta` (daicat/hoangdao/hacdao/binh), can chi ngày/tháng/năm, lunar day/month, nên làm / kiêng kỵ, giờ tốt.
- Click ngày → mở detail panel.
- FAQ schema + Service schema.

**Auth gate:** Không.
**API gọi:** Không — tính toán client-side bằng `@tuvi/lichvannien` (thuật toán Hồ Ngọc Đức) + pseudo random theo seed `y*10000+m*100+d`.
**Flow:** Hoàn toàn client-side, không charge.

---

## `/lich-su`

**Mục đích:** Lịch sử tất cả lá số / trải bài user đã làm (Tử Vi + Tứ Trụ + Hoàng Đạo + Tarot).

**Tính năng:**
- Header tổng số "X lá số (a Tử Vi · b Tứ Trụ · c Hoàng Đạo · d Tarot)".
- Tab filter theo loại (`all`/`tu-vi`/`tu-tru`/`hoang-dao`/`tarot`) — push URL query.
- 4 quick CTA "Lập Tử Vi / Tứ Trụ / Hoàng Đạo / Tarot".
- List item với icon + tên + loại + chi tiết (ngày sinh / câu hỏi tarot / status hoàng đạo) + nút "Xem chi tiết →" link tới `/tu-vi/[id]`, `/tu-tru/[id]`, `/xem-tarot/[id]`, hoặc `/hoang-dao/luan-giai?sign=...`.
- Pagination (page/size search param, default size=20, clamp 10-100).

**Auth gate:** Bắt buộc — redirect `/dang-nhap?callbackUrl=/lich-su`.
**API gọi:** SSR Drizzle execute raw SQL — UNION ALL 4 bảng (`charts`, `bat_tu_charts`, `hoang_dao_charts`, `tarot_charts`) WHERE user_id, ORDER BY created_at DESC, paginate.
**Flow:** SSR query → render list. Force-dynamic. Empty state nếu chưa có gì.

---

## `/vi-cua-toi`

**Mục đích:** Ví user — xem số dư, nạp tiền (sinh QR + bankRef), xem lịch sử giao dịch.

**Tính năng:**
- Balance card hiển thị `balanceVnd` + "Tương đương N lần luận giải".
- Form chọn số tiền nạp: 6 quick chip (20k/50k/100k/200k/500k/1M) hoặc nhập tùy ý (tối thiểu `MIN_TOPUP_VND` = 20k).
- Nút "Tạo lệnh nạp" → sinh pending tx + `bankRef` unique, hiển thị thông tin bank (tên ngân hàng, số tk, chủ tk, QR PNG) + nội dung CK = `bankRef + email`.
- List 50 giao dịch gần nhất (paginated, 10/page mặc định) — show type, status, amount, ref, time. Auto-refresh khi nhận Supabase Realtime balance event.
- Toast on event: topup → "Đã nạp X vào ví", admin_credit, refund.
- Refresh balance khi tab focus + on mount (chống Cloudflare Workers RSC cache stale).

**Auth gate:** Bắt buộc — redirect `/dang-nhap?callbackUrl=/vi-cua-toi`.
**API gọi:**
- `GET /api/wallet/balance` (refresh).
- `POST /api/wallet/topup-request` (sinh pending tx).
- `GET /api/wallet/transactions?page=&size=` (history).
- Subscribe Supabase Realtime channel (qua `subscribeWallet`).

**Flow:** SSR load initial balance + bank config + reading price → client `WalletClient` quản lý form + history + realtime push.

---

## `/blog`

**Mục đích:** Index toàn bộ bài viết kiến thức huyền học (Tử Vi / Tarot / Hoàng Đạo / Tứ Trụ / Ngày Tốt).

**Tính năng:**
- Filter dropdown theo `category` (cat search param).
- List card: ảnh cover + title + description + category badge + reading minutes + nút "Đọc tiếp".
- JSON-LD CollectionPage + Breadcrumb.

**Auth gate:** Không.
**API gọi:** Không — pre-built JSON từ markdown qua `getAllPosts()` (build-time, CF Workers compatible).
**Flow:** SSG/SSR render list.

---

## `/blog/[slug]`

**Mục đích:** Bài viết blog chi tiết.

**Tính năng:**
- `generateStaticParams` từ tất cả slug.
- Render HTML đã pre-render từ markdown (dangerouslySetInnerHTML `post.html`).
- Header: category, ngày publish, reading minutes, title, description.
- 3 bài viết liên quan (`getRelatedPosts(slug, 3)`).
- Article + Breadcrumb schema với OG metadata.

**Auth gate:** Không.
**Flow:** SSG. 404 nếu slug không khớp.

---

## `/admin/users`

**Mục đích:** Quản trị danh sách user — credit/debit/đổi role.

**Tính năng:**
- Bảng user với email, name, image, role, balanceVnd, createdAt.
- Search box (debounce 350ms) — match email/name/id qua ilike.
- Pagination (size 20 mặc định, clamp 10-100).
- Mỗi user có action: "Cộng tiền" (quick chip 20k/50k/100k/200k/500k hoặc nhập tay + note) → POST `/api/admin/credit`; "Trừ tiền" + note; đổi role user↔admin.
- Toast on success/error.

**Auth gate:** Bắt buộc role=admin (qua `admin/layout.tsx` — redirect `/` nếu không phải).
**API gọi:** `POST /api/admin/credit` (cộng/trừ qua sign của amount), role update endpoint.
**Flow:** SSR fetch initial → client mutation update array tại chỗ.

---

## `/admin/transactions`

**Mục đích:** Duyệt giao dịch nạp tiền pending + xem lịch sử.

**Tính năng:**
- `StatsPanel` ở trên cùng (số liệu admin: doanh thu, user, charts).
- Tab filter status: `pending` (default) / `completed` / `rejected` / `all`.
- Bảng tx: user email/name, type (topup/charge/refund/admin_credit/...), amount, bankRef, note, createdAt, completedAt.
- Action: "Duyệt" → `POST /api/admin/transactions/approve` (atomic credit + publish Realtime); "Từ chối" → `POST /api/admin/transactions/reject`.
- Pagination, toast feedback.

**Auth gate:** role=admin.
**API gọi:** `/api/admin/transactions/approve`, `/api/admin/transactions/reject`.
**Flow:** SSR fetch rows + stats parallel → client mutation update row.status tại chỗ + `router.refresh()` để stats sync.

---

## `/admin/bank-config`

**Mục đích:** Cấu hình thông tin ngân hàng hiển thị ở trang ví user.

**Tính năng:**
- Form: `bankName`, `accountNumber`, `accountHolder`, `qrImageUrl`, `refPrefix` (default `VTV`).
- Upload QR image (PNG/JPG/WebP < 500KB) → preview ngay.
- Nút "Lưu" → POST `/api/admin/bank-config`.

**Auth gate:** role=admin.
**API gọi:** `POST /api/admin/bank-config/upload-qr` (FormData), `POST /api/admin/bank-config`.
**Flow:** SSR load initial config → client form save.

---

## `/admin/thong-ke`

**Mục đích:** Dashboard thống kê doanh thu + user signup.

**Tính năng:**
- `ChartsClient` render 3 chart: daily revenue, monthly revenue, daily user signups (giờ Việt Nam UTC+7).
- Số liệu tươi mỗi reload, không real-time.

**Auth gate:** role=admin (double check trong page.tsx).
**API gọi:** Không — data load server-side qua `getAdminStats()` (Drizzle aggregate).
**Flow:** SSR fetch stats → render chart client.

---

## `/chinh-sach-bao-mat`

**Mục đích:** Trang policy tĩnh — chính sách bảo mật.
**Tính năng:** Article text + link về trang chủ. Liệt kê dữ liệu thu thập (email, lá số, giao dịch), Google OAuth, cookie.
**Auth gate:** Không. Không có form/API.

---

## `/dieu-khoan-su-dung`

**Mục đích:** Trang policy tĩnh — điều khoản sử dụng.
**Tính năng:** Article text — phạm vi dịch vụ, tính tham khảo (không thay thế tư vấn pháp lý/y tế/tài chính), thanh toán, refund.
**Auth gate:** Không.

---

## `/xoa-du-lieu`

**Mục đích:** Hướng dẫn yêu cầu xóa dữ liệu cá nhân (GDPR/luật VN).
**Tính năng:** Article tĩnh — hướng dẫn gửi email `tuanmanh97x@gmail.com` với tiêu đề "Yêu cầu xóa dữ liệu cá nhân", thời hạn xử lý 7 ngày, link hủy quyền OAuth Google.
**Auth gate:** Không. Không có nút self-delete (đang phát triển).

---

## Tổng quan auth + pricing

| Trang | Auth | Role | Charge |
|---|---|---|---|
| `/` | Open | - | - |
| `/dang-nhap`, `/dang-nhap/check-email` | Open (redirect nếu đã login) | - | - |
| `/xem-tu-vi` (submit) | Required | user | **5.000đ** (`POST /api/tuvi/submit`) |
| `/tu-vi/[chartId]` | Required | owner hoặc admin | Free (xem lại) |
| `/tu-tru-bat-tu` (submit) | Required | user | **5.000đ** (`/api/tu-tru/submit`) |
| `/tu-tru/[chartId]` | Required | owner/admin | Free |
| `/xem-tarot` (submit) | Required | user | **5.000đ** (`/api/tarot/submit`) |
| `/xem-tarot/[chartId]` | Required | owner/admin | Free |
| `/hoang-dao` (view) | Open | - | Free (daily reading) |
| `/hoang-dao/[slug]` | Open | - | Free |
| `/hoang-dao/luan-giai` | Required | user | **5.000đ** (`/api/horoscope/personalize`) |
| `/ngay-tot` | Open | - | Free (client-side calc) |
| `/lich-su` | Required | user | - |
| `/vi-cua-toi` | Required | user | - |
| `/blog`, `/blog/[slug]` | Open | - | - |
| `/admin/*` | Required | **admin** | - |
| `/chinh-sach-bao-mat`, `/dieu-khoan-su-dung`, `/xoa-du-lieu` | Open | - | - |

**Lưu ý chung:**
- Mọi trang submit dùng pattern: optimistic balance drop (`emitOptimisticBalance`) → POST → 402 INSUFFICIENT_BALANCE → banner link `/vi-cua-toi`; success → `trackPurchase()` GA4 + Supabase Realtime balance event sync header `UserMenu`.
- 3 trang `/tu-vi/[chartId]`, `/tu-tru/[chartId]`, `/xem-tarot/[chartId]` set `robots: { index: false, follow: false }` (private user content).
- Mọi trang `/admin/*` đi qua `admin/layout.tsx` gate role=admin (double check ở từng page).
