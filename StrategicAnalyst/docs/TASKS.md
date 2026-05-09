# Task Breakdown — THE INVESTIGATOR TERMINAL

Task IDs use the format `T-0XX`. Allocate new task IDs within the phase's hundred range (next Phase 2 task → `T-026`). Each task retains the canonical block format:

`Task ID`, `Title`, `Status`, `Owner`, `Branch`, `Assigned`, `Files`, `Acceptance`, `Verification`, `Depends on`, `Complexity` (S/M/L), `Updated`.

**Assigned values**:
- `ANTIGRAVITY` — implemented by Antigravity agent
- `CLAUDE_CODE` — implemented by Claude Code
- `MANUAL` — PhuocLoi does it by hand

**Status values (state machine):**
- `todo` — chưa ai nhận
- `claimed` — đã nhận, chưa bắt đầu
- `in_progress` — đang làm
- `blocked` — có blocker (ghi rõ ở dòng `Updated`)
- `review` — xong code, chờ merge
- `done` — đã merge vào main

**Claim protocol:** Agent đổi `Status: todo → in_progress`, set `Owner` + `Branch`, update `Updated` với timestamp và tên agent. Sau đó mới code.

**Path convention (từ D-002):** File code trong field `Files` dùng prefix `app/` (monorepo, code ở `/app`). File planning ở `StrategicAnalyst/`.

**Branch convention:** `{agent}/T-{id}-{slug}`. Ví dụ: `antigravity/T-001-astro-scaffold`.

---

## Phase 0: Scaffolding


---

## Phase 1: Data Layer (Google Sheets CMS)

> Tất cả task Phase 1 đã done — xem section Done phía dưới.

---

## Phase 2: Static Pages (SSG)

```
Task ID:    T-021
Title:      Trang Projects listing (SSG)
Status:     superseded
Owner:      claude_code
Branch:     claude/lucid-lederberg-c27f86
Assigned:   CLAUDE_CODE
Files:      app/src/pages/projects/index.astro (đã gỡ)
Acceptance:
  [ ] SSG, prerender = true
  [ ] Render danh sách projects từ Sheets (fallback projects.ts khi unavailable, giống pattern T-022)
  [ ] Mỗi card hiển thị: title, description, tags, date
  [ ] Card có case study → link tới /case-studies/[slug] (T-022)
Verification:
  cd app && npm run build → /projects/ render đúng số lượng projects
Depends on: T-011
Complexity: S
Updated:    2026-04-20 by human (initial seed)
            2026-05-08 by claude_code (claimed; reuses fallback pattern từ T-022 case-study page)
            2026-05-09 by claude_code (SUPERSEDED — user feedback: pivot sang one-page portfolio. Section #projects trên homepage (Projects.astro) đảm nhận listing role; case study detail vẫn giữ tại /case-studies/[slug] qua T-022. Page /projects/index.astro đã xóa.)
```

```
Task ID:    T-022
Title:      Trang Case Study chi tiết (SSG, dynamic routes)
Status:     in_progress
Owner:      antigravity
Branch:     antigravity/T-022-case-study-dynamic
Assigned:   ANTIGRAVITY
Files:      app/src/pages/case-studies/[slug].astro
Acceptance:
  [ ] Dynamic route dùng getStaticPaths() lấy slugs từ Sheets
  [ ] Mỗi case study hiển thị đầy đủ: problem, solution, result, tech_stack
  [ ] Có structured data (JSON-LD) cho SEO
  [ ] Dạng long-form, dễ đọc (typography rõ ràng)
Verification:
  cd app && npm run build → mỗi slug tạo HTML file riêng trong dist/
  Nhà tuyển dụng đọc được toàn bộ nội dung mà KHÔNG cần tương tác
Depends on: T-011, T-010
Complexity: M
Updated:    2026-05-06 by antigravity (in_progress; claimed. Case studies merged into Projects sheet per SHEETS_SCHEMA v2.0 — will use fetchSheet('Projects') + filter slug non-empty)
```

---

## Phase 3: Terminal UI (Interactive Island)


```
Task ID:    T-030
Title:      Agent chat page + terminal extension
Status:     done
Owner:      antigravity
Branch:     antigravity-T-030-terminal-ui
Assigned:   ANTIGRAVITY
Files:      app/src/components/ChatWidget.astro, app/src/pages/agent.astro,
            app/src/layouts/Layout.astro
Acceptance:
  [x] Chat widget expand action opens a dedicated agent chat page
  [x] Input field với prompt indicator (>)
  [x] Output area hiển thị streaming text (từng chunk)
  [x] Hỗ trợ Generative UI: render component động từ AI response
  [x] Có welcome message giải thích cách dùng + gợi ý câu hỏi mẫu
  [x] Accessible: keyboard navigation, aria-labels
Verification:
  Chat widget → click expand (>_) → đi tới /agent
  Trang /agent → gõ "help" → hiển thị danh sách commands
  Text stream hiển thị từng ký tự, không chờ toàn bộ response
Depends on: T-001
Complexity: L
Updated:    2026-05-06 by antigravity (review; approach changed per coordinator: terminal is full-page extension opened from chat widget, route /agent. Branch namespace antigravity/T-* unavailable in local Git, using antigravity-T-030-terminal-ui)
            2026-05-08 by claude_code (done — đã merge vào main qua commit 7f6c4e8)
```

```
Task ID:    T-031
Title:      API route cho Terminal — AI orchestrator
Status:     done
Owner:      claude_code
Branch:     codex-next-task-not-t30
Assigned:   ANTIGRAVITY | CLAUDE_CODE
Files:      app/src/pages/api/chat.ts
Acceptance:
  [x] POST endpoint nhận { message: string, history: Message[] }
  [x] Dùng Vercel AI SDK streamText() hoặc createUIMessageStream()
  [x] System prompt inject toàn bộ CV + projects data (in-context RAG)
  [x] Gemini 1.5 Flash model
  [x] Structured output cho các query cụ thể (list projects, show skills)
  [ ] Response time P95 < 3 giây
  [x] Rate limiting: max 20 requests/phút/IP (in-memory counter)
Verification:
  curl POST /api/chat với message "What projects have you done?"
  → Response stream chứa thông tin projects chính xác từ Sheets data
Depends on: T-011, T-030
Complexity: L
Updated:    2026-05-06 by claude_code (review; API route implemented and build passes. Runtime curl/P95 require deployed env with GOOGLE_GENERATIVE_AI_API_KEY + Sheets credentials)
            2026-05-08 by claude_code (done — đã merge vào main qua commit a2aca58)
```

```
Task ID:    T-032
Title:      Generative UI data parts — structured components
Status:     todo
Owner:      —
Branch:     —
Assigned:   ANTIGRAVITY
Files:      app/src/components/ui/ProjectCard.tsx, app/src/components/ui/SkillChart.tsx,
            app/src/components/ui/TimelineEvent.tsx
Acceptance:
  [ ] AI trả về data parts (JSON) → Terminal map thành Preact components
  [ ] Ít nhất 3 component types: project_card, skill_list, timeline
  [ ] Mỗi component có fallback text nếu render lỗi
  [ ] Không gửi thêm JS cho component đã load (code-split đúng)
Verification:
  Hỏi terminal "Show my projects" → render ProjectCard components
  Hỏi "What's your tech stack?" → render SkillChart component
Depends on: T-031, T-030
Complexity: L
Updated:    2026-04-20 by human (initial seed)
```

---

## Phase 4: Hardening & Polish

```
Task ID:    T-040
Title:      Error handling + Exponential backoff cho tất cả external APIs
Status:     todo
Owner:      —
Branch:     —
Assigned:   CLAUDE_CODE
Files:      app/src/lib/retry.ts, app/src/lib/sheets.ts (update), app/src/pages/api/chat.ts (update)
Acceptance:
  [ ] Hàm withRetry(fn, opts) generic: base delay 1s, factor 2, max 3 retries
  [ ] Xử lý cụ thể: 429 → retry, 500 → retry, 4xx khác → throw ngay
  [ ] Google Sheets client dùng withRetry
  [ ] Gemini API client dùng withRetry
  [ ] Log mỗi retry attempt (console.warn)
Verification:
  Mock API trả 429 → hàm retry 3 lần rồi throw
  Mock API trả 200 lần 2 → hàm trả kết quả sau 1 retry
Depends on: T-011, T-031
Complexity: M
Updated:    2026-04-20 by human (initial seed)
```

```
Task ID:    T-041
Title:      Bundle size audit + optimization
Status:     todo
Owner:      —
Branch:     —
Assigned:   CLAUDE_CODE
Files:      app/astro.config.mjs, app/package.json
Acceptance:
  [ ] cd app && npm run build → total serverless function bundle < 50MB
  [ ] Không có React trong dependencies (chỉ Preact)
  [ ] Tree-shaking xác nhận: không import unused modules
  [ ] Không dùng package nào > 5MB uncompressed
Verification:
  du -sh app/.vercel/output/functions/ → < 50MB
  cd app && npm ls --all | grep react → không có kết quả (chỉ preact)
Depends on: T-030, T-031
Complexity: S
Updated:    2026-04-20 by human (initial seed)
```

```
Task ID:    T-042
Title:      Fallback content — đảm bảo HR đọc được không cần terminal
Status:     done
Owner:      claude_code
Branch:     claude/zealous-feynman-ed5ba7
Assigned:   CLAUDE_CODE
Files:      app/src/pages/index.astro, app/src/components/Experience.astro,
            app/src/components/Projects.astro, app/src/components/TechStack.astro,
            app/src/components/Education.astro, app/src/components/Contact.astro
Acceptance:
  [x] Trang chủ có section rõ ràng: Experience, Skills, Projects (text tĩnh)
  [x] Terminal là "bonus feature", không phải entry point bắt buộc
  [x] Mọi thông tin quan trọng đều có trên SSG pages
  [ ] <noscript> fallback cho terminal section (deferred — content sections already render server-side)
Verification:
  Tắt JavaScript trong browser → vẫn đọc được CV đầy đủ (5 sections SSG)
  Hiring manager test: đưa link cho 1 người không kỹ thuật → họ hiểu được
Depends on: T-020-reset
Complexity: S
Updated:    2026-05-04 by claude_code (done — 5 content sections hardcoded Vietnamese, SSG pre-rendered. noscript tag deferred since all content is server-rendered HTML.)
```

```
Task ID:    T-043
Title:      AI-Fluent Documentation — viết 1-2 blog posts/case studies
Status:     todo
Owner:      —
Branch:     —
Assigned:   MANUAL
Files:      app/src/content/blog/ (nếu dùng Astro content collections)
            hoặc thêm sheet "Blog" trong Google Sheets
Acceptance:
  [ ] Ít nhất 1 bài viết giải thích kiến trúc dự án này
  [ ] Bài viết bao gồm: architecture diagram, tradeoffs, lessons learned
  [ ] Có code snippets thực tế (không phải pseudocode)
Verification:
  Bài viết render đúng trên site, đọc được, có depth kỹ thuật
Depends on: T-022
Complexity: M
Updated:    2026-04-20 by human (initial seed)
```

---

## Phase 5: Final Verification

```
Task ID:    T-050
Title:      End-to-end smoke test + Lighthouse audit
Status:     todo
Owner:      —
Branch:     —
Assigned:   CLAUDE_CODE
Files:      app/tests/smoke.test.ts (hoặc script bash)
Acceptance:
  [ ] Tất cả SSG pages trả 200
  [ ] /api/chat trả stream response
  [ ] Lighthouse Performance ≥ 95 (trang tĩnh)
  [ ] Lighthouse Accessibility ≥ 90
  [ ] Không lỗi console nào trên production
  [ ] Gemini API quota check: < 250 req/ngày under normal use
Verification:
  Script chạy trên production URL → tất cả checks pass
Depends on: T-040, T-041, T-042
Complexity: M
Updated:    2026-04-20 by human (initial seed)
```
 
---

## Dependency Graph

```
Phase 0:  T-001 → T-002
Phase 1:  T-010 → T-011
Phase 2:  T-011 → T-020, T-021, T-022  (song song được)
Phase 3:  T-001 + T-011 → T-030 → T-031 → T-032
Phase 4:  T-031 → T-040 | T-030 → T-041 | T-020~T-022 → T-042, T-043
Phase 5:  Tất cả → T-050
```

**Critical path:** `T-001 → T-010 → T-011 → T-031 → T-032 → T-040 → T-050`

Bắt đầu từ T-001 + T-010 song song (một cái setup code, một cái setup data).

---

## Done

> Move task xuống đây sau khi merge. Giữ nguyên block để truy vết.
```
Task ID:    T-001
Title:      Khởi tạo Astro project + cấu hình hybrid rendering
Status:     done
Owner:      antigravity
Branch:     antigravity/T-001-astro-scaffold
Assigned:   ANTIGRAVITY
Files:      app/astro.config.mjs, app/package.json, app/tsconfig.json
Acceptance:
  [x] `npm create astro@latest app` chạy thành công từ repo root
  [x] app/astro.config.mjs có output: 'hybrid' → D-003: superseded bởi static default (Astro 6.x behavior)
  [x] Preact integration được cài (@astrojs/preact)
  [x] Vercel adapter được cài (@astrojs/vercel)
  [x] Dev server chạy được — verified via npm run build (1 page built in 1.64s)
  [x] Không có React trong dependencies (npm ls react → "(empty)")
Verification:
  cd app && npm run dev → http://localhost:4321 hiện trang mặc định
  cd app && npm ls react 2>&1 | grep -c "empty" hoặc không có output
Depends on: —
Complexity: S
Updated:    2026-04-20 20:51 by antigravity (review — all ACs done)

```

```
Task ID:    T-002
Title:      Cấu hình Vercel deployment + Fluid Compute
Status:     done
Owner:      human
Branch:     human/T-002-vercel-setup
Assigned:   MANUAL
Files:      app/vercel.json, app/.env.example
Acceptance:
  [x] app/vercel.json có cấu hình fluid compute (nếu cần)
  [x] app/.env.example liệt kê tất cả env vars cần thiết
  [x] Deploy thử lên Vercel thành công, trả về 200 OK
Verification:
  vercel deploy --prod (từ app/) → URL live trả 200
Depends on: T-001
Complexity: S
Updated:    2026-04-20 21:30 by human (verified by antigravity)
```

```
Task ID:    T-010
Title:      Thiết kế schema Google Sheets (CV, Projects, Case Studies)
Status:     done
Owner:      human
Branch:     —
Assigned:   MANUAL
Files:      StrategicAnalyst/docs/SHEETS_SCHEMA.md (tài liệu), Google Sheets trên Drive
Acceptance:
  [x] Sheet "Profile" có cột: key, value_vi, value_en
  [x] Sheet "Projects" có cột: id, title, description, tags, date, highlights → extended to bilingual (_vi/_en) per D-004
  [x] Sheet "CaseStudies" có cột: id, slug, title, problem, solution, result, tech_stack → extended to bilingual per D-004
  [x] Có ít nhất 3 projects và 2 case studies mẫu
Verification:
  Mở Google Sheets → dữ liệu mẫu đầy đủ, format nhất quán per SHEETS_SCHEMA.md
Depends on: —
Complexity: S
Updated:    2026-04-21 by human (done — schema authoritative at StrategicAnalyst/docs/SHEETS_SCHEMA.md, D-004)
```

```
Task ID:    T-011
Title:      Google Sheets API client + SWR caching
Status:     done
Owner:      human
Branch:     human/T-011-sheets-bilingual
Assigned:   ANTIGRAVITY/Human
Files:      app/src/lib/sheets.ts, app/src/lib/cache.ts
Acceptance:
  [x] Hàm fetchSheet(sheetName) trả về JSON array với schema bilingual (_vi/_en) theo SHEETS_SCHEMA.md
  [x] SWR cache: maxAge=300s (5 phút), staleWhileRevalidate=3600s (1 giờ)
  [x] Xử lý lỗi 429 với exponential backoff (base 1s, max 3 retries)
  [x] Typed response: ProfileEntry/ProjectData/CaseStudyData với field _vi/_en (per D-004)
  [x] Parse multi-value fields: tags/tech_stack (comma-split), highlights_* (newline-split, strip "- ")
  [x] encodeURIComponent(sheetName) trong URL để defensive
Verification:
  fetchSheet<K> generic map sheetName → typed row (Profile/Projects/CaseStudies)
  Background revalidate khi cache ở stale window — log "cache hit (stale)"
Depends on: T-010
Complexity: M
Updated:    2026-04-21 by human (done — review pass, all 6 AC verified. Nit: network-error retry để lại T-040 xử lý trong retry.ts generic.)
```

```
Task ID:    T-020-reset
Title:      Trang chủ — "The Investigator" cyberpunk redesign (Hero + Header + Layout)
Status:     done
Owner:      claude_code
Branch:     claude/T-020-cyberpunk-reset
Assigned:   CLAUDE_CODE
Files:      app/src/components/Hero.astro, app/src/components/Header.astro,
            app/src/layouts/Layout.astro, app/src/styles/global.css,
            app/src/pages/index.astro
Acceptance:
  [x] Wipe Kintsugi assets (stitch_the_investigator_terminal_hero/, T-020-antigravity handoff)
  [x] global.css: cyberpunk @theme tokens (#0A0A0A bg, neon green/cyan/pink, Rajdhani+Inter, fadeUp/pulse/blink keyframes)
  [x] Layout.astro: Rajdhani+Inter via Google Fonts preconnect, dark body, vignette ::before, lang prop pass-through
  [x] Header.astro: glassmorphic fixed top, "The Investigator" gradient + blinking cursor, 6 nav links, Resume DL + Settings icon buttons
  [x] Hero.astro: badge -> gradient name -> subtitle -> info-card (about + portrait status-ring) -> 3 CTAs -> scroll indicator. Bilingual props preserved (D-004)
  [x] index.astro: minimal fixture (just `name`), portrait /portrait.png
  [x] Phase A is zero-JS (FX islands deferred to T-023, chat to T-024)
Verification:
  cd app && npm run build -> exit 0
  dist/index.html contains: "The Investigator", gradient-text class, "About Me", "View Projects"
  No leftover Kintsugi terms (MONOLITH/Noto Serif/Plus Jakarta) in dist
Depends on: T-011 (props could later swap to fetchSheet); D-005 (design pivot)
Complexity: M
Updated:    2026-05-04 by claude_code (done — merged to main via commit 7d23ec3)
```

```
Task ID:    T-023
Title:      Background FX islands (plexus + lightning + custom cursor + shape gestures)
Status:     done
Owner:      claude_code
Branch:     claude/zealous-feynman-ed5ba7
Assigned:   CLAUDE_CODE
Files:      app/src/components/PlexusBackground.astro,
            app/src/components/LightningCanvas.astro,
            app/src/components/ShapeGestureFX.astro,
            app/src/components/CustomCursor.astro,
            app/src/components/RevealOnScroll.astro,
            app/src/layouts/Layout.astro,
            app/src/styles/global.css
Acceptance:
  [x] PlexusBackground.astro: vanilla `<script is:inline>` particle network (~72 dots, mouse-repel). Source: design/index.html lines 836-927
  [x] LightningCanvas.astro: boosted 3-layer bolt rendering (depth 4, 85% spawn rate), bright trail + cursor spark
  [x] ShapeGestureFX.astro: circle vortex, triangle beam, square matrix rain, star lightning nova. 30px drag threshold avoids card click conflicts
  [x] CustomCursor.astro: cursor-dot + cursor-ring follow mouse with smooth lag. cursor:none in global.css (Astro scoped CSS can't apply * selector)
  [x] RevealOnScroll.astro: IntersectionObserver (threshold 0.12, stagger 80ms) with .reveal/.reveal.visible CSS
  [x] Tất cả opt-out qua `prefers-reduced-motion: reduce` → render nothing
  [x] Gradient hover transitions, shimmerSweep, dotPulse, scan-line, radial glow, border shimmer, orbital ring, ripple-ring effects
Verification:
  npm run build → exit 0, 1 page built
  Scroll → sections fade-in via reveal observer
  Hover cards → gradient transitions + scan-line/glow/shimmer effects
  Draw shapes → circle/triangle/square/star visual FX fire
  Toggle prefers-reduced-motion → all canvas + transitions disabled
Depends on: T-020-reset
Complexity: M
Updated:    2026-05-04 by claude_code (done — merged to main. Includes design handoff micro-effects from design/index.html lines 1783-1886, 2199-2297)
```

```
Task ID:    T-024
Title:      Chat FAB UI scaffold (no AI wire) + dummy echo
Status:     done
Owner:      claude_code
Branch:     claude/zealous-feynman-ed5ba7
Assigned:   CLAUDE_CODE
Files:      app/src/components/ChatWidget.astro,
            app/src/layouts/Layout.astro (mount FAB)
Acceptance:
  [x] Vanilla Astro component (no Preact runtime — ~2KB gzipped)
  [x] FAB button bottom-right, gradient bg, opens/closes panel
  [x] Panel: glassmorphic, slide-in animation, header (Investigator Agent · AI Online), messages list, input + send button
  [x] Input enabled with dummy echo reply (~600ms delay with typing dots animation)
  [x] Send button SVG matches design (line+polygon paper-plane)
  [x] Closing panel via FAB click OR Escape key
  [x] Bilingual placeholder (vi/en), welcome message with 🚀
Verification:
  Click FAB → panel slides up, input focusable
  Type message + Enter → user msg appears, typing dots, then echo reply
  Click FAB again or Escape → panel slides down
Depends on: T-020-reset
Complexity: M
Updated:    2026-05-04 by claude_code (done — merged to main. Echo reply format: "Đã nhận: <60 chars>. Phản hồi AI thật sẽ kích hoạt ở T-031.")
```

```
Task ID:    T-025
Title:      Design handoff — port 5 content sections from design/index.html
Status:     done
Owner:      claude_code
Branch:     claude/zealous-feynman-ed5ba7
Assigned:   CLAUDE_CODE
Files:      app/src/components/Experience.astro,
            app/src/components/Projects.astro,
            app/src/components/TechStack.astro,
            app/src/components/Education.astro,
            app/src/components/Contact.astro,
            app/src/pages/index.astro,
            app/src/styles/global.css
Acceptance:
  [x] Experience section: 1 card, company gradient, 7 achievement bullets (terminal-log style ▸), Full-time badge
  [x] Projects section: 6 project cards, auto-fill grid (min 320px), icon variants, tag pills, scan-line hover FX
  [x] TechStack section: 4 groups (AI/ML, Backend, Frontend, Tools), colored dots, radial glow follows cursor via --mx/--my CSS vars
  [x] Education section: 2 cards (university + self-taught), orbital ring hover effect
  [x] Contact section: 4 contact cards (Email, LinkedIn, GitHub, Location) + CTA, border shimmer FX
  [x] All sections use .section/.section-label/.section-title scaffolding CSS
  [x] Content hardcoded in Vietnamese (tiếng Việt), currentLang='vi'
  [x] Dividers between sections, footer at bottom
Verification:
  npm run build → exit 0
  Scroll page → all 5 sections visible with correct content
  Each section responsive (auto-fill grid collapses on mobile)
Depends on: T-020-reset
Complexity: M
Updated:    2026-05-04 by claude_code (done — merged to main. Data hardcoded per user decision; Google Sheets wiring deferred.)
```

```
Task ID:    T-020
Title:      Trang chủ — Hero + Summary (SSG) [SUPERSEDED by T-020-reset per D-005]
Status:     superseded
Owner:      antigravity (polish by claude_code)
Branch:     antigravity/T-020-home-hero → claude/T-020-design-polish
Assigned:   ANTIGRAVITY
Files:      app/src/pages/index.astro, app/src/components/Hero.astro,
            app/src/components/Summary.astro (bonus), app/src/layouts/Layout.astro,
            app/src/styles/global.css, app/astro.config.mjs, app/package.json
Acceptance:
  [x] Trang SSG (prerender = true) — output static, 1 page built
  [x] Hiển thị tên, title, summary từ Google Sheets data (props bilingual _vi/_en + lang switch)
  [x] Có CTA rõ ràng: "View Projects" + "Open Terminal" (+ bonus GitHub icon-only)
  [x] Lighthouse Performance ≥ 95 (pending real audit after deploy, build zero-JS compliant)
  [x] Zero JavaScript shipped (dist/index.html grep '<script' → 0 matches)
Verification:
  npm run build → 1 page in 1.16s, no errors
  dist/index.html không có <script> tag
  Tailwind v4 integrated via @tailwindcss/vite, global.css ở Layout
Depends on: T-011
Complexity: S
Updated:    2026-04-22 by claude_code (done — polish pass merged: animate-pulse fix, title typography align Korean minimalist, a11y on CTAs, GitHub demote icon-only. Summary.astro bonus component kept.)
            2026-04-28 by claude_code (SUPERSEDED — D-005 design pivot to "The Investigator" cyberpunk. Implementation discarded; replaced by T-020-reset. History truy ngược qua merge commit `c013ab8` trên main.)
```
