/**
 * Search BOCRA — Redesigned
 *
 * Fuzzy word-by-word matching (spaces work), results grouped by category,
 * colour-coded cards, popular searches, and clean BOCRA-styled layout.
 *
 * Phase 5: Semantic search via pgvector + OpenAI embeddings when
 * VITE_ENABLE_SEMANTIC_SEARCH=true. Falls back to keyword search
 * when the embedding API is unavailable or the flag is off.
 */
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, FileText, Newspaper, BookOpen, ArrowRight,
  Shield, Globe, Building, Phone, AlertCircle, Award, Radio,
  Users, Wifi, Lock, HelpCircle, BarChart3, Mail, Loader2, Filter
} from 'lucide-react';
import { useScrollReveal } from '../../hooks/useAnimations';

import PageHero from '../../components/ui/PageHero';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useLanguage } from '../../lib/language';
import { supabase, supabaseUrl_, supabaseAnonKey_ } from '../../lib/supabase';
const SEMANTIC_ENABLED = import.meta.env.VITE_ENABLE_SEMANTIC_SEARCH === 'true';

const CATEGORY_STYLE = {
  About:      { color: '#00458B', bg: 'bg-[#00458B]/10', text: 'text-[#00458B]', icon: BookOpen },
  Mandate:    { color: '#00A6CE', bg: 'bg-[#00A6CE]/10', text: 'text-[#00A6CE]', icon: Shield },
  Services:   { color: '#C8237B', bg: 'bg-[#C8237B]/10', text: 'text-[#C8237B]', icon: Globe },
  Documents:  { color: '#F7B731', bg: 'bg-[#F7B731]/10', text: 'text-[#F7B731]', icon: FileText },
  Legislation:{ color: '#7C3AED', bg: 'bg-[#7C3AED]/10', text: 'text-[#7C3AED]', icon: FileText },
  Policy:     { color: '#0891B2', bg: 'bg-[#0891B2]/10', text: 'text-[#0891B2]', icon: FileText },
  Media:      { color: '#EA580C', bg: 'bg-[#EA580C]/10', text: 'text-[#EA580C]', icon: Newspaper },
  Data:       { color: '#059669', bg: 'bg-[#059669]/10', text: 'text-[#059669]', icon: BarChart3 },
  Contact:    { color: '#6BBE4E', bg: 'bg-[#6BBE4E]/10', text: 'text-[#6BBE4E]', icon: Mail },
  Consumer:   { color: '#DC2626', bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', icon: AlertCircle },
  Help:       { color: '#64748B', bg: 'bg-[#64748B]/10', text: 'text-[#64748B]', icon: HelpCircle },
  Legal:      { color: '#4F46E5', bg: 'bg-[#4F46E5]/10', text: 'text-[#4F46E5]', icon: Lock },
  Projects:   { color: '#0D9488', bg: 'bg-[#0D9488]/10', text: 'text-[#0D9488]', icon: Wifi },
  Technical:  { color: '#B45309', bg: 'bg-[#B45309]/10', text: 'text-[#B45309]', icon: Radio },
  Operator:   { color: '#00458B', bg: 'bg-[#00458B]/10', text: 'text-[#00458B]', icon: Building },
  Admin:      { color: '#001A3A', bg: 'bg-[#001A3A]/10', text: 'text-[#001A3A]', icon: Lock },
};

const DEFAULT_STYLE = { color: '#64748B', bg: 'bg-gray-100', text: 'text-gray-500', icon: FileText };

const SEARCH_INDEX = [
  // Pages
  { title: 'About BOCRA', path: '/about/profile', category: 'About', type: 'Page', description: 'Mission, vision, values, and core business areas of BOCRA.' },
  { title: 'Chief Executive', path: '/about/chief-executive', category: 'About', type: 'Page', description: 'Message from the Chief Executive Mr. Martin Mokgware.' },
  { title: 'Board of Directors', path: '/about/board', category: 'About', type: 'Page', description: 'Dr. Bokamoso Basutli (Chair), Mr. Moabi Pusumane, and board members.' },
  { title: 'Executive Management', path: '/about/executive-management', category: 'About', type: 'Page', description: 'Martin Mokgware, Murphy Setshwane, Peter Tladinyane, and leadership team.' },
  { title: 'History of Communication Regulation', path: '/about/history', category: 'About', type: 'Page', description: 'Timeline from 2003 BTA to 2013 BOCRA establishment and modern framework.' },
  { title: 'Organogram', path: '/about/organogram', category: 'About', type: 'Page', description: 'Organisational structure and departments of BOCRA.' },
  { title: 'Careers', path: '/about/careers', category: 'About', type: 'Page', description: 'Job opportunities at BOCRA.' },
  { title: 'Telecommunications', path: '/mandate/telecommunications', category: 'Mandate', type: 'Page', description: 'Regulation of Mascom, BTC, Orange. NFP, SAP, VANS licensing.' },
  { title: 'Broadcasting', path: '/mandate/broadcasting', category: 'Mandate', type: 'Page', description: 'Regulation of Yarona FM, Duma FM, Gabz FM, eBotswana TV.' },
  { title: 'Postal Services', path: '/mandate/postal', category: 'Mandate', type: 'Page', description: 'Universal postal services and commercial postal operators.' },
  { title: 'Internet & ICT', path: '/mandate/internet', category: 'Mandate', type: 'Page', description: 'Broadband, cybersecurity, .bw domain, EASSy cable.' },
  { title: 'Legislation', path: '/mandate/legislation', category: 'Mandate', type: 'Page', description: 'CRA Act, Electronic Records Act, ECT Act, Digital Services Act.' },
  { title: 'Licensing Framework', path: '/mandate/licensing', category: 'Mandate', type: 'Page', description: 'NFP, SAP, CSP licence categories for telecoms, broadcasting, postal.' },
  { title: 'File a Complaint', path: '/services/file-complaint', category: 'Services', type: 'Page', description: 'Online complaint form for telecoms, broadcasting, postal issues.' },
  { title: 'Cybersecurity Hub', path: '/cybersecurity', category: 'Services', type: 'Page', description: 'Report cyber incidents, safety tips, live CVE alerts, CSIRT contact, quiz cards, SIM swap protection, phishing.' },
  { title: 'Apply for a Licence', path: '/licensing', category: 'Services', type: 'Page', description: 'All 13 licence types: Aircraft Radio, Amateur Radio, Broadcasting, Cellular, Citizen Band, Point-to-Point, Private Radio, Radio Dealers, Radio Frequency, Satellite, Type Approval, VANS.' },
  { title: 'Licence Verification', path: '/services/licence-verification', category: 'Services', type: 'Page', description: 'Verify if an operator holds a valid BOCRA licence.' },
  { title: 'Type Approval', path: '/services/type-approval', category: 'Services', type: 'Page', description: 'Equipment approval database and type approval applications.' },
  { title: 'Register .BW Domain', path: '/services/register-bw', category: 'Services', type: 'Page', description: 'Register a .bw country-code domain name. WHOIS lookup, registrars.' },
  { title: 'QoS Monitoring', path: '/services/qos-monitoring', category: 'Services', type: 'Page', description: 'Network quality data for Mascom, BTC, Orange operators.' },
  { title: 'Spectrum Management', path: '/services/spectrum', category: 'Services', type: 'Page', description: 'ASMS-WebCP, frequency plan, spectrum allocation.' },
  { title: 'Telecom Statistics', path: '/telecom-statistics', category: 'Data', type: 'Page', description: 'Mobile subscriptions, broadband, mobile money statistics charts.' },
  { title: 'Documents & Legislation', path: '/documents/drafts', category: 'Documents', type: 'Page', description: '420+ documents: acts, regulations, guidelines, annual reports, consultation papers.' },
  { title: 'ICT Licensing Framework', path: '/documents/ict-licensing', category: 'Documents', type: 'Page', description: 'ICT licensing framework, application requirements, fees, licensed operators.' },
  { title: 'News', path: '/media/news', category: 'Media', type: 'Page', description: 'Latest BOCRA announcements, industry updates, consumer news.' },
  { title: 'News & Events', path: '/media/news-events', category: 'Media', type: 'Page', description: 'Public notices, tenders, media releases, and regulatory documents. Broadcasting election code, licensee publications, QoS monitoring, broadband pricing.' },
  // News & Events Documents
  { title: 'Broadcasting Election Code of Conduct', path: '/media/news-events', category: 'Documents', type: 'Document', description: 'BOCRA code governing broadcasting service licensees during election periods. Impartiality, party political broadcasts, advertising rules.' },
  { title: 'Licensed Communications Operators Publication', path: '/media/news-events', category: 'Documents', type: 'Document', description: 'Gazette listing all BOCRA-licensed SAP, NFP, mobile operators (BTC, Mascom, Orange), postal and broadcasting operators.' },
  { title: 'QoS Monitoring System Tender', path: '/media/news-events', category: 'Documents', type: 'Document', description: 'Tender for supply, installation and commissioning of Quality of Service monitoring system for fixed and mobile networks.' },
  { title: 'Fixed Broadband Price Reduction', path: '/media/news-events', category: 'Media', type: 'Document', description: 'BOCRA approved up to 40% reduction in BTC fixed broadband prices. 20Mbps P650, 50Mbps P1200, 100Mbps P1900.' },
  { title: 'ICT Equipment Supply Tender', path: '/media/news-events', category: 'Documents', type: 'Document', description: 'Invitation to tender for supply and delivery of ICT equipment to support BOCRA operations.' },
  { title: 'BOCRA Public Tender Notice Jan 2024', path: '/media/news-events', category: 'Documents', type: 'Document', description: 'General procurement notice inviting qualified bidders for various BOCRA service requirements.' },
  { title: 'Etsha 6 Computer Lab \u2014 Best Evaluated Bidder', path: '/media/news-events', category: 'Documents', type: 'Document', description: 'Contract award for construction of computer laboratory at Etsha 6 Primary School. BWP 1.88M to C.E.N. Enterprises.' },
  { title: 'BOCRA Advertisement Dec 2023', path: '/media/news-events', category: 'Media', type: 'Document', description: 'Official BOCRA public advertisement with regulatory updates and stakeholder communications.' },
  { title: 'Contact Us', path: '/contact', category: 'Contact', type: 'Page', description: 'BOCRA contact details, address, phone, email, enquiry form.' },
  { title: 'FAQs', path: '/faqs', category: 'Help', type: 'Page', description: 'Frequently asked questions about BOCRA services.' },
  { title: 'Consumer Education', path: '/complaints/consumer-education', category: 'Consumer', type: 'Page', description: 'Consumer rights: right to be informed, choice, heard, safety.' },
  { title: 'Privacy Notice', path: '/privacy-notice', category: 'Legal', type: 'Page', description: 'How BOCRA collects, uses, and protects personal data.' },
  { title: '.BW ccTLD', path: '/projects/bw-cctld', category: 'Projects', type: 'Page', description: 'Botswana country-code top-level domain management.' },
  { title: 'BW CIRT', path: '/projects/bw-cirt', category: 'Projects', type: 'Page', description: 'Computer Incident Response Team and national cybersecurity.' },
  { title: 'BOCRA Admin Portal', path: '/admin', category: 'Admin', type: 'Page', description: 'Staff portal to manage complaints, licence applications, cybersecurity incidents.' },
  // Key Documents
  { title: 'Communications Regulatory Authority Act, 2012', path: '/documents/drafts', category: 'Legislation', type: 'Document', description: 'The CRA Act establishing BOCRA as the communications regulator of Botswana.' },
  { title: 'Cybersecurity Act, 2025', path: '/documents/drafts', category: 'Legislation', type: 'Document', description: 'Makes cyber attacks a crime in Botswana. Defines offences, penalties, and CSIRT powers.' },
  { title: 'Data Protection Act, 2018', path: '/documents/drafts', category: 'Legislation', type: 'Document', description: 'Protects personal data of Botswana citizens. Rights to access, correct, delete data.' },
  { title: 'Digital Services Act, 2025', path: '/documents/drafts', category: 'Legislation', type: 'Document', description: 'Regulates digital services, platforms, and online intermediaries in Botswana.' },
  { title: 'Broadcasting Act', path: '/documents/drafts', category: 'Legislation', type: 'Document', description: 'Broadcasting licensing, content regulation for radio and TV.' },
  { title: 'Electronic Communications and Transactions Act, 2014', path: '/documents/drafts', category: 'Legislation', type: 'Document', description: 'Regulates electronic transactions, digital signatures, cybercrime.' },
  { title: 'Consumer Protection Policy', path: '/documents/drafts', category: 'Policy', type: 'Document', description: 'BOCRA complaints handling, consumer rights, dispute resolution.' },
  { title: 'Website Security Guidelines', path: '/services/register-bw', category: 'Documents', type: 'Document', description: 'Security guidelines for .bw domain websites, SSL, XSS, SQL injection prevention.' },
  { title: 'Email Security Guidelines', path: '/services/register-bw', category: 'Documents', type: 'Document', description: 'Email security best practices, SPF, DKIM, multi-factor authentication.' },
  { title: 'Registrar Accreditation Form', path: '/services/register-bw', category: 'Documents', type: 'Document', description: 'Application to become an accredited .bw domain registrar. BWP 3,000 fee.' },
  // Operators
  { title: 'Mascom Wireless', path: '/mandate/telecommunications', category: 'Operator', type: 'Operator', description: 'Mobile network operator. Complaints, coverage, billing, data, SIM swap.' },
  { title: 'BTC \u2014 Botswana Telecommunications Corporation', path: '/mandate/telecommunications', category: 'Operator', type: 'Operator', description: 'Fixed line and broadband provider. Internet, billing complaints.' },
  { title: 'Orange Botswana', path: '/mandate/telecommunications', category: 'Operator', type: 'Operator', description: 'Mobile network operator. Orange Money, data plans, coverage.' },
  { title: 'BoFiNet \u2014 Botswana Fibre Networks', path: '/mandate/telecommunications', category: 'Operator', type: 'Operator', description: 'National fibre optic backbone. Wholesale broadband infrastructure.' },
  { title: 'Botswana Post', path: '/mandate/postal', category: 'Operator', type: 'Operator', description: 'National postal service. Mail delivery, parcels, postal complaints.' },

  // New pages
  { title: 'Public Consultations', path: '/consultations', category: 'Services', type: 'Page', description: 'Have your say on proposed regulations and policies. Submit responses to open consultations on broadband, broadcasting, QoS, and consumer protection.' },
  { title: 'Speeches Archive', path: '/media/speeches', category: 'Media', type: 'Page', description: 'Speeches by BOCRA Chief Executive Martin Mokgware and senior leadership at regulatory events, conferences, and public engagements.' },
  { title: 'Data Subject Access Request', path: '/portal/data-request', category: 'Services', type: 'Page', description: 'Exercise your rights under the Botswana Data Protection Act 2024. Request access to, correction, or deletion of your personal data.' },
  { title: 'News & Events', path: '/media/news-events', category: 'Media', type: 'Page', description: 'Latest news, public notices, tenders, regulatory updates, and media releases from BOCRA.' },
];

const getPopularSearches = (lang) => [
  { label: lang === 'tn' ? 'Tlhagisa Ngongorego' : 'File a Complaint', query: 'complaint' },
  { label: 'Mascom', query: 'mascom' },
  { label: lang === 'tn' ? 'Tshireletso ya Saebara' : 'Cybersecurity', query: 'cybersecurity' },
  { label: lang === 'tn' ? 'Laesense' : 'Licence', query: 'licence' },
  { label: '.BW Domain', query: 'domain' },
  { label: lang === 'tn' ? 'Tshireletso ya Data' : 'Data Protection', query: 'data protection' },
  { label: 'BTC', query: 'BTC' },
  { label: lang === 'tn' ? 'Phasalatso' : 'Broadcasting', query: 'broadcasting' },
];

const TYPE_ORDER = { Page: 0, Document: 1, Operator: 2 };

// ─── Content type map for semantic results ───────────────────────
const CONTENT_TYPE_STYLE = {
  page: { label: 'Page', labelTn: 'Tsebe', className: 'bg-blue-50 text-blue-600' },
  document: { label: 'Document', labelTn: 'Kwalo', className: 'bg-yellow-50 text-yellow-700' },
  faq: { label: 'FAQ', labelTn: 'Potso', className: 'bg-purple-50 text-purple-600' },
  consultation: { label: 'Consultation', labelTn: 'Theriso', className: 'bg-pink-50 text-pink-600' },
  news: { label: 'News', labelTn: 'Dikgang', className: 'bg-orange-50 text-orange-600' },
  knowledge_base: { label: 'Document', labelTn: 'Kwalo', className: 'bg-yellow-50 text-yellow-700' },
};

// ─── Relevance display helpers ───────────────────────────────────
function getRelevanceInfo(similarity, t) {
  if (similarity > 0.7) return { label: t('search.relevanceHigh'), color: '#6BBE4E', width: '100%' };
  if (similarity > 0.5) return { label: t('search.relevanceMedium'), color: '#F7B731', width: '70%' };
  return { label: t('search.relevanceLow'), color: '#94a3b8', width: '40%' };
}

// ─── Log search event (fire-and-forget) ──────────────────────────
function logSearchEvent(eventData) {
  supabase.from('search_events').insert(eventData).then(() => {}).catch(() => {});
}

export default function SearchPage() {
  const { lang, t } = useLanguage();
  const tn = lang === 'tn';
  const POPULAR_SEARCHES = getPopularSearches(lang);
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const heroRef = useScrollReveal();

  // Semantic search state
  const [semanticResults, setSemanticResults] = useState(null);
  const [searchMode, setSearchMode] = useState('keyword');
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const lastSemanticQuery = useRef('');

  // ─── Keyword search (existing logic — unchanged) ────────────────
  const keywordResults = useMemo(() => {
    if (!query.trim()) return [];
    const words = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
    return SEARCH_INDEX.filter(item => {
      const haystack = (item.title + ' ' + item.description + ' ' + item.category).toLowerCase();
      return words.every(word => haystack.includes(word));
    }).sort((a, b) => {
      const typeA = TYPE_ORDER[a.type] ?? 9;
      const typeB = TYPE_ORDER[b.type] ?? 9;
      if (typeA !== typeB) return typeA - typeB;
      const qLower = query.toLowerCase();
      const aTitle = a.title.toLowerCase().includes(qLower) ? 0 : 1;
      const bTitle = b.title.toLowerCase().includes(qLower) ? 0 : 1;
      return aTitle - bTitle;
    });
  }, [query]);

  // ─── Semantic search (Phase 5 — behind feature flag) ────────────
  const performSemanticSearch = useCallback(async (searchQuery) => {
    if (!SEMANTIC_ENABLED || !searchQuery.trim()) return;

    const trimmed = searchQuery.trim();
    if (trimmed === lastSemanticQuery.current) return;
    lastSemanticQuery.current = trimmed;

    setLoading(true);
    setSearchMode('semantic');

    try {
      const response = await fetch(
        `${supabaseUrl_}/functions/v1/search-semantic`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey_}`,
          },
          body: JSON.stringify({
            query: trimmed,
            content_type: filterType || undefined,
            sector: filterSector || undefined,
            language: lang,
            limit: 15,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      setSemanticResults(data.results || []);
      setSearchMode(data.search_mode || 'semantic');

      logSearchEvent({
        event_type: (data.results || []).length > 0 ? 'search_executed' : 'search_no_results',
        query_text: trimmed,
        results_count: (data.results || []).length,
        search_mode: data.search_mode || 'semantic',
        language: lang,
      });
    } catch (err) {
      console.error('Semantic search failed, using keyword fallback:', err);
      setSemanticResults(null);
      setSearchMode('fallback');

      logSearchEvent({
        event_type: keywordResults.length > 0 ? 'search_executed' : 'search_no_results',
        query_text: trimmed,
        results_count: keywordResults.length,
        search_mode: 'fallback',
        language: lang,
      });
    } finally {
      setLoading(false);
    }
  }, [lang, filterType, filterSector, keywordResults.length]);

  // Re-run semantic search when filters change (if we already have a query)
  useEffect(() => {
    if (SEMANTIC_ENABLED && lastSemanticQuery.current) {
      lastSemanticQuery.current = ''; // Reset to force re-search
      performSemanticSearch(query);
    }
  }, [filterType, filterSector]);

  // Handle Enter key and popular search clicks
  const handleSearchSubmit = useCallback((searchQuery) => {
    if (SEMANTIC_ENABLED && searchQuery.trim()) {
      performSemanticSearch(searchQuery);
    }
  }, [performSemanticSearch]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(query);
    }
  }, [query, handleSearchSubmit]);

  const handlePopularSearch = useCallback((searchQuery) => {
    setQuery(searchQuery);
    handleSearchSubmit(searchQuery);
  }, [handleSearchSubmit]);

  const handleClear = useCallback(() => {
    setQuery('');
    setSemanticResults(null);
    setSearchMode('keyword');
    lastSemanticQuery.current = '';
  }, []);

  // Handle result click logging
  const handleResultClick = useCallback((title, position) => {
    logSearchEvent({
      event_type: 'search_result_clicked',
      query_text: query,
      clicked_result_title: title,
      clicked_result_position: position,
      search_mode: searchMode,
      language: lang,
    });
  }, [query, searchMode, lang]);

  // ─── Determine which results to show ────────────────────────────
  const useSemanticView = SEMANTIC_ENABLED && semanticResults !== null;
  const results = useSemanticView ? semanticResults : keywordResults;

  // Group keyword results by type (existing behavior)
  const grouped = useMemo(() => {
    if (useSemanticView) return {};
    const groups = {};
    keywordResults.forEach(r => {
      const type = r.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(r);
    });
    return groups;
  }, [keywordResults, useSemanticView]);

  const typeLabels = { Page: tn ? 'Ditsebe' : 'Pages', Document: tn ? 'Dikwalo le Melao' : 'Documents & Legislation', Operator: tn ? 'Batsholetsi' : 'Operators' };

  return (
    <div className="bg-white">
      <Helmet>
        <title>Search — BOCRA</title>
        <meta name="description" content="Search the BOCRA website for documents, news, services, and regulatory information." />
        <link rel="canonical" href="https://bocra.org.bw/search" />
      </Helmet>
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <Breadcrumb items={[{ label: tn ? 'Batla' : 'Search' }]} />
        </div>
      </div>
      {/* Hero */}
      <PageHero category="SEARCH" categoryTn="BATLA" title="Search BOCRA" titleTn="Batla mo BOCRA" description="Find pages, documents, services, and information across the BOCRA website." descriptionTn="Batla ditsebe, dikwalo, ditirelo, le tshedimosetso mo webosaeteng ya BOCRA." color="blue" />

      {/* Search bar */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-5 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2">
            <div className="relative">
              {loading ? (
                <Loader2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00A6CE] animate-spin" />
              ) : (
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              )}
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tn ? 'Batla ditsebe, dikwalo, ditirelo, dilaesense...' : 'Search pages, documents, services, licensing...'}
                className="w-full pl-11 pr-4 py-3.5 text-sm border-0 focus:outline-none focus:ring-0 text-bocra-slate placeholder:text-gray-400 rounded-lg"
                autoFocus
              />
              {query && (
                <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-xs px-2 py-1 rounded hover:bg-gray-100">
                  {tn ? 'Phimola' : 'Clear'}
                </button>
              )}
            </div>
          </div>

          {/* Filters — only shown when semantic search is enabled */}
          {SEMANTIC_ENABLED && query && (
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <div className="flex items-center gap-1.5 text-[10px] text-bocra-slate/40 uppercase tracking-wider font-medium">
                <Filter size={12} />
                <span>{t('search.filterType')}</span>
              </div>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-bocra-slate/70 focus:outline-none focus:border-[#00A6CE]"
              >
                <option value="">{t('search.filterAll')}</option>
                <option value="page">{t('search.filterPages')}</option>
                <option value="document">{t('search.filterDocuments')}</option>
                <option value="faq">{t('search.filterFaqs')}</option>
                <option value="consultation">{t('search.filterConsultations')}</option>
                <option value="news">{t('search.filterNews')}</option>
              </select>
              <select
                value={filterSector}
                onChange={e => setFilterSector(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-bocra-slate/70 focus:outline-none focus:border-[#00A6CE]"
              >
                <option value="">{t('search.filterSector')}: {t('search.filterAll')}</option>
                <option value="telecoms">{t('search.sectorTelecoms')}</option>
                <option value="broadcasting">{t('search.sectorBroadcasting')}</option>
                <option value="postal">{t('search.sectorPostal')}</option>
                <option value="internet_ict">{t('search.sectorInternet')}</option>
              </select>
            </div>
          )}

          {query && results.length > 0 && !loading && (
            <p className="text-xs text-bocra-slate/40 mt-2 text-center">{results.length} {tn ? (results.length !== 1 ? 'dipholo' : 'sephetho') : (results.length !== 1 ? 'results' : 'result')} {tn ? 'tsa' : 'for'} \u201c{query}\u201d</p>
          )}
        </div>
      </section>


      {/* Popular searches — show when no query */}
      {!query && (
        <section className="py-8">
          <div className="section-wrapper max-w-2xl mx-auto text-center">
            <p className="text-xs text-bocra-slate/30 uppercase tracking-widest font-medium mb-4">{lang === 'tn' ? 'Dipatlo tse di Ratwang' : 'Popular Searches'}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.map(s => (
                <button key={s.query} onClick={() => handlePopularSearch(s.query)}
                  className="px-4 py-2 bg-bocra-off-white border border-gray-200 rounded-xl text-sm font-medium text-bocra-slate/60 hover:text-[#00A6CE] hover:border-[#00A6CE]/30 hover:bg-[#00A6CE]/5 transition-all">
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Loading state */}
      {query && loading && (
        <section className="py-16">
          <div className="section-wrapper max-w-3xl mx-auto text-center">
            <Loader2 size={32} className="mx-auto mb-3 text-[#00A6CE] animate-spin" />
            <p className="text-sm text-bocra-slate/40">{t('search.loading')}</p>
          </div>
        </section>
      )}

      {/* Results — Semantic view */}
      {query && !loading && useSemanticView && (
        <section className="py-8">
          <div className="section-wrapper max-w-3xl mx-auto">
            {semanticResults.length === 0 ? (
              <div className="text-center py-16">
                <Search size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="text-lg text-bocra-slate/50 mb-2">{tn ? `Ga go na dipholo tse di bonweng tsa \u201c${query}\u201d` : `No results found for \u201c${query}\u201d`}</p>
                <p className="text-sm text-bocra-slate/30">{t('search.noResults')}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {POPULAR_SEARCHES.slice(0, 4).map(s => (
                    <button key={s.query} onClick={() => handlePopularSearch(s.query)}
                      className="px-3 py-1.5 bg-bocra-off-white border border-gray-200 rounded-lg text-xs font-medium text-bocra-slate/50 hover:text-[#00A6CE] transition-all">
                      {tn ? `Leka \u201c${s.label}\u201d` : `Try \u201c${s.label}\u201d`}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {semanticResults.map((item, i) => {
                  const typeInfo = CONTENT_TYPE_STYLE[item.content_type] || CONTENT_TYPE_STYLE.document;
                  const relevance = getRelevanceInfo(item.similarity || 0.5, t);
                  const linkPath = item.url || '/search';

                  return (
                    <Link
                      key={`${item.content_type}-${item.content_id}-${i}`}
                      to={linkPath}
                      onClick={() => handleResultClick(item.title, i)}
                      className="block bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:border-gray-200 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#00458B]/10">
                          <FileText size={18} style={{ color: '#00458B' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-bocra-slate group-hover:text-[#00458B] transition-colors">{item.title}</h3>
                            <ArrowRight size={12} className="text-[#00A6CE] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                          <p className="text-xs text-bocra-slate/50 mt-1 leading-relaxed line-clamp-2">
                            {item.chunk_text?.slice(0, 200)}{item.chunk_text?.length > 200 ? '\u2026' : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${typeInfo.className}`}>
                              {tn ? typeInfo.labelTn : typeInfo.label}
                            </span>
                            {item.sector && (
                              <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[#00A6CE]/10 text-[#00A6CE]">
                                {item.sector.replace('_', ' ')}
                              </span>
                            )}
                            {/* Relevance bar */}
                            <div className="flex items-center gap-1.5 ml-auto">
                              <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: relevance.width, backgroundColor: relevance.color }} />
                              </div>
                              <span className="text-[9px] text-bocra-slate/30">{relevance.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Search mode indicator */}
            {semanticResults.length > 0 && (
              <p className="text-[10px] text-bocra-slate/25 text-center mt-4">
                {searchMode === 'semantic' ? t('search.modeSemantic') : t('search.modeFallback')}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Results — Keyword view (existing behavior, shown when semantic is off or hasn't been triggered) */}
      {query && !loading && !useSemanticView && (
        <section className="py-8">
          <div className="section-wrapper max-w-3xl mx-auto">
            {keywordResults.length === 0 ? (
              <div className="text-center py-16">
                <Search size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="text-lg text-bocra-slate/50 mb-2">{tn ? `Ga go na dipholo tse di bonweng tsa \u201c${query}\u201d` : `No results found for \u201c${query}\u201d`}</p>
                <p className="text-sm text-bocra-slate/30">{tn ? 'Leka mafoko a mangwe kgotsa o lebelele dikarolo tsa rona' : 'Try different keywords or browse our sections below'}</p>
                {SEMANTIC_ENABLED && (
                  <p className="text-xs text-bocra-slate/30 mt-2">{tn ? 'Tobetsa Enter go batla ka AI' : 'Press Enter to search with AI'}</p>
                )}
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {POPULAR_SEARCHES.slice(0, 4).map(s => (
                    <button key={s.query} onClick={() => handlePopularSearch(s.query)}
                      className="px-3 py-1.5 bg-bocra-off-white border border-gray-200 rounded-lg text-xs font-medium text-bocra-slate/50 hover:text-[#00A6CE] transition-all">
                      {tn ? `Leka \u201c${s.label}\u201d` : `Try \u201c${s.label}\u201d`}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="mb-8 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-xs font-bold text-bocra-slate/40 uppercase tracking-widest">{typeLabels[type] || type}</h2>
                    <span className="text-[10px] text-bocra-slate/25">({items.length})</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="space-y-2">
                    {items.map((item, i) => {
                      const style = CATEGORY_STYLE[item.category] || DEFAULT_STYLE;
                      const Icon = style.icon;
                      return (
                        <Link key={item.path + i} to={item.path}
                          onClick={() => handleResultClick(item.title, i)}
                          className="block bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:border-gray-200 transition-all group">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                              <Icon size={18} style={{ color: style.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm text-bocra-slate group-hover:text-[#00458B] transition-colors">{item.title}</h3>
                                <ArrowRight size={12} className="text-[#00A6CE] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </div>
                              <p className="text-xs text-bocra-slate/50 mt-1 leading-relaxed">{item.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: style.color + '10', color: style.color }}>{item.category}</span>
                                <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                                  item.type === 'Page' ? 'bg-blue-50 text-blue-600' :
                                  item.type === 'Document' ? 'bg-yellow-50 text-yellow-700' :
                                  'bg-green-50 text-green-600'
                                }`}>{item.type}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            {/* Hint to use semantic search */}
            {SEMANTIC_ENABLED && keywordResults.length > 0 && !semanticResults && (
              <p className="text-[10px] text-bocra-slate/25 text-center mt-4">
                {tn ? 'Tobetsa Enter go batla ka AI' : 'Press Enter to search with AI'}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Colour bar */}
      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
