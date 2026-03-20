/**
 * ApplicationReview — AI-powered document review panel for licence applications.
 *
 * Embedded inside the ApplicationDetail view in ApplicationsPage.jsx.
 * Calls the review-application Edge Function, displays per-document
 * verdicts, confidence scores, extracted data, and lets admins
 * approve or reject with one click.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Bot,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Shield,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

/* ─── Verdict styling config ─── */

const VERDICT_CONFIG = {
  APPROVE: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    label: 'AI Recommendation: Approve',
  },
  REJECT: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    label: 'AI Recommendation: Reject',
  },
  NEEDS_REVIEW: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    label: 'Needs Manual Review',
  },
};

/* ─── Confidence meter ─── */

function ConfidenceMeter({ value }) {
  const pct = Math.round((value || 0) * 100);
  const color =
    pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-mono text-gray-500">{pct}%</span>
    </div>
  );
}

/* ─── Single document review card ─── */

function DocumentCheck({ review }) {
  const [expanded, setExpanded] = useState(false);
  const verdict = review.ai_verdict || review.verdict;
  const Icon =
    verdict === 'PASS'
      ? CheckCircle
      : verdict === 'FAIL'
      ? XCircle
      : AlertTriangle;
  const color =
    verdict === 'PASS'
      ? 'text-emerald-600'
      : verdict === 'FAIL'
      ? 'text-red-600'
      : 'text-amber-600';
  const pillBg =
    verdict === 'PASS'
      ? 'bg-emerald-100 text-emerald-700'
      : verdict === 'FAIL'
      ? 'bg-red-100 text-red-700'
      : 'bg-amber-100 text-amber-700';

  const extractedData = review.extracted_data || {};
  const hasExtractedData = Object.values(extractedData).some(
    (v) => v !== null && v !== undefined && v !== ''
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors min-h-[48px]"
        aria-expanded={expanded}
        aria-label={`${(review.document_type || '').replace(/_/g, ' ')} — ${verdict}`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 capitalize">
              {(review.document_type || '').replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-gray-400">
              {review.file || review.file_path?.split('/').pop()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${pillBg}`}
          >
            {verdict}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          {/* Reasoning */}
          <div className="pt-3">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">
              AI Reasoning
            </p>
            <p className="text-sm text-gray-700">
              {review.ai_reasoning || review.reasoning}
            </p>
          </div>

          {/* Extracted data */}
          {hasExtractedData && (
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">
                Extracted Data
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(extractedData).map(
                  ([key, val]) =>
                    val && (
                      <div key={key} className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-800 font-mono mt-0.5">
                          {String(val)}
                        </p>
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Issues */}
          {review.issues && review.issues.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">
                Issues Found
              </p>
              <ul className="space-y-1">
                {review.issues.map((issue, i) => (
                  <li
                    key={i}
                    className="text-sm text-red-600 flex items-start gap-2"
                  >
                    <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confidence */}
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">
              Confidence
            </p>
            <ConfidenceMeter value={review.confidence} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─── */

export default function ApplicationReview({ applicationId, onStatusChange }) {
  const [application, setApplication] = useState(null);
  const [reviewResult, setReviewResult] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState(null);
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    if (applicationId) fetchApplication();
  }, [applicationId]);

  async function fetchApplication() {
    try {
      const { data, error: fetchErr } = await supabase
        .from('licence_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (fetchErr) {
        setError(fetchErr.message);
        return;
      }
      if (data) {
        setApplication(data);
        if (data.ai_review_result) {
          setReviewResult(data.ai_review_result);
        }
      }
    } catch (err) {
      console.error('[BOCRA] fetchApplication failed:', err);
      setError(err.message || 'Failed to load application data.');
    }
  }

  async function triggerAIReview() {
    setIsReviewing(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('You must be logged in to run AI reviews.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/review-application`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ application_id: applicationId }),
        }
      );

      if (!response.ok) {
        let errorMsg = `AI review failed (HTTP ${response.status})`;
        try {
          const errBody = await response.json();
          if (errBody.error) errorMsg = errBody.error;
        } catch { /* response body was not JSON */ }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      setReviewResult(result);
      await fetchApplication();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsReviewing(false);
    }
  }

  async function handleDecision(status) {
    setIsActioning(true);
    try {
      const { error: updateErr } = await supabase
        .from('licence_applications')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (updateErr) throw updateErr;

      await fetchApplication();
      onStatusChange?.(status);
    } catch (err) {
      console.error('[BOCRA] handleDecision failed:', err);
      setError(err.message || err.details || 'Failed to update application status.');
    } finally {
      setIsActioning(false);
    }
  }

  if (error && !application) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-[#00458B]/20 border-t-[#00458B] rounded-full animate-spin" />
      </div>
    );
  }

  const verdictConfig = reviewResult
    ? (VERDICT_CONFIG[reviewResult.verdict] || VERDICT_CONFIG.NEEDS_REVIEW)
    : null;
  const VerdictIcon = verdictConfig?.icon;

  return (
    <div className="space-y-4">
      {/* ─── Trigger Button ─── */}
      {!reviewResult && !isReviewing && (
        <div className="border-2 border-dashed border-[#00A6CE]/30 rounded-xl p-6 text-center bg-[#00A6CE]/5">
          <Bot
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: '#00A6CE' }}
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-1 font-display">
            AI Document Review
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Automatically verify uploaded documents, extract key data, and
            receive an approval recommendation powered by AI.
          </p>
          <button
            onClick={triggerAIReview}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00A6CE] hover:bg-[#0090b5] text-white font-medium rounded-lg transition-colors min-h-[48px]"
            aria-label="Run AI document review"
          >
            <Shield className="w-4 h-4" />
            Run AI Review
          </button>
        </div>
      )}

      {/* ─── Loading State ─── */}
      {isReviewing && (
        <div className="border border-[#00A6CE]/20 rounded-xl p-8 text-center bg-[#00A6CE]/5">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: '#00A6CE' }} />
          <h3 className="text-lg font-semibold text-gray-900 mb-1 font-display">
            Analysing Documents…
          </h3>
          <p className="text-sm text-gray-500">
            AI is reviewing each uploaded document. This may take 15–30
            seconds.
          </p>
        </div>
      )}

      {/* ─── Error ─── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 font-medium">Review Error</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ─── Results ─── */}
      {reviewResult && (
        <div className="space-y-4">
          {/* Overall Verdict */}
          <div
            className={`border rounded-xl p-5 ${verdictConfig?.bg || 'bg-gray-50 border-gray-200'}`}
          >
            <div className="flex items-start gap-4">
              {VerdictIcon && (
                <VerdictIcon
                  className={`w-8 h-8 ${verdictConfig?.color} flex-shrink-0 mt-0.5`}
                />
              )}
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold font-display ${verdictConfig?.color}`}
                >
                  {verdictConfig?.label}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {reviewResult.summary}
                </p>
                {application.ai_confidence != null && (
                  <div className="mt-3 max-w-xs">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">
                      Overall Confidence
                    </p>
                    <ConfidenceMeter value={application.ai_confidence} />
                  </div>
                )}
              </div>
              {application.ai_reviewed_at && (
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Reviewed
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    {new Date(application.ai_reviewed_at).toLocaleString(
                      'en-GB',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Missing Documents */}
          {reviewResult.missing_documents?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-700 mb-2">
                Missing Required Documents
              </p>
              <ul className="space-y-1">
                {reviewResult.missing_documents.map((doc) => (
                  <li
                    key={doc}
                    className="text-sm text-red-600 flex items-center gap-2"
                  >
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="capitalize">
                      {doc.replace(/_/g, ' ')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Per-Document Reviews */}
          {reviewResult.document_reviews?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Document Checks ({reviewResult.document_reviews.length})
              </h4>
              <div className="space-y-2">
                {reviewResult.document_reviews.map((review, i) => (
                  <DocumentCheck key={i} review={review} />
                ))}
              </div>
            </div>
          )}

          {/* Admin Decision Buttons */}
          {(application.status === 'pending' ||
            application.status === 'under_review') && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleDecision('approved')}
                disabled={isActioning}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors min-h-[48px]"
                aria-label="Approve this application"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve Application
              </button>
              <button
                onClick={() => handleDecision('rejected')}
                disabled={isActioning}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors min-h-[48px]"
                aria-label="Reject this application"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject Application
              </button>
              <button
                onClick={triggerAIReview}
                disabled={isReviewing}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors min-h-[48px]"
                aria-label="Re-run AI review"
              >
                <RotateCcw className="w-4 h-4" />
                Re-run
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
