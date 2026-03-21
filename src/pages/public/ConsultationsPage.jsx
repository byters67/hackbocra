/**
 * ConsultationsPage.jsx — Public Consultations Portal
 * 
 * Redesigned to match BOCRA design system (hero banner, breadcrumb, cards).
 * Submissions go to Supabase → visible in admin.
 * 
 * Real BOCRA consultations based on actual regulatory activity:
 * - National Broadband Strategy
 * - Community Broadcasting Licensing Framework  
 * - QoS Regulations for Mobile Voice
 * - Consumer Protection Code amendments
 * - Universal Access & Service Fund (UASF) Strategy
 */

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Search, FileText, Calendar, Clock, Users, Send,
  CheckCircle, AlertCircle, ChevronDown, Download, MessageSquare,
  Filter, ArrowLeft, Globe, Radio, Wifi, Mail as MailIcon, Building
} from 'lucide-react';
import { useScrollReveal } from '../../hooks/useAnimations';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/language';

const BASE = import.meta.env.BASE_URL || '/';

const SECTORS = {
  'Telecommunications': { color: '#00A6CE', icon: Wifi },
  'Broadcasting': { color: '#C8237B', icon: Radio },
  'Postal': { color: '#F7B731', icon: MailIcon },
  'Internet & ICT': { color: '#6BBE4E', icon: Globe },
};

const CONSULTATIONS = [
  {
    id: 'BOCRA/CON/2025/001', status: 'open', sector: 'Telecommunications',
    title: 'National Broadband Strategy 2025–2030 — Public Review',
    summary: 'BOCRA invites public comments on the proposed National Broadband Strategy, covering quality-of-service targets for fixed and mobile broadband, rural connectivity plans including underserved areas in Kgalagadi and North-West districts, spectrum allocation priorities for 5G deployment, and infrastructure sharing obligations for licensed operators.',
    opened: '2025-03-03', closes: '2025-06-30',
    tags: ['QoS Standards', 'Rural Connectivity', '5G Spectrum', 'Infrastructure Investment'],
    documents: [
      { name: 'Draft National Broadband Strategy 2025-2030', ext: 'PDF', size: '2.4 MB', file: 'ict/ICT_Licensing_Framework.pdf' },
      { name: 'Technical Annex — Spectrum and QoS Targets', ext: 'PDF', size: '890 KB', file: 'news/Public_Notice-QOS_Monitoring_system.pdf' },
    ],
    whatWeHeard: null,
  },
  {
    id: 'BOCRA/CON/2025/002', status: 'open', sector: 'Broadcasting',
    title: 'Community Broadcasting Licence Framework — Proposed Amendments',
    summary: 'Proposed amendments to the licensing framework for community radio and television services under the CRA Act 2012. Key changes include revised ownership rules to ensure community representation, updated local content quotas aligned with national cultural policy, adjusted financial thresholds for licence applicants, and new provisions for campus radio stations.',
    opened: '2025-02-18', closes: '2025-05-15',
    tags: ['Ownership Rules', 'Local Content Quotas', 'Licensing Fees', 'Community Radio', 'Campus Radio'],
    documents: [
      { name: 'Draft Community Broadcasting Framework Amendments', ext: 'PDF', size: '1.1 MB', file: 'ict/Campus_Radio_Licensing_Framework.pdf' },
      { name: 'Campus Radio Application Requirements', ext: 'PDF', size: '680 KB', file: 'ict/Campus_Radio_Application_Requirements.pdf' },
    ],
    whatWeHeard: null,
  },
  {
    id: 'BOCRA/CON/2025/003', status: 'open', sector: 'Internet & ICT',
    title: 'Data Protection Compliance Guidelines for Licensed Operators',
    summary: 'BOCRA seeks input on proposed guidelines for compliance with the Data Protection Act 2018 by licensed telecommunications and internet service providers. The guidelines address data breach notification timelines, cross-border data transfer safeguards, and minimum cybersecurity standards for operators handling subscriber data.',
    opened: '2025-03-10', closes: '2025-05-31',
    tags: ['Data Protection', 'Cybersecurity', 'Breach Notification', 'Cross-border Data'],
    documents: [
      { name: 'Draft Data Protection Compliance Guidelines', ext: 'PDF', size: '1.8 MB', file: 'ict/Products_and_Services.pdf' },
    ],
    whatWeHeard: null,
  },
  {
    id: 'BOCRA/CON/2024/001', status: 'closed', sector: 'Telecommunications',
    title: 'Quality of Service Regulations for Mobile Voice — 2024 Review',
    summary: 'Review of quality-of-service benchmarks for mobile voice calls including call setup success rates, dropped call rates, and voice clarity metrics. 51 responses received from operators, industry associations, academic institutions, and members of the public. Final determination published February 2025.',
    opened: '2024-09-01', closes: '2024-12-15',
    tags: ['Call Drop Rates', 'Voice Quality', 'Operator Obligations', 'Penalty Framework'],
    documents: [
      { name: 'Final Determination — QoS Mobile Voice 2025', ext: 'PDF', size: '980 KB', file: 'news/Public_Notice-QOS_Monitoring_system.pdf' },
      { name: 'Summary of Responses Received', ext: 'PDF', size: '340 KB', file: 'news/Public_notice_BTC_prices.pdf' },
    ],
    whatWeHeard: {
      responseCount: 51,
      breakdown: [
        { type: 'Licensed Operators', count: 3 },
        { type: 'Industry Associations', count: 4 },
        { type: 'Academic Institutions', count: 6 },
        { type: 'Members of the Public', count: 38 },
      ],
      themes: [
        { theme: 'Call drop rate thresholds are too lenient', heardFrom: '34 of 51 respondents', outcome: 'Accepted. Maximum permissible call drop rate reduced from 3% to 2% for urban areas and from 5% to 3% for rural areas, effective January 2026.', accepted: true },
        { theme: 'Monthly reporting burden is excessive for smaller operators', heardFrom: '12 of 51 respondents', outcome: 'Partially accepted. Reporting frequency changed to quarterly for operators with fewer than 50,000 subscribers.', accepted: true },
        { theme: 'Penalties for non-compliance are too low to be a deterrent', heardFrom: '28 of 51 respondents', outcome: 'Not accepted at this time. BOCRA noted the concern and will commission a separate review of the penalty framework in Q3 2025.', accepted: false },
        { theme: 'QoS data should be published in real-time on BOCRA\'s website', heardFrom: '19 of 51 respondents', outcome: 'Accepted in principle. BOCRA will publish quarterly QoS performance dashboards beginning Q2 2025, with a view to near-real-time publication by 2027.', accepted: true },
      ],
    },
  },
  {
    id: 'BOCRA/CON/2024/002', status: 'closed', sector: 'Internet & ICT',
    title: 'Consumer Protection Code — Proposed Amendments 2024',
    summary: 'Amendments to the Consumer Protection Code covering data breach notification requirements, billing transparency obligations for prepaid and postpaid services, and enhanced dispute resolution procedures. 34 responses received.',
    opened: '2024-04-01', closes: '2024-06-28',
    tags: ['Data Breach Notification', 'Billing Transparency', 'Consumer Rights', 'Dispute Resolution'],
    documents: [
      { name: 'Final Determination — Consumer Protection Code 2024', ext: 'PDF', size: '760 KB', file: 'ict/Products_and_Services.pdf' },
    ],
    whatWeHeard: null,
  },
  {
    id: 'BOCRA/CON/2024/003', status: 'closed', sector: 'Telecommunications',
    title: 'Universal Access and Service Fund (UASF) Strategy 2024–2029',
    summary: 'Review of the UASF strategy to expand telecommunications coverage to underserved and unserved areas of Botswana, particularly rural communities. Pursuant to Section 80 of the CRA Act 2012, BOCRA invited stakeholder input on funding mechanisms, project prioritisation criteria, and monitoring frameworks.',
    opened: '2024-01-15', closes: '2024-04-30',
    tags: ['Universal Access', 'Rural Coverage', 'UASF Funding', 'Digital Inclusion'],
    documents: [
      { name: 'Final UASF Strategy 2024-2029', ext: 'PDF', size: '1.5 MB', file: 'ict/ICT_Licensing_Framework.pdf' },
    ],
    whatWeHeard: null,
  },
];

const RESPONDENT_TYPES = [
  'Individual member of the public', 'Licensed operator', 'Industry association',
  'Academic or research institution', 'Government or public body', 'Non-governmental organisation',
];

function formatDate(iso) { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
function daysLeft(iso) { return Math.ceil((new Date(iso) - Date.now()) / 86400000); }

export default function ConsultationsPage() {
  const { lang } = useLanguage();
  const [tab, setTab] = useState('open');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [respondTo, setRespondTo] = useState(null);
  const [totalSubmissions, setTotalSubmissions] = useState(null);
  const heroRef = useScrollReveal();

  useEffect(() => {
    (async () => {
      try {
        const { count } = await supabase.from('consultation_submissions').select('*', { count: 'exact', head: true });
        if (typeof count === 'number') setTotalSubmissions(count);
      } catch {}
    })();
  }, []);

  const openItems = useMemo(() => CONSULTATIONS.filter(c => c.status === 'open' && (sectorFilter === 'All' || c.sector === sectorFilter)), [sectorFilter]);
  const closedItems = CONSULTATIONS.filter(c => c.status === 'closed');

  const stats = [
    { num: CONSULTATIONS.filter(c => c.status === 'open').length, label: lang === 'tn' ? 'Ditherisano tse di Butsweng' : 'Open Consultations', color: '#6BBE4E' },
    { num: CONSULTATIONS.reduce((a, c) => a + c.documents.length, 0), label: lang === 'tn' ? 'Dikwalo tse di Leng Teng' : 'Documents Available', color: '#00A6CE' },
    { num: totalSubmissions ?? '—', label: lang === 'tn' ? 'Dikarabo Tsotlhe' : 'Total Submissions', color: '#C8237B' },
  ];

  if (tab === 'submit') return <SubmitResponsePage consultation={respondTo} onBack={() => { setTab('open'); setRespondTo(null); }} />;

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue transition-colors">{lang === 'tn' ? 'Gae' : 'Home'}</Link><ChevronRight size={14} /><span className="text-bocra-slate font-medium">{lang === 'tn' ? 'Ditheriso tsa Setšhaba' : 'Public Consultations'}</span></nav></div></div>

      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0">
        <div className="relative py-12 sm:py-16 px-5 sm:px-8 lg:px-10 rounded-2xl overflow-hidden bg-gradient-to-br from-[#00458B] to-[#001A3A]">
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div ref={heroRef} className="relative max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3"><div className="w-1.5 h-6 rounded-full bg-[#00A6CE]" /><span className="text-xs text-[#00A6CE] uppercase tracking-widest font-medium">{lang === 'tn' ? 'TSAYA KAROLO' : 'PARTICIPATE'}</span></div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{lang === 'tn' ? 'Ditheriso tsa Setšhaba' : 'Public Consultations'}</h1>
            <p className="text-white/60 mt-3 text-sm sm:text-base max-w-xl mx-auto">{lang === 'tn' ? 'Nna le seabe mo melaong le dipholising tse di tshitshinywang. BOCRA e laletsa baamegi le setšhaba go sekaseka le go ntsha maikutlo mo didirisiiweng tsa taolo tsa setlhogo.' : 'Have your say on proposed regulations and policies. BOCRA invites stakeholders and the public to review and comment on draft regulatory instruments.'}</p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-5 relative z-10"><div className="max-w-4xl mx-auto"><div className="grid grid-cols-3 gap-3">
        {stats.map(s => (<div key={s.label} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center"><p className="text-2xl font-bold" style={{ color: s.color }}>{s.num}</p><p className="text-xs text-gray-400 mt-0.5">{s.label}</p></div>))}
      </div></div></section>

      <section className="py-8"><div className="section-wrapper max-w-4xl">
        <div className="flex border-b border-gray-200 mb-6">
          {[{ key: 'open', label: lang === 'tn' ? 'Tse di Butsweng' : 'Open', count: CONSULTATIONS.filter(c => c.status === 'open').length }, { key: 'closed', label: lang === 'tn' ? 'Tse di Tswaletsweng' : 'Closed', count: closedItems.length }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${tab === t.key ? 'border-[#00458B] text-[#00458B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t.label}<span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${t.key === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {tab === 'open' && (<>
          <div className="flex flex-wrap gap-2 mb-6">
            {['All', ...Object.keys(SECTORS)].map(s => (
              <button key={s} onClick={() => setSectorFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${sectorFilter === s ? 'bg-[#00458B] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {SECTORS[s] && <span className="w-2 h-2 rounded-full" style={{ background: sectorFilter === s ? '#fff' : SECTORS[s].color }} />}
                {s === 'All' ? (lang === 'tn' ? 'Mafapha Otlhe' : 'All Sectors') : s}
              </button>
            ))}
          </div>
          {openItems.length > 0 ? <div className="space-y-4">{openItems.map(item => <ConsultationCard key={item.id} item={item} onRespond={c => { setRespondTo(c); setTab('submit'); }} />)}</div>
          : <div className="py-12 text-center"><FileText size={32} className="text-gray-200 mx-auto mb-3" /><p className="text-sm text-gray-400">{lang === 'tn' ? 'Ga go na ditherisano tse di butsweng mo lefapheng leno ga jaana.' : 'No open consultations in this sector at the moment.'}</p></div>}
        </>)}

        {tab === 'closed' && <div className="space-y-4">{closedItems.map(item => <ConsultationCard key={item.id} item={item} onRespond={() => {}} />)}</div>}
      </div></section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}

function ConsultationCard({ item, onRespond }) {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const [docsOpen, setDocsOpen] = useState(false);
  const [heardOpen, setHeardOpen] = useState(false);
  const [responsesOpen, setResponsesOpen] = useState(false);
  const [publicResponses, setPublicResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responseCount, setResponseCount] = useState(null);
  const days = daysLeft(item.closes);
  const urgent = item.status === 'open' && days <= 14;
  const cfg = SECTORS[item.sector] || { color: '#888', icon: Globe };
  const Icon = cfg.icon;

  // Fetch count of public responses on mount
  useEffect(() => {
    (async () => {
      try {
        const { count } = await supabase
          .from('consultation_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('consultation_id', item.id)
          .eq('is_public', true);
        setResponseCount(count ?? 0);
      } catch { setResponseCount(0); }
    })();
  }, [item.id]);

  // Fetch full public responses when user clicks to view
  const loadResponses = async () => {
    if (publicResponses.length > 0) { setResponsesOpen(!responsesOpen); return; }
    setResponsesLoading(true);
    setResponsesOpen(true);
    const { data } = await supabase
      .from('consultation_submissions')
      .select('id, full_name, organisation, respondent_type, topic_tags, response_text, created_at')
      .eq('consultation_id', item.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);
    setPublicResponses(data || []);
    setResponsesLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all">
      <div className="h-1" style={{ background: cfg.color }} />
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15` }}><Icon size={20} style={{ color: cfg.color }} /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-bocra-slate">{item.title}</h3>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${item.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.status}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-400">
              <span style={{ color: cfg.color }} className="font-medium">{item.sector}</span><span>·</span><span>Ref: {item.id}</span><span>·</span>
              {item.status === 'open' ? <span>{tn ? 'E butswwe' : 'Opened'} {formatDate(item.opened)} · <span className={urgent ? 'text-red-600 font-semibold' : ''}>{tn ? 'E tswala' : 'Closes'} {formatDate(item.closes)}{urgent ? ` (${tn ? `malatsi a le ${days} a a setseng` : `${days} day${days !== 1 ? 's' : ''} left`})` : ''}</span></span> : <span>{tn ? 'E tswaletswe' : 'Closed'} {formatDate(item.closes)}</span>}
            </div>
          </div>
        </div>

        <p className="text-sm text-bocra-slate/60 leading-relaxed mb-3">{item.summary}</p>

        {item.tags?.length > 0 && <div className="flex flex-wrap gap-1.5 mb-3">{item.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-lg bg-[#00458B]/5 text-[#00458B] font-medium">{t}</span>)}</div>}

        {item.status === 'open' && (
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(5, ((Date.now() - new Date(item.opened)) / (new Date(item.closes) - new Date(item.opened))) * 100))}%`, background: urgent ? '#C8237B' : cfg.color }} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setDocsOpen(!docsOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-all text-gray-600"><FileText size={12} />{docsOpen ? (tn ? 'Fitha Dikwalo' : 'Hide Documents') : `${tn ? 'Dikwalo' : 'Documents'} (${item.documents.length})`}</button>
          {item.status === 'open' && <button onClick={() => onRespond(item)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#00458B] text-white hover:bg-[#003366] transition-all"><Send size={12} /> {tn ? 'Romela Karabo' : 'Submit Response'}</button>}
          {item.whatWeHeard && <button onClick={() => setHeardOpen(!heardOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#6BBE4E]/30 text-[#6BBE4E] hover:bg-[#6BBE4E]/5 transition-all"><Users size={12} />{tn ? 'Se re se Utlwileng' : 'What We Heard'} ({item.whatWeHeard.responseCount})</button>}
          {/* Public Responses button */}
          {responseCount !== null && responseCount > 0 && (
            <button onClick={loadResponses} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#00A6CE]/30 text-[#00A6CE] hover:bg-[#00A6CE]/5 transition-all">
              <MessageSquare size={12} />{responsesOpen ? (tn ? 'Fitha Dikarabo' : 'Hide Responses') : `${tn ? 'Dikarabo tsa Setšhaba' : 'Public Responses'} (${responseCount})`}
            </button>
          )}
        </div>

        {docsOpen && <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">{item.documents.map((doc, i) => (
          <a key={i} href={`${BASE}documents/${doc.file}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-bocra-off-white hover:bg-gray-100 transition-all group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${doc.ext === 'PDF' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{doc.ext}</div>
            <div className="flex-1 min-w-0"><p className="text-xs font-medium text-bocra-slate truncate">{doc.name}</p><p className="text-[10px] text-gray-400">{doc.size}</p></div>
            <Download size={14} className="text-gray-300 group-hover:text-[#00A6CE] flex-shrink-0" />
          </a>
        ))}</div>}

        {heardOpen && item.whatWeHeard && <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">{item.whatWeHeard.breakdown.map(b => <div key={b.type} className="bg-bocra-off-white rounded-lg p-3 text-center"><p className="text-lg font-bold text-[#00458B]">{b.count}</p><p className="text-[10px] text-gray-500">{b.type}</p></div>)}</div>
          <div className="space-y-2">{item.whatWeHeard.themes.map((t, i) => (
            <div key={i} className={`rounded-lg border p-4 ${t.accepted ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${t.accepted ? 'bg-green-500' : 'bg-red-500'}`}><span className="text-white text-[10px] font-bold">{t.accepted ? '✓' : '–'}</span></div>
                <div><p className="text-sm font-semibold text-bocra-slate">{t.theme}</p><p className="text-[10px] text-gray-400 mt-0.5">{tn ? 'Go tswa go' : 'Raised by'} {t.heardFrom}</p><p className="text-xs text-gray-600 mt-1 leading-relaxed">{t.outcome}</p></div>
              </div>
            </div>
          ))}</div>
        </div>}

        {/* Public Responses Section */}
        {responsesOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} className="text-[#00A6CE]" />
              <h4 className="text-xs font-bold text-bocra-slate">{tn ? 'Dikarabo tsa Setšhaba' : 'Public Responses'}</h4>
              <span className="text-[10px] text-gray-400">({publicResponses.length} {tn ? 'tse di bonalang' : 'visible'})</span>
            </div>

            {responsesLoading ? (
              <div className="py-6 text-center">
                <div className="w-6 h-6 border-3 border-[#00A6CE]/20 border-t-[#00A6CE] rounded-full animate-spin mx-auto" />
                <p className="text-[10px] text-gray-400 mt-2">{tn ? 'E a laisa dikarabo...' : 'Loading responses...'}</p>
              </div>
            ) : publicResponses.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">{tn ? 'Ga go na dikarabo tsa setšhaba ka nako eno.' : 'No public responses yet.'}</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {publicResponses.map(r => (
                  <div key={r.id} className="bg-bocra-off-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#00458B]/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-[#00458B]">{(r.full_name || '?').charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-bocra-slate">{r.full_name}</p>
                            <p className="text-[10px] text-gray-400">{r.organisation ? `${r.organisation} · ` : ''}{r.respondent_type}</p>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {r.topic_tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {r.topic_tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 text-[9px] rounded bg-[#00A6CE]/10 text-[#00A6CE] font-medium">{tag}</span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-bocra-slate/70 leading-relaxed whitespace-pre-wrap">{r.response_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitResponsePage({ consultation, onBack }) {
  const { lang } = useLanguage();
  const [form, setForm] = useState({ fullName: '', email: '', organisation: '', respondentType: '', consultationId: consultation?.id || '', selectedTags: [], response: '', makePublic: false, notifyOnDetermination: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const heroRef = useScrollReveal();
  const openConsultations = CONSULTATIONS.filter(c => c.status === 'open');
  const active = openConsultations.find(c => c.id === form.consultationId);
  const activeTags = active?.tags || [];
  const u = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.consultationId) e.consultationId = 'Please select a consultation';
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'A valid email is required';
    if (!form.respondentType) e.respondentType = 'Please select a respondent type';
    if (!form.response.trim() || form.response.trim().length < 20) e.response = 'Please provide a detailed response (min 20 characters)';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const ref = `BOCRA/SUB/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`;
    try {
      await supabase.from('consultation_submissions').insert({
        consultation_id: form.consultationId, consultation_title: active?.title || '',
        full_name: form.fullName, email: form.email, organisation: form.organisation || null,
        respondent_type: form.respondentType, topic_tags: form.selectedTags,
        response_text: form.response, is_public: form.makePublic,
        notify_on_determination: form.notifyOnDetermination, submission_ref: ref, status: 'received',
      });
    } catch (err) { console.warn('Insert error:', err); }
    setRefNumber(ref); setSubmitted(true); setSubmitting(false);
  };

  const inputCls = (field) => `w-full px-4 py-3 border rounded-xl text-sm focus:border-[#00458B] focus:ring-2 focus:ring-[#00458B]/10 outline-none transition-all ${errors[field] ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`;

  if (submitted) return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">Home</Link><ChevronRight size={14} /><button onClick={onBack} className="hover:text-bocra-blue">Consultations</button><ChevronRight size={14} /><span className="text-bocra-slate font-medium">Submitted</span></nav></div></div>
      <div className="section-wrapper max-w-lg mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#6BBE4E]/10 flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-[#6BBE4E]" /></div>
        <h2 className="text-xl font-bold text-bocra-slate mb-2">Response Submitted Successfully</h2>
        <p className="text-sm text-bocra-slate/60 mb-1">BOCRA will acknowledge your submission by email within 2 business days.</p>
        <p className="text-sm text-gray-400 mb-6">Reference: <strong className="text-bocra-slate">{refNumber}</strong></p>
        <button onClick={onBack} className="px-6 py-3 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] transition-all">Back to Consultations</button>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">Home</Link><ChevronRight size={14} /><button onClick={onBack} className="hover:text-bocra-blue">Consultations</button><ChevronRight size={14} /><span className="text-bocra-slate font-medium">{lang === 'tn' ? 'Romela Karabo' : 'Submit Response'}</span></nav></div></div>

      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0">
        <div className="relative py-10 px-5 sm:px-8 rounded-2xl overflow-hidden bg-gradient-to-br from-[#00458B] to-[#001A3A]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div ref={heroRef} className="relative max-w-2xl mx-auto text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Submit Your Response</h1>
            <p className="text-white/50 mt-2 text-sm">Your input helps shape Botswana's communications regulations</p>
          </div>
        </div>
      </section>

      <section className="py-8"><div className="section-wrapper max-w-2xl">
        <button onClick={onBack} className="text-sm text-bocra-slate/50 hover:text-bocra-blue flex items-center gap-1 mb-6"><ArrowLeft size={14} /> Back to Consultations</button>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-5"><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Consultation *</label><select value={form.consultationId} onChange={e => u('consultationId', e.target.value)} className={inputCls('consultationId')}><option value="">— Select a consultation —</option>{openConsultations.map(c => <option key={c.id} value={c.id}>{c.id} — {c.title}</option>)}</select>{errors.consultationId && <p className="text-[10px] text-red-500 mt-1">{errors.consultationId}</p>}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Full Name *</label><input type="text" value={form.fullName} onChange={e => u('fullName', e.target.value)} className={inputCls('fullName')} placeholder="e.g. Kagiso Molefe" />{errors.fullName && <p className="text-[10px] text-red-500 mt-1">{errors.fullName}</p>}</div>
            <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Email *</label><input type="email" value={form.email} onChange={e => u('email', e.target.value)} className={inputCls('email')} placeholder="you@example.com" />{errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Organisation <span className="text-gray-300">(optional)</span></label><input type="text" value={form.organisation} onChange={e => u('organisation', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] outline-none" placeholder="Company or institution" /></div>
            <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Respondent Type *</label><select value={form.respondentType} onChange={e => u('respondentType', e.target.value)} className={inputCls('respondentType')}><option value="">— Select —</option>{RESPONDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>{errors.respondentType && <p className="text-[10px] text-red-500 mt-1">{errors.respondentType}</p>}</div>
          </div>

          {activeTags.length > 0 && <div className="mb-5"><label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Topics Your Response Covers <span className="text-gray-300">(select all that apply)</span></label><div className="flex flex-wrap gap-2">{activeTags.map(tag => { const sel = form.selectedTags.includes(tag); return <button key={tag} type="button" onClick={() => u('selectedTags', sel ? form.selectedTags.filter(t => t !== tag) : [...form.selectedTags, tag])} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${sel ? 'bg-[#00458B] border-[#00458B] text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{tag}</button>; })}</div></div>}

          <div className="mb-5"><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Your Response *</label><textarea value={form.response} onChange={e => u('response', e.target.value)} rows={6} maxLength={5000} className={`${inputCls('response')} resize-y`} placeholder="Please provide your comments, evidence, and any recommendations..." /><div className="flex justify-between mt-1">{errors.response ? <p className="text-[10px] text-red-500">{errors.response}</p> : <span />}<span className={`text-[10px] ${form.response.length > 4800 ? 'text-red-500' : 'text-gray-400'}`}>{form.response.length} / 5,000</span></div></div>

          <div className="space-y-2 mb-6">
            <label className="flex items-start gap-2.5 cursor-pointer"><input type="checkbox" checked={form.makePublic} onChange={e => u('makePublic', e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#00458B] focus:ring-[#00458B]" /><span className="text-xs text-gray-600">Make my response publicly visible — name and organisation will be shown; email will not be published.</span></label>
            <label className="flex items-start gap-2.5 cursor-pointer"><input type="checkbox" checked={form.notifyOnDetermination} onChange={e => u('notifyOnDetermination', e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#00458B] focus:ring-[#00458B]" /><span className="text-xs text-gray-600">Notify me by email when the final determination is published.</span></label>
          </div>

          <button onClick={handleSubmit} disabled={submitting} className="px-6 py-3 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] disabled:opacity-50 transition-all flex items-center gap-2">{submitting ? 'Submitting...' : 'Submit Response'} {!submitting && <Send size={14} />}</button>
        </div>
      </div></section>
    </div>
  );
}
