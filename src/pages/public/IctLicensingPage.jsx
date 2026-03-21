/**
 * ICT Licensing Framework Page — Redesigned
 * Category cards → click to see documents. Fully bilingual.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Download, FileText, Search, Shield, Radio,
  Building, Users, Globe, Award, BookOpen, ArrowLeft, X
} from 'lucide-react';
import { useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

const BASE = import.meta.env.BASE_URL;

const getSECTIONS = (tn) => [
  {
    id: 'framework', title: tn ? 'Thulaganyo le Ditaelo' : 'Framework & Guidelines',
    desc: tn ? 'Dikwalo tsa motheo tsa thulaganyo ya dilaesense tsa ICT le ditaelo tsa dikopo' : 'Core ICT licensing framework documents and application guidelines',
    icon: BookOpen, color: '#00458B',
    docs: [
      { title: tn ? 'Thulaganyo ya Dilaesense tsa ICT' : 'ICT Licensing Framework', desc: tn ? 'Thulaganyo e e feletseng e e laolang dilaesense tsa ICT mo Botswana' : 'The comprehensive framework governing ICT licensing in Botswana', file: 'ict/ICT_Licensing_Framework.pdf', size: '359 KB' },
      { title: tn ? 'Ditaelo tsa Kopo ya Dilaesense' : 'Guidelines for Application of Licences', desc: tn ? 'Tataiso ya dikgato ka dikgato ya go ikopela dilaesense tsa ICT go tswa go BOCRA' : 'Step-by-step guide for applying for ICT licences from BOCRA', file: 'ict/Guidelines_For_Application_Of_Licences.pdf', size: '727 KB' },
      { title: tn ? 'Ditlhokego le Dituelo tsa Kopo ya Laesense ya ICT' : 'ICT Licence Application Requirements & Fees', desc: tn ? 'Lenaane le le feletseng la ditlhokego, dikwalo tse di tlhokegang, le dituelo' : 'Complete list of requirements, documents needed, and applicable fees', file: 'ict/ICT_Licence_Application_Requirements_and_Fees.pdf', size: '150 KB' },
      { title: tn ? 'Leano la Phetogo ya go Fetolela' : 'Migration Conversion Plan', desc: tn ? 'Leano la go fetolela dilaesense tse di leng teng go ya thulaganyong e ntšhwa' : 'Plan for migration of existing licences to the new ICT licensing framework', file: 'ict/Migration_Conversion_Plan.pdf', size: '353 KB' },
      { title: tn ? 'Ditlhagisiwa le Ditirelo' : 'Products and Services', desc: tn ? 'Lenaane la ditlhagisiwa le ditirelo tsa ICT tse di laolwang ke BOCRA' : 'Catalogue of ICT products and services regulated by BOCRA (September 2016)', file: 'ict/Products_and_Services.pdf', size: '76 KB' },
    ],
  },
  {
    id: 'types', title: tn ? 'Mefuta ya Dilaesense' : 'Licence Types',
    desc: tn ? 'Dikwalo tsa karolo nngwe le nngwe ya laesense' : 'Individual licence category documents',
    icon: Award, color: '#00A6CE',
    docs: [
      { title: tn ? 'Laesense ya Mafaratlhatlha a Neteweke' : 'Network Facilities Licence', desc: tn ? 'Laesense bakeng sa batlamedi ba mafaratlhatlha a neteweke ya megala' : 'Licence for providers of telecommunications network infrastructure', file: 'ict/Network_Facilities_Licence.pdf', size: '386 KB' },
      { title: tn ? 'Laesense ya Tirelo le Tiriso' : 'Service and Application Licence', desc: tn ? 'Laesense bakeng sa batlamedi ba ditirelo le balaodi ba ditiriso' : 'Licence for service providers and application operators', file: 'ict/Service_and_Application_Licence.pdf', size: '296 KB' },
      { title: tn ? 'Thulaganyo ya Dilaesense tsa Radio ya Dikampase' : 'Campus Radio Licensing Framework', desc: tn ? 'Thulaganyo ya go laesensisa ditešene tsa radio tsa dikampase kwa dithutong' : 'Framework for licensing campus radio stations at educational institutions', file: 'ict/Campus_Radio_Licensing_Framework.pdf', size: '6.9 MB' },
    ],
  },
  {
    id: 'requirements', title: tn ? 'Ditlhokego tsa Dikopo' : 'Application Requirements',
    desc: tn ? 'Ditlhokego tse di rileng tsa karolo nngwe le nngwe ya laesense ya nakwana' : 'Specific requirements for each provisional licence category',
    icon: FileText, color: '#C8237B',
    docs: [
      { title: tn ? 'Ditlhokego tsa Laesense ya Nakwana ya Phasalatso' : 'Broadcasting Provisional Licence Requirements', desc: tn ? 'Ditlhokego tsa dikopo tsa laesense ya nakwana ya tirelo ya phasalatso' : 'Requirements for broadcasting service provisional licence applications', file: 'ict/Broadcasting_Provisional_Licence_Requirements.pdf', size: '542 KB' },
      { title: tn ? 'Ditlhokego tsa Laesense ya Nakwana ya CPO' : 'CPO Provisional Licence Requirements', desc: tn ? 'Ditlhokego tsa dikopo tsa laesense ya nakwana ya Molaodi wa Motlamedi wa Diteng' : 'Requirements for Content Provider Operator provisional licence applications', file: 'ict/CPO_Provisional_Licence_Requirements.pdf', size: '305 KB' },
      { title: tn ? 'Ditlhokego tsa Laesense ya Nakwana ya NFP' : 'NFP Provisional Licence Requirements', desc: tn ? 'Ditlhokego tsa dikopo tsa laesense ya nakwana ya Motlamedi wa Mafaratlhatlha a Neteweke' : 'Requirements for Network Facilities Provider provisional licence applications', file: 'ict/NFP_Provisional_Licence_Requirements.pdf', size: '597 KB' },
      { title: tn ? 'Ditlhokego tsa Laesense ya Nakwana ya SAP' : 'SAP Provisional Licence Requirements', desc: tn ? 'Ditlhokego tsa dikopo tsa laesense ya nakwana ya Motlamedi wa Tirelo le Tiriso' : 'Requirements for Service and Application Provider provisional licence applications', file: 'ict/SAP_Provisional_Licence_Requirements.pdf', size: '460 KB' },
      { title: tn ? 'Ditlhokego tsa Kopo ya Radio ya Kampase' : 'Campus Radio Application Requirements', desc: tn ? 'Ditlhokego tse di rileng tsa dikopo tsa laesense ya tešene ya radio ya kampase' : 'Specific requirements for campus radio station licence applications', file: 'ict/Campus_Radio_Application_Requirements.pdf', size: '169 KB' },
    ],
  },
  {
    id: 'operators', title: tn ? 'Balaodi ba ba nang le Dilaesense' : 'Licensed Operators',
    desc: tn ? 'Lenaane la balaodi ba megala ba ba nang le dilaesense tsa BOCRA ga jaana' : 'Current list of BOCRA-licensed telecommunications operators',
    icon: Building, color: '#6BBE4E',
    docs: [
      { title: tn ? 'Balaodi ba ba nang le Dilaesense' : 'Licensed Operators', desc: tn ? 'Lenaane le le feletseng la balaodi botlhe ba ICT ba ba nang le dilaesense ga jaana mo Botswana' : 'Complete directory of all currently licensed ICT operators in Botswana', file: 'ict/Licensed_Operators.pdf', size: '241 KB' },
    ],
  },
  {
    id: 'notices', title: tn ? 'Dikitsiso tsa Setšhaba' : 'Public Notices',
    desc: tn ? 'Dikitsiso le dipapatso tsa taolo' : 'Regulatory notices and announcements',
    icon: Globe, color: '#F7B731',
    docs: [
      { title: tn ? 'Kitsiso ya Bofelo ya Setšhaba ya RIO' : 'RIOs Final Public Notice', desc: tn ? 'Kitsiso ya bofelo ya setšhaba ka ga Ditlhagiso tsa Kgolagano ya Tshupetso' : 'Final public notice on Reference Interconnection Offers', file: 'ict/RIOs_Final_Public_Notice.pdf', size: '8 KB' },
    ],
  },
];

export default function IctLicensingPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const SECTIONS = getSECTIONS(tn);
  const [activeSection, setActiveSection] = useState(null);
  const [search, setSearch] = useState('');
  const cardsRef = useStaggerReveal({ stagger: 0.08 });

  const totalDocs = SECTIONS.reduce((a, s) => a + s.docs.length, 0);
  const active = activeSection ? SECTIONS.find(s => s.id === activeSection) : null;
  const filteredDocs = active ? (search ? active.docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.desc.toLowerCase().includes(search.toLowerCase())) : active.docs) : [];

  // Category grid view
  if (!active) {
    return (
      <div className="bg-white">
        <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link><ChevronRight size={14} /><Link to="/documents/drafts" className="hover:text-bocra-blue">{tn ? 'Dikwalo' : 'Documents'}</Link><ChevronRight size={14} /><span className="text-bocra-slate font-medium">{tn ? 'Thulaganyo ya Dilaesense tsa ICT' : 'ICT Licensing Framework'}</span></nav></div></div>
        <PageHero category="LICENSING" categoryTn="DILAESENSE" title="ICT Licensing Framework" titleTn="Thulaganyo ya Dilaesense tsa ICT" description="Regulatory framework documents, application requirements, and guidelines for ICT service providers in Botswana." descriptionTn="Dikwalo tsa thulaganyo ya taolo, ditlhokego tsa dikopo, le ditaelo tsa baneedi ba ditirelo tsa ICT." color="green" />

        <section className="py-6"><div className="section-wrapper">
          <div className="flex items-center justify-center gap-6 text-center">
            <div><p className="text-3xl font-bold text-bocra-slate">{totalDocs}</p><p className="text-xs text-bocra-slate/40">{tn ? 'Dikwalo Tsotlhe' : 'Total Documents'}</p></div>
            <div className="w-px h-10 bg-gray-200" />
            <div><p className="text-3xl font-bold text-[#00A6CE]">{SECTIONS.length}</p><p className="text-xs text-bocra-slate/40">{tn ? 'Dikarolo' : 'Categories'}</p></div>
          </div>
        </div></section>

        <section className="py-6 bg-bocra-off-white"><div className="section-wrapper max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{tn ? 'Batla ka Karolo' : 'Browse by Category'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-8">{tn ? 'Tobetsa karolo go bona dikwalo tsa yona' : 'Click a category to view its documents'}</p>
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: s.color }} />
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color}12` }}>
                      <Icon size={20} style={{ color: s.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-bocra-slate group-hover:text-[#00458B] transition-colors">{s.title}</h3>
                      <p className="text-[10px] text-bocra-slate/40 mt-0.5 leading-relaxed line-clamp-2">{s.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.docs.length} {tn ? 'dikwalo' : 'documents'}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-[#00A6CE] group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </div></section>

        {/* Related */}
        <section className="py-6"><div className="section-wrapper max-w-3xl mx-auto text-center">
          <p className="text-xs text-bocra-slate/30 mb-3">{tn ? 'Ditsebe Tse di Amanang' : 'Related Pages'}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/licensing" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-bocra-slate/60 hover:text-[#00A6CE] hover:border-[#00A6CE]/30 transition-all">{tn ? 'Ikopela Laesense' : 'Apply for a Licence'}</Link>
            <Link to="/documents/drafts" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-bocra-slate/60 hover:text-[#00A6CE] hover:border-[#00A6CE]/30 transition-all">{tn ? 'Dikwalo Tsotlhe' : 'All Documents'}</Link>
            <Link to="/mandate/licensing" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-bocra-slate/60 hover:text-[#00A6CE] hover:border-[#00A6CE]/30 transition-all">{tn ? 'Tiragatso ya Dilaesense' : 'Licensing Mandate'}</Link>
          </div>
        </div></section>

        <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
      </div>
    );
  }

  // Document list for selected category
  const Icon = active.icon;
  return (
    <div className="bg-white">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link><ChevronRight size={14} /><button onClick={() => { setActiveSection(null); setSearch(''); }} className="hover:text-bocra-blue">{tn ? 'Dilaesense tsa ICT' : 'ICT Licensing'}</button><ChevronRight size={14} /><span className="text-bocra-slate font-medium">{active.title}</span></nav></div></div>

      <section className="py-8"><div className="section-wrapper max-w-4xl">
        <button onClick={() => { setActiveSection(null); setSearch(''); }} className="flex items-center gap-2 text-sm text-[#00A6CE] hover:text-[#00458B] font-medium mb-6 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {tn ? 'Boela kwa Dikarolong' : 'Back to Categories'}
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${active.color}15` }}>
            <Icon size={28} style={{ color: active.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-bocra-slate">{active.title}</h1>
            <p className="text-sm text-bocra-slate/50 mt-1">{active.desc}</p>
          </div>
        </div>

        {active.docs.length > 3 && (
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bocra-slate/30" />
            <input type="search" placeholder={tn ? `Batla mo dikwalong di le ${active.docs.length}...` : `Search ${active.docs.length} documents...`} value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-bocra-off-white border border-gray-200 rounded-xl text-sm focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-bocra-slate/30 hover:text-bocra-slate"><X size={14} /></button>}
          </div>
        )}

        <p className="text-xs text-bocra-slate/40 mb-4">{filteredDocs.length} {tn ? 'dikwalo' : 'documents'}</p>

        {filteredDocs.length === 0 ? (
          <div className="text-center py-12"><FileText size={48} className="mx-auto text-bocra-slate/20 mb-4" /><h3 className="text-lg font-medium text-bocra-slate/40">{tn ? 'Ga go na dikwalo tse di bonweng' : 'No documents found'}</h3></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredDocs.map((doc, i) => (
              <a key={i} href={`${BASE}documents/${doc.file}`} target="_blank" rel="noopener noreferrer"
                className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-gray-200 transition-all group flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-bocra-slate group-hover:text-[#00458B] transition-colors leading-tight">{doc.title}</h3>
                  <p className="text-xs text-bocra-slate/40 mt-1 leading-relaxed">{doc.desc}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-50 text-red-500 rounded">PDF</span>
                    <span className="text-[10px] text-bocra-slate/30">{doc.size}</span>
                    <span className="text-[10px] text-[#00A6CE] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download size={10} /> {tn ? 'Tsenya' : 'Download'}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div></section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
