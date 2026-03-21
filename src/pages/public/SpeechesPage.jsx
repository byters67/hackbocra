/**
 * SpeechesPage.jsx — BOCRA Speeches Archive
 * 
 * Real speeches by the BOCRA Chief Executive and senior leadership.
 * Categorised by event type, searchable, with download links.
 * 
 * Route: /media/speeches
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Search, Download, FileText, Calendar, User,
  Mic, Filter, SlidersHorizontal, Globe, Radio, Award, BookOpen,
  Shield, Users, Wifi
} from 'lucide-react';
import { useScrollReveal } from '../../hooks/useAnimations';
import { useLanguage } from '../../lib/language';

const BASE = import.meta.env.BASE_URL || '/';

/* ─── CATEGORIES ─── */
const CATEGORIES = {
  'All': { icon: Mic, color: '#00458B' },
  'Regulatory & Licensing': { icon: Shield, color: '#00A6CE' },
  'Broadcasting': { icon: Radio, color: '#C8237B' },
  'International & Cooperation': { icon: Globe, color: '#6BBE4E' },
  'Universal Access': { icon: Wifi, color: '#F7B731' },
  'Awards & Events': { icon: Award, color: '#00458B' },
  'Postal Services': { icon: BookOpen, color: '#C8237B' },
};

/* ─── SPEECH DATA — 26 real BOCRA speeches ─── */
const SPEECHES = [
  // ── Regulatory & Licensing ──
  { id: 1, title: 'Breakfast Meeting with Broadcasters', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'Broadcasting', year: 2019, event: 'Broadcaster Stakeholder Breakfast', file: 'CE Speech - Breakfast Meeting with Broadcasters.docx', ext: 'DOCX' },
  { id: 2, title: 'National Broadcasting Conference', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'Broadcasting', year: 2018, event: 'National Broadcasting Conference', file: 'Speech_BOCRA_CE_National_Broadcasting_Conference.docx', ext: 'DOCX' },
  { id: 3, title: 'Broadcasting Code of Conduct — Welcome Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'Broadcasting', year: 2019, event: 'Broadcasting Code of Conduct Launch', file: 'Welcome_Remarks_by_Chief_Execuitive_Broadcast_Code_of_Conduct.docx', ext: 'DOCX' },

  // ── International & Cooperation ──
  { id: 4, title: 'MoU Signing Ceremony — BOCRA and University of Botswana', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'International & Cooperation', year: 2019, event: 'MoU Signing Ceremony', file: 'Speech_Signing_of_MoU_between_BOCRA_and_UB.docx', ext: 'DOCX' },
  { id: 5, title: 'CRASA WRC Preparatory Meeting — Welcome Speech', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'International & Cooperation', year: 2019, event: 'CRASA WRC Preparatory Meeting', file: 'Welcome_Speech_By_CE_at_the_CRASA_WRC_Preparatory_Meeting-final.docx', ext: 'DOCX' },
  { id: 6, title: 'CTO Training Programme — Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'International & Cooperation', year: 2019, event: 'Commonwealth Telecommunications Organisation Training', file: 'Remarks_by_Mr_Martin_Mokgware_CTO_Training.docx', ext: 'DOCX' },
  { id: 7, title: 'CIPA Welcome Speech', speaker: 'BOCRA', role: 'Institutional', category: 'International & Cooperation', year: 2019, event: 'CIPA Partnership Event', file: 'BOCRA - CIPA Welcome Speech - Final.docx', ext: 'DOCX' },
  { id: 8, title: 'DBS Welcome Speech', speaker: 'BOCRA', role: 'Institutional', category: 'International & Cooperation', year: 2019, event: 'Department of Broadcasting Services Event', file: 'BOCRA - DBS Welcome Speech - Final 23 Sep.docx', ext: 'DOCX' },

  // ── Regulatory & Technical ──
  { id: 9, title: 'Spectrum Management Conference — Welcome Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'Regulatory & Licensing', year: 2019, event: 'Spectrum Management Conference', file: 'Welcome Remarks by Martin Mokgware - Spectrum Management.docx', ext: 'DOCX' },
  { id: 10, title: 'QoS-QoE Stakeholder Consultation — Welcome Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'Regulatory & Licensing', year: 2019, event: 'Quality of Service Stakeholder Workshop', file: 'Welcome Remarks by Martin Mokgware QoS-QoE.docx', ext: 'DOCX' },
  { id: 11, title: 'Statistics Botswana — Welcome Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'Regulatory & Licensing', year: 2019, event: 'Statistics Botswana Collaboration Event', file: 'Welcome Remarks by Mr Martin Mokgware - Statistics Botswana.docx', ext: 'DOCX' },
  { id: 12, title: 'COVID-19 Updates Speech', speaker: 'BOCRA', role: 'Institutional', category: 'Regulatory & Licensing', year: 2020, event: 'COVID-19 Regulatory Response Briefing', file: 'COVIDS-19 UPDATES SPEECH 29.05.20.pdf', ext: 'PDF' },

  // ── Universal Access ──
  { id: 13, title: 'UASF Projects Launch — Mabutsane Sub-District', speaker: 'Board Chairman', role: 'Board of Directors', category: 'Universal Access', year: 2019, event: 'UASF Projects Launch — Mabutsane', file: 'Speech_by_Chairman_at_Launch_of_UASF_Projects_in_Mabutsane_Sub_District-06-02-2019.docx', ext: 'DOCX' },
  { id: 14, title: 'UASF Breakfast Meeting — Welcome Remarks', speaker: 'BOCRA', role: 'Institutional', category: 'Universal Access', year: 2019, event: 'UASF Stakeholder Breakfast Meeting', file: 'Welcome_Remarks_UASF_Breakfast_Meeting_Final.docx', ext: 'DOCX' },
  { id: 15, title: 'Lokgwabe Community Engagement', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'Universal Access', year: 2019, event: 'Rural Community Engagement — Lokgwabe', file: 'CE_Speech_Lokgwabe.docx', ext: 'DOCX' },

  // ── Ministerial ──
  { id: 16, title: 'Minister\'s Speech — ICT Sector Address', speaker: 'Hon. Dorcas Makgato', role: 'Minister of Transport and Communications', category: 'Regulatory & Licensing', year: 2019, event: 'Ministerial ICT Address', file: 'Ministers_Speech_final.docx', ext: 'DOCX' },
  { id: 17, title: 'Minister\'s Speech — World Radiocommunication Day 2019', speaker: 'Hon. Dorcas Makgato', role: 'Minister of Transport and Communications', category: 'International & Cooperation', year: 2019, event: 'World Radiocommunication Day 2019', file: 'Ministers_Speech_WRD_19.docx', ext: 'DOCX' },
  { id: 18, title: 'Minister Makgato — Award Ceremony Keynote Address', speaker: 'Hon. Dorcas Makgato', role: 'Minister of Transport and Communications', category: 'Awards & Events', year: 2019, event: 'BOCRA ICT Award Ceremony', file: 'Award_Ceremony_Minister_Makgato_Keynote_Address_Final_Draft_My_2019(Kabelo_A_Ebineng).docx', ext: 'DOCX' },
  { id: 19, title: 'Hon. Dorcas Makgato — Official Speech', speaker: 'Hon. Dorcas Makgato', role: 'Minister of Transport and Communications', category: 'Regulatory & Licensing', year: 2019, event: 'Official Government Address', file: 'Speech_by_Hon_Dorcas_Makgato.docx', ext: 'DOCX' },

  // ── Awards & Events ──
  { id: 20, title: 'ICT Award Ceremony — CE Appreciation Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'Awards & Events', year: 2019, event: 'BOCRA ICT Award Ceremony', file: "CE's_Appreciation_Remarks2019AWARDS.docx", ext: 'DOCX' },
  { id: 21, title: 'Long Service Awards — Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'Awards & Events', year: 2019, event: 'BOCRA Staff Long Service Awards', file: 'Remarks_by_Mr_Martin_Mokgware_Long Service_Awards.docx', ext: 'DOCX' },
  { id: 22, title: 'BOCRA Christmas Party 2018 — Speech', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'Awards & Events', year: 2018, event: 'BOCRA Annual Christmas Party', file: 'Speech_BOCRA_CE_2018_Xmas_Party.docx', ext: 'DOCX' },
  { id: 23, title: 'Vote of Thanks — Major General Bakwena Oitsile', speaker: 'Major General Bakwena Oitsile', role: 'Guest Speaker', category: 'Awards & Events', year: 2019, event: 'BOCRA Official Event', file: 'Vote_of_Thanks_by_Major_General_Bakwena_Oitsile-Final.docx', ext: 'DOCX' },

  // ── Postal ──
  { id: 24, title: 'World Post Day 2018 — Guest of Honour Speech', speaker: 'Guest of Honour', role: 'Government Official', category: 'Postal Services', year: 2018, event: 'World Post Day 2018 Celebrations', file: '2018_world_post_day_speech_guest_of_honour_working_Final.docx', ext: 'DOCX' },

  // ── WRD / Radiocommunication ──
  { id: 25, title: 'World Radiocommunication Day 2018 — Speech', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'International & Cooperation', year: 2018, event: 'World Radiocommunication Day 2018', file: 'Speech_by_Mr_Martin_Mokgware_WRD_2018 FINAL_v3.docx', ext: 'DOCX' },

  // ── Other ──
  { id: 26, title: 'Welcome Remarks', speaker: 'Mr. Martin Mokgware', role: 'Chief Executive', category: 'Regulatory & Licensing', year: 2019, event: 'BOCRA Stakeholder Engagement', file: 'Welcome_Remarks_by_Mr_Martin_Mokgware_0.docx', ext: 'DOCX' },
];

const YEARS = [...new Set(SPEECHES.map(s => s.year))].sort((a, b) => b - a);

export default function SpeechesPage() {
  const { lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterYear, setFilterYear] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const heroRef = useScrollReveal();

  const filtered = useMemo(() => {
    let results = SPEECHES;
    if (filterCategory !== 'All') results = results.filter(s => s.category === filterCategory);
    if (filterYear) results = results.filter(s => s.year === parseInt(filterYear));
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      results = results.filter(s =>
        s.title.toLowerCase().includes(q) || s.speaker.toLowerCase().includes(q) ||
        s.event.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'newest') results.sort((a, b) => b.year - a.year || b.id - a.id);
    else if (sortBy === 'oldest') results.sort((a, b) => a.year - b.year || a.id - b.id);
    else if (sortBy === 'speaker') results.sort((a, b) => a.speaker.localeCompare(b.speaker));
    return results;
  }, [searchTerm, filterCategory, filterYear, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts = { 'All': SPEECHES.length };
    SPEECHES.forEach(s => { counts[s.category] = (counts[s.category] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue">Home</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate/50">Media</span>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">Speeches</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0">
        <div className="relative py-12 sm:py-16 px-5 sm:px-8 lg:px-10 rounded-2xl overflow-hidden bg-gradient-to-br from-[#00458B] to-[#001A3A]">
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div ref={heroRef} className="relative max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-1.5 h-6 rounded-full bg-[#C8237B]" />
              <span className="text-xs text-[#C8237B] uppercase tracking-widest font-medium">MEDIA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{lang === 'tn' ? 'Dipuo tsa Kwa Morago' : 'Speeches Archive'}</h1>
            <p className="text-white/60 mt-3 text-sm sm:text-base max-w-xl mx-auto">
              Speeches by the BOCRA Chief Executive and senior leadership at regulatory events, conferences, and public engagements.
            </p>
          </div>
        </div>
      </section>

      {/* Search bar */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-5 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 flex items-center gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search speeches by title, speaker, or event..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border-0 focus:outline-none focus:ring-0 text-bocra-slate placeholder:text-gray-400" />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="speaker">By Speaker</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="section-wrapper max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Categories */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Categories</p>
                </div>
                <div className="p-2">
                  {Object.entries(CATEGORIES).map(([name, cfg]) => {
                    const Icon = cfg.icon;
                    const count = categoryCounts[name] || 0;
                    const active = filterCategory === name;
                    return (
                      <button key={name} onClick={() => setFilterCategory(name)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${active ? 'bg-[#00458B] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Icon size={14} style={{ color: active ? '#fff' : cfg.color }} />
                        <span className="flex-1 text-left">{name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Year filter */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">Filter by Year</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setFilterYear('')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterYear ? 'bg-[#00458B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    All
                  </button>
                  {YEARS.map(y => (
                    <button key={y} onClick={() => setFilterYear(String(y))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterYear === String(y) ? 'bg-[#00458B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-bocra-off-white rounded-xl p-4">
                <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">{lang === 'tn' ? 'Dipotso tsa Bobegadikgang' : 'Media Enquiries'}</p>
                <p className="text-xs text-bocra-slate/60 leading-relaxed mb-2">
                  For media enquiries or to request speech transcripts, contact the BOCRA Communications Department.
                </p>
                <div className="space-y-1.5">
                  <a href="mailto:info@bocra.org.bw" className="flex items-center gap-2 text-xs text-[#00458B] hover:underline">
                    <FileText size={11} className="text-[#00A6CE]" /> info@bocra.org.bw
                  </a>
                  <a href="tel:+2673957755" className="flex items-center gap-2 text-xs text-[#00458B] hover:underline">
                    <FileText size={11} className="text-[#00A6CE]" /> +267 395 7755
                  </a>
                </div>
              </div>
            </div>

            {/* Speech list */}
            <div className="lg:col-span-3">
              <p className="text-xs text-gray-400 mb-4">
                {filtered.length} speech{filtered.length !== 1 ? 'es' : ''} found
                {filterCategory !== 'All' ? ` in ${filterCategory}` : ''}
                {filterYear ? ` from ${filterYear}` : ''}
              </p>

              {filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <Mic size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No speeches found matching your search.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(speech => {
                    const catCfg = CATEGORIES[speech.category] || CATEGORIES['All'];
                    const CatIcon = catCfg.icon;
                    return (
                      <div key={speech.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all group">
                        <div className="flex items-stretch">
                          {/* Colour accent */}
                          <div className="w-1 flex-shrink-0" style={{ background: catCfg.color }} />

                          <div className="flex-1 p-4 sm:p-5">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${catCfg.color}12` }}>
                                <CatIcon size={18} style={{ color: catCfg.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-bocra-slate leading-snug">{speech.title}</h3>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <span className="flex items-center gap-1 text-xs text-bocra-slate/60">
                                    <User size={11} /> {speech.speaker}
                                  </span>
                                  <span className="text-gray-300">·</span>
                                  <span className="text-xs text-gray-400">{speech.role}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                    <Calendar size={10} /> {speech.year}
                                  </span>
                                  <span className="text-gray-300">·</span>
                                  <span className="text-[11px] text-gray-400">{speech.event}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="px-2 py-0.5 text-[9px] font-medium rounded-lg" style={{ background: `${catCfg.color}12`, color: catCfg.color }}>
                                    {speech.category}
                                  </span>
                                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${speech.ext === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {speech.ext}
                                  </span>
                                </div>
                              </div>
                              {/* Download */}
                              <a href={`${BASE}documents/speeches/${speech.file}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:border-[#00A6CE] hover:text-[#00A6CE] transition-all opacity-70 group-hover:opacity-100 flex-shrink-0 self-center">
                                <Download size={13} /> Download
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
