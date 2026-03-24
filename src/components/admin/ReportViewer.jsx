/**
 * ReportViewer — Renders a generated report from the generated_reports table.
 *
 * Props:
 *   report — object with { id, title, period_start, period_end, data, created_at }
 *   onClose — callback to close the viewer
 *
 * Data structure (report.data):
 *   { complaints: { total, resolved, byStatus, byProvider, topProviders },
 *     incidents: { total, byUrgency },
 *     applications: { total, byStatus },
 *     sla: { compliance, breached } }
 */

import { X, Download, FileText, AlertCircle, Shield, FileCheck, TrendingUp } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const BOCRA = { blue: '#00458B', cyan: '#00A6CE', magenta: '#C8237B', yellow: '#F7B731', green: '#6BBE4E' };
const PIE_COLORS = [BOCRA.magenta, BOCRA.cyan, BOCRA.yellow, BOCRA.green, '#94A3B8', '#7C3AED', '#EA580C'];

export default function ReportViewer({ report, onClose }) {
  if (!report) return null;

  const d = report.data || {};
  const complaints = d.complaints || {};
  const incidents = d.incidents || {};
  const applications = d.applications || {};
  const sla = d.sla || {};

  // Build chart data
  const statusData = Object.entries(complaints.byStatus || {}).map(([name, value]) => ({ name, value }));
  const providerData = (complaints.topProviders || []).map(p => ({
    name: p.name
      .replace('Botswana Telecommunications Corporation (BTC)', 'BTC')
      .replace('Orange Botswana', 'Orange')
      .replace('Mascom Wireless', 'Mascom')
      .replace('Botswana Fibre Networks (BoFiNet)', 'BoFiNet'),
    value: p.count,
  }));
  const urgencyData = Object.entries(incidents.byUrgency || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: name === 'critical' ? '#DC2626' : name === 'high' ? '#EA580C' : name === 'medium' ? '#F7B731' : '#6BBE4E',
  }));

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto print:shadow-none print:max-h-none print:overflow-visible">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 print:static">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText size={20} className="text-[#00458B]" /> {report.title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(report.period_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} &ndash; {new Date(report.period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 bg-[#00458B] text-white rounded-lg text-xs font-medium hover:bg-[#003366] transition-colors">
              <Download size={12} /> Print / PDF
            </button>
            {onClose && (
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close report">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-5">
          <SummaryCard icon={AlertCircle} color={BOCRA.magenta} label="Complaints" value={complaints.total || 0} sub={`${complaints.resolved || 0} resolved`} />
          <SummaryCard icon={Shield} color={BOCRA.cyan} label="Incidents" value={incidents.total || 0} />
          <SummaryCard icon={FileCheck} color={BOCRA.yellow} label="Applications" value={applications.total || 0} />
          <SummaryCard icon={TrendingUp} color={sla.compliance >= 80 ? BOCRA.green : BOCRA.magenta} label="SLA Compliance" value={`${sla.compliance ?? 100}%`} sub={`${sla.breached || 0} breached`} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6">
          {/* Complaints by Status */}
          {statusData.length > 0 && (
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3">Complaints by Status</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-1">
                {statusData.map((s, i) => (
                  <span key={s.name} className="flex items-center gap-1 text-[9px] text-gray-500">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {s.name} ({s.value})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Providers */}
          {providerData.length > 0 && (
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3">Top Complained-About Providers</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={providerData} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="value" fill={BOCRA.magenta} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Incidents by Urgency */}
          {urgencyData.length > 0 && (
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3">Incidents by Urgency</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={urgencyData} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {urgencyData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Application status breakdown */}
          {Object.keys(applications.byStatus || {}).length > 0 && (
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3">Applications by Status</h3>
              <div className="space-y-2">
                {Object.entries(applications.byStatus).map(([status, count]) => {
                  const total = applications.total || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={status} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-24 capitalize">{status.replace('_', ' ')}</span>
                      <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: pct + '%', backgroundColor: BOCRA.yellow + '80' }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-300">Generated on {new Date(report.created_at).toLocaleString('en-GB')} by BOCRA Automated Workflow Engine</p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, color, label, value, sub }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center">
      <Icon size={20} style={{ color }} className="mx-auto mb-1.5" />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
