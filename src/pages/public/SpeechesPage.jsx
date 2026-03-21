/**
 * SpeechesPage — Redesigned with category cards + detail view
 * Route: /media/speeches
 * Fully bilingual EN/TN — 26 real BOCRA speeches
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Search, Download, Calendar, User, ArrowLeft,
  Mic, SlidersHorizontal, Globe, Radio, Award, BookOpen,
  Shield, Wifi
} from 'lucide-react';
import { useStaggerReveal } from '../../hooks/useAnimations';
import { useLanguage } from '../../lib/language';
import PageHero from '../../components/ui/PageHero';

const BASE = import.meta.env.BASE_URL || '/';

/* ─── CATEGORIES ─── */
const CATEGORIES = [
  { id: 'Regulatory & Licensing', label: 'Regulatory & Licensing', labelTn: 'Taolo le Dilaesense', icon: Shield, color: '#00A6CE', desc: 'Spectrum, QoS, ministerial addresses, and COVID-19 responses', descTn: 'Sepeketheramo, Boleng jwa Tirelo, dipuo tsa tona, le dikarabo tsa COVID-19' },
  { id: 'Broadcasting', label: 'Broadcasting', labelTn: 'Phasalatso', icon: Radio, color: '#C8237B', desc: 'National conferences, broadcaster stakeholder events, and codes of conduct', descTn: 'Dikhonferense tsa bosetšhaba, ditiragalo tsa baamegi ba phasalatso, le melao ya maitsholo' },
  { id: 'International & Cooperation', label: 'International & Cooperation', labelTn: 'Boditšhabatšhaba le Tirisanommogo', icon: Globe, color: '#6BBE4E', desc: 'MoU signings, CRASA, CTO, and World Radiocommunication Day', descTn: 'Go saeniwa ga MoU, CRASA, CTO, le Letsatsi la Dikgolagano tsa Radio la Lefatshe' },
  { id: 'Universal Access', label: 'Universal Access', labelTn: 'Phitlhelelo ya Botlhe', icon: Wifi, color: '#F7B731', desc: 'UASF project launches and rural community engagements', descTn: 'Go simololwa ga diporojeke tsa UASF le dikgolaganyo tsa metse ya kwa magaeng' },
  { id: 'Awards & Events', label: 'Awards & Events', labelTn: 'Dimpho le Ditiragalo', icon: Award, color: '#00458B', desc: 'ICT award ceremonies and keynote addresses', descTn: 'Meletlo ya dimpho tsa ICT le dipuo tsa konokono' },
  { id: 'Postal Services', label: 'Postal Services', labelTn: 'Ditirelo tsa Poso', icon: BookOpen, color: '#C8237B', desc: 'Postal regulation and UPU Congress addresses', descTn: 'Taolo ya poso le dipuo tsa Khongeresi ya UPU' },
];

/* ─── SPEECH DATA — 26 real BOCRA speeches ─── */
const SPEECHES = [
  { id: 1, title: 'Breakfast Meeting with Broadcasters', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'Broadcasting', year: 2019, event: 'Broadcaster Stakeholder Breakfast', eventTn: 'Dijo tsa Moso tsa Baamegi ba Phasalatso', file: 'CE Speech - Breakfast Meeting with Broadcasters.docx', ext: 'DOCX' },
  { id: 2, title: 'National Broadcasting Conference', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'Broadcasting', year: 2018, event: 'National Broadcasting Conference', eventTn: 'Khonferense ya Phasalatso ya Bosetšhaba', file: 'Speech_BOCRA_CE_National_Broadcasting_Conference.docx', ext: 'DOCX' },
  { id: 3, title: 'Broadcasting Code of Conduct — Welcome Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'Broadcasting', year: 2019, event: 'Broadcasting Code of Conduct Launch', eventTn: 'Go Simololwa ga Molao wa Maitsholo wa Phasalatso', file: 'Welcome_Remarks_by_Chief_Execuitive_Broadcast_Code_of_Conduct.docx', ext: 'DOCX' },
  { id: 4, title: 'MoU Signing Ceremony — BOCRA and University of Botswana', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'International & Cooperation', year: 2019, event: 'MoU Signing Ceremony', eventTn: 'Moletlo wa go Saena MoU', file: 'Speech_Signing_of_MoU_between_BOCRA_and_UB.docx', ext: 'DOCX' },
  { id: 5, title: 'CRASA WRC Preparatory Meeting — Welcome Speech', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'International & Cooperation', year: 2019, event: 'CRASA WRC Preparatory Meeting', eventTn: 'Kopano ya Boipaakanyetso ya CRASA WRC', file: 'Welcome_Speech_By_CE_at_the_CRASA_WRC_Preparatory_Meeting-final.docx', ext: 'DOCX' },
  { id: 6, title: 'CTO Training Programme — Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'International & Cooperation', year: 2019, event: 'Commonwealth Telecommunications Organisation Training', eventTn: 'Katiso ya Mokgatlho wa Megala wa Commonwealth', file: 'Remarks_by_Mr_Martin_Mokgware_CTO_Training.docx', ext: 'DOCX' },
  { id: 7, title: 'CIPA Welcome Speech', speaker: 'BOCRA', role: 'Institutional', roleTn: 'Ya Setheo', category: 'International & Cooperation', year: 2019, event: 'CIPA Partnership Event', eventTn: 'Tiragalo ya Tirisanommogo ya CIPA', file: 'BOCRA - CIPA Welcome Speech - Final.docx', ext: 'DOCX' },
  { id: 8, title: 'DBS Welcome Speech', speaker: 'BOCRA', role: 'Institutional', roleTn: 'Ya Setheo', category: 'International & Cooperation', year: 2019, event: 'Department of Broadcasting Services Event', eventTn: 'Tiragalo ya Lefapha la Ditirelo tsa Phasalatso', file: 'BOCRA - DBS Welcome Speech - Final 23 Sep.docx', ext: 'DOCX' },
  { id: 9, title: 'Spectrum Management Conference — Welcome Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'Regulatory & Licensing', year: 2019, event: 'Spectrum Management Conference', eventTn: 'Khonferense ya Tsamaiso ya Sepeketheramo', file: 'Welcome Remarks by Martin Mokgware - Spectrum Management.docx', ext: 'DOCX' },
  { id: 10, title: 'QoS-QoE Stakeholder Consultation — Welcome Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'Regulatory & Licensing', year: 2019, event: 'Quality of Service Stakeholder Workshop', eventTn: 'Thuto ya Baamegi ya Boleng jwa Tirelo', file: 'Welcome Remarks by Martin Mokgware QoS-QoE.docx', ext: 'DOCX' },
  { id: 11, title: 'Statistics Botswana — Welcome Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'Regulatory & Licensing', year: 2019, event: 'Statistics Botswana Collaboration Event', eventTn: 'Tiragalo ya Tirisanommogo ya Statistics Botswana', file: 'Welcome Remarks by Mr Martin Mokgware - Statistics Botswana.docx', ext: 'DOCX' },
  { id: 12, title: 'COVID-19 Updates Speech', speaker: 'BOCRA', role: 'Institutional', roleTn: 'Ya Setheo', category: 'Regulatory & Licensing', year: 2020, event: 'COVID-19 Regulatory Response Briefing', eventTn: 'Pegelo ya Karabo ya Taolo ya COVID-19', file: 'COVIDS-19 UPDATES SPEECH 29.05.20.pdf', ext: 'PDF' },
  { id: 13, title: 'UASF Projects Launch — Mabutsane Sub-District', speaker: 'Board Chairman', role: 'Board of Directors', roleTn: 'Lekgotla la Batlhankedi', category: 'Universal Access', year: 2019, event: 'UASF Projects Launch — Mabutsane', eventTn: 'Go Simololwa ga Diporojeke tsa UASF — Mabutsane', file: 'Speech_by_Chairman_at_Launch_of_UASF_Projects_in_Mabutsane_Sub_District-06-02-2019.docx', ext: 'DOCX' },
  { id: 14, title: 'UASF Breakfast Meeting — Welcome Remarks', speaker: 'BOCRA', role: 'Institutional', roleTn: 'Ya Setheo', category: 'Universal Access', year: 2019, event: 'UASF Stakeholder Breakfast Meeting', eventTn: 'Kopano ya Dijo tsa Moso ya Baamegi ba UASF', file: 'Welcome_Remarks_UASF_Breakfast_Meeting_Final.docx', ext: 'DOCX' },
  { id: 15, title: 'Lokgwabe Community Engagement', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'Universal Access', year: 2019, event: 'Rural Community Engagement — Lokgwabe', eventTn: 'Kgolagano le Motse — Lokgwabe', file: 'CE_Speech_Lokgwabe.docx', ext: 'DOCX' },
  { id: 16, title: "Minister's Speech — ICT Sector Address", speaker: 'Hon. Dorcas Makgato', role: 'Minister of Transport and Communications', roleTn: 'Tona ya Dipalangwa le Dikgolagano', category: 'Regulatory & Licensing', year: 2019, event: 'Ministerial ICT Address', eventTn: 'Puo ya Tona ya ICT', file: 'Ministers_Speech_final.docx', ext: 'DOCX' },
  { id: 17, title: "Minister's Speech — World Radiocommunication Day 2019", speaker: 'Hon. Dorcas Makgato', role: 'Minister of Transport and Communications', roleTn: 'Tona ya Dipalangwa le Dikgolagano', category: 'International & Cooperation', year: 2019, event: 'World Radiocommunication Day 2019', eventTn: 'Letsatsi la Dikgolagano tsa Radio la Lefatshe 2019', file: 'Ministers_Speech_WRD_19.docx', ext: 'DOCX' },
  { id: 18, title: "Minister Makgato — Award Ceremony Keynote Address", speaker: 'Hon. Dorcas Makgato', role: 'Minister of Transport and Communications', roleTn: 'Tona ya Dipalangwa le Dikgolagano', category: 'Awards & Events', year: 2019, event: 'BOCRA ICT Award Ceremony', eventTn: 'Moletlo wa Dimpho tsa ICT wa BOCRA', file: 'Award_Ceremony_Minister_Makgato_Keynote_Address_Final_Draft_My_2019(Kabelo_A_Ebineng).docx', ext: 'DOCX' },
  { id: 19, title: "Minister's Speech — Postal Services Review", speaker: 'Hon. Thulagano Segokgo', role: 'Minister of Transport and Communications', roleTn: 'Tona ya Dipalangwa le Dikgolagano', category: 'Postal Services', year: 2019, event: 'Postal Sector Review Meeting', eventTn: 'Kopano ya Tshekatsheko ya Lephata la Poso', file: 'Ministers_Speech_Postal.docx', ext: 'DOCX' },
  { id: 20, title: "UPU Congress — Minister's Address", speaker: 'Hon. Thulagano Segokgo', role: 'Minister of Transport and Communications', roleTn: 'Tona ya Dipalangwa le Dikgolagano', category: 'Postal Services', year: 2021, event: 'Universal Postal Union Congress', eventTn: 'Khongeresi ya Mokgatlho wa Poso wa Lefatshe', file: 'UPU_Congress_Ministers_speech.docx', ext: 'DOCX' },
  { id: 21, title: 'Board Chairman — Award Ceremony Speech', speaker: 'Board Chairman', role: 'Board of Directors', roleTn: 'Lekgotla la Batlhankedi', category: 'Awards & Events', year: 2019, event: 'BOCRA ICT Award Ceremony', eventTn: 'Moletlo wa Dimpho tsa ICT wa BOCRA', file: 'Board_Chairman_Award_Speech_Final.docx', ext: 'DOCX' },
  { id: 22, title: 'Chief Executive — Award Ceremony Address', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'Awards & Events', year: 2019, event: 'BOCRA ICT Award Ceremony', eventTn: 'Moletlo wa Dimpho tsa ICT wa BOCRA', file: 'CE_ICT_Award_Ceremony_Speech.docx', ext: 'DOCX' },
  { id: 23, title: 'MC Opening — ICT Award Ceremony', speaker: 'BOCRA', role: 'Institutional', roleTn: 'Ya Setheo', category: 'Awards & Events', year: 2019, event: 'BOCRA ICT Award Ceremony', eventTn: 'Moletlo wa Dimpho tsa ICT wa BOCRA', file: 'MC_Opening_Remarks_Awards.docx', ext: 'DOCX' },
  { id: 24, title: 'Regulatory & Licensing Framework — Stakeholder Address', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'Regulatory & Licensing', year: 2019, event: 'Regulatory Framework Stakeholder Session', eventTn: 'Kopano ya Baamegi ya Thulaganyo ya Taolo', file: 'CE_Regulatory_Framework_Speech.docx', ext: 'DOCX' },
  { id: 25, title: 'UASF Impact Assessment — Opening Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'Universal Access', year: 2020, event: 'UASF Impact Assessment Workshop', eventTn: 'Thuto ya Tshekatsheko ya Ditlamorago tsa UASF', file: 'UASF_Impact_Opening_Remarks.docx', ext: 'DOCX' },
  { id: 26, title: 'International Telecommunications Day — Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', roleTn: 'Motlhankedi yo Mogolo', category: 'International & Cooperation', year: 2020, event: 'World Telecommunications Day', eventTn: 'Letsatsi la Megala la Lefatshe', file: 'ITD_2020_Remarks.docx', ext: 'DOCX' },
];

const YEARS = [...new Set(SPEECHES.map(s => s.year))].sort((a, b) => b - a);

export default function SpeechesPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const cardsRef = useStaggerReveal({ stagger: 0.08 });

  const totalCount = SPEECHES.length;
  const catCounts = useMemo(() => {
    const c = {};
    CATEGORIES.forEach(cat => { c[cat.id] = SPEECHES.filter(s => s.category === cat.id).length; });
    return c;
  }, []);

  const activeCat = activeCategory ? CATEGORIES.find(c => c.id === activeCategory) : null;

  const filtered = useMemo(() => {
    if (!activeCategory) return [];
    let results = SPEECHES.filter(s => s.category === activeCategory);
    if (filterYear) results = results.filter(s => s.year === parseInt(filterYear));
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      results = results.filter(s => s.title.toLowerCase().includes(q) || s.speaker.toLowerCase().includes(q) || s.event.toLowerCase().includes(q));
    }
    if (sortBy === 'newest') results.sort((a, b) => b.year - a.year || b.id - a.id);
    else if (sortBy === 'oldest') results.sort((a, b) => a.year - b.year || a.id - b.id);
    else if (sortBy === 'speaker') results.sort((a, b) => a.speaker.localeCompare(b.speaker));
    return results;
  }, [activeCategory, searchTerm, filterYear, sortBy]);

  /* ── Category Grid (landing) ── */
  if (!activeCat) {
    return (
      <div className="bg-white">
        <div className="bg-bocra-off-white border-b border-gray-100">
          <div className="section-wrapper py-4">
            <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
              <Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link>
              <ChevronRight size={14} />
              <span className="text-bocra-slate/50">{tn ? 'Bobegadikgang' : 'Media'}</span>
              <ChevronRight size={14} />
              <span className="text-bocra-slate font-medium">{tn ? 'Dipuo' : 'Speeches'}</span>
            </nav>
          </div>
        </div>

        <PageHero
          category="MEDIA" categoryTn="BOBEGADIKGANG"
          title="Speeches Archive" titleTn="Dipuo tsa Kwa Morago"
          description="Speeches by the BOCRA Chief Executive and senior leadership at regulatory events, conferences, and public engagements."
          descriptionTn="Dipuo tsa Motlhankedi yo Mogolo wa BOCRA le boeteledipele jo bogolo mo ditiragalong tsa taolo, dikhonferense, le dikgolaganyo tsa setšhaba."
          color="magenta"
        />

        {/* Stats */}
        <section className="py-6">
          <div className="section-wrapper">
            <div className="flex items-center justify-center gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-bocra-slate">{totalCount}</p>
                <p className="text-xs text-bocra-slate/40">{tn ? 'Dipuo Tsotlhe' : 'Total Speeches'}</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-3xl font-bold text-[#00A6CE]">{CATEGORIES.length}</p>
                <p className="text-xs text-bocra-slate/40">{tn ? 'Dikarolo' : 'Categories'}</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-3xl font-bold text-[#6BBE4E]">{YEARS.length}</p>
                <p className="text-xs text-bocra-slate/40">{tn ? 'Dingwaga' : 'Years'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Category Cards */}
        <section className="py-6 bg-bocra-off-white">
          <div className="section-wrapper">
            <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{tn ? 'Tlhopha Setlhogo' : 'Choose a Topic'}</h2>
            <p className="text-sm text-bocra-slate/40 text-center mb-8">{tn ? 'Tobetsa setlhogo go bona dipuo tsa sona' : 'Click a topic to browse its speeches'}</p>
            <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const count = catCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setSearchTerm(''); setFilterYear(''); }}
                    className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: cat.color }} />
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}12` }}>
                        <Icon size={20} style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-bocra-slate group-hover:text-[#00458B] transition-colors">{tn ? cat.labelTn : cat.label}</h3>
                        <p className="text-[10px] text-bocra-slate/40 mt-0.5 line-clamp-2">{tn ? cat.descTn : cat.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <span className="text-xs font-bold" style={{ color: cat.color }}>{count} {tn ? 'dipuo' : 'speeches'}</span>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-[#00A6CE] group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-6">
          <div className="section-wrapper max-w-2xl mx-auto text-center">
            <p className="text-sm text-bocra-slate/40 mb-3">{tn ? 'O batla dikhopi tsa dipuo?' : 'Need speech transcripts?'}</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] transition-all">
              <Mic size={14} /> {tn ? 'Ikgolaganye le Rona' : 'Contact Us'}
            </Link>
          </div>
        </section>

        <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
      </div>
    );
  }

  /* ── Speech List (detail view) ── */
  const CatIcon = activeCat.icon;

  return (
    <div className="bg-white">
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link>
            <ChevronRight size={14} />
            <button onClick={() => { setActiveCategory(null); setSearchTerm(''); setFilterYear(''); }} className="hover:text-bocra-blue">{tn ? 'Dipuo' : 'Speeches'}</button>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">{tn ? activeCat.labelTn : activeCat.label}</span>
          </nav>
        </div>
      </div>

      <section className="py-8">
        <div className="section-wrapper max-w-4xl">
          {/* Back */}
          <button onClick={() => { setActiveCategory(null); setSearchTerm(''); setFilterYear(''); }}
            className="flex items-center gap-2 text-sm text-[#00A6CE] hover:text-[#00458B] font-medium mb-6 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {tn ? 'Boela kwa Ditlhogong' : 'Back to Topics'}
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${activeCat.color}15` }}>
              <CatIcon size={28} style={{ color: activeCat.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-bocra-slate">{tn ? activeCat.labelTn : activeCat.label}</h1>
              <p className="text-sm text-bocra-slate/50 mt-1">{tn ? activeCat.descTn : activeCat.desc}</p>
            </div>
          </div>

          {/* Search + Sort + Year */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bocra-slate/30" />
              <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder={tn ? 'Batla dipuo ka setlhogo, mmui...' : 'Search by title, speaker...'}
                className="w-full pl-10 pr-4 py-2.5 bg-bocra-off-white border border-gray-200 rounded-xl text-sm focus:border-bocra-blue outline-none" />
            </div>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-600 bg-white">
              <option value="">{tn ? 'Dingwaga Tsotlhe' : 'All Years'}</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-600 bg-white">
              <option value="newest">{tn ? 'Tsa Bosheng Pele' : 'Newest First'}</option>
              <option value="oldest">{tn ? 'Tsa Bogologolo Pele' : 'Oldest First'}</option>
              <option value="speaker">{tn ? 'Ka Mmui' : 'By Speaker'}</option>
            </select>
          </div>

          {/* Count */}
          <p className="text-xs text-bocra-slate/40 mb-4">{filtered.length} {tn ? 'dipuo di bonwe' : `speech${filtered.length !== 1 ? 'es' : ''} found`}</p>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Mic size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">{tn ? 'Ga go na dipuo tse di tsamaelanang le patlo ya gago.' : 'No speeches found matching your search.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(speech => (
                <div key={speech.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all group">
                  <div className="flex items-stretch">
                    <div className="w-1 flex-shrink-0" style={{ background: activeCat.color }} />
                    <div className="flex-1 p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${activeCat.color}12` }}>
                          <CatIcon size={18} style={{ color: activeCat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-bocra-slate leading-snug">{speech.title}</h3>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-bocra-slate/60">
                              <User size={11} /> {speech.speaker}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-400">{tn && speech.roleTn ? speech.roleTn : speech.role}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                              <Calendar size={10} /> {speech.year}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-[11px] text-gray-400">{tn && speech.eventTn ? speech.eventTn : speech.event}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${speech.ext === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                              {speech.ext}
                            </span>
                          </div>
                        </div>
                        <a href={`${BASE}documents/speeches/${speech.file}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:border-[#00A6CE] hover:text-[#00A6CE] transition-all opacity-70 group-hover:opacity-100 flex-shrink-0 self-center">
                          <Download size={13} /> {tn ? 'Tsenya' : 'Download'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact */}
          <div className="mt-8 p-5 bg-bocra-off-white rounded-xl text-center">
            <p className="text-sm text-bocra-slate/40 mb-3">{tn ? 'O batla dikhopi tsa dipuo?' : 'Need speech transcripts?'}</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00458B] text-white text-xs font-medium rounded-xl hover:bg-[#003366] transition-all">
              <Mic size={14} /> {tn ? 'Ikgolaganye le Rona' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
