/**
 * TrackComplaintPage — Public complaint status tracker
 *
 * Phase 2 of the BOCRA Implementation Roadmap.
 * Citizens enter their reference number (no login required) and see:
 *   - Current status with visual timeline
 *   - Provider and complaint type
 *   - Date filed and expected resolution
 *   - Admin replies (public-facing messages only)
 *
 * Reference number acts as the access token — no PII exposed beyond
 * what the complainant themselves entered.
 *
 * Bilingual: English + Setswana.
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, CheckCircle, Clock, AlertCircle, MessageSquare, ChevronRight, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { sanitizeInput } from '../../lib/security';
import { useLanguage } from '../../lib/language';
import PageHero from '../../components/ui/PageHero';
import Breadcrumb from '../../components/ui/Breadcrumb';

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  en: {
    pending:     { label: 'Received',       color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Clock,         desc: 'Your complaint has been received and is awaiting review.' },
    submitted:   { label: 'Received',       color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Clock,         desc: 'Your complaint has been received and is awaiting review.' },
    in_review:   { label: 'Under Review',   color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Search,        desc: 'BOCRA is currently reviewing your complaint.' },
    assigned:    { label: 'Assigned',       color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: ChevronRight,  desc: 'Your complaint has been assigned to the relevant department.' },
    in_progress: { label: 'In Progress',    color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle,   desc: 'BOCRA is actively investigating your complaint.' },
    resolved:    { label: 'Resolved',       color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  icon: CheckCircle,   desc: 'Your complaint has been resolved.' },
    closed:      { label: 'Closed',         color: 'text-gray-600',   bg: 'bg-gray-50',   border: 'border-gray-200',   icon: CheckCircle,   desc: 'This complaint has been closed.' },
  },
  tn: {
    pending:     { label: 'E Amogetse',       color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Clock,        desc: 'Ngongorego ya gago e amogetse mme e emetse go lekolwa.' },
    submitted:   { label: 'E Amogetse',       color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Clock,        desc: 'Ngongorego ya gago e amogetse mme e emetse go lekolwa.' },
    in_review:   { label: 'E a Lekolwa',      color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Search,       desc: 'BOCRA e lekola ngongorego ya gago.' },
    assigned:    { label: 'E Neelwe',         color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: ChevronRight, desc: 'Ngongorego ya gago e neelwe lefapha le le maleba.' },
    in_progress: { label: 'E a Tiriswa',      color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle,  desc: 'BOCRA e batlisisa ngongorego ya gago.' },
    resolved:    { label: 'E Rarabololwe',    color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  icon: CheckCircle,  desc: 'Ngongorego ya gago e rarabololwe.' },
    closed:      { label: 'E Tshamekiwe',     color: 'text-gray-600',   bg: 'bg-gray-50',   border: 'border-gray-200',   icon: CheckCircle,  desc: 'Ngongorego eno e tshamekiwe.' },
  },
};

const TIMELINE_STEPS = ['pending', 'in_review', 'in_progress', 'resolved'];

function timelineIndex(status) {
  const map = { pending: 0, submitted: 0, in_review: 1, assigned: 1, in_progress: 2, resolved: 3, closed: 3 };
  return map[status] ?? 0;
}

function formatDate(d, lang) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(lang === 'tn' ? 'en-GB' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── SEARCH FORM ──────────────────────────────────────────────────────────────
function SearchForm({ lang, onSearch, loading }) {
  const [ref, setRef] = useState('');
  const [error, setError] = useState('');

  // Pre-fill from URL query param ?ref=BOCRA-2026-XXXXX
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('ref');
    if (r) setRef(r.toUpperCase());
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = ref.trim().toUpperCase();
    if (!clean) {
      setError(lang === 'tn' ? 'Tsenya nomoro ya tshupetso' : 'Please enter a reference number');
      return;
    }
    if (!/^BOCRA-\d{4}-[A-Z0-9]{5}$/.test(clean)) {
      setError(
        lang === 'tn'
          ? 'Sebopeho se fosagetseng. Sekai: BOCRA-2026-AB12C'
          : 'Invalid format. Example: BOCRA-2026-AB12C',
      );
      return;
    }
    setError('');
    onSearch(clean);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-bocra-slate mb-1.5">
          {lang === 'tn' ? 'Nomoro ya Tshupetso' : 'Reference Number'}
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={ref}
            onChange={(e) => { setRef(e.target.value.toUpperCase()); setError(''); }}
            placeholder="BOCRA-2026-AB12C"
            maxLength={16}
            className="flex-1 px-4 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-bocra-slate font-mono placeholder:text-bocra-slate/30 focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 disabled:opacity-50"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Search size={18} />}
            <span className="hidden sm:inline">
              {lang === 'tn' ? 'Batlaa' : 'Track'}
            </span>
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      </div>
    </form>
  );
}

// ─── STATUS TIMELINE ──────────────────────────────────────────────────────────
function StatusTimeline({ status, lang }) {
  const currentIdx = timelineIndex(status);
  const labels = {
    en: ['Received', 'Under Review', 'Investigating', 'Resolved'],
    tn: ['E Amogetse', 'E Lekolwa', 'E Batlisiswa', 'E Rarabololwe'],
  };
  const steps = labels[lang] || labels.en;

  return (
    <div className="flex items-start justify-between gap-1 my-6">
      {steps.map((label, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              done   ? 'bg-bocra-green text-white' :
              active ? 'bg-bocra-blue text-white ring-4 ring-bocra-blue/20' :
                       'bg-gray-200 text-gray-400'
            }`}>
              {done ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span className={`mt-1.5 text-[10px] font-medium text-center leading-tight ${
              active ? 'text-bocra-blue' : done ? 'text-bocra-green' : 'text-gray-400'
            }`}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={`absolute hidden`} /> /* connector handled by flex gap */
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── COMPLAINT RESULT CARD ────────────────────────────────────────────────────
function ComplaintResult({ complaint, responses, lang }) {
  const statusConf = (STATUS_CONFIG[lang] || STATUS_CONFIG.en)[complaint.status] || STATUS_CONFIG.en.pending;
  const StatusIcon = statusConf.icon;

  return (
    <div className="space-y-4 mt-8">
      {/* Status Banner */}
      <div className={`rounded-xl border-2 p-5 ${statusConf.bg} ${statusConf.border}`}>
        <div className="flex items-center gap-3 mb-2">
          <StatusIcon size={22} className={statusConf.color} />
          <span className={`text-lg font-bold ${statusConf.color}`}>{statusConf.label}</span>
        </div>
        <p className={`text-sm ${statusConf.color} opacity-80`}>{statusConf.desc}</p>
        <StatusTimeline status={complaint.status} lang={lang} />
      </div>

      {/* Complaint Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          {lang === 'tn' ? 'Dintlha tsa Ngongorego' : 'Complaint Details'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium">
              {lang === 'tn' ? 'Nomoro ya Tshupetso' : 'Reference'}
            </p>
            <p className="text-sm font-mono font-bold text-bocra-blue mt-0.5">
              {complaint.reference_number}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium">
              {lang === 'tn' ? 'Motlamedi' : 'Provider'}
            </p>
            <p className="text-sm text-gray-700 mt-0.5">{complaint.provider || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium">
              {lang === 'tn' ? 'Mofuta wa Bothata' : 'Complaint Type'}
            </p>
            <p className="text-sm text-gray-700 mt-0.5">{complaint.complaint_type || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium">
              {lang === 'tn' ? 'Letsatsi la Go Romela' : 'Filed On'}
            </p>
            <p className="text-sm text-gray-700 mt-0.5">{formatDate(complaint.created_at, lang)}</p>
          </div>
        </div>
      </div>

      {/* Admin replies visible to public */}
      {responses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MessageSquare size={12} />
            {lang === 'tn' ? 'Dipoelo tsa BOCRA' : 'Updates from BOCRA'}
          </h3>
          <div className="space-y-3">
            {responses.map((r) => (
              <div key={r.id} className="bg-bocra-off-white rounded-xl p-4">
                <p className="text-sm text-bocra-slate leading-relaxed">{r.message}</p>
                <p className="text-[10px] text-bocra-slate/40 mt-2">
                  {formatDate(r.created_at, lang)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expected resolution note */}
      {!['resolved', 'closed'].includes(complaint.status) && (
        <div className="bg-bocra-blue/5 border border-bocra-blue/20 rounded-xl p-4 flex gap-3">
          <Clock size={18} className="text-bocra-blue shrink-0 mt-0.5" />
          <p className="text-sm text-bocra-blue">
            {lang === 'tn'
              ? 'BOCRA e ikaelela go rarabolola dingongorego mo malatsing a le 10 a tiriso. Fa o na le potso, ikgolaganye le rona: +267 395 7755'
              : 'BOCRA aims to resolve complaints within 10 business days. For urgent queries contact us: +267 395 7755'}
          </p>
        </div>
      )}

      {/* WhatsApp reminder */}
      {complaint.phone && !['resolved', 'closed'].includes(complaint.status) && (
        <div className="flex items-center gap-3 text-xs text-bocra-slate/50 px-1">
          <Phone size={12} />
          {lang === 'tn'
            ? 'O tla amogela diphetogo ka WhatsApp mo nomorong ya gago ya mogala.'
            : "You'll receive status updates via WhatsApp on the phone number you provided."}
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function TrackComplaintPage() {
  const { lang } = useLanguage();
  const [loading, setLoading]     = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [responses, setResponses] = useState([]);
  const [notFound, setNotFound]   = useState(false);

  const handleSearch = async (ref) => {
    setLoading(true);
    setComplaint(null);
    setResponses([]);
    setNotFound(false);

    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('id, reference_number, provider, complaint_type, status, created_at, phone')
        .eq('reference_number', sanitizeInput(ref, 20))
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setComplaint(data);

      // Fetch public-facing admin replies
      const { data: rData } = await supabase
        .from('complaint_responses')
        .select('id, message, created_at')
        .eq('complaint_id', data.id)
        .order('created_at', { ascending: true });

      setResponses(rData || []);
    } catch {
      setNotFound(true);
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Track Your Complaint | BOCRA</title>
        <meta name="description" content="Track the status of your BOCRA complaint using your reference number." />
      </Helmet>

      <PageHero
        title={lang === 'tn' ? 'Latela Ngongorego ya Gago' : 'Track Your Complaint'}
        subtitle={lang === 'tn'
          ? 'Tsenya nomoro ya tshupetso go bona maemo a ngongorego ya gago'
          : 'Enter your reference number to check the status of your complaint'}
        icon={Search}
      />

      <div className="container-bocra py-12">
        <Breadcrumb items={[
          { label: lang === 'tn' ? 'Ditirelo' : 'Services', href: '/services/file-complaint' },
          { label: lang === 'tn' ? 'Latela Ngongorego' : 'Track Complaint' },
        ]} />

        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <SearchForm lang={lang} onSearch={handleSearch} loading={loading} />

            {notFound && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                <AlertCircle size={28} className="text-red-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-red-700">
                  {lang === 'tn' ? 'Ga re a kgona go bona ngongorego eno' : "We couldn't find that complaint"}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  {lang === 'tn'
                    ? 'Netefatsa nomoro ya tshupetso mme o leke gape. Sekai: BOCRA-2026-AB12C'
                    : 'Check the reference number and try again. Example: BOCRA-2026-AB12C'}
                </p>
              </div>
            )}

            {complaint && (
              <ComplaintResult complaint={complaint} responses={responses} lang={lang} />
            )}
          </div>

          {/* Help box */}
          <div className="mt-6 bg-bocra-off-white rounded-xl p-5 text-center">
            <p className="text-sm text-bocra-slate/70">
              {lang === 'tn'
                ? 'A o latlhegetswe ke nomoro ya tshupetso? Sheba imeile ya netefatso kgotsa molaetsa wa WhatsApp o o romelwang fa o ntsha ngongorego.'
                : "Lost your reference number? Check the confirmation email or WhatsApp message sent when you filed your complaint."}
            </p>
            <a
              href="/hackbocra/services/file-complaint"
              className="text-bocra-blue text-sm font-medium hover:underline mt-2 inline-block"
            >
              {lang === 'tn' ? 'Ntsha ngongorego e ntsha →' : 'File a new complaint →'}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
