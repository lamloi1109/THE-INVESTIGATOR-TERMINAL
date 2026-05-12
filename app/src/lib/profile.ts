/**
 * profile.ts — Centralised Profile sheet fetch + fallback.
 * Task: T-026
 *
 * Profile is a key/value store (one row per field). This helper:
 * 1. Tries fetchSheet('Profile') — returns bilingual `{key, value_vi, value_en}` rows.
 * 2. Maps to `Record<key, {vi, en}>` for O(1) lookup.
 * 3. Layers committed fallback defaults underneath so a missing key (or full
 *    Sheets outage) never crashes prerender — satisfies S6 static guarantee.
 * 4. Exposes `getProfile(lang)` returning a flat object resolved to the chosen
 *    language. Components consume this instead of `_vi`/`_en` pairs.
 */
import { fetchSheet } from './sheets';

/** Canonical key set + VI/EN defaults. Keep in sync with SHEETS_SCHEMA v2.1. */
const FALLBACK: Record<string, { vi: string; en: string }> = {
  name:               { vi: 'Lâm Phước Lợi',   en: 'Phuoc Loi Lam' },
  email:              { vi: 'lamloi12a1@gmail.com', en: 'lamloi12a1@gmail.com' },
  location:           { vi: 'TP. Hồ Chí Minh, Việt Nam', en: 'Ho Chi Minh City, Vietnam' },
  github_url:         { vi: 'https://github.com/lamloi1109', en: 'https://github.com/lamloi1109' },
  linkedin_url:       { vi: 'https://linkedin.com/in/lamloi', en: 'https://linkedin.com/in/lamloi' },
  resume_url:         { vi: '/resume.pdf',     en: '/resume.pdf' },
  hero_badge:         { vi: 'Kỹ sư AI & Lập trình Fullstack', en: 'AI Engineer & Fullstack Developer' },
  hero_tagline:       { vi: 'Xây dựng tương lai với AI và phát triển Full-Stack', en: 'Building the Future with AI & Full-Stack Development' },
  hero_about_label:   { vi: 'Giới thiệu',      en: 'About Me' },
  hero_about_body: {
    vi: 'Tôi là một <strong>Kỹ sư AI & Full-Stack Developer</strong> đam mê xây dựng các hệ thống thông minh giải quyết vấn đề thực tế. Chuyên sâu về <strong>tích hợp LLM, agentic pipelines</strong>, và ứng dụng web có khả năng mở rộng — nơi nghiên cứu chuyên sâu gặp gỡ code production.',
    en: "I'm an <strong>AI Engineer &amp; Full-Stack Developer</strong> passionate about building intelligent systems that solve real-world problems. I specialise in <strong>LLM integrations, agentic pipelines</strong>, and scalable web applications — where deep research meets production-grade code.",
  },
  hero_status:        { vi: '● Sẵn sàng làm việc', en: '● Available for work' },
  contact_cta_title:  { vi: 'Cùng build something?', en: "Let's build something?" },
  contact_cta_body:   {
    vi: 'Mình luôn mở cho các cơ hội thú vị — AI systems, fullstack projects, hay một buổi tech talk.',
    en: 'Always open to interesting opportunities — AI systems, fullstack projects, or a tech talk.',
  },
  contact_cta_button: { vi: 'Gửi lời chào ✦',  en: 'Say hello ✦' },
};

export type ProfileKey = keyof typeof FALLBACK;
export type Lang = 'vi' | 'en';

/**
 * Resolved profile for a given language. All keys guaranteed non-empty
 * (falls back per-key if Sheets row missing or `value_<lang>` blank).
 */
export type ResolvedProfile = Record<ProfileKey, string>;

let cachedRaw: Record<string, { vi: string; en: string }> | null = null;

async function loadRaw(): Promise<Record<string, { vi: string; en: string }>> {
  if (cachedRaw) return cachedRaw;
  try {
    const rows = await fetchSheet('Profile');
    const map: Record<string, { vi: string; en: string }> = {};
    for (const r of rows) {
      if (!r.key) continue;
      map[r.key] = {
        vi: r.value_vi || '',
        en: r.value_en || '',
      };
    }
    cachedRaw = map;
  } catch (error) {
    console.warn('[profile] Sheets unavailable; using hardcoded fallback.', error);
    cachedRaw = {};
  }
  return cachedRaw;
}

export async function getProfile(lang: Lang = 'vi'): Promise<ResolvedProfile> {
  const raw = await loadRaw();
  const out = {} as ResolvedProfile;
  for (const k of Object.keys(FALLBACK) as ProfileKey[]) {
    const sheetVal = raw[k]?.[lang];
    const fallback = FALLBACK[k][lang] || FALLBACK[k].vi;
    out[k] = sheetVal && sheetVal.trim() ? sheetVal : fallback;
  }
  return out;
}
