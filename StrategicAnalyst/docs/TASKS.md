# Task Breakdown — THE INVESTIGATOR TERMINAL

Task IDs use the format `T-0XX`. Allocate new task IDs within the phase's hundred range (next Phase 2 task → `T-023`). Each task retains the canonical block format: `Task ID`, `Title`, `Assigned`, `Files`, `Acceptance`, `Verification`, `Depends on`, `Complexity` (S/M/L).

**Assigned values**:
- `ANTIGRAVITY` — implemented by Antigravity agent
- `CLAUDE_CODE` — implemented by Claude Code
- `MANUAL` — PhuocLoi does it by hand

---

## Phase 0: Scaffolding

```
Task ID:    T-001
Title:      Khởi tạo Astro project + cấu hình hybrid rendering
Assigned:   ANTIGRAVITY
Files:      astro.config.mjs, package.json, tsconfig.json
Acceptance:
  [ ] `npm create astro@latest` chạy thành công
  [ ] astro.config.mjs có output: 'hybrid'
  [ ] Preact integration được cài (@astrojs/preact)
  [ ] Vercel adapter được cài (@astrojs/vercel)
  [ ] Dev server chạy được (npm run dev)
Verification:
  npm run dev → http://localhost:4321 hiện trang mặc định
Depends on: —
Complexity: S
```

```
Task ID:    T-002
Title:      Cấu hình Vercel deployment + Fluid Compute
Assigned:   MANUAL
Files:      vercel.json, .env.example
Acceptance:
  [ ] vercel.json có cấu hình fluid compute (nếu cần)
  [ ] .env.example liệt kê tất cả env vars cần thiết
  [ ] Deploy thử lên Vercel thành công, trả về 200 OK
Verification:
  vercel deploy --prod → URL live trả 200
Depends on: T-001
Complexity: S
```

---

## Phase 1: Data Layer (Google Sheets CMS)

```
Task ID:    T-010
Title:      Thiết kế schema Google Sheets (CV, Projects, Case Studies)
Assigned:   MANUAL
Files:      docs/SHEETS_SCHEMA.md (tài liệu), Google Sheets trên Drive
Acceptance:
  [ ] Sheet "Profile" có cột: key, value_vi, value_en
  [ ] Sheet "Projects" có cột: id, title, description, tags, date, highlights
  [ ] Sheet "CaseStudies" có cột: id, slug, title, problem, solution, result, tech_stack
  [ ] Có ít nhất 3 projects và 2 case studies mẫu
Verification:
  Mở Google Sheets → dữ liệu mẫu đầy đủ, format nhất quán
Depends on: —
Complexity: S
```

```
Task ID:    T-011
Title:      Google Sheets API client + SWR caching
Assigned:   ANTIGRAVITY
Files:      src/lib/sheets.ts, src/lib/cache.ts
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
```

---

## Phase 2: Static Pages (SSG)

```
Task ID:    T-020
Title:      Trang chủ — Hero + Summary (SSG)
Assigned:   ANTIGRAVITY
Files:      src/pages/index.astro, src/components/Hero.astro
Acceptance:
  [ ] Trang SSG (prerender = true)
  [ ] Hiển thị tên, title, summary từ Google Sheets data
  [ ] Có CTA rõ ràng: "View Projects" + "Open Terminal"
  [ ] Lighthouse Performance ≥ 95
  [ ] Zero JavaScript shipped (pure Astro component)
Verification:
  npm run build → dist/index.html tồn tại, không có <script> tag
  Lighthouse audit ≥ 95
Depends on: T-011
Complexity: S
```

```
Task ID:    T-021
Title:      Trang Projects listing (SSG)
Assigned:   ANTIGRAVITY
Files:      src/pages/projects/index.astro, src/components/ProjectCard.astro
Acceptance:
  [ ] SSG, prerender = true
  [ ] Render danh sách projects từ Sheets data
  [ ] Mỗi card hiển thị: title, description, tags, date
  [ ] Click vào card → đi tới trang chi tiết (T-022)
Verification:
  Build thành công → /projects/ render đúng số lượng projects trong Sheets
Depends on: T-011
Complexity: S
```

```
Task ID:    T-022
Title:      Trang Case Study chi tiết (SSG, dynamic routes)
Assigned:   ANTIGRAVITY
Files:      src/pages/case-studies/[slug].astro
Acceptance:
  [ ] Dynamic route dùng getStaticPaths() lấy slugs từ Sheets
  [ ] Mỗi case study hiển thị đầy đủ: problem, solution, result, tech_stack
  [ ] Có structured data (JSON-LD) cho SEO
  [ ] Dạng long-form, dễ đọc (typography rõ ràng)
Verification:
  Build → mỗi slug tạo HTML file riêng trong dist/
  Nhà tuyển dụng đọc được toàn bộ nội dung mà KHÔNG cần tương tác
Depends on: T-011, T-010
Complexity: M
```

---

## Phase 3: Terminal UI (Interactive Island)

```
Task ID:    T-030
Title:      Terminal UI component (Preact island)
Assigned:   ANTIGRAVITY
Files:      src/components/Terminal.tsx, src/components/TerminalInput.tsx,
            src/components/TerminalOutput.tsx
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
```

```
Task ID:    T-031
Title:      API route cho Terminal — AI orchestrator
Assigned:   ANTIGRAVITY | CLAUDE_CODE
Files:      src/pages/api/chat.ts
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
```

```
Task ID:    T-032
Title:      Generative UI data parts — structured components
Assigned:   ANTIGRAVITY
Files:      src/components/ui/ProjectCard.tsx, src/components/ui/SkillChart.tsx,
            src/components/ui/TimelineEvent.tsx
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
```

---

## Phase 4: Hardening & Polish

```
Task ID:    T-040
Title:      Error handling + Exponential backoff cho tất cả external APIs
Assigned:   CLAUDE_CODE
Files:      src/lib/retry.ts, cập nhật src/lib/sheets.ts, src/pages/api/chat.ts
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
```

```
Task ID:    T-041
Title:      Bundle size audit + optimization
Assigned:   CLAUDE_CODE
Files:      astro.config.mjs, package.json
Acceptance:
  [ ] npm run build → total serverless function bundle < 50MB
  [ ] Không có React trong dependencies (chỉ Preact)
  [ ] Tree-shaking xác nhận: không import unused modules
  [ ] Không dùng package nào > 5MB uncompressed
Verification:
  du -sh .vercel/output/functions/ → < 50MB
  npm ls --all | grep react → không có kết quả (chỉ preact)
Depends on: T-030, T-031
Complexity: S
```

```
Task ID:    T-042
Title:      Fallback content — đảm bảo HR đọc được không cần terminal
Assigned:   ANTIGRAVITY
Files:      src/pages/index.astro (update), src/pages/projects/index.astro (update)
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
```

```
Task ID:    T-043
Title:      AI-Fluent Documentation — viết 1-2 blog posts/case studies
Assigned:   MANUAL (PhuocLoi viết, Claude review)
Files:      src/content/blog/ (nếu dùng Astro content collections)
            hoặc thêm sheet "Blog" trong Google Sheets
Acceptance:
  [ ] Ít nhất 1 bài viết giải thích kiến trúc dự án này
  [ ] Bài viết bao gồm: architecture diagram, tradeoffs, lessons learned
  [ ] Có code snippets thực tế (không phải pseudocode)
Verification:
  Bài viết render đúng trên site, đọc được, có depth kỹ thuật
Depends on: T-022
Complexity: M
```

---

## Phase 5: Final Verification

```
Task ID:    T-050
Title:      End-to-end smoke test + Lighthouse audit
Assigned:   CLAUDE_CODE
Files:      tests/smoke.test.ts (hoặc script bash)
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
