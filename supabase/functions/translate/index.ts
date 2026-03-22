/**
 * Supabase Edge Function — Google Translate API Proxy
 *
 * Translates text from English to Setswana (or other languages)
 * without exposing the Google API key to the frontend.
 *
 * Supports:
 *   - Single text:  { text: string, targetLang, sourceLang, format }
 *   - Batch texts:  { texts: string[], targetLang, sourceLang, format }
 *
 * Deploy:
 *   supabase functions deploy translate
 *   supabase secrets set GOOGLE_TRANSLATE_API_KEY=your_key_here
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { fetchWithRetry } from '../_shared/fetchWithRetry.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

// V-07 remediation: localhost origins only included when ENVIRONMENT env var is set to 'development'
const PRODUCTION_ORIGINS = [
  'https://hackathonteamproject.github.io',
  'https://byters67.github.io',
];
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
];
const isDev = Deno.env.get('ENVIRONMENT') === 'development';
const ALLOWED_ORIGINS = isDev ? [...PRODUCTION_ORIGINS, ...DEV_ORIGINS] : PRODUCTION_ORIGINS;

const SUPABASE_URL_TRANSLATE = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY_TRANSLATE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// --- PERSISTENT RATE LIMITING (uses rate_limits table from migration 015) ---
async function isRateLimited(
  ip: string,
  formType: string,
  maxPerWindow: number,
): Promise<boolean> {
  if (!SUPABASE_URL_TRANSLATE || !SUPABASE_SERVICE_KEY_TRANSLATE) return false;

  const ipHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(ip),
  ).then(buf =>
    [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join(''),
  );

  const cutoff = new Date(Date.now() - 60000).toISOString();
  const countRes = await fetch(
    `${SUPABASE_URL_TRANSLATE}/rest/v1/rate_limits?select=id&ip_hash=eq.${ipHash}&form_type=eq.${formType}&submitted_at=gte.${cutoff}`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY_TRANSLATE,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY_TRANSLATE}`,
        Prefer: 'count=exact',
      },
    },
  );
  const count = parseInt(
    countRes.headers.get('content-range')?.split('/')[1] || '0',
  );

  if (count >= maxPerWindow) return true;

  await fetch(`${SUPABASE_URL_TRANSLATE}/rest/v1/rate_limits`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY_TRANSLATE,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY_TRANSLATE}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ip_hash: ipHash, form_type: formType }),
  });

  return false;
}

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  /* ── CORS preflight ── */
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    // Rate limiting — 30 requests per minute
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (await isRateLimited(clientIp, 'translate', 30)) {
      return jsonResponse({ error: 'Too many requests. Please wait a moment.' }, 429, cors);
    }

    if (!GOOGLE_API_KEY) {
      return jsonResponse(
        { error: 'Translation API key not configured' },
        500, cors,
      );
    }

    const body = await req.json();
    const {
      text,
      texts,
      targetLang = 'tn',
      sourceLang = 'en',
      format = 'html',
    } = body;

    /* ── Batch translation ── */
    if (Array.isArray(texts) && texts.length > 0) {
      const translated = await translateArray(
        texts,
        targetLang,
        sourceLang,
        format,
      );
      if (!translated) {
        return jsonResponse(
          { error: 'Translation service unavailable' },
          502, cors,
        );
      }
      return jsonResponse({ translatedTexts: translated }, 200, cors);
    }

    /* ── Single translation ── */
    if (typeof text === 'string' && text.trim().length > 0) {
      const result = await translateSingle(
        text,
        targetLang,
        sourceLang,
        format,
      );
      if (result === null) {
        return jsonResponse(
          { error: 'Translation service unavailable' },
          502, cors,
        );
      }
      return jsonResponse({ translatedText: result }, 200, cors);
    }

    return jsonResponse(
      { error: 'Provide "text" (string) or "texts" (string[])' },
      400, cors,
    );
  } catch (err) {
    console.error('[translate] Unhandled error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500, cors);
  }
});

/* ─── Helpers ─────────────────────────────────────────────── */

async function translateSingle(
  q: string,
  target: string,
  source: string,
  format: string,
): Promise<string | null> {
  const res = await fetchWithRetry(`${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q, target, source, format }),
  }, 3);

  if (!res.ok) {
    console.error('[translate] Google API error:', await res.text());
    return null;
  }

  const data = await res.json();
  return data?.data?.translations?.[0]?.translatedText ?? null;
}

async function translateArray(
  texts: string[],
  target: string,
  source: string,
  format: string,
): Promise<string[] | null> {
  const res = await fetchWithRetry(`${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: texts, target, source, format }),
  }, 3);

  if (!res.ok) {
    console.error('[translate] Google API error:', await res.text());
    return null;
  }

  const data = await res.json();
  const translations = data?.data?.translations;
  if (!Array.isArray(translations)) return null;
  return translations.map(
    (t: { translatedText: string }) => t.translatedText,
  );
}

function jsonResponse(body: Record<string, unknown>, status = 200, cors?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...(cors || {}), 'Content-Type': 'application/json' },
  });
}
