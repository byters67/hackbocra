/**
 * Type Approval Page — SIMS Customer Portal Rebuild
 * Recreates typeapproval.bocra.org.bw functionality:
 * - Landing with info + quick links
 * - Type Approval Search (approved devices database)
 * - Multi-step registration (Terms → Personal Details → Address)
 * - Login → Dashboard (applications, complaints)
 * - Complaints & Enquiries (create + check status)
 * - User Manual + Guidelines downloads
 * 
 * Uses same Supabase auth as OperatorPortalPage.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, Search, Shield, Radio, Wifi, Smartphone, Monitor,
  FileCheck, Clock, CheckCircle, AlertCircle, Eye, EyeOff, LogOut,
  ArrowRight, ArrowLeft, Download, BookOpen, MessageSquare, User,
  Mail, Phone, MapPin, Lock, Building, Globe, ChevronDown, XCircle,
  Cpu, Router, Tablet, HelpCircle, FileText, Award, Info, Send,
  Hash, Calendar, Filter, SlidersHorizontal, ExternalLink, Package,
  CreditCard
} from 'lucide-react';
import { useScrollReveal } from '../../hooks/useAnimations';
import { useAuth } from '../../lib/auth';
import { supabase, supabaseUrl_, supabaseAnonKey_ } from '../../lib/supabase';
import { useRecaptcha } from '../../hooks/useRecaptcha';
import { useLanguage } from '../../lib/language';

/* ─── DEVICE CATEGORIES & ICONS (data comes from Supabase) ─── */
const DEVICE_CATEGORIES = ['All', 'Mobile Phone', 'Router', 'Access Point', 'Tablet', 'Two-Way Radio', 'CPE Device', 'IP Camera', 'Satellite Terminal', 'Base Station', 'Network Switch', 'POS Terminal', 'IoT Device', 'Vehicle System', 'Solar Inverter'];

const CATEGORY_ICONS = {
  'Mobile Phone': Smartphone, 'Router': Router, 'Access Point': Wifi,
  'Tablet': Tablet, 'Two-Way Radio': Radio, 'CPE Device': Monitor,
  'IP Camera': Eye, 'Satellite Terminal': Globe, 'Base Station': Radio,
  'Network Switch': Cpu, 'POS Terminal': CreditCard, 'IoT Device': Wifi,
  'Vehicle System': Shield, 'Solar Inverter': Globe,
};

const getID_TYPES = (lang) => [
  { value: 'omang', label: 'Omang (National ID)' },
  { value: 'passport', label: 'Passport' },
  { value: 'company_reg', label: 'Company Registration' },
];

const getCOMPLAINT_CATEGORIES = (lang) => [
  (lang === 'tn' ? 'Go Diega ga Kopo ya Tumelelo ya Mofuta' : 'Type Approval Application Delay'),
  (lang === 'tn' ? 'Bothata jwa Setifikeiti' : 'Certificate Issue'),
  (lang === 'tn' ? 'Bothata jwa Netefatso ya Sedirisiwa' : 'Device Verification Problem'),
  (lang === 'tn' ? 'Go Palelwa ga Tlhatlhobo ya IMEI' : 'IMEI Check Failure'),
  (lang === 'tn' ? 'Ditlhokego tsa Dikwalo' : 'Documentation Requirements'),
  (lang === 'tn' ? 'Bothata jwa Tuelo ya Dituelo' : 'Fee Payment Issue'),
  (lang === 'tn' ? 'Potso ya Maemo a Setegeniki' : 'Technical Standards Query'),
  (lang === 'tn' ? 'Tse Dingwe' : 'Other'),
];

const BASE = import.meta.env.BASE_URL || '/';

/* ═════════════════════════════════════════════════ */
/*               MAIN PAGE COMPONENT                */
/* ═════════════════════════════════════════════════ */
export default function TypeApprovalPage() {
  const [view, setView] = useState('landing');
  const { user, signIn, signOut } = useAuth();
  const [operator, setOperator] = useState(null);
  const { lang } = useLanguage();
  const heroRef = useScrollReveal();

  useEffect(() => {
    if (user) {
      (async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setOperator(data);
      })();
    }
  }, [user]);

  if (view === 'login') return <LoginForm setView={setView} signIn={signIn} lang={lang} />;
  if (view === 'dashboard') return <TypeApprovalDashboard operator={operator} user={user} signOut={signOut} setView={setView} lang={lang} />;
  if (view === 'search') return <TypeApprovalSearch setView={setView} lang={lang} />;
  if (view === 'complaints') return <ComplaintsSection setView={setView} lang={lang} />;

  /* ── LANDING ── */
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">
              {lang === 'tn' ? 'Legae' : 'Home'}
            </Link>
            <ChevronRight size={14} />
            <Link to="/services" className="hover:text-bocra-blue transition-colors">
              {lang === 'tn' ? 'Ditirelo' : 'Services'}
            </Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">{lang === 'tn' ? 'Tumelelo ya Mofuta' : 'Type Approval'}</span>
          </nav>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0">
        <div className="relative py-12 sm:py-16 px-5 sm:px-8 lg:px-10 rounded-2xl overflow-hidden bg-gradient-to-br from-[#00458B] to-[#001A3A]">
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div ref={heroRef} className="relative max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-1.5 h-6 rounded-full bg-[#00A6CE]" />
              <span className="text-xs text-[#00A6CE] uppercase tracking-widest font-medium">
                {lang === 'tn' ? 'DITIRELO' : 'SERVICES'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              {lang === 'tn' ? 'Tumelelo ya Mofuta wa Didirisiwa' : 'Communications Equipment Type Approval'}
            </h1>
            <p className="text-white/60 mt-3 text-sm sm:text-base max-w-xl mx-auto">
              {lang === 'tn'
                ? 'Potala ya Tumelelo ya Mofuta wa Didirisiwa le Netefatso ya Didirisiwa tsa BOCRA'
                : 'BOCRA Type Approval & Device Verification Portal — ensuring all communications equipment meets national standards'}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Action Bar */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-5 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 flex flex-wrap gap-1.5">
            {[
              { icon: Search, label: lang === 'tn' ? 'Batla Tumelelo' : 'Type Approval Search', action: () => setView('search'), color: '#00458B' },
              { icon: BookOpen, label: lang === 'tn' ? 'Foromo ya Kopo' : 'Application Form', action: () => window.open(`${BASE}documents/type-approval/Type Approval Application.pdf`, '_blank'), color: '#6BBE4E' },
              { icon: MessageSquare, label: lang === 'tn' ? 'Dingongorego' : 'Complaints & Enquiries', action: () => setView('complaints'), color: '#C8237B' },
            ].map((item, i) => (
              <button key={i} onClick={item.action}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all hover:shadow-md"
                style={{ color: item.color, background: `${item.color}08` }}>
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* About Type Approval */}
      <section className="py-12">
        <div className="section-wrapper max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-bocra-slate mb-4">
                {lang === 'tn' ? 'Ka ga Tumelelo ya Mofuta' : 'About Type Approval'}
              </h2>
              <div className="space-y-4 text-sm text-bocra-slate/70 leading-relaxed">
                <p>
                  {lang === 'tn' ? 'BOCRA e laetswe ke Karolo 84 ya Molao wa CRA go Amogela ka Mofuta didirisiwa tsa dikgolagano tse di ka golaganngwang, dirisiwang kgotsa dirisiwang go fana ka ditirelo tsa phasalatso kgotsa megala mo Botswana. Go feta moo, BOCRA e laetswe go netefatsa tshireletso ya badirisi.' : 'BOCRA is mandated by Section 84 of the CRA Act to Type Approve communications equipment that may be connected, used or operated to provide broadcasting or telecommunications services in Botswana. In addition, BOCRA is mandated to ensure consumer protection.'}
                </p>
                <p>
                  {lang === 'tn' ? 'Maikaelelo a tsamaiso ya Tumelelo ya Mofuta ke go netefatsa gore didirisiwa tsotlhe tsa dikgolagano tsa radio le megala tse di dirisiwang mo Botswana di obamela maemo a boditšhabatšhaba a a dirisiwang jaaka leloko la ITU Region 1. Tumelelo ya mofuta gape e netefatsa gore ga go na didirisiwa tse di sa siamang tse di ka bontshang dikotsi tsa boitekanelo le polokego go badirisi tse di dirisiwang mo Botswana.' : 'The purpose of the Type Approval procedure is to ensure that all radio communication and telecommunication equipment used in Botswana comply with international standards applicable as a member of the ITU Region 1. Type approval also ensures that no substandard equipment which may represent health and safety hazards to consumers is used in Botswana.'}
                </p>
                <p>
                  {lang === 'tn' ? 'Tumelelo ya Mofuta e direla go sireletsa badirisi go tswa go ditlhagisiwa tse di sa tsamaelaneng le neteweke ya selegae ya megala, le go netefatsa gore frikwensi ya go bereka ya didirisiwa tsotlhe tsa dikgolagano tsa radio e obamela leano la kabelo ya sepeketeramo sa frikwensi ya Botswana go efoga go baka tshitswako e e kotsi mo ditirelong tse di botlhokwa.' : 'Type Approval serves to protect consumers from products that are not compatible with the local telecommunications network, and ensures that the operating frequency of all radio communication equipment is in conformity with the Botswana frequency spectrum allocation plan to avoid causing harmful interference to essential services.'}
                </p>
              </div>

              {/* Key Aspects */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Shield, title: lang === 'tn' ? 'Maikaelelo' : 'Purpose', desc: lang === 'tn' ? 'E sireletsa setšhaba go tswa go didirisiwa tse di kotsi mme e netefatsa gore didirisiwa tsa radio di dira mo sepeketeramong se se dumeletsweng.' : 'Protects the public from hazardous equipment and ensures radio devices operate within authorized frequency spectrum.', color: '#00458B' },
                  { icon: Award, title: lang === 'tn' ? 'Go Siama ga Botshelo Jotlhe' : 'Lifetime Validity', desc: lang === 'tn' ? 'Tumelelo ya mofuta e fanwa ka botshelo jotlhe jwa mofuta/sekao se se rileng sa sedirisiwa.' : 'Type approval is granted for the lifetime of the specific version/model of the equipment.', color: '#6BBE4E' },
                  { icon: Cpu, title: lang === 'tn' ? 'Netefatso ya IMEI' : 'IMEI Verification', desc: lang === 'tn' ? 'Mo didirisisweng tse di nang le SIM, bakopi ba tshwanetse go romela nomoro ya IMEI ya sampole e e tlhotlhomisitsweng mo di-database tsa GSMA.' : 'For SIM-enabled devices, applicants must submit a sample IMEI number checked against GSMA databases.', color: '#00A6CE' },
                  { icon: FileText, title: lang === 'tn' ? 'Kamogelo ya ILAC' : 'ILAC Accreditation', desc: lang === 'tn' ? 'Dipego tsa diteko di tshwanetse go tswa mo laboratoreng e e amogetseng ke ILAC ya netefatso ya go obamela ga didirisiwa.' : 'Test reports must be from an ILAC-accredited laboratory for equipment compliance certification.', color: '#F7B731' },
                ].map((item, i) => (
                  <div key={i} className="bg-bocra-off-white rounded-xl p-5 border border-gray-100">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `${item.color}15` }}>
                      <item.icon size={20} style={{ color: item.color }} />
                    </div>
                    <h3 className="text-sm font-bold text-bocra-slate mb-1">{item.title}</h3>
                    <p className="text-xs text-bocra-slate/60 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Ensuring Quality & Safety */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-bocra-slate mb-3">{lang === 'tn' ? 'Go Netefatsa Boleng le Polokego' : 'Ensuring Quality and Safety'}</h3>
                <p className="text-sm text-bocra-slate/70 leading-relaxed mb-4">
                  {lang === 'tn' ? 'Ka Tumelelo ya Mofuta ya Didirisiwa tsa Radio tsa Megala (RTTE) le Didirisiwa tsa Megala (TTE), BOCRA e netefatsa botshepegi le go ikanyega ga mafaratlhatlha a dikgolagano a naga. Didirisiwa tsotlhe tse di tshwanang di tshwanetse go obamela:' : 'Through Type Approval of Radio Telecommunications Terminal Equipment (RTTE) and Telecommunications Terminal Equipment (TTE), BOCRA ensures the integrity and reliability of the nation\'s communication infrastructure. All such devices must adhere to:'}
                </p>
                <div className="space-y-3">
                  {(lang === 'tn' ? [
                    { title: 'Leano la Frikwensi la Bosetšhaba', desc: 'Didirisiwa di tshwanetse go bereka ka fa gare ga dikabelo tsa frikwensi tse di tlhalosiwang ke Leano la Frikwensi la Bosetšhaba la Botswana go efoga tshitswako.' },
                    { title: 'Maemo a Boitekanelo le Polokego', desc: 'Didirisiwa di tshwanetse go fitlhelela ditaelo tse di gagametseng tsa boitekanelo le polokego go thibela kotsi go badirisi le go netefatsa tiriso e e babalesegileng.' },
                    { title: 'Go Obamela ga Electromagnetic (EMC)', desc: 'Didirisiwa di tshwanetse go obamela maemo a EMC go netefatsa gore ga di ntshe EMI e ntsi mme di kgona go emelelana le maemo a a utlwalang a EMI.' },
                  ] : [
                    { title: 'National Frequency Plan', desc: 'Equipment must operate within frequency allocations specified by Botswana\'s National Frequency Plan to avoid interference.' },
                    { title: 'Health & Safety Standards', desc: 'Devices must meet strict health and safety guidelines to prevent harm to users and ensure safe operation.' },
                    { title: 'Electromagnetic Conformity (EMC)', desc: 'Equipment must comply with EMC standards to ensure it does not emit excessive EMI and is immune to reasonable EMI levels.' },
                  ]).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00A6CE] mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-semibold text-bocra-slate">{item.title}: </span>
                        <span className="text-sm text-bocra-slate/60">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Combating Counterfeit */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-bocra-slate mb-3">{lang === 'tn' ? 'Go Lwantsha Didirisiwa tsa Maaka' : 'Combating Counterfeit Devices'}</h3>
                <p className="text-sm text-bocra-slate/70 leading-relaxed">
                  {lang === 'tn' ? 'BOCRA e diragaditse Module ya Netefatso ya Didirisiwa (DVM) ya didirisiwa tse di nang le SIM go lwantsha go ata ga didirisiwa tsa maaka, tse di tlisang dikotsi tse dikgolo mo botshepegeng jwa neteweke le polokegong ya badirisi. DVM e letla badirisi go netefatsa nnete ya didirisiwa tsa bone ka go tlhola dinomoro tsa bone tsa IMEI kgatlhanong le database e kgolo ya didirisiwa tse di amogetsweng.' : 'BOCRA has implemented a Device Verification Module (DVM) for SIM-enabled devices to combat the proliferation of counterfeit devices, which pose significant risks to network integrity and user safety. The DVM allows users to verify the authenticity of their devices by checking their International Mobile Equipment Identity (IMEI) numbers against a central database of approved devices.'}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Account Actions */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-br from-[#00458B] to-[#003366] p-5">
                  <Shield size={28} className="text-[#00A6CE] mb-2" />
                  <h3 className="text-white font-bold">
                    {lang === 'tn' ? 'Potala ya Tumelelo' : 'Type Approval Portal'}
                  </h3>
                  <p className="text-white/50 text-xs mt-1">
                    {lang === 'tn' ? 'Kopa tumelelo ya didirisiwa' : 'Apply for equipment type approval'}
                  </p>
                </div>
                <div className="p-4 space-y-2">
                  {user ? (
                    <button onClick={() => setView('dashboard')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#6BBE4E] hover:shadow-md transition-all group text-left">
                      <div className="w-9 h-9 rounded-lg bg-[#6BBE4E]/10 flex items-center justify-center">
                        <ArrowRight size={16} className="text-[#6BBE4E]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-bocra-slate group-hover:text-[#6BBE4E]">
                          Enter Type Approval Portal
                        </p>
                        <p className="text-[10px] text-gray-400">Signed in as {user.email}</p>
                      </div>
                    </button>
                  ) : (
                    <>
                      <button onClick={() => setView('login')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#00458B] hover:shadow-md transition-all group text-left">
                        <div className="w-9 h-9 rounded-lg bg-[#00458B]/10 flex items-center justify-center">
                          <Lock size={16} className="text-[#00458B]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-bocra-slate group-hover:text-[#00458B]">
                            Sign In
                          </p>
                          <p className="text-[10px] text-gray-400">{lang === 'tn' ? 'Fitlhelela akhaonto ya gago' : 'Access your account'}</p>
                        </div>
                      </button>
                      <Link to="/services/asms-webcp"
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#6BBE4E] hover:shadow-md transition-all group text-left">
                        <div className="w-9 h-9 rounded-lg bg-[#6BBE4E]/10 flex items-center justify-center">
                          <User size={16} className="text-[#6BBE4E]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-bocra-slate group-hover:text-[#6BBE4E]">
                            Create Account
                          </p>
                          <p className="text-[10px] text-gray-400">{lang === 'tn' ? 'Kwadisa ka Potala ya ASMS-WebCP' : 'Register via ASMS-WebCP Portal'}</p>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Downloads */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-bocra-slate mb-3">
                  {lang === 'tn' ? 'Ditokomane' : 'Downloads'}
                </h3>
                <div className="space-y-2">
                  <a href={`${BASE}documents/type-approval/Type Approval Application.pdf`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-bocra-off-white hover:bg-gray-100 transition-all group">
                    <FileCheck size={16} className="text-[#00A6CE] flex-shrink-0" />
                    <span className="text-xs font-medium text-bocra-slate group-hover:text-[#00458B] flex-1">{lang === 'tn' ? 'Foromo ya Kopo ya Tumelelo ya Mofuta' : 'Type Approval Application Form'}</span>
                    <Download size={14} className="text-gray-300 group-hover:text-[#00A6CE]" />
                  </a>
                </div>
              </div>

              {/* Application Process */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-bocra-slate mb-3">{lang === 'tn' ? 'Tsamaiso ya Kopo' : 'Application Process'}</h3>
                <div className="space-y-3">
                  {(lang === 'tn' ? [
                    { step: '1', text: 'Romela dikwalo go akaretsa dipego tsa diteko go tswa laboratoreng e e amogetseng ke ILAC' },
                    { step: '2', text: 'Kwadisa didirisiwa mo Tsamaisong ya Tumelelo ya Mofuta ya BOCRA' },
                    { step: '3', text: 'BOCRA e sekaseka kopo le dikwalo tsa go obamela' },
                    { step: '4', text: 'Duela dituelo fa Setifikeiti sa Tumelelo ya Mofuta se ntshiwa' },
                  ] : [
                    { step: '1', text: 'Submit documentation including test reports from ILAC-accredited laboratory' },
                    { step: '2', text: 'Register equipment on the BOCRA Type Approval System' },
                    { step: '3', text: 'BOCRA reviews application and compliance documentation' },
                    { step: '4', text: 'Pay fees upon issuance of Type Approval Certificate' },
                  ]).map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#00A6CE]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-[#00A6CE]">{item.step}</span>
                      </div>
                      <p className="text-xs text-bocra-slate/60 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-bocra-off-white rounded-2xl p-5">
                <h3 className="text-sm font-bold text-bocra-slate mb-2">
                  {lang === 'tn' ? 'Ikgokaganye le Rona' : 'Contact Standards Division'}
                </h3>
                <div className="space-y-2 text-xs text-bocra-slate/60">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-[#00A6CE]" />
                    <a href="mailto:standards@bocra.org.bw" className="text-[#00458B] hover:underline">standards@bocra.org.bw</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-[#00A6CE]" />
                    <a href="tel:+2673957755" className="text-[#00458B] hover:underline">+267 395 7755</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={12} className="text-[#00A6CE]" />
                    <a href="https://typeapproval.bocra.org.bw" target="_blank" rel="noopener noreferrer" className="text-[#00458B] hover:underline">typeapproval.bocra.org.bw</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Regulations */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-6xl">
          <h2 className="text-lg font-bold text-bocra-slate mb-4">{lang === 'tn' ? 'Melao e e Botlhokwa' : 'Key Regulations'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#00458B]/10 flex items-center justify-center">
                  <FileText size={16} className="text-[#00458B]" />
                </div>
                <h3 className="text-sm font-bold text-bocra-slate">{lang === 'tn' ? 'Molao wa CRA wa 2012' : 'CRA Act 2012'}</h3>
              </div>
              <p className="text-xs text-bocra-slate/60">{lang === 'tn' ? 'O fana ka tiragatso go BOCRA go laola didirisiwa tsa dikgolagano ka fa tlase ga Dikarolo 84 le 85.' : 'Provides the mandate for BOCRA to regulate communication equipment under Sections 84 and 85.'}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#00A6CE]/10 flex items-center justify-center">
                  <Smartphone size={16} className="text-[#00A6CE]" />
                </div>
                <h3 className="text-sm font-bold text-bocra-slate">{lang === 'tn' ? 'Ditaelo tsa Didirisiwa tse di nang le SIM tsa 2020' : 'SIM-Enabled Device Guidelines 2020'}</h3>
              </div>
              <p className="text-xs text-bocra-slate/60">{lang === 'tn' ? 'Ditaelo tsa Netefatso ya Tumelelo ya Mofuta bakeng sa didirisiwa tse di nang le SIM go akaretsa ditlhokego tsa netefatso ya IMEI.' : 'Type Approval Verification Guidelines for SIM-enabled devices including IMEI verification requirements.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Colour bar */}
      <div className="flex h-1">
        <div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" />
        <div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" />
      </div>
    </div>
  );
}


/* ═════════════════════════════════════════════════ */
/*            TYPE APPROVAL SEARCH                  */
/* ═════════════════════════════════════════════════ */
function TypeApprovalSearch({ setView, lang }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [dbCategories, setDbCategories] = useState([]);

  // Fetch devices from Supabase
  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from('type_approved_devices').select('*', { count: 'exact' });

      if (category !== 'All') q = q.eq('category', category);

      if (query.trim()) {
        const searchTerm = `%${query.trim()}%`;
        q = q.or(`device_name.ilike.${searchTerm},manufacturer.ilike.${searchTerm},model_number.ilike.${searchTerm},certificate_number.ilike.${searchTerm}`);
      }

      if (sortBy === 'date') q = q.order('approval_date', { ascending: false });
      else if (sortBy === 'name') q = q.order('device_name', { ascending: true });
      else if (sortBy === 'make') q = q.order('manufacturer', { ascending: true });

      const { data, count, error } = await q.limit(100);
      if (!error && data) {
        setDevices(data);
        setTotalCount(count || data.length);
      }
      setLoading(false);
    })();
  }, [query, category, sortBy]);

  // Fetch distinct categories on mount
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('type_approved_devices').select('category').order('category');
      if (data) {
        const cats = [...new Set(data.map(d => d.category))];
        setDbCategories(['All', ...cats]);
      }
    })();
  }, []);

  const activeCats = dbCategories.length > 1 ? dbCategories : DEVICE_CATEGORIES;

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue">{lang === 'tn' ? 'Gae' : 'Home'}</Link>
            <ChevronRight size={14} />
            <button onClick={() => setView('landing')} className="hover:text-bocra-blue">Type Approval</button>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">{lang === 'tn' ? 'Batla' : 'Search'}</span>
          </nav>
        </div>
      </div>

      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0">
        <div className="relative py-10 sm:py-14 px-5 sm:px-8 rounded-2xl overflow-hidden bg-gradient-to-br from-[#00458B] to-[#001A3A]">
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative max-w-2xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{lang === 'tn' ? 'Batla Tumelelo ya Mofuta' : 'Type Approval Search'}</h1>
            <p className="text-white/50 mt-2 text-sm">{lang === 'tn' ? 'Batla didirisiwa tse di amogetsweng ka leina la sedirisiwa, sekao, modiri, kgotsa nomoro ya setifikeiti.' : 'Search for type approved devices by device name, model, make, or certificate number.'}</p>
            <div className="mt-6 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search devices..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:border-[#00A6CE] outline-none backdrop-blur-sm text-sm" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="section-wrapper max-w-6xl">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button onClick={() => setView('landing')} className="text-sm text-bocra-slate/50 hover:text-bocra-blue flex items-center gap-1">
              <ArrowLeft size={14} /> Back
            </button>
            <div className="flex-1" />
            <div className="flex flex-wrap gap-1.5">
              {activeCats.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === cat ? 'bg-[#00458B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white">
              <option value="date">{lang === 'tn' ? 'Tsa Bosheng Pele' : 'Newest First'}</option>
              <option value="name">{lang === 'tn' ? 'Leina A-Z' : 'Name A-Z'}</option>
              <option value="make">{lang === 'tn' ? 'Modiri A-Z' : 'Manufacturer A-Z'}</option>
            </select>
          </div>

          {/* Results count */}
          <p className="text-xs text-bocra-slate/40 mb-4">
            {loading ? (lang === 'tn' ? 'E a batla...' : 'Searching...') : `${totalCount} ${lang === 'tn' ? 'didirisiwa tse di amogetsweng di bonwe' : `approved device${totalCount !== 1 ? 's' : ''} found`}`}
          </p>

          {/* Loading */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-[#00A6CE]/20 border-t-[#00A6CE] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-400 mt-3">{lang === 'tn' ? 'E batla mo database ya BOCRA...' : 'Searching BOCRA database...'}</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="py-12 text-center">
              <Search size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">{lang === 'tn' ? 'Ga go na didirisiwa tse di bonweng tse di tsamaelanang le patlo ya gago' : 'No devices found matching your search'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map(device => {
                const Icon = CATEGORY_ICONS[device.category] || Package;
                const statusColors = { approved: 'bg-green-100 text-green-700', suspended: 'bg-yellow-100 text-yellow-700', revoked: 'bg-red-100 text-red-700', expired: 'bg-gray-100 text-gray-600' };
                return (
                  <div key={device.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#00A6CE]/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-[#00A6CE]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-bocra-slate">{device.device_name}</h3>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${statusColors[device.status] || statusColors.approved}`}>{device.status}</span>
                          {device.imei_required && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-bold rounded">IMEI</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-bocra-slate/50">{device.manufacturer}</span>
                          <span className="text-[10px] text-gray-300">|</span>
                          <span className="text-xs text-bocra-slate/40">Model: {device.model_number}</span>
                          <span className="text-[10px] text-gray-300">|</span>
                          <span className="text-xs font-mono text-[#00A6CE]">{device.certificate_number}</span>
                        </div>
                        {device.description && <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{device.description}</p>}
                      </div>
                      <div className="text-right hidden sm:block flex-shrink-0">
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-lg">{device.category}</span>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(device.approval_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[9px] text-[#6BBE4E] font-medium">{device.validity}</p>
                        {device.test_lab && <p className="text-[8px] text-gray-300 mt-0.5">{device.test_lab}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


/* ═════════════════════════════════════════════════ */
/*                  LOGIN FORM                      */
/* ═════════════════════════════════════════════════ */
function LoginForm({ setView, signIn, lang }) {
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
    const token = await executeRecaptcha('type_approval_login');
    if (!token) {
      setError('Security check failed. Please wait and try again.');
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
        <button onClick={() => setView('landing')} className="text-white/50 text-sm mb-6 hover:text-white flex items-center gap-1">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-[#00458B] to-[#003366] p-6 text-center">
            <Shield size={28} className="text-[#00A6CE] mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white">{lang === 'tn' ? 'Tsena mo Akhaontong ya Gago' : 'Sign In to Your Account'}</h2>
            <p className="text-white/50 text-xs mt-1">{lang === 'tn' ? 'Fitlhelela Potala ya Tumelelo ya Mofuta' : 'Access the Type Approval Portal'}</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Email / Username *</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none" placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Password *</label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type={show ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#00458B] text-white font-semibold rounded-xl hover:bg-[#003366] disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2">
              {loading ? (lang === 'tn' ? 'E a tsena...' : 'Signing In...') : (lang === 'tn' ? 'Tsena' : 'Sign In')} {!loading && <ArrowRight size={14} />}
            </button>
            <p className="text-xs text-center text-gray-400">
              {lang === 'tn' ? 'Ga o na akhaonto?' : "Don't have an account?"}{' '}
              <a href="/hackbocra/services/asms-webcp" className="text-[#6BBE4E] font-medium hover:underline">{lang === 'tn' ? 'Ikwadise kwa ASMS-WebCP' : 'Register at ASMS-WebCP'}</a>
            </p>
          </form>
        </div>
        <p className="text-center text-xs text-white/20 mt-6">© {new Date().getFullYear()} BOCRA. All Rights Reserved.</p>
      </div>
    </div>
  );
}


/* ═════════════════════════════════════════════════ */
/*             DASHBOARD (AFTER LOGIN)              */
/* ═════════════════════════════════════════════════ */
function TypeApprovalDashboard({ operator, user, signOut, setView, lang }) {
  const profile = operator; // renamed for clarity — this is from profiles table
  const name = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const ini = (name || '?').charAt(0).toUpperCase();

  const handleLogout = async () => { await signOut(); setView('landing'); };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [aR, cR] = await Promise.all([
        supabase.from('licence_applications').select('*')
          .or(`operator_user_id.eq.${user.id},email.eq.${user.email}`)
          .order('created_at', { ascending: false }),
        supabase.from('complaints').select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false }),
      ]);
      if (aR.data) setApplications(aR.data);
      if (cR.data) setComplaints(cR.data);
      setLoading(false);
    })();
  }, [user]);

  const SC = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    investigating: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-bocra-off-white min-h-screen">
      {/* Top bar */}
      <div className="bg-[#00458B] text-white">
        <div className="section-wrapper py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-[#00A6CE]" />
            <span className="text-sm font-bold">{lang === 'tn' ? 'Potala ya Tumelelo ya Mofuta' : 'Type Approval Portal'}</span>
            <span className="text-xs text-white/40 hidden sm:inline">{lang === 'tn' ? 'Potala ya Bareki ya SIMS' : 'SIMS Customer Portal'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#00A6CE] flex items-center justify-center text-white text-xs font-bold">{ini}</div>
            <span className="text-xs text-white/60 hidden sm:inline">{name}</span>
            <button onClick={handleLogout} className="text-xs text-white/40 hover:text-white flex items-center gap-1">
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="section-wrapper py-6">
        {/* Welcome */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00458B] to-[#00A6CE] flex items-center justify-center text-white text-xl font-bold">{ini}</div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-bocra-slate">{name}</h1>
              <p className="text-sm text-gray-500">{profile?.organization || (lang === 'tn' ? 'Mokopi wa Tumelelo ya Mofuta' : 'Type Approval Applicant')}</p>
              <div className="flex items-center gap-3 mt-1">
                {profile?.role && <span className="text-xs font-mono text-[#00A6CE] bg-[#00A6CE]/10 px-2 py-0.5 rounded">{profile.role}</span>}
                {profile?.sector && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{profile.sector}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[['overview', lang === 'tn' ? 'Kakaretso' : 'Overview'], ['applications', lang === 'tn' ? 'Dikopo' : 'Applications'], ['complaints', lang === 'tn' ? 'Dingongorego' : 'Complaints']].map(([k, v]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === k ? 'bg-[#00458B] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {v}{k === 'applications' && applications.length > 0 ? ` (${applications.length})` : ''}{k === 'complaints' && complaints.length > 0 ? ` (${complaints.length})` : ''}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-2xl font-bold text-bocra-slate">{applications.length}</p>
                <p className="text-xs text-gray-400">{lang === 'tn' ? 'Dikopo' : 'Applications'}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-2xl font-bold text-[#6BBE4E]">{applications.filter(a => a.status === 'approved').length}</p>
                <p className="text-xs text-gray-400">{lang === 'tn' ? 'Di Amogetswe' : 'Approved'}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-2xl font-bold text-[#F7B731]">{applications.filter(a => a.status === 'pending').length}</p>
                <p className="text-xs text-gray-400">{lang === 'tn' ? 'Di Emetse' : 'Pending'}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-2xl font-bold text-bocra-slate">{complaints.length}</p>
                <p className="text-xs text-gray-400">{lang === 'tn' ? 'Dipotso' : 'Enquiries'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => setView('search')} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#00A6CE] transition-all group flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-[#00A6CE]/10 flex items-center justify-center">
                  <Search size={22} className="text-[#00A6CE]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-bocra-slate group-hover:text-[#00A6CE]">{lang === 'tn' ? 'Batla Didirisiwa' : 'Search Devices'}</h3>
                  <p className="text-[10px] text-gray-400">{lang === 'tn' ? 'Sekaseka didirisiwa tse di amogetsweng' : 'Browse approved equipment'}</p>
                </div>
              </button>
              <a href={`${BASE}documents/type-approval/Type Approval Application.pdf`} target="_blank" rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#6BBE4E] transition-all group flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#6BBE4E]/10 flex items-center justify-center">
                  <FileCheck size={22} className="text-[#6BBE4E]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-bocra-slate group-hover:text-[#6BBE4E]">{lang === 'tn' ? 'Foromo ya Kopo' : 'Application Form'}</h3>
                  <p className="text-[10px] text-gray-400">{lang === 'tn' ? 'Tsenya foromo ya PDF' : 'Download PDF form'}</p>
                </div>
              </a>
              <button onClick={() => setView('complaints')} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#C8237B] transition-all group flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-[#C8237B]/10 flex items-center justify-center">
                  <MessageSquare size={22} className="text-[#C8237B]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-bocra-slate group-hover:text-[#C8237B]">{lang === 'tn' ? 'Tlhagisa Potso' : 'File Enquiry'}</h3>
                  <p className="text-[10px] text-gray-400">{lang === 'tn' ? 'Romela ngongorego kgotsa potso' : 'Submit complaint or question'}</p>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-bocra-slate mb-4">{lang === 'tn' ? 'Dikopo Tsa Me tsa Tumelelo ya Mofuta' : 'My Type Approval Applications'}</h2>
            {loading ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 border-4 border-[#00A6CE]/20 border-t-[#00A6CE] rounded-full animate-spin mx-auto" />
              </div>
            ) : applications.length === 0 ? (
              <div className="py-8 text-center">
                <FileCheck size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{lang === 'tn' ? 'Ga go na dikopo ka nako eno' : 'No applications yet'}</p>
                <p className="text-xs text-gray-300 mt-1">{lang === 'tn' ? 'Tsenya foromo ya kopo go romela kopo ya gago ya ntlha ya tumelelo ya mofuta' : 'Download the application form to submit your first type approval request'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.map(a => (
                  <div key={a.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-[#00A6CE]/10 flex items-center justify-center">
                      <FileCheck size={18} className="text-[#00A6CE]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-bocra-slate truncate">{a.licence_type}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-[#00A6CE]">{a.reference_number}</span>
                        <span className="text-[10px] text-gray-400">{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${SC[a.status] || 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-bocra-slate">{lang === 'tn' ? 'Dipotso le Dingongorego Tsa Me' : 'My Enquiries & Complaints'}</h2>
              <button onClick={() => setView('complaints')} className="text-xs text-[#C8237B] hover:underline">+ New Enquiry</button>
            </div>
            {loading ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 border-4 border-[#C8237B]/20 border-t-[#C8237B] rounded-full animate-spin mx-auto" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{lang === 'tn' ? 'Ga go na dipotso' : 'No enquiries'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {complaints.map(c => (
                  <div key={c.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-[#C8237B]/10 flex items-center justify-center">
                      <MessageSquare size={18} className="text-[#C8237B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-bocra-slate truncate">{c.ai_summary || c.complaint_type || (lang === 'tn' ? 'Potso' : 'Enquiry')}</p>
                      <span className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${SC[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer help */}
        <div className="mt-6 p-4 bg-white rounded-xl text-center border border-gray-200">
          <p className="text-xs text-gray-400">
            Need help? Contact BOCRA Standards Division:{' '}
            <a href="tel:+2673957755" className="text-[#00458B] font-medium">+267 395 7755</a> or{' '}
            <a href="mailto:standards@bocra.org.bw" className="text-[#00458B] font-medium">standards@bocra.org.bw</a>
          </p>
        </div>
      </div>

      {/* Colour bar */}
      <div className="flex h-1">
        <div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" />
        <div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" />
      </div>
    </div>
  );
}


/* ═════════════════════════════════════════════════ */
/*          COMPLAINTS & ENQUIRIES                  */
/* ═════════════════════════════════════════════════ */
function ComplaintsSection({ setView, lang }) {
  const { executeRecaptcha } = useRecaptcha();
  const [tab, setTab] = useState('create'); // create | check
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ email: '', fullName: '', phone: '', category: '', description: '' });
  const [complaintError, setComplaintError] = useState('');
  const [checkEmail, setCheckEmail] = useState('');
  const [checkRef, setCheckRef] = useState('');
  const [checkResults, setCheckResults] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!form.email || !form.fullName || !form.category || !form.description) return;
    if (form.description.trim().length < 20) {
      setComplaintError('Please provide at least 20 characters in the description.');
      return;
    }
    setComplaintError('');
    setLoading(true);
    try {
      const recaptchaToken = await executeRecaptcha('submit_complaint');
      if (!recaptchaToken) {
        setComplaintError('Security check failed. Please wait and try again.');
        setLoading(false);
        return;
      }
      const res = await fetch(`${supabaseUrl_}/functions/v1/submit-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey_}`,
          apikey: supabaseAnonKey_,
        },
        body: JSON.stringify({
          form_type: 'complaint',
          recaptcha_token: recaptchaToken,
          fields: {
            name: form.fullName,
            company: '',
            phone: form.phone || '',
            email: form.email,
            provider: 'Type Approval',
            complaint_type: form.category,
            description: form.description,
            previous_complaint: false,
            reference_number: '',
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setComplaintError(typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setComplaintError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!checkEmail) return;
    setCheckLoading(true);
    let query = supabase.from('complaints').select('*').eq('email', checkEmail).eq('provider', 'Type Approval');
    if (checkRef.trim()) query = query.ilike('id', `%${checkRef}%`);
    const { data } = await query.order('created_at', { ascending: false });
    setCheckResults(data || []);
    setCheckLoading(false);
  };

  const SC = {
    pending: 'bg-yellow-100 text-yellow-700',
    investigating: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue">Home</Link>
            <ChevronRight size={14} />
            <button onClick={() => setView('landing')} className="hover:text-bocra-blue">Type Approval</button>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">{lang === 'tn' ? 'Dingongorego le Dipotso' : 'Complaints & Enquiries'}</span>
          </nav>
        </div>
      </div>

      <section className="py-8">
        <div className="section-wrapper max-w-2xl">
          <button onClick={() => setView('landing')} className="text-sm text-bocra-slate/50 hover:text-bocra-blue flex items-center gap-1 mb-6">
            <ArrowLeft size={14} /> Back to Type Approval
          </button>

          {/* Tab switcher */}
          <div className="flex border-b border-gray-200 mb-6">
            <button onClick={() => setTab('create')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${tab === 'create' ? 'border-[#00458B] text-[#00458B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              Create Complaint / Enquiry
            </button>
            <button onClick={() => setTab('check')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${tab === 'check' ? 'border-[#00458B] text-[#00458B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              Check Inquiry Status
            </button>
          </div>

          {/* Create */}
          {tab === 'create' && (
            submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-[#6BBE4E]/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={28} className="text-[#6BBE4E]" />
                </div>
                <h2 className="text-lg font-bold text-bocra-slate mb-2">{lang === 'tn' ? 'Potso e Rometse' : 'Enquiry Submitted'}</h2>
                <p className="text-sm text-gray-500">{lang === 'tn' ? 'Re tla sekaseka potso ya gago mme re arabe mo atereseng ya imeile e e filweng.' : 'We will review your enquiry and respond to the email address provided.'}</p>
                <button onClick={() => { setSubmitted(false); setForm({ email: '', fullName: '', phone: '', category: '', description: '' }); }}
                  className="mt-4 px-5 py-2 text-sm text-[#00458B] border border-[#00458B]/20 rounded-xl hover:bg-[#00458B]/5">{lang === 'tn' ? 'Romela E Nngwe' : 'Submit Another'}</button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-bocra-slate mb-1">{lang === 'tn' ? 'Dingongorego le Dipotso' : 'Complaints and Enquiries'}</h2>
                <p className="text-sm text-gray-400 mb-6">{lang === 'tn' ? 'Tsweetswee tlatsa dintlha tse di fa tlase go kwadisa ngongorego le rona ka ga ditirelo tsa rona.' : 'Please fill in the below details to register a complaint with us regarding our services.'}</p>
                {complaintError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">{complaintError}</p>}
                <form onSubmit={handleSubmitComplaint} className="space-y-4">
                  <div>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                      placeholder="Email Address" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none" />
                  </div>
                  <div>
                    <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required
                      placeholder="Full Names" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none" />
                  </div>
                  <div>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="Contact Number" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none" />
                  </div>
                  <div>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none bg-white text-gray-600">
                      <option value="">Select Category *</option>
                      {COMPLAINT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={4}
                      placeholder="Description *" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none resize-y" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="px-8 py-3 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] disabled:opacity-50 transition-all flex items-center gap-2">
                    {loading ? 'Submitting...' : 'Submit'} {!loading && <Send size={14} />}
                  </button>
                </form>
              </div>
            )
          )}

          {/* Check Status */}
          {tab === 'check' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-bocra-slate mb-1">{lang === 'tn' ? 'Tlhola Maemo a Ngongorego' : 'Check Complaint Status'}</h2>
              <p className="text-sm text-gray-400 mb-6">{lang === 'tn' ? 'Go bona maemo a ngongorego ya gago, re fe dintlha tse di fa tlase.' : 'To view the status of your complaint, provide us with the details below.'}</p>
              <form onSubmit={handleCheckStatus} className="space-y-4">
                <div>
                  <input type="email" value={checkEmail} onChange={e => setCheckEmail(e.target.value)} required
                    placeholder="Email Address" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none" />
                </div>
                <div>
                  <input type="text" value={checkRef} onChange={e => setCheckRef(e.target.value)}
                    placeholder="Reference Number (optional)" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none" />
                </div>
                <button type="submit" disabled={checkLoading}
                  className="px-8 py-3 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] disabled:opacity-50 transition-all">
                  {checkLoading ? 'Checking...' : 'View Status'}
                </button>
              </form>

              {checkResults !== null && (
                <div className="mt-6">
                  {checkResults.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-sm text-gray-400">{lang === 'tn' ? 'Ga go na dingongorego tse di bonweng bakeng sa aterese e ya imeile' : 'No complaints found for this email address'}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {checkResults.map(c => (
                        <div key={c.id} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-bocra-slate">{c.complaint_type}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${SC[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{c.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
