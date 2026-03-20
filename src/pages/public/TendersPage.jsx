/**
 * TendersPage.jsx — BOCRA Tenders & Procurement
 * Route: /tenders
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Search, FileText, Download, Calendar, Clock,
  CheckCircle, AlertCircle, ShoppingBag, Building, Filter,
  ExternalLink, Mail, ArrowRight, Award
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

const BASE = import.meta.env.BASE_URL || '/';

const STATUS_STYLE = {
  open: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Open' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', label: 'Closed' },
  awarded: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Awarded' },
  adjudicated: { bg: 'bg-[#F7B731]/10', text: 'text-[#F7B731]', border: 'border-[#F7B731]/20', label: lang === 'tn' ? 'Tse di Atlholetsweng' : 'Adjudicated' },
};

const TENDERS = [
  {
    id: 1,
    ref: 'BOCRA/ST/002/2025.26',
    title: 'Supply and Installation of Solar Photovoltaic Panel System at BOCRA Head Office and Phakalane Spectrum House',
    method: 'Restricted/Selective Domestic Bidding',
    status: 'adjudicated',
    closingDate: '27 Mar 2026',
    publishDate: '13 Mar 2026',
    decisionDate: '12 Mar 2026',
    awardedTo: 'Julzon (Pty) Ltd in Joint Venture with Evolution Engineers (Pty) Ltd',
    amount: 'P5,281,069.29 (VAT Inclusive)',
    decision: 'Approved',
    file: 'Notice_of_Adjudication_Decision_Solar_PV_2025.pdf',
    category: 'Infrastructure',
  },
  {
    id: 2,
    ref: 'BOCRA/UASF/001/2025',
    title: 'Universal Access Service Fund — Connectivity Projects',
    method: 'Open Domestic Bidding',
    status: 'closed',
    closingDate: '15 Feb 2026',
    publishDate: '10 Jan 2026',
    category: 'Universal Access',
  },
  {
    id: 3,
    ref: 'BOCRA/CON/003/2025',
    title: 'Consultancy Services for the Development of Cost Models and Pricing Framework for ICT Services to Enhance Competition among Operators in Botswana',
    method: 'Open International Bidding',
    status: 'closed',
    closingDate: '30 Nov 2025',
    publishDate: '15 Oct 2025',
    category: 'Consultancy',
  },
  {
    id: 4,
    ref: 'BOCRA/CON/004/2025',
    title: 'Consultancy Services for a Market Study and the Development of a Licensing Framework for the Postal Sector in Botswana',
    method: 'Open International Bidding',
    status: 'closed',
    closingDate: '20 Oct 2025',
    publishDate: '1 Sep 2025',
    category: 'Consultancy',
  },
  {
    id: 5,
    ref: 'BOCRA/CON/005/2025',
    title: 'Review of Type Approval Technical Standards & Procedures and Development of Broadcasting Technical Standards',
    method: 'Open Domestic Bidding',
    status: 'closed',
    closingDate: '30 Sep 2025',
    publishDate: '15 Aug 2025',
    category: 'Technical Standards',
  },
  {
    id: 6,
    ref: 'BOCRA/NT/001/2025',
    title: 'Notice of Tenders — Various BOCRA Procurement Opportunities',
    method: 'Open Domestic Bidding',
    status: 'closed',
    closingDate: '15 Aug 2025',
    publishDate: '1 Jul 2025',
    category: 'General',
  },
];

const CATEGORIES = ['All', 'Infrastructure', 'Consultancy', 'Technical Standards', 'Universal Access', 'General'];

const ITT_SECTIONS = [
  'Introduction — background information on the tender',
  'Tender Conditions — the legal parameters surrounding the tender',
  'Specification — the description of the supplies, service or works to be provided',
  'Instructions for Tender Submission — instructions for the bidders',
  'Qualitative Tender Response — qualitative questions to be answered by the bidder',
  'Pricing and Delivery Schedule — quantitative questions to be answered by the bidder',
  'Form of Tender — declaration to be signed by the bidder',
  'Certificate of Non-Collusion — declaration that the bidder has not colluded with any other bidder',
  'Draft of Proposed Contract — a draft of the contract to be signed by the successful bidder',
];

export default function TendersPage() {
  const { lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const heroRef = useScrollReveal();
  const cardsRef = useStaggerReveal({ stagger: 0.08 });

  const filtered = useMemo(() => {
    let results = TENDERS;
    if (filterStatus !== 'All') results = results.filter(t => t.status === filterStatus.toLowerCase());
    if (filterCategory !== 'All') results = results.filter(t => t.category === filterCategory);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      results = results.filter(t => t.title.toLowerCase().includes(q) || t.ref.toLowerCase().includes(q));
    }
    return results;
  }, [searchTerm, filterStatus, filterCategory]);

  const counts = useMemo(() => {
    const c = { open: 0, closed: 0, awarded: 0, adjudicated: 0 };
    TENDERS.forEach(t => { c[t.status] = (c[t.status] || 0) + 1; });
    return c;
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">Home</Link><ChevronRight size={14} /><span className="text-bocra-slate font-medium">Tenders</span></nav></div></div>

      <PageHero category="PROCUREMENT" categoryTn="THEKO" title="Tenders & Procurement" titleTn="Ditendara le Theko" description="BOCRA follows a thorough tendering process to ensure best value-for-money. View current and past tenders, adjudication decisions, and procurement opportunities." descriptionTn="BOCRA e latela thulaganyo e e tseneletseng ya ditendara go netefatsa boleng jo bo gaisang jwa madi. Bona ditendara tsa jaanong le tse di fetileng." color="yellow" />

      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-5 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: lang === 'tn' ? 'Ditendara Tsotlhe' : 'Total Tenders', value: TENDERS.length, color: '#00458B' },
              { label: 'Open', value: counts.open, color: '#6BBE4E' },
              { label: lang === 'tn' ? 'Tse di Atlholetsweng' : 'Adjudicated', value: counts.adjudicated, color: '#F7B731' },
              { label: 'Closed', value: counts.closed, color: '#64748B' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-6">
        <div className="section-wrapper max-w-5xl">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search tenders by title or reference..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#00458B] outline-none" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-xs bg-white">
              <option value="All">All Status</option>
              <option value="open">Open</option>
              <option value="adjudicated">{lang === 'tn' ? 'Tse di Atlholetsweng' : 'Adjudicated'}</option>
              <option value="closed">Closed</option>
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-xs bg-white">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <p className="text-xs text-gray-400 mb-4">{filtered.length} tender{filtered.length !== 1 ? 's' : ''} found</p>

          {/* Tender List */}
          <div ref={cardsRef} className="space-y-3">
            {filtered.map(tender => {
              const s = STATUS_STYLE[tender.status] || STATUS_STYLE.closed;
              const isExpanded = expanded === tender.id;
              return (
                <div key={tender.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-all">
                  <div className="flex items-stretch">
                    <div className="w-1.5 flex-shrink-0" style={{ background: tender.status === 'adjudicated' ? '#F7B731' : tender.status === 'open' ? '#6BBE4E' : '#CBD5E1' }} />
                    <div className="p-4 sm:p-5 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text} border ${s.border}`}>{s.label}</span>
                            <span className="text-[10px] font-mono text-[#00A6CE]">{tender.ref}</span>
                            <span className="text-[10px] text-gray-300 px-2 py-0.5 bg-gray-50 rounded">{tender.category}</span>
                          </div>
                          <h3 className="text-sm font-bold text-bocra-slate leading-snug">{tender.title}</h3>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar size={11} /> Published: {tender.publishDate}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} /> Closing: {tender.closingDate}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">Method: {tender.method}</p>
                        </div>
                        <button onClick={() => setExpanded(isExpanded ? null : tender.id)}
                          className="text-xs text-[#00A6CE] font-medium hover:underline flex-shrink-0 mt-1">
                          {isExpanded ? 'Less' : 'Details'}
                        </button>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                          {tender.awardedTo && (
                            <div className="bg-[#F7B731]/5 rounded-lg p-3 border border-[#F7B731]/10">
                              <p className="text-xs font-bold text-bocra-slate mb-1">Adjudication Decision</p>
                              <div className="space-y-1 text-xs text-bocra-slate/60">
                                <p><strong>Awarded to:</strong> {tender.awardedTo}</p>
                                <p><strong>Amount:</strong> {tender.amount}</p>
                                <p><strong>Decision:</strong> {tender.decision} — {tender.decisionDate}</p>
                              </div>
                            </div>
                          )}
                          {tender.file && (
                            <a href={`${BASE}documents/tenders/${tender.file}`} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-bocra-slate hover:border-[#00A6CE] hover:text-[#00A6CE] transition-all">
                              <Download size={13} /> Download Notice (PDF)
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <ShoppingBag size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No tenders found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Tendering */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-bocra-slate mb-3 flex items-center gap-2">
                <FileText size={16} className="text-[#F7B731]" /> What's in a Tender Document?
              </h3>
              <p className="text-xs text-bocra-slate/60 mb-3">
                Tendering documents — usually called an Invitation to Tender (ITT) — will most likely contain the following sections:
              </p>
              <div className="space-y-2">
                {ITT_SECTIONS.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle size={12} className="text-[#F7B731] mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-bocra-slate/60">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-bold text-bocra-slate mb-2 flex items-center gap-2">
                  <Award size={16} className="text-[#00A6CE]" /> Our Commitment
                </h3>
                <p className="text-xs text-bocra-slate/60 leading-relaxed">
                  In order to ensure that BOCRA is offered the best value-for-money, we follow a thorough tendering process in compliance with the Public Procurement Regulations of Botswana. All tenders are evaluated fairly and transparently.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-bold text-bocra-slate mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-[#C8237B]" /> Tender Enquiries
                </h3>
                <p className="text-xs text-bocra-slate/60 leading-relaxed mb-3">
                  For debriefing requests and tender enquiries, contact the BOCRA Procurement Department.
                </p>
                <div className="space-y-1.5">
                  <a href="mailto:tenders@bocra.org.bw" className="flex items-center gap-2 text-xs text-[#00458B] hover:underline font-medium">
                    <Mail size={11} className="text-[#C8237B]" /> tenders@bocra.org.bw
                  </a>
                  <a href="tel:+2673957755" className="flex items-center gap-2 text-xs text-[#00458B] hover:underline">
                    +267 395 7755
                  </a>
                </div>
              </div>

              <Link to="/media/news-events" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                <ShoppingBag size={18} className="text-[#6BBE4E]" />
                <div><p className="text-xs font-bold text-bocra-slate">News & Public Notices</p><p className="text-[10px] text-gray-400">Latest procurement announcements</p></div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
