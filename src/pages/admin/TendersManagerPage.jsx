/**
 * Admin — Tenders & Procurement Manager
 * Staff create, edit, and delete tender notices.
 * All tenders appear on the public Tenders page.
 *
 * Pattern follows NewsManagerPage.jsx / JobsManagerPage.jsx exactly.
 */
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ScrollText, Plus, Trash2, CheckCircle, Search, Edit3, X,
  AlertCircle, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CATEGORIES = ['General', 'Infrastructure', 'Consultancy', 'Technical Standards', 'Universal Access'];
const METHODS = [
  'Open Domestic Bidding',
  'Open International Bidding',
  'Restricted/Selective Domestic Bidding',
  'Restricted/Selective International Bidding',
  'Direct Procurement',
];
const STATUSES = ['open', 'closed', 'awarded', 'adjudicated'];
const STATUS_COLORS = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
  awarded: 'bg-blue-100 text-blue-700',
  adjudicated: 'bg-[#F7B731]/10 text-[#F7B731]',
};

const EMPTY_FORM = {
  ref: '', title: '', method: 'Open Domestic Bidding', status: 'open',
  category: 'General', closing_date: '', publish_date: '',
  decision_date: '', awarded_to: '', amount: '', decision: '', file: '',
};

export default function TendersManagerPage() {
  const { profile } = useOutletContext();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  /* --- Fetch --- */
  useEffect(() => {
    let cancelled = false;
    async function doFetch() {
      try {
        const { data, error } = await supabase
          .from('tenders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);
        if (!cancelled) {
          if (data) setTenders(data);
          if (error) console.error('Fetch error:', error);
          setLoading(false);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (!cancelled) setLoading(false);
      }
    }
    doFetch();
    return () => { cancelled = true; };
  }, []);

  async function fetchTenders() {
    try {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) setTenders(data);
      if (error) console.error('Fetch error:', error);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }

  /* --- Filtered list + stats --- */
  const filtered = useMemo(() => {
    return tenders.filter(t => {
      if (filterCategory && t.category !== filterCategory) return false;
      if (filterStatus && t.status !== filterStatus) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          t.title?.toLowerCase().includes(q) ||
          t.ref?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tenders, filterCategory, filterStatus, searchTerm]);

  const stats = useMemo(() => ({
    total: tenders.length,
    open: tenders.filter(t => t.status === 'open').length,
    adjudicated: tenders.filter(t => t.status === 'adjudicated' || t.status === 'awarded').length,
    closed: tenders.filter(t => t.status === 'closed').length,
  }), [tenders]);

  /* --- Form helpers --- */
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function startEdit(tender) {
    setForm({
      ref: tender.ref || '',
      title: tender.title || '',
      method: tender.method || 'Open Domestic Bidding',
      status: tender.status || 'open',
      category: tender.category || 'General',
      closing_date: tender.closing_date || '',
      publish_date: tender.publish_date || '',
      decision_date: tender.decision_date || '',
      awarded_to: tender.awarded_to || '',
      amount: tender.amount || '',
      decision: tender.decision || '',
      file: tender.file || '',
    });
    setEditingId(tender.id);
    setShowForm(true);
    setError('');
  }

  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
    setError('');
  }

  /* --- Submit --- */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.ref.trim()) { setError('Reference number is required'); return; }
    if (!form.title.trim()) { setError('Title is required'); return; }

    setSaving(true);

    const payload = {
      ref: form.ref.trim(),
      title: form.title.trim(),
      method: form.method,
      status: form.status,
      category: form.category,
      closing_date: form.closing_date.trim() || null,
      publish_date: form.publish_date.trim() || null,
      decision_date: form.decision_date.trim() || null,
      awarded_to: form.awarded_to.trim() || null,
      amount: form.amount.trim() || null,
      decision: form.decision.trim() || null,
      file: form.file.trim() || null,
      posted_by: profile?.id || null,
    };

    try {
      if (editingId) {
        const { error: updateErr } = await supabase
          .from('tenders').update(payload).eq('id', editingId);
        if (updateErr) { setError(updateErr.message); setSaving(false); return; }
        setSuccess('Tender updated successfully');
      } else {
        const { error: insertErr } = await supabase
          .from('tenders').insert(payload);
        if (insertErr) { setError(insertErr.message); setSaving(false); return; }
        setSuccess('Tender created successfully');
      }

      setSaving(false);
      resetForm();
      fetchTenders();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'An unexpected error occurred');
      setSaving(false);
    }
  }

  /* --- Delete --- */
  async function handleDelete(id) {
    if (!confirm('Delete this tender? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('tenders').delete().eq('id', id);
      if (error) { setError('Error: ' + error.message); return; }
      fetchTenders();
      setSuccess('Tender deleted');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Error: ' + (err.message || 'An unexpected error occurred'));
    }
  }

  /* --- Quick status toggle --- */
  async function quickStatusChange(id, newStatus) {
    try {
      const { error } = await supabase
        .from('tenders').update({ status: newStatus }).eq('id', id);
      if (error) { setError('Error: ' + error.message); return; }
      fetchTenders();
    } catch (err) {
      console.error('Status change error:', err);
      setError('Error: ' + (err.message || 'An unexpected error occurred'));
    }
  }

  /* --- Loading --- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#00A6CE]/20 border-t-[#00A6CE] rounded-full animate-spin" />
      </div>
    );
  }

  /* --- Render --- */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ScrollText size={22} className="text-[#F7B731]" /> Tenders &amp; Procurement
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage tender notices &mdash; all tenders appear on the public Tenders page
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] transition-all"
        >
          <Plus size={14} /> {showForm && !editingId ? 'Cancel' : 'New Tender'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400">Total Tenders</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#6BBE4E]">{stats.open}</p>
          <p className="text-xs text-gray-400">Open</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#F7B731]">{stats.adjudicated}</p>
          <p className="text-xs text-gray-400">Awarded / Adjudicated</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-500">{stats.closed}</p>
          <p className="text-xs text-gray-400">Closed</p>
        </div>
      </div>

      {/* Success / Error messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <CheckCircle size={14} /> {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
        </div>
      )}

      {/* --- Create / Edit Form --- */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">
              {editingId ? 'Edit Tender' : 'Create New Tender'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ref + Title */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reference No. *</label>
                <input
                  type="text" value={form.ref} onChange={e => u('ref', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] focus:ring-1 focus:ring-[#00458B]/20 outline-none"
                  placeholder="e.g. BOCRA/ST/002/2025.26"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input
                  type="text" value={form.title} onChange={e => u('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] focus:ring-1 focus:ring-[#00458B]/20 outline-none"
                  placeholder="Tender title"
                />
              </div>
            </div>

            {/* Method + Category + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Method</label>
                <select value={form.method} onChange={e => u('method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none">
                  {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select value={form.category} onChange={e => u('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={e => u('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none">
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Publish Date</label>
                <input
                  type="text" value={form.publish_date} onChange={e => u('publish_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="e.g. 13 Mar 2026"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Closing Date</label>
                <input
                  type="text" value={form.closing_date} onChange={e => u('closing_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="e.g. 27 Mar 2026"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Decision Date</label>
                <input
                  type="text" value={form.decision_date} onChange={e => u('decision_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="e.g. 12 Mar 2026"
                />
              </div>
            </div>

            {/* Adjudication fields */}
            {(form.status === 'awarded' || form.status === 'adjudicated') && (
              <div className="bg-[#F7B731]/5 rounded-lg p-4 border border-[#F7B731]/10 space-y-4">
                <p className="text-xs font-bold text-gray-700">Adjudication Details</p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Awarded To</label>
                  <input
                    type="text" value={form.awarded_to} onChange={e => u('awarded_to', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                    placeholder="Company name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                    <input
                      type="text" value={form.amount} onChange={e => u('amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                      placeholder="e.g. P5,281,069.29 (VAT Inclusive)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Decision</label>
                    <input
                      type="text" value={form.decision} onChange={e => u('decision', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                      placeholder="e.g. Approved"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* File */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">PDF Filename (optional)</label>
              <input
                type="text" value={form.file} onChange={e => u('file', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                placeholder="e.g. Notice_of_Adjudication_Decision_Solar_PV_2025.pdf"
              />
              <p className="text-[11px] text-gray-400 mt-1">File must be uploaded to /public/documents/tenders/ separately</p>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] disabled:opacity-50 transition-all"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CheckCircle size={14} /> {editingId ? 'Update Tender' : 'Create Tender'}</>}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Filters --- */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by title or reference..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
          />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* --- Table --- */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ScrollText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{tenders.length === 0 ? 'No tenders yet \u2014 create your first one' : 'No tenders match your filters'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Reference</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Closing</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tender => (
                  <tr key={tender.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-[#00A6CE]">{tender.ref}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[300px]">{tender.title}</p>
                      <p className="text-[11px] text-gray-400">{tender.method}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{tender.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={tender.status}
                        onChange={e => quickStatusChange(tender.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[tender.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                      {tender.closing_date || '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(tender)} title="Edit"
                          className="p-1.5 text-gray-400 hover:text-[#00458B] rounded-lg hover:bg-gray-100">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(tender.id)} title="Delete"
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
