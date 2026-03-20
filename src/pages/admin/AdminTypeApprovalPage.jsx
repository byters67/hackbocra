/**
 * Admin — Type Approval Devices Management
 * Staff manage the type approved devices database.
 * Data feeds the public Type Approval Search page.
 */
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Shield, Plus, Trash2, CheckCircle, Search, Edit3, X,
  Download, Smartphone, ChevronDown, AlertCircle, Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CATEGORIES = [
  'Mobile Phone', 'Tablet', 'Router', 'CPE Device', 'Access Point',
  'Two-Way Radio', 'Base Station', 'Satellite Terminal', 'IP Camera',
  'Network Switch', 'POS Terminal', 'IoT Device', 'Vehicle System', 'Solar Inverter', 'Other',
];

const STATUSES = ['approved', 'suspended', 'revoked', 'expired'];
const STATUS_COLORS = {
  approved: 'bg-green-100 text-green-700',
  suspended: 'bg-yellow-100 text-yellow-700',
  revoked: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-600',
};

const EMPTY_FORM = {
  device_name: '', manufacturer: '', model_number: '', category: 'Mobile Phone',
  certificate_number: '', approval_date: new Date().toISOString().split('T')[0],
  status: 'approved', validity: 'Lifetime', frequency_bands: '', test_lab: '',
  applicant: '', description: '', imei_required: false,
};

export default function AdminTypeApprovalPage() {
  const { profile } = useOutletContext();
  const [devices, setDevices] = useState([]);
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
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => { fetchDevices(); }, []);

  async function fetchDevices() {
    const { data, error } = await supabase
      .from('type_approved_devices')
      .select('*')
      .order('approval_date', { ascending: false })
      .limit(200);
    if (data) setDevices(data);
    if (error) console.error('Fetch error:', error);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return devices.filter(d => {
      if (filterCategory && d.category !== filterCategory) return false;
      if (filterStatus && d.status !== filterStatus) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          d.device_name?.toLowerCase().includes(q) ||
          d.manufacturer?.toLowerCase().includes(q) ||
          d.model_number?.toLowerCase().includes(q) ||
          d.certificate_number?.toLowerCase().includes(q) ||
          d.applicant?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [devices, filterCategory, filterStatus, searchTerm]);

  const stats = useMemo(() => ({
    total: devices.length,
    approved: devices.filter(d => d.status === 'approved').length,
    suspended: devices.filter(d => d.status === 'suspended').length,
    categories: [...new Set(devices.map(d => d.category))].length,
  }), [devices]);

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function startEdit(device) {
    setForm({
      device_name: device.device_name || '',
      manufacturer: device.manufacturer || '',
      model_number: device.model_number || '',
      category: device.category || 'Mobile Phone',
      certificate_number: device.certificate_number || '',
      approval_date: device.approval_date || '',
      status: device.status || 'approved',
      validity: device.validity || 'Lifetime',
      frequency_bands: device.frequency_bands || '',
      test_lab: device.test_lab || '',
      applicant: device.applicant || '',
      description: device.description || '',
      imei_required: device.imei_required || false,
    });
    setEditingId(device.id);
    setShowForm(true);
    setError('');
  }

  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.device_name.trim()) { setError('Device name is required'); return; }
    if (!form.manufacturer.trim()) { setError('Manufacturer is required'); return; }
    if (!form.model_number.trim()) { setError('Model number is required'); return; }
    if (!form.certificate_number.trim()) { setError('Certificate number is required'); return; }
    if (!form.approval_date) { setError('Approval date is required'); return; }

    setSaving(true);

    const payload = {
      device_name: form.device_name.trim(),
      manufacturer: form.manufacturer.trim(),
      model_number: form.model_number.trim(),
      category: form.category,
      certificate_number: form.certificate_number.trim(),
      approval_date: form.approval_date,
      status: form.status,
      validity: form.validity,
      frequency_bands: form.frequency_bands.trim() || null,
      test_lab: form.test_lab.trim() || null,
      applicant: form.applicant.trim() || null,
      description: form.description.trim() || null,
      imei_required: form.imei_required,
    };

    if (editingId) {
      const { error: updateErr } = await supabase
        .from('type_approved_devices')
        .update(payload)
        .eq('id', editingId);
      if (updateErr) { setError(updateErr.message); setSaving(false); return; }
      setSuccess('Device updated successfully');
    } else {
      const { error: insertErr } = await supabase
        .from('type_approved_devices')
        .insert(payload);
      if (insertErr) { setError(insertErr.message); setSaving(false); return; }
      setSuccess('Device added — now visible in public Type Approval Search');
    }

    setSaving(false);
    resetForm();
    fetchDevices();
    setTimeout(() => setSuccess(''), 4000);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this device from the type approval database? This cannot be undone.')) return;
    const { error } = await supabase.from('type_approved_devices').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else { fetchDevices(); if (selectedDevice?.id === id) setSelectedDevice(null); }
  }

  async function quickStatusChange(id, newStatus) {
    const { error } = await supabase
      .from('type_approved_devices')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) alert('Error: ' + error.message);
    else {
      fetchDevices();
      if (selectedDevice?.id === id) setSelectedDevice(s => ({ ...s, status: newStatus }));
    }
  }

  function exportCSV() {
    const headers = ['Device Name', 'Manufacturer', 'Model', 'Category', 'Certificate', 'Approval Date', 'Status', 'Validity', 'Frequency Bands', 'Test Lab', 'Applicant', 'IMEI Required'];
    const rows = filtered.map(d => [
      d.device_name, d.manufacturer, d.model_number, d.category, d.certificate_number,
      d.approval_date, d.status, d.validity, d.frequency_bands || '', d.test_lab || '',
      d.applicant || '', d.imei_required ? 'Yes' : 'No'
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `bocra_type_approved_devices_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#00A6CE]/20 border-t-[#00A6CE] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={22} className="text-[#00A6CE]" /> Type Approval Devices
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the equipment type approval database — changes appear instantly on the public search
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] transition-all">
            <Plus size={14} /> {showForm && !editingId ? 'Cancel' : 'Add Device'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400">Total Devices</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#6BBE4E]">{stats.approved}</p>
          <p className="text-xs text-gray-400">Approved</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#F7B731]">{stats.suspended}</p>
          <p className="text-xs text-gray-400">Suspended</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#00A6CE]">{stats.categories}</p>
          <p className="text-xs text-gray-400">Categories</p>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <CheckCircle size={14} /> {success}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">
              {editingId ? 'Edit Device' : 'Add New Device'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Device Name *</label>
                <input value={form.device_name} onChange={e => u('device_name', e.target.value)} required
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="e.g. iPhone 15 Pro Max" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Manufacturer *</label>
                <input value={form.manufacturer} onChange={e => u('manufacturer', e.target.value)} required
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="e.g. Apple Inc." />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Model Number *</label>
                <input value={form.model_number} onChange={e => u('model_number', e.target.value)} required
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="e.g. A3106" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Category *</label>
                <select value={form.category} onChange={e => u('category', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#00458B] outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Certificate Number *</label>
                <input value={form.certificate_number} onChange={e => u('certificate_number', e.target.value)} required
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="BOCRA/TA/2024/XXX" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Approval Date *</label>
                <input type="date" value={form.approval_date} onChange={e => u('approval_date', e.target.value)} required
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Status *</label>
                <select value={form.status} onChange={e => u('status', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#00458B] outline-none">
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Frequency Bands</label>
                <input value={form.frequency_bands} onChange={e => u('frequency_bands', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="e.g. GSM 900/1800, LTE B1/B3/B7" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Test Laboratory</label>
                <input value={form.test_lab} onChange={e => u('test_lab', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="e.g. SGS Korea Co. Ltd" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Applicant</label>
                <input value={form.applicant} onChange={e => u('applicant', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="e.g. Samsung Botswana" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Description</label>
                <input value={form.description} onChange={e => u('description', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none"
                  placeholder="Brief description of the device" />
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-medium">Validity</label>
                  <select value={form.validity} onChange={e => u('validity', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#00458B] outline-none">
                    <option value="Lifetime">Lifetime</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="5 Years">5 Years</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input type="checkbox" checked={form.imei_required} onChange={e => u('imei_required', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#00458B] focus:ring-[#00458B]" />
                  <span className="text-xs text-gray-600">IMEI Required</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-[#6BBE4E] text-white rounded-xl text-sm font-medium hover:bg-[#5AAE3E] disabled:opacity-50 transition-all">
                {saving ? 'Saving...' : editingId ? 'Update Device' : 'Add Device'}
              </button>
              <button type="button" onClick={resetForm}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by device name, manufacturer, model, certificate, or applicant..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00458B]/20 focus:border-[#00458B]" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Devices table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            {filtered.length} Device{filtered.length !== 1 ? 's' : ''}
            {(filterCategory || filterStatus || searchTerm) ? ' (filtered)' : ''}
          </h3>
          <a href="/hackathonteamproject/services/type-approval" target="_blank"
            className="text-xs text-[#00A6CE] hover:underline flex items-center gap-1">
            <Eye size={12} /> View Public Page
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Device</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Manufacturer</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Model</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Category</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Certificate</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Date</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Status</th>
                <th className="px-3 py-2 text-right text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No devices found.
                  </td>
                </tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <span className="font-medium text-gray-900">{d.device_name}</span>
                    {d.imei_required && <span className="ml-1 text-[8px] bg-blue-50 text-blue-600 px-1 rounded">IMEI</span>}
                  </td>
                  <td className="px-3 py-2 text-gray-500">{d.manufacturer}</td>
                  <td className="px-3 py-2 text-gray-500 font-mono text-[10px]">{d.model_number}</td>
                  <td className="px-3 py-2">
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded">{d.category}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-[#00A6CE] text-[10px]">{d.certificate_number}</td>
                  <td className="px-3 py-2 text-gray-400">{new Date(d.approval_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-3 py-2">
                    <select value={d.status} onChange={e => quickStatusChange(d.id, e.target.value)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-0 cursor-pointer ${STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(d)} className="p-1 text-gray-400 hover:text-[#00458B] rounded" title="Edit">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="p-1 text-gray-300 hover:text-red-500 rounded" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
