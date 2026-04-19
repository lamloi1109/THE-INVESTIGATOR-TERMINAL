# PRD — THE INVESTIGATOR TERMINAL

## Problem Statement

PhuocLoi cần một portfolio site chứng minh năng lực AI Engineer thực chiến (RAG, structured outputs, system design) — không phải một trang "about me" tĩnh hay chatbot gimmick. Site phải chạy hoàn toàn trên hạ tầng miễn phí ($0/tháng) và vẫn đạt trải nghiệm nhanh như static site.

## Success Criteria (đo được)

| # | Tiêu chí | Ngưỡng đạt |
|---|----------|-----------|
| S1 | Lighthouse Performance score (trang tĩnh) | ≥ 95 |
| S2 | Time to First Byte (SSG pages) | < 100ms |
| S3 | Terminal response latency (P95) | < 3 giây |
| S4 | Bundle size (serverless function) | < 50MB uncompressed |
| S5 | Tổng chi phí vận hành hàng tháng | $0 |
| S6 | Trang tĩnh fallback đọc được toàn bộ CV + case study mà không cần chat | 100% nội dung có sẵn |
| S7 | Không lỗi 429/504 dưới tải bình thường (< 50 visitors/ngày) | 0 lỗi |

## Non-goals (KHÔNG làm)

- **Không** xây hệ thống auth/login
- **Không** dùng database trả phí (Supabase, PlanetScale, etc.)
- **Không** xây admin dashboard cho CMS — edit trực tiếp trên Google Sheets
- **Không** dùng React (bundle quá nặng ~40KB) — chỉ Preact hoặc Svelte
- **Không** animation 3D, particle effects, hay bất kỳ visual gimmick nào
- **Không** multi-language UI (chỉ tiếng Anh, nội dung CV song ngữ nằm trong data)
- **Không** xây vector database riêng — dùng in-context RAG qua Gemini 1M token window

## Tech Stack + Lý do

| Layer | Lựa chọn | Lý do |
|-------|---------|-------|
| Framework | **Astro 5.x** (output: hybrid) | Islands Architecture, zero-JS mặc định, SSG + SSR hybrid |
| UI Islands | **Preact** (3KB gzipped) | Tương thích React API nhưng nhẹ hơn 13x, tránh lỗi bundle size |
| AI SDK | **Vercel AI SDK** | `createUIMessageStream` cho Generative UI, Data Stream Protocol |
| AI Model | **Gemini 1.5 Flash** | 1M token context (in-context RAG), structured outputs, free tier 250 req/ngày |
| CMS | **Google Sheets API v4** | Zero-cost, dễ edit, API đủ nhanh với SWR cache |
| Hosting | **Vercel Hobby** | Free, edge CDN, serverless functions, Fluid Compute |
| Styling | **Tailwind CSS** (hoặc UnoCSS) | Utility-first, purge tốt, nhẹ |
