/**
 * Data Subject Request Page — My BOCRA Portal
 *
 * Allows authenticated users to exercise their rights under the
 * Data Protection Act, 2018:
 *   - Right to access (Section 23)
 *   - Right to correction/rectification (Section 24)
 *   - Right to erasure/deletion (Section 25)
 *   - Right to restrict processing (Section 26)
 *   - Right to data portability (Section 27)
 *   - Right to withdraw consent
 *
 * Also displays the user's previous requests and their status.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, Shield, Send, CheckCircle, Clock, FileText,
  Eye, Edit3, Trash2, Lock, Download, XCircle, AlertCircle, User
} from 'lucide-react';
import PageHero from '../../components/ui/PageHero';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { sanitizeInput, sanitizeError } from '../../lib/security';
import ConsentCheckbox from '../../components/ui/ConsentCheckbox';
import { useScrollReveal } from '../../hooks/useAnimations';

const REQUEST_TYPES = [
  { value: 'access', label: 'Access my data', desc: 'Get a copy of all personal data BOCRA holds about you', icon: Eye },
  { value: 'correction', label: 'Correct my data', desc: 'Fix inaccurate or incomplete information', icon: Edit3 },
  { value: 'deletion', label: 'Delete my data', desc: 'Request erasure of your personal data', icon: Trash2 },
  { value: 'restriction', label: 'Restrict processing', desc: 'Limit how BOCRA uses your data', icon: Lock },
  { value: 'portability', label: 'Export my data', desc: 'Receive your data in a machine-readable format', icon: Download },
  { value: 'withdraw_consent', label: 'Withdraw consent', desc: 'Revoke previously given consent', icon: XCircle },
];

const DATA_CATEGORIES = [
  'Complaints',
  'Contact enquiries',
  'Licence applications',
  'Cybersecurity incident reports',
  'Portal account information',
  'Type approval applications',
];

const STATUS_CONFIG = {
  submitted:   { label: 'Submitted', color: 'bg-gray-100 text-gray-600', icon: Clock },
  verified:    { label: 'Verified', color: 'bg-blue-50 text-blue-600', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-yellow-50 text-yellow-700', icon: Clock },
  completed:   { label: 'Completed', color: 'bg-green-50 text-green-600', icon: CheckCircle },
  rejected:    { label: 'Rejected', color: 'bg-red-50 text-red-600', icon: XCircle },
};

export default function DataRequestPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const heroRef = useScrollReveal();

  const [view, setView] = useState('list'); // 'list' | 'form' | 'success'
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form state
  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [refNumber, setRefNumber] = useState('');

  useEffect(() => {
    // No redirect — page is accessible to everyone
    // Logged-in users can see their previous requests
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const [fetchError, setFetchError] = useState('');

  async function fetchRequests() {
    setLoadingRequests(true);
    setFetchError('');
    try {
      const { data, error } = await supabase
        .from('data_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      setRequests([]);
      setFetchError(sanitizeError(err));
    }
    setLoadingRequests(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!requestType || !description.trim() || !consent) return;

    setSubmitting(true);
    setError('');

    const ref = 'DPA-' + new Date().getFullYear() + '-' + crypto.randomUUID().slice(0, 8).toUpperCase();

    try {
      const { error: insertErr } = await supabase.from('data_requests').insert([{
        requester_id: user.id,
        requester_name: user.user_metadata?.full_name || user.email,
        requester_email: user.email,
        request_type: requestType,
        description: sanitizeInput(description),
        data_categories: categories,
        reference_number: ref,
        status: 'submitted',
        consent_given_at: new Date().toISOString(),
      }]);

      if (insertErr) throw insertErr;

      setRefNumber(ref);
      setView('success');
      fetchRequests();
    } catch (err) {
      setError(sanitizeError(err));
    }
    setSubmitting(false);
  }

  function resetForm() {
    setRequestType('');
    setDescription('');
    setCategories([]);
    setConsent(false);
    setError('');
    setView('list');
  }

  function toggleCategory(cat) {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-bocra-blue/30 border-t-bocra-blue rounded-full animate-spin" />
      </div>
    );
  }

  // Page is accessible to everyone — non-logged-in users see a sign-in prompt

  return (
    <div className="min-h-screen bg-bocra-off-white">
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue">Home</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">My Data Rights</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <PageHero category="SERVICES" title="My Data Rights" description="Exercise your rights under the Botswana Data Protection Act 2024. Request access to, correction, or deletion of your personal data held by BOCRA." color="blue" />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Not logged in — show explanation and login prompt */}
        {!user && !authLoading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00458B]/10 flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-[#00458B]" />
            </div>
            <h2 className="text-xl font-bold text-bocra-slate mb-2">Sign In to Access Data Rights</h2>
            <p className="text-sm text-bocra-slate/60 max-w-md mx-auto mb-6">
              To submit a Data Subject Access Request or view your previous requests, please sign in with your BOCRA account. If you don't have one, you can register through the ASMS-WebCP portal.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/services/asms-webcp" className="px-6 py-2.5 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] transition-all">
                Sign In
              </Link>
              <Link to="/services/asms-webcp" className="px-6 py-2.5 border border-gray-200 text-sm font-medium text-bocra-slate rounded-xl hover:bg-gray-50 transition-all">
                Create Account
              </Link>
            </div>
            <p className="text-xs text-bocra-slate/30 mt-6">
              For general enquiries about data protection, contact us at <a href="mailto:info@bocra.org.bw" className="text-[#00A6CE] hover:underline">info@bocra.org.bw</a> or call <a href="tel:+2673957755" className="text-[#00A6CE] hover:underline">+267 395 7755</a>.
            </p>
          </div>
        )}

        {/* Loading */}
        {authLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#00458B]/20 border-t-[#00458B] rounded-full animate-spin" />
          </div>
        )}

        {/* Logged in — show full page */}
        {user && <>
        {/* Logged in as */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-xl border border-gray-200 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-bocra-blue/10 flex items-center justify-center">
              <User size={16} className="text-bocra-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-bocra-slate">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-xs text-bocra-slate/40">{user.email}</p>
            </div>
          </div>
          {view === 'list' && (
            <button onClick={() => setView('form')} className="btn-primary text-sm py-2.5 px-5">
              <FileText size={14} />
              New Request
            </button>
          )}
          {view !== 'list' && (
            <button onClick={resetForm} className="text-sm text-bocra-slate/50 hover:text-bocra-slate">
              Back to requests
            </button>
          )}
        </div>

        {/* ─── VIEW: Request List ─── */}
        {view === 'list' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-bocra-slate">Your Data Requests</h2>

            {fetchError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                <AlertCircle size={14} />
                {fetchError}
              </div>
            )}

            {loadingRequests ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="w-6 h-6 border-2 border-bocra-blue/30 border-t-bocra-blue rounded-full animate-spin mx-auto" />
              </div>
            ) : requests.length === 0 && !fetchError ? (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                <Shield size={40} className="text-bocra-blue/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-bocra-slate mb-2">No requests yet</h3>
                <p className="text-sm text-bocra-slate/50 max-w-md mx-auto mb-6">
                  You have the right to access, correct, or delete any personal data BOCRA holds about you.
                  Submit a request and we will respond within 30 days.
                </p>
                <button onClick={() => setView('form')} className="btn-primary text-sm py-2.5 px-6">
                  <FileText size={14} />
                  Submit a Request
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => {
                  const sc = STATUS_CONFIG[req.status] || STATUS_CONFIG.submitted;
                  const StatusIcon = sc.icon;
                  const typeInfo = REQUEST_TYPES.find(t => t.value === req.request_type);
                  const TypeIcon = typeInfo?.icon || FileText;
                  const isExpanded = selectedRequest === req.id;

                  return (
                    <div key={req.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setSelectedRequest(isExpanded ? null : req.id)}
                        className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-bocra-blue/5 flex items-center justify-center flex-shrink-0">
                          <TypeIcon size={18} className="text-bocra-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-bocra-slate">{typeInfo?.label || req.request_type}</p>
                          <p className="text-xs text-bocra-slate/40 font-mono">{req.reference_number}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${sc.color} flex items-center gap-1`}>
                          <StatusIcon size={12} />
                          {sc.label}
                        </span>
                        <ChevronRight size={16} className={`text-bocra-slate/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-4 border-t border-gray-100 pt-3 space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-bocra-slate/40 text-xs">Submitted</span>
                              <p className="text-bocra-slate">{new Date(req.submitted_at).toLocaleDateString('en-BW', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div>
                              <span className="text-bocra-slate/40 text-xs">Response due by</span>
                              <p className="text-bocra-slate font-medium">{new Date(req.due_by).toLocaleDateString('en-BW', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-bocra-slate/40 text-xs">Description</span>
                            <p className="text-sm text-bocra-slate mt-0.5">{req.description}</p>
                          </div>
                          {req.data_categories?.length > 0 && (
                            <div>
                              <span className="text-bocra-slate/40 text-xs">Data categories</span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {req.data_categories.map(c => (
                                  <span key={c} className="px-2 py-0.5 bg-bocra-blue/5 text-bocra-blue text-xs rounded-md">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {req.response && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <span className="text-green-700 text-xs font-medium">BOCRA Response</span>
                              <p className="text-sm text-green-800 mt-1">{req.response}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Info card */}
            <div className="bg-bocra-blue/[0.03] border border-bocra-blue/10 rounded-xl p-5 mt-6">
              <h3 className="text-sm font-semibold text-bocra-slate mb-2 flex items-center gap-2">
                <Shield size={14} className="text-bocra-blue" />
                Your Rights Under the Data Protection Act, 2018
              </h3>
              <ul className="text-xs text-bocra-slate/60 space-y-1.5">
                <li><strong>Right to Access</strong> — Request a copy of all personal data we hold about you</li>
                <li><strong>Right to Rectification</strong> — Have inaccurate or incomplete data corrected</li>
                <li><strong>Right to Erasure</strong> — Request deletion of your data (subject to legal obligations)</li>
                <li><strong>Right to Restrict Processing</strong> — Limit how we process your data</li>
                <li><strong>Right to Portability</strong> — Receive your data in a machine-readable format</li>
                <li><strong>Right to Withdraw Consent</strong> — Revoke consent without affecting prior processing</li>
              </ul>
              <p className="text-xs text-bocra-slate/40 mt-3">
                BOCRA will respond to all requests within <strong>30 days</strong> as required by law.
                Read our full <Link to="/privacy-notice" className="text-bocra-blue hover:underline">Privacy Notice</Link>.
              </p>
            </div>
          </div>
        )}

        {/* ─── VIEW: New Request Form ─── */}
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-bocra-slate">Submit a Data Request</h2>

            {/* Step 1: Request type */}
            <div>
              <label className="block text-sm font-medium text-bocra-slate mb-3">What would you like to do?</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {REQUEST_TYPES.map((type) => {
                  const Icon = type.icon;
                  const selected = requestType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setRequestType(type.value)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? 'border-bocra-blue bg-bocra-blue/[0.03]'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          selected ? 'bg-bocra-blue/10 text-bocra-blue' : 'bg-gray-100 text-bocra-slate/40'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${selected ? 'text-bocra-blue' : 'text-bocra-slate'}`}>{type.label}</p>
                          <p className="text-xs text-bocra-slate/40">{type.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Data categories */}
            {requestType && (
              <div>
                <label className="block text-sm font-medium text-bocra-slate mb-2">
                  Which data categories does this relate to?
                  <span className="text-bocra-slate/40 font-normal ml-1">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DATA_CATEGORIES.map((cat) => {
                    const active = categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3.5 py-2 rounded-lg text-sm border transition-all ${
                          active
                            ? 'bg-bocra-blue text-white border-bocra-blue'
                            : 'bg-white text-bocra-slate/60 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Description */}
            {requestType && (
              <div>
                <label className="block text-sm font-medium text-bocra-slate mb-1.5">
                  Describe your request
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  placeholder={
                    requestType === 'access' ? 'Please provide me with all personal data BOCRA holds about me, including...' :
                    requestType === 'correction' ? 'The following information is incorrect and should be corrected: ...' :
                    requestType === 'deletion' ? 'Please delete my personal data from the following systems: ...' :
                    'Please describe your request in detail...'
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-bocra-slate placeholder:text-bocra-slate/30 focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all resize-none"
                />
              </div>
            )}

            {/* Consent + Submit */}
            {requestType && description.trim() && (
              <>
                <ConsentCheckbox
                  checked={consent}
                  onChange={setConsent}
                  purpose="verifying your identity and processing your data subject request under the Data Protection Act, 2018"
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !consent}
                  className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                  <Send size={16} />
                </button>
              </>
            )}
          </form>
        )}

        {/* ─── VIEW: Success ─── */}
        {view === 'success' && (
          <div className="bg-white rounded-xl border border-green-200 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#6BBE4E]" />
            </div>
            <h2 className="text-2xl font-bold text-bocra-slate mb-2">Request Submitted</h2>
            <p className="text-sm text-bocra-slate/50 max-w-md mx-auto mb-4">
              Your data request has been received. BOCRA will verify your identity and respond within <strong>30 days</strong> as required by the Data Protection Act, 2018.
            </p>
            <div className="inline-block px-5 py-2.5 bg-bocra-off-white rounded-lg text-lg font-mono font-bold text-bocra-blue mb-6">
              {refNumber}
            </div>
            <p className="text-xs text-bocra-slate/30 mb-6">Keep this reference number for your records.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={resetForm}
                className="px-5 py-2.5 border border-gray-200 text-bocra-slate text-sm rounded-xl hover:border-gray-300"
              >
                View My Requests
              </button>
              <Link to="/" className="btn-primary text-sm py-2.5 px-5">
                Return Home
              </Link>
            </div>
          </div>
        )}
        </>}
      </div>
    </div>
  );
}
