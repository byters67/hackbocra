# AI-Powered Licence Application Auto-Review

## Architecture Overview

```
Applicant uploads docs → Supabase Storage
                              ↓
Admin clicks "AI Review" → Supabase Edge Function
                              ↓
                     Claude API analyzes docs
                              ↓
              Returns verdict: APPROVE / NEEDS_REVIEW / REJECT
                              ↓
                Admin sees AI recommendation + reasoning
                              ↓
              One-click approve or override
```

## What Gets Automated

1. **Completeness check** — Are all required documents uploaded?
2. **Document type validation** — Does each file look like what it claims to be? (ID looks like an ID, not a random photo)
3. **Data extraction** — Pull name, ID number, dates from documents
4. **Cross-referencing** — Does the name on the ID match the applicant name?
5. **Decision recommendation** — APPROVE / NEEDS_REVIEW / REJECT with reasoning

## Files to Add/Modify

### 1. Supabase Edge Function (the brain)

### 2. React component for the admin review page

### 3. Database changes for storing AI review results

---

## Step 1: Database Migration

Run this in Supabase SQL Editor:

```sql
-- Add AI review columns to licence_applications table
ALTER TABLE licence_applications ADD COLUMN IF NOT EXISTS ai_review_status TEXT DEFAULT NULL;
ALTER TABLE licence_applications ADD COLUMN IF NOT EXISTS ai_review_result JSONB DEFAULT NULL;
ALTER TABLE licence_applications ADD COLUMN IF NOT EXISTS ai_reviewed_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE licence_applications ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC(3,2) DEFAULT NULL;

-- Create a table for individual document checks
CREATE TABLE IF NOT EXISTS document_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES licence_applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,       -- 'national_id', 'proof_of_address', 'exam_certificate', 'payment_receipt'
  file_path TEXT NOT NULL,
  ai_verdict TEXT NOT NULL,          -- 'PASS', 'FAIL', 'UNCLEAR'
  ai_reasoning TEXT NOT NULL,
  extracted_data JSONB DEFAULT '{}', -- name, id_number, dates, etc.
  confidence NUMERIC(3,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: only admins can read/write reviews
ALTER TABLE document_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage document reviews"
  ON document_reviews FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## Step 2: Supabase Edge Function

Create `supabase/functions/review-application/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ReviewRequest {
  application_id: string;
}

// Document requirements per licence type
const LICENCE_REQUIREMENTS: Record<string, string[]> = {
  "Amateur Radio Licence": [
    "national_id",
    "proof_of_address",
    "exam_certificate",
  ],
  "Telecommunications Licence": [
    "national_id",
    "company_registration",
    "technical_specification",
    "payment_receipt",
  ],
  // Add more licence types as needed
};

async function analyzeDocument(
  fileBase64: string,
  mediaType: string,
  documentType: string,
  applicantName: string,
  licenceType: string
): Promise<{
  verdict: string;
  reasoning: string;
  extracted_data: Record<string, string>;
  confidence: number;
}> {
  const systemPrompt = `You are a document verification assistant for BOCRA (Botswana Communications Regulatory Authority). 
You are reviewing documents submitted as part of a "${licenceType}" application.

Your job is to analyze the uploaded document and determine:
1. Is this document the correct TYPE? (e.g., if we expect a National ID, does this look like a Botswana Omang/national ID card?)
2. Can you extract key data from it? (name, ID number, dates, address)
3. Does the name on the document match the applicant name: "${applicantName}"?
4. Is the document legible and appears valid (not expired, not obviously tampered)?

Respond with ONLY a JSON object (no markdown, no backticks):
{
  "verdict": "PASS" | "FAIL" | "UNCLEAR",
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

Be strict but fair. Mark as UNCLEAR (not FAIL) if the image is blurry but appears to be the right document type.
Mark as FAIL only if the document is clearly wrong type, expired, or names don't match at all.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: fileBase64,
              },
            },
            {
              type: "text",
              text: `This should be a "${documentType}" document. Analyze it now.`,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content[0].text;

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return {
      verdict: "UNCLEAR",
      reasoning: "Failed to parse AI response",
      extracted_data: {},
      confidence: 0,
    };
  }
}

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { application_id }: ReviewRequest = await req.json();

    // Initialize Supabase with service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch the application
    const { data: application, error: appError } = await supabase
      .from("licence_applications")
      .select("*")
      .eq("id", application_id)
      .single();

    if (appError || !application) {
      return new Response(
        JSON.stringify({ error: "Application not found" }),
        { status: 404, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // 2. Update status to "reviewing"
    await supabase
      .from("licence_applications")
      .update({ ai_review_status: "reviewing" })
      .eq("id", application_id);

    // 3. Get required documents for this licence type
    const requiredDocs = LICENCE_REQUIREMENTS[application.licence_type] || [];

    // 4. Fetch uploaded documents from storage
    const { data: files } = await supabase.storage
      .from("application-documents")
      .list(`${application_id}/`);

    // 5. Check completeness
    const uploadedTypes = (files || []).map((f: { name: string }) =>
      f.name.split(".")[0].toLowerCase()
    );
    const missingDocs = requiredDocs.filter(
      (doc) => !uploadedTypes.some((uploaded: string) => uploaded.includes(doc))
    );

    // 6. Analyze each uploaded document with AI
    const documentReviews = [];

    for (const file of files || []) {
      // Download the file
      const { data: fileData } = await supabase.storage
        .from("application-documents")
        .download(`${application_id}/${file.name}`);

      if (!fileData) continue;

      // Convert to base64
      const buffer = await fileData.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      // Determine media type
      const ext = file.name.split(".").pop()?.toLowerCase();
      const mediaType =
        ext === "pdf"
          ? "application/pdf"
          : ext === "png"
          ? "image/png"
          : "image/jpeg";

      // Determine expected document type from filename
      const docType =
        file.name.split(".")[0].replace(/_/g, " ") || "unknown document";

      // AI analysis
      const review = await analyzeDocument(
        base64,
        mediaType,
        docType,
        application.applicant_name || application.name || "",
        application.licence_type
      );

      // Store individual review
      const { data: reviewRecord } = await supabase
        .from("document_reviews")
        .insert({
          application_id,
          document_type: docType,
          file_path: `${application_id}/${file.name}`,
          ai_verdict: review.verdict,
          ai_reasoning: review.reasoning,
          extracted_data: review.extracted_data,
          confidence: review.confidence,
        })
        .select()
        .single();

      documentReviews.push({ ...review, document_type: docType, file: file.name });
    }

    // 7. Make overall decision
    const allPass = documentReviews.every((r) => r.verdict === "PASS");
    const anyFail = documentReviews.some((r) => r.verdict === "FAIL");
    const hasMissing = missingDocs.length > 0;

    let overallVerdict: string;
    let overallConfidence: number;

    if (hasMissing || anyFail) {
      overallVerdict = "REJECT";
      overallConfidence = 0.9;
    } else if (allPass && !hasMissing) {
      overallVerdict = "APPROVE";
      overallConfidence =
        documentReviews.reduce((sum, r) => sum + r.confidence, 0) /
        documentReviews.length;
    } else {
      overallVerdict = "NEEDS_REVIEW";
      overallConfidence =
        documentReviews.reduce((sum, r) => sum + r.confidence, 0) /
        documentReviews.length;
    }

    // 8. Store overall result
    const reviewResult = {
      verdict: overallVerdict,
      missing_documents: missingDocs,
      document_reviews: documentReviews,
      summary:
        overallVerdict === "APPROVE"
          ? "All documents verified. Application meets requirements."
          : overallVerdict === "REJECT"
          ? `Application incomplete or invalid. ${hasMissing ? `Missing: ${missingDocs.join(", ")}. ` : ""}${anyFail ? "One or more documents failed verification." : ""}`
          : "Some documents need manual review. See individual assessments.",
    };

    await supabase
      .from("licence_applications")
      .update({
        ai_review_status: "completed",
        ai_review_result: reviewResult,
        ai_reviewed_at: new Date().toISOString(),
        ai_confidence: overallConfidence,
      })
      .eq("id", application_id);

    return new Response(JSON.stringify(reviewResult), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Review error:", error);
    return new Response(
      JSON.stringify({ error: "Review failed", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
```

### Deploy the Edge Function

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref cyalwtuladeexxfsbrcs

# Set the Anthropic API key as a secret
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here

# Deploy
supabase functions deploy review-application
```

---

## Step 3: React Admin Component

Create `src/pages/admin/ApplicationReview.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  CheckCircle, XCircle, AlertTriangle, Loader2, 
  Bot, FileCheck, Clock, ChevronDown, ChevronUp,
  Shield, Eye
} from 'lucide-react';

const VERDICT_CONFIG = {
  APPROVE: { 
    icon: CheckCircle, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    label: 'Recommended: Approve' 
  },
  REJECT: { 
    icon: XCircle, 
    color: 'text-red-400', 
    bg: 'bg-red-500/10 border-red-500/20',
    label: 'Recommended: Reject' 
  },
  NEEDS_REVIEW: { 
    icon: AlertTriangle, 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/10 border-amber-500/20',
    label: 'Needs Manual Review' 
  },
};

function ConfidenceMeter({ value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-mono text-white/60">{pct}%</span>
    </div>
  );
}

function DocumentCheck({ review, index }) {
  const [expanded, setExpanded] = useState(false);
  const verdict = review.ai_verdict || review.verdict;
  const Icon = verdict === 'PASS' ? CheckCircle : verdict === 'FAIL' ? XCircle : AlertTriangle;
  const color = verdict === 'PASS' ? 'text-emerald-400' : verdict === 'FAIL' ? 'text-red-400' : 'text-amber-400';

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${color}`} />
          <div className="text-left">
            <p className="text-sm font-medium text-white capitalize">
              {(review.document_type || '').replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-white/50">{review.file || review.file_path?.split('/').pop()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono px-2 py-1 rounded ${
            verdict === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' :
            verdict === 'FAIL' ? 'bg-red-500/20 text-red-400' :
            'bg-amber-500/20 text-amber-400'
          }`}>
            {verdict}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5">
          <div className="pt-3">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">AI Reasoning</p>
            <p className="text-sm text-white/70">{review.ai_reasoning || review.reasoning}</p>
          </div>
          
          {review.extracted_data && Object.keys(review.extracted_data).length > 0 && (
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Extracted Data</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(review.extracted_data).map(([key, val]) => val && (
                  <div key={key} className="bg-white/5 rounded p-2">
                    <p className="text-xs text-white/40 capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-white/80 font-mono">{String(val)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Confidence</p>
            <ConfidenceMeter value={review.confidence} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationReview({ applicationId, onStatusChange }) {
  const [application, setApplication] = useState(null);
  const [reviewResult, setReviewResult] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  async function fetchApplication() {
    const { data, error } = await supabase
      .from('licence_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (data) {
      setApplication(data);
      if (data.ai_review_result) {
        setReviewResult(data.ai_review_result);
      }
    }
    if (error) setError(error.message);
  }

  async function triggerAIReview() {
    setIsReviewing(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/review-application`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ application_id: applicationId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Review failed');
      }

      setReviewResult(result);
      await fetchApplication(); // Refresh to get updated DB state
    } catch (err) {
      setError(err.message);
    } finally {
      setIsReviewing(false);
    }
  }

  async function handleDecision(status) {
    setIsApproving(true);
    try {
      const { error } = await supabase
        .from('licence_applications')
        .update({ 
          status,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;
      
      await fetchApplication();
      onStatusChange?.(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsApproving(false);
    }
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  const verdictConfig = reviewResult ? VERDICT_CONFIG[reviewResult.verdict] : null;
  const VerdictIcon = verdictConfig?.icon;

  return (
    <div className="space-y-6">
      {/* AI Review Trigger */}
      {!reviewResult && !isReviewing && (
        <div className="border border-dashed border-cyan-500/30 rounded-xl p-6 text-center">
          <Bot className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">AI Document Review</h3>
          <p className="text-sm text-white/50 mb-4">
            Automatically verify uploaded documents, extract data, and get an approval recommendation.
          </p>
          <button
            onClick={triggerAIReview}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Run AI Review
          </button>
        </div>
      )}

      {/* Reviewing State */}
      {isReviewing && (
        <div className="border border-cyan-500/20 rounded-xl p-8 text-center bg-cyan-500/5">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">Analyzing Documents...</h3>
          <p className="text-sm text-white/50">
            AI is reviewing each document. This may take 15–30 seconds.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Review Results */}
      {reviewResult && (
        <div className="space-y-4">
          {/* Overall Verdict */}
          <div className={`border rounded-xl p-5 ${verdictConfig?.bg}`}>
            <div className="flex items-start gap-4">
              {VerdictIcon && <VerdictIcon className={`w-8 h-8 ${verdictConfig?.color} flex-shrink-0 mt-0.5`} />}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${verdictConfig?.color}`}>
                  {verdictConfig?.label}
                </h3>
                <p className="text-sm text-white/60 mt-1">{reviewResult.summary}</p>
                {application.ai_confidence && (
                  <div className="mt-3 max-w-xs">
                    <p className="text-xs text-white/40 mb-1">Overall Confidence</p>
                    <ConfidenceMeter value={application.ai_confidence} />
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-white/30">Reviewed</p>
                <p className="text-xs text-white/50 font-mono">
                  {application.ai_reviewed_at ? new Date(application.ai_reviewed_at).toLocaleString() : 'Just now'}
                </p>
              </div>
            </div>
          </div>

          {/* Missing Documents */}
          {reviewResult.missing_documents?.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-red-400 mb-2">Missing Documents:</p>
              <ul className="space-y-1">
                {reviewResult.missing_documents.map((doc) => (
                  <li key={doc} className="text-sm text-red-300/70 flex items-center gap-2">
                    <XCircle className="w-3 h-3" />
                    <span className="capitalize">{doc.replace(/_/g, ' ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Individual Document Reviews */}
          <div>
            <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Document Checks
            </h4>
            <div className="space-y-2">
              {(reviewResult.document_reviews || []).map((review, i) => (
                <DocumentCheck key={i} review={review} index={i} />
              ))}
            </div>
          </div>

          {/* Admin Decision Buttons */}
          {application.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => handleDecision('approved')}
                disabled={isApproving}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Application
              </button>
              <button
                onClick={() => handleDecision('rejected')}
                disabled={isApproving}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject Application
              </button>
              <button
                onClick={triggerAIReview}
                disabled={isReviewing}
                className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white/70 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Re-run
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Step 4: Integrate into Admin Applications Page

In your existing admin applications page, import and use the component:

```jsx
import ApplicationReview from './ApplicationReview';

// Inside your application detail view:
<ApplicationReview 
  applicationId={selectedApplication.id}
  onStatusChange={(status) => {
    // Refresh your applications list
    fetchApplications();
  }}
/>
```

---

## Step 5: Storage Bucket Setup

Make sure you have a Supabase storage bucket for documents:

```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT DO NOTHING;

-- Policy: authenticated users can upload to their application folder
CREATE POLICY "Users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'application-documents' AND
    auth.role() = 'authenticated'
  );

-- Policy: admins and service role can read all documents
CREATE POLICY "Admins can read all documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'application-documents' AND
    (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'service_role')
  );
```

---

## Step 6: Application Form (Applicant Side)

Make sure your application form uploads files with predictable names:

```jsx
async function uploadDocument(applicationId, file, documentType) {
  const ext = file.name.split('.').pop();
  const path = `${applicationId}/${documentType}.${ext}`;
  
  const { error } = await supabase.storage
    .from('application-documents')
    .upload(path, file, { upsert: true });

  return { error, path };
}

// Usage:
await uploadDocument(appId, idFile, 'national_id');
await uploadDocument(appId, addressFile, 'proof_of_address');
await uploadDocument(appId, certFile, 'exam_certificate');
```

---

## Quick Setup Checklist

1. [ ] Run the SQL migration (Step 1)
2. [ ] Create the storage bucket (Step 5)
3. [ ] Get an Anthropic API key from console.anthropic.com
4. [ ] Deploy the Edge Function with `supabase functions deploy` (Step 2)
5. [ ] Set `ANTHROPIC_API_KEY` secret in Supabase
6. [ ] Add the React component to your admin page (Steps 3 & 4)
7. [ ] Ensure applicant form uploads files with correct naming (Step 6)
8. [ ] Test with a sample application

---

## Hackathon Demo Tips

- **Pre-load a test application** with real-looking documents so the demo is smooth
- **The AI review takes ~15-30s** — have a loading animation that looks intentional, not broken
- **Show the confidence scores** — judges love seeing quantified AI outputs, not just pass/fail
- **Emphasize human-in-the-loop** — AI recommends, admin decides. This is a HUGE credibility point
- **Have a failure case ready** — show what happens when a document is wrong type or name doesn't match. Proving your system catches errors is more impressive than showing it approves everything.
