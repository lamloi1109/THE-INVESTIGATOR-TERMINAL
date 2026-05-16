# Sheets Seed CSVs

> Sample data để paste vào Google Sheets (one tab per CSV).
> Schema reference: [`../SHEETS_SCHEMA.md`](../SHEETS_SCHEMA.md) v2.1.

## Cách dùng

1. Mở Google Sheet (`GOOGLE_SHEET_ID` trong `app/.env`).
2. Tạo 5 tab với tên **chính xác**: `Profile`, `Projects`, `Experience`, `TechStack`, `Education`.
3. Mỗi tab → File → Import → Upload file `.csv` tương ứng → "Replace current sheet".
   *Hoặc* mở `.csv` trong text editor → copy toàn bộ → paste vào ô A1.
4. Verify: hàng 1 là header, không có dòng trống, encoding UTF-8.
5. Sheet phải set **Anyone with the link: Viewer** để API key đọc được.

## Multi-line cell (Alt+Enter)

Các field `highlights_vi/en`, `achievements_vi/en`, `problem_vi/en`, `solution_vi/en`, `result_vi/en` chứa newline trong 1 ô. CSV escape bằng `"…"` (toàn cell wrap quote, `\n` thực bên trong). Khi paste, Google Sheets hiểu được. Nếu gõ tay trong Sheets thì dùng **Alt+Enter** để xuống dòng trong ô.

## Files

| File | Tab name | Rows seed |
|------|----------|-----------|
| `profile.csv` | Profile | 18 keys (identity + Hero copy + Contact CTA) |
| `projects.csv` | Projects | 6 dự án (2 có case study đầy đủ) |
| `experience.csv` | Experience | 1 công ty (7 achievements) |
| `tech-stack.csv` | TechStack | 24 pills (4 groups) |
| `education.csv` | Education | 2 entries |

Source nội dung: app/src/components/* hiện đang hardcode → đã extract về CSV để cuối cùng wire qua T-026.
