/**
 * Supabase Edge Function — AI Complaint Triage
 *
 * Receives a complaint and calls Claude to classify it:
 *   - category (aligned to BOCRA regulatory divisions)
 *   - operator (normalized name)
 *   - urgency (1-5 scale → mapped to critical/high/medium/low)
 *   - department (suggested BOCRA department)
 *   - summary (1-2 sentence plain-English summary)
 *   - confidence (0-100 score)
 *
 * Updates the complaint row with AI fields.
 *
 * Deploy:
 *   supabase functions deploy classify-complaint
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// BOCRA regulatory divisions — Task 44 taxonomy
// Source of truth: src/lib/triageConstants.js — keep in sync
const VALID_CATEGORIES = [
  'Telecommunications',
  'Broadcasting',
  'Postal Services',
  'Internet & Data Services',
  'Spectrum Management',
  'Cybersecurity',
  'Consumer Protection',
  'Licensing & Compliance',
];

const VALID_DEPARTMENTS = [
  'Telecommunications Division',
  'Broadcasting Division',
  'Postal Division',
  'Technical Services (Spectrum)',
  'ICT & Cybersecurity Division',
  'Consumer Affairs Division',
  'Legal & Compliance Division',
  'Licensing Division',
];

// Operator alias map — Task 46 normalization
const OPERATOR_ALIASES: Record<string, string> = {
  'mascom': 'Mascom Wireless',
  'mascom wireless': 'Mascom Wireless',
  'btc': 'Botswana Telecommunications Corporation (BTC)',
  'botswana telecom': 'Botswana Telecommunications Corporation (BTC)',
  'botswana telecommunications': 'Botswana Telecommunications Corporation (BTC)',
  'botswana telecommunications corporation': 'Botswana Telecommunications Corporation (BTC)',
  'orange': 'Orange Botswana',
  'orange botswana': 'Orange Botswana',
  'bofinet': 'Botswana Fibre Networks (BoFiNet)',
  'botswana fibre': 'Botswana Fibre Networks (BoFiNet)',
  'botswana fibre networks': 'Botswana Fibre Networks (BoFiNet)',
  'botswana post': 'Botswana Post',
  'yarona': 'Yarona FM',
  'yarona fm': 'Yarona FM',
  'duma': 'Duma FM',
  'duma fm': 'Duma FM',
  'gabz': 'Gabz FM',
  'gabz fm': 'Gabz FM',
  'ebotswana': 'eBotswana TV',
  'ebotswana tv': 'eBotswana TV',
};

function normalizeOperator(raw: string): string {
  const key = raw.trim().toLowerCase();
  return OPERATOR_ALIASES[key] || raw.trim();
}

function urgencyNumberToLabel(n: number): string {
  if (n >= 5) return 'critical';
  if (n >= 4) return 'high';
  if (n >= 3) return 'medium';
  return 'low';
}

// V-07 remediation: localhost origins only included when ENVIRONMENT env var is set to 'development'
const PRODUCTION_ORIGINS = [
  'https://hackathonteamproject.github.io',
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

// Department → sector mapping for auto-routing
const DEPARTMENT_TO_SECTOR: Record<string, string> = {
  'Telecommunications Division': 'telecommunications',
  'Broadcasting Division': 'broadcasting',
  'Postal Division': 'postal',
  'Technical Services (Spectrum)': 'spectrum',
  'ICT & Cybersecurity Division': 'cybersecurity',
  'Consumer Affairs Division': 'consumer',
  'Legal & Compliance Division': 'legal',
  'Licensing Division': 'licensing',
};

/** Find a staff member whose sector matches the department */
async function findStaffForDepartment(department: string): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;

  const sector = DEPARTMENT_TO_SECTOR[department];
  if (!sector) return null;

  try {
    // Find all staff with matching sector, pick one randomly for load distribution
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?role=eq.staff&sector=eq.${sector}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    if (res.ok) {
      const rows = await res.json();
      if (rows.length > 0) return rows[Math.floor(Math.random() * rows.length)].id;
    }

    // Fallback: assign to a random admin
    const fallbackRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?role=eq.admin&select=id`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    if (fallbackRes.ok) {
      const rows = await fallbackRes.json();
      if (rows.length > 0) return rows[Math.floor(Math.random() * rows.length)].id;
    }

    return null;
  } catch (err) {
    console.error('[classify] Staff lookup failed:', err);
    return null;
  }
}

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[classify] Missing env vars');
      return jsonResponse(req, { error: 'Server misconfigured' }, 500);
    }

    const body = await req.json();
    const { complaint_id, provider, complaint_type, description, force } = body;

    if (!complaint_id || !description) {
      return jsonResponse(req, { error: 'complaint_id and description are required' }, 400);
    }

    // Idempotency guard — skip if already classified unless force=true
    if (!force) {
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/complaints?id=eq.${complaint_id}&select=ai_category`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY!,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );
      if (checkRes.ok) {
        const rows = await checkRes.json();
        if (rows.length > 0 && rows[0].ai_category) {
          return jsonResponse(req, {
            success: true,
            skipped: true,
            message: 'Already classified. Pass force: true to re-classify.',
          });
        }
      }
    }

    // Build the classification prompt
    const classificationPrompt = `You are an AI triage system for BOCRA (Botswana Communications Regulatory Authority).
Analyze this consumer complaint and classify it.

COMPLAINT DETAILS:
- Service Provider: ${provider || 'Not specified'}
- Complaint Type (user-selected): ${complaint_type || 'Not specified'}
- Description: ${description}

INSTRUCTIONS:
1. Pick the single best category from this list: ${VALID_CATEGORIES.join(', ')}
2. Pick the single best department from this list: ${VALID_DEPARTMENTS.join(', ')}
3. Extract or normalize the operator/service provider name
4. Rate urgency from 1 (minor inconvenience) to 5 (critical — service outage, safety risk, or data breach)
5. Write a 1-2 sentence summary suitable for an admin dashboard
6. Rate your confidence from 0 to 100 in your classification

Respond with ONLY valid JSON, no markdown, no explanation:
{
  "category": "...",
  "department": "...",
  "operator": "...",
  "urgency": 3,
  "summary": "...",
  "confidence": 85
}`;

    // Call Claude
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: classificationPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error('[classify] Claude API error:', errText);
      return jsonResponse(req, { error: 'AI service unavailable' }, 502);
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content?.[0]?.text || '';

    // Parse JSON from Claude's response
    let classification;
    try {
      classification = JSON.parse(rawText);
    } catch {
      console.error('[classify] Failed to parse Claude response:', rawText);
      return jsonResponse(req, { error: 'AI returned invalid response' }, 502);
    }

    // Normalize and validate
    const category = VALID_CATEGORIES.includes(classification.category)
      ? classification.category
      : 'Consumer Protection'; // safe fallback

    const department = VALID_DEPARTMENTS.includes(classification.department)
      ? classification.department
      : 'Consumer Affairs Division';

    const operator = normalizeOperator(classification.operator || provider || 'Unknown');
    const urgencyNum = Math.min(5, Math.max(1, Math.round(classification.urgency || 3)));
    const urgency = urgencyNumberToLabel(urgencyNum);
    const summary = (classification.summary || '').slice(0, 500);
    const confidence = Math.min(100, Math.max(0, Math.round(classification.confidence || 0)));

    // Auto-route: find a staff member for this department
    const assignedTo = await findStaffForDepartment(department);

    // Update the complaint row in Supabase
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/complaints?id=eq.${complaint_id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          ai_category: category,
          ai_urgency: urgency,
          ai_department: department,
          ai_summary: summary,
          ai_confidence: confidence,
          // Auto-assign to staff if found
          ...(assignedTo ? { assigned_to: assignedTo } : {}),
          // Flag low-confidence for manual review — only set needs_review, never touch status
          needs_review: confidence < 70,
        }),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error('[classify] DB update failed:', errText);
      // Still return the classification — it's useful even if DB write failed
      return jsonResponse(req, {
        success: false,
        error: 'DB update failed',
        classification: { category, urgency, department, operator, summary, confidence },
      });
    }

    // Check if any row was actually updated (empty array = complaint_id not found)
    const updatedRows = await updateRes.json();
    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      console.warn(`[classify] No complaint found with id: ${complaint_id}`);
      return jsonResponse(req, {
        success: false,
        error: 'Complaint not found — classification was not saved',
        classification: { category, urgency, department, operator, summary, confidence },
      });
    }

    const needsReview = confidence < 70;
    console.log(`[classify] Complaint ${complaint_id} → ${category} / ${urgency} / ${department} (confidence: ${confidence}%${needsReview ? ' — FLAGGED FOR REVIEW' : ''}) assigned_to: ${assignedTo || 'none'}`);

    return jsonResponse(req, {
      success: true,
      needs_review: needsReview,
      assigned_to: assignedTo || null,
      classification: { category, urgency, department, operator, summary, confidence },
    });

  } catch (err) {
    console.error('[classify] Error:', err);
    return jsonResponse(req, { error: 'Something went wrong' }, 500);
  }
});

function jsonResponse(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}
