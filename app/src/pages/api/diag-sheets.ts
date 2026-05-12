/**
 * /api/_diag-sheets — runtime health check for Google Sheets wiring.
 *
 * Reports: env vars present? Sheets URL constructed? HTTP status? sample
 * row? Returns JSON; no caching. Delete after diagnosis or hide behind
 * a query token if it leaks anything sensitive (currently safe — API key
 * NOT echoed back, only its presence).
 */
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const sheetId = import.meta.env.GOOGLE_SHEET_ID;
  const apiKey = import.meta.env.GOOGLE_API_KEY;

  const out: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      GOOGLE_SHEET_ID_present: !!sheetId,
      GOOGLE_SHEET_ID_length: sheetId ? sheetId.length : 0,
      GOOGLE_API_KEY_present: !!apiKey,
      GOOGLE_API_KEY_length: apiKey ? apiKey.length : 0,
    },
  };

  if (!sheetId || !apiKey) {
    out.error = 'env vars missing — Vercel Settings → Environment Variables → add GOOGLE_SHEET_ID + GOOGLE_API_KEY, then redeploy.';
    return new Response(JSON.stringify(out, null, 2), {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }

  // Probe each tab
  const tabs = ['Profile', 'Projects', 'Experience', 'TechStack', 'Education'];
  const results: Record<string, unknown> = {};

  for (const tab of tabs) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab)}?key=${apiKey}`;
    try {
      const r = await fetch(url);
      const body = await r.text();
      let parsed: any = null;
      try { parsed = JSON.parse(body); } catch {}
      results[tab] = {
        http_status: r.status,
        ok: r.ok,
        error_message: parsed?.error?.message ?? null,
        error_status: parsed?.error?.status ?? null,
        header_row: parsed?.values?.[0] ?? null,
        data_rows: Array.isArray(parsed?.values) ? Math.max(0, parsed.values.length - 1) : null,
        first_data_row: parsed?.values?.[1] ?? null,
      };
    } catch (e: any) {
      results[tab] = { fetch_failed: true, message: e?.message ?? String(e) };
    }
  }

  out.sheets = results;
  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};
