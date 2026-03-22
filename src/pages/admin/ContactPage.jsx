/**
 * ContactPage — Contact form submissions management.
 *
 * Simple list view showing all contact submissions.
 * Admin can mark as read/replied and email the submitter.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Mail,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ContactPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[BOCRA] Failed to load contact submissions:', error.message);
        setFetchError(error.message);
        return;
      }
      if (data) setSubmissions(data);
    } catch (err) {
      console.error('[BOCRA] Network error loading contact submissions:', err);
      setFetchError('Unable to reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleRead(id, currentRead) {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ read: !currentRead })
        .eq('id', id);

      if (error) {
        alert(`Failed to update read status: ${error.message}`);
      } else {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, read: !currentRead } : s))
        );
        setSelected((prev) => (prev?.id === id ? { ...prev, read: !currentRead } : prev));
      }
    } catch (err) {
      console.error('[BOCRA] Failed to update read status:', err);
      alert('Unable to update. Check your connection and try again.');
    }
  }

  async function toggleReplied(id, currentReplied) {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ replied: !currentReplied })
        .eq('id', id);

      if (error) {
        alert(`Failed to update replied status: ${error.message}`);
      } else {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, replied: !currentReplied } : s))
        );
        setSelected((prev) => (prev?.id === id ? { ...prev, replied: !currentReplied } : prev));
      }
    } catch (err) {
      console.error('[BOCRA] Failed to update replied status:', err);
      alert('Unable to update. Check your connection and try again.');
    }
  }

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (filterRead === 'unread' && s.read) return false;
      if (filterRead === 'read' && !s.read) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.subject?.toLowerCase().includes(q) ||
          s.message?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [submissions, filterRead, searchTerm]);

  const unreadCount = submissions.filter((s) => !s.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#00458B]/20 border-t-[#00458B] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            {submissions.length} total {'\u00B7'} {unreadCount} unread
          </p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, subject, or message…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00458B]/20 focus:border-[#00458B]"
            />
          </div>
          <div className="flex gap-2">
            {['', 'unread', 'read'].map((val) => (
              <button
                key={val}
                onClick={() => setFilterRead(val)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  filterRead === val
                    ? 'bg-[#00458B] text-white border-[#00458B]'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {val === '' ? 'All' : val === 'unread' ? 'Unread' : 'Read'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {fetchError ? (
              <div className="px-4 py-12 text-center">
                <p className="text-red-500 text-sm mb-2">Failed to load submissions: {fetchError}</p>
                <button onClick={fetchSubmissions} className="text-[#00458B] text-sm hover:underline">Retry</button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-400 text-sm">
                No submissions found.
              </div>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selected?.id === s.id ? 'bg-blue-50 border-l-2 border-[#00458B]' : ''
                  } ${!s.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {!s.read && <div className="w-2 h-2 rounded-full bg-[#00A6CE] flex-shrink-0" />}
                    <span className={`text-sm truncate ${!s.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {s.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{s.subject || 'No subject'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                  <p className="text-sm text-gray-500">{selected.email} {selected.phone ? `\u00B7 ${selected.phone}` : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRead(selected.id, selected.read)}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      selected.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'
                    }`}
                    title={selected.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {selected.read ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => toggleReplied(selected.id, selected.replied)}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      selected.replied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                    title={selected.replied ? 'Mark as not replied' : 'Mark as replied'}
                  >
                    <Check size={14} />
                  </button>
                </div>
              </div>

              {selected.subject && (
                <p className="text-sm font-medium text-gray-700 mb-3">Subject: {selected.subject}</p>
              )}

              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                {selected.message}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>
                    {new Date(selected.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {selected.read && <span className="text-green-500">Read</span>}
                  {selected.replied && <span className="text-green-500">Replied</span>}
                </div>
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`RE: ${selected.subject || 'BOCRA Contact'}`)}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00458B] text-white rounded-lg text-sm font-medium hover:bg-[#002D5C] transition-colors"
                >
                  <Mail size={14} />
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <Mail size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a submission to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
