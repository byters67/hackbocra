/**
 * RegistryPortalPage — Functional .bw ccTLD Registry Portal
 * Route: /services/register-bw/login
 *
 * Login-only portal for BOCRA-accredited registrars.
 * NO self-registration — accounts created by admins at /admin/registrars.
 * Uses existing Supabase auth with role='registrar' in profiles table.
 *
 * Views: landing → login → dashboard (domain management)
 * i18n: Fully bilingual EN/TN
 */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, Lock, Mail, Eye, EyeOff, Shield, Search, Plus,
  ExternalLink, AlertCircle, RefreshCw, Phone, CheckCircle,
  XCircle, ArrowRight, LogOut, Edit, ArrowLeftRight,
  Calendar, Building, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../lib/language';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

/* ═══════════════════════════════════════════════════
 * MOCK DOMAIN DATA
 * In production: Supabase `domains` table with RLS
 * ═══════════════════════════════════════════════════ */
const EXTENSIONS = ['.co.bw', '.org.bw', '.net.bw', '.ac.bw', '.gov.bw', '.me.bw'];
const TAKEN = ['google.co.bw', 'bocra.org.bw', 'btc.co.bw', 'mascom.co.bw', 'orange.co.bw'];

const generateMockDomains = (userId) => {
  if (!userId) return [];
  return [
    { id: 1, domain: 'techsolutions.co.bw', status: 'active', registered: '2024-03-15', expires: '2026-03-15', nameservers: ['ns1.btc.bw', 'ns2.btc.bw'], client: 'Tech Solutions (Pty) Ltd' },
    { id: 2, domain: 'gabeducation.ac.bw', status: 'active', registered: '2023-11-01', expires: '2025-11-01', nameservers: ['ns1.mascom.bw', 'ns2.mascom.bw'], client: 'Gaborone Education Trust' },
    { id: 3, domain: 'kalahari-tours.co.bw', status: 'expiring', registered: '2024-06-20', expires: '2026-04-20', nameservers: ['ns1.orange.co.bw', 'ns2.orange.co.bw'], client: 'Kalahari Tours & Safaris' },
    { id: 4, domain: 'bwhealth.org.bw', status: 'active', registered: '2025-01-10', expires: '2027-01-10', nameservers: ['ns1.btc.bw', 'ns2.btc.bw'], client: 'Botswana Health Foundation' },
    { id: 5, domain: 'makgadikgadi.me.bw', status: 'expired', registered: '2023-02-14', expires: '2025-02-14', nameservers: ['ns1.bbi.co.bw', 'ns2.bbi.co.bw'], client: 'Thabo Makgadikgadi' },
  ];
};

const STATUS_STYLES = {
  active: { bg: 'bg-green-50', text: 'text-green-700', label: 'Active', labelTn: 'E Bereka' },
  expiring: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Expiring Soon', labelTn: 'E Felela Gaufi' },
  expired: { bg: 'bg-red-50', text: 'text-red-700', label: 'Expired', labelTn: 'E Fedile' },
  pending: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Pending', labelTn: 'E Emetse' },
};

/* ═══════════════════════════════════════════════════
 * LOGIN FORM (no registration — admin-created accounts only)
 * ═══════════════════════════════════════════════════ */
function LoginForm({ setView, signIn }) {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError(tn ? 'Tlatsa mafelo otlhe' : 'Fill in all fields'); return; }
    setLoading(true);
    try {
      const { error: err } = await signIn({ email, password });
      if (err) throw err;
    } catch (err) {
      setError(err.message || (tn ? 'Go tsena go paletswe' : 'Sign in failed'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00458B] via-[#003366] to-[#001a33] relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#00A6CE]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#6BBE4E]/8 rounded-full blur-3xl" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><Globe size={28} className="text-[#00A6CE]" /></div>
          <h1 className="text-2xl font-bold text-white">{tn ? 'Rejisetheri ya .BW' : '.BW Registry Portal'}</h1>
          <p className="text-sm text-white/40 mt-2">{tn ? 'Tsena go laola mafelo a .bw' : 'Sign in to manage .bw domains'}</p>
        </div>
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
          {/* Registrar notice */}
          <div className="flex items-start gap-3 p-3 bg-[#00A6CE]/5 border border-[#00A6CE]/10 rounded-xl mb-6">
            <Shield size={16} className="text-[#00A6CE] mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-white/50 leading-relaxed">
              {tn ? 'Potala eno ke ya bakwadisi ba ba amogeletsweng ke BOCRA fela. Di-akhaonto di dirwa ke botsamaisi jwa BOCRA morago ga tumelelo ya go amogelwa.' : 'This portal is for BOCRA-accredited registrars only. Accounts are created by BOCRA administration after accreditation approval.'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">{tn ? 'Imeile' : 'Email'}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={tn ? 'imeile@khamphani.co.bw' : 'email@company.co.bw'}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:border-[#00A6CE]/50 focus:ring-2 focus:ring-[#00A6CE]/10 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">{tn ? 'Lefoko la Sephiri' : 'Password'}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:border-[#00A6CE]/50 focus:ring-2 focus:ring-[#00A6CE]/10 outline-none transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50"><Eye size={16} /></button>
              </div>
            </div>
            {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"><AlertCircle size={14} className="text-red-400 flex-shrink-0" /><p className="text-xs text-red-300">{error}</p></div>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#00A6CE] hover:bg-[#0090b5] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {tn ? 'E a tsena...' : 'Signing in...'}</> : <><Lock size={14} /> {tn ? 'Tsena' : 'Sign In'}</>}
            </button>
          </form>
          <div className="mt-5 pt-5 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/20">{tn ? 'Ga o na akhaonto? Ikgolaganye le BOCRA go dira kopo ya go amogelwa e le mokwadisi.' : "Don't have an account? Contact BOCRA to apply for registrar accreditation."}</p>
            <Link to="/services/register-bw" className="text-[10px] text-[#00A6CE]/60 hover:text-[#00A6CE] mt-1 inline-block">{tn ? 'Bona ditlhokego tsa go amogelwa' : 'View accreditation requirements'} →</Link>
          </div>
        </div>
        <div className="mt-6 text-center"><button onClick={() => setView('landing')} className="text-white/30 text-xs hover:text-white/60 transition-colors">← {tn ? 'Morago' : 'Back'}</button></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
 * ACCESS DENIED — logged in but not a registrar
 * ═══════════════════════════════════════════════════ */
function AccessDenied({ signOut }) {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00458B] to-[#003366] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md text-center">
        <Shield size={48} className="text-[#F7B731] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-bocra-slate mb-2">{tn ? 'Phitlhelelo e Gannwe' : 'Access Denied'}</h2>
        <p className="text-sm text-bocra-slate/50 mb-2">{tn ? 'Akhaonto ya gago ga e na phitlhelelo ya mokwadisi.' : 'Your account does not have registrar access.'}</p>
        <p className="text-xs text-bocra-slate/40 mb-6">{tn ? 'Potala eno ke ya bakwadisi ba ba amogeletsweng ke BOCRA fela. Ikgolaganye le BOCRA go dira kopo ya go amogelwa.' : 'This portal is for BOCRA-accredited registrars only. Contact BOCRA to apply for accreditation.'}</p>
        <div className="flex gap-3 justify-center">
          <Link to="/services/register-bw" className="px-5 py-2.5 bg-[#00A6CE] text-white text-xs font-bold rounded-xl hover:bg-[#0090b5]">{tn ? 'Bona Ditlhokego' : 'View Requirements'}</Link>
          <button onClick={signOut} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50">{tn ? 'Tswa' : 'Sign Out'}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
 * REGISTRY DASHBOARD — domain management
 * ═══════════════════════════════════════════════════ */
function RegistryDashboard({ profile, user, signOut }) {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const [activeTab, setActiveTab] = useState('portfolio');
  const [searchQuery, setSearchQuery] = useState('');
  const [domainSearch, setDomainSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [regForm, setRegForm] = useState({ domain: '', extension: '.co.bw', client: '', ns1: '', ns2: '', years: 1 });

  const domains = useMemo(() => generateMockDomains(user?.id), [user?.id]);
  const name = profile?.full_name || user?.email || 'Registrar';
  const org = profile?.organization || '';
  const ini = name.charAt(0).toUpperCase();

  const filteredDomains = searchQuery ? domains.filter(d => d.domain.toLowerCase().includes(searchQuery.toLowerCase()) || d.client.toLowerCase().includes(searchQuery.toLowerCase())) : domains;

  const stats = { total: domains.length, active: domains.filter(d => d.status === 'active').length, expiring: domains.filter(d => d.status === 'expiring').length, expired: domains.filter(d => d.status === 'expired').length };

  const handleDomainCheck = () => {
    if (!domainSearch.trim()) return;
    const clean = domainSearch.toLowerCase().replace(/\s/g, '');
    const hasExt = EXTENSIONS.some(e => clean.endsWith(e));
    const full = hasExt ? clean : clean + '.co.bw';
    const taken = domains.some(d => d.domain === full) || TAKEN.includes(full);
    setSearchResult({ domain: full, available: !taken });
  };

  const handleRegisterDomain = () => {
    const full = regForm.domain.toLowerCase().replace(/\s/g, '') + regForm.extension;
    alert(tn ? `Lefelo ${full} le kwadisitswe ka ${regForm.client}! (Demo)` : `Domain ${full} registered for ${regForm.client}! (Demo — production saves to Supabase)`);
    setShowRegForm(false);
    setRegForm({ domain: '', extension: '.co.bw', client: '', ns1: '', ns2: '', years: 1 });
  };

  return (
    <div className="bg-bocra-off-white">
      {/* Top bar */}
      <div className="bg-[#00458B] text-white"><div className="section-wrapper py-3 flex items-center justify-between">
        <div className="flex items-center gap-3"><Globe size={18} className="text-[#00A6CE]" /><span className="text-sm font-bold">{tn ? 'Rejisetheri ya .BW' : '.BW Registry'}</span><span className="text-xs text-white/40 hidden sm:inline">{tn ? 'Potala ya Mokwadisi' : 'Registrar Portal'}</span></div>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#00A6CE] flex items-center justify-center text-white text-xs font-bold">{ini}</div>
          <div className="hidden sm:block"><span className="text-xs text-white/60">{name}</span>{org && <span className="text-[10px] text-white/30 ml-2">{org}</span>}</div>
          <span className="text-[9px] bg-[#6BBE4E]/20 text-[#6BBE4E] px-2 py-0.5 rounded font-bold uppercase hidden sm:inline">registrar</span>
          <button onClick={signOut} className="text-xs text-white/40 hover:text-white flex items-center gap-1"><LogOut size={12} /> {tn ? 'Tswa' : 'Sign Out'}</button>
        </div>
      </div></div>

      <div className="section-wrapper py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { n: stats.total, l: tn ? 'Mafelo Otlhe' : 'Total Domains', c: 'text-bocra-slate' },
            { n: stats.active, l: tn ? 'A a Berekang' : 'Active', c: 'text-[#6BBE4E]' },
            { n: stats.expiring, l: tn ? 'A a Felelang' : 'Expiring', c: 'text-[#F7B731]' },
            { n: stats.expired, l: tn ? 'A a Fedileng' : 'Expired', c: 'text-red-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4"><p className={`text-2xl font-bold ${s.c}`}>{s.n}</p><p className="text-xs text-gray-400">{s.l}</p></div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[['portfolio', tn ? 'Mafelo a Me' : 'My Domains'], ['register', tn ? 'Kwadisa' : 'Register'], ['search', tn ? 'Batla WHOIS' : 'WHOIS Lookup']].map(([k, v]) => (
            <button key={k} onClick={() => setActiveTab(k)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === k ? 'bg-[#00458B] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>{v}</button>
          ))}
        </div>

        {/* ── Portfolio ── */}
        {activeTab === 'portfolio' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-bold text-bocra-slate">{tn ? 'Polotfolio ya Mafelo' : 'Domain Portfolio'}</h2>
              <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={tn ? 'Batla mafelo...' : 'Search domains...'} className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs w-64 focus:border-[#00A6CE] outline-none" />
              </div>
            </div>
            {filteredDomains.length === 0 ? (
              <div className="py-12 text-center"><Globe size={32} className="text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">{tn ? 'Ga go na mafelo a a bonweng' : 'No domains found'}</p></div>
            ) : (
              <div className="space-y-2">
                {filteredDomains.map(d => { const s = STATUS_STYLES[d.status] || STATUS_STYLES.active; return (
                  <div key={d.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[#00A6CE]/10 flex items-center justify-center flex-shrink-0"><Globe size={18} className="text-[#00A6CE]" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><p className="text-sm font-bold text-bocra-slate">{d.domain}</p><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{tn ? s.labelTn : s.label}</span></div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap"><span className="text-[10px] text-gray-400 flex items-center gap-1"><Building size={10} /> {d.client}</span><span className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={10} /> {tn ? 'E fela' : 'Expires'}: {d.expires}</span></div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-[#00A6CE] rounded-lg hover:bg-[#00A6CE]/5" title={tn ? 'Ntšhwafatsa' : 'Renew'}><RefreshCw size={13} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-[#F7B731] rounded-lg hover:bg-[#F7B731]/5" title={tn ? 'Fetolela' : 'Transfer'}><ArrowLeftRight size={13} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-bocra-slate rounded-lg hover:bg-gray-100" title={tn ? 'Fetola' : 'Edit'}><Edit size={13} /></button>
                    </div>
                  </div>
                ); })}
              </div>
            )}
          </div>
        )}

        {/* ── Register ── */}
        {activeTab === 'register' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-bocra-slate mb-4">{tn ? 'Kwadisa Lefelo le Lesha' : 'Register New Domain'}</h2>
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1"><Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input value={domainSearch} onChange={e => setDomainSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDomainCheck()} placeholder={tn ? 'Tsenya leina la lefelo...' : 'Enter domain name...'} className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00A6CE] outline-none" />
              </div>
              <button onClick={handleDomainCheck} className="px-5 py-3 bg-[#00A6CE] text-white text-xs font-bold rounded-xl hover:bg-[#0090b5]">{tn ? 'Tlhola' : 'Check'}</button>
            </div>
            {searchResult && (
              <div className={`p-4 rounded-xl mb-6 ${searchResult.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">{searchResult.available ? <CheckCircle size={16} className="text-green-600" /> : <XCircle size={16} className="text-red-600" />}<p className="text-sm font-bold" style={{ color: searchResult.available ? '#059669' : '#DC2626' }}>{searchResult.domain}</p></div>
                <p className="text-xs mt-1" style={{ color: searchResult.available ? '#059669' : '#DC2626' }}>{searchResult.available ? (tn ? 'Lefelo leno le a bonala!' : 'This domain is available!') : (tn ? 'Lefelo leno le setse le tseilwe.' : 'This domain is already taken.')}</p>
                {searchResult.available && <button onClick={() => { setShowRegForm(true); setRegForm(f => ({ ...f, domain: searchResult.domain.split('.')[0] })); }} className="mt-3 px-4 py-2 bg-[#6BBE4E] text-white text-xs font-bold rounded-lg hover:bg-[#5AAE3E]">{tn ? 'Kwadisa Lefelo Leno' : 'Register This Domain'} →</button>}
              </div>
            )}
            {showRegForm && (
              <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-bocra-slate uppercase tracking-wide">{tn ? 'Dintlha tsa Kwadiso' : 'Registration Details'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-[10px] text-gray-400 uppercase font-medium">{tn ? 'Leina la Lefelo' : 'Domain Name'}</label><div className="flex mt-1"><input value={regForm.domain} onChange={e => setRegForm(f => ({ ...f, domain: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-200 rounded-l-lg text-sm" /><select value={regForm.extension} onChange={e => setRegForm(f => ({ ...f, extension: e.target.value }))} className="px-2 py-2 border border-l-0 border-gray-200 rounded-r-lg text-xs bg-gray-50">{EXTENSIONS.map(e => <option key={e} value={e}>{e}</option>)}</select></div></div>
                  <div><label className="text-[10px] text-gray-400 uppercase font-medium">{tn ? 'Leina la Moreki' : 'Client Name'}</label><input value={regForm.client} onChange={e => setRegForm(f => ({ ...f, client: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Company (Pty) Ltd" /></div>
                  <div><label className="text-[10px] text-gray-400 uppercase font-medium">Primary NS</label><input value={regForm.ns1} onChange={e => setRegForm(f => ({ ...f, ns1: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="ns1.provider.bw" /></div>
                  <div><label className="text-[10px] text-gray-400 uppercase font-medium">Secondary NS</label><input value={regForm.ns2} onChange={e => setRegForm(f => ({ ...f, ns2: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="ns2.provider.bw" /></div>
                  <div><label className="text-[10px] text-gray-400 uppercase font-medium">{tn ? 'Dingwaga' : 'Period'}</label><select value={regForm.years} onChange={e => setRegForm(f => ({ ...f, years: parseInt(e.target.value) }))} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value={1}>1 {tn ? 'Ngwaga' : 'Year'}</option><option value={2}>2 {tn ? 'Dingwaga' : 'Years'}</option><option value={3}>3 {tn ? 'Dingwaga' : 'Years'}</option><option value={5}>5 {tn ? 'Dingwaga' : 'Years'}</option></select></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleRegisterDomain} className="px-5 py-2.5 bg-[#6BBE4E] text-white text-xs font-bold rounded-xl hover:bg-[#5AAE3E]">{tn ? 'Kwadisa Lefelo' : 'Register Domain'}</button>
                  <button onClick={() => setShowRegForm(false)} className="px-5 py-2.5 text-gray-500 text-xs border border-gray-200 rounded-xl hover:bg-gray-50">{tn ? 'Khansela' : 'Cancel'}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── WHOIS Lookup ── */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-bocra-slate mb-1">{tn ? 'Batla WHOIS' : 'WHOIS Lookup'}</h2>
            <p className="text-xs text-gray-400 mb-4">{tn ? 'Batla lefelo lefe kgotsa lefe la .bw go bona tshedimosetso' : 'Look up any .bw domain to view registration info'}</p>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" /><input value={domainSearch} onChange={e => setDomainSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDomainCheck()} placeholder="example.co.bw" className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00A6CE] outline-none" /></div>
              <button onClick={handleDomainCheck} className="px-5 py-3 bg-[#00458B] text-white text-xs font-bold rounded-xl hover:bg-[#003366]">{tn ? 'Batla' : 'Lookup'}</button>
            </div>
            {searchResult && !searchResult.available && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100"><p className="text-sm font-bold text-bocra-slate mb-3">{searchResult.domain}</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><p className="text-gray-400">{tn ? 'Maemo' : 'Status'}</p><p className="font-medium text-green-600">{tn ? 'E Kwadisitswe' : 'Registered'}</p></div>
                  <div><p className="text-gray-400">{tn ? 'Mokwadisi' : 'Registrar'}</p><p className="font-medium text-bocra-slate">BOCRA-Accredited</p></div>
                  <div><p className="text-gray-400">Name Servers</p><p className="font-medium text-bocra-slate">ns1.nic.net.bw, ns2.nic.net.bw</p></div>
                  <div><p className="text-gray-400">{tn ? 'E Fetotswe' : 'Last Updated'}</p><p className="font-medium text-bocra-slate">2025-01-15</p></div>
                </div>
              </div>
            )}
            {searchResult && searchResult.available && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200"><div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-600" /><p className="text-sm font-bold text-green-700">{searchResult.domain}</p></div><p className="text-xs text-green-600 mt-1">{tn ? 'Lefelo leno ga le a kwadisiwa — le a bonala!' : 'This domain is not registered — it is available!'}</p></div>
            )}
          </div>
        )}

        {/* Help */}
        <div className="mt-6 p-4 bg-white rounded-xl text-center border border-gray-200"><p className="text-xs text-gray-400">{tn ? 'Tshegetso ya Rejisetheri:' : 'Registry Support:'} <a href="mailto:registry@bocra.org.bw" className="text-[#00458B] font-medium">registry@bocra.org.bw</a> {tn ? 'kgotsa' : 'or'} <a href="tel:+2673957755" className="text-[#00458B] font-medium">+267 395 7755</a></p></div>
      </div>
      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
 * LANDING (not logged in)
 * ═══════════════════════════════════════════════════ */
function RegistryLanding({ setView, tn }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00458B] via-[#003366] to-[#001a33] relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#00A6CE]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#6BBE4E]/8 rounded-full blur-3xl" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="text-center max-w-lg">
          <div className="flex items-center justify-center gap-2 mb-6">{['#00A6CE', '#C8237B', '#F7B731', '#6BBE4E'].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />)}</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">{tn ? 'Rejisetheri ya .BW' : '.BW Domain Registry'}</h1>
          <p className="text-sm text-white/40 mb-8 leading-relaxed">{tn ? 'Potala ya semmuso ya go laola mafelo a .bw ya Botswana. Bakeng sa bakwadisi ba ba amogeletsweng ke BOCRA fela.' : 'Official portal for managing Botswana .bw domain names. For BOCRA-accredited registrars only.'}</p>
          <button onClick={() => setView('login')} className="px-8 py-3 bg-[#00A6CE] hover:bg-[#0090b5] text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 mx-auto"><Lock size={16} /> {tn ? 'Tsena mo Potala' : 'Sign In to Portal'}</button>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mt-10">
            {[
              { icon: Globe, title: tn ? 'Laola Mafelo' : 'Manage Domains', desc: tn ? 'Kwadisa, ntšhwafatsa, fetolela mafelo a .bw' : 'Register, renew, transfer .bw domains', color: '#00A6CE' },
              { icon: Search, title: tn ? 'Batla WHOIS' : 'WHOIS Lookup', desc: tn ? 'Tlhola maemo a lefelo lefe kgotsa lefe' : 'Check status of any .bw domain', color: '#6BBE4E' },
              { icon: Shield, title: tn ? 'Potala e Sireleditsweng' : 'Secure Portal', desc: tn ? 'RLS, CSP, le go tsena go go sireleditsweng' : 'Protected with RLS, CSP, and secure auth', color: '#F7B731' },
            ].map(f => <div key={f.title} className="bg-white/[0.03] border border-white/5 rounded-xl p-4"><f.icon size={20} style={{ color: f.color }} className="mb-2" /><p className="text-xs font-bold text-white mb-0.5">{f.title}</p><p className="text-[10px] text-white/30">{f.desc}</p></div>)}
          </div>
        </div>
        <div className="mt-10 text-center"><Link to="/services/register-bw" className="text-white/30 text-xs hover:text-white/60 transition-colors"><Globe size={12} className="inline mr-1" />{tn ? 'O batla go kwadisa lefelo la .bw? Etela tsebe ya setšhaba' : 'Want to register a .bw domain? Visit the public page'}</Link></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
 * MAIN — view router
 * ═══════════════════════════════════════════════════ */
export default function RegistryPortalPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const { user, signIn, signOut } = useAuth();
  const [view, setView] = useState('landing');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (user) {
      setLoading(true);
      (async () => {
        try {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (error) throw error;
          if (!cancelled && data) {
            setProfile(data);
            // Only grant access if role is registrar or admin
            if (data.role === 'registrar' || data.role === 'admin') {
              setView('dashboard');
            } else {
              setView('denied');
            }
          }
        } catch (err) {
          console.error('Failed to fetch registrar profile:', err);
        }
        if (!cancelled) setLoading(false);
      })();
    }
    return () => { cancelled = true; };
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#00458B] to-[#003366] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00A6CE]/30 border-t-[#00A6CE] rounded-full animate-spin" />
    </div>
  );
  if (view === 'login') return <LoginForm setView={setView} signIn={signIn} />;
  if (view === 'denied') return <AccessDenied signOut={signOut} />;
  if (view === 'dashboard' && user) return <RegistryDashboard profile={profile} user={user} signOut={signOut} />;
  return <RegistryLanding setView={setView} tn={tn} />;
}
