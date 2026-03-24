/**
 * Supabase Edge Function — Subscription Notification System
 *
 * Phase 7: Handles 4 actions:
 *   subscribe  — Public: register email + areas, send verification email
 *   verify     — Public: confirm email via token
 *   unsubscribe — Public: deactivate subscription via token
 *   notify     — Admin: send batch emails to subscribers matching an area
 *
 * Deploy:
 *   supabase secrets set BREVO_API_KEY=xkeysib-... SITE_URL=https://...
 *   supabase functions deploy send-notification
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchWithRetry } from '../_shared/fetchWithRetry.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY');
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
const SITE_URL = Deno.env.get('SITE_URL') || 'https://byters67.github.io/hackbocra';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_AREAS = ['telecoms', 'broadcasting', 'postal', 'internet_ict', 'licensing', 'cybersecurity'];

// ─── EMAIL SENDING ──────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.log(`[send-notification] EMAIL (mock — no BREVO_API_KEY):\n  To: ${to}\n  Subject: ${subject}\n  Body length: ${html.length} chars`);
    return true; // Mock success when API key not configured
  }

  try {
    const res = await fetchWithRetry('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'BOCRA Notifications', email: 'notifications@bocra.org.bw' },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    }, 2);

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[send-notification] Brevo API error: ${res.status} ${errText}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[send-notification] Email send error:', err);
    return false;
  }
}

// ─── EMAIL TEMPLATES ────────────────────────────────────────────

function verificationEmailHtml(verifyUrl: string, lang: string): string {
  if (lang === 'tn') {
    return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#00458B">Netefatsa Sabasekeribeshene ya Gago ya BOCRA</h2>
      <p>Re a leboga go ingodisa go fumana diphetogo tsa taolo ya BOCRA.</p>
      <p>Tsweetswee tobetsa konopo e e fa tlase go netefatsa aterese ya imeili ya gago:</p>
      <a href="${verifyUrl}" style="display:inline-block;background:#00458B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Netefatsa Imeili</a>
      <p style="color:#666;font-size:12px;margin-top:24px">Fa o sa ingodisa, o ka tlogela imeili e.</p>
    </div>`;
  }
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
    <h2 style="color:#00458B">Verify Your BOCRA Subscription</h2>
    <p>Thank you for subscribing to BOCRA regulatory updates.</p>
    <p>Please click the button below to verify your email address:</p>
    <a href="${verifyUrl}" style="display:inline-block;background:#00458B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Verify Email</a>
    <p style="color:#666;font-size:12px;margin-top:24px">If you did not subscribe, you can safely ignore this email.</p>
  </div>`;
}

function notificationEmailHtml(
  type: string, title: string, contentUrl: string, area: string,
  unsubscribeUrl: string, lang: string
): string {
  const typeLabel = lang === 'tn'
    ? { document: 'sekwalo', consultation: 'theriso-puisano', news: 'dikgang' }[type] || type
    : type;
  const areaLabel = lang === 'tn'
    ? { telecoms: 'Tlhaeletsano', broadcasting: 'Kgaso', postal: 'Poso', internet_ict: 'Inthanete le ICT', licensing: 'Dilaesense', cybersecurity: 'Tshireletsego ya Saebara' }[area] || area
    : { telecoms: 'Telecommunications', broadcasting: 'Broadcasting', postal: 'Postal Services', internet_ict: 'Internet & ICT', licensing: 'Licensing', cybersecurity: 'Cybersecurity' }[area] || area;

  if (lang === 'tn') {
    return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#00458B">Phetogo ya BOCRA</h2>
      <p>${typeLabel} e ntšhwa e gatisitswe:</p>
      <h3>${title}</h3>
      <a href="${contentUrl}" style="display:inline-block;background:#00458B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Bona Jaanong</a>
      <hr style="margin-top:24px;border:none;border-top:1px solid #eee"/>
      <p style="color:#666;font-size:12px">O amogela imeili e ka gonne o ingodisitse go fumana diphetogo tsa BOCRA tsa ${areaLabel}.<br/><a href="${unsubscribeUrl}">Itlhophele go emisa</a></p>
    </div>`;
  }
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
    <h2 style="color:#00458B">BOCRA Update</h2>
    <p>A new ${typeLabel} has been published:</p>
    <h3>${title}</h3>
    <a href="${contentUrl}" style="display:inline-block;background:#00458B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">View Now</a>
    <hr style="margin-top:24px;border:none;border-top:1px solid #eee"/>
    <p style="color:#666;font-size:12px">You are receiving this because you subscribed to BOCRA ${areaLabel} updates.<br/><a href="${unsubscribeUrl}">Unsubscribe</a></p>
  </div>`;
}

// ─── reCAPTCHA VERIFICATION ─────────────────────────────────────

async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('[send-notification] RECAPTCHA_SECRET_KEY not set — skipping verification');
    return true;
  }
  try {
    const res = await fetchWithRetry('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(RECAPTCHA_SECRET_KEY)}&response=${encodeURIComponent(token)}`,
    }, 2);
    if (!res.ok) return false;
    const data = await res.json();
    return data.success && (typeof data.score !== 'number' || data.score >= 0.5);
  } catch {
    return false;
  }
}

// ─── INPUT HELPERS ──────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function sanitize(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
}

// ─── ACTION HANDLERS ────────────────────────────────────────────

async function handleSubscribe(body: Record<string, unknown>, supabase: any): Promise<Response> {
  const email = sanitize(body.email, 254).toLowerCase();
  const language = body.language === 'tn' ? 'tn' : 'en';
  const recaptchaToken = sanitize(body.recaptcha_token, 2000);
  const areas = Array.isArray(body.areas) ? body.areas.filter((a: unknown) => typeof a === 'string' && VALID_AREAS.includes(a as string)) : [];

  if (!email || !isValidEmail(email)) {
    return jsonResponse({ error: 'Valid email is required' }, 400);
  }
  if (areas.length === 0) {
    return jsonResponse({ error: 'At least one area is required' }, 400);
  }

  // Verify reCAPTCHA
  if (recaptchaToken) {
    const valid = await verifyRecaptcha(recaptchaToken);
    if (!valid) return jsonResponse({ error: 'CAPTCHA verification failed' }, 403);
  }

  // Generate verification token
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const verificationToken = [...tokenBytes].map(b => b.toString(16).padStart(2, '0')).join('');

  // Upsert (on email conflict, update areas + resend verification)
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      email,
      areas: JSON.stringify(areas),
      language,
      verified: false,
      verification_token: verificationToken,
      verification_sent_at: new Date().toISOString(),
      active: true,
    }, { onConflict: 'email' });

  if (error) {
    console.error('[send-notification] Subscribe upsert error:', error);
    return jsonResponse({ error: 'Something went wrong. Please try again.' }, 500);
  }

  // Send verification email
  const verifyUrl = `${SITE_URL}/subscribe?verify=${verificationToken}`;
  await sendEmail(
    email,
    language === 'tn' ? 'Netefatsa sabasekeribeshene ya gago ya BOCRA' : 'Verify your BOCRA subscription',
    verificationEmailHtml(verifyUrl, language),
  );

  return jsonResponse({ success: true });
}

async function handleVerify(body: Record<string, unknown>, supabase: any): Promise<Response> {
  const token = sanitize(body.token, 128);
  if (!token) return jsonResponse({ error: 'Token is required' }, 400);

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ verified: true, verification_token: null })
    .eq('verification_token', token)
    .select('id')
    .maybeSingle();

  if (error || !data) {
    return jsonResponse({ error: 'Invalid or expired verification link' }, 400);
  }

  return jsonResponse({ success: true });
}

async function handleUnsubscribe(body: Record<string, unknown>, supabase: any): Promise<Response> {
  const token = sanitize(body.token, 128);
  if (!token) return jsonResponse({ error: 'Token is required' }, 400);

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ active: false })
    .eq('unsubscribe_token', token)
    .select('id')
    .maybeSingle();

  if (error || !data) {
    return jsonResponse({ error: 'Unable to unsubscribe. Link may be invalid.' }, 400);
  }

  return jsonResponse({ success: true });
}

async function handleNotify(
  body: Record<string, unknown>,
  supabase: any,
  req: Request,
): Promise<Response> {
  // Verify caller is admin/staff via JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

  const jwt = authHeader.replace('Bearer ', '');
  const userClient = createClient(SUPABASE_URL, jwt);
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !['admin', 'staff'].includes(profile.role)) {
    return jsonResponse({ error: 'Forbidden — admin or staff role required' }, 403);
  }

  const notificationType = sanitize(body.notification_type, 50);
  const contentTitle = sanitize(body.content_title, 500);
  const area = sanitize(body.area, 50);
  const contentUrl = sanitize(body.content_url, 1000);

  if (!notificationType || !contentTitle || !area) {
    return jsonResponse({ error: 'notification_type, content_title, and area are required' }, 400);
  }

  // Query matching subscribers
  const { data: subscribers, error: subErr } = await supabase
    .from('subscriptions')
    .select('email, language, unsubscribe_token')
    .eq('verified', true)
    .eq('active', true)
    .contains('areas', JSON.stringify([area]));

  if (subErr) {
    console.error('[send-notification] Subscriber query error:', subErr);
    return jsonResponse({ error: 'Failed to query subscribers' }, 500);
  }

  const recipientList = subscribers || [];
  let sentCount = 0;

  // Send in batches of 10 to respect rate limits
  const BATCH_SIZE = 10;
  for (let i = 0; i < recipientList.length; i += BATCH_SIZE) {
    const batch = recipientList.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((sub: any) => {
        const unsubscribeUrl = `${SITE_URL}/subscribe?unsubscribe=${sub.unsubscribe_token}`;
        const fullContentUrl = contentUrl.startsWith('http') ? contentUrl : `${SITE_URL}${contentUrl}`;
        return sendEmail(
          sub.email,
          `BOCRA Update: ${contentTitle}`,
          notificationEmailHtml(notificationType, contentTitle, fullContentUrl, area, unsubscribeUrl, sub.language || 'en'),
        );
      }),
    );
    sentCount += results.filter(r => r.status === 'fulfilled' && r.value).length;
  }

  // Log notification
  await supabase.from('notification_log').insert({
    notification_type: notificationType,
    content_title: contentTitle,
    area,
    recipients_count: sentCount,
    sent_by: user.id,
  });

  console.log(`[send-notification] Sent ${sentCount}/${recipientList.length} emails for "${contentTitle}" (area: ${area})`);

  return jsonResponse({ success: true, recipients_count: sentCount });
}

// ─── MAIN ───────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body.action;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    switch (action) {
      case 'subscribe':
        return addCors(await handleSubscribe(body, supabase));
      case 'verify':
        return addCors(await handleVerify(body, supabase));
      case 'unsubscribe':
        return addCors(await handleUnsubscribe(body, supabase));
      case 'notify':
        return addCors(await handleNotify(body, supabase, req));
      default:
        return addCors(jsonResponse({ error: `Unknown action: ${action}` }, 400));
    }
  } catch (err) {
    console.error('[send-notification] Error:', err);
    return addCors(jsonResponse({ error: 'Something went wrong. Please try again.' }, 500));
  }
});

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function addCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
  return new Response(response.body, { status: response.status, headers });
}
