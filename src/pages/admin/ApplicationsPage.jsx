/**
 * ApplicationsPage — Licence applications management for admin portal.
 *
 * Features:
 * - Applications list with status pills, filters
 * - Click a row for detail view (via URL param :id)
 * - Detail view: all applicant fields, reply by email, assign to staff
 * - Download as PDF (browser print)
 * - Status updates: Pending → Under Review → Approved/Rejected/More Info Needed
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Send,
  Download,
  ChevronDown,
  UserPlus,
  Mail,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ApplicationReview from './ApplicationReview';

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  under_review: { label: 'Under Review', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  approved: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  more_info_needed: { label: 'More Info Needed', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
};

export default function ApplicationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useOutletContext();

  if (id) {
    return <ApplicationDetail id={id} profile={profile} navigate={navigate} />;
  }
  return <ApplicationsList navigate={navigate} />;
}

/* ─── List View ─── */

function ApplicationsList({ navigate }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('licence_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[BOCRA] Failed to load applications:', error.message);
        setFetchError(error.message);
        return;
      }
      if (data) setApplications(data);
    } catch (err) {
      console.error('[BOCRA] Network error loading applications:', err);
      setFetchError('Unable to reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const licenceTypes = useMemo(
    () => [...new Set(applications.map((a) => a.licence_type).filter(Boolean))],
    [applications]
  );

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (typeFilter && a.licence_type !== typeFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          a.full_name?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.company?.toLowerCase().includes(q) ||
          a.reference_number?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [applications, statusFilter, typeFilter, searchTerm]);

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
          <h1 className="text-2xl font-bold text-gray-900">Licence Applications</h1>
          <p className="text-sm text-gray-500 mt-1">{applications.length} total applications</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, company, or reference…"
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
              label="Licence Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={licenceTypes.map((t) => ({ value: t, label: t }))}
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
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Applicant</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Licence Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Reference</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fetchError ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="text-red-500 mb-2">Failed to load applications: {fetchError}</p>
                    <button onClick={fetchApplications} className="text-[#00458B] text-sm hover:underline">Retry</button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    {applications.length === 0 ? 'No licence applications yet.' : 'No applications match your filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/admin/applications/${a.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{a.full_name}</div>
                      <div className="text-xs text-gray-400">{a.company || a.email}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600 capitalize">{a.licence_type?.replace(/_/g, ' ') || '\u2014'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 font-mono text-xs">{a.reference_number}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={a.status} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">
                      {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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

function ApplicationDetail({ id, profile, navigate }) {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadApplication();
    loadStaff();
  }, [id]);

  async function loadApplication() {
    try {
      const { data, error } = await supabase
        .from('licence_applications')
        .select('*, profiles:assigned_to(full_name)')
        .eq('id', id)
        .single();

      if (!error && data) setApp(data);
    } catch (err) {
      console.error('Failed to load application:', err);
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
        .from('licence_applications')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        alert(`Failed to update status: ${error.message}`);
      } else {
        setApp((prev) => ({ ...prev, status: newStatus }));
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
        .from('licence_applications')
        .update({ assigned_to: staffId || null, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        alert(`Failed to assign: ${error.message}`);
      } else {
        const assignedStaff = staffList.find((s) => s.id === staffId);
        setApp((prev) => ({
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

  function handleDownloadPDF() {
    // Use safe DOM manipulation instead of document.write
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Unable to open the PDF preview. Please allow popups for this site and try again.');
      return;
    }

    const doc = printWindow.document;
    const style = doc.createElement('style');
    style.textContent = [
      'body { font-family: "Segoe UI", Arial, sans-serif; padding: 40px; color: #333; }',
      'h1 { color: #00458B; font-size: 22px; border-bottom: 3px solid #00A6CE; padding-bottom: 10px; }',
      '.field { margin-bottom: 12px; }',
      '.field label { font-weight: bold; color: #555; display: block; font-size: 12px; text-transform: uppercase; }',
      '.field span { font-size: 14px; }',
      '.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }',
      '.section { margin-top: 24px; }',
      '.section h2 { font-size: 16px; color: #00458B; margin-bottom: 8px; }',
      '.footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 12px; font-size: 11px; color: #999; }',
    ].join('\n');
    doc.head.appendChild(style);

    const title = doc.createElement('title');
    title.textContent = `Licence Application - ${app.reference_number}`;
    doc.head.appendChild(title);

    function createField(labelText, valueText) {
      const div = doc.createElement('div');
      div.className = 'field';
      const lbl = doc.createElement('label');
      lbl.textContent = labelText;
      const span = doc.createElement('span');
      span.textContent = valueText || 'N/A';
      div.appendChild(lbl);
      div.appendChild(span);
      return div;
    }

    function createSection(titleText) {
      const sec = doc.createElement('div');
      sec.className = 'section';
      const h2 = doc.createElement('h2');
      h2.textContent = titleText;
      sec.appendChild(h2);
      return sec;
    }

    // Title
    const h1 = doc.createElement('h1');
    h1.textContent = 'BOCRA Licence Application';
    doc.body.appendChild(h1);

    // Metadata
    const fields = [
      ['Reference', app.reference_number],
      ['Status', STATUS_CONFIG[app.status]?.label || app.status],
      ['Date', new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
    ];
    fields.forEach(([label, value]) => {
      const p = doc.createElement('p');
      const strong = doc.createElement('strong');
      strong.textContent = label + ': ';
      p.appendChild(strong);
      p.appendChild(doc.createTextNode(value));
      doc.body.appendChild(p);
    });

    // Applicant section
    doc.body.appendChild(createSection('Applicant Details'));
    const grid1 = doc.createElement('div');
    grid1.className = 'grid';
    grid1.appendChild(createField('Full Name', app.full_name));
    grid1.appendChild(createField('Company', app.company));
    grid1.appendChild(createField('Email', app.email));
    grid1.appendChild(createField('Phone', app.phone));
    grid1.appendChild(createField('Omang/ID', app.omang));
    grid1.appendChild(createField('City', app.city));
    doc.body.appendChild(grid1);
    doc.body.appendChild(createField('Address', app.address));

    // Licence section
    doc.body.appendChild(createSection('Licence Details'));
    const grid2 = doc.createElement('div');
    grid2.className = 'grid';
    grid2.appendChild(createField('Licence Type', app.licence_type));
    grid2.appendChild(createField('Licence Category', app.licence_slug));
    doc.body.appendChild(grid2);
    doc.body.appendChild(createField('Purpose', app.purpose));
    doc.body.appendChild(createField('Experience', app.experience));
    doc.body.appendChild(createField('Additional Info', app.additional_info));

    // Footer
    const footer = doc.createElement('div');
    footer.className = 'footer';
    footer.textContent = `Generated by BOCRA Admin Portal on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. This is an internal document.`;
    doc.body.appendChild(footer);

    doc.close();
    printWindow.focus();
    printWindow.print();
  }

  function handleReply() {
    if (!replyText.trim()) return;
    const subject = `RE: BOCRA Licence Application ${app.reference_number}`;
    window.open(
      `mailto:${app.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(replyText.trim())}`
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

  if (!app) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Application not found.</p>
        <button onClick={() => navigate('/admin/applications')} className="text-[#00458B] text-sm mt-2 hover:underline">
          Back to applications
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/admin/applications')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to applications
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{app.full_name}</h1>
                <p className="text-sm text-gray-500 mt-1">{app.reference_number}</p>
              </div>
              <StatusPill status={app.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <InfoField label="Email" value={app.email} />
              <InfoField label="Phone" value={app.phone} />
              <InfoField label="Company" value={app.company} />
              <InfoField label="Omang/ID" value={app.omang} />
              <InfoField label="City" value={app.city} />
              <InfoField label="Submitted" value={new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
            </div>

            <InfoField label="Address" value={app.address} />

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <InfoField label="Licence Type" value={app.licence_type?.replace(/_/g, ' ')} />
                <InfoField label="Licence Category" value={app.licence_slug?.replace(/-/g, ' ')} />
              </div>
              <InfoField label="Purpose" value={app.purpose} />
              <div className="mt-3">
                <InfoField label="Experience" value={app.experience} />
              </div>
              <div className="mt-3">
                <InfoField label="Additional Information" value={app.additional_info} />
              </div>
            </div>
          </div>

          {/* AI Document Review */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00A6CE]" />
              AI Document Review
            </h3>
            <ApplicationReview
              applicationId={id}
              onStatusChange={(status) => {
                setApp((prev) => ({ ...prev, status }));
              }}
            />
          </div>

          {/* Reply */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Reply to Applicant</h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response (approval, rejection, or request for more info)…"
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00458B]/20 focus:border-[#00458B] resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-[10px] text-gray-400">Opens your email client via mailto: link.</p>
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
                  disabled={statusUpdating || app.status === value}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    app.status === value
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
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Assign To</h3>
            <div className="relative">
              <UserPlus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={app.assigned_to || ''}
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

          {/* PDF */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Export</h3>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <Download size={14} />
              Download as PDF
            </button>
          </div>

          {/* Quick email */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Email</h3>
            <a
              href={`mailto:${app.email}?subject=${encodeURIComponent(`BOCRA Licence Application - ${app.reference_number}`)}`}
              className="flex items-center gap-2 text-sm text-[#00458B] hover:underline"
            >
              <Mail size={14} />
              Email {app.full_name}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared sub-components ─── */

function StatusPill({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5 break-words">{value || '\u2014'}</p>
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
