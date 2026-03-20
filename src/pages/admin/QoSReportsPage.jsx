/**
 * Admin — QoS Reports Management
 * Staff submit monthly operator performance reports.
 * Data feeds the public QoS Monitoring dashboard.
 */
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Signal, Plus, Trash2, CheckCircle, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const OPS = ['mascom', 'btc', 'orange'];
const OP_LABELS = { mascom: 'Mascom', btc: 'BTC', orange: 'Orange' };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const REGIONS = ['National','Gaborone','Francistown','Maun','Kasane','Selebi Phikwe','Palapye','Mahalapye'];

export default function QoSReportsPage() {
  const { profile } = useOutletContext();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ operator: 'mascom', month: 'Jan', year: 2025, region: 'National', call_success_rate: '', dropped_call_rate: '', throughput: '', uptime: '', latency: '', sms_delivery: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    const { data } = await supabase.from('qos_reports').select('*').order('year', { ascending: false }).order('created_at', { ascending: false }).limit(50);
    if (data) setReports(data);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Validate all KPI fields have values
    const kpis = ['call_success_rate', 'dropped_call_rate', 'throughput', 'uptime', 'latency', 'sms_delivery'];
    for (const k of kpis) {
      if (!form[k] || isNaN(parseFloat(form[k]))) { alert(`Please enter a valid number for ${k.replace(/_/g, ' ')}`); return; }
    }
    if (parseFloat(form.call_success_rate) > 100 || parseFloat(form.uptime) > 100 || parseFloat(form.sms_delivery) > 100) { alert('Percentage values cannot exceed 100%'); return; }
    if (parseFloat(form.call_success_rate) < 0 || parseFloat(form.dropped_call_rate) < 0) { alert('Values cannot be negative'); return; }
    setSaving(true);
    const { error } = await supabase.from('qos_reports').insert({
      ...form,
      call_success_rate: parseFloat(form.call_success_rate),
      dropped_call_rate: parseFloat(form.dropped_call_rate),
      throughput: parseFloat(form.throughput),
      uptime: parseFloat(form.uptime),
      latency: parseFloat(form.latency),
      sms_delivery: parseFloat(form.sms_delivery),
      submitted_by: profile?.id,
    });
    if (error) alert('Error: ' + error.message);
    else { setSuccess(true); setShowForm(false); fetchReports(); setTimeout(() => setSuccess(false), 3000); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this report?')) return;
    await supabase.from('qos_reports').delete().eq('id', id);
    fetchReports();
  }

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-[#00A6CE]/20 border-t-[#00A6CE] rounded-full animate-spin"/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Signal size={22} className="text-[#00A6CE]"/> QoS Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Submit monthly operator performance data for the public QoS dashboard</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] transition-all">
          <Plus size={14}/> {showForm ? 'Cancel' : 'New Report'}
        </button>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2"><CheckCircle size={14}/> Report submitted — public QoS dashboard updated.</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Submit Performance Report</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div><label className="text-[10px] text-gray-400 uppercase font-medium">Operator *</label>
            <select value={form.operator} onChange={e=>u('operator',e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              {OPS.map(o=><option key={o} value={o}>{OP_LABELS[o]}</option>)}
            </select></div>
            <div><label className="text-[10px] text-gray-400 uppercase font-medium">Month *</label>
            <select value={form.month} onChange={e=>u('month',e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
            </select></div>
            <div><label className="text-[10px] text-gray-400 uppercase font-medium">Year *</label>
            <input type="number" value={form.year} onChange={e=>u('year',parseInt(e.target.value))} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div><label className="text-[10px] text-gray-400 uppercase font-medium">Region *</label>
            <select value={form.region} onChange={e=>u('region',e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
            </select></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <div><label className="text-[10px] text-gray-400 uppercase font-medium">Call Success %</label>
            <input type="number" step="0.1" required value={form.call_success_rate} onChange={e=>u('call_success_rate',e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="98.5"/></div>
            <div><label className="text-[10px] text-gray-400 uppercase font-medium">Dropped Call %</label>
            <input type="number" step="0.1" required value={form.dropped_call_rate} onChange={e=>u('dropped_call_rate',e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0.8"/></div>
            <div><label className="text-[10px] text-gray-400 uppercase font-medium">Throughput Mbps</label>
            <input type="number" step="0.1" required value={form.throughput} onChange={e=>u('throughput',e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="20.5"/></div>
            <div><label className="text-[10px] text-gray-400 uppercase font-medium">Uptime %</label>
            <input type="number" step="0.1" required value={form.uptime} onChange={e=>u('uptime',e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="99.7"/></div>
            <div><label className="text-[10px] text-gray-400 uppercase font-medium">Latency ms</label>
            <input type="number" step="1" required value={form.latency} onChange={e=>u('latency',e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="25"/></div>
            <div><label className="text-[10px] text-gray-400 uppercase font-medium">SMS Delivery %</label>
            <input type="number" step="0.1" required value={form.sms_delivery} onChange={e=>u('sms_delivery',e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="99.5"/></div>
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#6BBE4E] text-white rounded-xl text-sm font-medium hover:bg-[#5AAE3E] disabled:opacity-50">
            {saving ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      )}

      {/* Reports table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Submitted Reports ({reports.length})</h3>
          <a href="/hackathonteamproject/services/qos-monitoring" target="_blank" className="text-xs text-[#00A6CE] hover:underline flex items-center gap-1"><BarChart3 size={12}/> View Public Dashboard</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50"><tr>
              <th className="px-3 py-2 text-left text-gray-500 font-medium">Operator</th>
              <th className="px-3 py-2 text-left text-gray-500 font-medium">Period</th>
              <th className="px-3 py-2 text-left text-gray-500 font-medium">Region</th>
              <th className="px-3 py-2 text-right text-gray-500 font-medium">CSR%</th>
              <th className="px-3 py-2 text-right text-gray-500 font-medium">DCR%</th>
              <th className="px-3 py-2 text-right text-gray-500 font-medium">Mbps</th>
              <th className="px-3 py-2 text-right text-gray-500 font-medium">Up%</th>
              <th className="px-3 py-2 text-right text-gray-500 font-medium">Lat</th>
              <th className="px-3 py-2 text-right text-gray-500 font-medium">SMS%</th>
              <th className="px-3 py-2"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2"><span className="font-medium" style={{color: r.operator==='mascom'?'#E21836':r.operator==='btc'?'#0066CC':'#FF6600'}}>{OP_LABELS[r.operator]||r.operator}</span></td>
                  <td className="px-3 py-2 text-gray-500">{r.month} {r.year}</td>
                  <td className="px-3 py-2 text-gray-500">{r.region}</td>
                  <td className="px-3 py-2 text-right">{r.call_success_rate}</td>
                  <td className="px-3 py-2 text-right">{r.dropped_call_rate}</td>
                  <td className="px-3 py-2 text-right">{r.throughput}</td>
                  <td className="px-3 py-2 text-right">{r.uptime}</td>
                  <td className="px-3 py-2 text-right">{r.latency}</td>
                  <td className="px-3 py-2 text-right">{r.sms_delivery}</td>
                  <td className="px-3 py-2"><button onClick={()=>handleDelete(r.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={12}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
