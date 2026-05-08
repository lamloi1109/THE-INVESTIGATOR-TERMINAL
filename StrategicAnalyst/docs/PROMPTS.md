# Prompts — THE INVESTIGATOR TERMINAL

> **Source-of-truth** cho prompts khi giao task cho agent (Antigravity / Claude Code) hoặc dùng Claude.ai để research / orchestrate / debug.
>
> Triết lý gốc: Vibecoding Workflow 2026 (Forge model) — xem `VibeCoding Flow/WORKFLOW_V2.md`. File này là 8 master templates + 9 per-task prompts đã customize cho stack THE INVESTIGATOR TERMINAL (Astro 6 + Preact 10 + Gemini + Sheets + Vercel).
>
> ## Cách dùng
>
> 1. Copy nguyên văn `## Common Block` (section ngay sau Index) → paste vào đầu prompt.
> 2. Copy phần body của template / per-task prompt cần dùng → paste sau Common Block.
> 3. Fill placeholder `[...]` còn lại nếu có.
> 4. Send cho agent.
>
> ## Convention
>
> - **Ngôn ngữ**: Vietnamese narrative + English technical terms (match `TASKS.md` / `AGENT_ONBOARDING.md`).
> - **Anchor**: GitHub-flavored slug (vd `#t-021`, `#mt-4-antigravity-task-spec`).
> - **Common Block**: paste 1 lần đầu mỗi session — agent đọc rồi mới đọc body. Tránh redundancy 9× project context.
> - **Anti-hallucination guard**: mỗi prompt body kết bằng *"Nếu file/utility/convention KHÔNG tồn tại trong repo, dừng lại hỏi tôi — KHÔNG tự tạo"*.

---

## Index

### Master Templates
- [MT-1 — Research Scanner](#mt-1--research-scanner) (Claude.ai + web search)
- [MT-2 — Technical Audit](#mt-2--technical-audit) (Claude.ai + web search)
- [MT-3 — Architect / Plan Mode](#mt-3--architect--plan-mode) (Claude.ai hoặc CC Plan)
- [MT-4 — Antigravity Task Spec](#mt-4--antigravity-task-spec) (UI/frontend tasks)
- [MT-5 — Claude Code Task Spec](#mt-5--claude-code-task-spec) (backend/refactor tasks)
- [MT-6 — Stitch Design Brief](#mt-6--stitch-design-brief) (UI mockup gen)
- [MT-7 — Conflict Resolver](#mt-7--conflict-resolver) (khi 2 agent ra output khác)
- [MT-8 — Deep Research Brief](#mt-8--deep-research-brief) (NotebookLM)

### Per-Task Prompts (9 tasks `todo`)
- [T-021 — Projects listing SSG](#t-021--projects-listing-ssg) → MT-4
- [T-022 — Case Study dynamic routes](#t-022--case-study-dynamic-routes) → MT-4
- [T-030 — Terminal UI Preact island](#t-030--terminal-ui-preact-island) → MT-4
- [T-031 — API route AI orchestrator](#t-031--api-route-ai-orchestrator) → MT-5
- [T-032 — Generative UI data parts](#t-032--generative-ui-data-parts) → MT-4 (UI side)
- [T-040 — Error handling + retry](#t-040--error-handling--retry) → MT-5
- [T-041 — Bundle size audit](#t-041--bundle-size-audit) → MT-5
- [T-043 — AI-Fluent Documentation](#t-043--ai-fluent-documentation) → MT-5 (light)
- [T-050 — E2E smoke + Lighthouse](#t-050--e2e-smoke--lighthouse) → MT-5 + manual

---

## Common Block

> **Copy nguyên văn block này vào đầu MỌI prompt agent**, trước phần body của MT-X hoặc per-task prompt. Block này embed project context + hard constraints chung. Mục đích: agent không phải hỏi lại "đây là project gì", "stack nào", "có dùng React không".

````
# THE INVESTIGATOR TERMINAL — Common Context

## Repo
- Monorepo. Code ở `app/`, planning ở `StrategicAnalyst/docs/` (per D-002).
- Branch hiện tại: main + worktree theo agent.

## Stack thật (verify version với `app/package.json`)
- Framework: Astro 6.1.8 (output: 'static' default — D-003)
- Islands: Preact 10.29.1 (`@astrojs/preact` 5.1.1)
- Styling: Tailwind CSS 4.2.4 (`@tailwindcss/vite`)
- Adapter: `@astrojs/vercel` 10.0.4 (Fluid Compute)
- AI model: Gemini 1.5 Flash (1M token context, in-context RAG, free tier 250 req/day)
- AI SDK target: Vercel AI SDK (`createUIMessageStream` / `streamText` — chưa add)
- CMS: Google Sheets API v4, bilingual `_vi`/`_en` columns (D-004)
- Hosting: Vercel Hobby + Fluid Compute
- Node: ≥22.12.0
- TypeScript: strict, `jsx: "react-jsx"` + `jsxImportSource: "preact"`
- Aesthetic (D-005): cyberpunk "Investigator Terminal" — bg `#0A0A0A`, neon green `#00FF9F` + cyan `#00E5FF` + pink `#FF00FF`, font Rajdhani + Inter. Reference: `design/index.html`.

## Hard constraints (KHÔNG vi phạm)
- **No React anywhere** (D-001). `npm ls react` phải empty. React-only lib → `preact/compat` alias hoặc escalate.
- **Client JS budget < 60KB gzipped** tổng across all islands (CLAUDE.md hard cap, D-005)
- **Serverless bundle < 50MB uncompressed** (PRD S4)
- **No new dep > 5MB uncompressed** without coordinator approval
- **No vector DB / RAG framework** — chỉ in-context RAG qua Gemini 1M (D-001 non-goal)
- **No paid services** — $0/tháng tổng (PRD S5)
- **No auth, no admin CMS UI, no multi-language UI** (PRD non-goals)
- **Lighthouse ≥95** Performance + Accessibility ≥90 (PRD S1)
- **TTFB < 100ms** SSG (S2), **Terminal P95 < 3s** (S3), **0 lỗi 429/504** under <50 visitors/day (S7)
- **prefers-reduced-motion: reduce** → disable canvas FX, return early
- **Static fallback 100%** — disable JS vẫn đọc được full CV + case studies (S6)

## Files agent phải đọc trước
1. `StrategicAnalyst/CLAUDE.md`
2. `StrategicAnalyst/docs/PRD.md`
3. `StrategicAnalyst/docs/TASKS.md` (block của task bạn claim)
4. `StrategicAnalyst/docs/DECISIONS.md` (5 entries cuối: D-001 → D-005)
5. `StrategicAnalyst/docs/PROMPTS.md` (file này — đã đọc rồi nếu đang đọc prompt từ đây)
6. `StrategicAnalyst/docs/reports/{your-agent}.md` (session trước)

## Decision log refs nhanh
- D-001: stack Astro+Preact+Gemini+Sheets — no React, no vector DB
- D-002: monorepo `app/` ở repo root, planning ở `StrategicAnalyst/`
- D-003: Astro 6 dùng `output: 'static'` (default) thay `'hybrid'` (đã removed)
- D-004: Sheets bilingual qua cột `_vi` / `_en`
- D-005: design pivot Kintsugi → "Investigator" cyberpunk; particle FX islands được phép, JS cap <60KB

## Branch + commit convention
- Branch: `{agent}/T-{id}-{slug}` — vd `claude-code/T-040-retry-logic`, `antigravity/T-021-projects-listing`
- Commit: `[type]: [what] (T-XXX)` — 1 commit / acceptance criterion
- Type: `feat | fix | refactor | chore | docs | test | perf`

## Khi stuck — escalation
- KHÔNG mock data giả rồi coi như xong
- KHÔNG comment out code lỗi
- KHÔNG `// @ts-ignore`, `as any`, `catch {}` rỗng để bypass
- KHÔNG monkey-patch code agent khác
- Update `Status: blocked` trong `TASKS.md` + ghi rõ blocker trong field `Updated`
- Hỏi cụ thể: "Stuck ở X vì Y, 2 hướng Z1/Z2, anh chọn?"

## Anti-hallucination guard
Nếu file / utility / convention KHÔNG tồn tại trong repo (vd ref `app/src/lib/foo.ts` chưa tạo), DỪNG hỏi coordinator — KHÔNG tự tạo file ngoài scope `Files:` của task.

Confirm "UNDERSTOOD + sẽ tuân thủ Common Block" trước khi đụng file.
````

---

## Master Templates

### MT-1 — Research Scanner

**Khi dùng**: Cần overview nhanh về 1 chủ đề/tool/library. Output dùng làm input cho NotebookLM hoặc PRD.

**Tool**: Claude.ai (web/desktop) với Web Search bật.

**Body** (paste sau Common Block — hoặc dùng standalone vì task này không đụng repo):

````
# NHIỆM VỤ: Quét thị trường & tổng hợp dữ liệu

**Chủ đề:** [CHỦ ĐỀ — viết cụ thể, vd "Vercel AI SDK createUIMessageStream + Generative UI patterns 2026"]

**Vai trò:** Bạn là Strategic Analyst. Output sẽ nạp vào NotebookLM của THE INVESTIGATOR TERMINAL làm knowledge base — phải chính xác tuyệt đối, KHÔNG bịa, KHÔNG "theo tôi biết".

**Quy trình bắt buộc:**
1. Web search ít nhất 5 lần với keyword khác nhau
2. Ưu tiên nguồn (theo tier):
   - **Tier 1**: official docs (Astro 6, Preact 10, Vercel AI SDK, Gemini API), papers (arxiv), Github issues/PRs ≥10 reactions, HN discussions
   - **Tier 2**: technical blog có author credential, conference talks recorded
   - **Tier 3 (TRÁNH)**: SEO content farm, listicle generic, no-author tutorial
3. Thông tin trong 6 tháng gần nhất (relative tới currentDate trong prompt), trừ khi chủ đề là nền tảng (paper gốc, spec)
4. Nếu nguồn mâu thuẫn → ghi rõ, KHÔNG tự hòa giải

**Relevance filter cho project**:
- Loại trừ solution đòi React, vector DB, paid services, multi-step agent loops
- Ưu tiên solution chạy được trên Vercel Hobby + Astro 6 islands

**Format output (Markdown thuần — paste vào NotebookLM):**

## 1. Executive Summary (3-5 bullets)
## 2. Deep Dive
   - Bảng so sánh nếu có ≥2 đối tượng
   - Số liệu cụ thể kèm nguồn
## 3. Contrarian View (cộng đồng đang cãi gì?)
## 4. Known Unknowns (câu hỏi chưa có đáp án rõ)
## 5. Sources (URL + 1 dòng mô tả mỗi link)

Bắt đầu.
````

---

### MT-2 — Technical Audit

**Khi dùng**: Bug khó, performance issue, hoặc cần debug-by-research trước khi đụng code.

**Tool**: Claude.ai + Web Search.

**Body**:

````
# NHIỆM VỤ: Điều tra kỹ thuật chuyên sâu

**Vấn đề:** [Mô tả cụ thể — vd "Astro 6.1.8 build fails khi import Preact component có top-level await"]
**Stack hiện tại:** Astro 6.1.8 + Preact 10.29.1 + Tailwind 4.2.4 + Vercel adapter 10.0.4 + TypeScript strict
**Đã thử:** [Liệt kê những gì đã fail, kèm error message exact]

**Vai trò:** Principal Engineer làm technical audit. Mục tiêu: tìm root cause + giải pháp chạy được, KHÔNG phải giải pháp "theo lý thuyết".

**Quy trình:**
1. Tìm Github issues tương tự (ưu tiên issue đã close + có fix commit reference)
2. Tìm StackOverflow answer score ≥20 trong 12 tháng gần
3. Check official docs version chính xác (Astro 6.x changelog — KHÔNG dùng pattern Astro 4.x đã deprecated)
4. Check Vite 6 compat nếu liên quan bundling

**Solution constraint** (loại trừ ngay):
- Đề xuất swap sang React → REJECT (D-001)
- Đề xuất add dep > 5MB → REJECT
- Đề xuất bypass bundle cap 60KB → REJECT
- Đề xuất dùng vector DB → REJECT (D-001 non-goal)

**Format output:**

## 1. Diagnosis (root cause, không chỉ symptom)
## 2. 3 Solutions (Dễ → Tối ưu)
   - Mỗi solution: code snippet, tradeoff, effort ước tính, **bundle impact** (đo gzipped delta nếu có thể estimate)
## 3. Technical Caveats (version conflict, breaking change cần tránh, dep tree pollution)
## 4. Verification Plan (test nào confirm fix đúng — command + expected output)
## 5. Sources (link cụ thể, không "tôi đọc đâu đó")

Bắt đầu.
````

---

### MT-3 — Architect / Plan Mode

**Khi dùng**: Cần biến briefing từ NotebookLM (hoặc requirement mới) thành PRD + task breakdown chạy được.

**Tool**: Claude.ai (greenfield) hoặc Claude Code Plan Mode (đã có codebase).

**Body** (paste sau Common Block):

````
# VAI TRÒ: Chief Architect cho THE INVESTIGATOR TERMINAL

Nhiệm vụ: biến briefing thành kế hoạch execution mà agent (Antigravity, Claude Code) chạy được ngay.

## Input
- Briefing từ NotebookLM (paste bên dưới)
- Codebase context (Plan Mode tự đọc; nếu Claude.ai thì paste tóm tắt từ Common Block)

## Phải đọc trước (nếu Plan Mode)
- `StrategicAnalyst/CLAUDE.md`
- `StrategicAnalyst/docs/PRD.md`
- `StrategicAnalyst/docs/TASKS.md`
- `StrategicAnalyst/docs/DECISIONS.md` (5 entries cuối)
- `app/package.json`, `app/astro.config.mjs` (verify version + config thật)

## Output 3 artefacts:

### A. PRD-delta (1 trang)
- Problem statement (chỉ phần thêm vs PRD.md hiện tại)
- Success criteria (link với S1-S7 nếu áp dụng; nếu thêm metric mới → đánh số S8+)
- Non-goals
- Tech stack đề xuất (CHỈ thêm gì NGOÀI stack hiện tại; nếu trùng thì ref D-001)

### B. Task Breakdown — schema canonical từ TASKS.md
Mỗi task block:

```
Task ID:    T-0XX (next ID trong phase's hundred range — Phase 2: T-02X, Phase 3: T-03X, ...)
Title:      [...]
Status:     todo
Owner:      —
Branch:     —
Assigned:   [ANTIGRAVITY | CLAUDE_CODE | MANUAL hoặc combination]
Files:      [paths absolute với prefix app/ — đánh dấu (create) cho file mới]
Acceptance:
  [ ] Criterion 1 (đo được, KHÔNG "improve" / "optimize" mơ hồ)
  [ ] Criterion 2
Verification:
  [Command/URL/check cụ thể, paste-able]
Depends on: [T-XXX, ...]
Complexity: [S | M | L]
Updated:    YYYY-MM-DD by architect (initial seed)
Prompt:     → docs/PROMPTS.md#t-0xx (nếu sẽ thêm prompt cho task này)
```

### C. Risk Register — 3-5 rủi ro lớn nhất + mitigation cụ thể

## Hard constraints khi đề xuất
[Common Block đã embed — chỉ cần ref:]
- No React, no vector DB, no paid services
- Client JS <60KB gzipped tổng
- Lighthouse ≥95, $0/tháng

## Luật
- KHÔNG tự bịa tech chưa có trong briefing. Thiếu info → hỏi coordinator (PhuocLoi).
- Task mơ hồ → break nhỏ hơn. Đừng giao agent task không verify được.
- Đọc xong briefing, trả lời "KẾ HOẠCH SẴN SÀNG" + tóm tắt 3 dòng trước khi output 3 artefacts.

## Anti-hallucination guard
Nếu ref file `app/src/lib/foo.ts` mà chưa tồn tại, đánh dấu rõ `(create)` trong Files. KHÔNG ngầm định.

---
**BRIEFING:**
[PASTE]
````

---

### MT-4 — Antigravity Task Spec

**Khi dùng**: Giao task UI/frontend (Astro page, Preact island, FX layer, component) cho Antigravity agent.

**Body** (paste sau Common Block):

````
# Task: [T-XXX — Title]

## Task spec
[1-2 đoạn mô tả task tồn tại để giải quyết gì, liên quan user/PRD section nào]

## Files affected
[List paths với prefix `app/` — đánh dấu `(create)` / `(modify)` rõ. Nếu cần file ngoài list này, escalate trước, KHÔNG tự thêm.]

## Reference patterns trong repo (reuse, đừng tự viết lại)
[1-3 file pattern hiện có để học style. Vd:]
- `app/src/components/Hero.astro` — pattern bilingual prop `_vi`/`_en` + lang switch
- `app/src/components/PlexusBackground.astro` — pattern `prefers-reduced-motion` guard + canvas opt-out
- `app/src/lib/sheets.ts` — `fetchSheet<K>()` generic typed reader

## Acceptance criteria (sync với TASKS.md — nếu mismatch, TASKS.md là truth)
- [ ] [Copy nguyên văn từ TASKS.md block, checkbox format]
- [ ] ...

## Verification (chạy hết trước khi push PR)
1. `cd app && npm run build` → 0 error, 0 warning
2. `npm run dev` → mở 3 viewport (375 / 768 / 1440), screenshot mỗi cái, attach vào PR
3. DevTools Console: 0 error; Network: 0 4xx/5xx
4. Throttle Slow 3G → initial paint < 2s
5. Lighthouse Performance + Accessibility ≥95 (run trên `npm run preview` build, KHÔNG dev)
6. Disable JS → static fallback render full content (nếu task có UI side)
7. Bundle delta đo bằng `du -h app/dist/_astro/*.js | sort -hr | head` — paste output vào PR description

## Out of scope (KHÔNG làm trong task này)
[List 2-4 thứ explicitly defer sang task khác để agent không scope-creep]

## Branch + commit
- Branch: `antigravity/T-XXX-{slug}` (slug ngắn, kebab-case, ≤4 word)
- Commit: `[type]: [what] (T-XXX)` — 1 commit / AC
- Push PR — KHÔNG merge to main, đợi coordinator review

## Anti-hallucination guard
Nếu file/utility/convention KHÔNG tồn tại trong repo (vd ref `app/src/lib/foo.ts` chưa tạo), DỪNG hỏi coordinator — KHÔNG tự tạo file ngoài scope `Files:`.

START.
````

---

### MT-5 — Claude Code Task Spec

**Khi dùng**: Giao task backend / refactor / script / lib (API route, retry helper, audit, test) cho Claude Code.

**Body** (paste sau Common Block):

````
# Task: [T-XXX — Title]

## Trước khi code (đọc convention repo)
1. `app/src/lib/sheets.ts` — pattern fetch + cache hiện có
2. `app/src/lib/cache.ts` — SWR wrapper hiện có
3. `app/astro.config.mjs` — Astro config thật (verify version, integration đã add)
4. `app/package.json` — verify dep version đúng

Nếu convention không rõ ở 1 chỗ nào → HỎI coordinator trước khi code, KHÔNG đoán.

## Task spec
[Mô tả ngắn gọn — task tồn tại để giải quyết gì]

## Files affected
[List paths với prefix `app/` — đánh dấu `(create)` / `(modify)`]

## Reference utilities trong repo (reuse, đừng viết lại)
[Vd:]
- `withRetry()` from `app/src/lib/retry.ts` (nếu T-040 đã done)
- `fetchSheet<K>()` from `app/src/lib/sheets.ts`
- `swrCache()` from `app/src/lib/cache.ts`

## Acceptance criteria (sync với TASKS.md)
- [ ] [Copy nguyên văn từ TASKS.md]
- [ ] ...

## Verification (chạy hết trước khi push PR)
1. `cd app && npm run build` → 0 error
2. Test command: `[task-specific, vd: curl POST /api/chat ...]`
3. Output expected: `[specific, paste-able]`
4. Coverage ≥80% cho logic mới (nếu test framework đã set up; nếu không, manual smoke 5 trường hợp)
5. `npm ls react` → empty (verify D-001 không bị break)
6. `du -sh app/.vercel/output/functions/` → < 50MB (nếu task đụng API route hoặc dep)

## Out of scope (KHÔNG làm trong task này)
[List 2-4 thứ defer]

## Branch + commit
- Branch: `claude-code/T-XXX-{slug}`
- Commit: `[type]: [what] (T-XXX)` — 1 commit / AC
- Type: `feat | fix | refactor | chore | docs | test | perf`

## Anti-hallucination guard
Nếu file/utility KHÔNG tồn tại trong repo, DỪNG hỏi — KHÔNG tự tạo lib ngoài scope `Files:`.

START. Confirm "UNDERSTOOD" + nhắc lại 3 hard constraints quan trọng nhất với task này trước khi đụng file.
````

---

### MT-6 — Stitch Design Brief

**Khi dùng**: Cần generate UI mockup nhanh cho component mới (screen chưa có ở `design/index.html`).

**Tool**: Google Stitch.

**Body** (standalone — không cần Common Block vì Stitch không đọc repo):

````
# UI Brief: [Screen / Component name]

## Target user
PhuocLoi's portfolio audience: hiring managers (ưu tiên) + fellow engineers. Tech-fluent nhưng không patient với UX rối. Mobile traffic dự kiến ~40%.

## User job
[Họ vào screen này để làm gì? Tối đa 3 jobs, ưu tiên 1]

## Must-have elements
- [Element 1 + lý do]
- [Element 2]

## Style direction (theo D-005 — "The Investigator" cyberpunk)
- **Mood**: cyberpunk terminal, AI-engineer aesthetic — KHÔNG "designer/curator/editorial"
- **Color palette**:
  - Background: `#0A0A0A` (true near-black)
  - Accent neon: green `#00FF9F`, cyan `#00E5FF`, pink `#FF00FF` — sparingly, KHÔNG cả 3 cùng frame
  - Text: `#E5E5E5` body, `#A3A3A3` muted
- **Typography**: Rajdhani (display, headlines, weight 600-700) + Inter (body, weight 400-500)
- **Density**: cozy mid-density (không spacious như Linear, không compact như TradingView)
- **Optional FX**: scan-lines, glassmorphic panels (`backdrop-filter: blur(12px)`), blinking cursor, gradient hover, glow on focus
- **Reference file thật**: `design/index.html` (157KB) — đặc biệt lines 1783-2297 cho FX patterns

## Constraint
- Stitch xuất React + Tailwind → port sang **Preact + Tailwind 4** trong codebase. Tránh React-only API (vd `useTransition`, suspense `<Suspense>` với async fetch — Preact 10 chưa fully compat).
- Viewport priority: 375px (mobile-first) → 768px → 1440px (desktop)
- Bundle budget: design phải khả thi với <60KB gzipped tổng JS (D-005). Tránh component thừa.

## KHÔNG muốn
- Modal popup (terminal đã chiếm screen real-estate, modal đè modal nữa = mệt)
- Carousel
- Gradient màu mè 3+ stops (chỉ 2-stop accent)
- 3D effects (vi phạm PRD non-goal)
- React-only library (chart libs cần verify Preact compat)

## Deliverable
- 2 variants khác **approach** (KHÔNG phải khác màu)
- Export code React + Tailwind
- List component reusable + bundle estimate cho từng variant
````

---

### MT-7 — Conflict Resolver

**Khi dùng**: 2 agent (Antigravity + Claude Code) đã làm cùng phần, output khác nhau, cần phán quyết.

**Body** (paste sau Common Block — Common Block cho phán quyết viên hiểu hard constraints để check):

````
# NHIỆM VỤ: Hòa giải kỹ thuật

Hai agent làm cùng task, output khác nhau. Cần phán quyết cuối.

## Context gốc
- Task: T-XXX
- PRD section liên quan: [paste từ `docs/PRD.md` — section S1/S2/non-goals nào áp dụng]
- Acceptance criteria từ `docs/TASKS.md` (TRUTH SOURCE):
  [paste nguyên văn block AC]

## Solution từ Antigravity
```
[paste code]
```
**Verification Antigravity đã chạy**: [paste output `npm run build`, `npm run dev` console, lighthouse]
**Bundle delta**: [paste — gzipped KB]

## Solution từ Claude Code
```
[paste code]
```
**Verification Claude Code đã chạy**: [paste output]
**Bundle delta**: [paste]

## Yêu cầu phân tích
Truth source theo thứ tự ưu tiên:
1. **Acceptance criteria trong TASKS.md** (đáp ứng đủ AC nào hơn?)
2. **Hard constraints Common Block** (vi phạm constraint nào không?)
3. **PRD success metrics S1-S7** (bundle, Lighthouse, latency)
4. **Pattern khớp với code hiện có ở `app/src/`** (maintainable hơn?)

Câu hỏi:
1. Solution nào đúng AC trong TASKS.md hơn? Ref AC cụ thể (số thứ tự checkbox).
2. Solution nào tuân thủ hard constraints hơn? Liệt kê constraint vi phạm cho bên thua nếu có.
3. Solution nào đáp ứng S1-S7 tốt hơn? Số đo cụ thể.
4. Có solution thứ 3 lai ghép tốt hơn cả 2?
5. Nếu phải chọn 1, chọn cái nào + tại sao?
6. Risk khi chọn cái đó? Cần mitigation gì?

## Output format
- **Phán quyết**: A / B / C-hybrid (1 dòng đầu)
- **Lý do**: 3 bullet, mỗi bullet ref 1 AC hoặc 1 constraint cụ thể
- **Action để merge**: Solution thắng cần edit gì? (vd "thêm prefers-reduced-motion guard")
- **Loser keep**: Có pattern hay nào của solution thua nên salvage?

KHÔNG trả lời "cả 2 đều tốt, tùy bạn". Cần phán quyết.
````

---

### MT-8 — Deep Research Brief (NotebookLM)

**Khi dùng**: Bắt đầu research dài (≥30 phút) với NotebookLM Deep Research, cần knowledge base structured.

**Body** (standalone — NotebookLM không đọc repo):

````
# CHỦ ĐỀ NGHIÊN CỨU: [Cụ thể, không chung chung]

## Mục đích sử dụng
[1-2 câu: research xong, dùng notebook này làm gì]
- Vd: "Build Vercel AI SDK Generative UI pipeline cho T-031/T-032"
- Vd: "Quyết định state management trong Terminal island T-030 — signal vs context vs zustand"

## Scope — Must-cover subtopics
Mỗi subtopic ≥3 nguồn độc lập:
1. [Subtopic 1] — cần hiểu: [aspect cụ thể]
2. [Subtopic 2] — cần hiểu: [aspect cụ thể]
3. [Subtopic 3] — cần hiểu: [aspect cụ thể]

## Scope — KHÔNG nghiên cứu (out of scope, tránh nhiễu)
- Solutions đòi React (project dùng Preact — D-001)
- Solutions cần vector DB (project dùng in-context RAG)
- Solutions paid (project $0/tháng — PRD S5)
- Solutions cho on-premise / self-host (project trên Vercel Hobby)
- Solutions multi-step agent loops (vi phạm CLAUDE.md risk #2 cold-start)

## Tiêu chí nguồn (priority)
1. **Tier 1**: official docs (Astro 6, Preact 10, Vercel AI SDK, Gemini API), arxiv papers, engineering blogs (Anthropic / Vercel / Google DeepMind), Github repos ≥1k stars
2. **Tier 2**: technical blog có author credential, conference talks recorded
3. **Tier 3 (TRÁNH)**: SEO content farm, listicle generic, no-author tutorial

## Thời gian
- Thông tin trong [6/12] tháng gần nhất
- Exception: paper gốc, spec stable

## Contrarian coverage (bắt buộc)
Mỗi subtopic chính có ≥1 critique / limitation / counter-argument. Không chấp nhận "tất cả đều tốt".

## Done criteria
- [ ] Mỗi subtopic ≥3 nguồn độc lập (không paraphrase nhau)
- [ ] ≥1 contrarian view per subtopic
- [ ] ≥1 case study / benchmark thực tế
- [ ] Đủ depth để generate Audio Overview 10-15' không filler

## Follow-up queries sẽ hỏi sau research
1. [Vd: "Vercel AI SDK streamText vs createUIMessageStream cho T-031, chọn cái nào + lý do?"]
2. [Vd: "Common pitfall khi triển khai Generative UI data parts với Preact?"]
3. [Vd: "Code pattern reference cho rate-limit Gemini in-memory <50 LOC?"]

## Output ngay sau research (briefing trong chat notebook)
- **Executive Summary** (5 bullet, mỗi 1 câu)
- **Key Trade-offs** (bảng so sánh nếu có ≥2 option)
- **Red Flags & Gotchas** (sẽ cắn khi implement)
- **Recommended Path Forward** (1 approach, lý do)
- **Open Questions** (research chưa rõ, cần tự test)

Citation rigor: mỗi claim nghiêm túc link tới source. KHÔNG "theo tổng hợp chung".

BẮT ĐẦU RESEARCH.
````

---

## Per-Task Prompts

> **Cách dùng**: Copy `## Common Block` ở trên + body của task cần dùng → paste vào agent.

### T-021 — Projects listing SSG

**Base template**: MT-4 (Antigravity)
**Assigned**: ANTIGRAVITY
**Depends on**: T-011 (done — Sheets client + cache đã sẵn)
**Will block**: T-022 (case study links từ cards), T-042 (fallback content)

**Body**:

````
# Task: T-021 — Trang Projects listing (SSG)

## Task spec
Build trang `/projects` SSG (`prerender = true`), render danh sách projects từ Google Sheets data (sheet "Projects", schema D-004 bilingual `_vi`/`_en`). Mỗi project là 1 card. Click card → đi tới `/case-studies/{slug}` (T-022 sẽ build trang chi tiết).

Trang phải đọc được KHÔNG cần JS (PRD S6 — fallback content cho HR). Component card dùng `.astro` (zero-JS), KHÔNG Preact island.

## Files affected
- `app/src/pages/projects/index.astro` (create)
- `app/src/components/ProjectCard.astro` (create — Astro component, KHÔNG Preact)

## Reference patterns trong repo
- `app/src/lib/sheets.ts` — `fetchSheet<'Projects'>()` đã có, dùng nguyên ở frontmatter
- `app/src/components/Hero.astro` — pattern bilingual prop `_vi`/`_en` + lang switch
- `app/src/pages/index.astro` — pattern landing SSG có prerender + fetchSheet ở frontmatter

## Acceptance criteria (sync với TASKS.md T-021)
- [ ] SSG, `export const prerender = true` ở top file
- [ ] Render danh sách projects từ Sheets data (gọi `fetchSheet('Projects')` ở frontmatter)
- [ ] Mỗi card hiển thị: title (`title_vi`/`title_en` per locale), description, tags, date
- [ ] Click vào card → link `/case-studies/{slug}` (slug field từ Sheets)

## Verification
1. `cd app && npm run build` → 0 error
2. Số file `dist/projects/index.html` render đúng số projects trong Sheets
3. `grep -c '<script' dist/projects/index.html` → 0 (zero-JS guarantee)
4. Disable JS → cards vẫn click được + nội dung đọc được full
5. Lighthouse Performance ≥95 trên `/projects/`
6. Bundle delta: `du -h dist/_astro/*.js` không tăng (vì Astro component, không Preact island)

## Out of scope (KHÔNG làm)
- Trang chi tiết case study → T-022
- Filter / search projects → ngoài scope
- Animation card hover phức tạp → giữ subtle, hover state CSS only
- Tag click → filter projects → defer

## Branch + commit
- Branch: `antigravity/T-021-projects-listing`
- Commits gợi ý: `feat: scaffold /projects SSG route (T-021)` → `feat: render ProjectCard with bilingual props (T-021)` → `feat: link cards to case study slugs (T-021)`

START.
````

---

### T-022 — Case Study dynamic routes

**Base template**: MT-4 (Antigravity)
**Assigned**: ANTIGRAVITY
**Depends on**: T-011 (done), T-010 (done) — soft on T-021 (link target)

**Body**:

````
# Task: T-022 — Trang Case Study chi tiết (SSG, dynamic routes)

## Task spec
Build dynamic route `[slug].astro` cho case studies. Mỗi case study render ở build time (SSG) qua `getStaticPaths()`. Layout long-form: problem → solution → result → tech_stack. Typography rõ ràng cho long-read. SEO-ready với JSON-LD structured data.

Mục tiêu: HR đọc được TOÀN BỘ nội dung case study mà KHÔNG cần tương tác (no JS, no chat) — PRD S6.

## Files affected
- `app/src/pages/case-studies/[slug].astro` (create — dynamic route)
- `app/src/components/CaseStudySection.astro` (create — optional helper component, scope mỗi section problem/solution/result)

## Reference patterns trong repo
- `app/src/lib/sheets.ts` — `fetchSheet<'CaseStudies'>()` (schema D-004 bilingual)
- `app/src/pages/projects/index.astro` (T-021) — pattern fetchSheet + render từ Sheets
- Astro docs: `getStaticPaths()` returning `{ params, props }` for build-time data

## Acceptance criteria (sync với TASKS.md T-022)
- [ ] Dynamic route dùng `getStaticPaths()` lấy slugs từ Sheets sheet "CaseStudies"
- [ ] Mỗi case study hiển thị đầy đủ: problem, solution, result, tech_stack (per locale `_vi`/`_en`)
- [ ] Có structured data (JSON-LD) cho SEO — schema.org/`Article` hoặc `TechArticle`
- [ ] Long-form, dễ đọc: max-width content ~65ch, line-height ≥1.6, paragraph spacing rõ

## Verification
1. `cd app && npm run build` → mỗi slug tạo HTML file riêng trong `dist/case-studies/`
2. Mở 1 case study trong browser → JSON-LD validate qua https://validator.schema.org → no error
3. Disable JS → toàn bộ content đọc được, link điều hướng OK
4. Reading test: 1 fellow engineer đọc 1 case study từ đầu tới cuối, tóm tắt được problem→result trong 30 giây
5. Lighthouse Performance ≥95 trên 1 case study URL
6. `grep -c '<script' dist/case-studies/{first-slug}.html` → 0

## Out of scope
- Filter / sort case studies → ngoài scope
- Comments / interactive elements → vi phạm "static fallback 100%"
- Image gallery → nếu Sheets có URL image, render `<img>` static. KHÔNG lightbox.
- Related case studies sidebar → defer

## Branch + commit
- Branch: `antigravity/T-022-case-study-dynamic`
- Commits gợi ý: `feat: scaffold getStaticPaths from Sheets (T-022)` → `feat: render long-form case study layout (T-022)` → `feat: add JSON-LD TechArticle structured data (T-022)`

START.
````

---

### T-030 — Terminal UI Preact island

**Base template**: MT-4 (Antigravity)
**Assigned**: ANTIGRAVITY
**Depends on**: T-001 (done). T-024 (Chat FAB scaffold) đang `todo` — check status trước khi start; nếu T-024 chưa done, phải coordinate hoặc skip pattern dùng ChatWidget.
**Will block**: T-031 (API wiring), T-032 (Generative UI parts), T-041 (bundle audit)

**Body**:

````
# Task: T-030 — Terminal UI component (Preact island)

## Task spec
Build Terminal-style UI component dạng Preact island (`client:visible` directive). Task này build UI sẵn-sàng-cho-API — KHÔNG wire AI thật, T-031 sẽ làm phần đó.

UX:
- Input field có prompt indicator `>` + caret nhấp nháy (CSS animation)
- Output area render streaming text từng chunk (signal/state re-render incremental)
- Welcome message giải thích cách dùng + 3 gợi ý câu hỏi mẫu
- Accessible: keyboard navigation, aria-labels, focus trap khi mở

**Bundle warning**: Task này chiếm ~15-25KB của 60KB cap. Audit kỹ — đo bundle gzipped trước khi push PR.

## Files affected
- `app/src/components/Terminal.tsx` (create — Preact root component)
- `app/src/components/TerminalInput.tsx` (create — input field + history navigation arrow ↑/↓)
- `app/src/components/TerminalOutput.tsx` (create — output area + streaming chunk render)

## Reference patterns trong repo
- `app/src/components/ChatWidget.tsx` (T-024 — nếu đã done, reuse pattern Preact island. Nếu chưa, dùng pattern từ tasks done khác)
- `app/src/components/PlexusBackground.astro` (T-023) — pattern `prefers-reduced-motion` guard
- `app/src/layouts/Layout.astro` — pattern mount island với `client:visible`

## Acceptance criteria (sync với TASKS.md T-030)
- [ ] Preact component, `client:visible` directive (NOT `client:load` — phải lazy)
- [ ] Input field với prompt indicator `>` + caret nhấp nháy CSS
- [ ] Output area hiển thị streaming text (từng chunk, incremental re-render)
- [ ] Hỗ trợ Generative UI: render component động từ AI response (props: `dataParts: DataPart[]`).
  - **Lưu ý**: Component types implement ở T-032; task này chỉ define shape `DataPart` interface + cho phép pass-through render với fallback `<pre>{JSON.stringify(part)}</pre>`
- [ ] Welcome message + 3 gợi ý câu hỏi mẫu
- [ ] Accessible: `role="region"`, `aria-label="Terminal interface"`, focus trap khi mở, keyboard ↑/↓ duyệt history

## Verification
1. `cd app && npm run build` → 0 error
2. Mở page mount Terminal → gõ "help" → hiển thị danh sách commands (mock data OK)
3. Mock data stream (`yield` chunk mỗi 50ms) → text hiển thị từng ký tự, KHÔNG chờ toàn bộ
4. Bundle delta: `du -h app/dist/_astro/Terminal*.js | awk '{print $1}'` — record vào PR description (target <25KB raw, gzipped <10KB)
5. Mobile (375px): full-screen overlay; Desktop (1440px): floating panel ~480×640
6. Esc đóng terminal; Ctrl+L clear scrollback; ↑/↓ duyệt history input
7. Disable JS → vùng terminal hiển thị `<noscript>` fallback link "View static CV at /projects"

## Out of scope (sẽ làm task khác)
- API wiring với Gemini → T-031
- Structured component types (ProjectCard, SkillChart, TimelineEvent) → T-032
- Error retry logic → T-040
- Markdown render trong output → cứ render plain text + `<pre>` cho code block, full markdown defer

## Branch + commit
- Branch: `antigravity/T-030-terminal-ui`
- Commits per AC: `feat: scaffold Terminal Preact island (T-030)` → `feat: streaming render TerminalOutput (T-030)` → `feat: TerminalInput with history nav (T-030)` → ...

START.
````

---

### T-031 — API route AI orchestrator

**Base template**: MT-5 (Claude Code)
**Assigned**: ANTIGRAVITY | CLAUDE_CODE (CC nếu cần backend depth)
**Depends on**: T-011 (done), T-030 (UI cần ready để test)
**Will block**: T-032 (Generative UI parts), T-040 (retry logic on this), T-050 (E2E test)

**Body**:

````
# Task: T-031 — API route cho Terminal — AI orchestrator

## Task spec
Build POST endpoint `/api/chat`. Nhận `{ message: string, history: Message[] }`, inject toàn bộ CV + projects data làm system prompt (in-context RAG via Gemini 1M token), stream response về Terminal UI (T-030).

Cần structured output cho query cụ thể ("list projects", "show skills") để T-032 render Generative UI components.

Rate limit 20 req/phút/IP (in-memory `Map<ip, { count, resetAt }>` — KHÔNG dùng Redis vì $0/tháng).

**Quan trọng**: API route MUST có `export const prerender = false` (D-003 — Astro 6 default `output: 'static'`, cần explicit SSR cho API).

## Files affected
- `app/src/pages/api/chat.ts` (create)

## Trước khi code (research nếu chưa rõ)
- Đọc Vercel AI SDK docs cho `streamText()` vs `createUIMessageStream()` — chọn 1, ghi rationale trong commit message đầu (MT-1 Research Scanner nếu cần)
- Verify Gemini provider package: `@ai-sdk/google` — nếu chưa có trong `app/package.json`, escalate dep-add (audit size <5MB)

## Reference utilities trong repo (reuse)
- `app/src/lib/sheets.ts` — `fetchSheet()` để load Profile + Projects + CaseStudies cho system prompt
- `app/src/lib/cache.ts` — wrap fetch với SWR (system prompt context có thể cache 5min)
- `app/src/lib/retry.ts` — sẽ có ở T-040; nếu chưa, KHÔNG block: throw thẳng + ghi note "T-040 sẽ wrap với withRetry"

## Acceptance criteria (sync với TASKS.md T-031)
- [ ] POST endpoint nhận `{ message: string, history: Message[] }` (validate manual hoặc với zod nếu thêm dep được approve)
- [ ] Dùng Vercel AI SDK `streamText()` HOẶC `createUIMessageStream()` (chọn 1, ghi rationale)
- [ ] System prompt inject CV + projects data (in-context RAG, KHÔNG vector DB)
- [ ] Model: Gemini 1.5 Flash (`google('gemini-1.5-flash')`)
- [ ] Structured output cho query: "list projects" → JSON array, "show skills" → JSON object
- [ ] Response time P95 <3 giây (đo trên 10 request mock)
- [ ] Rate limit: max 20 req/phút/IP (in-memory Map)

## Verification
1. `cd app && npm run build` → 0 error; `du -sh .vercel/output/functions/` <50MB
2. `npm run dev` → `curl -X POST http://localhost:4321/api/chat -d '{"message":"What projects?","history":[]}' -H 'Content-Type: application/json'` → stream response chứa thông tin projects chính xác từ Sheets
3. Spam curl 25 request liền → request 21+ trả 429 + header `Retry-After: 60`
4. P95 latency: bench 10 request, sort, lấy index 9 → <3s
5. `npm ls react` → empty (verify Vercel AI SDK không kéo React vô)
6. Test query "list projects" → response chứa `data: { type: 'project_list', items: [...] }` JSON parsable

## Out of scope (sẽ làm task khác)
- Retry / exponential backoff khi Gemini fail → T-040
- Component render Generative UI → T-032 (task này chỉ trả structured JSON)
- Production deploy + Lighthouse audit → T-050
- Persist history server-side → ngoài scope, history giữ ở client sessionStorage

## Branch + commit
- Branch: `claude-code/T-031-api-orchestrator`
- Commits: `feat: scaffold /api/chat with prerender=false (T-031)` → `feat: inject Sheets data as system prompt (T-031)` → `feat: stream via Vercel AI SDK Gemini (T-031)` → `feat: in-memory rate limit per IP (T-031)`

START. Confirm "UNDERSTOOD" + ghi rõ chọn `streamText` hay `createUIMessageStream` + lý do trước khi đụng file.
````

---

### T-032 — Generative UI data parts

**Base template**: MT-4 (Antigravity — vì task chủ yếu UI side)
**Assigned**: ANTIGRAVITY
**Depends on**: T-030 (Terminal UI), T-031 (API trả structured JSON)
**Will block**: T-050 (E2E)

**Body**:

````
# Task: T-032 — Generative UI data parts (structured components)

## Task spec
AI (T-031) trả về structured data parts (JSON `{ type: 'project_card', data: {...} }`). Terminal (T-030) map type → Preact component render. Task này implement 3 component types: `project_card`, `skill_list`, `timeline`. Mỗi component có fallback text nếu render lỗi.

**Code-split bắt buộc**: component nào chưa render thì KHÔNG ship JS. User hỏi "show projects" mới load `ProjectCard.tsx` qua dynamic import.

**Bundle target**: 3 component tổng ≤ 8KB gzipped.

## Files affected
- `app/src/components/ui/ProjectCard.tsx` (create — Preact)
- `app/src/components/ui/SkillChart.tsx` (create — Preact, chart đơn giản KHÔNG dùng chart lib; CSS bar chart hoặc SVG inline)
- `app/src/components/ui/TimelineEvent.tsx` (create — Preact)
- `app/src/components/Terminal.tsx` (modify — thêm dynamic import map `{ project_card: () => import('./ui/ProjectCard') }`)

## Reference patterns trong repo
- `app/src/components/Terminal.tsx` (T-030) — pattern Preact island
- `app/src/lib/sheets.ts` — type definitions cho `ProjectData`, `ProfileEntry` etc. có thể reuse cho component prop type
- Astro docs / Vite docs: dynamic import + code splitting

## Acceptance criteria (sync với TASKS.md T-032)
- [ ] AI trả data parts (JSON) → Terminal map type → Preact component (registry kiểu `{ project_card: () => import('./ui/ProjectCard') }`)
- [ ] 3 component types implement: `project_card`, `skill_list`, `timeline`
- [ ] Mỗi component có fallback text nếu render lỗi (try/catch wrap render hoặc Preact ErrorBoundary)
- [ ] Code-split đúng: `npm run build` → mỗi component file `.js` riêng trong `dist/_astro/`; first load không kéo cả 3

## Verification
1. `cd app && npm run build` → 3 file `*.js` riêng cho 3 component
2. Hỏi terminal "Show my projects" → render `ProjectCard` components, Network tab thấy `ProjectCard.*.js` lazy-load
3. Hỏi "What's your tech stack?" → render `SkillChart`, KHÔNG load `ProjectCard.*.js`
4. Mock data part lỗi (missing field) → fallback text hiển thị, KHÔNG crash terminal
5. Bundle delta tổng: `du -h dist/_astro/{ProjectCard,SkillChart,TimelineEvent}*.js` — sum raw KB, ước gzip ratio ~0.4 → tổng gzipped ≤8KB
6. Lighthouse Performance ≥95 vẫn pass sau khi thêm 3 component

## Out of scope
- Component types khác ngoài 3 type trên → defer (vd `code_block`, `image_gallery`)
- Animation enter/exit của card → giữ subtle CSS only (`animate-fadeUp` nếu đã có trong global.css)
- A11y deep cho tabular SkillChart → `role="article"` + label cơ bản đủ

## Branch + commit
- Branch: `antigravity/T-032-generative-ui-parts`
- Commits per AC: `feat: ProjectCard component with fallback (T-032)` → `feat: SkillChart pure CSS bars (T-032)` → `feat: TimelineEvent component (T-032)` → `feat: Terminal dynamic import registry (T-032)`

START.
````

---

### T-040 — Error handling + retry

**Base template**: MT-5 (Claude Code)
**Assigned**: CLAUDE_CODE
**Depends on**: T-011 (done), T-031

**Body**:

````
# Task: T-040 — Error handling + Exponential backoff cho external APIs

## Task spec
Build hàm generic `withRetry(fn, opts)`: base delay 1s, factor 2, max 3 retries. Phân biệt status code:
- 429 (rate limit) → retry
- 500/502/503 (transient) → retry
- 4xx khác (400/401/403/404) → throw NGAY, KHÔNG retry

Áp dụng vào Sheets client + Gemini API client. Refactor backoff cũ trong `sheets.ts` (T-011 đã có basic) → dùng helper generic.

**KHÔNG swallow error**. Mỗi retry phải `console.warn`. Cuối retry vẫn fail → throw để caller biết.

## Files affected
- `app/src/lib/retry.ts` (create — generic withRetry helper)
- `app/src/lib/sheets.ts` (modify — wrap fetch call với withRetry, thay backoff cũ)
- `app/src/pages/api/chat.ts` (modify — wrap Gemini SDK call với withRetry, từ T-031)

## Trước khi code
- Đọc backoff hiện có trong `app/src/lib/sheets.ts` (T-011) — refactor pattern đó ra `retry.ts` generic. KHÔNG viết từ scratch nếu T-011 đã có pattern dùng được.

## Reference utilities trong repo
- Existing exponential backoff trong `app/src/lib/sheets.ts` (T-011) — base 1s, max 3 retries (per T-011 AC)

## Acceptance criteria (sync với TASKS.md T-040)
- [ ] `withRetry(fn, opts)` generic: base delay 1s, factor 2, max 3 retries (default; opts override được)
- [ ] Phân biệt: 429 → retry, 500 → retry, 4xx khác → throw ngay không retry
- [ ] `app/src/lib/sheets.ts` dùng `withRetry` (refactor backoff cũ → dùng helper)
- [ ] `app/src/pages/api/chat.ts` Gemini call dùng `withRetry`
- [ ] Log mỗi retry attempt: `console.warn('[retry] attempt N/3 for {fn name} after {delay}ms')` — không silent

## Verification
1. `cd app && npm run build` → 0 error
2. Mock fetch trả 429 liên tục (test bằng MSW hoặc fetch stub) → `withRetry` retry 3 lần (delay 1s → 2s → 4s) rồi throw
3. Mock fetch trả 200 ở lần thứ 2 → trả kết quả sau 1 retry, log đúng 1 warn
4. Mock fetch trả 401 → throw NGAY (lần 1), KHÔNG retry, KHÔNG log warn
5. Code coverage cho `retry.ts` ≥80% (nếu test framework có; nếu không, manual smoke 5 trường hợp)
6. Verify `sheets.ts` test cũ (nếu có) vẫn pass sau refactor

## Out of scope
- Retry cho fetch trong frontend (chat UI) → keep simple, frontend chỉ show error toast
- Distributed rate limit → in-memory đủ, $0/tháng
- Circuit breaker pattern → overkill cho portfolio scale
- Logging tới external service (Sentry, LogRocket) → vi phạm $0/tháng

## Branch + commit
- Branch: `claude-code/T-040-retry-logic`
- Commits: `feat: extract withRetry generic helper (T-040)` → `refactor: sheets.ts use withRetry (T-040)` → `feat: chat.ts wrap Gemini call with retry (T-040)` → `test: retry helper unit tests (T-040)`

START.
````

---

### T-041 — Bundle size audit

**Base template**: MT-5 (Claude Code)
**Assigned**: CLAUDE_CODE
**Depends on**: T-030, T-031

**Body**:

````
# Task: T-041 — Bundle size audit + optimization

## Task spec
Audit toàn bộ bundle: serverless function size, client JS islands, dependencies. Verify đáp ứng 3 ngưỡng:
- Serverless bundle <50MB uncompressed (PRD S4)
- Client JS <60KB gzipped tổng (CLAUDE.md hard cap)
- Không có React, không có dep >5MB

Nếu vượt: identify culprit + propose tối ưu (tree-shake, lazy load, swap lib). KHÔNG tự thay lib core (Astro / Preact / Gemini SDK / Vercel adapter) — escalate.

**Task này CHỈ audit + tối ưu**, KHÔNG thêm feature. Phát hiện vi phạm → escalate trước, KHÔNG tự fix.

## Files affected
- `app/astro.config.mjs` (modify — config tree-shake / `vite.optimizeDeps` nếu cần)
- `app/package.json` (modify — chỉ nếu loại bỏ dep, KHÔNG thêm)

## Trước khi code
- Đọc `app/astro.config.mjs` hiện có
- Đọc `app/package.json` deps list
- Run `npm run build` baseline → record số liệu trước

## Reference patterns
- Vercel docs: bundle size analysis
- Vite docs: `build.rollupOptions.output.manualChunks` cho code split
- Astro docs: Islands Architecture bundle behavior

## Acceptance criteria (sync với TASKS.md T-041)
- [ ] `cd app && npm run build && du -sh .vercel/output/functions/` → <50MB
- [ ] `npm ls react` → empty (chỉ Preact)
- [ ] Tree-shaking xác nhận: Vite build report không có "unused module imported"
- [ ] Không dùng package nào >5MB uncompressed (verify: `du -sh node_modules/<pkg>` cho top 10 deps)

## Verification
1. `du -sh app/.vercel/output/functions/` → <50MB
2. `cd app && npm ls --all 2>&1 | grep -i '^[├│└]' | grep -i react` → no output (verify "react" KHÔNG xuất hiện trong dep tree, chỉ Preact)
3. `du -sh app/node_modules/* | sort -hr | head -10` → top 10 deps, không có cái >5MB
4. `du -h app/dist/_astro/*.js | awk '{sum+=$1}END{print sum"KB"}'` → tổng raw <150KB (gzipped ~60KB)
5. PR description chứa: bảng so sánh **trước/sau** optimize (size deltas) — bắt buộc

## Out of scope
- Performance optimization runtime (cache, prefetch, service worker) → ngoài scope, chỉ audit STATIC bundle
- A/B test khi swap lib → đề xuất 1 lib + tradeoff, escalate user chọn
- Image optimization (WebP, responsive srcset) → defer sang task riêng

## Branch + commit
- Branch: `claude-code/T-041-bundle-audit`
- Commits: `chore: audit bundle baseline (T-041)` → `perf: tree-shake unused module X (T-041)` → ...
- Nếu không cần fix gì (đã pass): commit `chore: bundle audit pass — within budget (T-041)` + report

START.
````

---

### T-043 — AI-Fluent Documentation

**Base template**: MT-5 (light — content task)
**Assigned**: MANUAL (PhuocLoi viết) — agent có thể assist draft / proofread
**Depends on**: T-022 (Case Study route)

**Body**:

````
# Task: T-043 — AI-Fluent Documentation (1-2 blog posts/case studies)

> **MANUAL task** — PhuocLoi tự viết. Agent (Claude Code / Antigravity) có thể assist bằng cách draft section structure hoặc proofread, KHÔNG tự generate full content (sẽ ra giọng generic, mất authenticity).

## Task spec
Viết 1-2 bài blog/case study giải thích kiến trúc THE INVESTIGATOR TERMINAL. Mục đích: HR / fellow engineer đọc → tin được PhuocLoi đã design + build hệ thống thật, không phải copy template.

## Required content elements
- **Architecture diagram**: ASCII art OK, hoặc Mermaid (Astro 6 hỗ trợ Mermaid markdown nếu add `astro-rehype-mermaid`; KHÔNG embed JS-heavy diagram lib)
- **Trade-offs section**: tại sao Astro+Preact thay vì Next.js+React (ref D-001); tại sao Gemini in-context thay vì vector DB (ref D-001 non-goal)
- **Lessons learned**: 2-3 điểm thực tế đã sai/sửa trong process (ref D-003 Astro 6 hybrid removed, D-005 design pivot)
- **Code snippets thực tế**: KHÔNG pseudocode. Copy từ file thật trong `app/src/lib/sheets.ts`, `app/src/pages/api/chat.ts`, etc.

## Files affected (chọn 1 path)

**Option A — Astro content collections (markdown)**:
- `app/src/content/blog/{slug}.md` (create)
- `app/src/content/config.ts` (modify nếu chưa có schema "blog")
- `app/src/pages/blog/[slug].astro` (create — render markdown)

**Option B — Sheets-based (đồng nhất CV/projects)**:
- Thêm sheet "Blog" trong Google Sheets (MANUAL task của PhuocLoi)
- `app/src/lib/sheets.ts` (modify — thêm `BlogPost` type + `fetchSheet<'Blog'>`)
- `app/src/pages/blog/[slug].astro` (create — render từ Sheets như case studies T-022)

**Recommendation**: Option B đồng nhất pattern hiện có (Sheets is canonical CMS). Nhưng nếu PhuocLoi muốn markdown để dễ viết long-form + commit version control → Option A acceptable. Decide trước khi code, log vào DECISIONS.md (D-006?).

## Acceptance criteria (sync với TASKS.md T-043)
- [ ] Ít nhất 1 bài viết giải thích kiến trúc dự án này
- [ ] Bài viết có: architecture diagram, tradeoffs, lessons learned
- [ ] Code snippets thực tế (không pseudocode) — verify bằng `grep` file path khớp với code thật trong `app/`

## Verification
1. Bài viết render đúng trên site (`npm run build` pass, page load OK)
2. Đọc test: 1 fellow engineer đọc xong nói được "tao hiểu hệ thống này làm gì + tradeoff cụ thể"
3. Có depth kỹ thuật: KHÔNG chỉ "tôi dùng Astro vì nó nhanh" — phải có lý do cụ thể (D-001 rationale)
4. Code snippet test: paste vào file `.ts` thật → typecheck pass (verify snippet không bị lỗi syntax / outdated)
5. Lighthouse Performance ≥95 trên page blog post

## Out of scope
- SEO optimization deep (target: discoverable, không viral)
- Multi-language post (chỉ tiếng Anh hoặc tiếng Việt — pick 1, ngược với UI bilingual)
- Video / podcast → ngoài scope
- Comments section → vi phạm static fallback + $0/tháng

## Workflow gợi ý (nếu Claude Code assist)
1. Coordinator (PhuocLoi) viết outline 5-7 H2 sections + key message muốn truyền
2. Claude Code draft từng section dựa outline + grep code thật trong `app/src/`
3. PhuocLoi review + rewrite với voice cá nhân
4. Final pass: agent proofread typo + check code snippet validity (compile / build pass)

KHÔNG để agent tự generate post từ A→Z (giọng generic, mất authenticity — vi phạm purpose của portfolio).

## Branch + commit (nếu code path Option A/B)
- Branch: `claude-code/T-043-docs-{slug}` hoặc `human/T-043-docs-{slug}`
- Commits: `docs: scaffold blog content collection (T-043)` → `docs: write architecture post draft (T-043)` → `docs: code snippet validation (T-043)`

START (nếu PhuocLoi muốn assist).
````

---

### T-050 — E2E smoke + Lighthouse

**Base template**: MT-5 (Claude Code) + manual checklist
**Assigned**: CLAUDE_CODE (script) + MANUAL (Lighthouse production audit)
**Depends on**: T-040, T-041, T-042

**Body**:

````
# Task: T-050 — End-to-end smoke test + Lighthouse audit

## Task spec
Build smoke test script verify:
- Tất cả SSG pages trả 200 (homepage `/`, `/projects`, `/case-studies/{slug}`, `/blog/{slug}` nếu T-043 done)
- `/api/chat` POST endpoint trả stream response chứa data thật từ Sheets
- Console error count = 0 trên production
- Gemini quota usage <250 req/ngày (track qua API response header hoặc local counter log file)

Lighthouse audit MANUAL bằng PageSpeed Insights hoặc Lighthouse CLI — script không tự run Lighthouse (Vercel Hobby production URL OK).

**Quan trọng**: Test phải chạy trên PRODUCTION URL (Vercel deploy), KHÔNG localhost. Lighthouse local không match production performance.

## Files affected (chọn 1 approach)

**Option A — Vitest + Playwright** (test framework, ~5MB add):
- `app/tests/smoke.test.ts` (create)
- `app/package.json` (modify — thêm `vitest` + `@playwright/test` devDeps)
- `app/vitest.config.ts` (create)

**Option B — Bash + curl** (zero dep add):
- `app/scripts/smoke.sh` (create)

**Recommendation**: Option B nếu chỉ smoke 5-10 endpoint (đủ scope). Option A nếu cần browser-level test (console error, network HAR). Decide based on scope; default Option B vì $0/tháng + zero new dep.

## Reference patterns
- `app/src/lib/sheets.ts` — schema để biết expected response shape của `/api/chat` data part
- Vercel docs: production URL pattern (`{branch}-{project}.vercel.app` hoặc custom domain)

## Acceptance criteria (sync với TASKS.md T-050)
- [ ] Tất cả SSG pages trả 200 (script verify mỗi URL trong list)
- [ ] `/api/chat` trả stream response (script POST + verify chunk-encoded response, content-type `text/event-stream` hoặc `application/x-ndjson`)
- [ ] Lighthouse Performance ≥95 trên trang tĩnh (run trên 3 page: home, /projects, 1 case study)
- [ ] Lighthouse Accessibility ≥90 trên cùng 3 page
- [ ] Không lỗi console nào trên production (verify bằng Playwright headless nếu Option A; manual DevTools nếu Option B)
- [ ] Gemini API quota check: <250 req/ngày under normal use (tracking method ghi rõ trong script comment)

## Verification
1. Script chạy trên production URL → exit code 0
2. Output: bảng pass/fail cho từng page + Lighthouse score (paste vào PR description)
3. Run sau khi production deploy 1h (cache warm) — không phải fresh deploy
4. PR description: paste output script + screenshot Lighthouse cho 3 page

## Manual companion checklist (PhuocLoi run sau script pass)
- [ ] PageSpeed Insights `https://pagespeed.web.dev/analysis?url=<prod-url>` → Performance ≥95, Accessibility ≥90 trên cả Mobile + Desktop tab
- [ ] Test 5 device thật (iPhone Safari, Android Chrome, Desktop Chrome/Safari/Firefox) — trang load OK, terminal mở được, chat trả response
- [ ] HR-friendly test: gửi link cho 1 non-technical friend (vd người nhà), ask "PhuocLoi làm gì?" → họ tóm tắt được trong 30s
- [ ] Bilingual switch: VI ↔ EN → toàn bộ content swap đúng, KHÔNG sót string nào tiếng còn lại

## Out of scope
- Load test / stress test → vi phạm S7 baseline (50 visitors/day, không cần load test)
- Visual regression test → ngoài scope, manual review screenshot đủ
- A11y deep audit (axe + comprehensive keyboard testing) → Lighthouse Accessibility 90 đủ cho portfolio
- Continuous monitoring (uptime tracker) → vi phạm $0/tháng nếu paid; nếu free tier OK thì agent có thể đề xuất nhưng KHÔNG tự setup

## Branch + commit
- Branch: `claude-code/T-050-e2e-smoke`
- Commits: `test: smoke script for SSG pages (T-050)` → `test: chat API streaming verify (T-050)` → `test: console error capture (T-050)` → `docs: T-050 manual checklist runbook (T-050)`

START. Confirm chọn Option A hay B + lý do trước khi đụng file.
````

---

## Maintenance notes

### Khi thêm task mới (T-XXX)
1. Tạo block trong `TASKS.md` theo schema canonical (12 fields)
2. Quyết định base template: MT-4 (UI/frontend) hoặc MT-5 (backend/refactor) hoặc lai
3. Trong file này:
   - Thêm anchor link trong section [Index](#index)
   - Thêm section per-task prompt: copy template body + fill Task spec / Files / AC / Verification / Out of scope
4. Trong `TASKS.md`: thêm 1 dòng `Prompt:     → docs/PROMPTS.md#t-xxx` vào task block (ngay trước `Updated:`)

### Khi sửa AC (Acceptance Criteria)
- `TASKS.md` là **TRUTH SOURCE**. Sửa ở đó trước.
- Sau đó update section "Acceptance criteria (sync với TASKS.md ...)" trong prompt tương ứng ở file này.
- Drift detection: agent thực thi prompt + báo "AC trong prompt khác TASKS.md" → prompt sai, fix prompt (commit `docs: sync T-XXX prompt with TASKS.md AC`).

### Khi stack version đổi (vd Astro 7)
- Update string `Astro 6.1.8` trong Common Block + tất cả MT-X templates (search & replace).
- Verify với `app/package.json` thật.
- Nếu major version change (vd 6→7), check breaking changes có ảnh hưởng prompt không (vd config syntax `output: 'static'` đổi).

### Khi decision mới được approve (D-006+)
- Append entry vào `DECISIONS.md` (append-only)
- Update Common Block "Decision log refs nhanh" thêm 1 dòng D-006
- Nếu decision đó loại bỏ / thêm constraint → update Common Block "Hard constraints"
