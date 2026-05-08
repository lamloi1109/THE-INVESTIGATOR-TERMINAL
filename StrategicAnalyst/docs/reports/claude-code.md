# Claude Code — Session Reports

> Append-only. Xem template ở `reports/README.md`.

---

(Chưa có session nào trước T-031 trong file này.)

---

## Session 2026-05-06 — T-031 API route cho Terminal

**Tasks touched:** T-031

**Status changes:**
- T-031: todo → in_progress → review

**Branch:**
- `codex-next-task-not-t30`

**Done:**
- [x] Added `app/src/pages/api/chat.ts` with `POST { message, history }`
- [x] Wired Vercel AI SDK `streamText()` through `@ai-sdk/google`
- [x] Default model is `gemini-1.5-flash` with `GEMINI_MODEL` env override
- [x] Injects Profile, Projects, Experience, TechStack, and Education from Sheets into the system prompt
- [x] Adds structured JSON blocks for project, skill, and timeline intents
- [x] Adds in-memory IP rate limiting at 20 requests/minute
- [x] Left T-030 UI files untouched

**Verification:**
- `cd app && npm run build` → pass
- `cd app && npm ls react` → `(empty)`
- `.vercel/output/functions` measured at 23,957,568 bytes (~22.85 MiB), under 50MB

**Blockers / follow-up:**
- Runtime curl and P95 latency need deployed env with `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY` plus existing Sheets env.
