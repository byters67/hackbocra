/**
 * IncidentsPage — Cybersecurity incident reports management.
 *
 * Features:
 * - Incident list with urgency colour coding
 * - Status tracking: Received → Investigating → Resolved → Closed
 * - Reply to reporter (disabled for anonymous reports)
 * - Assign to CSIRT team member
 * - Priority escalation to National CSIRT (one-click)
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Send,
  ChevronDown,
  UserPlus,
  AlertTriangle,
  ShieldAlert,
  Mail,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const STATUS_CONFIG = {
  received: { label: 'Received', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  investigating: { label: 'Investigating', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  resolved: { label: 'Resolved', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  closed: { label: 'Closed', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const URGENCY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  high: { label: 'High', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  medium: { label: 'Medium', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  low: { label: 'Low', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
};

export default function IncidentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useOutletContext();

  if (id) {
    return <IncidentDetail id={id} profile={profile} navigate={navigate} />;
  }
  return <IncidentsList navigate={navigate} />;
}

/* ─── List View ─── */

function IncidentsList({ navigate }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  async function fetchIncidents() {
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('cyber_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[BOCRA] Failed to load incidents:', error.message);
        setFetchError(error.message);
        return;
      }
      if (data) setIncidents(data);
    } catch (err) {
      console.error('[BOCRA] Network error loading incidents:', err);
      setFetchError('Unable to reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      if (statusFilter && i.status !== statusFilter) return false;
      if (urgencyFilter && i.urgency !== urgencyFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          i.incident_type?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.reporter_name?.toLowerCase().includes(q) ||
          i.reference_number?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [incidents, statusFilter, urgencyFilter, searchTerm]);

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
          <h1 className="text-2xl font-bold text-gray-900">Cyber Incidents</h1>
          <p className="text-sm text-gray-500 mt-1">{incidents.length} total incidents</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by type, description, or reporter…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00458B]/20 focus:border-[#00458B]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showFilters ? 'bg-[#00458B] text-white border-[#00458B]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
            <SelectFilter
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={Object.entries(STATUS_CONFIG).map(([val, cfg]) => ({ value: val, label: cfg.label }))}
            />
            <SelectFilter
              label="Urgency"
              value={urgencyFilter}
              onChange={setUrgencyFilter}
              options={Object.entries(URGENCY_CONFIG).map(([val, cfg]) => ({ value: val, label: cfg.label }))}
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Incident</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Urgency</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Reporter</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fetchError ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="text-red-500 mb-2">Failed to load incidents: {fetchError}</p>
                    <button onClick={fetchIncidents} className="text-[#00458B] text-sm hover:underline">Retry</button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    {incidents.length === 0 ? 'No incidents reported yet.' : 'No incidents match your filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => navigate(`/admin/incidents/${inc.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{inc.incident_type}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{inc.reference_number}</div>
                    </td>
                    <td className="px-4 py-3">
                      <UrgencyPill urgency={inc.urgency} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                      {inc.is_anonymous ? (
                        <span className="text-gray-400 italic">Anonymous</span>
                      ) : (
                        inc.reporter_name || '\u2014'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={inc.status} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">
                      {new Date(inc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail View ─── */

function IncidentDetail({ id, profile, navigate }) {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [escalating, setEscalating] = useState(false);

  useEffect(() => {
    loadIncident();
    loadStaff();
  }, [id]);

  async function loadIncident() {
    try {
      const { data, error } = await supabase
        .from('cyber_incidents')
        .select('*, profiles:assigned_to(full_name)')
        .eq('id', id)
        .single();

      if (!error && data) setIncident(data);
    } catch (err) {
      console.error('Failed to load incident:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStaff() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['admin', 'staff']);
      if (error) {
        console.error('[BOCRA] Failed to load staff list:', error.message);
        return;
      }
      if (data) setStaffList(data);
    } catch (err) {
      console.error('[BOCRA] Network error loading staff list:', err);
    }
  }

  async function handleStatusChange(newStatus) {
    setStatusUpdating(true);
    try {
      const { error } = await supabase
        .from('cyber_incidents')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        alert(`Failed to update status: ${error.message}`);
      } else {
        setIncident((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('[BOCRA] Status update failed:', err);
      alert('Unable to update status. Check your connection and try again.');
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleAssign(staffId) {
    try {
      const { error } = await supabase
        .from('cyber_incidents')
        .update({ assigned_to: staffId || null, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        alert(`Failed to assign: ${error.message}`);
      } else {
        const assignedStaff = staffList.find((s) => s.id === staffId);
        setIncident((prev) => ({
          ...prev,
          assigned_to: staffId || null,
          profiles: assignedStaff ? { full_name: assignedStaff.full_name } : null,
        }));
      }
    } catch (err) {
      console.error('[BOCRA] Assign failed:', err);
      alert('Unable to assign. Check your connection and try again.');
    }
  }

  async function handleEscalate() {
    setEscalating(true);
    try {
      const { error } = await supabase
        .from('cyber_incidents')
        .update({ escalated: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        alert(`Failed to escalate: ${error.message}`);
      } else {
        setIncident((prev) => ({ ...prev, escalated: true }));
        const subject = `ESCALATION: Cyber Incident ${incident.reference_number} - ${incident.incident_type}`;
        const body = `This incident has been escalated for priority handling.\n\nReference: ${incident.reference_number}\nType: ${incident.incident_type}\nUrgency: ${incident.urgency}\nDescription: ${incident.description}`;
        window.open(
          `mailto:csirt@bocra.org.bw?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        );
      }
    } catch (err) {
      console.error('[BOCRA] Escalation failed:', err);
      alert('Unable to escalate. Check your connection and try again.');
    } finally {
      setEscalating(false);
    }
  }

  function handleReply() {
    if (!replyText.trim() || incident.is_anonymous) return;
    const subject = `RE: BOCRA Cyber Incident Report ${incident.reference_number}`;
    window.open(
      `mailto:${incident.reporter_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(replyText.trim())}`
    );
    setReplyText('');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#00458B]/20 border-t-[#00458B] rounded-full animate-spin" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Incident not found.</p>
        <button onClick={() => navigate('/admin/incidents')} className="text-[#00458B] text-sm mt-2 hover:underline">
          Back to incidents
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/admin/incidents')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to incidents
      </button>

      {/* Escalation banner */}
      {incident.escalated && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <ShieldAlert size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">Escalated to National CSIRT</p>
            <p className="text-xs text-red-600">This incident has been flagged for priority national response.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{incident.incident_type}</h1>
                <p className="text-sm text-gray-500 mt-1">{incident.reference_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <UrgencyPill urgency={incident.urgency} />
                <StatusPill status={incident.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {!incident.is_anonymous ? (
                <>
                  <InfoField label="Reporter Name" value={incident.reporter_name} />
                  <InfoField label="Reporter Email" value={incident.reporter_email} />
                  <InfoField label="Reporter Phone" value={incident.reporter_phone} />
                </>
              ) : (
                <InfoField label="Reporter" value="Anonymous report" />
              )}
              <InfoField label="Incident Date" value={incident.incident_date ? new Date(incident.incident_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null} />
              <InfoField label="Submitted" value={new Date(incident.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
              <InfoField label="Assigned To" value={incident.profiles?.full_name} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {incident.description}
              </div>
            </div>
          </div>

          {/* Reply (only for non-anonymous) */}
          {!incident.is_anonymous && incident.reporter_email && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Reply to Reporter</h3>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the reporter…"
                rows={4}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00458B]/20 focus:border-[#00458B] resize-none"
              />
              <div className="flex items-center justify-end mt-3">
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00458B] text-white rounded-lg text-sm font-medium hover:bg-[#002D5C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={14} />
                  Send Reply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Update Status</h3>
            <div className="space-y-2">
              {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                <button
                  key={value}
                  onClick={() => handleStatusChange(value)}
                  disabled={statusUpdating || incident.status === value}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    incident.status === value
                      ? `${cfg.bg} ${cfg.text} ring-2 ring-current/20`
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  } disabled:opacity-50`}
                >
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assign */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Assign to CSIRT Member</h3>
            <div className="relative">
              <UserPlus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={incident.assigned_to || ''}
                onChange={(e) => handleAssign(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00458B]/20 focus:border-[#00458B]"
              >
                <option value="">Unassigned</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Escalate */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Escalation</h3>
            {incident.escalated ? (
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <ShieldAlert size={16} />
                Already escalated
              </div>
            ) : (
              <button
                onClick={handleEscalate}
                disabled={escalating}
                className="flex items-center gap-2 w-full px-3 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <AlertTriangle size={14} />
                {escalating ? 'Escalating…' : 'Escalate to National CSIRT'}
              </button>
            )}
          </div>

          {/* Quick email */}
          {!incident.is_anonymous && incident.reporter_email && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Email</h3>
              <a
                href={`mailto:${incident.reporter_email}?subject=${encodeURIComponent(`BOCRA Cyber Incident - ${incident.reference_number}`)}`}
                className="flex items-center gap-2 text-sm text-[#00458B] hover:underline"
              >
                <Mail size={14} />
                Email {incident.reporter_name || 'Reporter'}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Shared sub-components ─── */

function StatusPill({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.received;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function UrgencyPill({ urgency }) {
  const config = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.medium;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value || '\u2014'}</p>
    </div>
  );
}

function SelectFilter({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative mt-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#00458B]/20 focus:border-[#00458B]"
        >
          <option value="">All</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
