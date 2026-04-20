# SESSION HANDOFF — THE INVESTIGATOR TERMINAL

**Tạo:** 2026-04-20
**Tác giả:** Claude (cowork session với PhuocLoi)
**Mục đích:** Chuyển context sang thiết bị khác không mất mạch làm việc

---

## TL;DR (đọc trong 30 giây)

Đang giữa thiết lập workflow vibecoding V2 cho project "THE INVESTIGATOR TERMINAL" (portfolio AI Engineer cho PhuocLoi). Coordination layer đã viết xong, đang ở **Step 1/10** của walkthrough cầm tay chỉ việc — bước commit + push. Sau khi handoff, tiếp tục từ **Step 2** (mở Antigravity cho T-001).

**1 dòng action trước khi rời máy hiện tại:** commit tất cả + push lên remote.

---

## 1. PROJECT CONTEXT

- **Mục tiêu:** Portfolio site AI Engineer cho PhuocLoi, có terminal AI feature chứng minh năng lực RAG + system design
- **Stack chốt (D-001):** Astro 5.x hybrid + Preact + Gemini 1.5 Flash + Google Sheets API + Vercel Hobby + Tailwind
- **Constraint cứng:**
  - $0/tháng vận hành
  - Lighthouse ≥95 trên static pages
  - Bundle <50MB uncompressed
  - **KHÔNG dùng React**, không vector DB, không visual gimmick 3D/particle
- **Code layout (D-002):** Monorepo, code trong `/app/`, planning trong `StrategicAnalyst/`
- **Repo location (hiện tại):** `~/Desktop/vllm_01/THE-INVESTIGATOR-TERMINAL`

---

## 2. WORKFLOW CONTEXT

Đây là **project thử nghiệm đầu tiên** cho workflow vibecoding V2 (file tham chiếu: `VibeCoding Flow/WORKFLOW_V2.md`).

Triết lý: nhiều agent (Antigravity cho UI, Claude Code cho backend/refactor) làm song song, phối hợp qua **coordination layer** trong `StrategicAnalyst/docs/`. Human (PhuocLoi) là coordinator trong giai đoạn đầu.

---

## 3. CURRENT STATE

### Đã done
- Bước 1 Quarry: skipped (đủ knowledge từ trước)
- Bước 2 Anvil: PRD + TASKS (14 tasks T-001 → T-050) đã có sẵn, chất lượng cao
- Coordination layer setup:
  - `StrategicAnalyst/docs/TASKS.md` — upgraded với state machine (Status/Owner/Branch/Updated)
  - `StrategicAnalyst/docs/DECISIONS.md` — D-001 (tech stack), D-002 (monorepo layout)
  - `StrategicAnalyst/docs/AGENT_ONBOARDING.md` — protocol 6 bước cho mọi agent
  - `StrategicAnalyst/docs/reports/` — antigravity.md / claude-code.md / human.md
  - `StrategicAnalyst/CLAUDE.md` — updated reference AGENT_ONBOARDING
- `VibeCoding Flow/` — workflow V2 docs + coordination template

### Mid-flight
- **Step 1/10 của walkthrough:** commit coordination bootstrap
  - File đang ở working tree, **CHƯA COMMIT**
  - Cần hoàn thành Step 1 trước khi handoff

### Chưa bắt đầu
- T-001 (ANTIGRAVITY) — scaffold Astro vào `/app/`
- T-010 (MANUAL) — tạo Google Sheets 3 tab
- T-002 → T-050 — khóa bởi dependency

---

## 4. PRE-HANDOFF CHECKLIST (BẮT BUỘC làm trước khi rời máy hiện tại)

```bash
cd ~/Desktop/vllm_01/THE-INVESTIGATOR-TERMINAL

# 1. Kiểm tra trạng thái
git status

# 2. Commit 1: coordination layer
git add StrategicAnalyst/ README.md
git commit -m "chore(coord): initialize coordination layer (D-001, D-002)"

# 3. Commit 2: workflow docs + handoff file
git add "VibeCoding Flow/" StrategicAnalyst/docs/HANDOFF.md
git commit -m "docs: add VibeCoding Flow V2 + session handoff"

# 4. Nếu repo chưa có remote origin, tạo trên GitHub trước:
# gh repo create investigator-terminal --private --source=. --remote=origin
# git push -u origin main

# Nếu đã có remote:
git push origin main

# 5. Verify
git log --oneline -5
git status
# Kỳ vọng: 3 commits, working tree clean, branch synced
```

Nếu step nào lỗi → xử lý xong rồi mới handoff. **Không được rời máy khi working tree còn dirty.**

---

## 5. RESUME PROTOCOL (trên thiết bị mới)

### Step A — Cài môi trường

Cần:
- [ ] Git
- [ ] Node.js ≥20 + npm
- [ ] VSCode (hoặc IDE quen)
- [ ] **Antigravity** desktop app (https://antigravity.google) — login bằng Google account có Pro access
- [ ] **Claude Code** CLI: `npm install -g @anthropic-ai/claude-code` — login bằng Anthropic account
- [ ] GitHub CLI: `gh auth login` (hoặc SSH key)

### Step B — Clone repo

```bash
mkdir -p ~/Desktop/vllm_01 && cd ~/Desktop/vllm_01
git clone <remote-url> THE-INVESTIGATOR-TERMINAL
cd THE-INVESTIGATOR-TERMINAL
```

### Step C — Verify state

```bash
ls StrategicAnalyst/docs/
# Kỳ vọng thấy: AGENT_ONBOARDING.md  DECISIONS.md  HANDOFF.md  PRD.md  TASKS.md  reports/

git log --oneline -5
# Kỳ vọng thấy commit "chore(coord): initialize coordination layer (D-001, D-002)"
```

Đọc file này (HANDOFF.md) trước tiên. Sau đó đọc theo thứ tự ở mục 6.

### Step D — Tiếp tục từ Step 2 của walkthrough

Step 1 (commit) đã xong trước khi handoff. **Step 2 trở đi:**

---

## 6. FILES ĐỌC THEO THỨ TỰ (trên máy mới)

| # | File | Purpose | Thời gian |
|---|------|---------|-----------|
| 1 | `StrategicAnalyst/docs/HANDOFF.md` | File này — biết đang ở đâu | 2 phút |
| 2 | `StrategicAnalyst/CLAUDE.md` | Project purpose + risks | 5 phút |
| 3 | `StrategicAnalyst/docs/PRD.md` | Success criteria + non-goals | 3 phút |
| 4 | `StrategicAnalyst/docs/TASKS.md` | Task board + state | 5 phút |
| 5 | `StrategicAnalyst/docs/DECISIONS.md` | 2 decision đã chốt | 3 phút |
| 6 | `StrategicAnalyst/docs/AGENT_ONBOARDING.md` | Protocol cho agent | 5 phút |
| 7 | `VibeCoding Flow/WORKFLOW_V2.md` | Framework toàn cảnh (optional, đã quen thì skip) | 10 phút |

---

## 7. WALKTHROUGH 10-STEP POSITION

Đang ở **sắp kết thúc Step 1 → chuẩn bị Step 2**.

| Step | Action | Status |
|---|---|---|
| 1 | Commit + push coordination bootstrap | 🟡 mid (làm xong trước handoff) |
| 2 | Mở Antigravity, onboard cho T-001 | ⏳ next sau handoff |
| 3 | Antigravity confirm ONBOARDED → approve claim | ⏳ |
| 4 | Antigravity tạo branch `antigravity/T-001-astro-scaffold`, scaffold Astro vào `/app` | ⏳ |
| 5 | Verify AC của T-001 (dev server chạy, không có React trong deps) | ⏳ |
| 6 | Merge T-001 branch, update TASKS status → done | ⏳ |
| 7 | (song song) Bạn tự làm T-010 MANUAL: tạo Google Sheets 3 tab | ⏳ |
| 8 | Onboard Antigravity cho T-011 (sau khi T-001 + T-010 done) | ⏳ |
| 9 | Update `reports/human.md` cuối ngày | ⏳ |
| 10 | Retrospective: workflow có gì awkward cần siết cho V2.1 | ⏳ |

**Vào thiết bị mới, mở Claude session và paste:**

> *"Mình đã pull repo về máy mới, đang ở Step 2 của walkthrough THE INVESTIGATOR TERMINAL. Đọc `StrategicAnalyst/docs/HANDOFF.md` rồi tiếp tục dẫn mình."*

---

## 8. TEMPLATE PROMPT CHO ANTIGRAVITY (Step 2 — dùng ngay sau handoff)

Copy-paste nguyên xi vào session Antigravity đầu tiên:

```
Bạn đang vào project THE INVESTIGATOR TERMINAL (portfolio AI Engineer).

Đọc theo thứ tự sau, KHÔNG SKIP:
1. StrategicAnalyst/CLAUDE.md
2. StrategicAnalyst/docs/PRD.md
3. StrategicAnalyst/docs/TASKS.md
4. StrategicAnalyst/docs/DECISIONS.md (ít nhất 2 entry D-001, D-002)
5. StrategicAnalyst/docs/AGENT_ONBOARDING.md
6. StrategicAnalyst/docs/reports/antigravity.md

Sau khi đọc xong, confirm bằng đúng câu này:
"ONBOARDED. Ready to claim T-001 (Khởi tạo Astro project + cấu hình hybrid rendering). Branch sẽ là antigravity/T-001-astro-scaffold."

KHÔNG đụng code trước khi tôi reply "Approved, claim now".

Khi tôi approve, bạn sẽ:
1. Update StrategicAnalyst/docs/TASKS.md: T-001 Status → in_progress, Owner → antigravity, Branch → antigravity/T-001-astro-scaffold, Updated → {now}
2. Tạo branch antigravity/T-001-astro-scaffold từ main
3. Scaffold Astro vào thư mục /app theo AC của T-001
4. Commit nhỏ (1 commit per AC), format: "feat: <what> (T-001)"
5. Cuối session, append report vào StrategicAnalyst/docs/reports/antigravity.md
```

---

## 9. TOOLS / ACCESS CẦN CÓ

- [ ] GitHub access (repo này)
- [ ] Antigravity desktop app, logged in
- [ ] Claude Code CLI, logged in
- [ ] Google account → tạo Google Sheets cho T-010
- [ ] Gemini API key (cho T-031 sau này, lấy free tại https://aistudio.google.com/apikey)
- [ ] Vercel account (cho T-002 deploy, vercel.com signup free)

---

## 10. OPEN THREADS / LƯU Ý

- **CRLF line ending:** Windows repo, khi Linux sandbox ghi file có thể gây "modified" giả trên README.md, PRD.md. Không phải lỗi content. Nếu muốn clean, thêm `.gitattributes`:
  ```
  * text=auto
  *.md text eol=lf
  ```
- **Antigravity Pro credential:** nếu dùng Pro, login Google account đúng (không phải account khác).
- **Gemini free tier 250 req/day shared:** cẩn thận khi test T-031 (dễ burn quota khi debug).
- **Bundle cap 50MB là S4 rất tight:** mỗi dep phải audit. Dùng `du -sh node_modules/<pkg>`.
- **StrategicAnalyst và /app cùng commit:** không submodule. Agent branch chỉ đụng code trong scope task. Cross-cutting changes (vd thêm task mới) commit tách riêng.
- **Folder VibeCoding Flow nằm trong repo:** đã được commit như meta-docs. Sau này muốn tách → `git subtree split --prefix="VibeCoding Flow" -b vibecoding-workflow`.

---

## 11. IF STUCK / TROUBLESHOOTING

- Không nhớ đang ở đâu → đọc lại file này
- Agent vi phạm rule AGENT_ONBOARDING → reject PR, bắt đọc lại
- Bug không fix → Prompt #2 (Technical Audit) trong workflow V1
- 2 agent mâu thuẫn output → Prompt #7 (Conflict Resolver)
- Git conflict khi merge → escalate coordinator, không tự resolve nếu đụng file agent khác đang active
- Bundle vượt 50MB → chạy `du -sh app/.vercel/output/functions/` tìm dep lớn nhất, tree-shake hoặc swap lib

---

## 12. UPDATE LOG

- **2026-04-20 13:20** — File tạo, pre-handoff (coordination layer vừa xong, chưa commit)

**Update khi:**
- T-001 done → update mục 3 + mục 7
- T-010 done → update mục 3 + mục 7
- Chuyển sang Phase 2/3 → rewrite mục 3 + mục 7
- Có decision lớn mới → không update ở đây, log vào DECISIONS.md

File này nên được update mỗi khi rời máy / pause session ≥1 ngày.
