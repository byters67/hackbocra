/**
 * Supabase Edge Function — AI Licence Application Review
 *
 * Accepts POST { application_id: string }
 * Downloads uploaded documents from Supabase Storage,
 * sends each to Claude for analysis, aggregates results,
 * and stores verdicts in the database.
 *
 * Deploy:
 *   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
 *   supabase functions deploy review-application
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Environment (validated per POST request; no top-level throw) ───
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Do not throw at module load — a failed boot makes OPTIONS preflight return non-2xx and breaks CORS in the browser.

// ─── Document requirements per licence type ─────────────────────
const LICENCE_REQUIREMENTS: Record<string, string[]> = {
  'Amateur Radio Licence': [
    'national_id',
    'proof_of_address',
    'exam_certificate',
  ],
  'Telecommunications Licence': [
    'national_id',
    'company_registration',
    'technical_specification',
    'payment_receipt',
  ],
  'Broadcasting Service Licence': [
    'national_id',
    'company_registration',
    'programming_schedule',
    'payment_receipt',
  ],
  'Postal Service Licence': [
    'national_id',
    'company_registration',
    'business_plan',
    'payment_receipt',
  ],
  'Internet Service Provider Licence': [
    'national_id',
    'company_registration',
    'technical_specification',
    'payment_receipt',
  ],
};

// ─── Supported image MIME types for Claude vision ───────────────
const IMAGE_MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

const VALID_VERDICTS = ['PASS', 'FAIL', 'UNCLEAR'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const REVIEW_COOLDOWN_MS = 60 * 1000; // 1 minute between re-runs

// Browser origins that may call this function (GitHub Pages + Vite dev). Auth is still enforced via JWT on POST.
const ALLOWED_ORIGINS = [
  'https://hackathonteamproject.github.io',
  'https://byters67.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

function getCorsHeaders(origin: string | null) {
  const o = origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) },
  });
}

// ─── Sanitize and validate AI response ──────────────────────────
function sanitizeString(val: unknown, maxLen = 2000): string {
  if (typeof val !== 'string') return '';
  // Strip any HTML tags to prevent XSS
  return val.replace(/<[^>]*>/g, '').slice(0, maxLen);
}

function validateDocumentResult(parsed: unknown): {
  verdict: string;
  reasoning: string;
  extracted_data: Record<string, string | null>;
  confidence: number;
  issues: string[];
} {
  const obj = (typeof parsed === 'object' && parsed !== null) ? parsed as Record<string, unknown> : {};

  const verdict = VALID_VERDICTS.includes(String(obj.verdict).toUpperCase())
    ? String(obj.verdict).toUpperCase()
    : 'UNCLEAR';

  const reasoning = sanitizeString(obj.reasoning) || 'No reasoning provided.';

  const confidence = typeof obj.confidence === 'number'
    ? Math.max(0, Math.min(1, obj.confidence))
    : 0;

  // Validate extracted_data — only allow expected string keys
  const rawData = (typeof obj.extracted_data === 'object' && obj.extracted_data !== null)
    ? obj.extracted_data as Record<string, unknown>
    : {};
  const extracted_data: Record<string, string | null> = {
    name: typeof rawData.name === 'string' ? sanitizeString(rawData.name, 500) : null,
    id_number: typeof rawData.id_number === 'string' ? sanitizeString(rawData.id_number, 100) : null,
    expiry_date: typeof rawData.expiry_date === 'string' ? sanitizeString(rawData.expiry_date, 100) : null,
    address: typeof rawData.address === 'string' ? sanitizeString(rawData.address, 500) : null,
  };

  // Validate issues — must be an array of strings
  const issues = Array.isArray(obj.issues)
    ? obj.issues.filter((i: unknown) => typeof i === 'string').map((i: string) => sanitizeString(i, 500))
    : [];

  return { verdict, reasoning, extracted_data, confidence, issues };
}

// ─── Analyze a single document with Claude ──────────────────────
interface DocumentResult {
  verdict: string;
  reasoning: string;
  extracted_data: Record<string, string | null>;
  confidence: number;
  issues: string[];
  api_failed?: boolean;
}

async function analyzeDocument(
  fileBase64: string,
  mediaType: string,
  documentType: string,
  applicantName: string,
  licenceType: string
): Promise<DocumentResult> {
  const systemPrompt = `You are a document verification assistant for BOCRA (Botswana Communications Regulatory Authority).
You are reviewing documents submitted as part of a "${licenceType}" application.

Your job is to analyze the uploaded document and determine:
1. Is this document the correct TYPE? (e.g., if we expect a National ID, does this look like a Botswana Omang/national ID card?)
2. Can you extract key data from it? (name, ID number, dates, address)
3. Does the name on the document match the applicant name: "${applicantName}"?
4. Is the document legible and appears valid (not expired, not obviously tampered)?

Respond with ONLY a valid JSON object (no markdown, no backticks, no explanation outside JSON):
{
  "verdict": "PASS" or "FAIL" or "UNCLEAR",
  "reasoning": "Brief explanation of your assessment",
  "extracted_data": {
    "name": "extracted name or null",
    "id_number": "extracted ID number or null",
    "expiry_date": "extracted expiry or null",
    "address": "extracted address or null"
  },
  "confidence": 0.0 to 1.0,
  "issues": ["list of specific issues found, if any"]
}

Rules for verdicts:
- PASS: Document is correct type, legible, names match, not expired.
- FAIL: Document is clearly wrong type, expired, or names definitively do not match.
- UNCLEAR: Image is blurry but appears to be the right type, or minor discrepancies exist that need human review.
Be strict but fair. When in doubt, use UNCLEAR rather than FAIL.`;

  // Only image types are supported for vision
  if (!mediaType.startsWith('image/')) {
    return {
      verdict: 'UNCLEAR',
      reasoning:
        'This document is a PDF file. Automated image analysis is not supported for PDFs in the current configuration. A human reviewer should inspect this document manually.',
      extracted_data: { name: null, id_number: null, expiry_date: null, address: null },
      confidence: 0.0,
      issues: ['PDF documents require manual review — automated vision analysis is not supported for this file type'],
    };
  }

  const content = [
    {
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data: fileBase64 },
    },
    {
      type: 'text',
      text: `This should be a "${documentType.replace(/_/g, ' ')}" document submitted by "${applicantName}". Analyze it and return your JSON verdict.`,
    },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Claude API error (${response.status}):`, errorText);
    return {
      verdict: 'UNCLEAR',
      reasoning: `AI analysis failed (HTTP ${response.status}). Document needs manual review.`,
      extracted_data: { name: null, id_number: null, expiry_date: null, address: null },
      confidence: 0.0,
      issues: ['AI analysis request failed'],
      api_failed: true,
    };
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  try {
    const cleaned = text.replace(/```json\s*|```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return validateDocumentResult(parsed);
  } catch {
    console.error('Failed to parse Claude response:', text.slice(0, 500));
    return {
      verdict: 'UNCLEAR',
      reasoning: 'AI returned a response that could not be parsed. Document needs manual review.',
      extracted_data: { name: null, id_number: null, expiry_date: null, address: null },
      confidence: 0.0,
      issues: ['AI response parsing failed'],
      api_failed: true,
    };
  }
}

// ─── Helper to reset status on failure ──────────────────────────
async function resetStatusOnError(
  supabase: ReturnType<typeof createClient>,
  applicationId: string
) {
  try {
    await supabase
      .from('licence_applications')
      .update({ ai_review_status: 'error' })
      .eq('id', applicationId);
  } catch {
    console.error('Failed to reset ai_review_status to error');
  }
}

// ─── Main handler ───────────────────────────────────────────────
serve(async (req) => {
  const origin = req.headers.get('Origin');

  // CORS preflight — must return 2xx with CORS headers (never depend on secrets being loaded).
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, origin);
  }

  if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(
      {
        error:
          'Server configuration error: missing secrets. Set ANTHROPIC_API_KEY, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY for this function.',
      },
      503,
      origin
    );
  }

  // Service role client — only used server-side, never exposed
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let applicationId: string | null = null;

  try {
    const body = await req.json();
    applicationId = body.application_id;

    if (!applicationId) {
      return jsonResponse({ error: 'application_id is required' }, 400, origin);
    }

    // ── Auth check: verify caller is admin or staff ──
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return jsonResponse({ error: 'Authorization required' }, 401, origin);
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401, origin);
    }

    // Check user role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'staff'].includes(profile.role)) {
      return jsonResponse({ error: 'Insufficient permissions. Admin or staff role required.' }, 403, origin);
    }

    // 1. Fetch the application
    const { data: application, error: appError } = await supabase
      .from('licence_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return jsonResponse({ error: 'Application not found' }, 404, origin);
    }

    // ── Rate limit: prevent repeated reviews within cooldown ──
    if (application.ai_reviewed_at) {
      const lastReview = new Date(application.ai_reviewed_at).getTime();
      if (Date.now() - lastReview < REVIEW_COOLDOWN_MS) {
        return jsonResponse(
          { error: 'Please wait at least 1 minute before re-running the review.' },
          429,
          origin
        );
      }
    }

    // 2. Mark as reviewing — check result
    const { error: statusErr } = await supabase
      .from('licence_applications')
      .update({ ai_review_status: 'reviewing' })
      .eq('id', applicationId);

    if (statusErr) {
      console.error('Failed to set reviewing status:', statusErr);
      return jsonResponse({ error: 'Failed to start review. Please try again.' }, 500, origin);
    }

    // 3. Delete previous document reviews — check result
    const { error: deleteErr } = await supabase
      .from('document_reviews')
      .delete()
      .eq('application_id', applicationId);

    if (deleteErr) {
      console.error('Failed to clear old reviews:', deleteErr);
      await resetStatusOnError(supabase, applicationId);
      return jsonResponse({ error: 'Failed to prepare review. Please try again.' }, 500, origin);
    }

    // 4. Get required documents for this licence type
    const requiredDocs = LICENCE_REQUIREMENTS[application.licence_type] || [];

    // 5. List uploaded files — abort on failure to avoid false REJECT
    const { data: files, error: filesError } = await supabase.storage
      .from('application-documents')
      .list(`${applicationId}/`);

    if (filesError) {
      console.error('Storage list error:', filesError);
      await resetStatusOnError(supabase, applicationId);
      return jsonResponse(
        { error: 'Could not access uploaded documents. Please check storage configuration and try again.' },
        500,
        origin
      );
    }

    const uploadedFiles = (files || []).filter(
      (f: { name: string }) => !f.name.startsWith('.')
    );

    // 6. Check completeness
    const uploadedTypes = uploadedFiles.map((f: { name: string }) =>
      f.name.split('.')[0].toLowerCase()
    );
    const missingDocs = requiredDocs.filter(
      (doc) => !uploadedTypes.some((uploaded: string) => uploaded.includes(doc))
    );

    // 7. Analyze each uploaded document with AI
    const documentReviews: Array<DocumentResult & { document_type: string; file: string }> = [];
    const applicantName = application.full_name || application.company || '';
    let apiFailureCount = 0;

    for (const file of uploadedFiles) {
      const filePath = `${applicationId}/${file.name}`;

      // Download the file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('application-documents')
        .download(filePath);

      if (downloadError || !fileData) {
        console.error(`Failed to download ${filePath}:`, downloadError);
        documentReviews.push({
          verdict: 'UNCLEAR',
          reasoning: 'Could not download this document for analysis.',
          extracted_data: { name: null, id_number: null, expiry_date: null, address: null },
          confidence: 0.0,
          issues: ['File download failed'],
          document_type: file.name.split('.')[0],
          file: file.name,
        });
        continue;
      }

      // Check file size before base64 encoding
      const buffer = await fileData.arrayBuffer();
      if (buffer.byteLength > MAX_FILE_SIZE) {
        documentReviews.push({
          verdict: 'UNCLEAR',
          reasoning: `File is too large for automated analysis (${Math.round(buffer.byteLength / 1024 / 1024)}MB, limit is 10MB). A human reviewer should inspect this document.`,
          extracted_data: { name: null, id_number: null, expiry_date: null, address: null },
          confidence: 0.0,
          issues: ['File exceeds 10MB size limit'],
          document_type: file.name.split('.')[0],
          file: file.name,
        });
        continue;
      }

      // Convert to base64
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      // Determine MIME type
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const mediaType = IMAGE_MIME_TYPES[ext] || 'application/pdf';

      // Determine expected document type from filename
      const docType = file.name.split('.')[0].toLowerCase();

      // Run AI analysis
      const review = await analyzeDocument(
        base64,
        mediaType,
        docType,
        applicantName,
        application.licence_type
      );

      if (review.api_failed) apiFailureCount++;

      // Store individual review — check result
      const { error: insertErr } = await supabase.from('document_reviews').insert({
        application_id: applicationId,
        document_type: docType,
        file_path: filePath,
        ai_verdict: review.verdict,
        ai_reasoning: review.reasoning,
        extracted_data: review.extracted_data || {},
        confidence: Math.max(0, Math.min(1, review.confidence || 0)),
      });

      if (insertErr) {
        console.error(`Failed to store review for ${filePath}:`, insertErr);
      }

      documentReviews.push({
        ...review,
        document_type: docType,
        file: file.name,
      });
    }

    // If ALL documents failed due to API errors, abort rather than producing a fake review
    if (apiFailureCount > 0 && apiFailureCount === documentReviews.length) {
      await resetStatusOnError(supabase, applicationId);
      return jsonResponse(
        { error: 'AI analysis service is currently unavailable. All document reviews failed. Please try again later.' },
        503,
        origin
      );
    }

    // 8. Compute overall verdict
    const allPass = documentReviews.length > 0 && documentReviews.every((r) => r.verdict === 'PASS');
    const anyFail = documentReviews.some((r) => r.verdict === 'FAIL');
    const hasMissing = missingDocs.length > 0;

    let overallVerdict: string;
    let overallConfidence: number;

    if (hasMissing || anyFail) {
      overallVerdict = 'REJECT';
      overallConfidence = 0.9;
    } else if (allPass && !hasMissing) {
      overallVerdict = 'APPROVE';
      overallConfidence =
        documentReviews.reduce((sum, r) => sum + (r.confidence || 0), 0) /
        Math.max(documentReviews.length, 1);
    } else {
      overallVerdict = 'NEEDS_REVIEW';
      overallConfidence =
        documentReviews.reduce((sum, r) => sum + (r.confidence || 0), 0) /
        Math.max(documentReviews.length, 1);
    }

    // Build summary
    let summary: string;
    if (overallVerdict === 'APPROVE') {
      summary = 'All required documents verified successfully. Application meets requirements for approval.';
    } else if (overallVerdict === 'REJECT') {
      const parts: string[] = [];
      if (hasMissing) parts.push(`Missing documents: ${missingDocs.map((d) => d.replace(/_/g, ' ')).join(', ')}.`);
      if (anyFail) parts.push('One or more documents failed verification.');
      summary = `Application cannot be approved. ${parts.join(' ')}`;
    } else {
      summary = 'Some documents need manual review. See individual document assessments below for details.';
    }

    // Strip api_failed flag from response (internal tracking only)
    const cleanedReviews = documentReviews.map(({ api_failed, ...rest }) => rest);

    const reviewResult = {
      verdict: overallVerdict,
      missing_documents: missingDocs,
      document_reviews: cleanedReviews,
      summary,
    };

    // 9. Store final result — check result
    const { error: finalErr } = await supabase
      .from('licence_applications')
      .update({
        ai_review_status: 'completed',
        ai_review_result: reviewResult,
        ai_reviewed_at: new Date().toISOString(),
        ai_confidence: Math.round(overallConfidence * 100) / 100,
      })
      .eq('id', applicationId);

    if (finalErr) {
      console.error('Failed to store final review result:', finalErr);
      // Still return the result since we computed it, but warn
      return jsonResponse({
        ...reviewResult,
        warning: 'Review completed but could not be saved. Results shown are from this session only.',
      }, 200, origin);
    }

    return jsonResponse(reviewResult, 200, origin);
  } catch (error) {
    console.error('Review error:', error);
    // Reset status so the application isn't stuck in "reviewing"
    if (applicationId) {
      await resetStatusOnError(supabase, applicationId);
    }
    return jsonResponse({ error: 'Review failed. Please try again later.' }, 500, origin);
  }
});
