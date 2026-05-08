// app/src/lib/sheets.ts
import { withSWR } from './cache';

// --- Types & Interfaces (Bilingual & Parsed) ---

export interface ProfileEntry {
  key: string;
  value_vi: string;
  value_en: string;
}

export interface ProjectData {
  id: string;
  title_vi: string;
  title_en: string;
  description_vi: string;
  description_en: string;
  tags: string[]; // Parsed from comma-separated string
  date: string;
  highlights_vi: string[]; // Parsed from newline-separated string
  highlights_en: string[]; // Parsed from newline-separated string
  // Case study fields (optional — if filled, project gets detail page)
  slug?: string;
  icon?: string;
  icon_variant?: string;
  problem_vi?: string;
  problem_en?: string;
  solution_vi?: string;
  solution_en?: string;
  result_vi?: string;
  result_en?: string;
  tech_stack?: string[]; // Parsed from comma-separated string
  repo_url?: string;
  live_url?: string;
}

export interface ExperienceData {
  id: string;
  company_vi: string;
  company_en: string;
  role_vi: string;
  role_en: string;
  period: string;
  badge_vi?: string;
  badge_en?: string;
  achievements_vi: string[]; // Parsed from newline-separated string
  achievements_en: string[]; // Parsed from newline-separated string
  order: number;
}

export interface TechStackData {
  id: string;
  group_vi: string;
  group_en: string;
  label: string;
  variant: string; // g/c/p/w
  order: number;
}

export interface EducationData {
  id: string;
  icon: string;
  icon_variant: string;
  degree_vi: string;
  degree_en: string;
  school_vi: string;
  school_en: string;
  year_vi: string;
  year_en: string;
  order: number;
}

type SheetTypes = {
  'Profile': ProfileEntry;
  'Projects': ProjectData;
  'Experience': ExperienceData;
  'TechStack': TechStackData;
  'Education': EducationData;
};

// --- Config Variables ---
const SHEET_ID = import.meta.env.GOOGLE_SHEET_ID;
const API_KEY = import.meta.env.GOOGLE_API_KEY;

// --- Exponential Backoff Fetcher ---
async function fetchWithRetry(url: string, retries = 3, baseDelay = 1000): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url);
    if (res.ok) return res;

    if (res.status === 429 || res.status >= 500) {
      if (i === retries) throw new Error(`Google Sheets API failed after ${retries} retries.`);
      const delay = baseDelay * Math.pow(2, i);
      console.warn(`[Retry] HTTP ${res.status}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
  }
  throw new Error("Unknown fetch error");
}

// --- Main Core Function (with Centralized Parsing) ---
export async function fetchSheet<K extends keyof SheetTypes>(sheetName: K): Promise<SheetTypes[K][]> {
  if (!SHEET_ID || !API_KEY) {
    throw new Error("Missing GOOGLE_SHEET_ID or GOOGLE_API_KEY in .env");
  }

  // Defensive Code: encodeURIComponent
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;

  return withSWR(`sheet_${sheetName}`, async () => {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (!data.values || data.values.length === 0) return [];

    const [headers, ...rows] = data.values as string[][];

    return rows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        const key = header.trim();
        const rawValue = row[index] || "";

        // CHUẨN HÓA DATA THEO SCHEMA BILINGUAL
        if (key === 'tags' || key === 'tech_stack') {
          // Comma-split, remove whitespace, filter empty strings
          obj[key] = rawValue ? rawValue.split(',').map(s => s.trim()).filter(Boolean) : [];
        }
        else if (key.startsWith('highlights_') || key.startsWith('achievements_')) {
          // Newline-split, clean up markdown dash "- ", filter empty strings
          obj[key] = rawValue ? rawValue.split('\n').map(s => s.replace(/^- /, '').trim()).filter(Boolean) : [];
        }
        else if (key === 'order') {
          // Parse to number for sort ordering
          obj[key] = rawValue ? parseInt(rawValue, 10) : 0;
        }
        else {
          // Standard fields (id, title_vi, description_en, etc.)
          obj[key] = rawValue;
        }
      });
      return obj as SheetTypes[K];
    });
  });
}
