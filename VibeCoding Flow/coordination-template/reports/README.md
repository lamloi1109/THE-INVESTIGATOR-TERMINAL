# Agent session reports

Mỗi agent có 1 file riêng trong folder này:
- `antigravity.md`
- `claude-code.md`
- `human.md` (nếu human tự code task)

Quy tắc: **APPEND-ONLY.** Không edit session cũ. Nếu sai → ghi session mới correction, reference session cũ.

---

## Template mỗi session (copy-paste)

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
[Cụ thể và actionable]

---
```

---

## Mục đích của reports

1. **Agent kế nhiệm resume nhanh.** Thay vì đọc toàn bộ git log, đọc 1-2 session cuối là đủ context.
2. **Coordinator scan nhanh để catch silent failures.** Agent claim task nhưng report trống nhiều ngày = stuck âm thầm.
3. **Audit trail cho retrospective.** Sau project, review reports để tìm pattern: agent nào hay stuck ở loại task gì, decision nào dẫn tới rework.

---

## Reports KHÔNG phải là

- **Không phải diary.** Đừng viết "hôm nay tôi cảm thấy", không ai đọc.
- **Không phải changelog đầy đủ.** Đã có git log. Report chỉ cần hash + 1 dòng mục đích.
- **Không phải nơi thảo luận kiến trúc.** Thảo luận → `DECISIONS.md`.
- **Không phải nơi log tiến độ task.** Tiến độ task → `TASKS.md`. Report chỉ note delta của session.
