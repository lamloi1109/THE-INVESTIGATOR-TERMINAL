# Google Sheets Schema — THE INVESTIGATOR TERMINAL

> Source-of-truth cho structure của Google Sheet CMS.
> Mọi thay đổi schema phải update file này **trước** khi sửa sheet, để agent đồng bộ.
> Sheet ID lưu trong `app/.env` (`GOOGLE_SHEET_ID`). Không commit ID vào repo.

**Related:**
- Tasks: T-010 (design + seed), T-011 (API client), T-020/T-021/T-022 (consume)
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
`name`, `title`, `summary`, `email`, `location`, `github`, `linkedin`.

**Parse convention:** map thành `Record<string, { vi: string; en: string }>` để lookup O(1).

---

## Sheet 2: `Projects`

Danh sách projects portfolio. Render ở trang `/projects` (T-021) dưới dạng card grid.

| Column           | Type              | Required | Note                                   |
|------------------|-------------------|----------|----------------------------------------|
| `id`             | string (kebab)    | ✅       | unique. Ví dụ: `investigator-terminal` |
| `title_vi`       | string            | ✅       |                                        |
| `title_en`       | string            | ✅       |                                        |
| `description_vi` | string            | ✅       | 1–2 câu, ≤ 200 ký tự                   |
| `description_en` | string            | ✅       |                                        |
| `tags`           | comma-separated   | ✅       | Ví dụ: `astro,preact,gemini`           |
| `date`           | YYYY-MM           | ✅       | Ví dụ: `2026-04`                       |
| `highlights_vi`  | newline-separated | optional | Mỗi dòng = 1 bullet. Dùng **Alt+Enter** trong cell |
| `highlights_en`  | newline-separated | optional |                                        |

**Parse convention:**
```ts
tags: row.tags.split(',').map(s => s.trim()).filter(Boolean)
highlights_vi: row.highlights_vi.split('\n').map(s => s.trim()).filter(Boolean)
```

**Seed tối thiểu:** 3 projects.

---

## Sheet 3: `CaseStudies`

Long-form deep-dive cho projects selected. Render ở `/case-studies/[slug]` (T-022) dưới dạng trang chi tiết kiểu blog.

| Column        | Type              | Required | Note                              |
|---------------|-------------------|----------|-----------------------------------|
| `id`          | string (kebab)    | ✅       | unique                            |
| `slug`        | string (kebab)    | ✅       | URL-safe, unique, `[a-z0-9-]+`    |
| `title_vi`    | string            | ✅       |                                   |
| `title_en`    | string            | ✅       |                                   |
| `problem_vi`  | long text         | ✅       | 2–4 câu bối cảnh + vấn đề         |
| `problem_en`  | long text         | ✅       |                                   |
| `solution_vi` | long text         | ✅       | 3–5 đoạn, có thể nhiều dòng       |
| `solution_en` | long text         | ✅       |                                   |
| `result_vi`   | long text         | ✅       | Số liệu cụ thể nếu có             |
| `result_en`   | long text         | ✅       |                                   |
| `tech_stack`  | comma-separated   | ✅       | Ví dụ: `astro,preact,vercel`      |

**Parse convention:** giống Projects. `slug` phải hợp lệ URL → lowercase, hyphen-only.

**Seed tối thiểu:** 2 case studies.

---

## Conventions chung

**Ngôn ngữ (D-004):** Song ngữ qua cột suffix `_vi` / `_en`. App chọn locale dựa trên state UI (toggle) hoặc query param `?lang=en`. Fallback `vi` nếu thiếu field `_en`.

**ID / slug:** Dùng `kebab-case` (`investigator-terminal`). Lý do: URL-safe, SEO-friendly, không cần escape.

**Date:** `YYYY-MM` cho tháng, `YYYY-MM-DD` nếu cần chính xác ngày.

**Multi-value fields:**
- **Short enums** (`tags`, `tech_stack`) → comma-separated. Lý do: dễ nhập trong Sheets, không có dấu phẩy trong từng item.
- **Long bullets** (`highlights_*`) → newline-separated (Alt+Enter). Lý do: câu dài có thể chứa dấu phẩy, comma-split sẽ sai.

**Empty cells:** Coi như `null`. Client filter trước khi render.

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
