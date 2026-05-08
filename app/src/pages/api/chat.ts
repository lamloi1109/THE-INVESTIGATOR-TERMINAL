import type { APIRoute } from 'astro';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, type ModelMessage } from 'ai';
import { fetchSheet, type EducationData, type ExperienceData, type ProfileEntry, type ProjectData, type TechStackData } from '../../lib/sheets';

export const prerender = false;

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1_000;
const MAX_CONTEXT_ITEMS = 30;
const GEMINI_MODEL = import.meta.env.GEMINI_MODEL || 'gemini-1.5-flash';

type ChatRole = 'user' | 'assistant' | 'system';

type IncomingMessage = {
  role: ChatRole;
  content: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';

  return request.headers.get('x-real-ip') || 'unknown';
}

function enforceRateLimit(ip: string): Response | null {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return new Response('Rate limit exceeded. Try again shortly.', {
      status: 429,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Retry-After': String(retryAfterSeconds),
      },
    });
  }

  current.count += 1;
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeRole(value: unknown): ChatRole | null {
  if (value === 'user' || value === 'assistant' || value === 'system') return value;
  if (value === 'agent') return 'assistant';
  return null;
}

function normalizeContent(value: unknown): string | null {
  if (typeof value === 'string') return value.trim().slice(0, MAX_MESSAGE_LENGTH);

  if (Array.isArray(value)) {
    const text = value
      .filter(isRecord)
      .map(part => part.text)
      .filter((partText): partText is string => typeof partText === 'string')
      .join('\n')
      .trim();
    return text.slice(0, MAX_MESSAGE_LENGTH);
  }

  return null;
}

function normalizeHistory(value: unknown): IncomingMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-MAX_HISTORY_MESSAGES)
    .map(item => {
      if (!isRecord(item)) return null;
      const role = normalizeRole(item.role);
      const content = normalizeContent(item.content ?? item.text);
      if (!role || !content) return null;
      return { role, content };
    })
    .filter((item): item is IncomingMessage => item !== null);
}

function normalizePayload(value: unknown): { message: string; history: IncomingMessage[] } | null {
  if (!isRecord(value)) return null;

  const message = normalizeContent(value.message);
  if (!message) return null;

  return {
    message,
    history: normalizeHistory(value.history),
  };
}

async function readPayload(request: Request): Promise<{ message: string; history: IncomingMessage[] } | null> {
  try {
    const raw = await request.json();
    return normalizePayload(raw);
  } catch {
    return null;
  }
}

function toModelMessages(payload: { message: string; history: IncomingMessage[] }): ModelMessage[] {
  const messages: ModelMessage[] = payload.history.map(item => ({
    role: item.role,
    content: item.content,
  }));

  messages.push({
    role: 'user',
    content: payload.message,
  });

  return messages;
}

function listProfile(profile: ProfileEntry[]): string {
  return profile
    .slice(0, MAX_CONTEXT_ITEMS)
    .map(item => `- ${item.key}: vi="${item.value_vi}" | en="${item.value_en}"`)
    .join('\n');
}

function listProjects(projects: ProjectData[]): string {
  return projects
    .slice(0, MAX_CONTEXT_ITEMS)
    .map(project => {
      const details = [
        `id=${project.id}`,
        `title_vi="${project.title_vi}"`,
        `title_en="${project.title_en}"`,
        `date=${project.date}`,
        `tags=${project.tags.join(', ')}`,
        `description_vi="${project.description_vi}"`,
        `description_en="${project.description_en}"`,
        project.slug ? `slug=${project.slug}` : '',
        project.tech_stack?.length ? `tech_stack=${project.tech_stack.join(', ')}` : '',
        project.result_en ? `result_en="${project.result_en}"` : '',
      ].filter(Boolean);
      return `- ${details.join(' | ')}`;
    })
    .join('\n');
}

function listExperience(experience: ExperienceData[]): string {
  return experience
    .slice(0, MAX_CONTEXT_ITEMS)
    .sort((a, b) => a.order - b.order)
    .map(item => {
      const achievements = item.achievements_en.length > 0 ? item.achievements_en.join('; ') : item.achievements_vi.join('; ');
      return `- ${item.role_en || item.role_vi} at ${item.company_en || item.company_vi} (${item.period}): ${achievements}`;
    })
    .join('\n');
}

function listTechStack(techStack: TechStackData[]): string {
  return techStack
    .slice(0, MAX_CONTEXT_ITEMS)
    .sort((a, b) => a.order - b.order)
    .map(item => `- ${item.group_en || item.group_vi}: ${item.label}`)
    .join('\n');
}

function listEducation(education: EducationData[]): string {
  return education
    .slice(0, MAX_CONTEXT_ITEMS)
    .sort((a, b) => a.order - b.order)
    .map(item => `- ${item.degree_en || item.degree_vi}, ${item.school_en || item.school_vi}, ${item.year_en || item.year_vi}`)
    .join('\n');
}

async function buildPortfolioContext(): Promise<string> {
  const [profile, projects, experience, techStack, education] = await Promise.all([
    fetchSheet('Profile'),
    fetchSheet('Projects'),
    fetchSheet('Experience'),
    fetchSheet('TechStack'),
    fetchSheet('Education'),
  ]);

  return [
    'PROFILE',
    listProfile(profile),
    '',
    'PROJECTS',
    listProjects(projects),
    '',
    'EXPERIENCE',
    listExperience(experience),
    '',
    'TECH STACK',
    listTechStack(techStack),
    '',
    'EDUCATION',
    listEducation(education),
  ].join('\n');
}

function buildSystemPrompt(portfolioContext: string): string {
  return `You are The Investigator Agent, an AI portfolio assistant for PhuocLoi.

Answer only from the portfolio context below. If the answer is not present, say that the static portfolio data does not include it.
Be concise, technically specific, and useful to hiring managers or engineers.
Prefer English unless the user writes Vietnamese, then answer in Vietnamese.
Do not invent projects, metrics, employers, or credentials.

For project-list queries, include a compact structured block at the end:
\`\`\`json
{"type":"project_list","data":[{"title":"...","tags":["..."],"summary":"..."}]}
\`\`\`

For skills or tech stack queries, include:
\`\`\`json
{"type":"skill_list","data":{"group":["skill"]}}
\`\`\`

For career timeline or experience queries, include:
\`\`\`json
{"type":"timeline","data":[{"title":"...","period":"...","summary":"..."}]}
\`\`\`

PORTFOLIO CONTEXT:
${portfolioContext}`;
}

export const POST: APIRoute = async ({ request }) => {
  const payload = await readPayload(request);
  if (!payload) {
    return jsonResponse({ error: 'Expected JSON body: { message: string, history?: Message[] }' }, 400);
  }

  const rateLimitResponse = enforceRateLimit(getClientIp(request));
  if (rateLimitResponse) return rateLimitResponse;

  const apiKey = import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY || import.meta.env.GEMINI_API_KEY || import.meta.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY in environment.' }, 500);
  }

  try {
    const portfolioContext = await buildPortfolioContext();
    const google = createGoogleGenerativeAI({ apiKey });
    const result = streamText({
      model: google(GEMINI_MODEL),
      system: buildSystemPrompt(portfolioContext),
      messages: toModelMessages(payload),
      temperature: 0.2,
      maxOutputTokens: 1_024,
      abortSignal: request.signal,
    });

    return result.toUIMessageStreamResponse({
      headers: {
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
      },
      onError(error) {
        console.error('[api/chat] stream error', error);
        return 'The Investigator Agent could not complete the response.';
      },
    });
  } catch (error) {
    console.error('[api/chat] request failed', error);
    return jsonResponse({ error: 'The Investigator Agent is temporarily unavailable.' }, 500);
  }
};
