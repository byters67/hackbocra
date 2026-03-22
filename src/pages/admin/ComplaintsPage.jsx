/**
 * ComplaintsPage — BOCRA Admin Complaints Management
 * 
 * List view with filters + Detail view with AI analysis, replies, status changes.
 * Status values match database constraint: pending, investigating, resolved, closed
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft, Search, Send, Clock, ChevronDown, X, Mail,
  AlertTriangle, Filter, AlertCircle, CheckCircle, Eye,
  Building, User, Phone, Calendar, FileText, Shield
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AI_CATEGORIES, AI_DEPARTMENTS, AI_URGENCIES } from '../../lib/triageConstants';

const STATUS = {
  submitted:   { label: 'Submitted',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  pending:     { label: 'Pending',     bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  in_review:   { label: 'In Review',   bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  assigned:    { label: 'Assigned',    bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  in_progress: { label: 'In Progress', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  resolved:    { label: 'Resolved',    bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  closed:      { label: 'Closed',      bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',   dot: 'bg-gray-400' },
};

const URGENCY_COLORS = { critical: '#DC2626', high: '#EA580C', medium: '#F7B731', low: '#6BBE4E' };

function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.bg} ${s.text} border ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /> {s.label}
    </span>
  );
}

function timeAgo(d) {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const dy = Math.floor(h / 24);
  return dy + 'd ago';
}

export default function ComplaintsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useOutletContext();
  if (id) return <ComplaintDetail id={id} profile={profile} navigate={navigate} />;
  return <ComplaintsList navigate={navigate} />;
}

/* ═══════════════════════════════════════════════════════════════
   LIST VIEW
   ═══════════════════════════════════════════════════════════════ */
function ComplaintsList({ navigate }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.from('complaints').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        if (!cancelled && data) setComplaints(data);
      } catch (err) {
        console.error('Failed to fetch complaints:', err);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return complaints.filter(c => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return [c.name, c.email, c.provider, c.complaint_type, c.description, c.ai_summary, c.ai_category].some(f => f?.toLowerCase().includes(q));
      }
      return true;
    });
  }, [complaints, statusFilter, searchTerm]);

  const counts = useMemo(() => {
    const c = { all: complaints.length, submitted: 0, pending: 0, in_review: 0, assigned: 0, in_progress: 0, resolved: 0, closed: 0 };
    complaints.forEach(x => { if (c[x.status] !== undefined) c[x.status]++; });
    return c;
  }, [complaints]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-[#00458B]/20 border-t-[#00458B] rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <p className="text-sm text-gray-500 mt-1">{counts.all} total · {counts.pending + (counts.submitted || 0)} new · {counts.in_review + (counts.in_progress || 0)} in progress · {counts.resolved} resolved</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search complaints..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00458B]" />
        </div>
        <div className="flex gap-2">
          {[['', 'All'], ['pending', 'Pending'], ['in_review', 'In Review'], ['in_progress', 'In Progress'], ['resolved', 'Resolved'], ['closed', 'Closed']].map(([val, label]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${statusFilter === val ? 'bg-[#00458B] text-white border-[#00458B]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {label} {val ? `(${counts[val] || 0})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Complaint list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <AlertCircle size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No complaints found</p>
          </div>
        ) : filtered.map(c => (
          <button key={c.id} onClick={() => navigate(`/admin/complaints/${c.id}`)}
            className="w-full bg-white rounded-xl border border-gray-100 p-4 sm:p-5 hover:shadow-md hover:border-gray-200 transition-all text-left group">
            <div className="flex items-start gap-4">
              {/* Urgency dot */}
              <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                c.ai_urgency === 'critical' ? 'bg-red-500 animate-pulse' :
                c.ai_urgency === 'high' ? 'bg-orange-500' :
                c.status === 'resolved' ? 'bg-green-500' :
                c.status === 'pending' ? 'bg-red-400' : 'bg-yellow-400'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#00458B] transition-colors">
                      {c.ai_summary || c.name || 'Complaint'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {c.name} · {c.provider || 'Unknown provider'} · {timeAgo(c.created_at)}
                    </p>
                  </div>
                  <StatusPill status={c.status} />
                </div>
                {/* AI tags */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {c.ai_category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00A6CE]/10 text-[#00A6CE] font-medium">{c.ai_category}</span>
                  )}
                  {c.ai_urgency && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: (URGENCY_COLORS[c.ai_urgency] || '#94A3B8') + '15', color: URGENCY_COLORS[c.ai_urgency] || '#94A3B8' }}>{c.ai_urgency}</span>
                  )}
                  {c.ai_department && (
                    <span className="text-[10px] text-gray-400">{c.ai_department}</span>
                  )}
                  {c.ai_confidence != null && c.ai_confidence < 70 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold flex items-center gap-1">
                      <AlertTriangle size={9} /> Needs Review ({c.ai_confidence}%)
                    </span>
                  )}
                  {c.ai_confidence != null && c.ai_confidence >= 70 && (
                    <span className="text-[10px] text-gray-300">{c.ai_confidence}%</span>
                  )}
                  {c.complaint_type && !c.ai_category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{c.complaint_type}</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DETAIL VIEW
   ═══════════════════════════════════════════════════════════════ */
function ComplaintDetail({ id, profile, navigate }) {
  const [complaint, setComplaint] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: c, error: cErr } = await supabase.from('complaints').select('*').eq('id', id).single();
        if (cErr) throw cErr;
        if (!cancelled && c) setComplaint(c);
      } catch (err) {
        console.error('Failed to fetch complaint details:', err);
      }
      try {
        const { data: r, error: rErr } = await supabase.from('complaint_responses').select('*, profiles:admin_id(full_name)').eq('complaint_id', id).order('created_at', { ascending: true });
        if (rErr) throw rErr;
        if (!cancelled && r) setResponses(r);
      } catch (err) {
        console.error('Failed to fetch complaint responses:', err);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  async function handleStatusChange(newStatus) {
    setStatusUpdating(true);
    try {
      const { error } = await supabase.from('complaints').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) alert(`Failed to update status: ${error.message}`);
      else setComplaint(prev => ({ ...prev, status: newStatus }));
    } catch { alert('Unable to update status.'); }
    setStatusUpdating(false);
  }

  async function handleSendReply() {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('complaint_responses').insert({ complaint_id: id, admin_id: profile?.id, message: replyText.trim() });
      if (error) { alert(`Failed to save reply: ${error.message}`); setSaving(false); return; }

      const subject = `RE: BOCRA Complaint ${complaint.reference_number || complaint.id?.slice(0, 8) || ''}`;
      window.open(`mailto:${complaint.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(replyText.trim())}`);

      setReplyText('');
      try {
        const { data, error: rErr } = await supabase.from('complaint_responses').select('*, profiles:admin_id(full_name)').eq('complaint_id', id).order('created_at', { ascending: true });
        if (rErr) throw rErr;
        if (data) setResponses(data);
      } catch (err) {
        console.error('Failed to re-fetch responses after reply:', err);
      }

      if (complaint.status === 'pending' || complaint.status === 'submitted') handleStatusChange('in_review');
    } catch { alert('Unable to save reply.'); }
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-[#00458B]/20 border-t-[#00458B] rounded-full animate-spin" /></div>;
  if (!complaint) return (
    <div className="text-center py-12">
      <p className="text-gray-500">Complaint not found.</p>
      <button onClick={() => navigate('/admin/complaints')} className="text-[#00458B] text-sm mt-2 hover:underline">Back to complaints</button>
    </div>
  );

  const slaHours = Math.floor((Date.now() - new Date(complaint.created_at).getTime()) / 3600000);
  const slaOverdue = slaHours > 120 && complaint.status === 'pending';

  // Classification corrector is defined at the bottom of the file
  return (
    <div>
      <button onClick={() => navigate('/admin/complaints')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-5 transition-colors">
        <ArrowLeft size={16} /> Back to complaints
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{complaint.name}</h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Mail size={12} /> {complaint.email}</span>
                    {complaint.phone && <span className="flex items-center gap-1"><Phone size={12} /> {complaint.phone}</span>}
                  </div>
                </div>
                <StatusPill status={complaint.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-gray-100">
                <div><p className="text-[10px] text-gray-400 uppercase font-medium">Provider</p><p className="text-sm text-gray-700 mt-0.5 font-medium">{complaint.provider || '—'}</p></div>
                <div><p className="text-[10px] text-gray-400 uppercase font-medium">Type</p><p className="text-sm text-gray-700 mt-0.5">{complaint.complaint_type || '—'}</p></div>
                <div><p className="text-[10px] text-gray-400 uppercase font-medium">Company</p><p className="text-sm text-gray-700 mt-0.5">{complaint.company || '—'}</p></div>
                <div><p className="text-[10px] text-gray-400 uppercase font-medium">Reference</p><p className="text-sm text-gray-700 mt-0.5 font-mono">{complaint.reference_number || complaint.id?.slice(0, 8).toUpperCase()}</p></div>
                <div><p className="text-[10px] text-gray-400 uppercase font-medium">Submitted</p><p className="text-sm text-gray-700 mt-0.5">{new Date(complaint.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
                <div><p className="text-[10px] text-gray-400 uppercase font-medium">Previous Complaint</p><p className="text-sm text-gray-700 mt-0.5">{complaint.previous_complaint ? 'Yes' : 'No'}</p></div>
              </div>
            </div>

            {/* AI Analysis */}
            {complaint.ai_category && (
              <div className="px-6 py-4 bg-gradient-to-r from-[#001A3A] to-[#00458B]">
                <p className="text-[10px] font-bold text-[#00A6CE] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Shield size={10} /> AI Analysis
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {complaint.ai_urgency && (
                    <div>
                      <p className="text-[9px] text-white/40 uppercase">Urgency</p>
                      <span className={`inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded ${
                        complaint.ai_urgency === 'critical' ? 'bg-red-500/20 text-red-300' :
                        complaint.ai_urgency === 'high' ? 'bg-orange-500/20 text-orange-300' :
                        complaint.ai_urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>{complaint.ai_urgency}</span>
                    </div>
                  )}
                  {complaint.ai_category && <div><p className="text-[9px] text-white/40 uppercase">Category</p><p className="text-xs text-white/80 mt-0.5">{complaint.ai_category}</p></div>}
                  {complaint.ai_department && <div><p className="text-[9px] text-white/40 uppercase">Department</p><p className="text-xs text-white/80 mt-0.5">{complaint.ai_department}</p></div>}
                  {complaint.ai_sentiment && <div><p className="text-[9px] text-white/40 uppercase">Sentiment</p><p className="text-xs text-white/80 mt-0.5 capitalize">{complaint.ai_sentiment}</p></div>}
                  {complaint.ai_confidence != null && (
                    <div>
                      <p className="text-[9px] text-white/40 uppercase">Confidence</p>
                      <p className={`text-xs mt-0.5 font-bold ${complaint.ai_confidence < 70 ? 'text-red-300' : 'text-green-300'}`}>{complaint.ai_confidence}%</p>
                    </div>
                  )}
                </div>
                {complaint.ai_confidence != null && complaint.ai_confidence < 70 && (
                  <div className="mt-3 flex items-center gap-2 bg-red-500/20 text-red-200 text-xs px-3 py-2 rounded-lg">
                    <AlertTriangle size={12} />
                    <span>Low confidence — please review and correct classification below</span>
                  </div>
                )}
                {complaint.ai_summary && <p className="text-xs text-white/50 mt-2 italic">"{complaint.ai_summary}"</p>}
              </div>
            )}

            {/* Description */}
            <div className="p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Complaint Description</h3>
              <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                {complaint.description}
              </div>
            </div>
          </div>

          {/* Conversation thread */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Conversation ({responses.length} {responses.length === 1 ? 'reply' : 'replies'})
            </h3>

            {responses.length > 0 && (
              <div className="space-y-3 mb-5">
                {responses.map(r => (
                  <div key={r.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00458B] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(r.profiles?.full_name || 'A').charAt(0)}
                    </div>
                    <div className="flex-1 bg-[#00458B]/5 rounded-xl rounded-tl-none p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-[#00458B]">{r.profiles?.full_name || 'Admin'}</p>
                        <p className="text-[10px] text-gray-400">{timeAgo(r.created_at)}</p>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{r.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply box */}
            <div className="border-t border-gray-100 pt-4">
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3}
                placeholder="Type your reply to the complainant..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] focus:ring-2 focus:ring-[#00458B]/10 outline-none resize-none" />
              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px] text-gray-400">Reply will be saved and email client will open</p>
                <button onClick={handleSendReply} disabled={!replyText.trim() || saving}
                  className="px-5 py-2.5 bg-[#00458B] text-white font-medium text-sm rounded-xl hover:bg-[#003366] disabled:opacity-30 flex items-center gap-2 transition-all">
                  <Send size={14} /> {saving ? 'Sending…' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* SLA */}
          <div className={`rounded-xl border p-5 ${slaOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Response Time</h3>
            <div className="flex items-center gap-2">
              <Clock size={18} className={slaOverdue ? 'text-red-500' : 'text-gray-400'} />
              <div>
                <p className={`text-lg font-bold ${slaOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {slaHours < 24 ? slaHours + 'h' : Math.floor(slaHours / 24) + 'd ' + (slaHours % 24) + 'h'}
                </p>
                <p className={`text-[10px] ${slaOverdue ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                  {slaOverdue ? 'OVERDUE — SLA is 5 days' : 'Since submitted'}
                </p>
              </div>
            </div>
          </div>

          {/* Status changer */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Update Status</h3>
            <div className="space-y-2">
              {Object.entries(STATUS).map(([value, cfg]) => (
                <button key={value} onClick={() => handleStatusChange(value)}
                  disabled={statusUpdating || complaint.status === value}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    complaint.status === value
                      ? `${cfg.bg} ${cfg.text} ring-2 ring-offset-1 ${cfg.border}`
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  } disabled:opacity-40`}>
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                  {complaint.status === value && <CheckCircle size={14} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Correct AI Classification */}
          {complaint.ai_category && (
            <ClassificationCorrector complaint={complaint} onUpdate={setComplaint} />
          )}

          {/* Quick email */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
            <a href={`mailto:${complaint.email}?subject=${encodeURIComponent('BOCRA Complaint - ' + (complaint.reference_number || complaint.id?.slice(0, 8) || ''))}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00A6CE]/10 text-[#00A6CE] rounded-xl text-sm font-medium hover:bg-[#00A6CE]/20 transition-all w-full justify-center">
              <Mail size={14} /> Email Complainant
            </a>
            {complaint.provider && complaint.provider !== 'Other' && (
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all w-full justify-center mt-2">
                <Building size={14} /> Contact {complaint.provider?.replace('Botswana Telecommunications Corporation (BTC)', 'BTC').replace('Botswana Fibre Networks (BoFiNet)', 'BoFiNet')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CLASSIFICATION CORRECTOR — Staff can override AI classification
   ═══════════════════════════════════════════════════════════════ */
function ClassificationCorrector({ complaint, onUpdate }) {
  const [category, setCategory] = useState(complaint.ai_category || '');
  const [department, setDepartment] = useState(complaint.ai_department || '');
  const [urgency, setUrgency] = useState(complaint.ai_urgency || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const hasChanges = category !== complaint.ai_category || department !== complaint.ai_department || urgency !== complaint.ai_urgency;

  async function handleSave() {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('complaints').update({
        ai_category: category,
        ai_department: department,
        ai_urgency: urgency,
        ai_confidence: 100,
        updated_at: new Date().toISOString(),
      }).eq('id', complaint.id);
      if (error) { alert(`Failed to update: ${error.message}`); }
      else {
        onUpdate(prev => ({ ...prev, ai_category: category, ai_department: department, ai_urgency: urgency, ai_confidence: 100 }));
        setSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
      }
    } catch { alert('Unable to update classification.'); }
    setSaving(false);
  }

  return (
    <div className={`rounded-xl border p-5 ${complaint.ai_confidence != null && complaint.ai_confidence < 70 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Shield size={12} /> Correct Classification
      </h3>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-gray-400 uppercase font-medium">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00458B]">
            {AI_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-400 uppercase font-medium">Department</label>
          <select value={department} onChange={e => setDepartment(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00458B]">
            {AI_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-400 uppercase font-medium">Urgency</label>
          <select value={urgency} onChange={e => setUrgency(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00458B]">
            {AI_URGENCIES.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
          </select>
        </div>
        <button onClick={handleSave} disabled={!hasChanges || saving}
          className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            saved ? 'bg-green-500 text-white' :
            hasChanges ? 'bg-[#00458B] text-white hover:bg-[#003366]' :
            'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}>
          {saved ? <><CheckCircle size={14} /> Saved</> : saving ? 'Saving…' : 'Save Correction'}
        </button>
      </div>
    </div>
  );
}
