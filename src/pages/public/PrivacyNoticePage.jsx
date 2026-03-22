/**
 * PrivacyNoticePage — Redesigned with card-based sections
 * Route: /privacy-notice
 * Fully bilingual EN/TN
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, ChevronDown, Shield, User, Database, Scale,
  Lock, Clock, Eye, Server, Cookie, RefreshCw, AlertTriangle,
  Mail, Phone, MapPin, ExternalLink
} from 'lucide-react';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';
import { useStaggerReveal } from '../../hooks/useAnimations';

const getSections = (tn) => [
  {
    id: 'controller', icon: User, color: '#00458B',
    title: tn ? '1. Molaodi wa Data' : '1. Data Controller',
    content: tn
      ? 'Bothati jwa Taolo ya Dikgolagano jwa Botswana\nPlot 50671 Independence Avenue\nPrivate Bag 00495, Gaborone, Botswana\nMogala: +267 395 7755 | Imeile: privacy@bocra.org.bw'
      : 'The Botswana Communications Regulatory Authority\nPlot 50671 Independence Avenue\nPrivate Bag 00495, Gaborone, Botswana\nTel: +267 395 7755 | Email: privacy@bocra.org.bw',
  },
  {
    id: 'collect', icon: Database, color: '#00A6CE',
    title: tn ? '2. Data ya Poraefete e Re e Kokoanytseng' : '2. Personal Data We Collect',
    intro: tn ? 'Re kokoanya fela data ya poraefete e e tlhokegang bakeng sa maikaelelo a mongwe le mongwe:' : 'We collect only the minimum personal data necessary for each purpose:',
    table: {
      headers: tn ? ['Karolo', 'Data e e Kokoantsweng', 'Motswedi'] : ['Category', 'Data Collected', 'Source'],
      rows: tn ? [
        ['Dipotso tsa kgolagano', 'Leina, imeile, mogala, molaetsa', 'Foromo ya kgolagano'],
        ['Dingongorego tsa badirisi', 'Leina, khampani, imeile, mogala, dintlha tsa ngongorego, motlamedi wa tirelo', 'Foromo ya ngongorego'],
        ['Dikopo tsa dilaesense', 'Leina, khampani, imeile, mogala, Omang, aterese, dithuto', 'Foromo ya kopo'],
        ['Ditiragalo tsa tshireletso ya saebo', 'Dintlha tsa tiragalo; ka boithaopo: leina, imeile, mogala', 'Foromo ya pegelo ya tiragalo'],
        ['Di-akaunto tsa potala', 'Leina, imeile, lefoko la sephiri (le fitlhilwe), karolo', 'Kwadiso'],
        ['Data ya go bala', 'Dikgatlhegelo tsa dikhukhi, kgatlhegelo ya puo', 'Seporausara (localStorage)'],
      ] : [
        ['Contact enquiries', 'Name, email, phone, message', 'Contact form'],
        ['Consumer complaints', 'Name, company, email, phone, complaint details, service provider', 'Complaint form'],
        ['Licence applications', 'Name, company, email, phone, Omang, address, qualifications', 'Application form'],
        ['Cybersecurity incidents', 'Incident details; optionally: name, email, phone', 'Incident report form'],
        ['Portal accounts', 'Name, email, password (hashed), role', 'Registration'],
        ['Browsing data', 'Cookie preferences, language preference', 'Browser (localStorage)'],
      ],
    },
  },
  {
    id: 'legal', icon: Scale, color: '#6BBE4E',
    title: tn ? '3. Motheo wa Molao wa go Dirisa Data' : '3. Legal Basis for Processing',
    intro: tn ? 'Re dirisa data ya poraefete ka fa tlase ga metheo ya molao e e tlhalositsweng mo Molaong wa Tshireletso ya Data, 2018:' : 'We process personal data under the following legal bases as defined in the Data Protection Act, 2018:',
    items: tn ? [
      { bold: 'Tumelelo', text: '— O fana ka tumelelo e e tlhamaletseng ka lebokoso la go tlhola mo foromong nngwe le nngwe pele ga go romela (Karolo 18).' },
      { bold: 'Kgatlhego e e tshwanetseng', text: '— Go dirisa go go tlhokegang bakeng sa taolo ya BOCRA ka fa tlase ga Molao wa Bothati jwa Taolo ya Dikgolagano, 2012.' },
      { bold: 'Tlamelo ya molao', text: '— Go dirisa go go tlhokegang go obamela Molao wa Tshireletso ya Saebo, 2025 kgotsa molao o mongwe o o maleba.' },
    ] : [
      { bold: 'Consent', text: '— You provide explicit consent via the checkbox on each form before submission (Section 18).' },
      { bold: 'Legitimate interest', text: "— Processing necessary for BOCRA's regulatory mandate under the Communications Regulatory Authority Act, 2012." },
      { bold: 'Legal obligation', text: '— Processing required to comply with the Cybersecurity Act, 2025 or other applicable legislation.' },
    ],
  },
  {
    id: 'use', icon: Eye, color: '#C8237B',
    title: tn ? '4. Re Dirisa Data ya Gago Jang' : '4. How We Use Your Data',
    bullets: tn ? [
      'Go batlisisa le go rarabolola dingongorego tsa badirisi',
      'Go dirisa dikopo tsa dilaesense le tumelelo ya mofuta',
      'Go araba dipotso le dikwalo',
      'Go batlisisa ditiragalo tsa tshireletso ya saebo (tiro ya CSIRT)',
      'Go tlhagisa dipalopalo tse di sa bonaleng bakeng sa dipegelo tsa taolo',
      'Go tokafatsa tiragatso ya webosaete le maitemogelo a modirisi',
    ] : [
      'Investigating and resolving consumer complaints',
      'Processing licence and type approval applications',
      'Responding to enquiries and correspondence',
      'Investigating cybersecurity incidents (CSIRT function)',
      'Generating anonymised statistics for regulatory reporting',
      'Improving website functionality and user experience',
    ],
    note: tn ? 'Ga re dirise data ya gago bakeng sa papatso, go tlhatlhoba, kgotsa go tsaya ditshwetso ka motšhine.' : 'We do not use your data for marketing, profiling, or automated decision-making.',
  },
  {
    id: 'sharing', icon: ExternalLink, color: '#F7B731',
    title: tn ? '5. Go Abelana Data' : '5. Data Sharing',
    intro: tn ? 'Data ya gago e ka abelanwa le:' : 'Your data may be shared with:',
    items: tn ? [
      { bold: 'Balaodi ba ba nang le dilaesense', text: '— dintlha tsa ngongorego di abelanwa le motlamedi wa tirelo o o maleba go rarabolola' },
      { bold: 'Tiragatso ya molao', text: '— fa go tlhokega ka molao kgotsa taelo ya kgotla' },
      { bold: 'Supabase Inc.', text: '— motlamedi wa rona wa database ya leru, o o dirisang data ka fa tlase ga ditshireletso tse di gagametseng tsa konteraka' },
    ] : [
      { bold: 'Licensed operators', text: '— complaint details shared with the relevant service provider for resolution' },
      { bold: 'Law enforcement', text: '— when required by law or court order' },
      { bold: 'Supabase Inc.', text: '— our cloud database provider, which processes data under strict contractual safeguards' },
    ],
    note: tn ? 'Ga re ke re rekise data ya poraefete go boemong jwa boraro.' : 'We never sell personal data to third parties.',
  },
  {
    id: 'retention', icon: Clock, color: '#7C3AED',
    title: tn ? '6. Pholisi ya go Boloka Data' : '6. Data Retention Policy',
    table: {
      headers: tn ? ['Mofuta wa Data', 'Nako ya go Boloka', 'Morago ga go Fela'] : ['Data Type', 'Retention Period', 'After Expiry'],
      rows: tn ? [
        ['Dingongorego tsa badirisi', 'Dingwaga di le 3 morago ga tharabololo', 'E sa bonaleng kgotsa e phimolwa'],
        ['Dikopo tsa dilaesense', 'Nako ya laesense + dingwaga di le 2', 'E bolokwa go bo e phimolwa'],
        ['Dipotso tsa kgolagano', 'Ngwaga e le 1', 'E phimolwa'],
        ['Ditiragalo tsa tshireletso ya saebo', 'Dingwaga di le 5 (tlhokego ya Molao wa Tshireletso ya Saebo)', 'E sa bonaleng'],
        ['Di-akaunto tsa potala', 'Go fitlha go kopiwang go phimolwa ga akaunto', 'E phimolwa mo malatsing a le 30'],
        ['Dithulaganyo tsa tlhatlhobo', 'Dingwaga di le 2', 'E phimolwa ka motšhine'],
        ['Dikgatlhegelo tsa dikhukhi', 'Dikgwedi di le 12', 'E botsiwang gape'],
      ] : [
        ['Consumer complaints', '3 years from resolution', 'Anonymised or deleted'],
        ['Licence applications', 'Duration of licence + 2 years', 'Archived then deleted'],
        ['Contact enquiries', '1 year', 'Deleted'],
        ['Cybersecurity incidents', '5 years (Cybersecurity Act requirement)', 'Anonymised'],
        ['Portal accounts', 'Until account deletion requested', 'Deleted within 30 days'],
        ['Audit logs', '2 years', 'Purged automatically'],
        ['Cookie preferences', '12 months', 'Re-prompted'],
      ],
    },
  },
  {
    id: 'rights', icon: Shield, color: '#059669',
    title: tn ? '7. Ditshwanelo tsa Gago' : '7. Your Rights',
    intro: tn ? 'Ka fa tlase ga Molao wa Tshireletso ya Data, 2018, o na le tshwanelo ya go:' : 'Under the Data Protection Act, 2018, you have the right to:',
    items: tn ? [
      { bold: 'Phitlhelelo', text: '— Kopa khopi ya data ya poraefete e re e tshotseng ka ga gago' },
      { bold: 'Go baakanya', text: '— Kopa go baakanya data e e fosagetseng kgotsa e e sa felang' },
      { bold: 'Go phimola', text: '— Kopa go phimolwa ga data ya gago (go ya ka ditlhokego tsa go boloka ka molao)' },
      { bold: 'Go lepalepanya go dirisiwa', text: '— Kopa gore re lepalepanye ka fa re dirisang data ya gago' },
      { bold: 'Go fetisa data', text: '— Kopa data ya gago ka mofuta o o rulagantsweng, o o balwang ke motšhine' },
      { bold: 'Go gogela morago tumelelo', text: '— Gogela morago tumelelo ya gago nako nngwe le nngwe kwa ntle ga go ama go dirisiwa ga pele' },
    ] : [
      { bold: 'Access', text: '— Request a copy of the personal data we hold about you' },
      { bold: 'Rectification', text: '— Request correction of inaccurate or incomplete data' },
      { bold: 'Erasure', text: '— Request deletion of your data (subject to legal retention requirements)' },
      { bold: 'Restrict processing', text: '— Request that we limit how we use your data' },
      { bold: 'Data portability', text: '— Request your data in a structured, machine-readable format' },
      { bold: 'Withdraw consent', text: '— Withdraw your consent at any time without affecting prior processing' },
    ],
    note: tn
      ? 'Go diragatsa ditshwanelo dingwe tsa tsona, romela kopo ka Potala ya My BOCRA kgotsa imeile privacy@bocra.org.bw. Re tla araba mo malatsing a le 30.'
      : 'To exercise any of these rights, submit a request through the My BOCRA Portal or email privacy@bocra.org.bw. We will respond within 30 days.',
  },
  {
    id: 'security', icon: Lock, color: '#00458B',
    title: tn ? '8. Dikgato tsa Tshireletso' : '8. Security Measures',
    intro: tn ? 'Re diragatsa dikgato tse di tshwanetseng tsa setegeniki le tsa setheo go sireletsa data ya gago ya poraefete:' : 'We implement appropriate technical and organisational measures to protect your personal data:',
    bullets: tn ? [
      'Encryption ya TLS bakeng sa data yotlhe e e fetisiwang',
      'Dipholisi tsa Tshireletso ya Mola (RLS) ya database — badirisi ba ka fitlhelela fela data ya bone',
      'Taolo ya phitlhelelo e e theilweng mo maemong bakeng sa badiredi ba tsamaiso',
      'Go kwala ga tlhatlhobo go go sa fetolweng ga phitlhelelo yotlhe ya data le diphetogo',
      'Dihlogo tsa Pholisi ya Tshireletso ya Diteng (CSP) go thibela ditlhaselo tsa XSS',
      'Go phepafatsa data e e tsentsweng mo diforomong tsotlhe',
      'Ditekolo tsa tshireletso tse di tsamaelanang le OWASP Top 10',
    ] : [
      'TLS encryption for all data in transit',
      'Row Level Security (RLS) database policies — users can only access their own data',
      'Role-based access control for administrative staff',
      'Immutable audit logging of all data access and changes',
      'Content Security Policy (CSP) headers to prevent XSS attacks',
      'Input sanitisation on all forms',
      'Regular security assessments aligned with OWASP Top 10',
    ],
  },
  {
    id: 'cookies', icon: Cookie, color: '#F7B731',
    title: tn ? '9. Dikhukhi' : '9. Cookies',
    content: tn
      ? 'Webosaete eno e dirisa fela dikhukhi tse di botlhokwa (kgatlhegelo ya puo le kgetho ya tumelelo ya dikhukhi tse di bolokilweng mo localStorage ya seporausara sa gago). Ga re dirise dikhukhi tsa go latela, dikhukhi tsa tshekatsheko, kgotsa dikhukhi tsa papatso ya boemong jwa boraro. Bona phanara ya rona ya dikhukhi bakeng sa ditaolo.'
      : "This website uses only essential cookies (language preference and cookie consent choice stored in your browser's localStorage). We do not use tracking cookies, analytics cookies, or third-party advertising cookies. See our cookie banner for controls.",
  },
  {
    id: 'changes', icon: RefreshCw, color: '#00A6CE',
    title: tn ? '10. Diphetogo mo Kitsisong Eno' : '10. Changes to This Notice',
    content: tn
      ? 'Re ka fetola Kitsiso eno ya Poraefete nako le nako. Letlha la "E fetotswe la bofelo" kwa godimo le tla bontsha phetogo ya bosheng. Diphetogo tse dikgolo di tla itsisiwe ka phanara mo webosaeteng.'
      : 'We may update this Privacy Notice from time to time. The "Last updated" date at the top will reflect the most recent revision. Material changes will be communicated via a banner on the website.',
  },
  {
    id: 'complaints', icon: AlertTriangle, color: '#C8237B',
    title: tn ? '11. Dingongorego' : '11. Complaints',
    content: tn
      ? 'Fa o dumela gore ditshwanelo tsa gago tsa tshireletso ya data di tloditswe, o ka tlhagisa ngongorego le BOCRA kwa privacy@bocra.org.bw kgotsa le bothati jo bo maleba ka fa tlase ga Molao wa Tshireletso ya Data, 2018.'
      : 'If you believe your data protection rights have been violated, you may lodge a complaint with BOCRA at privacy@bocra.org.bw or with the relevant supervisory authority under the Data Protection Act, 2018.',
  },
];

function SectionCard({ section, isOpen, toggle }) {
  const Icon = section.icon;
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all">
      <button onClick={toggle} className="flex items-center gap-3 w-full p-5 text-left">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${section.color}12` }}>
          <Icon size={18} style={{ color: section.color }} />
        </div>
        <h3 className="flex-1 text-sm font-bold text-bocra-slate">{section.title}</h3>
        <ChevronDown size={16} className={`text-gray-300 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-gray-500' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-3">
          {section.intro && <p className="text-sm text-bocra-slate/60 leading-relaxed">{section.intro}</p>}
          {section.content && <p className="text-sm text-bocra-slate/60 leading-relaxed whitespace-pre-line">{section.content}</p>}
          {section.items && (
            <div className="space-y-2">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: section.color }} />
                  <p className="text-sm text-bocra-slate/60 leading-relaxed"><strong className="text-bocra-slate/80">{item.bold}</strong> {item.text}</p>
                </div>
              ))}
            </div>
          )}
          {section.bullets && (
            <div className="space-y-2">
              {section.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: section.color }} />
                  <p className="text-sm text-bocra-slate/60 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          )}
          {section.table && (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bocra-off-white">
                    {section.table.headers.map((h, i) => (
                      <th key={i} className="text-left px-3 py-2 text-[11px] font-bold text-bocra-slate/60 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      {row.map((cell, j) => (
                        <td key={j} className={`px-3 py-2.5 text-xs ${j === 0 ? 'font-medium text-bocra-slate/70' : 'text-bocra-slate/50'}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {section.note && (
            <p className="text-xs text-bocra-slate/50 bg-bocra-off-white rounded-lg px-3 py-2 mt-2">{section.note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PrivacyNoticePage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const sections = getSections(tn);
  const [openSections, setOpenSections] = useState(new Set(['controller']));
  const cardsRef = useStaggerReveal({ stagger: 0.06 });

  const toggle = (id) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenSections(new Set(sections.map(s => s.id)));
  const collapseAll = () => setOpenSections(new Set());

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">{tn ? 'Kitsiso ya Poraefete' : 'Privacy Notice'}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <PageHero
        category="LEGAL" categoryTn="MOLAO"
        title="Privacy Notice" titleTn="Kitsiso ya Poraefete"
        description="How BOCRA collects, uses, stores, and protects your personal data in compliance with the Data Protection Act, 2018."
        descriptionTn="Ka fa BOCRA e kokoanytseng, dirisang, bolokang, le sireletsang data ya gago ya poraefete go ya ka Molao wa Tshireletso ya Data, 2018."
        color="blue"
      />

      {/* Effective date + intro */}
      <section className="py-8">
        <div className="section-wrapper max-w-3xl">
          <div className="bg-bocra-off-white rounded-xl p-5 mb-6 flex items-center gap-3">
            <Clock size={18} className="text-bocra-blue flex-shrink-0" />
            <p className="text-sm text-bocra-slate/60">
              <span className="font-medium text-bocra-slate">{tn ? 'E simolola: 1 Ferikgong 2026' : 'Effective: 1 January 2026'}</span>
              {' | '}
              <span>{tn ? 'E fetotswe la bofelo: 18 Mopitlo 2026' : 'Last updated: 18 March 2026'}</span>
            </p>
          </div>
          <p className="text-sm text-bocra-slate/60 leading-relaxed">
            {tn
              ? 'Kitsiso eno ya Poraefete e tlhalosa ka fa Bothati jwa Taolo ya Dikgolagano jwa Botswana ("BOCRA", "rona") bo kokoanytseng, dirisang, bolokang, le sireletsang data ya gago ya poraefete fa o dirisa webosaete ya rona le ditirelo. E gatisitswe go obamela Molao wa Tshireletso ya Data, 2018 (Cap. 53:04).'
              : 'This Privacy Notice explains how the Botswana Communications Regulatory Authority ("BOCRA", "we", "us") collects, uses, stores, and protects your personal data when you use our website and services. It is issued in compliance with the Data Protection Act, 2018 (Cap. 53:04).'}
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="pb-12">
        <div className="section-wrapper max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-bocra-slate/40">{sections.length} {tn ? 'dikarolo' : 'sections'}</p>
            <div className="flex gap-2">
              <button onClick={expandAll} className="text-[11px] text-bocra-blue hover:underline">{tn ? 'Bula Tsotlhe' : 'Expand All'}</button>
              <span className="text-gray-300">|</span>
              <button onClick={collapseAll} className="text-[11px] text-bocra-blue hover:underline">{tn ? 'Tswala Tsotlhe' : 'Collapse All'}</button>
            </div>
          </div>

          <div ref={cardsRef} className="space-y-2">
            {sections.map(section => (
              <SectionCard
                key={section.id}
                section={section}
                isOpen={openSections.has(section.id)}
                toggle={() => toggle(section.id)}
              />
            ))}
          </div>

          {/* Contact card */}
          <div className="mt-8 bg-gradient-to-br from-[#00458B] to-[#003366] rounded-xl p-6 text-white">
            <h3 className="text-base font-bold mb-1">{tn ? '12. Kgolagano' : '12. Contact'}</h3>
            <p className="text-xs text-white/50 mb-4">{tn ? 'Bakeng sa dipotso tsotlhe tse di amanang le poraefete:' : 'For all privacy-related enquiries:'}</p>
            <div className="space-y-2">
              <a href="mailto:privacy@bocra.org.bw" className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                <Mail size={14} className="text-[#00A6CE]" /> privacy@bocra.org.bw
              </a>
              <a href="tel:+2673957755" className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                <Phone size={14} className="text-[#00A6CE]" /> +267 395 7755
              </a>
              <p className="flex items-start gap-2 text-sm text-white/80">
                <MapPin size={14} className="text-[#00A6CE] mt-0.5 flex-shrink-0" />
                {tn ? 'Moofisiri wa Tshireletso ya Data, BOCRA, Private Bag 00495, Gaborone, Botswana' : 'Data Protection Officer, BOCRA, Private Bag 00495, Gaborone, Botswana'}
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <Link to="/portal/data-request" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors">
                {tn ? 'Potala ya My BOCRA' : 'My BOCRA Portal'}
              </Link>
              <Link to="/contact" className="px-4 py-2 bg-[#00A6CE] hover:bg-[#0090b5] rounded-lg text-xs font-medium transition-colors">
                {tn ? 'Ikgolaganye le Rona' : 'Contact Us'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
