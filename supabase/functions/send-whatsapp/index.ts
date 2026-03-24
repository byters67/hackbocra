/**
 * Supabase Edge Function — WhatsApp Notification via Twilio
 *
 * Phase 2 of the BOCRA Implementation Roadmap.
 * Sends WhatsApp messages for:
 *   - Complaint acknowledgement (on submission, with reference number)
 *   - Status updates (when complaint status changes)
 *
 * Uses Twilio WhatsApp API (sandbox or production Business Account).
 *
 * Required secrets (set via Supabase dashboard or supabase secrets set):
 *   TWILIO_ACCOUNT_SID   — Twilio Account SID (ACxxxxxxxx)
 *   TWILIO_AUTH_TOKEN    — Twilio Auth Token
 *   TWILIO_WHATSAPP_FROM — Your Twilio WhatsApp number e.g. whatsapp:+14155238886
 *   SUPABASE_URL         — Auto-set by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — Auto-set by Supabase
 *
 * Deploy:
 *   supabase functions deploy send-whatsapp
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const TWILIO_ACCOUNT_SID    = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN     = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_WHATSAPP_FROM  = Deno.env.get('TWILIO_WHATSAPP_FROM') ?? 'whatsapp:+14155238886';
const SUPABASE_URL          = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── BOTSWANA PHONE NORMALISATION ────────────────────────────────────────────
// Accepts: 71234567 / 71234567 / +26771234567 / 00267…
// Returns: +267XXXXXXXX  or null if invalid
function normalizeBwPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('267') && (digits.length === 10 || digits.length === 11)) {
    return '+' + digits;
  }
  if ((digits.startsWith('7') || digits.startsWith('8')) && digits.length === 8) {
    return '+267' + digits;
  }
  // International number passed through as-is if 10–15 digits
  if (digits.length >= 10 && digits.length <= 15) {
    return '+' + digits;
  }
  return null;
}

// ─── LOG DELIVERY TO SUPABASE ─────────────────────────────────────────────────
async function logDelivery(payload: {
  complaint_id: string;
  phone_last4: string;
  message_type: string;
  twilio_sid?: string;
  delivery_status: string;
  error_message?: string;
}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;
  await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_log`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).catch(() => { /* non-critical */ });
}

// ─── SEND VIA TWILIO ──────────────────────────────────────────────────────────
async function sendWhatsApp(to: string, body: string): Promise<{ sid: string } | { error: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return { error: 'Twilio credentials not configured' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  const form = new URLSearchParams();
  form.set('From', TWILIO_WHATSAPP_FROM);
  form.set('To', `whatsapp:${to}`);
  form.set('Body', body);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.message ?? `Twilio error ${res.status}` };
    }
    return { sid: data.sid };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─── MESSAGE TEMPLATES ────────────────────────────────────────────────────────
function acknowledgementMessage(lang: string, ref: string, provider: string): string {
  if (lang === 'tn') {
    return (
      `*BOCRA Ngongorego ya gago e amogetse* ✅\n\n` +
      `Nomoro ya tshupetso: *${ref}*\n` +
      `Motlamedi: ${provider}\n\n` +
      `BOCRA e tla sekaseka ngongorego ya gago mme e arabe mo malatsing a le 2 a tiriso.\n\n` +
      `Go latela maemo: bocra.org.bw/track/${ref}\n\n` +
      `_Botswana Communications Regulatory Authority_`
    );
  }
  return (
    `*BOCRA Complaint Received* ✅\n\n` +
    `Reference: *${ref}*\n` +
    `Provider: ${provider}\n\n` +
    `BOCRA will review your complaint and respond within 2 business days.\n\n` +
    `Track your complaint: bocra.org.bw/hackbocra/services/track-complaint?ref=${ref}\n\n` +
    `_Botswana Communications Regulatory Authority_`
  );
}

function statusUpdateMessage(lang: string, ref: string, status: string): string {
  const STATUS_LABELS: Record<string, Record<string, string>> = {
    en: {
      in_review:   'Under Review',
      in_progress: 'Being Investigated',
      resolved:    'Resolved',
      closed:      'Closed',
    },
    tn: {
      in_review:   'E a Lekolwa',
      in_progress: 'E a Batlisiswa',
      resolved:    'E Rarabololwe',
      closed:      'E Tshamekiwe',
    },
  };
  const label = STATUS_LABELS[lang]?.[status] ?? status;

  if (lang === 'tn') {
    return (
      `*BOCRA — Diphetogo tsa Ngongorego* 📋\n\n` +
      `Ref: *${ref}*\n` +
      `Maemo a ntsha: *${label}*\n\n` +
      `Go latela: bocra.org.bw/track/${ref}\n\n` +
      `_Botswana Communications Regulatory Authority_`
    );
  }
  return (
    `*BOCRA — Complaint Update* 📋\n\n` +
    `Ref: *${ref}*\n` +
    `New status: *${label}*\n\n` +
    `Track your complaint: bocra.org.bw/hackbocra/services/track-complaint?ref=${ref}\n\n` +
    `_Botswana Communications Regulatory Authority_`
  );
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const body = await req.json();
    const {
      complaint_id,
      phone,
      reference_number,
      provider,
      status,
      message_type = 'acknowledgement', // 'acknowledgement' | 'status_update'
      lang = 'en',
    } = body;

    if (!phone || !complaint_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'phone and complaint_id are required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const normalizedPhone = normalizeBwPhone(phone);
    if (!normalizedPhone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid phone number format' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const message = message_type === 'status_update'
      ? statusUpdateMessage(lang, reference_number, status)
      : acknowledgementMessage(lang, reference_number, provider);

    const result = await sendWhatsApp(normalizedPhone, message);
    const phone_last4 = normalizedPhone.slice(-4);

    if ('error' in result) {
      await logDelivery({
        complaint_id,
        phone_last4,
        message_type,
        delivery_status: 'failed',
        error_message: result.error,
      });
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    await logDelivery({
      complaint_id,
      phone_last4,
      message_type,
      twilio_sid: result.sid,
      delivery_status: 'sent',
    });

    return new Response(
      JSON.stringify({ success: true, sid: result.sid }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[send-whatsapp]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
