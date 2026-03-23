/**
 * ASMS-WebCP Operator Portal — Registration + Login + Dashboard
 * Rebuild of registration.bocra.org.bw
 * Companies register, get a customer number, login to track licences.
 */
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Building, User, Mail, Phone, MapPin, Lock,
  Shield, FileCheck, Clock, CheckCircle, Eye, EyeOff, LogOut,
  CreditCard, Radio, ArrowRight, AlertCircle, Globe, ChevronDown
} from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useScrollReveal } from '../../hooks/useAnimations';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useRecaptcha } from '../../hooks/useRecaptcha';
import { useLanguage } from '../../lib/language';
import { Helmet } from 'react-helmet-async';

// Reuse licence data for company search
const KNOWN_COMPANIES = [
  { company: 'Mascom Wireless Botswana (Pty) Ltd', customer: 'BOCRA-2018-0001', licences: ['NFP 01-18/19', 'SAP 01-18/19'] },
  { company: 'Orange Botswana (Pty) Ltd', customer: 'BOCRA-2018-0002', licences: ['NFP 02-18/19', 'SAP 02-18/19'] },
  { company: 'Botswana Telecommunications Corporation Ltd (BTC)', customer: 'BOCRA-2018-0003', licences: ['NFP 03-18/19', 'SAP 03-18/19'] },
  { company: 'Botswana Fibre Networks (BoFiNet)', customer: 'BOCRA-2019-0004', licences: ['NFP2019/041', 'SAP2019/079'] },
  { company: 'Liquid Telecom', customer: 'BOCRA-2018-0005', licences: ['NFP2018/036', 'SAP2018/062'] },
  { company: 'MTN Business Solutions', customer: 'BOCRA-2017-0006', licences: ['NFP2017/010', 'SAP2017/016'] },
  { company: 'Paratus Telecom (Pty) Ltd', customer: 'BOCRA-2017-0007', licences: ['NFP2017/017', 'SAP2017/031'] },
  { company: 'Botswana Post Services Limited', customer: 'BOCRA-2016-0008', licences: ['DPO 01-16/17', 'SAP2017/042'] },
  { company: 'Multichoice Botswana', customer: 'BOCRA-2017-0009', licences: ['SMS 02-17/18'] },
  { company: 'Yarona FM', customer: 'BOCRA-2007-0010', licences: ['RBL 001/07'] },
  { company: 'Gabz FM', customer: 'BOCRA-2007-0011', licences: ['RBL 002/07'] },
  { company: 'Duma FM', customer: 'BOCRA-2007-0012', licences: ['RBL 003/07'] },
  { company: 'Jenny Internet', customer: 'BOCRA-2017-0013', licences: ['NFP2017/027', 'SAP2017/046'] },
  { company: 'GigaNet (Pty) Ltd', customer: 'BOCRA-2019-0014', licences: ['NFP2019/039', 'SAP2019/074'] },
  { company: 'DHL International Botswana', customer: 'BOCRA-2018-0015', licences: ['CPO 03-13/14'] },
  { company: 'FedEx Express Botswana', customer: 'BOCRA-2018-0016', licences: ['CPO 04-13/14'] },
  { company: 'Aramex Botswana (Pty) Ltd', customer: 'BOCRA-2018-0017', licences: ['CPO 11-14/15'] },
  { company: 'StarTimes Satellite', customer: 'BOCRA-2017-0018', licences: ['SMS 01-16/17'] },
  { company: 'Click Connect (Pty) Ltd', customer: 'BOCRA-2015-0019', licences: ['NFP2015/001', 'SAP2015/001'] },
  { company: 'Ngami.Net (Pty) Ltd', customer: 'BOCRA-2017-0020', licences: ['NFP2017/011', 'SAP2017/018'] },
];

const ID_TYPES = [
  { value: 'omang', label: 'Omang (National ID)' },
  { value: 'passport', label: 'Passport' },
  { value: 'company_reg', label: 'Company Registration' },
];

export default function OperatorPortalPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const [view, setView] = useState('landing'); // landing, register, login, dashboard
  const { user, signIn, signUp, signOut } = useAuth();
  const [operator, setOperator] = useState(null);
  const navigate = useNavigate();
  const heroRef = useScrollReveal();

  // Check if user is already logged in — fetch profile and go to dashboard
  useEffect(() => {
    let cancelled = false;
    if (user) {
      (async () => {
        try {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (error) throw error;
          if (!cancelled && data) {
            setOperator(data);
            setView('dashboard');
          }
        } catch (err) {
          console.error('Failed to fetch operator profile:', err);
        }
      })();
    }
    return () => { cancelled = true; };
  }, [user]);

  if (view === 'register') return <RegisterForm setView={setView} signUp={signUp} />;
  if (view === 'login') return <LoginForm setView={setView} signIn={signIn} />;
  if (view === 'dashboard') return <OperatorDashboard operator={operator} user={user} signOut={signOut} setView={setView} />;

  // Landing
  return (
    <div className="bg-white">
      <Helmet>
        <title>Operator Portal — BOCRA</title>
        <meta name="description" content="BOCRA operator portal for licensed telecommunications service providers." />
        <link rel="canonical" href="https://bocra.org.bw/services/asms-webcp" />
      </Helmet>
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><Breadcrumb items={[{ label: tn ? 'Ditirelo' : 'Services' }, { label: tn ? 'Potlolo ya Batsholetsi' : 'Operator Portal' }]} /></div></div>

      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0"><div className="relative py-10 sm:py-14 px-5 sm:px-8 lg:px-10 rounded-2xl overflow-hidden bg-gradient-to-br from-[#00458B] to-[#003366]">
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div ref={heroRef} className="relative max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3"><Radio size={16} className="text-[#00A6CE]" /><span className="text-xs text-[#00A6CE] uppercase tracking-widest font-medium">ASMS-WebCP</span></div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{tn ? 'Potlolo ya Tsamaiso ya Sepeketeramo' : 'Spectrum Management Portal'}</h1>
          <p className="text-white/60 mt-3 text-sm sm:text-base max-w-xl mx-auto">{tn ? 'Kwadisa khamphani ya gago, laola dilaesense tsa maikutlo a redio, o dirisane le tsamaiso ya sepeketeramo ya BOCRA.' : 'Register your company, manage radio frequency licences, and interact with BOCRA\'s spectrum management system.'}</p>
        </div>
      </div></section>

      <section className="py-10"><div className="section-wrapper max-w-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user ? (
            <>
              <button onClick={() => setView('dashboard')} className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#6BBE4E] hover:shadow-lg transition-all text-left group">
                <div className="w-14 h-14 rounded-xl bg-[#6BBE4E]/10 flex items-center justify-center mb-4"><ArrowRight size={24} className="text-[#6BBE4E]" /></div>
                <h2 className="text-lg font-bold text-bocra-slate group-hover:text-[#6BBE4E]">{tn ? 'Ya ko Potlolong' : 'Go to Portal'}</h2>
                <p className="text-sm text-bocra-slate/50 mt-2">{tn ? `O tsene ka ${user.email}. Fitlhelela dashboard ya gago, laola dilaesense, le go latela dikopo.` : `Signed in as ${user.email}. Access your dashboard, manage licences, and track applications.`}</p>
                <span className="text-sm text-[#6BBE4E] font-medium flex items-center gap-1 mt-4">{tn ? 'Tsena mo Dashboard' : 'Enter Dashboard'} <ArrowRight size={14} /></span>
              </button>
              <button onClick={() => setView('register')} className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#00458B] hover:shadow-lg transition-all text-left group">
                <div className="w-14 h-14 rounded-xl bg-[#00458B]/10 flex items-center justify-center mb-4"><User size={24} className="text-[#00458B]" /></div>
                <h2 className="text-lg font-bold text-bocra-slate group-hover:text-[#00458B]">{tn ? 'Kwadisa Khamphani e Ntšhwa' : 'Register New Company'}</h2>
                <p className="text-sm text-bocra-slate/50 mt-2">{tn ? 'Kwadisa khamphani e sele go dira kopo ya dilaesense tsa megala ya redio le sepeketeramo.' : 'Register a different company to apply for radio communications and spectrum licences.'}</p>
                <span className="text-sm text-[#00458B] font-medium flex items-center gap-1 mt-4">{tn ? 'Kwadisa' : 'Register'} <ArrowRight size={14} /></span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setView('login')} className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#00458B] hover:shadow-lg transition-all text-left group">
                <div className="w-14 h-14 rounded-xl bg-[#00458B]/10 flex items-center justify-center mb-4"><Lock size={24} className="text-[#00458B]" /></div>
                <h2 className="text-lg font-bold text-bocra-slate group-hover:text-[#00458B]">{tn ? 'Tsena' : 'Sign In'}</h2>
                <p className="text-sm text-bocra-slate/50 mt-2">{tn ? 'O setse o kwadisitswe? Tsena mo akhaontong ya gago ya motsholetsi go laola dilaesense le dikopo.' : 'Already registered? Sign in to your operator account to manage licences and applications.'}</p>
                <span className="text-sm text-[#00A6CE] font-medium flex items-center gap-1 mt-4">{tn ? 'Tsena' : 'Sign In'} <ArrowRight size={14} /></span>
              </button>
              <button onClick={() => setView('register')} className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#6BBE4E] hover:shadow-lg transition-all text-left group">
                <div className="w-14 h-14 rounded-xl bg-[#6BBE4E]/10 flex items-center justify-center mb-4"><User size={24} className="text-[#6BBE4E]" /></div>
                <h2 className="text-lg font-bold text-bocra-slate group-hover:text-[#6BBE4E]">{tn ? 'Bula Akhaonto' : 'Create Account'}</h2>
                <p className="text-sm text-bocra-slate/50 mt-2">{tn ? 'O mošwa mo BOCRA? Kwadisa khamphani ya gago go dira kopo ya dilaesense tsa megala ya redio le sepeketeramo.' : 'New to BOCRA? Register your company to apply for radio communications and spectrum licences.'}</p>
                <span className="text-sm text-[#6BBE4E] font-medium flex items-center gap-1 mt-4">{tn ? 'Kwadisa' : 'Register'} <ArrowRight size={14} /></span>
              </button>
            </>
          )}
        </div>

        {/* Company search */}
        <div className="mt-8"><CompanySearch /></div>
      </div></section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}

function CompanySearch() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    if (!q.trim() || q.length < 2) return [];
    const w = q.toLowerCase();
    return KNOWN_COMPANIES.filter(c => c.company.toLowerCase().includes(w) || c.customer.toLowerCase().includes(w));
  }, [q]);

  return (
    <div className="bg-bocra-off-white rounded-2xl p-6">
      <h3 className="text-sm font-bold text-bocra-slate mb-1">{tn ? 'Batla Moreki yo o Leng Teng' : 'Existing Customer Search'}</h3>
      <p className="text-xs text-bocra-slate/40 mb-4">{tn ? 'Batla ka leina la khamphani kgotsa nomoro ya moreki go tlhola maemo a kwadiso' : 'Search by company name or customer number to check registration status'}</p>
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder={tn ? 'Leina la khamphani kgotsa nomoro ya moreki...' : 'Company name or customer number...'}
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:border-[#00458B] outline-none" />
      </div>
      {results.length > 0 && (
        <div className="mt-3 space-y-2">
          {results.map(c => (
            <div key={c.customer} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-bocra-slate">{c.company}</p>
                  <p className="text-xs font-mono text-[#00A6CE] mt-0.5">{c.customer}</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">{tn ? 'E Kwadisitswe' : 'Registered'}</span>
              </div>
              <div className="flex gap-1.5 mt-2">
                {c.licences.map(l => (
                  <span key={l} className="text-[9px] px-2 py-0.5 bg-[#00458B]/5 text-[#00458B] rounded-full font-mono">{l}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {q.length >= 2 && results.length === 0 && (
        <p className="text-xs text-gray-400 mt-3 text-center">{tn ? `Ga go na khamphani e e kwadisitsweng e e bonweng ya "${q}"` : `No registered company found for "${q}"`}</p>
      )}
    </div>
  );
}

function RegisterForm({ setView, signUp }) {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const [form, setForm] = useState({ company: '', firstName: '', lastName: '', idType: 'omang', nationalId: '', email: '', phone: '', password: '', confirmPassword: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const { executeRecaptcha } = useRecaptcha();
  const u = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.company.trim()) e.company = 'Company name is required';
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.nationalId.trim()) e.nationalId = 'National ID is required';
    if (form.idType === 'omang' && !/^\d{4,12}$/.test(form.nationalId.trim())) e.nationalId = 'Omang must be 4-12 digits';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (form.phone && !/^\+?\d{7,15}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Invalid phone number';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    else if (!/(?=.*[A-Z])/.test(form.password)) e.password = 'Include an uppercase letter';
    else if (!/(?=.*\d)/.test(form.password)) e.password = 'Include a number';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);

    const recaptchaToken = await executeRecaptcha('operator_register');
    if (!recaptchaToken) {
      setError('Security check failed. Please wait and try again.');
      setLoading(false);
      return;
    }

    const { data: authData, error: authErr } = await signUp(form.email, form.password, form.firstName + ' ' + form.lastName);
    if (authErr) { setError(authErr.message); setLoading(false); return; }

    if (authData?.user) {
      try {
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          full_name: form.firstName + ' ' + form.lastName,
          organization: form.company,
          phone: form.phone,
          role: 'operator',
        });
        if (upsertErr) throw upsertErr;
      } catch (err) {
        console.error('Failed to save operator profile:', err);
        setError('Account created but profile save failed. Please update your profile after signing in.');
        setLoading(false);
        return;
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  const inputCls = (field) => `mt-1 w-full px-4 py-3 border rounded-xl text-sm focus:border-[#00458B] outline-none ${errors[field] ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`;
  const errMsg = (field) => errors[field] ? <p className="text-[10px] text-red-500 mt-0.5">{errors[field]}</p> : null;

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00458B] to-[#003366] p-6">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#6BBE4E]/10 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-[#6BBE4E]" /></div>
        <h2 className="text-xl font-bold text-bocra-slate">{tn ? 'Kwadiso e Atlegile!' : 'Registration Successful!'}</h2>
        <p className="text-sm text-bocra-slate/50 mt-2 mb-4">{tn ? 'Akhaonto ya gago ya motsholetsi e dirilwe.' : 'Your operator account has been created.'}</p>
        <div className="bg-[#00A6CE]/5 border border-[#00A6CE]/20 rounded-xl p-4 text-left mb-6">
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-[#00A6CE] mt-0.5 flex-shrink-0"/>
            <div>
              <p className="text-sm font-medium text-bocra-slate">{tn ? 'Netefatsa imeile ya gago' : 'Verify your email'}</p>
              <p className="text-xs text-bocra-slate/50 mt-1">{tn ? <>Re rometse linki ya netefatso kwa go <strong className="text-bocra-slate">{form.email}</strong>. Tsweetswee tlhola inbox ya gago (le foldara ya spam) mme o tobetse linki go tshimolola akhaonto ya gago.</> : <>We've sent a verification link to <strong className="text-bocra-slate">{form.email}</strong>. Please check your inbox (and spam folder) and click the link to activate your account.</>}</p>
              <p className="text-[10px] text-bocra-slate/30 mt-2">{tn ? 'Ga o kitla o kgona go tsena go fitlha imeile ya gago e netefaditswe.' : 'You won\'t be able to sign in until your email is verified.'}</p>
            </div>
          </div>
        </div>
        <button onClick={() => setView('login')} className="w-full py-3 bg-[#00458B] text-white rounded-xl font-medium text-sm hover:bg-[#003366] transition-all">{tn ? 'Ya go Tsena' : 'Go to Sign In'}</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00458B] to-[#003366] py-10 px-4">
      <div className="max-w-xl mx-auto">
        <button onClick={() => setView('landing')} className="text-white/50 text-sm mb-6 hover:text-white flex items-center gap-1">&larr; Back</button>
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="bg-[#00458B] p-6 text-center">
            <Radio size={24} className="text-[#00A6CE] mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white">{tn ? 'Bula Akhaonto ya Motsholetsi' : 'Create Operator Account'}</h2>
            <p className="text-white/50 text-xs mt-1">{tn ? 'Kwadisa go fitlhelela ditirelo tsa tsamaiso ya sepeketeramo tsa BOCRA' : 'Register to access BOCRA spectrum management services'}</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2"><AlertCircle size={14} />{error}</div>}

            <div><label className="text-xs font-medium text-gray-500 uppercase">Company / Organisation Name *</label>
            <input type="text" value={form.company} onChange={e => u('company', e.target.value)} className={inputCls('company')} placeholder="e.g. Mascom Wireless Botswana (Pty) Ltd" />{errMsg('company')}</div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-gray-500 uppercase">First Name *</label>
              <input type="text" value={form.firstName} onChange={e => u('firstName', e.target.value)} className={inputCls('firstName')} />{errMsg('firstName')}</div>
              <div><label className="text-xs font-medium text-gray-500 uppercase">Last Name *</label>
              <input type="text" value={form.lastName} onChange={e => u('lastName', e.target.value)} className={inputCls('lastName')} />{errMsg('lastName')}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-gray-500 uppercase">National ID Type *</label>
              <select value={form.idType} onChange={e => u('idType', e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none bg-white">
                {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select></div>
              <div><label className="text-xs font-medium text-gray-500 uppercase">National ID Number *</label>
              <input type="text" value={form.nationalId} onChange={e => u('nationalId', e.target.value)} className={inputCls('nationalId')} placeholder="e.g. 123456789" />{errMsg('nationalId')}</div>
            </div>

            <div><label className="text-xs font-medium text-gray-500 uppercase">Email Address (will be your username) *</label>
            <input type="email" value={form.email} onChange={e => u('email', e.target.value)} className={inputCls('email')} />{errMsg('email')}</div>

            <div><label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
            <input type="tel" value={form.phone} onChange={e => u('phone', e.target.value)} className={inputCls('phone')} placeholder="+267" />{errMsg('phone')}</div>

            <div><label className="text-xs font-medium text-gray-500 uppercase">Physical Address</label>
            <input type="text" value={form.address} onChange={e => u('address', e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none" placeholder="Plot number, area, city" /></div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-gray-500 uppercase">Password *</label>
              <input type="password" value={form.password} onChange={e => u('password', e.target.value)} className={inputCls('password')} />{errMsg('password')}
              <p className="text-[9px] text-gray-300 mt-0.5">Min 8 chars, 1 uppercase, 1 number</p></div>
              <div><label className="text-xs font-medium text-gray-500 uppercase">Confirm Password *</label>
              <input type="password" value={form.confirmPassword} onChange={e => u('confirmPassword', e.target.value)} className={inputCls('confirmPassword')} />{errMsg('confirmPassword')}</div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-[#6BBE4E] text-white font-semibold rounded-xl hover:bg-[#5AAE3E] disabled:opacity-50 transition-all text-sm">
              {loading ? (tn ? 'E Dira Akhaonto...' : 'Creating Account...') : (tn ? 'Bula Akhaonto' : 'Create Account')}
            </button>

            <p className="text-xs text-center text-gray-400">{tn ? 'O setse o na le akhaonto? ' : 'Already have an account? '}<button type="button" onClick={() => setView('login')} className="text-[#00458B] font-medium hover:underline">{tn ? 'Tsena' : 'Sign In'}</button></p>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ setView, signIn }) {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const { executeRecaptcha } = useRecaptcha();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }
    if (!password) { setError('Password is required'); return; }
    setLoading(true);
    const token = await executeRecaptcha('operator_login');
    if (!token) {
      setError(tn ? 'Tshireletso e paletse. Leka gape.' : 'Security check failed. Please wait and try again.');
      setLoading(false);
      return;
    }
    const { error } = await signIn(email, password);
    if (error) {
      if (error.message.includes('Invalid login')) setError('Incorrect email or password.');
      else if (error.message.includes('Email not confirmed')) setError('Please verify your email first. Check your inbox for the verification link we sent during registration.');
      else setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00458B] to-[#003366] p-6">
      <div className="max-w-md w-full">
        <button onClick={() => setView('landing')} className="text-white/50 text-sm mb-6 hover:text-white flex items-center gap-1">&larr; Back</button>
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="bg-[#00458B] p-6 text-center">
            <Radio size={24} className="text-[#00A6CE] mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white">{tn ? 'Tsena mo Akhaontong ya Gago' : 'Sign In to Your Account'}</h2>
            <p className="text-white/50 text-xs mt-1">{tn ? 'Fitlhelela dashboard ya gago ya motsholetsi' : 'Access your operator dashboard'}</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
            <div><label className="text-xs font-medium text-gray-500 uppercase">Email / Username *</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none" /></div>
            <div><label className="text-xs font-medium text-gray-500 uppercase">Password *</label>
            <div className="relative"><input type={show ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none pr-12" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 mt-0.5">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#00458B] text-white font-semibold rounded-xl hover:bg-[#003366] disabled:opacity-50 transition-all text-sm">
              {loading ? (tn ? 'E Tsena...' : 'Signing In...') : (tn ? 'Tsena' : 'Sign In')}
            </button>
            <p className="text-xs text-center text-gray-400">{tn ? 'Ga o na akhaonto? ' : 'Don\'t have an account? '}<button type="button" onClick={() => setView('register')} className="text-[#6BBE4E] font-medium hover:underline">{tn ? 'Bula Akhaonto' : 'Create Account'}</button></p>
          </form>
        </div>
      </div>
    </div>
  );
}

function OperatorDashboard({ operator, user, signOut, setView }) {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const profile = operator; // this is from profiles table
  const name = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Operator';
  const [applications, setApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: profile?.full_name||'', organization: profile?.organization||'', phone: profile?.phone||'', sector: profile?.sector||'' });
  const [saving, setSaving] = useState(false);
  const [profilePic, setProfilePic] = useState(localStorage.getItem('bocra-pfp-'+(user?.id||''))||'');
  const handleLogout = async()=>{await signOut();setView('landing');};
  useEffect(()=>{if(!user)return;let cancelled=false;(async()=>{try{const[aR,cR]=await Promise.all([supabase.from('licence_applications').select('*').or(`operator_user_id.eq.${user.id},email.eq.${user.email}`).order('created_at',{ascending:false}),supabase.from('complaints').select('*').eq('email',user.email).order('created_at',{ascending:false})]);if(!cancelled){if(aR.data)setApplications(aR.data);if(cR.data)setComplaints(cR.data);setLoading(false);}}catch(err){console.error('Failed to fetch dashboard data:',err);if(!cancelled)setLoading(false);}})();const ch=supabase.channel('op-upd').on('postgres_changes',{event:'UPDATE',schema:'public',table:'licence_applications'},(p)=>{setApplications(pr=>pr.map(a=>a.id===p.new.id?{...a,...p.new}:a));}).on('postgres_changes',{event:'UPDATE',schema:'public',table:'complaints'},(p)=>{setComplaints(pr=>pr.map(c=>c.id===p.new.id?{...c,...p.new}:c));}).subscribe();return()=>{cancelled=true;supabase.removeChannel(ch);};},[user]);
  const handleProfileSave=async()=>{if(!profile)return;setSaving(true);try{const{error}=await supabase.from('profiles').update(profileForm).eq('id',profile.id);if(error)throw error;}catch(err){console.error('Failed to save profile:',err);}setSaving(false);setEditing(false);};
  const handlePfpChange=(e)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=(ev)=>{setProfilePic(ev.target.result);localStorage.setItem('bocra-pfp-'+(user?.id||''),ev.target.result);};r.readAsDataURL(f);};
  const removePfp=()=>{setProfilePic('');localStorage.removeItem('bocra-pfp-'+(user?.id||''));};
  const SC={pending:'bg-yellow-100 text-yellow-700',approved:'bg-green-100 text-green-700',rejected:'bg-red-100 text-red-700',investigating:'bg-blue-100 text-blue-700',resolved:'bg-green-100 text-green-700',closed:'bg-gray-100 text-gray-600'};
  const ini=(name||'?').charAt(0).toUpperCase();
  return(<div className="bg-bocra-off-white">
    <div className="bg-[#00458B] text-white"><div className="section-wrapper py-3 flex items-center justify-between"><div className="flex items-center gap-3"><Radio size={18} className="text-[#00A6CE]"/><span className="text-sm font-bold">ASMS-WebCP</span><span className="text-xs text-white/40 hidden sm:inline">{tn ? 'Potlolo ya Batsholetsi' : 'Operator Portal'}</span></div><div className="flex items-center gap-3">{profilePic?<img src={profilePic} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-white/20"/>:<div className="w-7 h-7 rounded-full bg-[#00A6CE] flex items-center justify-center text-white text-xs font-bold">{ini}</div>}<span className="text-xs text-white/60 hidden sm:inline">{name}</span><button onClick={handleLogout} className="text-xs text-white/40 hover:text-white flex items-center gap-1"><LogOut size={12}/> {tn ? 'Tswa' : 'Sign Out'}</button></div></div></div>
    <div className="section-wrapper py-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6"><div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative group">{profilePic?<img src={profilePic} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100"/>:<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00458B] to-[#00A6CE] flex items-center justify-center text-white text-2xl font-bold">{ini}</div>}<label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-all"><span className="text-white text-[9px] font-medium">Change</span><input type="file" accept="image/*" onChange={handlePfpChange} className="hidden"/></label></div>
        <div className="flex-1"><h1 className="text-xl font-bold text-bocra-slate">{name}</h1><p className="text-sm text-gray-500">{profile?.organization||'Operator'}</p><div className="flex items-center gap-3 mt-1">{profile?.role&&<span className="text-xs font-mono text-[#00A6CE] bg-[#00A6CE]/10 px-2 py-0.5 rounded">{profile.role}</span>}{profile?.sector&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{profile.sector}</span>}</div></div>
        <div className="flex gap-2">{profilePic&&<button onClick={removePfp} className="px-3 py-2 text-xs text-red-500 border border-red-200 rounded-xl hover:bg-red-50">{tn ? 'Tlosa Setshwantsho' : 'Remove Photo'}</button>}<button onClick={()=>setEditing(!editing)} className="px-4 py-2 text-xs font-medium text-[#00458B] border border-[#00458B]/20 rounded-xl hover:bg-[#00458B]/5">{editing?(tn?'Khansela':'Cancel'):(tn?'Fetola Porofaele':'Edit Profile')}</button></div>
      </div>
      {editing&&<div className="mt-5 pt-5 border-t border-gray-100"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="text-[10px] text-gray-400 uppercase font-medium">{tn ? 'Leina ka Botlalo' : 'Full Name'}</label><input value={profileForm.full_name} onChange={e=>setProfileForm(f=>({...f,full_name:e.target.value}))} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
        <div><label className="text-[10px] text-gray-400 uppercase font-medium">Organisation</label><input value={profileForm.organization} onChange={e=>setProfileForm(f=>({...f,organization:e.target.value}))} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
        <div><label className="text-[10px] text-gray-400 uppercase font-medium">Phone</label><input value={profileForm.phone} onChange={e=>setProfileForm(f=>({...f,phone:e.target.value}))} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
        <div><label className="text-[10px] text-gray-400 uppercase font-medium">Sector</label><input value={profileForm.sector} onChange={e=>setProfileForm(f=>({...f,sector:e.target.value}))} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
      </div><button onClick={handleProfileSave} disabled={saving} className="mt-3 px-5 py-2 bg-[#6BBE4E] text-white text-xs font-medium rounded-xl hover:bg-[#5AAE3E] disabled:opacity-50">{saving?(tn?'E Boloka...':'Saving...'):(tn?'Boloka Diphetogo':'Save Changes')}</button></div>}
      </div>

      <div className="flex gap-2 mb-5">{[['overview',tn?'Kakaretso':'Overview'],['applications',tn?'Dikopo':'Applications'],['complaints',tn?'Dingongorego':'Complaints'],['settings',tn?'Akhaonto':'Account']].map(([k,v])=>(<button key={k} onClick={()=>setActiveTab(k)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab===k?'bg-[#00458B] text-white':'bg-white text-gray-600 border border-gray-200'}`}>{v}{k==='applications'&&applications.length>0?` (${applications.length})`:''}{k==='complaints'&&complaints.length>0?` (${complaints.length})`:''}</button>))}</div>

      {activeTab==='overview'&&<><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"><div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-bocra-slate">{applications.length}</p><p className="text-xs text-gray-400">{tn ? 'Dikopo' : 'Applications'}</p></div><div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-[#6BBE4E]">{applications.filter(a=>a.status==='approved').length}</p><p className="text-xs text-gray-400">{tn ? 'Tse di Amogetsweng' : 'Approved'}</p></div><div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-[#F7B731]">{applications.filter(a=>a.status==='pending').length}</p><p className="text-xs text-gray-400">{tn ? 'Tse di Emetseng' : 'Pending'}</p></div><div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-bocra-slate">{complaints.length}</p><p className="text-xs text-gray-400">{tn ? 'Dingongorego' : 'Complaints'}</p></div></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Link to="/licensing" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#00A6CE] transition-all group flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-[#00A6CE]/10 flex items-center justify-center"><FileCheck size={22} className="text-[#00A6CE]"/></div><div><h3 className="font-bold text-sm text-bocra-slate group-hover:text-[#00A6CE]">{tn ? 'Dira Kopo ya Laesense' : 'Apply for Licence'}</h3><p className="text-[10px] text-gray-400">{tn ? 'Romela kopo e ntšhwa' : 'Submit new application'}</p></div></Link><Link to="/services/licence-verification" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#6BBE4E] transition-all group flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-[#6BBE4E]/10 flex items-center justify-center"><Shield size={22} className="text-[#6BBE4E]"/></div><div><h3 className="font-bold text-sm text-bocra-slate group-hover:text-[#6BBE4E]">{tn ? 'Netefatsa Laesense' : 'Verify Licence'}</h3><p className="text-[10px] text-gray-400">{tn ? 'Tlhola go siama' : 'Check validity'}</p></div></Link><Link to="/services/file-complaint" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#C8237B] transition-all group flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-[#C8237B]/10 flex items-center justify-center"><AlertCircle size={22} className="text-[#C8237B]"/></div><div><h3 className="font-bold text-sm text-bocra-slate group-hover:text-[#C8237B]">{tn ? 'Tlhagisa Ngongorego' : 'File Complaint'}</h3><p className="text-[10px] text-gray-400">{tn ? 'Bega bothata' : 'Report an issue'}</p></div></Link></div></>}

      {activeTab==='applications'&&<div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center justify-between mb-4"><h2 className="text-sm font-bold text-bocra-slate">{tn ? 'Dikopo Tsa Me Tsa Dilaesense' : 'My Licence Applications'}</h2><Link to="/licensing" className="text-xs text-[#00A6CE] hover:underline">+ New</Link></div>{loading?<div className="py-8 text-center"><div className="w-8 h-8 border-4 border-[#00A6CE]/20 border-t-[#00A6CE] rounded-full animate-spin mx-auto"/></div>:applications.length===0?<div className="py-8 text-center"><p className="text-sm text-gray-400">{tn ? 'Ga go na dikopo ka nako eno' : 'No applications yet'}</p></div>:<div className="space-y-2">{applications.map(a=>(<div key={a.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"><div className="w-10 h-10 rounded-xl bg-[#00A6CE]/10 flex items-center justify-center"><FileCheck size={18} className="text-[#00A6CE]"/></div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-bocra-slate truncate">{a.licence_type}</p><div className="flex items-center gap-2 mt-0.5"><span className="text-[10px] font-mono text-[#00A6CE]">{a.reference_number}</span><span className="text-[10px] text-gray-400">{new Date(a.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span></div></div><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${SC[a.status]||'bg-gray-100 text-gray-600'}`}>{a.status}</span></div>))}</div>}</div>}

      {activeTab==='complaints'&&<div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center justify-between mb-4"><h2 className="text-sm font-bold text-bocra-slate">{tn ? 'Dingongorego Tsa Me' : 'My Complaints'}</h2><Link to="/services/file-complaint" className="text-xs text-[#C8237B] hover:underline">+ New</Link></div>{loading?<div className="py-8 text-center"><div className="w-8 h-8 border-4 border-[#C8237B]/20 border-t-[#C8237B] rounded-full animate-spin mx-auto"/></div>:complaints.length===0?<div className="py-8 text-center"><p className="text-sm text-gray-400">{tn ? 'Ga go na dingongorego' : 'No complaints'}</p></div>:<div className="space-y-2">{complaints.map(c=>(<div key={c.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"><div className="w-10 h-10 rounded-xl bg-[#C8237B]/10 flex items-center justify-center"><AlertCircle size={18} className="text-[#C8237B]"/></div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-bocra-slate truncate">{c.ai_summary||c.complaint_type||'Complaint'}</p><div className="flex items-center gap-2 mt-0.5"><span className="text-[10px] text-gray-500">{c.provider}</span><span className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span></div></div><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${SC[c.status]||'bg-gray-100 text-gray-600'}`}>{c.status}</span></div>))}</div>}</div>}

      {activeTab==='settings'&&<div className="bg-white rounded-xl border border-gray-200 p-6"><h2 className="text-sm font-bold text-bocra-slate mb-4">{tn ? 'Ditlhophiso tsa Akhaonto' : 'Account Settings'}</h2><div className="space-y-4"><div className="p-4 bg-gray-50 rounded-xl"><p className="text-xs text-gray-400 uppercase font-medium mb-1">Email</p><p className="text-sm text-bocra-slate">{user?.email}</p></div>{profile&&<><div className="p-4 bg-gray-50 rounded-xl"><p className="text-xs text-gray-400 uppercase font-medium mb-1">Full Name</p><p className="text-sm text-bocra-slate font-medium">{profile.full_name || '—'}</p></div><div className="p-4 bg-gray-50 rounded-xl"><p className="text-xs text-gray-400 uppercase font-medium mb-1">Organisation</p><p className="text-sm text-bocra-slate">{profile.organization || '—'}</p></div><div className="p-4 bg-gray-50 rounded-xl"><p className="text-xs text-gray-400 uppercase font-medium mb-1">Role</p><p className="text-sm text-bocra-slate">{profile.role || '—'}</p></div><div className="p-4 bg-gray-50 rounded-xl"><p className="text-xs text-gray-400 uppercase font-medium mb-1">Registered</p><p className="text-sm text-bocra-slate">{new Date(profile.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p></div></>}<div className="pt-4 border-t border-gray-100"><button onClick={handleLogout} className="px-5 py-2.5 bg-red-50 text-red-600 text-xs font-medium rounded-xl hover:bg-red-100 flex items-center gap-2"><LogOut size={14}/> {tn ? 'Tswa' : 'Sign Out'}</button></div></div></div>}

      <div className="mt-6 p-4 bg-white rounded-xl text-center border border-gray-200"><p className="text-xs text-gray-400">{tn ? 'O tlhoka thuso? Ikgolaganye le BOCRA:' : 'Need help? Contact BOCRA:'} <a href="tel:+2673955755" className="text-[#00458B] font-medium">+267 395 7755</a> or <a href="mailto:info@bocra.org.bw" className="text-[#00458B] font-medium">info@bocra.org.bw</a></p></div>
    </div>
    <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]"/><div className="flex-1 bg-[#C8237B]"/><div className="flex-1 bg-[#F7B731]"/><div className="flex-1 bg-[#6BBE4E]"/></div>
  </div>);
}
