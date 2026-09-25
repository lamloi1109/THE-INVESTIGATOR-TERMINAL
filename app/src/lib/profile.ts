/**
 * profile.ts — Centralised Profile sheet fetch + fallback.
 * Task: T-026
 *
 * The verified CV is the source of truth for this application-specific profile.
 * Keeping it local prevents an older Google Sheet from replacing current contact
 * details or experience during a production build.
 */
/** Canonical bilingual profile fields sourced from the supplied CV. */
const FALLBACK: Record<string, { vi: string; en: string }> = {
  name:               { vi: 'Lâm Phước Lợi',   en: 'Phuoc Loi Lam' },
  email:              { vi: 'phuocloi1109.work@gmail.com', en: 'phuocloi1109.work@gmail.com' },
  phone:              { vi: '085 766 8241', en: '+84 85 766 8241' },
  location:           { vi: 'TP. Hồ Chí Minh, Việt Nam', en: 'Ho Chi Minh City, Vietnam' },
  resume_url:         { vi: 'mailto:phuocloi1109.work@gmail.com', en: 'mailto:phuocloi1109.work@gmail.com' },
  hero_badge:         { vi: 'IT Engineer · Manufacturing Applications', en: 'IT Engineer · Manufacturing Applications' },
  hero_tagline:       { vi: 'C#/.NET · Oracle SQL · Tích hợp hệ thống sản xuất', en: 'C#/.NET · Oracle SQL · Manufacturing Systems Integration' },
  hero_about_label:   { vi: 'Giới thiệu',      en: 'About Me' },
  hero_about_body: {
    vi: 'Kỹ sư IT có kinh nghiệm trực tiếp phát triển và bảo trì ứng dụng cho <strong>sản xuất và hỗ trợ vận hành</strong>. Nền tảng vững về <strong>C#/.NET, Oracle SQL, MySQL, SQLite, ETL, báo cáo BI</strong> và tích hợp thiết bị công nghiệp.',
    en: 'IT Engineer with hands-on experience developing and maintaining <strong>manufacturing and production-support applications</strong>, with a strong background in <strong>C#/.NET, Oracle SQL, ETL, BI reporting</strong>, and industrial device integration.',
  },
  hero_status:        { vi: '● Sẵn sàng làm việc', en: '● Available for work' },
  contact_cta_title:  { vi: 'Cùng trao đổi về cơ hội phù hợp', en: "Let's discuss the right opportunity" },
  contact_cta_body:   {
    vi: 'Tôi sẵn sàng trao đổi về cách kinh nghiệm phần mềm sản xuất, cơ sở dữ liệu và tích hợp công nghiệp có thể đóng góp cho đội ngũ của bạn.',
    en: 'I would welcome a conversation about contributing my manufacturing software, database, and industrial integration experience to your team.',
  },
  contact_cta_button: { vi: 'Liên hệ với tôi ✦',  en: 'Contact me ✦' },
};

export type ProfileKey = keyof typeof FALLBACK;
export type Lang = 'vi' | 'en';

/**
 * Resolved profile for a given language. All keys are guaranteed non-empty.
 */
export type ResolvedProfile = Record<ProfileKey, string>;

export async function getProfile(lang: Lang = 'vi'): Promise<ResolvedProfile> {
  const out = {} as ResolvedProfile;
  for (const k of Object.keys(FALLBACK) as ProfileKey[]) {
    const fallback = FALLBACK[k][lang] || FALLBACK[k].vi;
    out[k] = fallback;
  }
  return out;
}
