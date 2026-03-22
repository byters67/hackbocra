/**
 * News & Events Page
 * 
 * Displays news articles, announcements, and events from BOCRA.
 * Content sourced from BOCRA Website Audit - Section 3.8 (Media Section).
 * 
 * News items from audit: Website Hackathon (Mar 2026), SADC Roaming (Mar 2026),
 * Supplier Database EOI (Feb 2026), BTC Data Prices (Feb 2026), etc.
 * 
 * Features:
 * - Category filtering
 * - Search
 * - Pagination
 * - Will fetch from Supabase 'posts' table when populated
 */

import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, ArrowRight, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import Breadcrumb from '../../components/ui/Breadcrumb';

// Placeholder news data (will be replaced by Supabase queries)
const PLACEHOLDER_NEWS = [
  {
    id: 1, title: 'BOCRA Website Development Hackathon', category: 'Public Notices',
    date: '2026-03-13', excerpt: 'BOCRA invites youth teams aged 18-35 to participate in the website redesign hackathon. Registration opens March 18, hacking runs March 20-27.',
  },
  {
    id: 2, title: 'SADC Roaming Tariff Reductions Take Effect', category: 'Media Releases',
    date: '2026-03-10', excerpt: 'New reduced roaming tariffs across SADC member states benefit cross-border travelers with lower voice, data, and SMS charges.',
  },
  {
    id: 3, title: 'Expression of Interest: Supplier Database 2026/27', category: 'Tenders & Procurement',
    date: '2026-02-28', excerpt: 'BOCRA invites qualified suppliers to register for the upcoming 2026/27 financial year supplier database.',
  },
  {
    id: 4, title: 'BTC Announces Reduced Data Prices', category: 'Media Releases',
    date: '2026-02-15', excerpt: 'Botswana Telecommunications Corporation reduces mobile data prices following ongoing BOCRA market interventions.',
  },
  {
    id: 5, title: 'ITA Broadcasting Licence Issued', category: 'Public Notices',
    date: '2026-01-20', excerpt: 'BOCRA issues a new broadcasting licence to ITA, expanding media options for Botswana consumers.',
  },
  {
    id: 6, title: 'Orange Botswana Reduced Data Prices', category: 'Media Releases',
    date: '2025-11-15', excerpt: 'Orange Botswana announces reduced data prices following regulatory review of mobile broadband tariffs.',
  },
  {
    id: 7, title: 'Commercial Radio Licensing Framework Update', category: 'Regulatory Documents',
    date: '2025-10-28', excerpt: 'BOCRA publishes updated framework for commercial radio licensing with new application requirements.',
  },
  {
    id: 8, title: 'MNO Tariff Reduction Directive', category: 'Regulatory Documents',
    date: '2025-09-12', excerpt: 'BOCRA directs all mobile network operators to reduce voice and data tariffs to benefit consumers.',
  },
  {
    id: 9, title: 'BOCRA Newsletter Issue 001', category: 'Media Releases',
    date: '2025-07-01', excerpt: 'First edition of the BOCRA quarterly newsletter covering regulatory updates, industry trends, and consumer tips.',
  },
];

const CATEGORIES = ['All', 'Public Notices', 'Tenders & Procurement', 'Media Releases', 'Regulatory Documents'];

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState(PLACEHOLDER_NEWS);
  const [loadingNews, setLoadingNews] = useState(true);
  const heroRef = useScrollReveal();
  const gridRef = useStaggerReveal({ stagger: 0.08 });

  // Fetch from Supabase — falls back to PLACEHOLDER_NEWS if empty or error
  useEffect(() => {
    let cancelled = false;
    async function fetchArticles() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        if (cancelled) return;
        if (error) throw error;
        if (data && data.length > 0) {
          setNews(data.map(post => ({
            id: post.id,
            title: post.title,
            category: post.category,
            date: post.published_at ? post.published_at.split('T')[0] : post.created_at?.split('T')[0],
            excerpt: post.summary || '',
            slug: post.slug,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      } finally {
        if (!cancelled) setLoadingNews(false);
      }
    }
    fetchArticles();
    return () => { cancelled = true; };
  }, []);

  const filteredNews = news.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <Helmet>
        <title>News — BOCRA</title>
        <meta name="description" content="Latest announcements, industry updates, and regulatory decisions from BOCRA." />
        <link rel="canonical" href="https://bocra.org.bw/media/news" />
      </Helmet>
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <Breadcrumb items={[{ label: 'Media', href: '/media/news' }, { label: 'News' }]} />
        </div>
      </div>

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0">
        <div className="relative py-8 sm:py-10 lg:py-12 px-5 sm:px-8 lg:px-10 rounded-2xl overflow-hidden bg-[#00A6CE]">
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div ref={heroRef} className="relative max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-1 bg-white/40 rounded-full" />
              <span className="text-xs text-white/60 uppercase tracking-widest font-medium">Media</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight">News & Events</h1>
            <p className="text-white/70 mt-3 text-sm sm:text-base max-w-2xl leading-relaxed">Stay updated with the latest from BOCRA and the communications sector.</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 bg-white sticky top-16 lg:top-[72px] z-30 border-b border-gray-100 shadow-sm">
        <div className="section-wrapper">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-bocra-blue text-white'
                      : 'bg-bocra-off-white text-bocra-slate/60 hover:bg-bocra-blue/5 hover:text-bocra-blue'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bocra-slate/30" />
              <input
                type="search"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bocra-off-white border border-gray-200 rounded-xl text-sm focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12 md:py-10 bg-bocra-off-white">
        <div className="section-wrapper">
          {loadingNews ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                  <div className="h-2 w-full bg-gray-200" />
                  <div className="p-7 space-y-4">
                    <div className="flex gap-3"><div className="h-5 w-20 bg-gray-200 rounded" /><div className="h-5 w-24 bg-gray-100 rounded" /></div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded" />
                    <div className="space-y-2"><div className="h-4 w-full bg-gray-100 rounded" /><div className="h-4 w-5/6 bg-gray-100 rounded" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-bocra-slate/50 text-lg">No news items match your filters.</p>
            </div>
          ) : (
            <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((item) => (
                <article key={item.id} className="bg-white rounded-2xl overflow-hidden card-hover group border border-gray-100">
                  <div className="h-2 w-full bg-gradient-to-r from-bocra-blue to-bocra-cyan" />
                  <div className="p-7">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-bocra-blue bg-bocra-blue/5 px-2.5 py-1 rounded-lg">
                        <Tag size={10} />
                        {item.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-bocra-slate/40">
                        <Calendar size={10} />
                        {new Date(item.date).toLocaleDateString('en-BW', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-bocra-slate group-hover:text-bocra-blue transition-colors mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-bocra-slate/60 leading-relaxed line-clamp-3 mb-4">
                      {item.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-bocra-blue">
                      Read more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
