# Task Board

> **Protocol:**
> 1. Agent PHẢI claim task trước khi code (đổi `status` → `in_progress`, set `owner`, đặt `updated`).
> 2. Mỗi task 1 branch theo convention: `{agent}/T-{id}-{slug}`.
> 3. Sau mỗi session, append report vào `reports/{agent}.md`.
> 4. Nếu 2 task có overlap trong `files_touched` → flag BLOCKED, escalate coordinator.

---

## Status legend

- `todo` — chưa ai nhận, có thể claim
- `claimed` — đã nhận, chưa bắt đầu (giữ chỗ)
- `in_progress` — đang làm
- `blocked` — có blocker (ghi rõ ở `blocker`)
- `review` — xong code, chờ review/merge
- `done` — đã merge vào main

---

## Active tasks

### T-001 — [Title ngắn gọn]

- **Status:** `todo`
- **Owner:** —
- **Branch:** —
- **Assigned type:** `ANTIGRAVITY` | `CLAUDE_CODE` | `STITCH` | `HUMAN`
- **Files touched:** `[src/pages/login.tsx, src/components/LoginForm.tsx]`
- **Depends on:** — (hoặc `T-000`)
- **Complexity:** S | M | L
- **Acceptance criteria:**
  - [ ] AC1 — [đo được]
  - [ ] AC2 — [đo được]
  - [ ] Không console error, không network 4xx/5xx
- **Verification:** [lệnh / URL / screenshot yêu cầu]
- **Blocker:** —
- **Updated:** YYYY-MM-DD HH:MM by [agent-name]

---

### T-002 — [Title]

- **Status:** `todo`
- **Owner:** —
- **Branch:** —
- **Assigned type:** …
- **Files touched:** …
- **Depends on:** —
- **Complexity:** …
- **Acceptance criteria:**
  - [ ] …
- **Verification:** …
- **Blocker:** —
- **Updated:** YYYY-MM-DD HH:MM by …

---

## Done

> Move task xuống đây sau khi merge. Giữ full metadata để truy vết.

(empty)
