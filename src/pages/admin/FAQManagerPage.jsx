/**
 * Admin — FAQ Management
 *
 * CRUD for faq_entries table + "Top Queries" dashboard that surfaces
 * the questions people are actually asking (chatbot, search, complaints).
 * Phase 8 of the BOCRA implementation roadmap.
 */
import { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle, Plus, Edit3, Trash2, Search, Eye, EyeOff,
  MessageSquare, BarChart3, AlertCircle, X, Save, ChevronDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../lib/notifications';
import { useOutletContext } from 'react-router-dom';

const SOURCE_LABELS = { manual: 'Manual', chatbot: 'Chatbot', complaint: 'Complaint', search: 'Search' };
const SOURCE_COLORS = { manual: 'bg-gray-100 text-gray-600', chatbot: 'bg-blue-100 text-blue-700', complaint: 'bg-pink-100 text-pink-700', search: 'bg-green-100 text-green-700' };
const DEFAULT_CATEGORIES = ['General', 'Complaints', 'Licensing', 'Domains & Internet', 'Cybersecurity', 'QoS & Network'];

export default function FAQManagerPage() {
  const { profile } = useOutletContext();
  const { addToast } = useNotifications();

  // FAQ CRUD state
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, 'new' = creating, uuid = editing
  const [form, setForm] = useState({ question: '', answer: '', question_tn: '', answer_tn: '', category: '', source: 'manual', published: false });
  const [saving, setSaving] = useState(false);

  // Top Queries state
  const [tab, setTab] = useState('manage'); // 'manage' | 'queries'
  const [topChat, setTopChat] = useState([]);
  const [topSearch, setTopSearch] = useState([]);
  const [topComplaints, setTopComplaints] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => { fetchFaqs(); }, []);

  async function fetchFaqs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('faq_entries')
      .select('*')
      .order('category')
      .order('sort_order');
    if (error) {
      console.error('FAQ fetch error:', error);
      addToast('Failed to load FAQs', 'error');
    } else {
      setFaqs(data || []);
    }
    setLoading(false);
  }

  async function fetchTopQueries() {
    setQueriesLoading(true);
    try {
      // Top chatbot questions (last 30 days)
      const { data: chatData } = await supabase.rpc('', {}).catch(() => ({ data: null }));
      // Use raw query approach since we need GROUP BY
      const { data: chatRows } = await supabase
        .from('chat_queries')
        .select('query_text')
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
        .order('created_at', { ascending: false })
        .limit(500);
      if (chatRows) {
        const counts = {};
        chatRows.forEach(r => { const q = r.query_text.toLowerCase().trim(); counts[q] = (counts[q] || 0) + 1; });
        setTopChat(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([text, count]) => ({ text, count })));
      }

      // Top search queries from search_events (Phase 5)
      try {
        const { data: searchRows } = await supabase
          .from('search_events')
          .select('query_text')
          .eq('event_type', 'search_executed')
          .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
          .order('created_at', { ascending: false })
          .limit(500);
        if (searchRows) {
          const counts = {};
          searchRows.forEach(r => { const q = r.query_text.toLowerCase().trim(); counts[q] = (counts[q] || 0) + 1; });
          setTopSearch(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([text, count]) => ({ text, count })));
        }
      } catch { setTopSearch([]); }

      // Top complaint categories (last 90 days)
      try {
        const { data: complaintRows } = await supabase
          .from('complaints')
          .select('complaint_type')
          .gte('created_at', new Date(Date.now() - 90 * 86400000).toISOString())
          .not('complaint_type', 'is', null)
          .limit(1000);
        if (complaintRows) {
          const counts = {};
          complaintRows.forEach(r => { if (r.complaint_type) counts[r.complaint_type] = (counts[r.complaint_type] || 0) + 1; });
          setTopComplaints(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([text, count]) => ({ text, count })));
        }
      } catch { setTopComplaints([]); }
    } catch (err) {
      console.error('Top queries fetch error:', err);
    }
    setQueriesLoading(false);
  }

  useEffect(() => { if (tab === 'queries') fetchTopQueries(); }, [tab]);

  // Filtering
  const categories = [...new Set(faqs.map(f => f.category).filter(Boolean))].sort();
  const categoryOptions = useMemo(
    () => [...new Set([...DEFAULT_CATEGORIES, ...categories])].sort(),
    [categories]
  );
  const filtered = useMemo(() => {
    return faqs.filter(f => {
      if (filterCategory && f.category !== filterCategory) return false;
      if (filterStatus === 'published' && !f.published) return false;
      if (filterStatus === 'draft' && f.published) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [faqs, filterCategory, filterStatus, searchTerm]);

  // Form
  function openCreate(prefill = {}) {
    setForm({ question: '', answer: '', question_tn: '', answer_tn: '', category: '', source: 'manual', published: false, ...prefill });
    setCustomCategory('');
    setEditing('new');
  }

  function openEdit(faq) {
    setForm({ question: faq.question, answer: faq.answer, question_tn: faq.question_tn || '', answer_tn: faq.answer_tn || '', category: faq.category, source: faq.source, published: faq.published });
    setCustomCategory('');
    setEditing(faq.id);
  }

  async function handleSave() {
    const resolvedCategory = form.category === '__custom__' ? customCategory.trim() : form.category.trim();
    if (!form.question.trim() || !form.answer.trim() || !resolvedCategory) {
      addToast('Question, answer, and category are required', 'warning');
      return;
    }
    setSaving(true);
    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      question_tn: form.question_tn.trim() || null,
      answer_tn: form.answer_tn.trim() || null,
      category: resolvedCategory,
      source: form.source,
      published: form.published,
      updated_by: profile?.id || null,
    };

    let error;
    if (editing === 'new') {
      payload.created_by = profile?.id || null;
      ({ error } = await supabase.from('faq_entries').insert(payload));
    } else {
      ({ error } = await supabase.from('faq_entries').update(payload).eq('id', editing));
    }

    if (error) {
      addToast('Failed to save FAQ: ' + error.message, 'error');
    } else {
      addToast(editing === 'new' ? 'FAQ created successfully' : 'FAQ updated successfully', 'success');
      setEditing(null);
      fetchFaqs();
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    const { error } = await supabase.from('faq_entries').delete().eq('id', id);
    if (error) {
      addToast('Failed to delete FAQ: ' + error.message, 'error');
    } else {
      addToast('FAQ deleted', 'success');
      fetchFaqs();
    }
  }

  async function togglePublish(faq) {
    const { error } = await supabase.from('faq_entries').update({ published: !faq.published }).eq('id', faq.id);
    if (!error) {
      setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, published: !f.published } : f));
    }
  }

  function createFromQuery(text, source) {
    setTab('manage');
    openCreate({ question: text, source, source_query: text });
  }

  // Stats
  const stats = useMemo(() => ({
    total: faqs.length,
    published: faqs.filter(f => f.published).length,
    draft: faqs.filter(f => !f.published).length,
    categories: categories.length,
  }), [faqs, categories]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle size={24} className="text-[#00458B]" />
            FAQ Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage frequently asked questions and discover what citizens are asking</p>
        </div>
        <button onClick={() => openCreate()} className="flex items-center gap-2 px-4 py-2.5 bg-[#00458B] text-white text-sm font-medium rounded-lg hover:bg-[#003366] transition-colors">
          <Plus size={16} /> New FAQ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total FAQs', value: stats.total, color: '#00458B' },
          { label: 'Published', value: stats.published, color: '#6BBE4E' },
          { label: 'Drafts', value: stats.draft, color: '#F7B731' },
          { label: 'Categories', value: stats.categories, color: '#00A6CE' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('manage')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'manage' ? 'bg-white text-[#00458B] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          FAQ Entries
        </button>
        <button onClick={() => setTab('queries')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'queries' ? 'bg-white text-[#00458B] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Top Queries
        </button>
      </div>

      {/* ─── TAB: Manage FAQs ─── */}
      {tab === 'manage' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search FAQs..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A6CE]" />
            </div>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#00A6CE]">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#00A6CE]">
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          {/* Edit/Create Form */}
          {editing !== null && (
            <div className="bg-white rounded-xl border border-[#00A6CE]/30 p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">{editing === 'new' ? 'Create New FAQ' : 'Edit FAQ'}</h3>
                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Question (English) *</label>
                  <textarea value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00A6CE]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Question (Setswana)</label>
                  <textarea value={form.question_tn} onChange={e => setForm(p => ({ ...p, question_tn: e.target.value }))} rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00A6CE]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Answer (English) *</label>
                  <textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} rows={4} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00A6CE]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Answer (Setswana)</label>
                  <textarea value={form.answer_tn} onChange={e => setForm(p => ({ ...p, answer_tn: e.target.value }))} rows={4} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00A6CE]" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={e => {
                      const next = e.target.value;
                      setForm(p => ({ ...p, category: next }));
                      if (next !== '__custom__') setCustomCategory('');
                    }}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#00A6CE]"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__custom__">Other (new category)...</option>
                  </select>
                  {form.category === '__custom__' && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      className="mt-2 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00A6CE]"
                      placeholder="Enter new category"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Source</label>
                  <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#00A6CE]">
                    <option value="manual">Manual</option>
                    <option value="chatbot">Chatbot</option>
                    <option value="complaint">Complaint</option>
                    <option value="search">Search</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-[#00458B] focus:ring-[#00A6CE]" />
                    <span className="text-sm text-gray-700">Published</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#00458B] text-white text-sm font-medium rounded-lg hover:bg-[#003366] disabled:opacity-50 transition-colors">
                  <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}

          {/* FAQ List */}
          {loading ? (
            <div className="text-center py-12"><div className="w-8 h-8 border-4 border-[#00458B]/20 border-t-[#00458B] rounded-full animate-spin mx-auto" /><p className="text-sm text-gray-400 mt-3">Loading FAQs...</p></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <HelpCircle size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm text-gray-400">No FAQs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(faq => (
                <div key={faq.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900">{faq.question}</h3>
                        {!faq.published && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">DRAFT</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{faq.answer}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#00458B]/10 text-[#00458B]">{faq.category}</span>
                        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${SOURCE_COLORS[faq.source] || SOURCE_COLORS.manual}`}>{SOURCE_LABELS[faq.source] || faq.source}</span>
                        {faq.frequency_score > 0 && <span className="text-[9px] text-gray-400">Score: {faq.frequency_score}</span>}
                        {faq.view_count > 0 && <span className="text-[9px] text-gray-400">Views: {faq.view_count}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => togglePublish(faq)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title={faq.published ? 'Unpublish' : 'Publish'}>
                        {faq.published ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-gray-400" />}
                      </button>
                      <button onClick={() => openEdit(faq)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Edit">
                        <Edit3 size={14} className="text-gray-400" />
                      </button>
                      <button onClick={() => handleDelete(faq.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── TAB: Top Queries ─── */}
      {tab === 'queries' && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">Discover what citizens are asking. Click \u201cCreate FAQ\u201d to convert a common query into an FAQ entry.</p>

          {queriesLoading ? (
            <div className="text-center py-12"><div className="w-8 h-8 border-4 border-[#00458B]/20 border-t-[#00458B] rounded-full animate-spin mx-auto" /><p className="text-sm text-gray-400 mt-3">Loading query data...</p></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Panel 1: Top Chatbot Questions */}
              <QueryPanel
                title="Top Chatbot Questions"
                subtitle="Last 30 days"
                icon={<MessageSquare size={16} className="text-blue-500" />}
                items={topChat}
                source="chatbot"
                onCreateFaq={createFromQuery}
              />

              {/* Panel 2: Top Search Queries */}
              <QueryPanel
                title="Top Search Queries"
                subtitle="Last 30 days"
                icon={<Search size={16} className="text-green-500" />}
                items={topSearch}
                source="search"
                onCreateFaq={createFromQuery}
              />

              {/* Panel 3: Top Complaint Categories */}
              <QueryPanel
                title="Top Complaint Categories"
                subtitle="Last 90 days"
                icon={<AlertCircle size={16} className="text-pink-500" />}
                items={topComplaints}
                source="complaint"
                onCreateFaq={(text) => createFromQuery(`Common questions about ${text} complaints`, 'complaint')}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QueryPanel({ title, subtitle, icon, items, source, onCreateFaq }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
        {icon}
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <p className="text-[10px] text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-gray-400">No data available yet</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 group">
              <span className="text-[10px] font-bold text-gray-300 w-5 text-right">{i + 1}</span>
              <span className="text-xs text-gray-700 flex-1 truncate">{item.text}</span>
              <span className="text-[10px] font-bold text-[#00A6CE] bg-[#00A6CE]/10 rounded-full px-2 py-0.5">{item.count}</span>
              <button
                onClick={() => onCreateFaq(item.text, source)}
                className="text-[9px] font-medium text-[#00458B] opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-[#00458B]/10 whitespace-nowrap"
              >
                Create FAQ
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
