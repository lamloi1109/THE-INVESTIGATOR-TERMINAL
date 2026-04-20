# Task Breakdown — THE INVESTIGATOR TERMINAL

Task IDs use the format `T-0XX`. Allocate new task IDs within the phase's hundred range (next Phase 2 task → `T-023`). Each task retains the canonical block format:

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

```
Task ID:    T-001
Title:      Khởi tạo Astro project + cấu hình hybrid rendering
Status:     in_progress
Owner:      antigravity
Branch:     antigravity/T-001-astro-scaffold
Assigned:   ANTIGRAVITY
Files:      app/astro.config.mjs, app/package.json, app/tsconfig.json
Acceptance:
  [ ] `npm create astro@latest app` chạy thành công từ repo root
  [ ] app/astro.config.mjs có output: 'hybrid'
  [ ] Preact integration được cài (@astrojs/preact)
  [ ] Vercel adapter được cài (@astrojs/vercel)
  [ ] Dev server chạy được (cd app && npm run dev)
  [ ] Không có React trong dependencies (npm ls react → không kết quả)
Verification:
  cd app && npm run dev → http://localhost:4321 hiện trang mặc định
  cd app && npm ls react 2>&1 | grep -c "empty" hoặc không có output
Depends on: —
Complexity: S
Updated:    2026-04-20 20:44 by antigravity (claimed)
```

```
Task ID:    T-002
Title:      Cấu hình Vercel deployment + Fluid Compute
Status:     todo
Owner:      —
Branch:     —
Assigned:   MANUAL
Files:      app/vercel.json, app/.env.example
Acceptance:
  [ ] app/vercel.json có cấu hình fluid compute (nếu cần)
  [ ] app/.env.example liệt kê tất cả env vars cần thiết
  [ ] Deploy thử lên Vercel thành công, trả về 200 OK
Verification:
  vercel deploy --prod (từ app/) → URL live trả 200
Depends on: T-001
Complexity: S
Updated:    2026-04-20 by human (initial seed)
```

---

## Phase 1: Data Layer (Google Sheets CMS)

```
Task ID:    T-010
Title:      Thiết kế schema Google Sheets (CV, Projects, Case Studies)
Status:     todo
Owner:      —
Branch:     —
Assigned:   MANUAL
Files:      StrategicAnalyst/docs/SHEETS_SCHEMA.md (tài liệu), Google Sheets trên Drive
Acceptance:
  [ ] Sheet "Profile" có cột: key, value_vi, value_en
  [ ] Sheet "Projects" có cột: id, title, description, tags, date, highlights
  [ ] Sheet "CaseStudies" có cột: id, slug, title, problem, solution, result, tech_stack
  [ ] Có ít nhất 3 projects và 2 case studies mẫu
Verification:
  Mở Google Sheets → dữ liệu mẫu đầy đủ, format nhất quán
Depends on: —
Complexity: S
Updated:    2026-04-20 by human (initial seed)
```

```
Task ID:    T-011
Title:      Google Sheets API client + SWR caching
Status:     todo
Owner:      —
Branch:     —
Assigned:   ANTIGRAVITY
Files:      app/src/lib/sheets.ts, app/src/lib/cache.ts
Acceptance:
  [ ] Hàm fetchSheet(sheetName) trả về JSON array
  [ ] SWR cache: maxAge=300s (5 phút), staleWhileRevalidate=3600s (1 giờ)
  [ ] Xử lý lỗi 429 với exponential backoff (base 1s, max 3 retries)
  [ ] Typed response (TypeScript interfaces cho mỗi sheet)
Verification:
  Viết test script gọi fetchSheet('Profile') → trả về data đúng schema
  Gọi 2 lần liên tiếp → lần 2 trả từ cache (log "cache hit")
Depends on: T-010
Complexity: M
Updated:    2026-04-20 by human (initial seed)
```

---

## Phase 2: Static Pages (SSG)

```
Task ID:    T-020
Title:      Trang chủ — Hero + Summary (SSG)
Status:     todo
Owner:      —
Branch:     —
Assigned:   ANTIGRAVITY
Files:      app/src/pages/index.astro, app/src/components/Hero.astro
Acceptance:
  [ ] Trang SSG (prerender = true)
  [ ] Hiển thị tên, title, summary từ Google Sheets data
  [ ] Có CTA rõ ràng: "View Projects" + "Open Terminal"
  [ ] Lighthouse Performance ≥ 95
  [ ] Zero JavaScript shipped (pure Astro component)
Verification:
  cd app && npm run build → dist/index.html tồn tại, không có <script> tag
  Lighthouse audit ≥ 95
Depends on: T-011
Complexity: S
Updated:    2026-04-20 by human (initial seed)
```

```
Task ID:    T-021
Title:      Trang Projects listing (SSG)
Status:     todo
Owner:      —
Branch:     —
Assigned:   ANTIGRAVITY
Files:      app/src/pages/projects/index.astro, app/src/components/ProjectCard.astro
Acceptance:
  [ ] SSG, prerender = true
  [ ] Render danh sách projects từ Sheets data
  [ ] Mỗi card hiển thị: title, description, tags, date
  [ ] Click vào card → đi tới trang chi tiết (T-022)
Verification:
  cd app && npm run build → /projects/ render đúng số lượng projects trong Sheets
Depends on: T-011
Complexity: S
Updated:    2026-04-20 by human (initial seed)
```

```
Task ID:    T-022
Title:      Trang Case Study chi tiết (SSG, dynamic routes)
Status:     todo
Owner:      —
Branch:     —
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
Updated:    2026-04-20 by human (initial seed)
```

---

## Phase 3: Terminal UI (Interactive Island)

```
Task ID:    T-030
Title:      Terminal UI component (Preact island)
Status:     todo
Owner:      —
Branch:     —
Assigned:   ANTIGRAVITY
Files:      app/src/components/Terminal.tsx, app/src/components/TerminalInput.tsx,
            app/src/components/TerminalOutput.tsx
Acceptance:
  [ ] Preact component, client:visible directive
  [ ] Input field với prompt indicator (>)
  [ ] Output area hiển thị streaming text (từng chunk)
  [ ] Hỗ trợ Generative UI: render component động từ AI response
  [ ] Có welcome message giải thích cách dùng + gợi ý câu hỏi mẫu
  [ ] Accessible: keyboard navigation, aria-labels
Verification:
  Trang /terminal → gõ "help" → hiển thị danh sách commands
  Text stream hiển thị từng ký tự, không chờ toàn bộ response
Depends on: T-001
Complexity: L
Updated:    2026-04-20 by human (initial seed)
```

```
Task ID:    T-031
Title:      API route cho Terminal — AI orchestrator
Status:     todo
Owner:      —
Branch:     —
Assigned:   ANTIGRAVITY | CLAUDE_CODE
Files:      app/src/pages/api/chat.ts
Acceptance:
  [ ] POST endpoint nhận { message: string, history: Message[] }
  [ ] Dùng Vercel AI SDK streamText() hoặc createUIMessageStream()
  [ ] System prompt inject toàn bộ CV + projects data (in-context RAG)
  [ ] Gemini 1.5 Flash model
  [ ] Structured output cho các query cụ thể (list projects, show skills)
  [ ] Response time P95 < 3 giây
  [ ] Rate limiting: max 20 requests/phút/IP (in-memory counter)
Verification:
  curl POST /api/chat với message "What projects have you done?"
  → Response stream chứa thông tin projects chính xác từ Sheets data
Depends on: T-011, T-030
Complexity: L
Updated:    2026-04-20 by human (initial seed)
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
Status:     todo
Owner:      —
Branch:     —
Assigned:   ANTIGRAVITY
Files:      app/src/pages/index.astro (update), app/src/pages/projects/index.astro (update)
Acceptance:
  [ ] Trang chủ có section rõ ràng: Experience, Skills, Projects (text tĩnh)
  [ ] Terminal là "bonus feature", không phải entry point bắt buộc
  [ ] Mọi thông tin quan trọng đều có trên SSG pages
  [ ] <noscript> fallback cho terminal section
Verification:
  Tắt JavaScript trong browser → vẫn đọc được CV đầy đủ
  Hiring manager test: đưa link cho 1 người không kỹ thuật → họ hiểu được
Depends on: T-020, T-021, T-022
Complexity: S
Updated:    2026-04-20 by human (initial seed)
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

(empty)
