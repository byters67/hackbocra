/**
 * Admin — News & Articles Manager
 * Staff create, edit, and delete news posts.
 * Published posts appear on the public News page.
 *
 * Pattern follows AdminTypeApprovalPage.jsx exactly.
 */
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Newspaper, Plus, Trash2, CheckCircle, Search, Edit3, X,
  Eye, AlertCircle, ChevronDown, Loader2, Bell,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import RichTextEditor from '../../components/admin/RichTextEditor';

const CATEGORIES = ['Public Notices', 'Tenders & Procurement', 'Media Releases', 'Regulatory Documents'];
const STATUSES = ['draft', 'published'];
const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
};

const EMPTY_FORM = {
  title: '', slug: '', excerpt: '', body: '', category: 'Public Notices',
  status: 'draft', published_at: '', featured_image_url: '',
};

const generateSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

export default function NewsManagerPage() {
  const { profile } = useOutletContext();
  const [posts, setPosts] = useState([]);
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
  const [notifySubscribers, setNotifySubscribers] = useState(false);

  /* ─── Fetch ─── */
  useEffect(() => {
    let cancelled = false;
    async function doFetch() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);
        if (!cancelled) {
          if (data) setPosts(data);
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

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) setPosts(data);
      if (error) console.error('Fetch error:', error);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }

  /* ─── Filtered list + stats ─── */
  const filtered = useMemo(() => {
    return posts.filter(p => {
      if (filterCategory && p.category !== filterCategory) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          p.title?.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [posts, filterCategory, filterStatus, searchTerm]);

  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    categories: [...new Set(posts.map(p => p.category))].length,
  }), [posts]);

  /* ─── Form helpers ─── */
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function handleTitleChange(title) {
    u('title', title);
    if (!editingId) u('slug', generateSlug(title));
  }

  function startEdit(post) {
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      body: post.body || '',
      category: post.category || 'Public Notices',
      status: post.status || 'draft',
      published_at: post.published_at ? post.published_at.split('T')[0] : '',
      featured_image_url: post.featured_image_url || '',
    });
    setEditingId(post.id);
    setShowForm(true);
    setError('');
  }

  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
    setError('');
  }

  /* ─── Submit ─── */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.slug.trim()) { setError('Slug is required'); return; }
    if (!form.excerpt.trim()) { setError('Summary is required'); return; }

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim(),
      body: form.body || null,
      category: form.category,
      status: form.status,
      featured_image_url: form.featured_image_url.trim() || null,
      published_at: form.status === 'published'
        ? (form.published_at || new Date().toISOString())
        : form.published_at || null,
      author_id: profile?.id || null,
    };

    try {
      if (editingId) {
        const { error: updateErr } = await supabase
          .from('posts').update(payload).eq('id', editingId);
        if (updateErr) { setError(updateErr.message); setSaving(false); return; }
        setSuccess('Article updated successfully');
      } else {
        const { error: insertErr } = await supabase
          .from('posts').insert(payload);
        if (insertErr) {
          if (insertErr.message?.includes('duplicate key') || insertErr.message?.includes('unique')) {
            setError('An article with this slug already exists. Please change the title or slug.');
          } else {
            setError(insertErr.message);
          }
          setSaving(false);
          return;
        }
        setSuccess('Article created \u2014 ' + (form.status === 'published' ? 'now visible on the public news page' : 'saved as draft'));
      }

      // Send subscriber notification if toggled on and status is published
      if (notifySubscribers && form.status === 'published') {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const nRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ action: 'notify', notification_type: 'news', content_title: form.title.trim(), area: 'telecoms', content_url: '/media/news-events' }),
          });
          const nData = await nRes.json();
          if (nData.success) setSuccess(prev => prev + ` \u2014 Notification sent to ${nData.recipients_count} subscriber${nData.recipients_count !== 1 ? 's' : ''}`);
        } catch { /* notification failure is non-critical */ }
      }

      setSaving(false);
      setNotifySubscribers(false);
      resetForm();
      fetchPosts();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'An unexpected error occurred');
      setSaving(false);
    }
  }

  /* ─── Delete ─── */
  async function handleDelete(id) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) { setError('Error: ' + error.message); return; }
      fetchPosts();
      setSuccess('Article deleted');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Error: ' + (err.message || 'An unexpected error occurred'));
    }
  }

  /* ─── Quick status toggle ─── */
  async function quickStatusChange(id, newStatus) {
    try {
      const update = { status: newStatus };
      if (newStatus === 'published') update.published_at = new Date().toISOString();
      const { error } = await supabase.from('posts').update(update).eq('id', id);
      if (error) { setError('Error: ' + error.message); return; }
      fetchPosts();
    } catch (err) {
      console.error('Status change error:', err);
      setError('Error: ' + (err.message || 'An unexpected error occurred'));
    }
  }

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#00A6CE]/20 border-t-[#00A6CE] rounded-full animate-spin" />
      </div>
    );
  }

  /* ─── Render ─── */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper size={22} className="text-[#00A6CE]" /> News &amp; Articles
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage news articles \u2014 published articles appear on the public news page
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] transition-all"
        >
          <Plus size={14} /> {showForm && !editingId ? 'Cancel' : 'New Article'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400">Total Articles</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#6BBE4E]">{stats.published}</p>
          <p className="text-xs text-gray-400">Published</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-500">{stats.draft}</p>
          <p className="text-xs text-gray-400">Drafts</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#00A6CE]">{stats.categories}</p>
          <p className="text-xs text-gray-400">Categories</p>
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

      {/* ─── Create / Edit Form ─── */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">
              {editingId ? 'Edit Article' : 'Create New Article'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input
                type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] focus:ring-1 focus:ring-[#00458B]/20 outline-none"
                placeholder="Article title"
              />
              {form.slug && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Slug: <span className="font-mono">{form.slug}</span>
                  {editingId && (
                    <button type="button" onClick={() => { const v = prompt('Edit slug:', form.slug); if (v) u('slug', generateSlug(v)); }}
                      className="ml-2 text-[#00A6CE] hover:underline">edit</button>
                  )}
                </p>
              )}
            </div>

            {/* Category + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Summary / Excerpt */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Summary *</label>
              <textarea
                value={form.excerpt} onChange={e => u('excerpt', e.target.value)} rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] focus:ring-1 focus:ring-[#00458B]/20 outline-none resize-y"
                placeholder="Brief summary shown in article listings"
              />
            </div>

            {/* Body — Rich Text Editor */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Body</label>
              <RichTextEditor content={form.body} onChange={v => u('body', v)} placeholder="Write your article content here..." />
            </div>

            {/* Featured Image URL */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Featured Image URL (optional)</label>
              <input
                type="text" value={form.featured_image_url} onChange={e => u('featured_image_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Published Date (shown when status is published) */}
            {form.status === 'published' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Published Date</label>
                <input
                  type="date" value={form.published_at} onChange={e => u('published_at', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">Leave blank to use today\u2019s date</p>
              </div>
            )}

            {/* Notify subscribers */}
            {form.status === 'published' && (
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={notifySubscribers} onChange={e => setNotifySubscribers(e.target.checked)} className="rounded border-gray-300" />
                <Bell size={14} className="text-gray-400" />
                Notify subscribers about this article
              </label>
            )}

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] disabled:opacity-50 transition-all"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CheckCircle size={14} /> {editingId ? 'Update Article' : 'Create Article'}</>}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Filters ─── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search articles..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
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

      {/* ─── Table ─── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{posts.length === 0 ? 'No articles yet \u2014 create your first one' : 'No articles match your filters'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(post => (
                  <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[300px]">{post.title}</p>
                      <p className="text-[11px] text-gray-400 font-mono truncate max-w-[300px]">/{post.slug}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">{post.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={post.status}
                        onChange={e => quickStatusChange(post.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[post.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(post)} title="Edit"
                          className="p-1.5 text-gray-400 hover:text-[#00458B] rounded-lg hover:bg-gray-100">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(post.id)} title="Delete"
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
