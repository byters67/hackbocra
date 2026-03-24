/**
 * AdminRegistrarsPage — Manage Registrar Accounts
 * Route: /admin/registrars
 *
 * Allows BOCRA admins to create, view, and manage registrar accounts
 * for the .bw Domain Registry Portal. Only admins can create registrar
 * accounts — there is no self-registration for registrars.
 *
 * Security: Protected by AdminLayout (admin role required)
 * Data: profiles table with role='registrar'
 */
import { useState, useEffect } from 'react';
import {
  Globe, Plus, Search, Mail, Phone, Building, Calendar,
  CheckCircle, XCircle, Edit, Trash2, AlertCircle, User,
  Shield, Eye, EyeOff, RefreshCw, ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminRegistrarsPage() {
  const [registrars, setRegistrars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', password: '', full_name: '', organization: '', phone: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Fetch all registrar profiles
  useEffect(() => {
    fetchRegistrars();
  }, []);

  async function fetchRegistrars() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'registrar')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRegistrars(data || []);
    } catch (err) {
      console.error('Failed to fetch registrars:', err);
    }
    setLoading(false);
  }

  // Create a new registrar account
  async function handleCreate(e) {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!createForm.email || !createForm.password || !createForm.full_name || !createForm.organization) {
      setCreateError('Please fill in all required fields.');
      return;
    }
    if (createForm.password.length < 8) {
      setCreateError('Password must be at least 8 characters.');
      return;
    }

    setCreating(true);
    try {
      // Create user via Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: createForm.email,
        password: createForm.password,
        options: { data: { full_name: createForm.full_name } },
      });
      if (authErr) throw authErr;

      // Upsert profile with registrar role
      if (authData.user) {
        const { error: profileErr } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          full_name: createForm.full_name,
          organization: createForm.organization,
          phone: createForm.phone,
          role: 'registrar',
        });
        if (profileErr) throw profileErr;
      }

      setCreateSuccess(`Registrar account created for ${createForm.email}. They will receive a verification email.`);
      setCreateForm({ email: '', password: '', full_name: '', organization: '', phone: '' });
      fetchRegistrars();
    } catch (err) {
      setCreateError(err.message || 'Failed to create registrar account.');
    }
    setCreating(false);
  }

  // Revoke registrar access (set role back to 'operator')
  async function handleRevoke(id, name) {
    if (!confirm(`Revoke registrar access for ${name}? They will lose access to the Registry Portal.`)) return;
    try {
      const { error } = await supabase.from('profiles').update({ role: 'operator' }).eq('id', id);
      if (error) throw error;
      fetchRegistrars();
    } catch (err) {
      console.error('Failed to revoke access:', err);
    }
  }

  const filtered = search
    ? registrars.filter(r => (r.full_name || '').toLowerCase().includes(search.toLowerCase()) || (r.organization || '').toLowerCase().includes(search.toLowerCase()) || (r.email || '').toLowerCase().includes(search.toLowerCase()))
    : registrars;

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-bocra-slate flex items-center gap-2"><Globe size={22} className="text-[#00A6CE]" /> .BW Domain Registrars</h1>
          <p className="text-sm text-gray-400 mt-1">Create and manage registrar accounts for the .BW Registry Portal</p>
        </div>
        <button onClick={() => { setShowCreate(!showCreate); setCreateError(''); setCreateSuccess(''); }}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${showCreate ? 'bg-gray-100 text-gray-600' : 'bg-[#6BBE4E] text-white hover:bg-[#5AAE3E]'}`}>
          {showCreate ? <XCircle size={14} /> : <Plus size={14} />}
          {showCreate ? 'Cancel' : 'Create Registrar'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-bold text-bocra-slate mb-4 flex items-center gap-2"><Shield size={16} className="text-[#00A6CE]" /> New Registrar Account</h2>
          <p className="text-xs text-gray-400 mb-4">This creates a Supabase Auth account with the <span className="font-mono bg-gray-100 px-1 rounded">registrar</span> role. The user will receive a verification email.</p>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Full Name *</label>
                <div className="relative mt-1"><User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input value={createForm.full_name} onChange={e => setCreateForm(f => ({ ...f, full_name: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#00A6CE] outline-none" placeholder="John Moeti" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Organisation *</label>
                <div className="relative mt-1"><Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input value={createForm.organization} onChange={e => setCreateForm(f => ({ ...f, organization: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#00A6CE] outline-none" placeholder="BTC / Mascom / BI / ..." />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Email *</label>
                <div className="relative mt-1"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#00A6CE] outline-none" placeholder="registrar@company.co.bw" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium">Phone</label>
                <div className="relative mt-1"><Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#00A6CE] outline-none" placeholder="+267 ..." />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] text-gray-400 uppercase font-medium">Temporary Password *</label>
                <div className="relative mt-1"><Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input type={showPw ? 'text' : 'password'} value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full pl-9 pr-12 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#00A6CE] outline-none" placeholder="Min 8 characters — registrar should change on first login" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
                <p className="text-[10px] text-gray-300 mt-1">The registrar should change this password on first login.</p>
              </div>
            </div>

            {createError && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"><AlertCircle size={14} className="text-red-500 flex-shrink-0" /><p className="text-xs text-red-600">{createError}</p></div>}
            {createSuccess && <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"><CheckCircle size={14} className="text-green-500 flex-shrink-0" /><p className="text-xs text-green-600">{createSuccess}</p></div>}

            <button type="submit" disabled={creating} className="px-5 py-2.5 bg-[#6BBE4E] text-white text-xs font-bold rounded-xl hover:bg-[#5AAE3E] disabled:opacity-50 flex items-center gap-2">
              {creating ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : <><Plus size={14} /> Create Registrar Account</>}
            </button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-bocra-slate">{registrars.length}</p>
          <p className="text-xs text-gray-400">Total Registrars</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#6BBE4E]">{registrars.filter(r => r.organization).length}</p>
          <p className="text-xs text-gray-400">With Organisation</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-[#00A6CE]">{new Set(registrars.map(r => r.organization).filter(Boolean)).size}</p>
          <p className="text-xs text-gray-400">Organisations</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <a href="/services/register-bw/login" target="_blank" className="text-xs text-[#00A6CE] hover:underline flex items-center gap-1"><ExternalLink size={12} /> Open Registry Portal</a>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search registrars by name, organisation, or email..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#00A6CE] outline-none" />
      </div>

      {/* Registrar list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center"><div className="w-8 h-8 border-4 border-[#00A6CE]/20 border-t-[#00A6CE] rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Globe size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">{registrars.length === 0 ? 'No registrar accounts yet. Click "Create Registrar" to add one.' : 'No registrars match your search.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-[10px] text-gray-400 uppercase font-medium tracking-wide">
              <div className="col-span-4">Registrar</div>
              <div className="col-span-3">Organisation</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-1"></div>
            </div>
            {filtered.map(r => (
              <div key={r.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50 transition-colors group">
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#00A6CE]/10 flex items-center justify-center flex-shrink-0">
                    <Globe size={14} className="text-[#00A6CE]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-bocra-slate truncate">{r.full_name || '—'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{r.email || r.id?.substring(0, 8)}</p>
                  </div>
                </div>
                <div className="col-span-3"><p className="text-xs text-bocra-slate/70 truncate">{r.organization || '—'}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-400">{r.phone || '—'}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-400">{r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p></div>
                <div className="col-span-1 flex justify-end">
                  <button onClick={() => handleRevoke(r.id, r.full_name || r.email)}
                    className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="Revoke registrar access">
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
        <AlertCircle size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-blue-600 leading-relaxed">
          Registrar accounts have access to the .BW Registry Portal at <code className="bg-blue-100 px-1 rounded text-[10px]">/services/register-bw/login</code> where they can register, renew, and transfer .bw domains on behalf of their clients. Revoking access changes their role from <code className="bg-blue-100 px-1 rounded text-[10px]">registrar</code> to <code className="bg-blue-100 px-1 rounded text-[10px]">operator</code>.
        </p>
      </div>
    </div>
  );
}
