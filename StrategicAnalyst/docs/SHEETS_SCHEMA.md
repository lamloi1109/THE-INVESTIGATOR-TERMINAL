# Google Sheets Schema — THE INVESTIGATOR TERMINAL

> Source-of-truth cho structure của Google Sheet CMS.
> Mọi thay đổi schema phải update file này **trước** khi sửa sheet, để agent đồng bộ.
> Sheet ID lưu trong `app/.env` (`GOOGLE_SHEET_ID`). Không commit ID vào repo.

**Related:**
- Tasks: T-010 (design + seed), T-011 (API client), T-025 (content sections), T-026 (schema v2)
- Decisions: D-001 (Sheets làm CMS), D-004 (song ngữ qua cột `_vi`/`_en`)

---

## Sheet 1: `Profile`

Key-value store cho thông tin CV cá nhân. Mỗi row = 1 trường.

| Column     | Type   | Required | Ví dụ                                      |
|------------|--------|----------|--------------------------------------------|
| `key`      | string | ✅       | `name`, `title`, `summary`, `email`        |
| `value_vi` | string | ✅       | `Lâm Phước Lợi`                            |
| `value_en` | string | ✅       | `Phuoc Loi Lam`                            |

**Keys khuyến nghị (seed tối thiểu):**

| Group | Keys | Component dùng |
|-------|------|----------------|
| Identity | `name`, `email`, `location`, `github_url`, `linkedin_url`, `resume_url` | Hero, Contact |
| Hero copy (v2.1) | `hero_badge`, `hero_tagline`, `hero_about_label`, `hero_about_body`, `hero_status` | Hero.astro |
| Contact CTA | `contact_cta_title`, `contact_cta_body`, `contact_cta_button` | Contact.astro |

`hero_about_body` cho phép HTML inline (`<strong>…</strong>`) — escape với `&amp;` khi cần.

**Legacy keys (deprecated trong v2.1):** `title`, `summary` — bị thay bằng `hero_badge` + `hero_tagline` + `hero_about_body` để map 1-1 với Hero.astro props. Nếu sheet hiện tại còn dùng, parse vẫn không lỗi (key dư bị ignore), chỉ là không có component đọc.

**Parse convention:** map thành `Record<string, { vi: string; en: string }>` để lookup O(1).

---

## Sheet 2: `Projects`

Danh sách projects portfolio + case study content. Render card grid trên homepage section `#projects` (Projects.astro) và trang chi tiết `/case-studies/[slug]` (case-studies/[slug].astro).

**Core fields (card display):**

| Column           | Type              | Required | Note                                   |
|------------------|-------------------|----------|----------------------------------------|
| `id`             | string (kebab)    | ✅       | unique. Ví dụ: `ai-internal-server`   |
| `title_vi`       | string            | ✅       |                                        |
| `title_en`       | string            | ✅       |                                        |
| `description_vi` | string            | ✅       | 1–2 câu, ≤ 200 ký tự                   |
| `description_en` | string            | ✅       |                                        |
| `tags`           | comma-separated   | ✅       | Ví dụ: `vLLM,LangGraph,Qdrant`        |
| `date`           | YYYY-MM           | ✅       | Ví dụ: `2026-04`                       |
| `icon`           | string            | optional | Emoji cho card. Ví dụ: `🤖`           |
| `icon_variant`   | string            | optional | `cyan` / `green` / `pink`              |
| `highlights_vi`  | newline-separated | optional | Mỗi dòng = 1 bullet (Alt+Enter)       |
| `highlights_en`  | newline-separated | optional |                                        |

**Case study fields (optional — nếu điền → project có trang detail):**

| Column           | Type              | Required | Note                                   |
|------------------|-------------------|----------|----------------------------------------|
| `slug`           | string (kebab)    | optional | URL-safe. Ví dụ: `ai-internal-server` |
| `problem_vi`     | long text         | optional | Bối cảnh + vấn đề (2–4 câu)           |
| `problem_en`     | long text         | optional |                                        |
| `solution_vi`    | long text         | optional | Giải pháp + kiến trúc (3–5 đoạn)      |
| `solution_en`    | long text         | optional |                                        |
| `result_vi`      | long text         | optional | Kết quả + metrics                      |
| `result_en`      | long text         | optional |                                        |
| `tech_stack`     | comma-separated   | optional | Tech chi tiết (khác `tags` trên card)  |
| `repo_url`       | string            | optional | GitHub / source link                   |
| `live_url`       | string            | optional | Demo link                              |

**Logic:** Nếu `slug` + `problem_vi` + `solution_vi` + `result_vi` đều non-empty → `getStaticPaths()` của `case-studies/[slug].astro` tạo trang `/case-studies/{slug}`. Card trên homepage có thể link tới đó (hiện Projects.astro hardcode card, chưa wire — xem T-026 tương lai).

**Parse convention:**
```ts
tags: row.tags.split(',').map(s => s.trim()).filter(Boolean)
tech_stack: row.tech_stack?.split(',').map(s => s.trim()).filter(Boolean) ?? []
highlights_vi: row.highlights_vi?.split('\n').map(s => s.replace(/^- /, '').trim()).filter(Boolean) ?? []
```

**Seed tối thiểu:** 3 projects, trong đó ít nhất 2 có case study content.

---

## Sheet 3: `Experience`

Kinh nghiệm làm việc. Render ở section Experience trên homepage.

| Column             | Type              | Required | Note                                   |
|--------------------|-------------------|----------|----------------------------------------|
| `id`               | string (kebab)    | ✅       | unique. Ví dụ: `current-company`      |
| `company_vi`       | string            | ✅       | Tên công ty                            |
| `company_en`       | string            | ✅       |                                        |
| `role_vi`          | string            | ✅       | Chức danh                              |
| `role_en`          | string            | ✅       |                                        |
| `period`           | string            | ✅       | Ví dụ: `2023 – Present`               |
| `badge_vi`         | string            | optional | Ví dụ: `Full-time`                    |
| `badge_en`         | string            | optional |                                        |
| `achievements_vi`  | newline-separated | ✅       | Mỗi dòng = 1 thành tựu (Alt+Enter)   |
| `achievements_en`  | newline-separated | ✅       |                                        |
| `order`            | number            | ✅       | Sort key, thấp = hiển thị trước       |

**Parse convention:**
```ts
achievements_vi: row.achievements_vi.split('\n').map(s => s.replace(/^- /, '').trim()).filter(Boolean)
order: parseInt(row.order, 10)
```

---

## Sheet 4: `TechStack`

Tech stack pills, nhóm theo category. Render ở section Tech Stack trên homepage.

| Column       | Type           | Required | Note                                   |
|--------------|----------------|----------|----------------------------------------|
| `id`         | string (kebab) | ✅       | unique. Ví dụ: `vllm`                 |
| `group_vi`   | string         | ✅       | Ví dụ: `AI / ML`                      |
| `group_en`   | string         | ✅       | Ví dụ: `AI / ML`                      |
| `label`      | string         | ✅       | Tên hiển thị. Ví dụ: `vLLM`           |
| `variant`    | string         | ✅       | `g` (green/AI), `c` (cyan/Backend), `p` (pink/Frontend), `w` (white/Tools) |
| `order`      | number         | ✅       | Sort key trong group                   |

**Group thứ tự:** AI/ML → Backend & Infrastructure → Frontend → Tools & Practices.

---

## Sheet 5: `Education`

Học vấn. Render ở section Education trên homepage.

| Column         | Type           | Required | Note                                   |
|----------------|----------------|----------|----------------------------------------|
| `id`           | string (kebab) | ✅       | unique. Ví dụ: `university-vn`        |
| `icon`         | string         | ✅       | Emoji. Ví dụ: `🎓`                    |
| `icon_variant` | string         | ✅       | `cyan` / `green`                       |
| `degree_vi`    | string         | ✅       | Ví dụ: `Kỹ thuật / Công nghệ thông tin` |
| `degree_en`    | string         | ✅       |                                        |
| `school_vi`    | string         | ✅       | Ví dụ: `Đại học — Việt Nam`           |
| `school_en`    | string         | ✅       |                                        |
| `year_vi`      | string         | ✅       | Ví dụ: `Đã tốt nghiệp`               |
| `year_en`      | string         | ✅       |                                        |
| `order`        | number         | ✅       | Sort key                               |

---

## Conventions chung

**Ngôn ngữ (D-004):** Song ngữ qua cột suffix `_vi` / `_en`. App chọn locale dựa trên state UI (toggle) hoặc query param `?lang=en`. Fallback `vi` nếu thiếu field `_en`.

**ID / slug:** Dùng `kebab-case` (`investigator-terminal`). Lý do: URL-safe, SEO-friendly, không cần escape.

**Date:** `YYYY-MM` cho tháng, `YYYY-MM-DD` nếu cần chính xác ngày.

**Multi-value fields:**
- **Short enums** (`tags`, `tech_stack`) → comma-separated. Lý do: dễ nhập trong Sheets, không có dấu phẩy trong từng item.
- **Long bullets** (`highlights_*`, `achievements_*`) → newline-separated (Alt+Enter). Lý do: câu dài có thể chứa dấu phẩy, comma-split sẽ sai.

**Empty cells:** Coi như `null`. Client filter trước khi render.

**Order field:** Dùng integer cho sort. Cho phép chèn giữa bằng cách dùng khoảng 10-step (10, 20, 30...).

---

## Access

- **Sheet ID:** đọc từ `app/.env` → `GOOGLE_SHEET_ID`
- **API key:** đọc từ `app/.env` → `GOOGLE_API_KEY`
- **Sharing:** Sheet phải set "Anyone with the link: Viewer" để API key đọc được mà không cần OAuth. Google Sheets API v4 accept API key cho public-read.
- **Rate limit:** 300 requests/phút/project → T-011 phải cache (SWR maxAge 300s).

---

## Change log

| Version | Date       | Change                                   |
|---------|------------|------------------------------------------|
| 1.0     | 2026-04-21 | Initial schema (T-010). Song ngữ per D-004. |
| 2.0     | 2026-05-04 | Merge CaseStudies vào Projects (optional case study fields). Thêm sheets Experience, TechStack, Education. Xoá sheet CaseStudies. |
| 2.1     | 2026-05-09 | Profile: thêm Hero copy keys (`hero_badge`, `hero_tagline`, `hero_about_label`, `hero_about_body`, `hero_status`); chuẩn hoá URL keys (`github_url`, `linkedin_url`, `resume_url`). Sửa case-study route reference từ `/projects/[slug]` → `/case-studies/[slug]` (post-T-021 superseded). Thêm seed CSV mẫu trong `StrategicAnalyst/docs/seeds/`. |
