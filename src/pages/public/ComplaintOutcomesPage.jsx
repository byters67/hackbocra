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
 *   - Monthly trend: line chart (last 12 months)
 *   - Remedies offered: horizontal bar
 *
 * PII guardrails enforced server-side (groups < 5 suppressed).
 * Bilingual: English + Setswana.
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { TrendingUp, Shield, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { supabaseUrl_, supabaseAnonKey_ } from '../../lib/supabase';
import { useLanguage } from '../../lib/language';
import PageHero from '../../components/ui/PageHero';
import Breadcrumb from '../../components/ui/Breadcrumb';

// ─── COLOURS ──────────────────────────────────────────────────────────────────
const BOCRA_BLUE  = '#00458B';
const BOCRA_CYAN  = '#00A6CE';
const BOCRA_GREEN = '#6BBE4E';
const CHART_COLORS = [BOCRA_BLUE, BOCRA_CYAN, BOCRA_GREEN, '#F7B731', '#EA580C', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#64748B'];

const REMEDY_LABELS = {
  en: { refund: 'Refund', service_restored: 'Service Restored', apology: 'Apology', compensation: 'Compensation', other: 'Other' },
  tn: { refund: 'Khutsiso ya Madi', service_restored: 'Tirelo e Buyisitswe', apology: 'Kopo ya Tshwarelo', compensation: 'Tefo ya Tshenyego', other: 'Tse Dingwe' },
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color = 'text-bocra-blue', bg = 'bg-bocra-blue/5' }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-gray-100`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-[10px] font-semibold text-bocra-slate/50 uppercase tracking-wider">{label}</p>
        {Icon && <Icon size={15} className={color} />}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-bocra-slate/50 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-bold text-bocra-slate">{title}</h2>
      {subtitle && <p className="text-sm text-bocra-slate/50 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      {label && <p className="font-semibold text-bocra-slate mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}{p.name?.includes('Rate') || p.name?.includes('rate') ? '%' : ''}
        </p>
      ))}
    </div>
  );
}

// ─── PROVIDER BAR CHART ───────────────────────────────────────────────────────
function ProviderChart({ data, lang }) {
  const SHORT = {
    'Botswana Telecommunications Corporation (BTC)': 'BTC',
    'Botswana Fibre Networks (BoFiNet)': 'BoFiNet',
    'Mascom Wireless': 'Mascom',
    'Orange Botswana': 'Orange',
    'Botswana Post': 'BW Post',
  };
  const chartData = data.map(d => ({
    provider: SHORT[d.provider] || d.provider,
    [lang === 'tn' ? 'Dingongorego' : 'Complaints']: d.total,
    [lang === 'tn' ? 'Rarabololwe (%)' : 'Resolved (%)']: d.resolution_rate,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
        <YAxis type="category" dataKey="provider" width={68} tick={{ fontSize: 11, fill: '#475569' }} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey={lang === 'tn' ? 'Dingongorego' : 'Complaints'} fill={BOCRA_BLUE} radius={[0, 4, 4, 0]} />
        <Bar dataKey={lang === 'tn' ? 'Rarabololwe (%)' : 'Resolved (%)'} fill={BOCRA_GREEN} radius={[0, 4, 4, 0]} />
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
      <ResponsiveContainer width={200} height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            onMouseEnter={(_, i) => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                opacity={active === null || active === i ? 1 : 0.5}
              />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [`${v} (${Math.round(v / total * 100)}%)`, '']} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2 min-w-0">
        {data.slice(0, 8).map((d, i) => (
          <div key={d.category} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <p className="text-xs text-bocra-slate/70 truncate flex-1">{d.category}</p>
            <p className="text-xs font-semibold text-bocra-slate shrink-0">{d.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MONTHLY TREND LINE ───────────────────────────────────────────────────────
function TrendLine({ data, lang }) {
  const formatted = data.map(d => ({
    ...d,
    month: new Date(d.month + '-01').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          name={lang === 'tn' ? 'Dingongorego' : 'Complaints'}
          stroke={BOCRA_BLUE}
          strokeWidth={2.5}
          dot={{ fill: BOCRA_BLUE, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── REMEDY BAR ───────────────────────────────────────────────────────────────
function RemedyBar({ data, lang }) {
  const labels = REMEDY_LABELS[lang] || REMEDY_LABELS.en;
  const chartData = data.map(d => ({
    remedy: labels[d.remedy] || d.remedy,
    count: d.count,
  }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 44)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
        <YAxis type="category" dataKey="remedy" width={110} tick={{ fontSize: 11, fill: '#475569' }} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="count" name={lang === 'tn' ? 'Palo' : 'Count'} fill={BOCRA_CYAN} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── LOADING SKELETON ──────────────────────────────────────────────────────────
function Skeleton({ h = 'h-48' }) {
  return <div className={`${h} bg-gray-100 rounded-2xl animate-pulse`} />;
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ComplaintOutcomesPage() {
  const { lang } = useLanguage();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(lang === 'tn' ? 'Go paletse go nna le tshedimosetso. Leka gape.' : 'Failed to load statistics. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <>
      <Helmet>
        <title>Complaint Outcomes | BOCRA</title>
        <meta name="description" content="See how BOCRA resolves complaints against telecommunications, broadcasting, and postal service providers in Botswana." />
      </Helmet>

      <PageHero
        title={lang === 'tn' ? 'Dipoelo tsa Dingongorego' : 'Complaint Outcomes'}
        subtitle={lang === 'tn'
          ? 'Bona gore BOCRA e rarabolola dingongorego jang mme e tshwara baabanki ba ba tlolang melao'
          : 'See how BOCRA resolves complaints and holds service providers accountable'}
        icon={TrendingUp}
      />

      <div className="container-bocra py-8">
        <div className="flex items-center justify-between mb-2">
          <Breadcrumb items={[
            { label: lang === 'tn' ? 'Ditirelo' : 'Services', href: '/services/file-complaint' },
            { label: lang === 'tn' ? 'Dipoelo tsa Dingongorego' : 'Complaint Outcomes' },
          ]} />
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-bocra-slate/50 hover:text-bocra-blue transition-colors disabled:opacity-40"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {lastUpdated
              ? (lang === 'tn' ? 'Mpshafatsa' : 'Refresh')
              : (lang === 'tn' ? 'Laola' : 'Load')}
          </button>
        </div>

        {lastUpdated && (
          <p className="text-[10px] text-bocra-slate/30 mb-8">
            {lang === 'tn' ? 'Go mpshafaditswe: ' : 'Last updated: '}
            {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-3 mb-8">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} h="h-28" />)
          ) : stats ? (
            <>
              <StatCard
                label={lang === 'tn' ? 'Dingongorego Tsotlhe' : 'All Time'}
                value={stats.totals.all_time.toLocaleString()}
                icon={Shield}
                color="text-bocra-blue"
                bg="bg-bocra-blue/5"
              />
              <StatCard
                label={lang === 'tn' ? 'Ngogola Eno' : 'This Year'}
                value={stats.totals.this_year.toLocaleString()}
                icon={TrendingUp}
                color="text-bocra-cyan"
                bg="bg-bocra-cyan/5"
              />
              <StatCard
                label={lang === 'tn' ? 'Kgwedi Tse 3 Tse' : 'This Quarter'}
                value={stats.totals.this_quarter.toLocaleString()}
                icon={Clock}
                color="text-orange-500"
                bg="bg-orange-50"
              />
              <StatCard
                label={lang === 'tn' ? 'Rarabololwe' : 'Resolution Rate'}
                value={`${stats.overall_resolution_rate}%`}
                icon={CheckCircle}
                color="text-bocra-green"
                bg="bg-bocra-green/5"
              />
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ── PROVIDER BREAKDOWN ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:col-span-2">
            <SectionHeader
              title={lang === 'tn' ? 'Dingongorego ka Motlamedi' : 'Complaints by Provider'}
              subtitle={lang === 'tn'
                ? 'Baabanki ba ba nang le dingongorego di le 5 ke go feta fela ba bontswa'
                : `Only providers with ${5}+ complaints shown`}
            />
            {loading ? <Skeleton /> : stats?.by_provider?.length > 0
              ? <ProviderChart data={stats.by_provider} lang={lang} />
              : <p className="text-sm text-bocra-slate/40 text-center py-12">{lang === 'tn' ? 'Ga go na data e lekaneng' : 'Not enough data yet'}</p>
            }
          </div>

          {/* ── CATEGORY DONUT ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <SectionHeader
              title={lang === 'tn' ? 'Mefuta ya Dingongorego' : 'Complaint Categories'}
              subtitle={lang === 'tn' ? 'Diteng tse di tlwaelegileng' : 'Most common complaint types'}
            />
            {loading ? <Skeleton /> : stats?.by_category?.length > 0
              ? <CategoryDonut data={stats.by_category} lang={lang} />
              : <p className="text-sm text-bocra-slate/40 text-center py-12">{lang === 'tn' ? 'Ga go na data e lekaneng' : 'Not enough data yet'}</p>
            }
          </div>

          {/* ── MONTHLY TREND ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <SectionHeader
              title={lang === 'tn' ? 'Mokgwa wa Kgwedi le Kgwedi' : 'Monthly Trend'}
              subtitle={lang === 'tn' ? 'Dingongorego mo dikgweding tse 12 tse di fetileng' : 'Complaints filed over the last 12 months'}
            />
            {loading ? <Skeleton h="h-56" /> : stats?.monthly_trend?.length > 0
              ? <TrendLine data={stats.monthly_trend} lang={lang} />
              : <p className="text-sm text-bocra-slate/40 text-center py-12">{lang === 'tn' ? 'Ga go na data e lekaneng' : 'Not enough data yet'}</p>
            }
          </div>

          {/* ── REMEDIES ── */}
          {(!loading && stats?.by_remedy?.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:col-span-2">
              <SectionHeader
                title={lang === 'tn' ? 'Dituelo tse di Neelwang' : 'Remedies Offered'}
                subtitle={lang === 'tn'
                  ? 'Dituelo tseo BOCRA e di tlhotlhometseng go rarabolola dingongorego'
                  : 'Outcomes BOCRA has secured for complainants'}
              />
              <RemedyBar data={stats.by_remedy} lang={lang} />
            </div>
          )}

          {/* ── PROVIDER RESOLUTION TABLE ── */}
          {(!loading && stats?.by_provider?.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:col-span-2 overflow-x-auto">
              <SectionHeader
                title={lang === 'tn' ? 'Thulaganyo ya Motlamedi' : 'Provider Resolution Table'}
                subtitle={lang === 'tn' ? 'Matlhomeso a a tshwailweng fela' : 'Resolved complaints only'}
              />
              <table className="w-full text-sm min-w-[540px]">
                <thead>
                  <tr className="text-[10px] text-bocra-slate/40 uppercase tracking-wider border-b border-gray-100">
                    <th className="text-left pb-3 font-semibold">{lang === 'tn' ? 'Motlamedi' : 'Provider'}</th>
                    <th className="text-right pb-3 font-semibold">{lang === 'tn' ? 'Tsotlhe' : 'Total'}</th>
                    <th className="text-right pb-3 font-semibold">{lang === 'tn' ? 'Rarabololwe' : 'Resolved'}</th>
                    <th className="text-right pb-3 font-semibold">{lang === 'tn' ? 'Kelo (%)' : 'Rate'}</th>
                    <th className="text-right pb-3 font-semibold">{lang === 'tn' ? 'Malatsi (avg)' : 'Avg Days'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.by_provider.map(p => (
                    <tr key={p.provider} className="hover:bg-bocra-off-white transition-colors">
                      <td className="py-3 font-medium text-bocra-slate">
                        {p.provider.replace('Botswana Telecommunications Corporation (BTC)', 'BTC').replace('Botswana Fibre Networks (BoFiNet)', 'BoFiNet')}
                      </td>
                      <td className="py-3 text-right text-bocra-slate/70">{p.total}</td>
                      <td className="py-3 text-right text-bocra-slate/70">{p.resolved}</td>
                      <td className="py-3 text-right">
                        <span className={`font-semibold ${p.resolution_rate >= 70 ? 'text-bocra-green' : p.resolution_rate >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {p.resolution_rate}%
                        </span>
                      </td>
                      <td className="py-3 text-right text-bocra-slate/70">
                        {p.avg_resolution_days != null ? `${p.avg_resolution_days}d` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── DISCLAIMER ── */}
        <div className="mt-10 bg-bocra-off-white rounded-xl p-5 text-center">
          <p className="text-xs text-bocra-slate/50 max-w-2xl mx-auto">
            {lang === 'tn'
              ? 'Tshedimosetso eno e bontsha dingongorego fela tse di nang le palo e lekaneng (bonnye di le 5 ka sehlopha). Ga go na dintlha tsa motho ka esi. Data e mpshafaditswe letsatsi le letsatsi.'
              : 'Statistics shown only for groups with 5 or more complaints. No individual complaint details are ever published. Data refreshes daily.'}
          </p>
        </div>
      </div>
    </>
  );
}
