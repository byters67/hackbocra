/**
 * AutomationPage — BOCRA Admin Workflow Rules Management
 *
 * Admin interface for the Automated Workflow Engine:
 * - View all workflow rules with toggle switches
 * - Edit rule parameters (delay, condition, target)
 * - Run escalation check manually
 * - Generate weekly report on demand
 * - View recent automation activity log
 */

import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Zap, Clock, Play, ToggleLeft, ToggleRight, Settings,
  AlertTriangle, FileText, Bell, ArrowRight, RefreshCw,
  CheckCircle, XCircle, X, Save, ChevronDown,
  ShieldCheck, TrendingUp, Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../../lib/supabase';
import {
  getWorkflowRules, toggleRule, updateRule,
  runEscalationCheck, getWorkflowLogs,
  generateWeeklyReport, getGeneratedReports
} from '../../lib/workflow';
import { calculateSLA } from '../../lib/sla';
import { getComplaintUrgency } from '../../components/admin/SLABadge';
import ReportViewer from '../../components/admin/ReportViewer';

const ACTION_COLORS = {
  escalate_priority: { border: 'border-l-[#C8237B]', bg: 'bg-[#C8237B]/5', icon: AlertTriangle, color: '#C8237B', label: 'Escalation' },
  send_notification: { border: 'border-l-[#00A6CE]', bg: 'bg-[#00A6CE]/5', icon: Bell, color: '#00A6CE', label: 'Notification' },
  send_acknowledgement: { border: 'border-l-[#00A6CE]', bg: 'bg-[#00A6CE]/5', icon: Bell, color: '#00A6CE', label: 'Acknowledgement' },
  generate_report: { border: 'border-l-[#6BBE4E]', bg: 'bg-[#6BBE4E]/5', icon: FileText, color: '#6BBE4E', label: 'Report' },
};

function formatDelay(minutes) {
  if (!minutes || minutes === 0) return 'Immediate';
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  return parts.join(' ') || 'Immediate';
}

function timeAgo(d) {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

export default function AutomationPage() {
  const navigate = useNavigate();
  const { profile } = useOutletContext();
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [caseStats, setCaseStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);
  const [escalationRunning, setEscalationRunning] = useState(false);
  const [escalationResult, setEscalationResult] = useState(null);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const [rulesRes, logsRes, reportsRes, complaintsRes, incidentsRes, appsRes] = await Promise.all([
      getWorkflowRules(),
      getWorkflowLogs(20),
      getGeneratedReports(5),
      supabase.from('complaints').select('*').order('created_at', { ascending: false }),
      supabase.from('cyber_incidents').select('id, status, urgency, created_at'),
      supabase.from('licence_applications').select('id, status, licence_type, created_at'),
    ]);
    if (rulesRes.data) setRules(rulesRes.data);
    if (logsRes.data) setLogs(logsRes.data);
    if (reportsRes.data) setReports(reportsRes.data);
    setCaseStats(computeCaseStats(complaintsRes.data || [], incidentsRes.data || [], appsRes.data || []));
    setLoading(false);
  }

  function computeCaseStats(complaints, incidents, applications) {
    const openComplaints = complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed');
    const openIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed');
    const openApps = applications.filter(a => a.status !== 'approved' && a.status !== 'rejected');

    const slaBreakdown = { on_track: 0, warning: 0, at_risk: 0, breached: 0 };
    openComplaints.forEach(c => {
      const sla = calculateSLA('complaint', getComplaintUrgency(c), c.created_at);
      slaBreakdown[sla.status]++;
    });
    openIncidents.forEach(i => {
      const sla = calculateSLA('cyber_incident', i.urgency || 'medium', i.created_at);
      slaBreakdown[sla.status]++;
    });

    const total = complaints.length + incidents.length + applications.length;
    const totalOpen = openComplaints.length + openIncidents.length + openApps.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length
      + incidents.filter(i => i.status === 'resolved').length
      + applications.filter(a => a.status === 'approved').length;

    const slaTrackedOpen = openComplaints.length + openIncidents.length;
    const complianceRate = slaTrackedOpen > 0
      ? Math.round(((slaTrackedOpen - slaBreakdown.breached) / slaTrackedOpen) * 100)
      : 100;
    return { total, totalOpen, resolved, slaBreakdown, complianceRate };
  }

  async function handleToggle(rule) {
    const newActive = !rule.is_active;
    // Optimistic update
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: newActive } : r));
    const { error } = await toggleRule(rule.id, newActive);
    if (error) {
      // Revert on error
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: !newActive } : r));
    }
  }

  async function handleRunEscalation() {
    setEscalationRunning(true);
    setEscalationResult(null);
    const { data, error } = await runEscalationCheck();
    setEscalationRunning(false);
    if (error) {
      setEscalationResult({ type: 'error', message: error.message });
    } else {
      setEscalationResult({ type: 'success', message: `${data?.escalations || 0} case(s) escalated` });
      // Refresh logs
      const { data: newLogs } = await getWorkflowLogs(20);
      if (newLogs) setLogs(newLogs);
    }
  }

  async function handleGenerateReport() {
    setReportGenerating(true);
    setReportResult(null);
    const { data, error } = await generateWeeklyReport();
    setReportGenerating(false);
    if (error) {
      setReportResult({ type: 'error', message: error.message });
    } else {
      setReportResult({ type: 'success', message: 'Report generated successfully' });
      if (data?.[0]) {
        setReports(prev => [data[0], ...prev]);
        setViewingReport(data[0]);
      }
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-[#00458B]/20 border-t-[#00458B] rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap size={24} className="text-[#F7B731]" /> Automation Engine
          </h1>
          <p className="text-sm text-gray-500 mt-1">{rules.length} rules configured &middot; {rules.filter(r => r.is_active).length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRunEscalation} disabled={escalationRunning}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] disabled:opacity-50 transition-all">
            {escalationRunning ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running&hellip;</>
            ) : (
              <><Play size={14} /> Run Escalation Check</>
            )}
          </button>
          <button onClick={handleGenerateReport} disabled={reportGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-[#6BBE4E] hover:text-[#6BBE4E] disabled:opacity-50 transition-all">
            {reportGenerating ? (
              <><div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> Generating&hellip;</>
            ) : (
              <><FileText size={14} /> Generate Report</>
            )}
          </button>
          <button onClick={fetchAll} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#00A6CE] hover:border-[#00A6CE] transition-all" aria-label="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Result banners */}
      {escalationResult && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-sm ${escalationResult.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {escalationResult.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {escalationResult.message}
          <button onClick={() => setEscalationResult(null)} className="ml-auto p-0.5 hover:opacity-60"><X size={14} /></button>
        </div>
      )}
      {reportResult && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-sm ${reportResult.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {reportResult.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {reportResult.message}
          <button onClick={() => setReportResult(null)} className="ml-auto p-0.5 hover:opacity-60"><X size={14} /></button>
        </div>
      )}

      {/* Live Case Overview */}
      {caseStats && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Live Case Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Stat cards */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-[#00A6CE]" />
                <span className="text-[10px] text-gray-400 uppercase font-medium">Total Cases</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{caseStats.total}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{caseStats.totalOpen} open &middot; {caseStats.resolved} resolved</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={14} className="text-[#6BBE4E]" />
                <span className="text-[10px] text-gray-400 uppercase font-medium">SLA Compliance</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: caseStats.complianceRate >= 80 ? '#6BBE4E' : caseStats.complianceRate >= 50 ? '#F7B731' : '#C8237B' }}>
                {caseStats.complianceRate}%
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">{caseStats.slaBreakdown.breached} breached of {caseStats.totalOpen} open</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={14} className="text-[#EA580C]" />
                <span className="text-[10px] text-gray-400 uppercase font-medium">At Risk</span>
              </div>
              <p className="text-2xl font-bold text-[#EA580C]">{caseStats.slaBreakdown.at_risk + caseStats.slaBreakdown.warning}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{caseStats.slaBreakdown.warning} warning &middot; {caseStats.slaBreakdown.at_risk} critical</p>
            </div>
            {/* SLA Donut Chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-20 h-20 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'On Track', value: caseStats.slaBreakdown.on_track, color: '#6BBE4E' },
                        { name: 'Warning', value: caseStats.slaBreakdown.warning, color: '#F7B731' },
                        { name: 'At Risk', value: caseStats.slaBreakdown.at_risk, color: '#EA580C' },
                        { name: 'Breached', value: caseStats.slaBreakdown.breached, color: '#C8237B' },
                      ].filter(d => d.value > 0)}
                      cx="50%" cy="50%"
                      innerRadius={22} outerRadius={36}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[
                        { name: 'On Track', value: caseStats.slaBreakdown.on_track, color: '#6BBE4E' },
                        { name: 'Warning', value: caseStats.slaBreakdown.warning, color: '#F7B731' },
                        { name: 'At Risk', value: caseStats.slaBreakdown.at_risk, color: '#EA580C' },
                        { name: 'Breached', value: caseStats.slaBreakdown.breached, color: '#C8237B' },
                      ].filter(d => d.value > 0).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} cases`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#6BBE4E]" /><span className="text-gray-600">On Track ({caseStats.slaBreakdown.on_track})</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F7B731]" /><span className="text-gray-600">Warning ({caseStats.slaBreakdown.warning})</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EA580C]" /><span className="text-gray-600">At Risk ({caseStats.slaBreakdown.at_risk})</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#C8237B]" /><span className="text-gray-600">Breached ({caseStats.slaBreakdown.breached})</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="space-y-3 mb-8">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Workflow Rules</h2>
        {rules.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <Zap size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No workflow rules found. Run the database migration first.</p>
          </div>
        ) : rules.map(rule => {
          const actionConfig = ACTION_COLORS[rule.action] || ACTION_COLORS.send_notification;
          const ActionIcon = actionConfig.icon;
          return (
            <div key={rule.id} className={`bg-white rounded-xl border border-gray-100 border-l-4 ${actionConfig.border} p-5 hover:shadow-md transition-all`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${actionConfig.bg} flex items-center justify-center flex-shrink-0`}>
                  <ActionIcon size={18} style={{ color: actionConfig.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{rule.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{rule.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(rule)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${rule.is_active ? 'bg-[#00A6CE]' : 'bg-gray-300'}`}
                        aria-label={`${rule.is_active ? 'Disable' : 'Enable'} ${rule.name}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${rule.is_active ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                      {/* Edit */}
                      <button onClick={() => setEditingRule({ ...rule })}
                        className="p-2 text-gray-400 hover:text-[#00458B] rounded-lg hover:bg-gray-50 transition-colors" aria-label="Edit rule">
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Details */}
                  <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {rule.trigger_event}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: actionConfig.color + '15', color: actionConfig.color }}>
                      {actionConfig.label}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock size={10} /> {formatDelay(rule.delay_minutes)}
                    </span>
                    <span className={`text-[10px] font-medium ${rule.is_active ? 'text-[#6BBE4E]' : 'text-gray-400'}`}>
                      {rule.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generated Reports */}
      {reports.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Generated Reports</h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {reports.map(report => (
              <button key={report.id} onClick={() => setViewingReport(report)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left">
                <FileText size={16} className="text-[#6BBE4E] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{report.title}</p>
                  <p className="text-[10px] text-gray-400">{new Date(report.created_at).toLocaleString('en-GB')}</p>
                </div>
                <ArrowRight size={14} className="text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Activity Log</h2>
          <button onClick={() => navigate('/admin/automation/logs')} className="text-xs text-[#00A6CE] hover:underline flex items-center gap-1">
            View full log <ArrowRight size={10} />
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-300 text-sm">No automation activity yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase">Rule</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase">Case</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-xs text-gray-500 font-mono whitespace-nowrap">{timeAgo(log.executed_at)}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-700 font-medium">{log.rule_name}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">
                        <span className="font-mono">{log.case_reference || log.case_id?.slice(0, 8)}</span>
                        <span className="text-gray-300 ml-1">({log.case_type})</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">{log.action_taken}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${log.action_result === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.action_result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingRule && (
        <EditRuleModal
          rule={editingRule}
          onSave={async (updates) => {
            const { error } = await updateRule(editingRule.id, updates);
            if (!error) {
              setRules(prev => prev.map(r => r.id === editingRule.id ? { ...r, ...updates } : r));
              setEditingRule(null);
            }
          }}
          onClose={() => setEditingRule(null)}
        />
      )}

      {/* Report Viewer */}
      {viewingReport && <ReportViewer report={viewingReport} onClose={() => setViewingReport(null)} />}

      <div className="flex h-1 rounded-full overflow-hidden mt-6">
        <div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EDIT RULE MODAL
   ═══════════════════════════════════════════════════════════════ */
function EditRuleModal({ rule, onSave, onClose }) {
  const [name, setName] = useState(rule.name);
  const [description, setDescription] = useState(rule.description || '');
  const [delayDays, setDelayDays] = useState(Math.floor((rule.delay_minutes || 0) / (24 * 60)));
  const [delayHours, setDelayHours] = useState(Math.floor(((rule.delay_minutes || 0) % (24 * 60)) / 60));
  const [target, setTarget] = useState(rule.target || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const delayMinutes = delayDays * 24 * 60 + delayHours * 60;
    await onSave({ name, description, delay_minutes: delayMinutes, target: target || null });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Rule</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600" aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Rule Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] focus:ring-2 focus:ring-[#00458B]/10 outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] focus:ring-2 focus:ring-[#00458B]/10 outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Delay (days)</label>
              <input type="number" min="0" value={delayDays} onChange={e => setDelayDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] focus:ring-2 focus:ring-[#00458B]/10 outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Delay (hours)</label>
              <input type="number" min="0" max="23" value={delayHours} onChange={e => setDelayHours(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] focus:ring-2 focus:ring-[#00458B]/10 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Target (optional)</label>
            <input type="text" value={target} onChange={e => setTarget(e.target.value)} placeholder="e.g. department ID or email"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] focus:ring-2 focus:ring-[#00458B]/10 outline-none" />
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 uppercase font-medium mb-1">Trigger Event</p>
            <p className="text-sm text-gray-700 font-mono">{rule.trigger_event}</p>
            <p className="text-[10px] text-gray-400 uppercase font-medium mb-1 mt-2">Action</p>
            <p className="text-sm text-gray-700 font-mono">{rule.action}</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || !name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] disabled:opacity-50 transition-all">
              <Save size={14} /> {saving ? 'Saving\u2026' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
