# Decision Log

> **Protocol:** APPEND-ONLY. Không edit entry cũ — nếu đổi ý, ghi entry mới và set `supersedes: D-XXX`.
>
> Lý do: audit trail. Khi project đi sai, bạn cần biết quyết định nào dẫn tới đâu, tại thời điểm nào, với thông tin gì.

---

## D-001: [Tiêu đề quyết định]

- **Date:** YYYY-MM-DD
- **Author:** human | antigravity | claude-code
- **Status:** active
- **Supersedes:** —

**Context:**
[Tại sao quyết định này nảy sinh? Trigger là gì? Tình huống nào đang đối mặt?]

**Options considered:**
1. **Option A** — [mô tả ngắn]
   - Pros: …
   - Cons: …
2. **Option B** — …
   - Pros: …
   - Cons: …

**Decision:**
[Chọn option nào, phát biểu thẳng.]

**Rationale:**
[Tại sao chọn cái đó. Nên bám vào BRIEF (constraints, non-goals) để biện minh.]

**Consequences:**
- [Ảnh hưởng downstream 1]
- [Ảnh hưởng downstream 2]
- [Task nào cần update sau decision này]

---

## D-002: …

(template như trên)

---

## Format rút gọn cho quyết định nhỏ (≤10 dòng)

Quyết định nhỏ (ví dụ: "chọn thư viện date-fns thay vì dayjs") có thể viết gọn:

### D-003: Use date-fns for date formatting
- **Date:** YYYY-MM-DD | **Author:** claude-code | **Status:** active
- **Why:** tree-shakable, TS support tốt hơn dayjs cho use case hiện tại
- **Alternatives rejected:** dayjs (bundle size lớn hơn khi không tree-shake)
- **Affects:** T-005, T-008

---
