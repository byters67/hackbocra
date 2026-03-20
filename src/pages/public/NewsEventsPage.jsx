/**
 * NewsEventsPage — Public notices, tenders, media releases, regulatory documents
 * Design matches DocumentsPage: hero with colour bar, sidebar categories, list cards
 */
import { useState, useMemo } from 'react';
import { useLanguage } from '../../lib/language';
import PageHero from '../../components/ui/PageHero';
import {
  Search, FileText, Megaphone, Gavel, ShoppingBag, Newspaper,
  Calendar, Download, ChevronRight, Filter, SlidersHorizontal,
  Building2, Award, Wifi, MonitorSpeaker
} from 'lucide-react';

/* ── Category config ────────────────────────────────── */
const CATEGORIES = [
  { id: 'all', label: 'All', labelTn: 'Tsotlhe', icon: FileText },
  { id: 'notices', label: 'Public Notices', labelTn: 'Dikitsiso tsa Setšhaba', icon: Megaphone, color: '#00A6CE' },
  { id: 'tenders', label: 'Tenders & Procurement', labelTn: 'Ditendara', icon: ShoppingBag, color: '#6BBE4E' },
  { id: 'media', label: 'Media Releases', labelTn: 'Dikgang tsa Bobegakgang', icon: Newspaper, color: '#C8237B' },
  { id: 'regulatory', label: 'Regulatory Documents', labelTn: 'Dipampiri tsa Molao', icon: Gavel, color: '#F7B731' },
];

/* ── Badge config per category ──────────────────────── */
const BADGE_STYLES = {
  notices:    { bg: 'bg-[#00A6CE]/10', text: 'text-[#00A6CE]', label: 'Public Notice' },
  tenders:    { bg: 'bg-[#6BBE4E]/10', text: 'text-[#6BBE4E]', label: 'Tender' },
  media:      { bg: 'bg-[#C8237B]/10', text: 'text-[#C8237B]', label: 'Media Release' },
  regulatory: { bg: 'bg-[#F7B731]/10', text: 'text-[#F7B731]', label: 'Regulatory' },
};

/* ── Document data ──────────────────────────────────── */
const DOCUMENTS = [
  {
    id: 1,
    category: 'regulatory',
    title: 'Code of Conduct for Broadcasting During Elections',
    description: 'Comprehensive code governing broadcasting service licensees during election periods. Covers impartiality, party political broadcasts, advertising rules, and complaints procedures.',
    date: 'July 2019',
    sortDate: '2019-07-01',
    file: 'FINAL_Broadcasting_Election_Code_of_Conduct_JULY_2019.pdf',
    pages: 18,
    icon: MonitorSpeaker,
  },
  {
    id: 2,
    category: 'notices',
    title: 'Licensed Communications Operators Publication',
    description: 'Official gazette listing all BOCRA-licensed SAP, NFP, Mobile Network Operators (BTC, Mascom, Orange), Postal Service Providers, and Broadcasting Operators.',
    date: '2019',
    sortDate: '2019-01-01',
    file: 'BOCRALICENSEESPUBLICATION.pdf',
    pages: 13,
    icon: Building2,
  },
  {
    id: 3,
    category: 'notices',
    title: 'QoS Monitoring System — Public Notice',
    description: 'Tender notice for supply, installation and commissioning of a Quality of Service monitoring system for fixed and mobile networks. Tender No: BOCRA/PT/002/2021.2022.',
    date: 'June 2021',
    sortDate: '2021-06-01',
    file: 'Public_Notice-QOS_Monitoring_system.pdf',
    pages: 1,
    icon: Wifi,
  },
  {
    id: 4,
    category: 'media',
    title: 'BOCRA Approves Reduction in Fixed Broadband Prices',
    description: 'BOCRA approved up to 40% price reductions for BTC fixed broadband services. 20Mbps from P975 to P650, 50Mbps from P1,985 to P1,200, 100Mbps from P2,800 to P1,900.',
    date: 'June 2021',
    sortDate: '2021-06-23',
    file: 'Public_notice_BTC_prices.pdf',
    pages: 1,
    icon: Newspaper,
  },
  {
    id: 5,
    category: 'tenders',
    title: 'Supply and Delivery of ICT Equipment',
    description: 'Invitation to tender for the supply and delivery of ICT equipment to support BOCRA operational capacity and digital infrastructure.',
    date: 'February 2024',
    sortDate: '2024-02-13',
    file: 'SUPPLY_AND_DELIVERY_OF_ICT_EQUIPMENT_13-02-24.pdf',
    pages: 1,
    icon: ShoppingBag,
  },
  {
    id: 6,
    category: 'tenders',
    title: 'BOCRA Public Tender Notice',
    description: 'General procurement notice inviting qualified bidders to submit proposals for various Authority service requirements.',
    date: 'January 2024',
    sortDate: '2024-01-23',
    file: 'BOCRA_PUBLIC_TENDER_NOTICE_23-01-2024.pdf',
    pages: 1,
    icon: ShoppingBag,
  },
  {
    id: 7,
    category: 'tenders',
    title: 'Notice of Best Evaluated Bidder — Etsha 6 Computer Lab',
    description: 'Contract awarded to C.E.N. Enterprises (Pty) Ltd for BWP 1,881,718.92 for construction of a computer laboratory at Etsha 6 Primary School, Okavango District.',
    date: '2024',
    sortDate: '2024-01-01',
    file: 'Notice_of_Best_Evaluated_Bidder__Construction-of-Computer-Lab-at-Etsha-6_Primary-School_.pdf',
    pages: 1,
    icon: Award,
  },
  {
    id: 8,
    category: 'notices',
    title: 'BOCRA Public Advertisement',
    description: 'Official BOCRA advertisement outlining regulatory updates, service information, and stakeholder communications published in national media.',
    date: 'December 2023',
    sortDate: '2023-12-20',
    file: 'BOCRA_advert_20-12-2023_outlined.pdf',
    pages: 1,
    icon: Megaphone,
  },
];

export default function NewsEventsPage() {
  const { lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const filtered = useMemo(() => {
    let docs = [...DOCUMENTS];
    if (activeCategory !== 'all') {
      docs = docs.filter(d => d.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
      );
    }
    docs.sort((a, b) => {
      if (sortOrder === 'newest') return b.sortDate.localeCompare(a.sortDate);
      return a.sortDate.localeCompare(b.sortDate);
    });
    return docs;
  }, [activeCategory, searchQuery, sortOrder]);

  const catCounts = useMemo(() => {
    const counts = { all: DOCUMENTS.length };
    CATEGORIES.forEach(c => {
      if (c.id !== 'all') counts[c.id] = DOCUMENTS.filter(d => d.category === c.id).length;
    });
    return counts;
  }, []);

  const pdfBase = `${import.meta.env.BASE_URL}documents/news/`;

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero Banner ─────────────────────────────── */}
      {/* Hero */}
      <PageHero category="MEDIA" categoryTn="BOBEGADIKGANG" title="News & Events" titleTn="Dikgang le Ditiragalo" description="Latest news, public notices, tenders, and regulatory updates from BOCRA." descriptionTn="Dikgang tsa bosheng, dikitsiso tsa setšhaba, ditendara, le diphetogo tsa taolo go tswa BOCRA." color="magenta" />


      {/* ── Search & Sort Bar ──────────────────────── */}
      <div className="section-wrapper mt-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'tn' ? `Batla dipampiri di ${DOCUMENTS.length}...` : `Search ${DOCUMENTS.length} documents...`}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00458B]/20 focus:border-[#00458B] text-sm transition-all"
            />
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-gray-300 transition-all whitespace-nowrap"
          >
            <SlidersHorizontal size={14} />
            {sortOrder === 'newest'
              ? (lang === 'tn' ? 'Tsa Bosheng' : 'Newest')
              : (lang === 'tn' ? 'Tsa Bogologolo' : 'Oldest')}
          </button>
        </div>
      </div>

      {/* ── Main Content: Sidebar + List ──────────── */}
      <div className="section-wrapper mt-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar — Categories */}
          <aside className="lg:w-64 flex-shrink-0">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              {lang === 'tn' ? 'DIKAROLO' : 'CATEGORIES'}
            </h3>
            <nav className="space-y-1">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const count = catCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'bg-[#00458B]/5 text-[#00458B] font-semibold'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-[#00458B]' : 'text-gray-400'} />
                    <span className="flex-1 text-left">{lang === 'tn' ? cat.labelTn : cat.label}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#00458B] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>{count}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Document List */}
          <div className="flex-1 min-w-0">
            {/* Count */}
            <p className="text-sm text-gray-400 mb-4">
              {filtered.length} {lang === 'tn' ? 'dipampiri' : 'documents'}
            </p>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Search size={40} className="mx-auto mb-3 text-gray-200" />
                <h3 className="text-base font-semibold text-gray-500 mb-1">
                  {lang === 'tn' ? 'Ga go na dipholo' : 'No results found'}
                </h3>
                <p className="text-sm text-gray-400">
                  {lang === 'tn' ? 'Leka go batla ka mafoko a mangwe.' : 'Try adjusting your search or category filter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(doc => {
                  const badge = BADGE_STYLES[doc.category];
                  const DocIcon = doc.icon;
                  return (
                    <div
                      key={doc.id}
                      className="group flex items-start gap-4 p-4 sm:p-5 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-gray-200 transition-all"
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${badge.bg}`}>
                        <DocIcon size={18} className={badge.text} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#00458B] transition-colors leading-snug">
                          {doc.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={11} />
                            {doc.date}
                          </span>
                          <span className="text-xs text-gray-300">PDF</span>
                          {doc.pages > 1 && (
                            <span className="text-xs text-gray-300">{doc.pages} pages</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2 hidden sm:block">
                          {doc.description}
                        </p>
                      </div>

                      {/* Download */}
                      <a
                        href={`${pdfBase}${doc.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 rounded-lg text-gray-300 hover:text-[#00458B] hover:bg-[#00458B]/5 transition-all"
                        title={lang === 'tn' ? 'Bula PDF' : 'View PDF'}
                      >
                        <Download size={18} />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
