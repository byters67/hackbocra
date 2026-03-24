/**
 * ComplaintOutcomesPage — Public complaint outcomes transparency dashboard
 *
 * Phase 3 of the BOCRA Implementation Roadmap.
 * Shows aggregate complaint data so citizens can see accountability in action.
 *
 * Charts (Recharts):
 *   - Total complaints: all time / this year / this quarter (stat cards)
 *   - By provider: horizontal bar chart (complaints + resolution rate)
 *   - By category: donut chart (top categories)
 *   - Monthly trend: area chart (last 12 months)
 *   - Remedies offered: horizontal bar
 *
 * PII guardrails enforced server-side (groups < 5 suppressed).
 * Bilingual: English + Setswana.
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import {
  TrendingUp, Shield, CheckCircle, Clock, AlertCircle, RefreshCw,
  ArrowRight, BarChart3, PieChart as PieIcon, Activity, Award,
  Info, FileText,
} from 'lucide-react';
import { supabaseUrl_, supabaseAnonKey_ } from '../../lib/supabase';
import { useLanguage } from '../../lib/language';
import PageHero from '../../components/ui/PageHero';
import Breadcrumb from '../../components/ui/Breadcrumb';

// ─── COLOURS ──────────────────────────────────────────────────────────────────
const BOCRA_BLUE    = '#00458B';
const BOCRA_CYAN    = '#00A6CE';
const BOCRA_GREEN   = '#6BBE4E';
const BOCRA_MAGENTA = '#C8237B';
const BOCRA_YELLOW  = '#F7B731';
const CHART_COLORS  = [BOCRA_BLUE, BOCRA_CYAN, BOCRA_GREEN, BOCRA_YELLOW, '#EA580C', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#64748B'];

const REMEDY_LABELS = {
  en: { refund: 'Refund', service_restored: 'Service Restored', apology: 'Apology', compensation: 'Compensation', other: 'Other' },
  tn: { refund: 'Khutsiso ya Madi', service_restored: 'Tirelo e Buyisitswe', apology: 'Kopo ya Tshwarelo', compensation: 'Tefo ya Tshenyego', other: 'Tse Dingwe' },
};

const SHORT_NAMES = {
  'Botswana Telecommunications Corporation (BTC)': 'BTC',
  'Botswana Fibre Networks (BoFiNet)': 'BoFiNet',
  'Mascom Wireless': 'Mascom',
  'Orange Botswana': 'Orange',
  'Botswana Post': 'BW Post',
  'beMobile': 'beMobile',
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accentColor }) {
  return (
    <div className="group relative bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: accentColor }} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-bocra-slate/40 uppercase tracking-wider">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
          style={{ background: `${accentColor}12` }}>
          {Icon && <Icon size={18} style={{ color: accentColor }} />}
        </div>
      </div>
      <p className="text-3xl sm:text-4xl font-extrabold" style={{ color: accentColor }}>{value}</p>
      {sub && <p className="text-xs text-bocra-slate/40 mt-1">{sub}</p>}
    </div>
  );
}

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
function ChartSection({ title, subtitle, icon: Icon, children, colSpan = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden ${colSpan}`}>
      <div className="p-5 sm:p-6 pb-0">
        <div className="flex items-start gap-3 mb-5">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-bocra-blue/5 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-bocra-blue" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-bocra-slate">{title}</h2>
            {subtitle && <p className="text-sm text-bocra-slate/40 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
        {children}
      </div>
    </div>
  );
}

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      {label && <p className="font-semibold text-bocra-slate mb-1.5">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-bocra-slate/60">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>
            {p.value}{p.name?.toLowerCase().includes('rate') || p.name?.toLowerCase().includes('%') ? '%' : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── PROVIDER BAR CHART ───────────────────────────────────────────────────────
function ProviderChart({ data, lang }) {
  const chartData = data.map(d => ({
    provider: SHORT_NAMES[d.provider] || d.provider,
    [lang === 'tn' ? 'Dingongorego' : 'Complaints']: d.total,
    [lang === 'tn' ? 'Rarabololwe (%)' : 'Resolved (%)']: d.resolution_rate,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 56)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
        <YAxis type="category" dataKey="provider" width={72} tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey={lang === 'tn' ? 'Dingongorego' : 'Complaints'} fill={BOCRA_BLUE} radius={[0, 6, 6, 0]} barSize={20} />
        <Bar dataKey={lang === 'tn' ? 'Rarabololwe (%)' : 'Resolved (%)'} fill={BOCRA_GREEN} radius={[0, 6, 6, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── CATEGORY DONUT ───────────────────────────────────────────────────────────
function CategoryDonut({ data, lang }) {
  const [active, setActive] = useState(null);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={3}
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(null)}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  opacity={active === null || active === i ? 1 : 0.4}
                />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`${v} (${Math.round(v / total * 100)}%)`, '']} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-bocra-slate">{total}</span>
          <span className="text-[10px] text-bocra-slate/40 uppercase tracking-wider">
            {lang === 'tn' ? 'Tsotlhe' : 'Total'}
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-2.5 min-w-0">
        {data.slice(0, 8).map((d, i) => {
          const pct = Math.round((d.count / total) * 100);
          return (
            <div key={d.category}>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <p className="text-xs text-bocra-slate/70 truncate flex-1">{d.category}</p>
                <p className="text-xs font-bold text-bocra-slate shrink-0">{d.count}</p>
              </div>
              {/* Mini progress bar */}
              <div className="ml-[22px] h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    opacity: 0.6,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MONTHLY TREND (AREA CHART) ──────────────────────────────────────────────
function TrendChart({ data, lang }) {
  const formatted = data.map(d => ({
    ...d,
    month: new Date(d.month + '-01').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={formatted} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BOCRA_BLUE} stopOpacity={0.2} />
            <stop offset="95%" stopColor={BOCRA_BLUE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          name={lang === 'tn' ? 'Dingongorego' : 'Complaints'}
          stroke={BOCRA_BLUE}
          strokeWidth={2.5}
          fill="url(#gradBlue)"
          dot={{ fill: BOCRA_BLUE, r: 3, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: BOCRA_BLUE, stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── REMEDY BAR ───────────────────────────────────────────────────────────────
function RemedyBar({ data, lang }) {
  const labels = REMEDY_LABELS[lang] || REMEDY_LABELS.en;
  const chartData = data.map(d => ({
    remedy: labels[d.remedy] || d.remedy,
    count:  d.count,
  }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 48)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
        <YAxis type="category" dataKey="remedy" width={120} tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="count" name={lang === 'tn' ? 'Palo' : 'Count'} fill={BOCRA_CYAN} radius={[0, 6, 6, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
function Skeleton({ h = 'h-52' }) {
  return (
    <div className={`${h} bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-2xl animate-pulse`} />
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ lang }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-bocra-blue/5 flex items-center justify-center mb-3">
        <BarChart3 size={24} className="text-bocra-blue/30" />
      </div>
      <p className="text-sm font-medium text-bocra-slate/40">
        {lang === 'tn' ? 'Ga go na data e lekaneng' : 'Not enough data yet'}
      </p>
      <p className="text-xs text-bocra-slate/25 mt-1 max-w-xs">
        {lang === 'tn'
          ? 'Data e tla bontswa fa go na le dingongorego di le 5 kgotsa go feta ka sehlopha'
          : 'Data will appear once there are 5 or more complaints in a group'}
      </p>
    </div>
  );
}


// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ComplaintOutcomesPage() {
  const { lang }                      = useLanguage();
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${supabaseUrl_}/functions/v1/complaint-stats`,
        {
          headers: {
            Authorization: `Bearer ${supabaseAnonKey_}`,
            apikey: supabaseAnonKey_,
          },
        },
      );
      if (!res.ok) {
        const body = await res.text();
        console.error('[ComplaintOutcomes] Fetch failed:', res.status, body);
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      console.log('[ComplaintOutcomes] Stats received:', {
        totals: data.totals,
        providers: data.by_provider?.length,
        categories: data.by_category?.length,
        months: data.monthly_trend?.length,
      });
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[ComplaintOutcomes] Error:', err);
      setError(
        lang === 'tn'
          ? 'Go paletse go nna le tshedimosetso. Leka gape.'
          : 'Failed to load statistics. Please try again.'
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <>
      <Helmet>
        <title>{lang === 'tn' ? 'Dipoelo tsa Dingongorego' : 'Complaint Outcomes'} | BOCRA</title>
        <meta name="description" content="See how BOCRA resolves complaints against telecommunications, broadcasting, and postal service providers in Botswana." />
      </Helmet>

      <PageHero
        title={lang === 'tn' ? 'Dipoelo tsa Dingongorego' : 'Complaint Outcomes'}
        subtitle={lang === 'tn'
          ? 'Bona gore BOCRA e rarabolola dingongorego jang mme e tshwara baabanki ba ba tlolang melao'
          : 'See how BOCRA resolves complaints and holds service providers accountable'}
        icon={TrendingUp}
      />

      <div className="section-wrapper py-8 sm:py-12">
        {/* ── Breadcrumb + Refresh ── */}
        <div className="flex items-center justify-between mb-3">
          <Breadcrumb items={[
            { label: lang === 'tn' ? 'Ditirelo' : 'Services', href: '/services/file-complaint' },
            { label: lang === 'tn' ? 'Dipoelo tsa Dingongorego' : 'Complaint Outcomes' },
          ]} />
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-bocra-slate/40 hover:text-bocra-blue transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {lastUpdated
              ? (lang === 'tn' ? 'Mpshafatsa' : 'Refresh')
              : (lang === 'tn' ? 'Laola' : 'Load')}
          </button>
        </div>

        {lastUpdated && (
          <p className="text-[10px] text-bocra-slate/25 mb-6">
            {lang === 'tn' ? 'Go mpshafaditswe: ' : 'Last updated: '}
            {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 mb-8">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700">{error}</p>
              <button onClick={fetchStats} className="text-xs text-red-500 hover:text-red-700 underline mt-1">
                {lang === 'tn' ? 'Leka gape' : 'Try again'}
              </button>
            </div>
          </div>
        )}

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {loading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} h="h-32" />)
          ) : stats ? (
            <>
              <StatCard
                label={lang === 'tn' ? 'Dingongorego Tsotlhe' : 'All Time'}
                value={stats.totals.all_time.toLocaleString()}
                icon={Shield}
                accentColor={BOCRA_BLUE}
              />
              <StatCard
                label={lang === 'tn' ? 'Ngogola Eno' : 'This Year'}
                value={stats.totals.this_year.toLocaleString()}
                icon={TrendingUp}
                accentColor={BOCRA_CYAN}
              />
              <StatCard
                label={lang === 'tn' ? 'Kgwedi Tse 3 Tse' : 'This Quarter'}
                value={stats.totals.this_quarter.toLocaleString()}
                icon={Clock}
                accentColor={BOCRA_YELLOW}
              />
              <StatCard
                label={lang === 'tn' ? 'Rarabololwe' : 'Resolution Rate'}
                value={`${stats.overall_resolution_rate}%`}
                icon={CheckCircle}
                accentColor={BOCRA_GREEN}
              />
            </>
          ) : null}
        </div>

        {/* ── CHARTS GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

          {/* Provider Breakdown — full width */}
          <ChartSection
            title={lang === 'tn' ? 'Dingongorego ka Motlamedi' : 'Complaints by Provider'}
            subtitle={lang === 'tn'
              ? 'Baabanki ba ba nang le dingongorego di le 5 kgotsa go feta fela ba bontswa'
              : 'Only providers with 5+ complaints shown'}
            icon={BarChart3}
            colSpan="lg:col-span-2"
          >
            {loading ? <Skeleton />
              : stats?.by_provider?.length > 0
                ? <ProviderChart data={stats.by_provider} lang={lang} />
                : <EmptyState lang={lang} />
            }
          </ChartSection>

          {/* Category Donut */}
          <ChartSection
            title={lang === 'tn' ? 'Mefuta ya Dingongorego' : 'Complaint Categories'}
            subtitle={lang === 'tn' ? 'Diteng tse di tlwaelegileng' : 'Most common complaint types'}
            icon={PieIcon}
          >
            {loading ? <Skeleton />
              : stats?.by_category?.length > 0
                ? <CategoryDonut data={stats.by_category} lang={lang} />
                : <EmptyState lang={lang} />
            }
          </ChartSection>

          {/* Monthly Trend */}
          <ChartSection
            title={lang === 'tn' ? 'Mokgwa wa Kgwedi le Kgwedi' : 'Monthly Trend'}
            subtitle={lang === 'tn' ? 'Dingongorego mo dikgweding tse 12 tse di fetileng' : 'Complaints over the last 12 months'}
            icon={Activity}
          >
            {loading ? <Skeleton h="h-60" />
              : stats?.monthly_trend?.length > 0
                ? <TrendChart data={stats.monthly_trend} lang={lang} />
                : <EmptyState lang={lang} />
            }
          </ChartSection>

          {/* Remedies */}
          {(!loading && stats?.by_remedy?.length > 0) && (
            <ChartSection
              title={lang === 'tn' ? 'Dituelo tse di Neelwang' : 'Remedies Offered'}
              subtitle={lang === 'tn'
                ? 'Dituelo tseo BOCRA e di tlhotlhometseng go rarabolola dingongorego'
                : 'Outcomes BOCRA has secured for complainants'}
              icon={Award}
              colSpan="lg:col-span-2"
            >
              <RemedyBar data={stats.by_remedy} lang={lang} />
            </ChartSection>
          )}

          {/* Provider Resolution Table */}
          {(!loading && stats?.by_provider?.length > 0) && (
            <ChartSection
              title={lang === 'tn' ? 'Thulaganyo ya Motlamedi' : 'Provider Resolution Table'}
              subtitle={lang === 'tn' ? 'Matlhomeso a a tshwailweng fela' : 'Detailed provider performance breakdown'}
              icon={FileText}
              colSpan="lg:col-span-2"
            >
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                <table className="w-full text-sm min-w-[580px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-3 text-[10px] font-semibold text-bocra-slate/30 uppercase tracking-wider">
                        {lang === 'tn' ? 'Motlamedi' : 'Provider'}
                      </th>
                      <th className="text-right pb-3 text-[10px] font-semibold text-bocra-slate/30 uppercase tracking-wider">
                        {lang === 'tn' ? 'Tsotlhe' : 'Total'}
                      </th>
                      <th className="text-right pb-3 text-[10px] font-semibold text-bocra-slate/30 uppercase tracking-wider">
                        {lang === 'tn' ? 'Rarabololwe' : 'Resolved'}
                      </th>
                      <th className="text-right pb-3 text-[10px] font-semibold text-bocra-slate/30 uppercase tracking-wider">
                        {lang === 'tn' ? 'Kelo' : 'Rate'}
                      </th>
                      <th className="text-right pb-3 text-[10px] font-semibold text-bocra-slate/30 uppercase tracking-wider">
                        {lang === 'tn' ? 'Malatsi' : 'Avg Days'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.by_provider.map(p => (
                      <tr key={p.provider} className="hover:bg-bocra-blue/[0.02] transition-colors">
                        <td className="py-3.5 font-semibold text-bocra-slate">
                          {SHORT_NAMES[p.provider] || p.provider}
                        </td>
                        <td className="py-3.5 text-right text-bocra-slate/60 font-medium">{p.total}</td>
                        <td className="py-3.5 text-right text-bocra-slate/60 font-medium">{p.resolved}</td>
                        <td className="py-3.5 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            p.resolution_rate >= 70
                              ? 'bg-green-50 text-green-600'
                              : p.resolution_rate >= 40
                                ? 'bg-yellow-50 text-yellow-600'
                                : 'bg-red-50 text-red-500'
                          }`}>
                            {p.resolution_rate}%
                          </span>
                        </td>
                        <td className="py-3.5 text-right text-bocra-slate/60 font-medium">
                          {p.avg_resolution_days != null ? `${p.avg_resolution_days}d` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartSection>
          )}
        </div>

        {/* ── CTA + Disclaimer ── */}
        <div className="mt-8 sm:mt-10 grid sm:grid-cols-2 gap-4">
          <Link
            to="/services/file-complaint"
            className="group relative rounded-2xl p-8 text-white overflow-hidden bg-bocra-magenta hover:shadow-2xl hover:shadow-bocra-magenta/20 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3 group-hover:scale-150 transition-transform duration-500" />
            <AlertCircle size={28} className="mb-3 opacity-80 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl sm:text-2xl font-extrabold">
              {lang === 'tn' ? 'A o na le Ngongorego?' : 'Have a Complaint?'}
            </h3>
            <p className="text-white/60 mt-2 mb-4 text-sm max-w-sm">
              {lang === 'tn'
                ? 'Bega mathata a motlamedi wa gago wa tirelo mo foromong ya rona.'
                : 'Report issues with your telecom, broadcasting, or postal provider.'}
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all">
              {lang === 'tn' ? 'Tlhagisa Jaanong' : 'File Now'} <ArrowRight size={16} />
            </span>
          </Link>

          <div className="relative rounded-2xl p-8 overflow-hidden bg-bocra-off-white border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-bocra-blue/5 flex items-center justify-center shrink-0 mt-0.5">
                <Info size={20} className="text-bocra-blue/40" />
              </div>
              <div>
                <h3 className="text-base font-bold text-bocra-slate mb-2">
                  {lang === 'tn' ? 'Ka ga Data Eno' : 'About This Data'}
                </h3>
                <p className="text-xs text-bocra-slate/50 leading-relaxed">
                  {lang === 'tn'
                    ? 'Tshedimosetso eno e bontsha dingongorego fela tse di nang le palo e lekaneng (bonnye di le 5 ka sehlopha). Ga go na dintlha tsa motho ka esi tse di phasaladiwang. Data e mpshafaditswe letsatsi le letsatsi.'
                    : 'Statistics shown only for groups with 5 or more complaints to protect individual privacy. No individual complaint details are ever published. Data refreshes daily.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
