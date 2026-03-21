/**
 * Open Data API Documentation Page
 *
 * Provides developer-friendly documentation for BOCRA\u2019s public data API.
 * Endpoints surface read-only telecom statistics, operator data, documents,
 * and published content \u2014 all protected by Supabase RLS (only published /
 * public rows are accessible with the anon key).
 *
 * Includes:
 * - Endpoint reference with method, path, description
 * - "Try It" buttons that make live requests
 * - Rate limit notice
 * - API key concept (anon key for public access, auth for write)
 * - Response previews
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Code2, Key, Shield, Zap, Clock, AlertCircle,
  ChevronDown, Play, Copy, CheckCircle, Database,
  BookOpen, Globe, Lock, ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';

// ─── API ENDPOINT DEFINITIONS ───────────────────────────────────

const API_BASE = 'https://cyalwtuladeexxfsbrcs.supabase.co/rest/v1';

const ENDPOINTS = [
  {
    id: 'operators',
    method: 'GET',
    path: '/operators',
    title: 'List Licensed Operators',
    description: 'Returns all active telecom operators licensed by BOCRA, including network vendors and branding colours.',
    table: 'operators',
    query: 'select=*&active=eq.true',
    sampleResponse: `[
  {
    "id": "...",
    "name": "Mascom Wireless",
    "short_name": "MASCOM",
    "vendor": "Huawei",
    "color": "#E21836",
    "active": true
  }
]`,
    category: 'Telecoms',
    color: '#00A6CE',
  },
  {
    id: 'kpi-data',
    method: 'GET',
    path: '/kpi_data',
    title: 'Quality of Service Metrics',
    description: 'Returns QoS key performance indicator readings across operators and locations. Filterable by operator, KPI type, and date range.',
    table: 'kpi_data',
    query: 'select=*,operators(name,short_name)&order=recorded_at.desc&limit=10',
    sampleResponse: `[
  {
    "id": "...",
    "kpi_type": "download_speed",
    "value": 45.2,
    "location": "Gaborone",
    "recorded_at": "2026-03-15T10:30:00Z",
    "operators": {
      "name": "Mascom Wireless",
      "short_name": "MASCOM"
    }
  }
]`,
    category: 'Telecoms',
    color: '#00A6CE',
  },
  {
    id: 'documents',
    method: 'GET',
    path: '/documents',
    title: 'Regulatory Documents',
    description: 'Returns published regulatory documents, legislation, and reports. Filterable by category, year, and file type.',
    table: 'documents',
    query: 'select=id,title,category,year,file_type,downloads,published_at&order=published_at.desc&limit=10',
    sampleResponse: `[
  {
    "id": "...",
    "title": "Telecommunications Act",
    "category": "Legislation",
    "year": "2024",
    "file_type": "PDF",
    "downloads": 342,
    "published_at": "2024-01-15T00:00:00Z"
  }
]`,
    category: 'Resources',
    color: '#F7B731',
  },
  {
    id: 'posts',
    method: 'GET',
    path: '/posts',
    title: 'News and Announcements',
    description: 'Returns published news articles, speeches, and event announcements. Only published posts are accessible via the public API.',
    table: 'posts',
    query: 'select=id,title,slug,excerpt,category,published_at&status=eq.published&order=published_at.desc&limit=10',
    sampleResponse: `[
  {
    "id": "...",
    "title": "BOCRA Website Hackathon",
    "slug": "bocra-website-hackathon",
    "excerpt": "Youth teams invited to redesign...",
    "category": "Announcement",
    "published_at": "2026-03-13T00:00:00Z"
  }
]`,
    category: 'Media',
    color: '#C8237B',
  },
  {
    id: 'pages',
    method: 'GET',
    path: '/pages',
    title: 'Published Pages',
    description: 'Returns published CMS pages. Only pages with status "published" are accessible. Useful for building alternative frontends or content aggregation.',
    table: 'pages',
    query: 'select=id,title,slug,meta_description,updated_at&status=eq.published&order=updated_at.desc&limit=10',
    sampleResponse: `[
  {
    "id": "...",
    "title": "Telecommunications",
    "slug": "telecommunications",
    "meta_description": "Regulating mobile...",
    "updated_at": "2026-03-10T00:00:00Z"
  }
]`,
    category: 'Content',
    color: '#6BBE4E',
  },
];

const FEATURES = [
  { icon: Database, title: 'Open Data', desc: 'Public telecom statistics, operator data, and regulatory documents accessible to all.' },
  { icon: Shield, title: 'Secure by Default', desc: 'Row Level Security ensures only published, non-sensitive data is exposed.' },
  { icon: Zap, title: 'RESTful', desc: 'Standard REST API with JSON responses. Filter, sort, and paginate with query params.' },
  { icon: Clock, title: 'Rate Limited', desc: '30 requests per minute per client. Contact us for higher limits.' },
];

// ─── MAIN COMPONENT ─────────────────────────────────────────────

export default function ApiDocsPage() {
  const heroRef = useScrollReveal();
  const featuresRef = useStaggerReveal({ stagger: 0.1 });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">{lang === 'tn' ? 'Gae' : 'Home'}</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate">Open Data API</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0">
        <div className="relative py-10 sm:py-14 lg:py-16 px-6 sm:px-10 lg:px-14 rounded-2xl overflow-hidden bg-gradient-to-br from-[#001A3A] to-[#00458B]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-bocra-cyan/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-bocra-green/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

          <div ref={heroRef} className="relative max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Code2 size={16} className="text-bocra-cyan" />
              <span className="text-xs text-white/60 uppercase tracking-widest font-medium">Developer Resources</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Open Data API
            </h1>
            <p className="text-white/60 mt-4 text-base sm:text-lg max-w-2xl leading-relaxed">
              Access BOCRA&#39;s public telecom datasets, regulatory documents, and operator information
              through our RESTful API. Built for developers, researchers, and civic tech projects.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a href="#endpoints" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-bocra-blue font-bold rounded-xl hover:bg-gray-100 transition-all">
                <BookOpen size={16} /> Endpoints
              </a>
              <a href="#authentication" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                <Key size={16} /> Authentication
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 bg-white">
        <div className="section-wrapper">
          <div ref={featuresRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-bocra-off-white rounded-2xl p-6 border border-gray-100">
                  <div className="w-10 h-10 bg-bocra-blue/5 rounded-xl flex items-center justify-center mb-3">
                    <Icon size={20} className="text-bocra-blue" />
                  </div>
                  <h3 className="font-bold text-bocra-slate">{f.title}</h3>
                  <p className="text-sm text-bocra-slate/50 mt-1">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Base URL + Auth */}
      <section id="authentication" className="py-10 bg-bocra-off-white">
        <div className="section-wrapper max-w-4xl">
          <h2 className="text-2xl font-extrabold text-bocra-slate mb-6">Getting Started</h2>

          {/* Base URL */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-5">
            <h3 className="text-sm font-bold text-bocra-slate/50 uppercase tracking-wider mb-3">Base URL</h3>
            <code className="block bg-[#0A1628] text-bocra-cyan px-4 py-3 rounded-xl text-sm font-mono break-all">
              {API_BASE}
            </code>
          </div>

          {/* Authentication */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-5">
            <h3 className="text-sm font-bold text-bocra-slate/50 uppercase tracking-wider mb-3">
              <Key size={14} className="inline mr-2 text-bocra-yellow" />
              Authentication
            </h3>
            <p className="text-sm text-bocra-slate/70 mb-4">
              All requests require an <code className="px-1.5 py-0.5 bg-gray-100 rounded text-bocra-blue text-xs font-mono">apikey</code> header.
              The public (anon) key provides read-only access to published data.
              Write operations require user authentication via Bearer token.
            </p>
            <div className="bg-[#0A1628] rounded-xl p-4 font-mono text-sm overflow-x-auto">
              <p className="text-white/40"># Public read-only access</p>
              <p className="text-white">
                <span className="text-bocra-green">curl</span>{' '}
                <span className="text-bocra-cyan">{API_BASE}/operators</span>{' '}
                <span className="text-white/60">\</span>
              </p>
              <p className="text-white pl-4">
                <span className="text-bocra-yellow">-H</span>{' '}
                <span className="text-bocra-magenta">&quot;apikey: YOUR_ANON_KEY&quot;</span>
              </p>
            </div>
            <div className="mt-4 p-4 bg-bocra-yellow/5 border border-bocra-yellow/20 rounded-xl">
              <p className="text-sm text-bocra-slate/70">
                <AlertCircle size={14} className="inline mr-1.5 text-bocra-yellow" />
                <strong>API Key:</strong> To obtain an API key, contact BOCRA at{' '}
                <a href="mailto:info@bocra.org.bw" className="text-bocra-blue hover:underline">info@bocra.org.bw</a>{' '}
                or visit the <Link to="/contact" className="text-bocra-blue hover:underline">Contact page</Link>.
                For hackathon purposes, the public anon key is used automatically by the &quot;Try It&quot; buttons below.
              </p>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-sm font-bold text-bocra-slate/50 uppercase tracking-wider mb-3">
              <Clock size={14} className="inline mr-2 text-bocra-cyan" />
              Rate Limits
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-bocra-off-white rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-bocra-blue">30</p>
                <p className="text-xs text-bocra-slate/50 mt-1">Requests / minute</p>
              </div>
              <div className="bg-bocra-off-white rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-bocra-blue">1,000</p>
                <p className="text-xs text-bocra-slate/50 mt-1">Rows per request</p>
              </div>
              <div className="bg-bocra-off-white rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-bocra-blue">Free</p>
                <p className="text-xs text-bocra-slate/50 mt-1">Public access tier</p>
              </div>
            </div>
            <p className="text-sm text-bocra-slate/50 mt-4">
              Exceeding the rate limit returns <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">429 Too Many Requests</code>.
              For higher limits, contact BOCRA to discuss an enterprise API key.
            </p>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section id="endpoints" className="py-10 bg-white">
        <div className="section-wrapper max-w-4xl">
          <h2 className="text-2xl font-extrabold text-bocra-slate mb-2">API Endpoints</h2>
          <p className="text-bocra-slate/50 mb-8">All endpoints return JSON. Use query parameters to filter, sort, and paginate results.</p>

          <div className="space-y-4">
            {ENDPOINTS.map(ep => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </div>
      </section>

      {/* Query Parameters */}
      <section className="py-10 bg-bocra-off-white">
        <div className="section-wrapper max-w-4xl">
          <h2 className="text-2xl font-extrabold text-bocra-slate mb-6">Filtering and Pagination</h2>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <p className="text-sm text-bocra-slate/70 mb-4">
              The API uses PostgREST query syntax. Common parameters:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 font-bold text-bocra-slate">Parameter</th>
                    <th className="text-left py-2 pr-4 font-bold text-bocra-slate">Example</th>
                    <th className="text-left py-2 font-bold text-bocra-slate">Description</th>
                  </tr>
                </thead>
                <tbody className="text-bocra-slate/70">
                  <tr className="border-b border-gray-50">
                    <td className="py-2 pr-4"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">select</code></td>
                    <td className="py-2 pr-4"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">select=name,value</code></td>
                    <td className="py-2">Choose which columns to return</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 pr-4"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">order</code></td>
                    <td className="py-2 pr-4"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">order=created_at.desc</code></td>
                    <td className="py-2">Sort results by column</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 pr-4"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">limit</code></td>
                    <td className="py-2 pr-4"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">limit=10</code></td>
                    <td className="py-2">Limit number of results</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 pr-4"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">offset</code></td>
                    <td className="py-2 pr-4"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">offset=20</code></td>
                    <td className="py-2">Skip N results (pagination)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">eq / gt / lt</code></td>
                    <td className="py-2 pr-4"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">category=eq.Legislation</code></td>
                    <td className="py-2">Filter by exact match, greater than, less than</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 bg-white">
        <div className="section-wrapper max-w-4xl text-center">
          <div className="bg-gradient-to-br from-bocra-blue to-[#001A3A] rounded-2xl p-10">
            <Globe size={32} className="text-white/40 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-white mb-2">Ready to Build?</h2>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
              Use BOCRA&#39;s open data to build civic tech, research tools, or data visualisations for Botswana&#39;s telecom sector.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-bocra-blue font-bold rounded-xl hover:bg-gray-100 transition-all">
              Request API Key <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── ENDPOINT CARD ──────────────────────────────────────────────

function EndpointCard({ endpoint }) {
  const [expanded, setExpanded] = useState(false);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tryIt = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const { data, error } = await supabase
        .from(endpoint.table)
        .select(endpoint.query.match(/select=([^&]*)/)?.[1] || '*')
        .limit(5);

      if (error) {
        setResponse({ error: true, body: JSON.stringify({ error: error.message }, null, 2) });
      } else {
        setResponse({ error: false, body: JSON.stringify(data, null, 2) });
      }
    } catch (err) {
      setResponse({ error: true, body: JSON.stringify({ error: 'Request failed' }, null, 2) });
    }
    setLoading(false);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(`${API_BASE}${endpoint.path}?${endpoint.query}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-bocra-off-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="px-2.5 py-1 bg-bocra-green/10 text-bocra-green text-xs font-bold rounded-md font-mono">
          {endpoint.method}
        </span>
        <code className="text-sm font-mono text-bocra-slate/70 flex-1 truncate">{endpoint.path}</code>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${endpoint.color}15`, color: endpoint.color }}>
          {endpoint.category}
        </span>
        <ChevronDown size={16} className={`text-bocra-slate/30 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="pt-4">
            <h3 className="font-bold text-bocra-slate mb-1">{endpoint.title}</h3>
            <p className="text-sm text-bocra-slate/60">{endpoint.description}</p>

            {/* URL */}
            <div className="mt-4 flex items-center gap-2">
              <code className="flex-1 bg-[#0A1628] text-bocra-cyan px-3 py-2 rounded-lg text-xs font-mono overflow-x-auto whitespace-nowrap block">
                {API_BASE}{endpoint.path}?{endpoint.query}
              </code>
              <button
                onClick={copyUrl}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
                aria-label="Copy URL"
              >
                {copied ? <CheckCircle size={14} className="text-bocra-green" /> : <Copy size={14} className="text-bocra-slate/50" />}
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={tryIt}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-bocra-blue text-white text-sm font-semibold rounded-lg hover:bg-bocra-blue-dark transition-all disabled:opacity-50"
              >
                <Play size={14} />
                {loading ? 'Loading\u2026' : 'Try It'}
              </button>
            </div>

            {/* Response */}
            {response && (
              <div className="mt-4">
                <p className="text-xs font-bold text-bocra-slate/40 uppercase tracking-wider mb-2">
                  {response.error ? 'Error Response' : 'Live Response'}
                </p>
                <pre className={`bg-[#0A1628] rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto ${response.error ? 'text-red-400' : 'text-bocra-green/80'}`}>
                  {response.body}
                </pre>
              </div>
            )}

            {/* Sample response (if not tried yet) */}
            {!response && (
              <div className="mt-4">
                <p className="text-xs font-bold text-bocra-slate/40 uppercase tracking-wider mb-2">Sample Response</p>
                <pre className="bg-[#0A1628] rounded-xl p-4 text-xs font-mono text-white/60 overflow-x-auto max-h-48 overflow-y-auto">
                  {endpoint.sampleResponse}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
