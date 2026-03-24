/**
 * Admin Data Requests Management Page
 *
 * Allows admins to view, process, and respond to data subject requests
 * submitted under the Data Protection Act, 2018.
 *
 * Features:
 * - List all requests with status filters
 * - View request details
 * - Update status (verify → in_progress → completed/rejected)
 * - Add admin notes and responses
 * - 30-day deadline tracking with overdue highlighting
 */

import { useState, useEffect } from 'react';
import {
  Shield, Clock, CheckCircle, XCircle, AlertTriangle, Eye,
  Edit3, Trash2, Lock, Download, ChevronRight, Send, User, Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { sanitizeError, sanitizeInput } from '../../lib/security';

const STATUS_FLOW = ['submitted', 'verified', 'in_progress', 'completed', 'rejected'];

const STATUS_CONFIG = {
  submitted:   { label: 'Submitted', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  verified:    { label: 'Verified', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500' },
  completed:   { label: 'Completed', color: 'bg-green-50 text-green-600', dot: 'bg-green-500' },
  rejected:    { label: 'Rejected', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
};

const TYPE_ICONS = {
  access: Eye, correction: Edit3, deletion: Trash2,
  restriction: Lock, portability: Download, withdraw_consent: XCircle,
};

const TYPE_LABELS = {
  access: 'Access Data', correction: 'Correct Data', deletion: 'Delete Data',
  restriction: 'Restrict Processing', portability: 'Export Data', withdraw_consent: 'Withdraw Consent',
};

export default function DataRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchRequests(); }, []);

  async function fetchRequests() {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchErr } = await supabase
        .from('data_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchErr) throw fetchErr;
      setRequests(data || []);
    } catch (err) {
      setRequests([]);
      setError(sanitizeError(err));
    }
    setLoading(false);
  }

  async function updateRequest(id, updates) {
    setUpdating(true);
    setError('');
    try {
      const sanitized = { ...updates };
      if (sanitized.response) sanitized.response = sanitizeInput(sanitized.response);
      if (sanitized.admin_notes) sanitized.admin_notes = sanitizeInput(sanitized.admin_notes);
      const payload = { ...sanitized, updated_at: new Date().toISOString() };
      if (updates.status === 'completed' || updates.status === 'rejected') {
        payload.completed_at = new Date().toISOString();
      }
      const { error: updateErr } = await supabase
        .from('data_requests')
        .update(payload)
        .eq('id', id);
      if (updateErr) throw updateErr;
      await fetchRequests();
      if (updates.status) setSelected(null);
    } catch (err) {
      setError(sanitizeError(err));
    }
    setUpdating(false);
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const openCount = requests.filter(r => !['completed', 'rejected'].includes(r.status)).length;
  const overdueCount = requests.filter(r =>
    !['completed', 'rejected'].includes(r.status) && new Date(r.due_by) < new Date()
  ).length;

  const selectedReq = selected ? requests.find(r => r.id === selected) : null;

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bocra-slate flex items-center gap-3">
            <Shield size={24} className="text-bocra-blue" />
            Data Subject Requests
          </h1>
          <p className="text-sm text-bocra-slate/40 mt-1">Data Protection Act, 2018 compliance</p>
        </div>
        <div className="flex items-center gap-3">
          {overdueCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg">
              <AlertTriangle size={12} />
              {overdueCount} overdue
            </span>
          )}
          <span className="px-3 py-1.5 bg-bocra-blue/5 text-bocra-blue text-xs font-medium rounded-lg">
            {openCount} open
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <Filter size={14} className="text-bocra-slate/30 flex-shrink-0" />
        {['all', ...STATUS_FLOW].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filter === s
                ? 'bg-bocra-blue text-white'
                : 'bg-white text-bocra-slate/50 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {s === 'all' ? `All (${requests.length})` : `${STATUS_CONFIG[s].label} (${requests.filter(r => r.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className={`${selectedReq ? 'lg:col-span-2' : 'lg:col-span-5'} space-y-2`}>
          {error && !selected && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-2">{error}</div>
          )}
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-6 h-6 border-2 border-bocra-blue/30 border-t-bocra-blue rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-bocra-slate/40">
              No requests found.
            </div>
          ) : filtered.map(req => {
            const sc = STATUS_CONFIG[req.status];
            const TypeIcon = TYPE_ICONS[req.request_type] || Shield;
            const isOverdue = !['completed', 'rejected'].includes(req.status) && new Date(req.due_by) < new Date();
            const isActive = selected === req.id;

            return (
              <button
                key={req.id}
                onClick={() => {
                  setSelected(req.id);
                  setResponse(req.response || '');
                  setAdminNotes(req.admin_notes || '');
                  setError('');
                }}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'border-bocra-blue bg-bocra-blue/[0.03]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-bocra-blue/10 text-bocra-blue' : 'bg-gray-100 text-bocra-slate/40'
                  }`}>
                    <TypeIcon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-bocra-slate truncate">{TYPE_LABELS[req.request_type]}</p>
                      {isOverdue && <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-bocra-slate/40 font-mono">{req.reference_number}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.color} flex-shrink-0`}>
                    {sc.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedReq && (
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6 space-y-5 h-fit sticky top-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-bocra-slate flex items-center gap-2">
                  {TYPE_LABELS[selectedReq.request_type]}
                </h2>
                <p className="text-xs text-bocra-slate/40 font-mono">{selectedReq.reference_number}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedReq.status].color}`}>
                {STATUS_CONFIG[selectedReq.status].label}
              </span>
            </div>

            {/* Requester info */}
            <div className="flex items-center gap-3 bg-bocra-off-white rounded-lg p-3">
              <User size={16} className="text-bocra-slate/40" />
              <div>
                <p className="text-sm font-medium text-bocra-slate">{selectedReq.requester_name}</p>
                <p className="text-xs text-bocra-slate/40">{selectedReq.requester_email}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bocra-off-white rounded-lg p-3">
                <span className="text-[10px] text-bocra-slate/40 uppercase tracking-wider">Submitted</span>
                <p className="text-sm text-bocra-slate mt-0.5">
                  {new Date(selectedReq.submitted_at).toLocaleDateString('en-BW', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${
                !['completed', 'rejected'].includes(selectedReq.status) && new Date(selectedReq.due_by) < new Date()
                  ? 'bg-red-50' : 'bg-bocra-off-white'
              }`}>
                <span className="text-[10px] text-bocra-slate/40 uppercase tracking-wider">Due by</span>
                <p className={`text-sm mt-0.5 font-medium ${
                  !['completed', 'rejected'].includes(selectedReq.status) && new Date(selectedReq.due_by) < new Date()
                    ? 'text-red-600' : 'text-bocra-slate'
                }`}>
                  {new Date(selectedReq.due_by).toLocaleDateString('en-BW', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-xs text-bocra-slate/40 font-medium">Request Description</span>
              <p className="text-sm text-bocra-slate mt-1 bg-bocra-off-white rounded-lg p-3">{selectedReq.description}</p>
            </div>

            {/* Categories */}
            {selectedReq.data_categories?.length > 0 && (
              <div>
                <span className="text-xs text-bocra-slate/40 font-medium">Data Categories</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedReq.data_categories.map(c => (
                    <span key={c} className="px-2.5 py-1 bg-bocra-blue/5 text-bocra-blue text-xs rounded-md">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Admin notes */}
            <div>
              <label className="text-xs text-bocra-slate/40 font-medium block mb-1">Admin Notes (internal)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                placeholder="Internal notes about processing this request..."
                className="w-full px-3 py-2 bg-bocra-off-white border border-gray-200 rounded-lg text-sm focus:border-bocra-blue outline-none resize-none"
              />
            </div>

            {/* Response to requester */}
            <div>
              <label className="text-xs text-bocra-slate/40 font-medium block mb-1">Response to Requester</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={3}
                placeholder="Your response to the data subject (will be visible to them)..."
                className="w-full px-3 py-2 bg-bocra-off-white border border-gray-200 rounded-lg text-sm focus:border-bocra-blue outline-none resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              {selectedReq.status === 'submitted' && (
                <button
                  onClick={() => updateRequest(selectedReq.id, { status: 'verified', admin_notes: adminNotes })}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle size={14} /> Verify Identity
                </button>
              )}
              {selectedReq.status === 'verified' && (
                <button
                  onClick={() => updateRequest(selectedReq.id, { status: 'in_progress', admin_notes: adminNotes })}
                  disabled={updating}
                  className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Clock size={14} /> Start Processing
                </button>
              )}
              {['verified', 'in_progress'].includes(selectedReq.status) && (
                <>
                  <button
                    onClick={() => updateRequest(selectedReq.id, { status: 'completed', response, admin_notes: adminNotes })}
                    disabled={updating || !response.trim()}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} /> Complete & Respond
                  </button>
                  <button
                    onClick={() => updateRequest(selectedReq.id, { status: 'rejected', response, admin_notes: adminNotes })}
                    disabled={updating || !response.trim()}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </>
              )}
              {adminNotes !== (selectedReq.admin_notes || '') && (
                <button
                  onClick={() => updateRequest(selectedReq.id, { admin_notes: adminNotes })}
                  disabled={updating}
                  className="px-4 py-2 border border-gray-200 text-bocra-slate text-sm rounded-lg hover:border-gray-300 disabled:opacity-50"
                >
                  Save Notes
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
