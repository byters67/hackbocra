/**
 * Admin — Jobs / Careers Manager
 * Staff create, edit, and delete job postings.
 * Open positions appear on the public Careers page.
 *
 * Pattern follows NewsManagerPage.jsx exactly (simplified — no rich text, no slug).
 */
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Briefcase, Plus, Trash2, CheckCircle, Search, Edit3, X,
  AlertCircle, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const DEPARTMENTS = [
  'Telecommunications', 'Broadcasting', 'Postal Services', 'ICT & Internet',
  'Legal & Compliance', 'Finance & Administration', 'Human Resources',
  'Corporate Communications', 'Information Technology', 'Engineering',
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
const STATUSES = ['draft', 'open', 'closed'];
const STATUS_COLORS = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
};

const EMPTY_FORM = {
  title: '', department: 'Telecommunications', location: 'Gaborone, Botswana',
  employment_type: 'Full-time', description: '', requirements: '',
  qualifications: '', salary_range: '', closing_date: '', status: 'draft',
};

export default function JobsManagerPage() {
  const { profile } = useOutletContext();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  /* ─── Fetch ─── */
  useEffect(() => {
    let cancelled = false;
    async function doFetch() {
      try {
        const { data, error } = await supabase
          .from('job_openings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);
        if (!cancelled) {
          if (data) setJobs(data);
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

  async function fetchJobs() {
    try {
      const { data, error } = await supabase
        .from('job_openings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) setJobs(data);
      if (error) console.error('Fetch error:', error);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }

  /* ─── Filtered list + stats ─── */
  const filtered = useMemo(() => {
    return jobs.filter(j => {
      if (filterDept && j.department !== filterDept) return false;
      if (filterStatus && j.status !== filterStatus) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          j.title?.toLowerCase().includes(q) ||
          j.department?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [jobs, filterDept, filterStatus, searchTerm]);

  const stats = useMemo(() => ({
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    closedDraft: jobs.filter(j => j.status === 'closed' || j.status === 'draft').length,
    departments: [...new Set(jobs.map(j => j.department))].length,
  }), [jobs]);

  /* ─── Form helpers ─── */
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function startEdit(job) {
    setForm({
      title: job.title || '',
      department: job.department || 'Telecommunications',
      location: job.location || 'Gaborone, Botswana',
      employment_type: job.employment_type || 'Full-time',
      description: job.description || '',
      requirements: job.requirements || '',
      qualifications: job.qualifications || '',
      salary_range: job.salary_range || '',
      closing_date: job.closing_date || '',
      status: job.status || 'draft',
    });
    setEditingId(job.id);
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
    if (!form.department) { setError('Department is required'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      department: form.department,
      location: form.location.trim() || 'Gaborone, Botswana',
      employment_type: form.employment_type,
      description: form.description.trim(),
      requirements: form.requirements.trim() || null,
      qualifications: form.qualifications.trim() || null,
      salary_range: form.salary_range.trim() || null,
      closing_date: form.closing_date || null,
      status: form.status,
      posted_by: profile?.id || null,
    };

    try {
      if (editingId) {
        const { error: updateErr } = await supabase
          .from('job_openings').update(payload).eq('id', editingId);
        if (updateErr) { setError(updateErr.message); setSaving(false); return; }
        setSuccess('Job posting updated successfully');
      } else {
        const { error: insertErr } = await supabase
          .from('job_openings').insert(payload);
        if (insertErr) { setError(insertErr.message); setSaving(false); return; }
        setSuccess('Job posting created \u2014 ' + (form.status === 'open' ? 'now visible on the Careers page' : 'saved as draft'));
      }

      setSaving(false);
      resetForm();
      fetchJobs();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'An unexpected error occurred');
      setSaving(false);
    }
  }

  /* ─── Delete ─── */
  async function handleDelete(id) {
    if (!confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('job_openings').delete().eq('id', id);
      if (error) { setError('Error: ' + error.message); return; }
      fetchJobs();
      setSuccess('Job posting deleted');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Error: ' + (err.message || 'An unexpected error occurred'));
    }
  }

  /* ─── Quick status toggle ─── */
  async function quickStatusChange(id, newStatus) {
    try {
      const { error } = await supabase
        .from('job_openings').update({ status: newStatus }).eq('id', id);
      if (error) { setError('Error: ' + error.message); return; }
      fetchJobs();
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
            <Briefcase size={22} className="text-[#00A6CE]" /> Jobs &amp; Careers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage job postings &mdash; open positions appear on the public Careers page
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] transition-all"
        >
          <Plus size={14} /> {showForm && !editingId ? 'Cancel' : 'Post New Job'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400">Total Jobs</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#6BBE4E]">{stats.open}</p>
          <p className="text-xs text-gray-400">Open</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-500">{stats.closedDraft}</p>
          <p className="text-xs text-gray-400">Closed / Draft</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#00A6CE]">{stats.departments}</p>
          <p className="text-xs text-gray-400">Departments</p>
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
              {editingId ? 'Edit Job Posting' : 'Post New Job'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Job Title *</label>
              <input
                type="text" value={form.title} onChange={e => u('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] focus:ring-1 focus:ring-[#00458B]/20 outline-none"
                placeholder="e.g. Senior Telecommunications Engineer"
              />
            </div>

            {/* Department + Employment Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Department *</label>
                <select value={form.department} onChange={e => u('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Employment Type</label>
                <select value={form.employment_type} onChange={e => u('employment_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none">
                  {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Location + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                <input
                  type="text" value={form.location} onChange={e => u('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="Gaborone, Botswana"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={e => u('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none">
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
              <textarea
                value={form.description} onChange={e => u('description', e.target.value)} rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] focus:ring-1 focus:ring-[#00458B]/20 outline-none resize-y"
                placeholder="What does this role involve?"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Requirements</label>
              <textarea
                value={form.requirements} onChange={e => u('requirements', e.target.value)} rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] focus:ring-1 focus:ring-[#00458B]/20 outline-none resize-y"
                placeholder="Key responsibilities and duties"
              />
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Qualifications</label>
              <textarea
                value={form.qualifications} onChange={e => u('qualifications', e.target.value)} rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] focus:ring-1 focus:ring-[#00458B]/20 outline-none resize-y"
                placeholder="Education, experience, skills needed"
              />
            </div>

            {/* Salary Range + Closing Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Salary Range (optional)</label>
                <input
                  type="text" value={form.salary_range} onChange={e => u('salary_range', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="e.g. BWP 15,000 - 25,000 per month"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Closing Date</label>
                <input
                  type="date" value={form.closing_date} onChange={e => u('closing_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] disabled:opacity-50 transition-all"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CheckCircle size={14} /> {editingId ? 'Update Job' : 'Post Job'}</>}
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
            placeholder="Search jobs..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
          />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
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
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{jobs.length === 0 ? 'No job postings yet \u2014 create your first one' : 'No jobs match your filters'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Department</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Closing</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(job => (
                  <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[300px]">{job.title}</p>
                      <p className="text-[11px] text-gray-400 truncate max-w-[300px]">{job.location}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">{job.department}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{job.employment_type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={job.status}
                        onChange={e => quickStatusChange(job.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                      {job.closing_date ? new Date(job.closing_date).toLocaleDateString() : '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(job)} title="Edit"
                          className="p-1.5 text-gray-400 hover:text-[#00458B] rounded-lg hover:bg-gray-100">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(job.id)} title="Delete"
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
