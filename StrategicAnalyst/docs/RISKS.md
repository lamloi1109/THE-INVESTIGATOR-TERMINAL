# Risk Register — THE INVESTIGATOR TERMINAL

**Convention:** khi một rủi ro **phát sinh thực tế** (materialise), **append** incident + mitigation mới vào cuối entry tương ứng — KHÔNG overwrite lịch sử. Nếu phát hiện rủi ro mới, thêm entry `Risk N+1` ở cuối file.

---

## Risk 1: Gemini Free Tier Rate Limit (429 errors)

| Aspect | Detail |
|--------|--------|
| **Xác suất** | CAO — 250 req/ngày cho Flash nghĩa là ~10 visitors/ngày nếu mỗi người chat 25 messages |
| **Impact** | Terminal ngừng hoạt động hoàn toàn khi hết quota |
| **Mitigation** | (1) Cache system prompt + sheets data để giảm token/request. (2) Rate limit phía client: max 20 req/phút/IP. (3) Khi hết quota → hiển thị graceful fallback: "Terminal đang nghỉ ngơi, mời đọc CV tĩnh bên dưới." (4) Cân nhắc rotate 2-3 Google Cloud projects nếu traffic cao. (5) Monitor daily usage qua Google Cloud Console. |
| **Owner** | PhuocLoi |
| **Linked tasks** | T-031 (rate limiting), T-040 (retry/backoff), T-050 (quota check) |

---

## Risk 2: Vercel Serverless Timeout (504 errors)

| Aspect | Detail |
|--------|--------|
| **Xác suất** | TRUNG BÌNH — Gemini Flash nhanh nhưng cold start + multi-step reasoning có thể > 10s |
| **Impact** | User nhận lỗi 504, ấn tượng xấu |
| **Mitigation** | (1) Bật Fluid Compute để giảm cold start. (2) Streaming response — gửi chunks ngay, không đợi hoàn tất. (3) Giữ system prompt gọn (< 50K tokens dù có 1M window). (4) Không dùng multi-step agent — single-turn inference only. (5) Set `maxDuration` trong vercel.json nếu cần (max 60s Hobby). |
| **Owner** | PhuocLoi |
| **Linked tasks** | T-002 (fluid compute), T-031 (streaming + single-turn) |

---

## Risk 3: Bundle Size vượt 50MB quality bar (hard limit 250MB)

| Aspect | Detail |
|--------|--------|
| **Xác suất** | THẤP nếu tuân thủ Preact — nhưng 1 lần import sai là đủ phá |
| **Impact** | Build fail (250MB) hoặc vi phạm S4 (50MB quality bar) |
| **Mitigation** | (1) Dùng Preact, KHÔNG cài React. (2) Audit dependencies mỗi khi thêm package mới: `du -sh node_modules/PACKAGE`. (3) CI check: thêm step kiểm tra bundle size trong build script. (4) Tránh import AI SDK modules không cần thiết (chỉ import functions dùng). |
| **Owner** | PhuocLoi |
| **Linked tasks** | T-041 (bundle audit), T-001 AC (no React check) |

---

## Risk 4: Portfolio bị đánh giá là "gimmick"

| Aspect | Detail |
|--------|--------|
| **Xác suất** | TRUNG BÌNH — terminal UI đã bão hòa trên thị trường |
| **Impact** | Hiring manager bỏ qua sau 15 giây |
| **Mitigation** | (1) Trang chủ PHẢI là static, dễ đọc — terminal chỉ là feature phụ. (2) Case studies dạng long-form với problem → solution → measurable result. (3) Blog post giải thích kiến trúc (AI-Fluent Documentation). (4) Metadata/OG tags tốt để link preview trên LinkedIn/email không bị trống. |
| **Owner** | PhuocLoi |
| **Linked tasks** | T-020/T-021/T-022 (SSG first), T-042 (fallback content), T-043 (blog) |

---

## Risk 5: Google Sheets API reliability + rate limit

| Aspect | Detail |
|--------|--------|
| **Xác suất** | THẤP — SWR cache giảm đáng kể số call |
| **Impact** | Trang tĩnh không render được data nếu API down lúc build |
| **Mitigation** | (1) SWR cache maxAge=5min, stale=1hr — hầu hết request không gọi API. (2) Build-time fallback: lưu snapshot JSON cuối cùng trong repo làm fallback data. (3) Exponential backoff trên mọi Sheets API call. (4) Monitor qua Google Cloud Console quota dashboard. |
| **Owner** | PhuocLoi |
| **Linked tasks** | T-011 (SWR cache + backoff), T-040 (shared retry util) |

---

## Incident Log

*(Chưa có. Append format:)*

```
### YYYY-MM-DD — Risk N triggered
- What happened: <1-2 lines>
- Detected by: <log / user report / monitor>
- Resolution: <what was done>
- New mitigation added: <if any, and which Risk entry updated>
```
