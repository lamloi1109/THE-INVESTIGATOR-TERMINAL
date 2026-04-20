# Agent Onboarding — THE INVESTIGATOR TERMINAL

Bất kể bạn là agent gì (Antigravity, Claude Code, hoặc PhuocLoi tự code), khi mở session mới trong project này, đọc đúng thứ tự sau. **Không được skip.**

---

## Step 1 — Load context (~5 phút)

Đọc theo thứ tự:

1. `StrategicAnalyst/CLAUDE.md` — repository purpose, core context, risks, hard constraints
2. `StrategicAnalyst/docs/PRD.md` — success criteria đo được, non-goals, tech stack
3. `StrategicAnalyst/docs/TASKS.md` — task board với state machine, tìm task phù hợp của mình
4. `StrategicAnalyst/docs/DECISIONS.md` — đọc 5 entry cuối để nắm decision kiến trúc gần nhất
5. `StrategicAnalyst/docs/reports/{your-agent}.md` — session trước mình làm đến đâu, có blocker gì chưa resolve

Nếu 1 trong 5 file trên thiếu / rỗng / không parse được → **STOP**, escalate coordinator (PhuocLoi).

---

## Step 2 — Claim task

1. Trong `TASKS.md`, tìm task có:
   - `Status: todo` (hoặc `claimed` với `Owner` là bạn)
   - `Assigned` khớp với agent bạn. Ví dụ: Antigravity chỉ lấy `ANTIGRAVITY` hoặc `ANTIGRAVITY | CLAUDE_CODE`
   - Tất cả `Depends on` đã ở status `done`
2. Kiểm tra overlap `Files` với task khác đang `in_progress`:
   - Nếu có → **BLOCKED**, escalate coordinator. Không race.
3. Update task trong TASKS.md:
   - `Status: in_progress`
   - `Owner: {your-agent-name}` (ví dụ `antigravity` / `claude-code` / `human`)
   - `Branch: {agent}/T-{id}-{short-slug}`
   - `Updated: YYYY-MM-DD HH:MM by {agent}`
4. Commit: `chore(coord): claim T-XXX for {agent}`

---

## Step 3 — Create branch

Convention: `{agent}/T-{id}-{short-slug}`

Ví dụ:
- `antigravity/T-001-astro-scaffold`
- `claude-code/T-040-retry-logic`
- `human/T-002-vercel-setup`

```bash
git checkout main
git pull
git checkout -b antigravity/T-001-astro-scaffold
```

---

## Step 4 — Work

**Project-specific rules (đọc kỹ):**

1. **Không dùng React.** Stack dùng Preact (D-001). Nếu library bạn định dùng chỉ có React version → dùng `preact/compat` alias hoặc escalate.
2. **Không thêm dependency > 5MB uncompressed** mà không check với coordinator. Bundle cap 50MB là S4, cực kỳ tight.
3. **Không tạo vector DB / RAG framework riêng.** Gemini 1M token in-context RAG đã được chốt. Vi phạm non-goal.
4. **Không animation 3D / particle / visual gimmick.** Xem non-goals trong PRD.md.
5. **Không mock data giả** rồi coi như xong. Data thật đến từ Google Sheets (T-010). Nếu T-010 chưa có → dùng fixtures đánh dấu rõ `// FIXTURE — replace when T-010 done` và ghi vào report.

**Rules chung:**

6. **Chỉ đụng file trong `Files` của task.** Nếu cần đụng thêm → update TASKS.md trước, kiểm overlap.
7. **Commit nhỏ, 1 commit per acceptance criterion.** Format: `[type]: [what] (T-XXX)`. Ví dụ: `feat: init astro with preact integration (T-001)`.
8. **Gặp decision kiến trúc** (chọn thư viện, đổi pattern, etc.) → append DECISIONS.md **trước** khi code theo decision đó.
9. **Không swallow exception** (`except: pass`, `catch {}` rỗng).
10. **Không monkey-patch code của agent khác.** Thấy bug ngoài scope → tạo task mới trong TASKS.md, không tự fix.

---

## Step 5 — End of session: ghi report

Append vào `StrategicAnalyst/docs/reports/{your-agent}.md`:

```markdown
## Session YYYY-MM-DD HH:MM

**Tasks touched:** T-XXX, T-YYY
**Status changes:**
- T-XXX: in_progress → review
- T-YYY: todo → in_progress

**Commits:**
- abc1234 feat: init astro config (T-001)
- def5678 feat: add preact integration (T-001)

**Decisions made:** D-003 (or "none")

**Blockers:** [any? or "none"]

**Next step for next session:**
[Cụ thể: "Hoàn thành AC cuối của T-001 về Vercel adapter"]
```

Commit: `chore(coord): session report {agent} YYYY-MM-DD`.

---

## Step 6 — Finish task

Khi tất cả AC của task đã check:

1. Update task: `Status: review`, giữ `Owner`.
2. Push branch, tạo PR với mô tả `Closes T-XXX`.
3. Ghi vào session report trước khi kết thúc.
4. **Không tự merge.** Coordinator (PhuocLoi) review + merge. Sau merge, coordinator đổi status → `done` và move task xuống section "Done".

---

## Luật bất khả xâm phạm

1. Không đụng file không thuộc task của mình.
2. Không commit thẳng lên `main`. Luôn qua branch + PR.
3. Không edit entry cũ trong DECISIONS.md. Chỉ append.
4. Không skip AC. Không verify được → status = `blocked`, ghi blocker ở `Updated`.
5. Không claim task của agent khác. Nếu `Owner` field không trống và khác bạn → pass.
6. Không deploy production. Vercel deploy là MANUAL (T-002) của PhuocLoi.
7. Không tạo Google Sheets giả. T-010 là MANUAL.
8. Không 2 task cùng file active → BLOCKED, không race.

---

## Khi bí / stuck

- Stuck kỹ thuật → check NotebookLM notebook của project (nếu PhuocLoi đã set up) hoặc Prompt #2 (Technical Audit) trong VibeCoding Flow workflow
- Stuck về scope → đọc lại `PRD.md` phần **Non-Goals**
- Stuck vì 2 lựa chọn → log options vào DECISIONS.md, escalate coordinator chọn
- Stuck vì thiếu info → `Status: blocked`, ghi rõ "cần X để tiếp tục", escalate

---

**Đã đọc xong file này? Confirm với coordinator:**
> *"ONBOARDED. Ready to claim T-XXX ({title}). Branch sẽ là {agent}/T-XXX-{slug}."*

Chờ coordinator approve rồi mới đụng code.
