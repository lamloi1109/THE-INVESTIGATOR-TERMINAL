# Handoff — T-020 Home (Hero + Summary SSG) → Antigravity

**Date:** 2026-04-22
**From:** human (Lâm Phước Lợi) via claude coordinator
**To:** antigravity
**Task:** T-020 (Trang chủ — Hero + Summary, SSG)
**Branch:** `antigravity/T-020-home-hero`

---

## 1. Mục tiêu

Implement trang chủ `/` ở dạng SSG pure Astro: section **Hero** (đã có design từ Google Stitch) + section **Summary** (text-only, chưa có design — bạn tự build theo content Sheets).

Tuân thủ:
- **D-001** — Astro + Preact, không React, bundle cap 50MB
- **D-003** — `output: 'static'` default, explicit `export const prerender = true` ở trang này
- **D-004** — Data layer song ngữ `_vi` / `_en`
- **CLAUDE.md / AGENT_ONBOARDING.md** — cấp phép, claim protocol, commit style

---

## 2. Pre-work — đọc theo thứ tự trước khi code

1. `StrategicAnalyst/CLAUDE.md`
2. `StrategicAnalyst/docs/PRD.md`
3. `StrategicAnalyst/docs/TASKS.md` — tìm block T-020 để lấy AC gốc
4. `StrategicAnalyst/docs/DECISIONS.md` — đọc 5 entries cuối (D-001 → D-004)
5. `StrategicAnalyst/docs/SHEETS_SCHEMA.md` — data contract cho Profile sheet
6. `StrategicAnalyst/docs/reports/antigravity.md` — state session trước
7. `stitch_the_investigator_terminal_hero/hero.astro_code.txt` — **design authoritative** (xem §4)

Nếu bất kỳ file nào thiếu / rỗng / không parse được → STOP, escalate coordinator.

---

## 3. Claim protocol

```
1. git checkout main && git pull
2. git checkout -b antigravity/T-020-home-hero
3. Update TASKS.md block T-020:
   - Status: todo → in_progress
   - Owner: antigravity
   - Branch: antigravity/T-020-home-hero
   - Updated: 2026-04-22 HH:MM by antigravity (claimed)
4. git add + commit: "chore(coord): claim T-020 for antigravity"
5. Push branch, mới bắt đầu code
```

**Pre-claim check:**
- Dependency `T-011` hiện đang `in_progress` (human đang rewrite bilingual). Xem §7 về fallback data strategy.
- `Files` của T-020: `app/src/pages/index.astro` (đã tồn tại từ T-001 scaffold → sẽ ghi đè), `app/src/components/Hero.astro` (mới).

---

## 4. Design source

**Authoritative:** `stitch_the_investigator_terminal_hero/hero.astro_code.txt`

Đây là Astro component đã được chuẩn bị sẵn với:
- Props bilingual (name, bio_vi/bio_en, status_vi/status_en, githubLink, lang)
- Tailwind utility classes pure (không dùng Material Design 3 tokens)
- Status badge dạng pill với pulsing emerald dot
- Typography: title 5xl → 7xl tracking-tighter, bio 2xl zinc-500 font-light
- CTA "View Repository" với GitHub SVG icon

**Giữ nguyên style + structure của file này làm baseline.** Bạn không cần suy nghĩ lại design từ đầu.

**Visual reference (screenshots, để hình dung layout):**
- `stitch_the_investigator_terminal_hero/hero.astro_component_the_investigator_terminal/screen.png` — desktop render
- `stitch_the_investigator_terminal_hero/image.png/screen.png` — portrait asset (có thể insert vào Hero nếu muốn)
- Các biến thể khác trong `stitch_the_investigator_terminal_hero/hero.astro_*` — **chỉ xem để lấy ý tưởng, KHÔNG bắt chước Material Design 3 heavy config** (các file `code.html` trong đó import Google Fonts + MD3 color tokens → quá nặng cho bundle cap).

**Variant muốn dùng:** version ở `hero.astro_code.txt` (wabi-sabi light, zinc-zen palette, whitespace-first).

---

## 5. Deviations bắt buộc so với Stitch output

Stitch generate incomplete / không đủ với T-020 AC. Bạn phải sửa:

### 5.1 CTA button — thiếu "View Projects" và "Open Terminal"
Stitch chỉ có 1 CTA là "View Repository". T-020 AC yêu cầu "View Projects" + "Open Terminal".

Đề xuất: Giữ GitHub icon như ghost link nhỏ (secondary), thêm 2 primary CTA rõ ràng:
- `<a href="/projects">` label "View Projects" → primary button (filled)
- `<a href="/terminal">` label "Open Terminal" → secondary button (outline)

Layout gợi ý: row flex gap-4, stack trên mobile.

### 5.2 Data fetching — không hardcode
Stitch có default hardcoded (name, bio, status). Thay thế:
- Ở `Hero.astro`: giữ Props interface như Stitch (presentation-only)
- Ở `index.astro`: fetch data từ Sheets và pass xuống Hero. Xem §7.

### 5.3 Bilingual toggle state — không trong scope T-020
Props `lang` để sẵn nhưng T-020 **không** implement toggle UI. Default `lang="vi"`, hardcode trong `index.astro`. Locale switcher là task tương lai (chưa có task ID).

### 5.4 Summary section — Stitch chưa cover
T-020 AC nói "Hero + Summary". Stitch chỉ cover Hero. Bạn cần tự build Summary:
- Content: experience / skills / projects tóm tắt từ Profile sheet
- Style: consistent với Hero (white bg, zinc typography, wabi-sabi whitespace)
- Text-only, zero JS, pure Astro
- Keys Profile gợi ý: `experience_summary_vi/en`, `skills_top_vi/en` (liệt kê 5-7 skill), `years_experience`. Nếu sheet chưa có → fixture tạm + flag trong report.

---

## 6. Acceptance criteria (từ TASKS.md + bổ sung)

Từ TASKS.md T-020:
- [ ] Trang SSG, explicit `export const prerender = true`
- [ ] Hiển thị name, title, summary từ Google Sheets Profile (qua fetchSheet khi T-011 xong; dùng fixture trước mắt — xem §7)
- [ ] 2 CTA rõ ràng: "View Projects" → `/projects`, "Open Terminal" → `/terminal`
- [ ] Lighthouse Performance ≥ 95 (local: `npm run build && npm run preview`, Lighthouse audit)
- [ ] Zero JavaScript shipped — `dist/index.html` không chứa `<script>` tag (trừ Astro hydration cho island, nhưng Hero là pure Astro component nên phải trống)

Bổ sung (derive từ design + D-004):
- [ ] Props Hero bilingual — accept cả `_vi` và `_en`, chọn render qua prop `lang`
- [ ] Responsive: mobile-first, breakpoint `md:` cho desktop (theo Stitch baseline)
- [ ] Accessible — `aria-labelledby`, semantic `<section>` + `<h1>`, `aria-label` cho CTAs có icon
- [ ] Animation only ở status badge pulse (đã có trong Stitch). Không thêm scroll animation / parallax / particle (vi phạm non-goals PRD).

---

## 7. Data fetching strategy — xử lý vì T-011 chưa done

**Tình trạng:** human đang rewrite `app/src/lib/sheets.ts` cho bilingual schema. Có thể chưa merge vào main khi bạn claim T-020.

**Hai lựa chọn:**

**Option A (khuyến nghị):** Build với typed FIXTURE, swap khi T-011 merged.
```ts
// app/src/pages/index.astro
---
// FIXTURE — replace with fetchSheet('Profile') when T-011 done (see StrategicAnalyst/docs/reports/antigravity.md)
import type { ProfileEntry } from '../lib/sheets'; // interface sẽ có khi T-011 xong

const profile: Record<string, { vi: string; en: string }> = {
  name: { vi: 'Lâm Phước Lợi', en: 'Lam Phuoc Loi' },
  bio: { vi: '...', en: '...' },
  status: { vi: 'Đang mở cơ hội mới', en: 'Open to new opportunities' },
  github: { vi: 'https://github.com/lamloi1109', en: 'https://github.com/lamloi1109' },
};
export const prerender = true;
---
```

**Option B:** Block T-020 đến khi T-011 done. Chỉ chọn nếu schedule dày ép bạn không code trước.

→ Dùng Option A. Ghi rõ trong report: block nào là fixture, fixture keys nào cần có trên Sheet để swap sạch.

**Keys Profile sheet cần có (nhắc human update Sheet nếu thiếu):**
- `name`, `title`, `bio`, `status`, `github`, `linkedin`, `email`, `location`
- Cho Summary: `experience_summary`, `skills_top` (comma-separated), `years_experience`

---

## 8. Verification steps

```bash
cd app
npm install   # nếu có thêm deps
npm run build
# Check 1: HTML tạo ra không có script tag (Hero là pure Astro)
grep -c '<script' dist/index.html   # → kỳ vọng 0 (hoặc chỉ Astro inline styles)
# Check 2: Preview build và audit Lighthouse
npm run preview &
npx lighthouse http://localhost:4321 --only-categories=performance --quiet --chrome-flags="--headless"
# → Performance score ≥ 95
# Check 3: Inspect manual
# - Mở http://localhost:4321 trong browser, tắt JS → trang vẫn đọc được
# - Click CTA "View Projects" → navigate 404 (vì T-021 chưa có, OK)
# - Click CTA "Open Terminal" → navigate 404 (vì T-030 chưa có, OK)
# - Resize browser mobile width → layout stack đúng
```

---

## 9. Deliverables

| File | Purpose | Nguồn |
|------|---------|-------|
| `app/src/components/Hero.astro` | Hero component bilingual, Props interface | Adapt từ `hero.astro_code.txt` |
| `app/src/components/Summary.astro` | Summary section (experience / skills / bio dài) | Tự build, style consistent Hero |
| `app/src/pages/index.astro` | Trang `/`, prerender, ráp Hero + Summary, data layer | Overwrite Astro scaffold default |
| `StrategicAnalyst/docs/TASKS.md` | Update T-020 block: status, AC check, Updated note | Per AGENT_ONBOARDING Step 5 |
| `StrategicAnalyst/docs/reports/antigravity.md` | Session report: đã làm gì, fixture ở đâu, blocker gì | Per AGENT_ONBOARDING Step 5 |

---

## 10. Branch discipline

- Commit nhỏ, 1 commit per AC (convention từ AGENT_ONBOARDING #7).
  Ví dụ: `feat: add Hero.astro bilingual props (T-020)`, `feat: add Summary section with fixture data (T-020)`, `feat: wire Hero + Summary in index.astro (T-020)`, `perf: verify lighthouse ≥95 (T-020)`.
- KHÔNG commit thẳng vào `main`. Lần trước (T-011 cf97be2) đã vi phạm convention này → không lặp lại.
- Khi xong tất cả AC: `Status: in_progress → review`, mở PR vào `main` (không self-merge — human sẽ review).

---

## 11. Cờ đỏ — khi nào phải dừng và escalate

- Stitch design asset path không parse được → STOP, escalate.
- Phát hiện Tailwind config cần Material Design 3 tokens để render đúng → **KHÔNG** config MD3, simplify xuống plain Tailwind. Báo coordinator nếu style không match được.
- Lighthouse < 95 sau khi đã tối ưu hết → mở block trong report, đừng fake number.
- Cần dùng library > 5MB uncompressed → escalate (vi phạm bundle cap).
- Sheets schema không có keys bạn cần → **KHÔNG** tự chế keys mới cho Profile sheet. Thêm vào `SHEETS_SCHEMA.md` + đợi human update Sheet thực tế rồi mới thay fixture.

---

## 12. End of session

Append vào `StrategicAnalyst/docs/reports/antigravity.md`:

```markdown
## Session 2026-04-22 HH:MM — T-020 Home (Hero + Summary)

**Status:** review | in_progress | blocked

**Done:**
- (liệt kê từng AC đã đạt)

**Fixtures to replace when T-011 lands:**
- (liệt kê file + line number + keys)

**Deviations from Stitch:**
- (ghi lại điểm nào design đổi so với hero.astro_code.txt và lý do)

**Blockers:**
- (nếu có)

**Lighthouse result:**
- Performance: X / Accessibility: Y / SEO: Z
```

---

## 13. Post-merge housekeeping (đưa vào checklist để nhớ)

Sau khi T-020 merged:
- [ ] Kiểm `app/src/components/Hero.astro` ko leak `console.log`, comment FIXME còn sót.
- [ ] Nếu có image asset copy từ `stitch_the_investigator_terminal_hero/image.png/` vào `app/public/` → cập nhật `.gitignore` cho folder stitch nếu không muốn commit toàn bộ Stitch bundle.
- [ ] Nếu bạn thêm decision kiến trúc mới (ví dụ chọn font khác vì Manrope/Inter chưa có trong repo) → append DECISIONS.md **trước** khi commit code theo decision đó.
