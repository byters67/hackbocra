/**
 * Register .BW — NIC.NET.BW Redesign (Vertical Scroll)
 * 
 * Consistent with the rest of the BOCRA site — vertical sections,
 * same card styles, same hero banner pattern. Logos from nic partners.
 */
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Search, Globe, Shield, Clock, Users, CheckCircle,
  ArrowRight, ExternalLink, FileText, Download, Mail, Phone,
  Building, Award, Zap, Lock, Server, ChevronDown, AlertCircle,
  Star, MapPin, RefreshCw, HelpCircle, BookOpen, XCircle
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';

import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';
const BASE = import.meta.env.BASE_URL;

const getEXTENSIONS = (lang) => [
  { ext: '.co.bw', desc: lang === 'tn' ? 'Dikgwebo tsa kgwebo' : 'Commercial businesses', icon: Building, color: '#00A6CE', popular: true },
  { ext: '.org.bw', desc: lang === 'tn' ? 'Mekgatlho e e sa direng lotseno' : 'Non-profit organisations', icon: Users, color: '#6BBE4E', popular: true },
  { ext: '.net.bw', desc: lang === 'tn' ? 'Ditirelo tsa inthanete le neteweke' : 'Internet & network services', icon: Globe, color: '#C8237B', popular: false },
  { ext: '.ac.bw', desc: lang === 'tn' ? 'Ditheo tsa thuto' : 'Academic institutions', icon: BookOpen, color: '#F7B731', popular: false },
  { ext: '.gov.bw', desc: lang === 'tn' ? 'Mekgatlho ya puso' : 'Government entities', icon: Shield, color: '#00458B', popular: false },
  { ext: '.me.bw', desc: 'Personal brands & individuals', icon: Star, color: '#7C3AED', popular: true },
  { ext: '.shop.bw', desc: 'Online shops & retail', icon: Building, color: '#EA580C', popular: true },
  { ext: '.agric.bw', desc: 'Agriculture businesses', icon: Globe, color: '#059669', popular: true },
];

const REGISTRARS = [
  { name: 'Botswana Broadband Internet (BBI)', email: 'support@bbi.co.bw', phone: '+267 391 2345', location: 'Gaborone' },
  { name: 'Botswana Telecommunications Corporation (BTC)', email: 'ipoperations@btc.bw', phone: '+267 395 8000', location: 'Gaborone' },
  { name: 'ButNet (Pty) Ltd', email: 'admin@but.co.bw', phone: '+267 241 3527', location: 'Francistown' },
  { name: 'BW Domains', email: 'info@bwdomains.co.bw', phone: '', location: 'Gaborone' },
  { name: 'CSC Corporate Domains', email: 'support@cscglobal.com', phone: '', location: 'Wilmington, USA' },
  { name: 'Government Data Network', email: 'gdnsecurity@gov.bw', phone: '+267 361 2600', location: 'Gaborone' },
  { name: 'Mascom Wireless', email: 'support@mascom.bw', phone: '+267 371 2000', location: 'Gaborone' },
  { name: 'Orange Botswana', email: 'support@orange.co.bw', phone: '+267 312 0000', location: 'Gaborone' },
  { name: 'Paratus Botswana', email: 'info@paratus.co.bw', phone: '', location: 'Gaborone' },
  { name: 'Daisy Technologies', email: 'info@daisy.co.bw', phone: '', location: 'Gaborone' },
  { name: 'IICD Botswana', email: 'info@iicd.co.bw', phone: '', location: 'Gaborone' },
  { name: 'Letshego Technology', email: 'tech@letshego.com', phone: '', location: 'Gaborone' },
];

const NIC_DOCS = {
  'Forms & Documents': [
    { title: 'Registrar Accreditation Form', desc: 'Application form to become an accredited .bw registrar (PDF)', file: 'nic/Registrar_Accreditation_Form.pdf', type: 'PDF' },
    { title: 'Registrar Accreditation Form v2', desc: 'Updated accreditation application form (Word)', file: 'nic/Registrar_Accreditation_Form_v2.doc', type: 'DOC' },
    { title: 'Registrar Accreditation Agreement v2', desc: 'Agreement between BOCRA and registrars (Word)', file: 'nic/Registrar_Accreditation_Agreement_v2.docx', type: 'DOCX' },
    { title: 'Registrar Agreement v2', desc: 'Reviewed registrar agreement (Word)', file: 'nic/Registrar_Agreement_v2.doc', type: 'DOC' },
    { title: 'Acceptable Use Policy v2', desc: 'Rules governing .bw domain usage (Word)', file: 'nic/Acceptable_Use_Policy_v2.doc', type: 'DOC' },
    { title: 'Public Notice — New .BW Domains', desc: 'Availability of shop.bw, agric.bw, me.bw (March 2021)', file: 'nic/New_BW_Domains_Public_Notice.pdf', type: 'PDF' },
  ],
  'Drafts & Guidelines': [
    { title: 'Website Application Security Guidelines', desc: 'Security checklist for .bw domain websites — DRAFT', file: 'nic/Website_Application_Security_Guidelines.pdf', type: 'PDF' },
    { title: 'Email Security Guidelines', desc: 'Best practices for email security on .bw domains — DRAFT', file: 'nic/Email_Security_Guidelines.pdf', type: 'PDF' },
  ],
  'Consultation Papers': [
    { title: 'Consultation Paper — New Domains', desc: 'Proposal for me.bw, shop.bw, agric.bw (September 2020)', file: 'nic/Consultation_Paper_New_Domains.pdf', type: 'PDF' },
    { title: 'Outcomes of Consultation Paper', desc: 'Public feedback and conclusions on new domain extensions', file: 'nic/Outcomes_Consultation_New_Domains.pdf', type: 'PDF' },
  ],
  'Existing Policies': [
    { title: 'Registration Terms and Conditions', desc: 'Agreement between domain registrant and BOCRA', file: 'Annexure_3.3.1B_ccTLD_DotBW_Registration_Terms_and_Conditions_Feb_2022.pdf', type: 'PDF' },
    { title: 'Registrar Accreditation Agreement', desc: 'Original accreditation agreement', file: 'Annexure_3.3.1C_ccTLD_Registrar_Accreditation_Agreement_Feb_2022.pdf', type: 'PDF' },
    { title: 'Acceptable User Policy', desc: 'Original acceptable use policy', file: 'Annexure_3.3.1A_ccTLD_BW_Acceptable_User_Policy_Feb_2022.pdf', type: 'PDF' },
    { title: 'WHOIS Policy', desc: 'Public access to domain registration data', file: null, type: null },
    { title: 'Domain Lifecycle Policy', desc: 'Registration, renewal, transfer, expiry and deletion', file: null, type: null },
    { title: 'Dispute Resolution Policy', desc: 'Complaint Resolution Service for domain disputes', file: null, type: null },
  ],
};

const TYPE_COLORS = { PDF: '#DC2626', DOC: '#2563EB', DOCX: '#2563EB' };

const PARTNER_LOGOS = [
  { name: 'ICANN', src: `${BASE}images/nic/icann.png` },
  { name: 'IANA', src: `${BASE}images/nic/iana.png` },
  { name: 'AfTLD', src: `${BASE}images/nic/aftld.jpg` },
  { name: 'AFRINIC', src: `${BASE}images/nic/afrinic.png` },
  { name: 'IGF', src: `${BASE}images/nic/igf.jpg` },
];

export default function RegisterBWPage() {
  const { lang } = useLanguage();
  const EXTENSIONS = getEXTENSIONS(lang);
  const [domainSearch, setDomainSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchExt, setSearchExt] = useState('.co.bw');
  const [registrarSearch, setRegistrarSearch] = useState('');
  const [showAllRegistrars, setShowAllRegistrars] = useState(false);
  const heroRef = useScrollReveal();
  const statsRef = useStaggerReveal({ stagger: 0.1 });

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!domainSearch.trim()) return;
    
    let input = domainSearch.trim().toLowerCase();
    
    // Strip protocol and www
    input = input.replace(/^https?:\/\//, '').replace(/^www\./, '');
    // Remove trailing slashes and paths
    input = input.split('/')[0];
    
    // Check if user typed a full .bw domain already (e.g. "bocra.org.bw")
    let fullDomain;
    const bwMatch = input.match(/^([a-z0-9-]+)\.(co|org|net|ac|gov|me|shop|agric)\.bw$/);
    if (bwMatch) {
      // User typed full domain — use it as-is
      fullDomain = input;
    } else if (input.match(/^[a-z0-9-]+\.bw$/)) {
      // User typed something like "bocra.bw" — use as-is
      fullDomain = input;
    } else {
      // Just a name — clean it and add the selected extension
      const clean = input.replace(/\.[a-z]+$/, '').replace(/[^a-z0-9-]/g, '');
      if (!clean) return;
      fullDomain = clean + searchExt;
    }
    
    setSearching(true);
    setSearchResult(null);
    try {
      // Check NS records first (most reliable for domain existence)
      const res = await fetch(`https://dns.google/resolve?name=${fullDomain}&type=NS`);
      const data = await res.json();
      if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
        setSearchResult({ domain: fullDomain, available: false, searched: true });
        setSearching(false);
        return;
      }
      // NS might not exist for subdomains — also check A record
      const res2 = await fetch(`https://dns.google/resolve?name=${fullDomain}&type=A`);
      const data2 = await res2.json();
      if (data2.Status === 0 && data2.Answer && data2.Answer.length > 0) {
        setSearchResult({ domain: fullDomain, available: false, searched: true });
        setSearching(false);
        return;
      }
      // Also check SOA as final confirmation
      const res3 = await fetch(`https://dns.google/resolve?name=${fullDomain}&type=SOA`);
      const data3 = await res3.json();
      const taken = data3.Status === 0 && data3.Answer && data3.Answer.length > 0;
      setSearchResult({ domain: fullDomain, available: !taken, searched: true });
    } catch {
      setSearchResult({ domain: fullDomain, available: null, searched: true, error: true });
    }
    setSearching(false);
  };

  const filteredRegistrars = registrarSearch
    ? REGISTRARS.filter(r => r.name.toLowerCase().includes(registrarSearch.toLowerCase()) || r.location.toLowerCase().includes(registrarSearch.toLowerCase()))
    : REGISTRARS;
  const visibleRegistrars = showAllRegistrars ? filteredRegistrars : filteredRegistrars.slice(0, 6);

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">{lang === 'tn' ? 'Gae' : 'Home'}</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate">{lang === 'tn' ? 'Kwadisa Lefelo la .BW' : 'Register .BW Domain'}</span>
          </nav>
        </div>
      </div>

      {/* ═══ HERO with domain search ═══ */}
      {/* Hero */}
      <PageHero category="SERVICES" categoryTn="DITIRELO" title="Register .BW Domain" titleTn="Kwadisa Lefelo la .BW" description="Register and manage Botswana's country-code top-level domain (.bw) through the official NIC.BW registry." descriptionTn="Kwadisa le go laola lefelo la khoutu ya naga ya Botswana (.bw) ka rejisetara ya NIC.BW." color="cyan" />

      {/* Domain Search */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-5 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-xs font-bold text-bocra-slate/40 uppercase tracking-wide mb-2">{lang === 'tn' ? 'Tlhola go Nna Teng ga Lefelo' : 'Check Domain Availability'}</p>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={domainSearch}
                  onChange={e => setDomainSearch(e.target.value)}
                  placeholder={lang === 'tn' ? 'Tsenya leina la lefelo (sk. kgwebo_yame)' : 'Enter domain name (e.g. mybusiness)'}
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-[#00A6CE] focus:ring-2 focus:ring-[#00A6CE]/10 outline-none"
                />
              </div>
              <select value={searchExt} onChange={e => setSearchExt(e.target.value)}
                className="px-3 py-3 border border-gray-200 rounded-lg text-sm bg-white text-bocra-slate font-medium focus:border-[#00A6CE] outline-none">
                {EXTENSIONS.map(ext => <option key={ext.ext} value={ext.ext}>{ext.ext}</option>)}
              </select>
              <button type="submit" disabled={searching || !domainSearch.trim()}
                className="px-5 py-3 bg-[#00A6CE] text-white text-sm font-medium rounded-lg hover:bg-[#008DB0] disabled:opacity-50 transition-all flex items-center gap-2">
                {searching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={14} />}
                {searching ? (lang === 'tn' ? 'E a tlhola...' : 'Checking...') : (lang === 'tn' ? 'Batla' : 'Search')}
              </button>
            </form>

            {/* Search Result */}
            {searchResult && (
              <div className={`mt-3 p-3 rounded-lg flex items-center gap-3 ${searchResult.error ? 'bg-yellow-50 border border-yellow-200' : searchResult.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {searchResult.error ? (
                  <>
                    <AlertCircle size={18} className="text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">{lang === 'tn' ? 'Ga re a kgona go netefatsa' : 'Could not verify'}</p>
                      <p className="text-xs text-yellow-600">{lang === 'tn' ? <>Ga re a kgona go tlhola <strong>{searchResult.domain}</strong>. Potso ya DNS e ka tswa e padile — leka gape kgotsa ikgolaganye le mokwadisi ka tlhamalalo.</> : <>Unable to check <strong>{searchResult.domain}</strong>. The DNS query may have failed — try again or contact a registrar directly.</>}</p>
                    </div>
                  </>
                ) : searchResult.available ? (
                  <>
                    <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">{lang === 'tn' ? 'E teng!' : 'Available!'}</p>
                      <p className="text-xs text-green-600">{lang === 'tn' ? <><strong>{searchResult.domain}</strong> e bonala e le teng. Ikgolaganye le mokwadisi o o amogeletsweng fa tlase go e kwadisa.</> : <><strong>{searchResult.domain}</strong> appears to be available. Contact an accredited registrar below to register it.</>}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle size={18} className="text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{lang === 'tn' ? 'E Setse e Tserweng' : 'Already Taken'}</p>
                      <p className="text-xs text-red-600">{lang === 'tn' ? <><strong>{searchResult.domain}</strong> e setse e kwadisitswe. Leka leina kgotsa kgolosa e sele.</> : <><strong>{searchResult.domain}</strong> is already registered. Try a different name or extension.</>}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>


      {/* ═══ STATS ═══ */}
      <section className="py-8">
        <div className="section-wrapper">
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: '10,000+', label: lang === 'tn' ? 'Mafelo a a Kwadisitsweng' : 'Domains Registered', icon: Globe, color: '#00A6CE' },
              { value: '70+', label: lang === 'tn' ? 'Di-Rejisetara tse di Amogeletsweng' : 'Accredited Registrars', icon: Building, color: '#C8237B' },
              { value: '8', label: lang === 'tn' ? 'Dikgolosa tsa Lefelo' : 'Domain Extensions', icon: Star, color: '#F7B731' },
              { value: '24hrs', label: lang === 'tn' ? 'Nako ya Tharabololo ya Potso' : 'Query Resolution Time', icon: Clock, color: '#6BBE4E' },
            ].map((s, i) => { const Icon = s.icon; return (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}>
                    <Icon size={20} style={{ color: s.color }} />
                  </div>
                  <div><p className="text-2xl font-bold text-bocra-slate">{s.value}</p><p className="text-xs text-bocra-slate/50">{s.label}</p></div>
                </div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — 3-R Model ═══ */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{lang === 'tn' ? 'Mafelo a .BW a Bereka Jang' : 'How .BW Domains Work'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-8">{lang === 'tn' ? 'BOCRA e latela Sekao sa 3-R sa boditšhabatšhaba sa Madirelo a DNS' : 'BOCRA follows the international 3-R Model of the DNS Industry'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { title: lang === 'tn' ? 'Rejisetara' : 'Registry', sub: 'BOCRA', desc: lang === 'tn' ? 'E laola le go tlhokomela database ya maina otlhe a mafelo a .bw le mafaratlhatlha.' : 'Manages and maintains the database of all .bw domain names and infrastructure.', icon: Server, color: '#00A6CE' },
              { title: lang === 'tn' ? 'Mokwadisi' : 'Registrar', sub: lang === 'tn' ? '70+ Tse di Amogeletsweng' : '70+ Accredited', desc: lang === 'tn' ? 'Dikompone tse di amogeletsweng ke BOCRA go kwadisa mafelo mo boemong jwa bareki.' : 'Companies accredited by BOCRA to register domains on behalf of customers.', icon: Building, color: '#C8237B' },
              { title: lang === 'tn' ? 'Mokwadisiwa' : 'Registrant', sub: lang === 'tn' ? 'Wena' : 'You', desc: lang === 'tn' ? 'Motho kgotsa mokgatlho o o kwadisang le go rua leina la lefelo.' : 'The person or organisation that registers and owns the domain name.', icon: Users, color: '#6BBE4E' },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 text-center hover:shadow-md transition-all relative">
                {i < 2 && <div className="hidden sm:block absolute top-1/2 -right-3 w-6 text-gray-300 text-lg font-bold">→</div>}
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: r.color + '10' }}>
                  <r.icon size={22} style={{ color: r.color }} />
                </div>
                <h3 className="font-bold text-sm text-bocra-slate">{r.title}</h3>
                <p className="text-xs font-semibold mb-2" style={{ color: r.color }}>{r.sub}</p>
                <p className="text-xs text-bocra-slate/50 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AVAILABLE EXTENSIONS ═══ */}
      <section className="py-8">
        <div className="section-wrapper">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{lang === 'tn' ? 'Dikgolosa tsa Lefelo tse di Teng' : 'Available Domain Extensions'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-6">{lang === 'tn' ? 'Tlhopha kgolosa e e siameng ya .bw bakeng sa ditlhokego tsa gago' : 'Choose the right .bw extension for your needs'}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {EXTENSIONS.map(e => (
              <button key={e.ext} onClick={() => { setSearchExt(e.ext); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="bg-white rounded-xl p-4 border border-gray-100 text-center hover:shadow-md hover:border-gray-200 transition-all">
                <p className="text-lg font-bold text-bocra-slate">{e.ext}</p>
                <p className="text-[10px] text-bocra-slate/40 mt-1">{e.desc}</p>
                {e.popular && <span className="inline-block mt-2 px-2 py-0.5 text-[9px] font-bold rounded-full bg-[#00A6CE]/10 text-[#00A6CE]">POPULAR</span>}
              </button>
            ))}
          </div>
          <p className="text-xs text-bocra-slate/30 text-center mt-4">{lang === 'tn' ? 'me.bw, shop.bw, le agric.bw di tlhagisitswe ka Mopitlo 2021 morago ga therisano le baamegi.' : 'me.bw, shop.bw, and agric.bw were introduced in March 2021 following stakeholder consultation.'}</p>
        </div>
      </section>

      {/* ═══ WHY .BW ═══ */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-6">{lang === 'tn' ? 'Goreng o Tlhophe .BW?' : 'Why Choose .BW?'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Globe, title: lang === 'tn' ? 'Boitshupo jwa Botswana' : 'Botswana Identity', desc: lang === 'tn' ? 'E bolelela baeng ka bonako gore o kgwebo kgotsa motho wa Botswana.' : 'Instantly tells visitors you are a Botswana business or individual.', color: '#00A6CE' },
              { icon: Shield, title: lang === 'tn' ? 'E Sireletswe ka DNSSEC' : 'DNSSEC Protected', desc: lang === 'tn' ? 'E sireletswa ka DNS Security Extensions kgatlhanong le go fetolwa le ditlhaselo.' : 'Secured with DNS Security Extensions against tampering and attacks.', color: '#6BBE4E' },
              { icon: Lock, title: lang === 'tn' ? 'Kgatlhanong le Phishing' : 'Anti-Phishing', desc: lang === 'tn' ? 'Didirisiwa tsa Netcraft tsa kgatlhanong le phishing di lemoga le go ntsha ditlhaselo mo lefelong la gago.' : 'Netcraft anti-phishing tools detect and take down attacks on your domain.', color: '#C8237B' },
              { icon: Zap, title: lang === 'tn' ? 'E a Kgonagala' : 'Affordable', desc: lang === 'tn' ? 'Ga go na dituelo tsa tlhokomelo bakeng sa bakwadisi. Ditlhwatlhwa tse di kgaisanyang bakeng sa bakwadisiwa.' : 'No maintenance fees for registrars. Competitive pricing for registrants.', color: '#F7B731' },
              { icon: CheckCircle, title: lang === 'tn' ? 'E e Tshwanetseng le e e Laolwang' : 'Fair & Regulated', desc: lang === 'tn' ? 'Kwadiso ya ntlha-go-tla-ntlha-go-dirediwa ka dipholisi tse di tlhamaletseng.' : 'First-come-first-served registration with clear, transparent policies.', color: '#059669' },
              { icon: Award, title: lang === 'tn' ? 'E Tshegeditswe ke Puso' : 'Government Backed', desc: lang === 'tn' ? 'E laotswe ke BOCRA ka fa tlase ga Molao wa CRA wa 2012 ka tiragatso e e feletseng ya puso.' : 'Managed by BOCRA under the CRA Act 2012 with full government mandate.', color: '#00458B' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: f.color + '15' }}>
                  <f.icon size={18} style={{ color: f.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-bocra-slate">{f.title}</h3>
                  <p className="text-xs text-bocra-slate/50 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW TO REGISTER / RENEW / TRANSFER ═══ */}
      <section className="py-8">
        <div className="section-wrapper max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-8">{lang === 'tn' ? 'Go Kwadisa, go Ntšhwafatsa le go Fetisa Jang' : 'How to Register, Renew & Transfer'}</h2>
          {[
            { title: lang === 'tn' ? 'Kwadisa Lefelo le Lesha' : 'Register a New Domain', color: '#00A6CE', steps: lang === 'tn' ? ['Tlhopha leina la lefelo la gago (sk. kgwebo_yame.co.bw)', 'Dirisa patlo e e fa godimo go tlhola gore a e teng', 'Tlhopha mokwadisi o o amogeletsweng go tswa lenaaneng le le fa tlase', 'Fana ka dintlha tsa gago: leina, tshedimosetso ya kgolagano, di-name server', 'Mokwadisi o dira kwadiso ya gago', 'Lefelo la gago la .bw le a bereka!'] : ['Choose your domain name (e.g. mybusiness.co.bw)', 'Use the search above to check if it is available', 'Pick an accredited registrar from the list below', 'Provide your details: name, contact info, name servers', 'The registrar processes your registration', 'Your .bw domain is live!'] },
            { title: lang === 'tn' ? 'Ntšhwafatsa Lefelo' : 'Renew a Domain', color: '#6BBE4E', steps: lang === 'tn' ? ['Ikgolaganye le mokwadisi wa gago pele lefelo la gago le fela', 'Bakwadisi: tsena, tlhopha lefelo, tlhopha nako ya ntšhwafatso, mme o boloke', 'Bakwadisiwa: kwalela mokwadisi wa gago o kopa ntšhwafatso', 'Tuelo e a dirwa mme lefelo le a ntšhwafadiwa'] : ['Contact your registrar before your domain expires', 'Registrars: log in, select the domain, choose renewal period, and save', 'Registrants: write to your registrar requesting renewal', 'Payment is processed and the domain is renewed'] },
            { title: lang === 'tn' ? 'Fetisa Lefelo' : 'Transfer a Domain', color: '#C8237B', steps: lang === 'tn' ? ['Kwalela mokwadisi wa gago wa jaanong o kopa phetiso', 'Ikgolaganye le mokwadisi o mosha o o o ratang', 'Mokwadisi o mosha o simolola phetiso ka rejisetara ya BOCRA', 'Bakwadisi ka bobedi ba dira mmogo mme lefelo la gago le fetela kwa motlameding o mosha'] : ['Write to your current registrar requesting the transfer', 'Contact your preferred new registrar', 'The new registrar initiates the transfer via the BOCRA registry', 'Both registrars coordinate and your domain moves to the new provider'] },
          ].map((s, si) => (
            <div key={si} className="mb-8 last:mb-0">
              <h3 className="text-base font-bold text-bocra-slate mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: s.color }}>{si + 1}</div>
                {s.title}
              </h3>
              <div className="space-y-2 ml-9">
                {s.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-bocra-off-white rounded-lg">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: s.color + '15', color: s.color }}>{i + 1}</span>
                    <p className="text-sm text-bocra-slate/60">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-sm text-amber-700">{lang === 'tn' ? <><strong>Ela Tlhoko:</strong> BOCRA ga e amogele dikopo tsa kwadiso ka tlhamalalo. O tshwanetse go kwadisa ka mokwadisi o o amogeletsweng. Ditlhwatlhwa di farologana ka mokwadisi.</> : <><strong>Note:</strong> BOCRA does not accept registration requests directly. You must register through an accredited registrar. Pricing varies by registrar.</>}</p>
          </div>
        </div>
      </section>

      {/* ═══ ACCREDITED REGISTRARS ═══ */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{lang === 'tn' ? 'Bakwadisi ba .BW ba ba Amogeletsweng' : 'Accredited .BW Registrars'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-6">{lang === 'tn' ? 'Ikgolaganye le mongwe wa bakwadisi ba ba amogeletsweng ke BOCRA go kwadisa lefelo la gago' : 'Contact any of these BOCRA-accredited registrars to register your domain'}</p>
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bocra-slate/30" />
              <input type="text" value={registrarSearch} onChange={e => setRegistrarSearch(e.target.value)} placeholder={lang === 'tn' ? 'Batla ka leina kgotsa lefelo...' : 'Search by name or location...'}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#00A6CE] outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleRegistrars.map((r, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all">
                <h3 className="font-bold text-sm text-bocra-slate mb-2">{r.name}</h3>
                <div className="space-y-1">
                  {r.email && <p className="text-xs text-bocra-slate/50 flex items-center gap-2"><Mail size={12} className="text-bocra-slate/30 flex-shrink-0" /> {r.email}</p>}
                  {r.phone && <p className="text-xs text-bocra-slate/50 flex items-center gap-2"><Phone size={12} className="text-bocra-slate/30 flex-shrink-0" /> {r.phone}</p>}
                  <p className="text-xs text-bocra-slate/50 flex items-center gap-2"><MapPin size={12} className="text-bocra-slate/30 flex-shrink-0" /> {r.location}</p>
                </div>
              </div>
            ))}
          </div>
          {filteredRegistrars.length > 6 && (
            <button onClick={() => setShowAllRegistrars(!showAllRegistrars)}
              className="mt-4 w-full py-3 text-sm text-bocra-blue font-medium hover:bg-white border border-gray-200 rounded-xl transition-all flex items-center justify-center gap-2">
              {showAllRegistrars ? (lang === 'tn' ? 'Bontsha Bonnye' : 'Show Less') : (lang === 'tn' ? `Bona Botlhe ${filteredRegistrars.length} Bakwadisi` : `View All ${filteredRegistrars.length} Registrars`)}
              <ChevronDown size={14} className={`transition-transform ${showAllRegistrars ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </section>

      {/* ═══ RESOURCES & DOCUMENTS ═══ */}
      <section className="py-8">
        <div className="section-wrapper max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{lang === 'tn' ? 'Metswedi le Dikwalo' : 'Resources & Documents'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-8">{lang === 'tn' ? 'Diforomo, dipholisi, ditaelo, le dipampiri tsa ditherisano tsa lefelo la .bw' : 'Forms, policies, guidelines, and consultation papers for the .bw domain'}</p>
          {Object.entries(NIC_DOCS).map(([category, docs], ci) => {
            const catColors = ['#00A6CE', '#C8237B', '#F7B731', '#00458B'];
            const catColor = catColors[ci % catColors.length];
            return (
              <div key={category} className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full" style={{ backgroundColor: catColor }} />
                  <h3 className="font-bold text-sm text-bocra-slate">{category}</h3>
                  <span className="text-[10px] text-bocra-slate/30">{docs.length} {docs.length === 1 ? (lang === 'tn' ? 'tokumente' : 'document') : (lang === 'tn' ? 'ditokumente' : 'documents')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {docs.map((doc, di) => (
                    <div key={di} className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3 hover:shadow-md hover:border-gray-200 transition-all group">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: catColor + '10' }}>
                        <FileText size={18} style={{ color: catColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-medium text-sm text-bocra-slate leading-tight">{doc.title}</h4>
                          {doc.type && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: (TYPE_COLORS[doc.type] || '#64748B') + '10', color: TYPE_COLORS[doc.type] || '#64748B' }}>{doc.type}</span>}
                        </div>
                        <p className="text-xs text-bocra-slate/40 leading-relaxed">{doc.desc}</p>
                        {doc.file ? (
                          <a href={`${BASE}documents/${doc.file}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-bocra-blue hover:underline">
                            <Download size={12} /> {lang === 'tn' ? 'Tsenya' : 'Download'}
                          </a>
                        ) : (
                          <span className="inline-block mt-2 text-[10px] text-bocra-slate/25">{lang === 'tn' ? 'E a tla' : 'Coming soon'}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ BECOME A REGISTRAR ═══ */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">Become an Accredited Registrar</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-6">Companies can apply to register .bw domains on behalf of customers</p>
          <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
            <h3 className="font-bold text-sm text-bocra-slate mb-4">Accreditation Process</h3>
            <div className="space-y-3">
              {[
                { text: 'Download the accreditation application form', color: '#00A6CE' },
                { text: 'Complete the form with all required information', color: '#6BBE4E' },
                { text: 'Submit to BOCRA — incomplete applications will be returned', color: '#F7B731' },
                { text: 'BOCRA verifies accuracy and assesses your capability', color: '#C8237B' },
                { text: 'Accreditation completed within 7 working days', color: '#059669' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: s.color }}>{i + 1}</span>
                  <p className="text-sm text-bocra-slate/60">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={`${BASE}documents/nic/Registrar_Accreditation_Form.pdf`} target="_blank" rel="noopener noreferrer" className="flex-1 px-5 py-3 bg-[#00458B] text-white font-bold text-sm rounded-xl text-center flex items-center justify-center gap-2">
              <Download size={16} /> Download Accreditation Form
            </a>
            <a href="mailto:registry@bocra.org.bw" className="flex-1 px-5 py-3 bg-[#00A6CE] text-white font-bold text-sm rounded-xl text-center flex items-center justify-center gap-2">
              <Mail size={16} /> registry@bocra.org.bw
            </a>
            <a href="tel:+2673685557" className="flex-1 px-5 py-3 border border-gray-200 text-bocra-slate font-medium text-sm rounded-xl text-center flex items-center justify-center gap-2 bg-white">
              <Phone size={16} /> +267 368 5557
            </a>
          </div>
          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100 text-xs text-bocra-slate/50">
            <p className="font-bold text-bocra-slate/70 mb-2">Payment Details (BWP 3,000 accreditation fee)</p>
            <p>First National Bank · Branch: Main Mall · Code: 282867 · Account: 62011115088 · SWIFT: FIRNBWGXXXX</p>
            <p className="mt-1">Deliver documents to: ATT: BW Registry, BOCRA, Plot 50671 Independence Avenue, Private Bag 00495, Gaborone</p>
          </div>
          <div className="mt-4 p-4 bg-[#001A3A] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">Already an accredited registrar?</p>
              <p className="text-xs text-white/40">Access the BOCRA .BW Registry Portal to manage domains</p>
            </div>
            <a href="https://registry.nic.net.bw" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#00A6CE] text-white font-bold text-xs rounded-lg flex items-center gap-2 flex-shrink-0 hover:bg-[#0090B5] transition-all">
              <Lock size={14} /> Registry Portal <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </section>

      {/* ═══ PARTNER LOGOS ═══ */}
      <section className="py-8">
        <div className="section-wrapper">
          <h2 className="text-lg font-bold text-bocra-slate text-center mb-2">International Partners</h2>
          <p className="text-xs text-bocra-slate/30 text-center mb-6">BOCRA's .BW registry participates in global DNS governance</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {PARTNER_LOGOS.map(p => (
              <div key={p.name} className="flex flex-col items-center gap-2">
                <img src={p.src} alt={p.name} className="h-10 sm:h-12 object-contain grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100" />
              </div>
            ))}
          </div>
          {/* TAC stakeholders */}
          <div className="mt-8 text-center">
            <p className="text-xs text-bocra-slate/30 mb-3">Technical Advisory Committee (TAC) Members</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['BOCRA', 'BOCCIM', 'BITS', 'Mascom Wireless', 'Orange Botswana', 'BTC', 'DIT', 'BISPA', 'University of Botswana'].map(s => (
                <span key={s} className="px-3 py-1.5 bg-bocra-off-white border border-gray-200 rounded-lg text-[11px] font-medium text-bocra-slate/50">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Colour bar */}
      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
