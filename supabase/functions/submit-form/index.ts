/**
 * Supabase Edge Function — Secure Form Submission Gateway
 *
 * Server-side proxy for public form submissions (complaints + contact).
 * Addresses:
 *   V-02  — Server-side rate limiting (IP-based, not bypassable)
 *   V-12  — Server-side reCAPTCHA v3 token verification
 *   V-03  — Input sanitization (defense-in-depth, layered with frontend)
 *
 * Accepts: POST { form_type: 'complaint' | 'contact', recaptcha_token, fields: {...} }
 * Returns: { success: boolean, id?: string, error?: string }
 *
 * Deploy:
 *   supabase secrets set RECAPTCHA_SECRET_KEY=your_secret_here
 *   supabase functions deploy submit-form
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { fetchWithRetry } from '../_shared/fetchWithRetry.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

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

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// ─── PERSISTENT RATE LIMITING (V-02) ──────────────────────────────
// Database-backed rate limiter using the rate_limits table (migration 015).
// Survives cold starts and works across all function instances.

async function isRateLimited(
  ip: string,
  formType: string,
  maxPerWindow: number,
): Promise<boolean> {
  // Hash the IP (matches rate_limits table schema — privacy-safe)
  const ipHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(ip),
  ).then(buf =>
    [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join(''),
  );

  // Count submissions in the last 60 seconds
  const cutoff = new Date(Date.now() - 60000).toISOString();
  const countRes = await fetch(
    `${SUPABASE_URL}/rest/v1/rate_limits?select=id&ip_hash=eq.${ipHash}&form_type=eq.${formType}&submitted_at=gte.${cutoff}`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'count=exact',
      },
    },
  );
  const count = parseInt(
    countRes.headers.get('content-range')?.split('/')[1] || '0',
  );

  if (count >= maxPerWindow) return true;

  // Record this request
  await fetch(`${SUPABASE_URL}/rest/v1/rate_limits`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ip_hash: ipHash, form_type: formType }),
  });

  return false;
}

// ─── SERVER-SIDE reCAPTCHA VERIFICATION (V-12) ───────────────────
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const RECAPTCHA_SCORE_THRESHOLD = 0.5; // Reject scores below this

interface RecaptchaResult {
  success: boolean;
  score?: number;
  action?: string;
  error?: string;
}

async function verifyRecaptcha(token: string, expectedAction: string): Promise<RecaptchaResult> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.error('[submit-form] RECAPTCHA_SECRET_KEY not configured');
    return { success: false, error: 'Server misconfigured: CAPTCHA verification unavailable' };
  }

  try {
    const res = await fetchWithRetry(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(RECAPTCHA_SECRET_KEY)}&response=${encodeURIComponent(token)}`,
    }, 2);

    if (!res.ok) {
      console.error('[submit-form] reCAPTCHA API error:', res.status);
      return { success: false, error: 'CAPTCHA verification service unavailable' };
    }

    const data = await res.json();

    if (!data.success) {
      console.warn('[submit-form] reCAPTCHA failed:', data['error-codes']);
      return { success: false, error: 'CAPTCHA verification failed' };
    }

    // Verify action matches what the frontend claimed
    if (data.action && data.action !== expectedAction) {
      console.warn(`[submit-form] reCAPTCHA action mismatch: expected ${expectedAction}, got ${data.action}`);
      return { success: false, error: 'CAPTCHA action mismatch' };
    }

    // Check score — low scores indicate likely bots
    if (typeof data.score === 'number' && data.score < RECAPTCHA_SCORE_THRESHOLD) {
      console.warn(`[submit-form] reCAPTCHA low score: ${data.score} (threshold: ${RECAPTCHA_SCORE_THRESHOLD})`);
      return { success: false, score: data.score, error: 'Verification score too low' };
    }

    return { success: true, score: data.score, action: data.action };
  } catch (err) {
    console.error('[submit-form] reCAPTCHA verification error:', err);
    return { success: false, error: 'CAPTCHA verification failed unexpectedly' };
  }
}

// ─── INPUT SANITIZATION (defense-in-depth) ────────────────────────
function sanitize(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isValidPhone(phone: string): boolean {
  if (!phone) return true; // optional field
  return /^\+?\d{7,15}$/.test(phone.replace(/\s/g, ''));
}

// ─── COMPLAINT HANDLER ────────────────────────────────────────────
async function handleComplaint(fields: Record<string, unknown>, supabaseHeaders: Record<string, string>): Promise<Response | { id: string }> {
  const name = sanitize(fields.name, 200);
  const company = sanitize(fields.company, 200);
  const phone = sanitize(fields.phone, 20);
  const email = sanitize(fields.email, 200);
  const provider = sanitize(fields.provider, 200);
  const complaintType = sanitize(fields.complaint_type, 200);
  const description = sanitize(fields.description, 5000);
  const previousComplaint = !!fields.previous_complaint;
  const referenceNumber = sanitize(fields.reference_number, 100);

  // Field validation
  if (!name) return { id: '' }; // will be caught by caller
  if (!email || !isValidEmail(email)) return { id: '' };
  if (!isValidPhone(phone)) return { id: '' };
  if (!provider) return { id: '' };
  if (!complaintType) return { id: '' };
  if (!description || description.length < 20) return { id: '' };

  const insertRes = await fetch(
    `${SUPABASE_URL}/rest/v1/complaints`,
    {
      method: 'POST',
      headers: {
        ...supabaseHeaders,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        name,
        company,
        phone,
        email,
        provider,
        complaint_type: complaintType,
        description,
        previous_complaint: previousComplaint,
        reference_number: referenceNumber,
        status: 'pending',
        consent_given_at: new Date().toISOString(),
      }),
    }
  );

  if (!insertRes.ok) {
    const errText = await insertRes.text();
    console.error('[submit-form] Complaint insert failed:', errText);
    return { id: '' };
  }

  const rows = await insertRes.json();
  const complaintId = rows?.[0]?.id;

  // Fire-and-forget: trigger AI classification
  if (complaintId && ANTHROPIC_API_KEY) {
    (async () => {
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/classify-complaint`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            complaint_id: complaintId,
            provider,
            complaint_type: complaintType,
            description,
          }),
        });
      } catch { /* classification is non-critical */ }
    })();
  }

  return { id: complaintId || '' };
}

// ─── CONTACT HANDLER ──────────────────────────────────────────────
async function handleContact(fields: Record<string, unknown>, supabaseHeaders: Record<string, string>): Promise<{ id: string }> {
  const name = sanitize(fields.name, 200);
  const email = sanitize(fields.email, 200);
  const phone = sanitize(fields.phone, 20);
  const subject = sanitize(fields.subject, 300);
  const message = sanitize(fields.message, 5000);

  if (!name || !email || !isValidEmail(email) || !subject || !message || message.length < 10) {
    return { id: '' };
  }
  if (!isValidPhone(phone)) return { id: '' };

  const insertRes = await fetch(
    `${SUPABASE_URL}/rest/v1/contact_submissions`,
    {
      method: 'POST',
      headers: {
        ...supabaseHeaders,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        subject,
        message,
        consent_given_at: new Date().toISOString(),
      }),
    }
  );

  if (!insertRes.ok) {
    const errText = await insertRes.text();
    console.error('[submit-form] Contact insert failed:', errText);
    return { id: '' };
  }

  const rows = await insertRes.json();
  return { id: rows?.[0]?.id || '' };
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────
serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[submit-form] Missing env vars');
      return jsonResponse(req, { error: 'Server misconfigured' }, 500);
    }

    // ─── Rate limiting (V-02) ───
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || 'unknown';

    if (await isRateLimited(clientIp, 'form', 5)) {
      console.warn(`[submit-form] Rate limited: ${clientIp}`);
      return jsonResponse(req, {
        error: 'Too many submissions. Please wait a moment and try again.',
      }, 429);
    }

    const body = await req.json();
    const { form_type, recaptcha_token, fields } = body;

    // ─── Validate request shape ───
    if (!form_type || !['complaint', 'contact'].includes(form_type)) {
      return jsonResponse(req, { error: 'Invalid form_type' }, 400);
    }

    if (!fields || typeof fields !== 'object') {
      return jsonResponse(req, { error: 'Missing fields' }, 400);
    }

    // ─── reCAPTCHA verification (V-12) ───
    if (!recaptcha_token || typeof recaptcha_token !== 'string') {
      return jsonResponse(req, { error: 'CAPTCHA token required' }, 400);
    }

    const expectedAction = form_type === 'complaint' ? 'submit_complaint' : 'submit_contact';
    const captchaResult = await verifyRecaptcha(recaptcha_token, expectedAction);

    if (!captchaResult.success) {
      return jsonResponse(req, {
        error: captchaResult.error || 'CAPTCHA verification failed',
      }, 403);
    }

    // ─── Process the form ───
    const supabaseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    };

    let result: { id: string };

    if (form_type === 'complaint') {
      result = await handleComplaint(fields, supabaseHeaders);
    } else {
      result = await handleContact(fields, supabaseHeaders);
    }

    if (!result.id) {
      return jsonResponse(req, {
        error: 'Submission failed. Please check your input and try again.',
      }, 400);
    }

    console.log(`[submit-form] ${form_type} submitted: ${result.id} from ${clientIp} (reCAPTCHA score: ${captchaResult.score})`);

    return jsonResponse(req, {
      success: true,
      id: result.id,
    });
  } catch (err) {
    console.error('[submit-form] Error:', err);
    return jsonResponse(req, { error: 'Something went wrong. Please try again.' }, 500);
  }
});

function jsonResponse(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}
