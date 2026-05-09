/**
 * projects.ts — Centralized project data + case study content.
 *
 * Hardcoded for now (Google Sheets wiring deferred).
 * Projects with `problem` + `solution` + `result` get a detail page at `/case-studies/[slug]`.
 *
 * Source: app/src/components/Projects.astro (migrated here for reuse across
 * homepage cards + detail page routes).
 */

export interface ProjectDetail {
  id: string;
  slug: string;
  icon: string;
  iconVariant: 'cyan' | 'green' | 'pink';
  name: string;
  desc: string;
  tags: string[];
  /** Case study fields — all 3 required for detail page to be generated */
  problem?: string;
  solution?: string;
  result?: string;
  techStack?: string[];
  highlights?: string[];
  repoUrl?: string;
  liveUrl?: string;
}

export const projects: ProjectDetail[] = [
  {
    id: 'realtime-env-monitor',
    slug: 'realtime-env-monitor',
    icon: '\u{1F4E1}',
    iconVariant: 'cyan',
    name: 'Realtime Environment Monitor',
    desc: 'App quan trắc realtime dùng Windows File Watcher + WebSocket. Dữ liệu từ datalogger hiển thị ngay khi file được ghi vào thư mục — không cần polling.',
    tags: ['C# / .NET', 'WebSocket', 'File Watcher', 'Realtime'],
    problem: 'Nhà máy sử dụng datalogger ghi dữ liệu môi trường (nhiệt độ, độ ẩm, áp suất) ra file CSV mỗi 5 giây. Hệ thống cũ dùng polling định kỳ 30 giây để đọc file mới — gây trễ hiển thị, mất data giữa 2 lần poll, và tốn CPU vì liên tục scan thư mục. Kỹ sư vận hành muốn thấy số liệu ngay lập tức trên dashboard mà không cần refresh trang.',
    solution: 'Thay thế polling bằng Windows File Watcher API (FileSystemWatcher trong C# .NET). Khi datalogger ghi file mới, FileSystemWatcher bắt event Created/Changed ngay lập tức và parse CSV.\n\nDữ liệu được push qua WebSocket tới tất cả client đang kết nối, không cần client poll server. Kiến trúc:\n\n▸ FileSystemWatcher monitor thư mục đích\n▸ CSV Parser xử lý file mới trong < 50ms\n▸ WebSocket Hub broadcast dữ liệu tới dashboard\n▸ Dashboard render chart realtime (cập nhật không flicker)\n\nBackend dùng ASP.NET Core với SignalR cho WebSocket management. Frontend là SPA nhẹ với chart library render dữ liệu streaming.',
    result: '▸ Độ trễ từ khi datalogger ghi file đến khi hiển thị trên dashboard: < 200ms (giảm từ 30s xuống 150×)\n▸ CPU usage giảm 80% so với polling (không còn scan thư mục liên tục)\n▸ Không mất data giữa các lần đọc — mọi file đều được xử lý\n▸ Hỗ trợ nhiều dashboard client đồng thời qua WebSocket multiplexing\n▸ Được deploy và chạy ổn định trong môi trường sản xuất 24/7',
    techStack: ['C#', '.NET', 'ASP.NET Core', 'SignalR', 'WebSocket', 'FileSystemWatcher', 'CSV Parser'],
  },
  {
    id: 'ai-internal-server',
    slug: 'ai-internal-server',
    icon: '\u{1F916}',
    iconVariant: 'green',
    name: 'AI Internal Server',
    desc: 'Hạ tầng AI nội bộ đầy đủ stack: OpenWebUI · vLLM · LightRAG · LangGraph · Docling · Qdrant · MinIO · Redis. Tự research + vibe coding.',
    tags: ['vLLM', 'LangGraph', 'LightRAG', 'Qdrant', 'MinIO'],
    problem: 'Công ty cần triển khai AI nội bộ nhưng không muốn gửi dữ liệu nhạy cảm ra ngoài (compliance). Các giải pháp SaaS (ChatGPT, Claude) bị chặn bởi chính sách bảo mật. Nhân viên cần chatbot thông minh để tra cứu tài liệu kỹ thuật, tổng hợp báo cáo, và hỗ trợ code — tất cả phải chạy on-premise.',
    solution: 'Xây dựng full-stack AI server on-premise với các component:\n\n▸ vLLM: Serve model LLM (Qwen, Llama) với GPU inference, hỗ trợ batching + continuous generation\n▸ OpenWebUI: Giao diện chat cho nhân viên, tương tự ChatGPT nhưng nội bộ\n▸ LightRAG: Retrieval-Augmented Generation cho tài liệu kỹ thuật (manual, SOP, báo cáo)\n▸ LangGraph: Orchestrate multi-step agent workflows (phân tích đơn hàng, tổng hợp báo cáo)\n▸ Docling: Parse PDF/DOCX/PPTX thành structured text cho RAG pipeline\n▸ Qdrant: Vector database cho semantic search trên tài liệu\n▸ MinIO: Object storage cho file upload + document management\n▸ Redis: Cache layer cho session + frequent queries\n\nToàn bộ hệ thống đóng gói bằng Docker Compose, deploy trên server có GPU (NVIDIA A100/RTX 4090). Tự research và implement từ đầu đến cuối.',
    result: '▸ Serve 20+ người dùng nội bộ đồng thời với latency < 2s/token\n▸ RAG accuracy > 85% trên tài liệu kỹ thuật công ty\n▸ Giảm 70% thời gian tra cứu tài liệu cho kỹ sư\n▸ Zero data leakage — toàn bộ chạy on-premise, không ra internet\n▸ Chi phí vận hành chỉ là điện + phần cứng, không có API billing hàng tháng\n▸ Được ban lãnh đạo approve và expand cho các phòng ban khác',
    techStack: ['vLLM', 'OpenWebUI', 'LightRAG', 'LangGraph', 'Docling', 'Qdrant', 'MinIO', 'Redis', 'Docker Compose', 'NVIDIA GPU'],
  },
  {
    id: 'qr-production-scanner',
    slug: 'qr-production-scanner',
    icon: '\u{1F4F1}',
    iconVariant: 'pink',
    name: 'QR Production Scanner',
    desc: 'Ứng dụng quét QR quản lý sản xuất bình ắc quy tại xưởng. Theo dõi công đoạn, tính hiệu suất theo ca/ngày/dây chuyền.',
    tags: ['QR Code', 'Production', 'Analytics'],
  },
  {
    id: 'excel-multi-sheet-mailer',
    slug: 'excel-multi-sheet-mailer',
    icon: '\u{1F4CA}',
    iconVariant: 'green',
    name: 'Excel Multi-Sheet Mailer',
    desc: 'Gửi email kèm Excel multi-sheet qua XML — phá vỡ giới hạn 10+ năm của hệ thống cũ vốn chỉ nhúng HTML thô vào body mail.',
    tags: ['XML', 'Excel', 'SMTP'],
  },
  {
    id: 'excel-direct-import',
    slug: 'excel-direct-import',
    icon: '\u{1F4C2}',
    iconVariant: 'cyan',
    name: 'Excel Direct Import',
    desc: 'Đọc dữ liệu trực tiếp từ .xlsx không qua bước convert trung gian, giảm sai sót và tăng tốc pipeline xử lý dữ liệu đầu vào.',
    tags: ['Python', 'openpyxl', 'Data Pipeline'],
  },
  {
    id: 'investigator-terminal',
    slug: 'investigator-terminal',
    icon: '⚡',
    iconVariant: 'pink',
    name: 'The Investigator Terminal',
    desc: 'Portfolio này — particle plexus, custom cursor, scan-lines, AI chat agent. Astro + Tailwind v4, vanilla canvas FX.',
    tags: ['Astro', 'Canvas API', 'AI Agent'],
  },
];

/** Find a project by its URL slug */
export function getProjectBySlug(slug: string): ProjectDetail | undefined {
  return projects.find(p => p.slug === slug);
}

/** Get only projects that have full case study content (for detail page generation) */
export function getProjectsWithCaseStudy(): ProjectDetail[] {
  return projects.filter(p => p.problem && p.solution && p.result);
}

/** Check if a project has a detail page */
export function hasCaseStudy(p: ProjectDetail): boolean {
  return Boolean(p.problem && p.solution && p.result);
}
