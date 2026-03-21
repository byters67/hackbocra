/**
 * NewsEventsPage — Redesigned with category cards + detail view
 * Route: /media/news-events
 * Fully bilingual EN/TN
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../lib/language';
import PageHero from '../../components/ui/PageHero';
import { useStaggerReveal } from '../../hooks/useAnimations';
import {
  Search, FileText, Megaphone, Gavel, ShoppingBag, Newspaper,
  Calendar, Download, ChevronRight, SlidersHorizontal, ArrowLeft,
  Building2, Award, Wifi, MonitorSpeaker
} from 'lucide-react';

/* ── Categories ────────────────────────────────── */
const CATEGORIES = [
  { id: 'notices', label: 'Public Notices', labelTn: 'Dikitsiso tsa Setšhaba', icon: Megaphone, color: '#00A6CE', desc: 'Official gazettes, operator lists, and public announcements', descTn: 'Dikgatiso tsa semmuso, ditlhokamelo tsa balaodi, le dikitsiso tsa setšhaba' },
  { id: 'tenders', label: 'Tenders & Procurement', labelTn: 'Ditendara le Thekololo', icon: ShoppingBag, color: '#6BBE4E', desc: 'Bidding opportunities, awarded contracts, and evaluations', descTn: 'Ditšhono tsa go tsenya ditendara, dikonteraka tse di abetsweng, le ditekolo' },
  { id: 'media', label: 'Media Releases', labelTn: 'Dikgang tsa Bobegakgang', icon: Newspaper, color: '#C8237B', desc: 'Press releases, pricing approvals, and stakeholder updates', descTn: 'Dikgatiso tsa bobegakgang, ditumelelo tsa ditlhwatlhwa, le diphetogo tsa baamegi' },
  { id: 'regulatory', label: 'Regulatory Documents', labelTn: 'Dipampiri tsa Taolo', icon: Gavel, color: '#F7B731', desc: 'Codes of conduct, guidelines, and regulatory frameworks', descTn: 'Melao ya maitsholo, ditaelo, le dithulaganyo tsa taolo' },
];

/* ── Badge config ────────────────────────────────── */
const BADGE_MAP = {
  notices:    { bg: 'bg-[#00A6CE]/10', text: 'text-[#00A6CE]', label: 'Public Notice', labelTn: 'Kitsiso ya Setšhaba' },
  tenders:    { bg: 'bg-[#6BBE4E]/10', text: 'text-[#6BBE4E]', label: 'Tender', labelTn: 'Tendara' },
  media:      { bg: 'bg-[#C8237B]/10', text: 'text-[#C8237B]', label: 'Media Release', labelTn: 'Kgang ya Bobegakgang' },
  regulatory: { bg: 'bg-[#F7B731]/10', text: 'text-[#F7B731]', label: 'Regulatory', labelTn: 'Ya Taolo' },
};

/* ── Document data ────────────────────────────────── */
const DOCUMENTS = [
  {
    id: 1, category: 'regulatory',
    title: 'Code of Conduct for Broadcasting During Elections',
    titleTn: 'Molao wa Maitsholo wa Phasalatso ka Nako ya Ditlhopho',
    description: 'Comprehensive code governing broadcasting service licensees during election periods. Covers impartiality, party political broadcasts, advertising rules, and complaints procedures.',
    descTn: 'Molao o o feletseng o o laolang ba ba nang le dilaesense tsa phasalatso ka nako ya ditlhopho. O akaretsa go se tsee letlhakore, diphasalatso tsa dipolotiki, melao ya papatso, le ditsamaiso tsa dingongorego.',
    date: 'July 2019', sortDate: '2019-07-01', file: 'FINAL_Broadcasting_Election_Code_of_Conduct_JULY_2019.pdf', pages: 18, icon: MonitorSpeaker,
  },
  {
    id: 2, category: 'notices',
    title: 'Licensed Communications Operators Publication',
    titleTn: 'Kgatiso ya Balaodi ba Dikgolagano ba ba nang le Dilaesense',
    description: 'Official gazette listing all BOCRA-licensed SAP, NFP, Mobile Network Operators (BTC, Mascom, Orange), Postal Service Providers, and Broadcasting Operators.',
    descTn: 'Kgatiso ya semmuso e e bontshang balaodi botlhe ba ba nang le dilaesense tsa BOCRA go akaretsa SAP, NFP, Balaodi ba Dineteweke tsa Mogala (BTC, Mascom, Orange), Batlamedi ba Ditirelo tsa Poso, le Balaodi ba Phasalatso.',
    date: '2019', sortDate: '2019-01-01', file: 'BOCRALICENSEESPUBLICATION.pdf', pages: 13, icon: Building2,
  },
  {
    id: 3, category: 'notices',
    title: 'QoS Monitoring System — Public Notice',
    titleTn: 'Tsamaiso ya Tlhokomelo ya Boleng jwa Tirelo — Kitsiso ya Setšhaba',
    description: 'Tender notice for supply, installation and commissioning of a Quality of Service monitoring system for fixed and mobile networks.',
    descTn: 'Kitsiso ya tendara ya go reka, go tsenya le go simolola tsamaiso ya tlhokomelo ya Boleng jwa Tirelo bakeng sa dineteweke tse di tsepameng le tsa mogala.',
    date: 'June 2021', sortDate: '2021-06-01', file: 'Public_Notice-QOS_Monitoring_system.pdf', pages: 1, icon: Wifi,
  },
  {
    id: 4, category: 'media',
    title: 'BOCRA Approves Reduction in Fixed Broadband Prices',
    titleTn: 'BOCRA e Dumela Pogelo ya Ditlhwatlhwa tsa Inthanete ya Lobelo e e Tsepameng',
    description: 'BOCRA approved up to 40% price reductions for BTC fixed broadband services. 20Mbps from P975 to P650, 50Mbps from P1,985 to P1,200, 100Mbps from P2,800 to P1,900.',
    descTn: 'BOCRA e dumetse pogelo ya ditlhwatlhwa go fitlha 40% bakeng sa ditirelo tsa inthanete ya lobelo tsa BTC. 20Mbps go tswa P975 go ya P650, 50Mbps go tswa P1,985 go ya P1,200, 100Mbps go tswa P2,800 go ya P1,900.',
    date: 'June 2021', sortDate: '2021-06-23', file: 'Public_notice_BTC_prices.pdf', pages: 1, icon: Newspaper,
  },
  {
    id: 5, category: 'tenders',
    title: 'Supply and Delivery of ICT Equipment',
    titleTn: 'Go Reka le go Romela Didirisiwa tsa ICT',
    description: 'Invitation to tender for the supply and delivery of ICT equipment to support BOCRA operational capacity and digital infrastructure.',
    descTn: 'Taletso ya tendara ya go reka le go romela didirisiwa tsa ICT go tshegetsa bokgoni jwa tiragatso jwa BOCRA le mafaratlhatlha a dijitale.',
    date: 'February 2024', sortDate: '2024-02-13', file: 'SUPPLY_AND_DELIVERY_OF_ICT_EQUIPMENT_13-02-24.pdf', pages: 1, icon: ShoppingBag,
  },
  {
    id: 6, category: 'tenders',
    title: 'BOCRA Public Tender Notice',
    titleTn: 'Kitsiso ya Tendara ya Setšhaba ya BOCRA',
    description: 'General procurement notice inviting qualified bidders to submit proposals for various Authority service requirements.',
    descTn: 'Kitsiso ya thekololo ya kakaretso e e laletsang badira-ditendara ba ba tshwanelang go romela ditshitshinyo bakeng sa ditlhokego tse di farologaneng tsa Bothati.',
    date: 'January 2024', sortDate: '2024-01-23', file: 'BOCRA_PUBLIC_TENDER_NOTICE_23-01-2024.pdf', pages: 1, icon: ShoppingBag,
  },
  {
    id: 7, category: 'tenders',
    title: 'Notice of Best Evaluated Bidder — Etsha 6 Computer Lab',
    titleTn: 'Kitsiso ya Modira-tendara yo o Itekilweng Botoka — Laporatheri ya Khomphiutha ya Etsha 6',
    description: 'Contract awarded to C.E.N. Enterprises (Pty) Ltd for BWP 1,881,718.92 for construction of a computer laboratory at Etsha 6 Primary School, Okavango District.',
    descTn: 'Konteraka e abetswe C.E.N. Enterprises (Pty) Ltd ka BWP 1,881,718.92 bakeng sa kago ya laporatheri ya khomphiutha kwa Sekolong se Segolo sa Etsha 6, Kgaolo ya Okavango.',
    date: '2024', sortDate: '2024-01-01', file: 'Notice_of_Best_Evaluated_Bidder__Construction-of-Computer-Lab-at-Etsha-6_Primary-School_.pdf', pages: 1, icon: Award,
  },
  {
    id: 8, category: 'notices',
    title: 'BOCRA Public Advertisement',
    titleTn: 'Papatso ya Setšhaba ya BOCRA',
    description: 'Official BOCRA advertisement outlining regulatory updates, service information, and stakeholder communications published in national media.',
    descTn: 'Papatso ya semmuso ya BOCRA e e bontshang diphetogo tsa taolo, tshedimosetso ya ditirelo, le dikgolagano tsa baamegi tse di gatisitsweng mo bobegakganng jwa bosetšhaba.',
    date: 'December 2023', sortDate: '2023-12-20', file: 'BOCRA_advert_20-12-2023_outlined.pdf', pages: 1, icon: Megaphone,
  },
];

export default function NewsEventsPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const cardsRef = useStaggerReveal({ stagger: 0.08 });

  const totalCount = DOCUMENTS.length;
  const catCounts = useMemo(() => {
    const c = {};
    CATEGORIES.forEach(cat => { c[cat.id] = DOCUMENTS.filter(d => d.category === cat.id).length; });
    return c;
  }, []);

  const activeCat = activeCategory ? CATEGORIES.find(c => c.id === activeCategory) : null;

  const filtered = useMemo(() => {
    if (!activeCategory) return [];
    let docs = DOCUMENTS.filter(d => d.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(d => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || (d.titleTn && d.titleTn.toLowerCase().includes(q)));
    }
    docs.sort((a, b) => sortOrder === 'newest' ? b.sortDate.localeCompare(a.sortDate) : a.sortDate.localeCompare(b.sortDate));
    return docs;
  }, [activeCategory, searchQuery, sortOrder]);

  const pdfBase = `${import.meta.env.BASE_URL}documents/news/`;

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
              <span className="text-bocra-slate font-medium">{tn ? 'Dikgang le Ditiragalo' : 'News & Events'}</span>
            </nav>
          </div>
        </div>

        <PageHero
          category="MEDIA" categoryTn="BOBEGADIKGANG"
          title="News & Events" titleTn="Dikgang le Ditiragalo"
          description="Latest news, public notices, tenders, and regulatory updates from BOCRA."
          descriptionTn="Dikgang tsa bosheng, dikitsiso tsa setšhaba, ditendara, le diphetogo tsa taolo go tswa BOCRA."
          color="magenta"
        />

        {/* Stats */}
        <section className="py-6">
          <div className="section-wrapper">
            <div className="flex items-center justify-center gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-bocra-slate">{totalCount}</p>
                <p className="text-xs text-bocra-slate/40">{tn ? 'Dikwalo Tsotlhe' : 'Total Documents'}</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-3xl font-bold text-[#00A6CE]">{CATEGORIES.length}</p>
                <p className="text-xs text-bocra-slate/40">{tn ? 'Dikarolo' : 'Categories'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Category Cards */}
        <section className="py-6 bg-bocra-off-white">
          <div className="section-wrapper">
            <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{tn ? 'Tlhopha Karolo' : 'Choose a Category'}</h2>
            <p className="text-sm text-bocra-slate/40 text-center mb-8">{tn ? 'Tobetsa karolo go bona dikwalo tsa yona' : 'Click a category to browse its documents'}</p>
            <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const count = catCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
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
                      <span className="text-xs font-bold" style={{ color: cat.color }}>{count} {tn ? 'dikwalo' : 'documents'}</span>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-[#00A6CE] group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
      </div>
    );
  }

  /* ── Document List (detail view) ── */
  const badge = BADGE_MAP[activeCategory];
  const Icon = activeCat.icon;

  return (
    <div className="bg-white">
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link>
            <ChevronRight size={14} />
            <button onClick={() => { setActiveCategory(null); setSearchQuery(''); }} className="hover:text-bocra-blue">{tn ? 'Dikgang le Ditiragalo' : 'News & Events'}</button>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">{tn ? activeCat.labelTn : activeCat.label}</span>
          </nav>
        </div>
      </div>

      <section className="py-8">
        <div className="section-wrapper max-w-4xl">
          {/* Back */}
          <button onClick={() => { setActiveCategory(null); setSearchQuery(''); }}
            className="flex items-center gap-2 text-sm text-[#00A6CE] hover:text-[#00458B] font-medium mb-6 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {tn ? 'Boela kwa Dikarolong' : 'Back to Categories'}
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${activeCat.color}15` }}>
              <Icon size={28} style={{ color: activeCat.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-bocra-slate">{tn ? activeCat.labelTn : activeCat.label}</h1>
              <p className="text-sm text-bocra-slate/50 mt-1">{tn ? activeCat.descTn : activeCat.desc}</p>
            </div>
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bocra-slate/30" />
              <input type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder={tn ? 'Batla dikwalo...' : 'Search documents...'}
                className="w-full pl-10 pr-4 py-2.5 bg-bocra-off-white border border-gray-200 rounded-xl text-sm focus:border-bocra-blue outline-none" />
            </div>
            <button onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-gray-300 transition-all whitespace-nowrap">
              <SlidersHorizontal size={14} />
              {sortOrder === 'newest' ? (tn ? 'Tsa Bosheng' : 'Newest') : (tn ? 'Tsa Bogologolo' : 'Oldest')}
            </button>
          </div>

          {/* Count */}
          <p className="text-xs text-bocra-slate/40 mb-4">{filtered.length} {tn ? 'dikwalo' : 'documents'}</p>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search size={40} className="mx-auto mb-3 text-gray-200" />
              <h3 className="text-base font-semibold text-gray-500 mb-1">{tn ? 'Ga go na dipholo' : 'No results found'}</h3>
              <p className="text-sm text-gray-400">{tn ? 'Leka go batla ka mafoko a mangwe.' : 'Try adjusting your search.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(doc => {
                const DocIcon = doc.icon;
                return (
                  <div key={doc.id} className="group flex items-start gap-4 p-4 sm:p-5 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-gray-200 transition-all">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${badge.bg}`}>
                      <DocIcon size={18} className={badge.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#00458B] transition-colors leading-snug">
                        {tn && doc.titleTn ? doc.titleTn : doc.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                          {tn ? badge.labelTn : badge.label}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={11} />{doc.date}</span>
                        <span className="text-xs text-gray-300">PDF</span>
                        {doc.pages > 1 && <span className="text-xs text-gray-300">{doc.pages} {tn ? 'matlhare' : 'pages'}</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2 hidden sm:block">
                        {tn && doc.descTn ? doc.descTn : doc.description}
                      </p>
                    </div>
                    <a href={`${pdfBase}${doc.file}`} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 rounded-lg text-gray-300 hover:text-[#00458B] hover:bg-[#00458B]/5 transition-all"
                      title={tn ? 'Bula PDF' : 'View PDF'}>
                      <Download size={18} />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
