# Agent Session Reports — THE INVESTIGATOR TERMINAL

Mỗi agent có 1 file riêng:
- `antigravity.md`
- `claude-code.md`
- `human.md`

**Append-only.** Không edit session cũ. Sai → ghi session mới correction, reference session cũ.

---

## Template session report

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
[Cụ thể và actionable]

---
```

---

## Mục đích

1. **Resume nhanh.** Agent kế nhiệm đọc 1-2 session cuối là đủ context, không cần scan git log.
2. **Coordinator scan silent failures.** Agent claim task mà report trống nhiều ngày = stuck âm thầm.
3. **Retrospective.** Sau project, review reports để tìm pattern agent nào hay stuck ở loại task gì.

---

## Reports KHÔNG phải là

- Không phải diary, không viết "hôm nay tôi cảm thấy"
- Không phải changelog — đã có git log
- Không phải nơi thảo luận kiến trúc — dùng DECISIONS.md
- Không phải nơi ghi tiến độ task — dùng TASKS.md `Status` field
