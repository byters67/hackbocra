/**
 * Admin — Documents Manager
 * Staff upload, edit, and delete documents (PDFs, files).
 * Data feeds the public Documents & Legislation page.
 *
 * Pattern follows AdminTypeApprovalPage.jsx exactly.
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FolderOpen, Plus, Trash2, CheckCircle, Search, Edit3, X,
  Upload, AlertCircle, Download, FileText, Loader2, Bell,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CATEGORIES = [
  'Legislation', 'Annual Reports', 'Guidelines & Standards', 'Licensing',
  'Technical Specifications', 'Consultation Papers', 'Measurement Reports',
  'Broadband & Internet', 'Spectrum & Frequency', 'Consumer Protection',
  'Rulings & Disputes', 'Forms & Applications', 'Numbering Plan',
  'Research & Publications', 'Policy', 'EMF & Health', 'Broadcasting',
];

const EMPTY_FORM = {
  title: '', category: 'Legislation', year: new Date().getFullYear().toString(),
  description: '', file_url: '', file_name: '',
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export default function DocumentsManagerPage() {
  const { profile } = useOutletContext();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [notifySubscribers, setNotifySubscribers] = useState(false);

  /* ─── Fetch ─── */
  useEffect(() => {
    let cancelled = false;
    async function doFetch() {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(300);
        if (!cancelled) {
          if (data) setDocuments(data);
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

  async function fetchDocuments() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);
      if (data) setDocuments(data);
      if (error) console.error('Fetch error:', error);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }

  /* ─── Filtered list + stats ─── */
  const filtered = useMemo(() => {
    return documents.filter(d => {
      if (filterCategory && d.category !== filterCategory) return false;
      if (filterYear && d.year !== filterYear) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          d.title?.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [documents, filterCategory, filterYear, searchTerm]);

  const stats = useMemo(() => ({
    total: documents.length,
    categories: [...new Set(documents.map(d => d.category))].length,
    thisYear: documents.filter(d => d.year === new Date().getFullYear().toString()).length,
  }), [documents]);

  const years = useMemo(() =>
    [...new Set(documents.map(d => d.year).filter(Boolean))].sort((a, b) => b.localeCompare(a)),
    [documents]);

  /* ─── Form helpers ─── */
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function startEdit(doc) {
    setForm({
      title: doc.title || '',
      category: doc.category || 'Legislation',
      year: doc.year || new Date().getFullYear().toString(),
      description: doc.description || '',
      file_url: doc.file_url || '',
      file_name: doc.file_name || '',
    });
    setEditingId(doc.id);
    setUploadFile(null);
    setShowForm(true);
    setError('');
  }

  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setUploadFile(null);
    setShowForm(false);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  /* ─── File selection ─── */
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('File type not allowed. Use PDF, DOC, DOCX, XLS, or XLSX.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 20MB.');
      e.target.value = '';
      return;
    }

    setUploadFile(file);
    setError('');
  }

  /* ─── Upload file to Supabase Storage ─── */
  async function uploadToStorage(file) {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return { publicUrl, fileName: file.name, fileSize: file.size };
  }

  /* ─── Submit ─── */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!editingId && !uploadFile && !form.file_url) { setError('Please select a file to upload'); return; }

    setSaving(true);

    try {
      let fileUrl = form.file_url;
      let fileName = form.file_name;
      let fileSize = null;

      // Upload new file if selected
      if (uploadFile) {
        setUploading(true);
        const result = await uploadToStorage(uploadFile);
        fileUrl = result.publicUrl;
        fileName = result.fileName;
        fileSize = result.fileSize;
        setUploading(false);
      }

      const payload = {
        title: form.title.trim(),
        category: form.category,
        year: form.year,
        description: form.description.trim() || null,
        file_url: fileUrl,
        file_name: fileName || null,
        file_size: fileSize,
        uploaded_by: profile?.id || null,
      };

      if (editingId) {
        const { error: updateErr } = await supabase
          .from('documents').update(payload).eq('id', editingId);
        if (updateErr) { setError(updateErr.message); setSaving(false); return; }
        setSuccess('Document updated successfully');
      } else {
        const { error: insertErr } = await supabase
          .from('documents').insert(payload);
        if (insertErr) { setError(insertErr.message); setSaving(false); return; }
        setSuccess('Document uploaded successfully');
      }

      // Send subscriber notification if toggled on
      if (notifySubscribers) {
        const CATEGORY_TO_AREA = { Legislation: 'telecoms', Broadcasting: 'broadcasting', 'Consumer Protection': 'telecoms', Licensing: 'licensing', 'Broadband & Internet': 'internet_ict', 'Spectrum & Frequency': 'telecoms', 'Cybersecurity': 'cybersecurity' };
        const area = CATEGORY_TO_AREA[form.category] || 'telecoms';
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const nRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ action: 'notify', notification_type: 'document', content_title: form.title.trim(), area, content_url: '/documents/drafts' }),
          });
          const nData = await nRes.json();
          if (nData.success) setSuccess(prev => prev + ` \u2014 Notification sent to ${nData.recipients_count} subscriber${nData.recipients_count !== 1 ? 's' : ''}`);
        } catch { /* notification failure is non-critical */ }
      }

      setSaving(false);
      setNotifySubscribers(false);
      resetForm();
      fetchDocuments();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'An unexpected error occurred');
      setSaving(false);
      setUploading(false);
    }
  }

  /* ─── Delete (removes both DB row + Storage file) ─── */
  async function handleDelete(doc) {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    try {
      // Delete file from Storage if URL looks like a Supabase Storage URL
      if (doc.file_url?.includes('/storage/v1/object/public/documents/')) {
        const parts = doc.file_url.split('/storage/v1/object/public/documents/');
        const storagePath = parts[1];
        if (storagePath) {
          await supabase.storage.from('documents').remove([storagePath]);
        }
      }

      const { error } = await supabase.from('documents').delete().eq('id', doc.id);
      if (error) { setError('Error: ' + error.message); return; }
      fetchDocuments();
      setSuccess('Document deleted');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Error: ' + (err.message || 'An unexpected error occurred'));
    }
  }

  /* ─── CSV Export ─── */
  function exportCSV() {
    const headers = ['Title', 'Category', 'Year', 'Description', 'File URL'];
    const rows = filtered.map(d => [d.title, d.category, d.year, d.description || '', d.file_url || '']);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `bocra_documents_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  /* ─── Format file size ─── */
  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

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
            <FolderOpen size={22} className="text-[#00A6CE]" /> Documents Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload and manage documents \u2014 available on the public Documents &amp; Legislation page
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50">
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] transition-all"
          >
            <Plus size={14} /> {showForm && !editingId ? 'Cancel' : 'Upload Document'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400">Total Documents</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#00A6CE]">{stats.categories}</p>
          <p className="text-xs text-gray-400">Categories</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#6BBE4E]">{stats.thisYear}</p>
          <p className="text-xs text-gray-400">Added This Year</p>
        </div>
      </div>

      {/* Success / Error */}
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

      {/* ─── Upload / Edit Form ─── */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">
              {editingId ? 'Edit Document' : 'Upload New Document'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input
                type="text" value={form.title} onChange={e => u('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] focus:ring-1 focus:ring-[#00458B]/20 outline-none"
                placeholder="Document title"
              />
            </div>

            {/* Category + Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select value={form.category} onChange={e => u('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                <input
                  type="number" value={form.year} onChange={e => u('year', e.target.value)}
                  min="2000" max="2099"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
              <textarea
                value={form.description} onChange={e => u('description', e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none resize-y"
                placeholder="Brief description of the document"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {editingId ? 'Replace File (optional)' : 'File *'}
              </label>
              {/* Show current file if editing */}
              {editingId && form.file_name && !uploadFile && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
                  <FileText size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600 truncate">{form.file_name}</span>
                  {form.file_url && (
                    <a href={form.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00A6CE] hover:underline ml-auto">View</a>
                  )}
                </div>
              )}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#00458B]/10 file:text-[#00458B] file:text-xs file:font-medium file:cursor-pointer"
                />
              </div>
              {uploadFile && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Selected: {uploadFile.name} ({formatSize(uploadFile.size)})
                </p>
              )}
              <p className="text-[11px] text-gray-400 mt-1">Allowed: PDF, DOC, DOCX, XLS, XLSX. Max 20MB.</p>
            </div>

            {/* Notify subscribers */}
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={notifySubscribers} onChange={e => setNotifySubscribers(e.target.checked)} className="rounded border-gray-300" />
              <Bell size={14} className="text-gray-400" />
              Notify subscribers about this document
            </label>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <>{uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading file...</> : <><Loader2 size={14} className="animate-spin" /> Saving...</>}</>
                ) : (
                  <>{editingId ? <><CheckCircle size={14} /> Update Document</> : <><Upload size={14} /> Upload Document</>}</>
                )}
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
            placeholder="Search documents..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
          />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none">
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* ─── Table ─── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{documents.length === 0 ? 'No documents yet \u2014 upload your first one' : 'No documents match your filters'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Year</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">File</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => (
                  <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[300px]">{doc.title}</p>
                      {doc.description && <p className="text-[11px] text-gray-400 truncate max-w-[300px]">{doc.description}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">{doc.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{doc.year}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {doc.file_url ? (
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-[#00A6CE] hover:underline flex items-center gap-1 truncate max-w-[150px]">
                          <FileText size={12} /> {doc.file_name || 'View file'}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">\u2014</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(doc)} title="Edit"
                          className="p-1.5 text-gray-400 hover:text-[#00458B] rounded-lg hover:bg-gray-100">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(doc)} title="Delete"
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
