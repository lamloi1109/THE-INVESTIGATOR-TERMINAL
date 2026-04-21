// app/src/lib/sheets.ts
import { withSWR } from './cache';

// --- Types & Interfaces ---
export interface ProfileConfig {
  key: string;
  value_vi: string;
  value_en: string;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  tags: string;
  date: string;
  highlights: string;
}

export interface CaseStudyData {
  id: string;
  slug: string;
  title: string;
  problem: string;
  solution: string;
  result: string;
  tech_stack: string;
}

// Map các sheet với kiểu dữ liệu tương ứng
type SheetTypes = {
  'Profile': ProfileConfig;
  'Projects': ProjectData;
  'CaseStudies': CaseStudyData;
};

// --- Config Variables ---
// Trong Astro, biến môi trường có tiền tố PUBLIC_ được expose ra client, 
// nhưng chúng ta chỉ fetch ở server nên dùng import.meta.env là an toàn.
const SHEET_ID = import.meta.env.GOOGLE_SHEET_ID;
const API_KEY = import.meta.env.GOOGLE_API_KEY;

// --- Exponential Backoff Fetcher ---
async function fetchWithRetry(url: string, retries = 3, baseDelay = 1000): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url);
    
    if (res.ok) return res;
    
    // Nếu lỗi 429 (Rate Limit) hoặc lỗi Server (5xx)
    if (res.status === 429 || res.status >= 500) {
      if (i === retries) throw new Error(`Google Sheets API failed after ${retries} retries.`);
      const delay = baseDelay * Math.pow(2, i); // 1s, 2s, 4s...
      console.warn(`[Retry] HTTP ${res.status}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    
    // Các lỗi khác (400, 401, 403, 404) ném lỗi luôn
    throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
  }
  throw new Error("Unknown fetch error");
}

// --- Main Core Function ---
export async function fetchSheet<K extends keyof SheetTypes>(sheetName: K): Promise<SheetTypes[K][]> {
  if (!SHEET_ID || !API_KEY) {
    throw new Error("Missing GOOGLE_SHEET_ID or GOOGLE_API_KEY in .env");
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}?key=${API_KEY}`;

  // Đóng gói hàm gọi API vào SWR cache
  return withSWR(`sheet_${sheetName}`, async () => {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (!data.values || data.values.length === 0) {
      return [];
    }

    // Tách mảng đa chiều thành Headers và Rows
    const [headers, ...rows] = data.values as string[][];

    // Map dữ liệu mảng thành Array of Objects
    return rows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = row[index] || ""; // Xử lý ô trống
      });
      return obj as SheetTypes[K];
    });
  });
}