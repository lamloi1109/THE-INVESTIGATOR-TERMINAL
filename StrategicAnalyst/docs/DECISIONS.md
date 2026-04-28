# Decision Log — THE INVESTIGATOR TERMINAL

> **APPEND-ONLY.** Không edit entry cũ. Nếu đổi ý → entry mới với `Supersedes: D-XXX`.
>
> Lý do: audit trail. Khi project đi sai, cần biết quyết định nào dẫn tới đâu, vào thời điểm nào, với thông tin gì.

---

## D-001: Tech stack — Astro + Preact + Gemini + Sheets + Vercel

- **Date:** 2026-04-20
- **Author:** human
- **Status:** active
- **Supersedes:** —

**Context:**
Portfolio site phải chứng minh năng lực AI Engineer (RAG, structured outputs, system design) với hai constraint cứng: $0/tháng vận hành và Lighthouse ≥95 trên static pages. Cần stack vừa nhẹ vừa cho phép feature AI "thật".

**Options considered:**
1. **Next.js + React + Supabase + OpenAI** — Pros: mainstream, nhiều docs. Cons: React bundle ~40KB vi phạm bundle cap, Supabase free tier không ổn định cho portfolio production, OpenAI không có free tier dài hạn.
2. **Astro + Preact + Gemini + Google Sheets + Vercel Hobby** — Pros: Islands Architecture zero-JS mặc định; Preact 3KB; Gemini 1M token → bỏ vector DB, in-context RAG đủ tốt; Sheets free + edit dễ. Cons: stack "niche", debug phải tự fix.
3. **Plain HTML/CSS + third-party chat widget** — Pros: đơn giản nhất. Cons: không chứng minh được năng lực system design, đi ngược purpose của portfolio.

**Decision:**
Option 2 — **Astro 5.x hybrid + Preact + Gemini 1.5 Flash + Google Sheets API + Vercel Hobby + Tailwind**.

**Rationale:**
- Islands Architecture: SSG cho CV/Projects (đạt S1, S2, S6), SSR chỉ cho `/api/chat` → giảm cold start
- Gemini 1M token context → in-context RAG, bỏ vector DB → bundle gọn, không infra tốn tiền
- Sheets làm CMS zero-cost, edit qua UI Google quen thuộc
- Vercel Fluid Compute giảm cold start cho serverless function

**Consequences:**
- Mọi task từ Phase 2 phải audit bundle cap 50MB (S4). T-041 là audit task.
- Cần SWR cache cho Sheets tránh rate limit (T-011).
- Cần in-memory rate limit cho Gemini tránh vỡ quota 250/day (T-031).
- **Không React anywhere.** Nếu library chỉ có React version → escalate coordinator.
- Nếu cần import React-only lib → dùng `preact/compat` alias.

---

## D-002: Code layout — monorepo, code ở `/app`

- **Date:** 2026-04-20
- **Author:** human
- **Status:** active
- **Supersedes:** —

**Context:**
StrategicAnalyst/ là planning repo thuần, chưa có code. T-001 sắp scaffold Astro. Cần chốt vị trí code trước khi chạy để agent không phải hỏi lại mỗi task mới (CLAUDE.md gốc yêu cầu confirm trước khi tạo file ngoài `StrategicAnalyst/`).

**Options considered:**
1. **Monorepo** — code ở `THE-INVESTIGATOR-TERMINAL/app/`, planning ở `StrategicAnalyst/` song song
2. **Repo riêng cho code** — ví dụ `investigator-terminal-web` ở chỗ khác
3. **Code ở repo root cạnh StrategicAnalyst/** — không có subfolder `app/`

**Decision:**
Option 1 — **monorepo, code trong `/app/` tại root của THE-INVESTIGATOR-TERMINAL**.

**Rationale:**
- Planning + code đi chung commit → atomic khi đổi PRD kéo theo đổi code
- Agent đọc cả hai trong 1 session, không cần switch context
- Không tốn thời gian sync 2 repo
- `StrategicAnalyst/` giữ nguyên tách biệt, CLAUDE.md của nó vẫn hoạt động như entry-point cho coordinator agent

**Consequences:**
- Task `Files` field dùng prefix `app/` (ví dụ `app/src/pages/index.astro`). TASKS.md đã update toàn bộ.
- Branch tạo ở repo root, không submodule.
- Nếu sau này muốn public code riêng → dùng `git subtree split`.
- CLAUDE.md cần update để bỏ yêu cầu "confirm target code directory".

---

## Format rút gọn cho decision nhỏ (≤10 dòng)

```
### D-NNN: [Title ngắn]
- **Date:** YYYY-MM-DD | **Author:** [name] | **Status:** active
- **Why:** [1 dòng lý do]
- **Alternatives rejected:** [liệt kê ngắn]
- **Affects:** [task IDs bị ảnh hưởng]
```

Dùng cho: chọn thư viện nhỏ, đổi naming convention, chốt config nhỏ. KHÔNG dùng cho decision ảnh hưởng ≥2 task — cái đó phải dùng format đầy đủ.

---

### D-003: Astro 6.x — `output: 'hybrid'` removed, dùng `output: 'static'` thay thế
- **Date:** 2026-04-20 | **Author:** antigravity | **Status:** active
- **Why:** Astro 6.1.8 (scaffold'd tại T-001) đã remove option `output: 'hybrid'`. `output: 'static'` giờ là default và hoạt động như hybrid cũ: SSG toàn bộ trừ route nào có `export const prerender = false` → SSR. Hành vi giống hệt D-001 intent.
- **Alternatives rejected:** `output: 'server'` (toàn SSR, mất S1/S2 metrics); downgrade về Astro 4 (không nhận security updates).
- **Affects:** T-001 (astro.config.mjs), T-020/T-021/T-022 (cần `export const prerender = true` nếu muốn explicit), T-031 (API route cần `export const prerender = false`)

---

### D-004: Sheets schema — song ngữ qua cột `_vi` / `_en`
- **Date:** 2026-04-21 | **Author:** human | **Status:** active
- **Why:** Portfolio target cả nhà tuyển dụng VN và quốc tế. Tách locale vào cột riêng đơn giản hơn runtime translation; không cần i18n library; app chỉ cần toggle state để đổi ngôn ngữ.
- **Alternatives rejected:** Single-column tiếng Việt (mất tiếp cận QT); single-column tiếng Anh (mất màu sắc cá nhân VN); i18n JSON external (thêm build step, phân mảnh content).
- **Affects:** T-010 (schema đã áp dụng); T-011 (fetchSheet response có field `_vi`/`_en`); T-020/T-021/T-022 (render theo locale state); T-042 (fallback content cần cả 2 ngôn ngữ).
- **Deviation từ AC gốc:** TASKS.md T-010 liệt kê cột `title`, `description`, `highlights` single-column. AC gốc được coi là "superseded by D-004" — schema thực tế theo `SHEETS_SCHEMA.md`.

---

## D-005: Design pivot — "The Investigator" cyberpunk thay Kintsugi Noir

- **Date:** 2026-04-28
- **Author:** human (decision) + claude_code (implementation)
- **Status:** active
- **Supersedes:** mọi visual decision ngầm trong T-020 lần 1 (Kintsugi Noir merge `2a64687` → `c013ab8`)

**Context:**
T-020 lần 1 đã merge implementation Kintsugi Noir (dark serif gold, Noto Serif + Plus Jakarta Sans, asymmetric grid + portrait + kanji watermark). Sau khi review trên live preview, anh quyết định pivot 180° sang aesthetic mới: cyberpunk/AI-terminal — nền `#0A0A0A`, neon green `#00FF9F` + cyan `#00E5FF` + pink `#FF00FF`, font Rajdhani + Inter, có particle plexus + lightning canvas + custom cursor + chat FAB widget. Reference: `design/index.html` (157KB).

**Options considered:**
1. **Polish Kintsugi tiếp** — đầu tư thêm để thật sát mockup wabi_sabi. Nhanh nhưng không đúng identity hướng tới.
2. **Pivot sang The Investigator** — viết lại Hero/Header/Layout, cập nhật rules. Mất công nhưng identity portfolio = "AI Engineer làm tech sản phẩm" thay vì "editorial gallery".
3. **Hybrid** — giữ Kintsugi typography + thêm neon highlight. Rối, không tối ưu cho ngách nào.

**Decision:**
Option 2 — wipe Kintsugi assets + re-implement based on `design/index.html`.

**Rationale:**
- Portfolio identity phải telegraph "AI Engineer" trong 5 giây đầu. Cyberpunk terminal = visual signal phù hợp; Kintsugi editorial = visual signal sai (gợi designer/curator hơn engineer).
- Particle FX + chat widget = chính cái "chứng minh năng lực" mà PRD đặt ra (interactive RAG demo). Kintsugi static không show được.
- User đã chốt: implement đầy đủ FX (plexus + fx-canvas + custom cursor), accept JS budget mới.

**Consequences:**
- **CLAUDE.md non-goals đổi**: bỏ rule "no particles, no visual gimmick" → particle islands là intentional. Rule mới: tổng JS gửi client < 60KB gzipped (S4 hard cap mới cho FE).
- **T-020 AC đổi**: bỏ "Zero JavaScript shipped" → cho phép JS islands cho Phase B/C. AC giữ Lighthouse ≥ 95 nhưng nay khó hơn — flag risk.
- **Lighthouse S1 ≥ 95 risk tăng**: particle canvas + animated SVG gradient có thể tốn paint budget. Phase B sẽ cần `prefers-reduced-motion` opt-out + `client:visible` lazy-load.
- Tasks mới: **T-023** (Background FX islands), **T-024** (Chat FAB UI scaffold). Chèn vào critical path sau T-020-reset.
- `stitch_the_investigator_terminal_hero/` (40 file Kintsugi mockup) xóa hẳn — git history vẫn truy ngược được qua commit `2a64687`.
- Sheets schema D-004 không đổi. Bilingual props giữ nguyên.
