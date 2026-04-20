# Agent Onboarding — READ FIRST

Bất kể bạn là agent gì (Antigravity, Claude Code, hoặc con người tự code), khi mở session mới trong project này, đọc đúng thứ tự sau. **Không được skip.**

---

## Step 1 — Load context (bắt buộc, ~5 phút)

1. Đọc `BRIEF.md` — hiểu mục tiêu, constraints, non-goals.
2. Đọc `TASKS.md` — biết có gì đang active, ai đang làm gì.
3. Đọc 5 entry cuối của `DECISIONS.md` — nắm quyết định kiến trúc mới nhất.
4. Đọc `reports/{your-agent-name}.md` — session trước mình làm đến đâu, có blocker gì chưa resolve.

Nếu 1 trong 4 file trên thiếu / rỗng / không parse được → **STOP, escalate coordinator.** Không được tự đoán.

---

## Step 2 — Claim task

1. Tìm trong `TASKS.md` task có:
   - `status: todo` hoặc `status: claimed` và `owner: {your-agent-name}`
   - `assigned_type` khớp với agent bạn (ví dụ: Antigravity chỉ lấy `ANTIGRAVITY` type)
   - Tất cả `depends_on` đã ở status `done`
2. Kiểm tra `files_touched` của task:
   - Có task active nào khác cùng file không?
   - Nếu có → **BLOCKED**, log vào blocker, escalate.
3. Update task:
   - `status: in_progress`
   - `owner: {your-agent-name}`
   - `branch: {agent}/T-{id}-{slug}`
   - `updated: {now}`
4. Commit update: `chore(coord): claim T-XXX for {agent}`

---

## Step 3 — Create branch

Convention: `{agent}/T-{id}-{short-slug}`

Ví dụ:
- `antigravity/T-001-login-ui`
- `claude-code/T-002-auth-middleware`
- `human/T-003-deploy-config`

```bash
git checkout main
git pull
git checkout -b antigravity/T-001-login-ui
```

---

## Step 4 — Work

**Rules khi code:**
1. **Chỉ đụng file trong `files_touched`.** Nếu cần đụng thêm → stop, update TASKS.md trước, nếu conflict với task khác → escalate.
2. **Commit nhỏ, 1 commit per acceptance criterion.** Message format: `[type]: [what] (T-XXX)`. Ví dụ: `feat: add login form validation (T-001)`.
3. **Gặp quyết định kiến trúc** (chọn thư viện, đổi pattern, etc.) → append vào `DECISIONS.md` TRƯỚC khi code theo quyết định đó.
4. **Không mock data giả rồi coi như xong.** Nếu data thật chưa có → status = `blocked`, ghi blocker.
5. **Không swallow exception** (`except: pass`, `catch {}` rỗng).
6. **Không monkey-patch** code của agent khác. Nếu thấy bug ngoài task của mình → ghi task mới vào TASKS.md, không tự fix.

---

## Step 5 — End of session: ghi report

Append vào `reports/{your-agent-name}.md`:

```markdown
## Session YYYY-MM-DD HH:MM

**Tasks touched:** T-XXX, T-YYY
**Status changes:**
- T-XXX: in_progress → review
- T-YYY: todo → in_progress

**Commits:**
- abc1234 feat: add login form validation (T-001)
- def5678 test: add login form unit tests (T-001)

**Decisions made:** D-005 (or "none")

**Blockers:** [any? or "none"]

**Next step for next session:**
[Cụ thể: "Tiếp tục T-XXX, cần implement AC3 về error handling"]
```

Commit: `chore(coord): session report {agent} YYYY-MM-DD`

---

## Step 6 — Finish task

Khi tất cả AC của task đã check:
1. Update task: `status: review`, giữ `owner`.
2. Push branch, tạo PR: `Closes T-XXX`.
3. Ghi vào session report.
4. **Không tự merge.** Coordinator (human hoặc team-lead agent) sẽ review + merge.

---

## Luật bất khả xâm phạm

1. **Không đụng file không thuộc task của mình.** Thấy bug ngoài scope → tạo task mới, không fix.
2. **Không commit thẳng lên `main`.** Luôn qua branch + PR.
3. **Không edit entry cũ trong `DECISIONS.md`.** Chỉ append.
4. **Không skip AC.** Nếu không verify được AC → status = `blocked`, escalate.
5. **Không claim task của agent khác.** Nếu owner field không trống và khác bạn → pass.
6. **Nếu 2 task conflict file → BLOCKED, không race.** Coordinator chia lại task.

---

## Khi bí / stuck

Không cố gắng solo. Workflow này có rule rõ:

- Stuck kỹ thuật → tham khảo NotebookLM notebook của project (link trong BRIEF.md)
- Stuck về scope → đọc lại BRIEF.md phần non-goals
- Stuck về lựa chọn → log vào DECISIONS.md options considered, escalate coordinator chọn
- Stuck vì thiếu info → status = `blocked`, ghi rõ "cần X để tiếp tục", escalate

---

**Đã đọc xong file này? Confirm với coordinator bằng câu: "ONBOARDED, ready to claim T-XXX" trước khi đụng code.**
