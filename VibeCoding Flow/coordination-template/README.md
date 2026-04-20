# `.coordination/` — Live State Layer

Folder này là **tầng live state** của project. Không phải knowledge base dài hạn (đó là NotebookLM). Không phải code (đó là `/app`).

Folder này giữ 3 thứ:
1. **Immutable brief** — mục tiêu project không đổi trong suốt cycle
2. **Live task board** — ai đang làm gì, trạng thái nào
3. **Append-only logs** — quyết định và session reports để audit trail

---

## Cách dùng template này

1. Copy folder `coordination-template/` vào repo project mới
2. Đổi tên thành `.coordination/` (có dấu chấm đầu)
3. Fill `BRIEF.md` từ output Prompt #3 (Architect) của workflow
4. Generate `TASKS.md` từ task breakdown
5. Append decision đầu tiên (tech stack) vào `DECISIONS.md`
6. Commit: `chore(coord): initialize coordination layer`

```bash
cd your-new-project
cp -r /path/to/VibeCoding\ Flow/coordination-template .coordination
cd .coordination
# fill BRIEF.md, TASKS.md, DECISIONS.md
cd ..
git add .coordination
git commit -m "chore(coord): initialize coordination layer"
```

---

## Files trong folder

| File | Mô tả | Cách update |
|---|---|---|
| `BRIEF.md` | Mục tiêu, constraints, tech stack | Immutable. Đổi → log DECISIONS.md |
| `TASKS.md` | Task board với state machine | Live. Agent update khi claim/finish |
| `DECISIONS.md` | Decision log | Append-only. Không edit cũ |
| `AGENT_ONBOARDING.md` | Read-first cho mọi agent | Ít khi sửa. Copy-paste từ template |
| `reports/{agent}.md` | Session reports per agent | Append-only sau mỗi session |

---

## Golden rules

1. **Agent không đọc `.coordination/` → agent bị reject.** Không ngoại lệ.
2. **Status change không update TASKS.md → vi phạm protocol.**
3. **Decision không log DECISIONS.md → bị coi như chưa có decision.**
4. **Session không có report → như chưa diễn ra.**

Convention chỉ có giá trị khi áp dụng nghiêm. Workflow này đổ vỡ ngay từ lần đầu bạn cho phép "tạm bỏ qua, lần sau làm".
