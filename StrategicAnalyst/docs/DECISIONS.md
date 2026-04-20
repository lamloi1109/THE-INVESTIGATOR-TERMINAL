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
