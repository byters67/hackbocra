/**
 * Admin — Consultation Submissions (Content Moderation)
 * Review, moderate, and manage public consultation responses.
 * Admins can delete offensive/inappropriate submissions.
 */
import { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare, Search, Trash2, CheckCircle, Eye, EyeOff,
  AlertCircle, Shield, Filter, ExternalLink, Calendar
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const STATUS_COLORS = {
  received: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  acknowledged: 'bg-green-100 text-green-700',
};

export default function AdminConsultationsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterConsultation, setFilterConsultation] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('');
  const [selected, setSelected] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchSubmissions(); }, []);

  async function fetchSubmissions() {
    const { data, error } = await supabase
      .from('consultation_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSubmissions(data);
    if (error) console.error('Fetch error:', error);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      if (filterStatus && s.status !== filterStatus) return false;
      if (filterConsultation && s.consultation_id !== filterConsultation) return false;
      if (filterVisibility === 'public' && !s.is_public) return false;
      if (filterVisibility === 'private' && s.is_public) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          s.full_name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.organisation?.toLowerCase().includes(q) ||
          s.response_text?.toLowerCase().includes(q) ||
          s.consultation_title?.toLowerCase().includes(q) ||
          s.submission_ref?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [submissions, filterStatus, filterConsultation, filterVisibility, searchTerm]);

  const consultationIds = [...new Set(submissions.map(s => s.consultation_id))];

  const stats = useMemo(() => ({
    total: submissions.length,
    received: submissions.filter(s => s.status === 'received').length,
    public: submissions.filter(s => s.is_public).length,
    consultations: consultationIds.length,
  }), [submissions]);

  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from('consultation_submissions')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }));
    setSuccess(`Submission marked as ${newStatus}`);
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this submission? This will remove it from the public page if it was visible. This cannot be undone.')) return;
    const { error } = await supabase
      .from('consultation_submissions')
      .delete()
      .eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    setSubmissions(prev => prev.filter(s => s.id !== id));
    if (selected?.id === id) setSelected(null);
    setSuccess('Submission deleted');
    setTimeout(() => setSuccess(''), 3000);
  }

  async function togglePublic(id, currentlyPublic) {
    const { error } = await supabase
      .from('consultation_submissions')
      .update({ is_public: !currentlyPublic })
      .eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, is_public: !currentlyPublic } : s));
    if (selected?.id === id) setSelected(prev => ({ ...prev, is_public: !currentlyPublic }));
    setSuccess(!currentlyPublic ? 'Submission made public' : 'Submission hidden from public');
    setTimeout(() => setSuccess(''), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#00A6CE]/20 border-t-[#00A6CE] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={22} className="text-[#00A6CE]" /> Consultation Submissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and moderate public consultation responses — remove offensive content
          </p>
        </div>
        <a href="/hackbocra/consultations" target="_blank"
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50">
          <ExternalLink size={14} /> View Public Page
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400">Total Submissions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#F7B731]">{stats.received}</p>
          <p className="text-xs text-gray-400">Pending Review</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#00A6CE]">{stats.public}</p>
          <p className="text-xs text-gray-400">Publicly Visible</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#6BBE4E]">{stats.consultations}</p>
          <p className="text-xs text-gray-400">Consultations</p>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <CheckCircle size={14} /> {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, email, organisation, response, or reference..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00458B]/20 focus:border-[#00458B]" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white">
            <option value="">All Statuses</option>
            <option value="received">Received</option>
            <option value="reviewed">Reviewed</option>
            <option value="acknowledged">Acknowledged</option>
          </select>
          <select value={filterVisibility} onChange={e => setFilterVisibility(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white">
            <option value="">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          {consultationIds.length > 1 && (
            <select value={filterConsultation} onChange={e => setFilterConsultation(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white max-w-[200px]">
              <option value="">All Consultations</option>
              {consultationIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main content — list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-500">{filtered.length} submission{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-400 text-sm">No submissions found.</div>
            ) : filtered.map(s => (
              <button key={s.id} onClick={() => setSelected(s)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selected?.id === s.id ? 'bg-blue-50 border-l-2 border-[#00458B]' : ''} ${s.status === 'received' ? 'bg-yellow-50/30' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#00458B]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-[#00458B]">{(s.full_name || '?').charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-900 truncate">{s.full_name}</span>
                      {s.is_public && <Eye size={10} className="text-[#00A6CE] flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{s.consultation_id}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-600'}`}>
                    {s.status}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{s.response_text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selected.full_name}</h2>
                  <p className="text-sm text-gray-500">
                    {selected.email}
                    {selected.organisation ? ` · ${selected.organisation}` : ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{selected.respondent_type}</p>
                </div>
                <div className="flex items-center gap-1">
                  {/* Toggle public visibility */}
                  <button onClick={() => togglePublic(selected.id, selected.is_public)}
                    className={`p-2 rounded-lg text-xs transition-colors ${selected.is_public ? 'bg-[#00A6CE]/10 text-[#00A6CE]' : 'bg-gray-100 text-gray-400'}`}
                    title={selected.is_public ? 'Currently public — click to hide' : 'Currently hidden — click to make public'}>
                    {selected.is_public ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  {/* Delete */}
                  <button onClick={() => handleDelete(selected.id)}
                    className="p-2 rounded-lg text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete submission (content moderation)">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[selected.status]}`}>
                  {selected.status}
                </span>
                {selected.is_public && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#00A6CE]/10 text-[#00A6CE]">
                    Publicly Visible
                  </span>
                )}
                {selected.submission_ref && (
                  <span className="text-[10px] font-mono text-gray-400 px-2.5 py-1 rounded-full bg-gray-100">
                    {selected.submission_ref}
                  </span>
                )}
              </div>

              {/* Consultation */}
              <div className="bg-bocra-off-white rounded-lg p-3 mb-4">
                <p className="text-[10px] text-gray-400 uppercase font-medium mb-0.5">Consultation</p>
                <p className="text-xs font-medium text-bocra-slate">{selected.consultation_title || selected.consultation_id}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{selected.consultation_id}</p>
              </div>

              {/* Topic tags */}
              {selected.topic_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selected.topic_tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] rounded-lg bg-[#00458B]/5 text-[#00458B] font-medium">{tag}</span>
                  ))}
                </div>
              )}

              {/* Response text */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">Response</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.response_text}</p>
              </div>

              {/* Preferences */}
              <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-400">
                <span>Submitted: {new Date(selected.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                {selected.notify_on_determination && <span className="text-[#00A6CE]">Wants notification on final determination</span>}
              </div>

              {/* Status actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mr-2 self-center">Set status:</p>
                {['received', 'reviewed', 'acknowledged'].map(status => (
                  <button key={status} onClick={() => updateStatus(selected.id, status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selected.status === status ? 'bg-[#00458B] text-white border-[#00458B]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a submission to review</p>
              <p className="text-xs text-gray-300 mt-1">You can moderate content, change visibility, and update status</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
