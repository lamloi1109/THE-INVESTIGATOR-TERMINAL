# Vibecoding Workflow 2026 — V2 (Forge + Coordination Layer)

> V2 kế thừa V1 (The Forge). Chỉ bổ sung **coordination layer** để giải quyết những gap mà V1 bỏ ngỏ: live state giữa các agent, task state machine, agent onboarding, git convention.
>
> Tất cả 8 master prompt của V1 vẫn dùng nguyên. Không thay, chỉ thêm.

---

## I. Những gì V2 thay đổi

| Gap ở V1 | V2 giải quyết |
|---|---|
| Không có nơi sống cho tiến độ real-time (NotebookLM read-only) | Thêm folder `.coordination/` trong repo |
| Task không có `status` / `owner` động | Task state machine: todo → claimed → in_progress → blocked → review → done |
| Agent resume session không biết state cũ | `AGENT_ONBOARDING.md` + `reports/{agent}.md` append-only |
| Git branching mơ hồ "commit độc lập" | Convention cứng: `{agent}/T-{id}-{slug}` |
| Coordinator không rõ là ai | Human-first ≤3 project đầu, sau đó optional team-lead agent |
| Quyết định kiến trúc không log được | `DECISIONS.md` append-only, reference nhau bằng D-ID |

---

## II. Layered memory — ba tầng nhớ khác nhau

```
┌─────────────────────────────────────────────┐
│  LONG-TERM (NotebookLM)                     │  ← ingested, read-only
│  Knowledge base, past projects, research    │
├─────────────────────────────────────────────┤
│  LIVE STATE (.coordination/, versioned git) │  ← live, evolve hàng giờ
│  Brief, tasks, decisions, agent reports     │
├─────────────────────────────────────────────┤
│  CODE (/app, /src, ...)                     │  ← the deliverable
└─────────────────────────────────────────────┘
```

Quy tắc: thông tin đi **xuống** tầng dưới khi chín (brief chốt → code viết theo), và **lên** tầng trên khi đóng gói (docs cuối project → upload lại NotebookLM để knowledge dài hạn).

---

## III. Cấu trúc repo chuẩn

```
project/
├── .coordination/
│   ├── BRIEF.md              # immutable, chỉ update qua DECISIONS
│   ├── TASKS.md              # live task board
│   ├── DECISIONS.md          # append-only decision log
│   ├── AGENT_ONBOARDING.md   # read-first cho mọi agent
│   └── reports/
│       ├── README.md
│       ├── antigravity.md
│       ├── claude-code.md
│       └── human.md
├── app/
│   ├── frontend/
│   └── backend/
├── docs/                     # final docs, upload NotebookLM sau
└── README.md
```

---

## IV. Vai trò Coordinator

**Giai đoạn 1 — ≤3 project đầu: Human (bạn) là coordinator.**
Lý do: bạn phải feel được pain point thật trước khi automate. Delegate sớm = auto hóa sai chỗ.

**Giai đoạn 2 — sau khi quen: Team-lead Claude Code session riêng.**
Nhiệm vụ duy nhất:
- Đọc `.coordination/` khi được ping
- Review reports, phát hiện conflict, update TASKS
- Escalate câu hỏi về scope lên human
- **KHÔNG đụng code.** Nếu đụng code là vi phạm vai trò.

---

## V. Task State Machine

```
      ┌─────────┐  claim   ┌──────────┐  start   ┌──────────────┐
      │  todo   │─────────▶│ claimed  │─────────▶│ in_progress  │
      └─────────┘          └──────────┘          └──────┬───────┘
                                                        │
                                      ┌─────────────────┼─────────────────┐
                                      │                 │                 │
                                   stuck            finish              scope
                                      ▼                 ▼              changed
                                ┌──────────┐     ┌──────────┐             │
                                │ blocked  │     │  review  │             ▼
                                └────┬─────┘     └────┬─────┘       ┌──────────┐
                                     │                │             │  split   │
                                  unblock          approve          │(new T-id)│
                                     │                │             └──────────┘
                                     └───▶ in_progress│
                                                      ▼
                                                 ┌─────────┐
                                                 │  done   │
                                                 └─────────┘
```

Mọi transition PHẢI update trong `TASKS.md` kèm timestamp và agent name. Không transition thầm.

---

## VI. Git Branching Convention

```
main                                  # protected, merge qua PR only
├── antigravity/T-001-login-ui        # agent branch
├── claude-code/T-002-auth-middleware # agent branch
├── human/T-003-deploy-config         # human tự code
└── fix/T-XXX-hotfix                  # urgent, vẫn phải có T-id
```

**Rules:**
1. 1 task = 1 branch. Không bao giờ 2 task share branch.
2. Branch xoá sau merge (`git push origin --delete`).
3. PR description bắt buộc reference task ID: `Closes T-001`.
4. Merge conflict → **escalate coordinator**, không tự resolve nếu đụng file agent khác đang active.
5. Commit nhỏ, 1 commit per acceptance criterion.

---

## VII. 5 bước (updated)

### Bước 1 — Quarry (Mỏ đá)
Giữ nguyên V1. Output nạp NotebookLM.

**V2 thêm:** Không cần commit vào `.coordination/` ở bước này. NotebookLM là đủ.

### Bước 2 — Anvil (Đe)
Giữ nguyên V1 (Prompt #3 Architect).

**V2 thêm — sau khi Prompt #3 output PRD + Task Breakdown:**
- Convert PRD → `.coordination/BRIEF.md`
- Convert Task Breakdown → `.coordination/TASKS.md` (dùng schema ở template)
- Append entry đầu tiên vào `DECISIONS.md`: tech stack đã chọn + lý do
- Commit: `chore(coord): initialize coordination layer`

### Bước 3 — Forge (Rèn)

**V2 thay đổi lớn:** mọi agent bắt đầu session bằng:
```
1. Đọc .coordination/AGENT_ONBOARDING.md
2. Đọc BRIEF, TASKS, 5 entry cuối của DECISIONS
3. Đọc reports/{agent-tên-mình}.md — session trước làm đến đâu
4. Claim task (đổi status → in_progress, set owner)
5. Tạo branch theo convention
6. Mới bắt đầu code
```

Nếu agent skip bước này → coordinator reject PR.

Parallel streams (Antigravity/Claude Code/Stitch) giữ nguyên phân công V1.

### Bước 4 — Tempering (Tôi luyện)
Giữ nguyên V1.

**V2 thêm:** Coordinator scan `reports/` để phát hiện:
- Agent nào report "blocker" nhưng không escalate
- Agent nào claim task mà chưa có commit (stuck âm thầm)
- Task nào ở `review` quá 1 ngày (review bottleneck)

### Bước 5 — Archive
Giữ nguyên V1.

**V2 thêm:** Trước khi đóng project:
- Export `BRIEF.md`, `DECISIONS.md`, `reports/*` cùng `/docs/` vào NotebookLM
- Đây là cách knowledge dài hạn được "tôi luyện" qua thời gian — NotebookLM của bạn dần thành Second Brain được huấn luyện bằng code thật của bạn

---

## VIII. Khi nào KHÔNG cần workflow này

Đừng over-engineer. Workflow này OVERKILL cho:
- Script <100 dòng, 1 file
- Personal exploratory coding không maintain
- PoC dưới 2 giờ (dùng Claude Code một mình đủ)

Workflow V2 optimize cho: **project có ≥2 agent cùng làm, ≥3 ngày, cần maintain sau khi xong.**

---

## IX. Metrics để đánh giá workflow sau mỗi project

- Số lần 2 agent conflict trên cùng file → target 0
- Số task skip verify → target 0
- Thời gian "PRD xong" → "deploy" → baseline, theo dõi xu hướng
- Số decision bị revert → càng ít càng tốt; nhiều = PRD chưa chặt
- Số lần coordinator phải intervene → nhiều = convention chưa đủ cứng

---

## X. Checklist khởi động project mới

- [ ] `mkdir project && cd project && git init`
- [ ] Copy bộ `coordination-template/` (trong folder này) → đổi tên thành `.coordination/`
- [ ] Fill `BRIEF.md` từ output Prompt #3
- [ ] Generate `TASKS.md` từ Task Breakdown của Prompt #3
- [ ] Append decision đầu tiên vào `DECISIONS.md`: tech stack + lý do
- [ ] Tạo NotebookLM notebook riêng, ingest briefing + research
- [ ] `git add .coordination && git commit -m "chore(coord): initialize"`
- [ ] Assign agent cho từng task (gán field `assigned_type`)
- [ ] Agent đầu tiên đọc `AGENT_ONBOARDING.md` → claim T-001 → start.

---

## XI. Quan hệ với V1

| V1 phần | V2 trạng thái |
|---|---|
| Mô hình Forge (5 phases) | Giữ nguyên |
| 8 Master Prompts | Giữ nguyên 100% |
| Bảng phân công tool (II) | Giữ nguyên |
| Luật "1 task - 1 tool" | Giữ nguyên, siết chặt bằng git branch rule |
| Luật "1 file - 1 agent - 1 branch" | Enforce qua TASKS.md `files_touched` field |
| Pro tips | Giữ nguyên, thêm tip: "đọc reports của agent trước khi ra quyết định merge" |

V1 là "cái gì làm". V2 là "làm thế nào để nhiều agent cùng làm mà không đạp nhau".
