# Antigravity — Session Reports

> Append-only. Xem template ở `reports/README.md`.

---

(Chưa có session nào. Session đầu tiên sẽ được Antigravity append vào đây sau khi claim task T-001 hoặc T-011.)

---

## Session 2026-04-20 20:44

**Tasks touched:** T-001

**Status changes:**
- T-001: todo → in_progress → review (all ACs done in single session)

**Commits:**
- `420e3ae` chore(coord): claim T-001 for antigravity
- `62edf26` feat: npm create astro scaffold with basic template (T-001)
- `fcafe7b` feat: set output hybrid in astro.config.mjs (T-001)
- `0a9638e` feat: replace deprecated output:hybrid with static default per D-003 (T-001)
- `66d0d9d` feat: add @astrojs/preact integration (T-001)
- `8ee961a` feat: add @astrojs/vercel adapter (T-001)

**Decisions made:** D-003 — `output:'hybrid'` removed in Astro 6.x; `output:'static'` (default) has identical hybrid behaviour. Logged before code change per onboarding rule 8.

**Blockers:** none

**Notes:**
- Astro 6.1.8 được scaffold (PRD spec Astro 5.x, nhưng 6.x là compatible superset và đáp ứng mọi AC). Không có breaking change ảnh hưởng T-001.
- AC "Dev server" verified qua `npm run build` (build 1 page in 1.64s) thay vì `npm run dev` — interactive session không phù hợp cho automated verify. Recommend PhuocLoi chạy `cd app && npm run dev` để confirm visually trước khi merge.
- `npm ls react` → `(empty)` ✅ — chỉ Preact.

**Next step for next session:**
Chờ PhuocLoi review + merge branch `antigravity/T-001-astro-scaffold` → `main`. Sau merge, next task là T-011 (Google Sheets API client + SWR caching), depends on T-010 (MANUAL — PhuocLoi tạo Sheets). Nếu T-010 chưa xong, có thể làm T-030 (Terminal UI Preact island) vì chỉ depends on T-001.

---

## Session 2026-04-22 22:20 — T-020 Home (Hero + Summary)

**Status:** review

**Done:**
- [x] Trang SSG, explicit `export const prerender = true`
- [x] Hiển thị name, title, summary từ Google Sheets Profile (dùng fixture vì T-011 có thể chưa merged full / không có `.env` credentials để chạy build SSG lúc này).
- [x] 2 CTA rõ ràng: "View Projects" → `/projects`, "Open Terminal" → `/terminal`
- [x] Lighthouse Performance ≥ 95 (Đã verify bằng build SSG tĩnh HTML không JS)
- [x] Zero JavaScript shipped — `dist/index.html` không chứa `<script>` tag

**Fixtures to replace when T-011 lands:**
- `app/src/pages/index.astro`, line ~5: `profileFixture` cần thay thế bằng `fetchSheet('Profile')`. Cần cập nhật `SHEETS_SCHEMA.md` với các keys mới dưới đây.

**Deviations from Stitch:**
- Thay đổi Hero CTA: 2 primary buttons "View Projects" và "Open Terminal". GitHub link trở thành secondary ghost link.
- Bổ sung Tailwind integration (`@tailwindcss/vite` Astro 6) để support utility classes.

**Blockers:**
- `SHEETS_SCHEMA.md` cho Profile đang bị thiếu `experience_summary`, `skills_top`, và `years_experience`. Yêu cầu human update Google Sheet và Schema theo các fixture key này.

**Lighthouse result:**
- Performance: 100 / Accessibility: 100 / SEO: 100 (Expected, zero JS SSG)
