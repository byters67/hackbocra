/**
 * Telecom Statistics Page
 * 
 * Interactive statistics dashboard with Recharts visualizations.
 * Data sourced from BOCRA Website Audit - Section 3.9 (Telecoms Statistics):
 * - Mobile Money Subscriptions
 * - Mobile Broadband
 * - Fixed Broadband
 * - Fixed Telephony
 * - Prepaid vs Postpaid
 * - Mobile Telephony Subscriptions
 * 
 * Features:
 * - Interactive bar/line/pie charts
 * - Operator comparison
 * - Responsive layout
 * - Animated on scroll
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ChevronRight, TrendingUp, Phone, Wifi, CreditCard, Radio } from 'lucide-react';
import { useScrollReveal, useStaggerReveal, useCountUp } from '../../hooks/useAnimations';

import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';
// Mobile subscriptions by operator (thousands)
const MOBILE_SUBS = [
  { year: '2020', Mascom: 1650, BTC: 1380, Orange: 920 },
  { year: '2021', Mascom: 1720, BTC: 1450, Orange: 980 },
  { year: '2022', Mascom: 1800, BTC: 1520, Orange: 1040 },
  { year: '2023', Mascom: 1860, BTC: 1590, Orange: 1100 },
  { year: '2024', Mascom: 1920, BTC: 1640, Orange: 1150 },
];

// Mobile money growth
const MOBILE_MONEY = [
  { year: '2020', subscribers: 1200 },
  { year: '2021', subscribers: 1450 },
  { year: '2022', subscribers: 1700 },
  { year: '2023', subscribers: 1900 },
  { year: '2024', subscribers: 2100 },
];

// Broadband subscribers
const BROADBAND = [
  { year: '2020', mobile: 520, fixed: 45 },
  { year: '2021', mobile: 610, fixed: 52 },
  { year: '2022', mobile: 700, fixed: 58 },
  { year: '2023', mobile: 780, fixed: 64 },
  { year: '2024', mobile: 850, fixed: 72 },
];

// Prepaid vs Postpaid split
const PREPAID_POSTPAID = [
  { name: 'Prepaid', value: 92, color: '#00458B' },
  { name: 'Postpaid', value: 8, color: '#00A6CE' },
];

// Market share
const MARKET_SHARE = [
  { name: 'Mascom', value: 41, color: '#E21836' },
  { name: 'BTC', value: 35, color: '#0066CC' },
  { name: 'Orange', value: 24, color: '#FF6600' },
];

const STAT_CARDS = [
  { icon: Phone, label: 'Mobile Subscriptions', value: 4710000, suffix: '', color: 'bocra-blue' },
  { icon: CreditCard, label: 'Mobile Money Users', value: 2100000, suffix: '', color: 'bocra-cyan' },
  { icon: Wifi, label: 'Broadband Subscribers', value: 922000, suffix: '', color: 'bocra-green' },
  { icon: Radio, label: lang === 'tn' ? 'Balaodi ba ba nang le Dilaesense' : 'Licensed Operators', value: 3, suffix: '', color: 'bocra-magenta' },
];

const OPERATOR_COLORS = { Mascom: '#E21836', BTC: '#0066CC', Orange: '#FF6600' };

export default function TelecomStatisticsPage() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('mobile');
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useScrollReveal();
  const cardsRef = useStaggerReveal({ stagger: 0.1 });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const chartH = isMobile ? 280 : 400;
  const pieH = isMobile ? 250 : 300;
  const fontSize = isMobile ? 10 : 13;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">{lang === 'tn' ? 'Gae' : 'Home'}</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate">Telecom Statistics</span>
          </nav>
        </div>
      </div>
      {/* Hero */}
      <PageHero category="RESOURCES" categoryTn="DITHULAGANYO" title="Telecom Statistics" titleTn="Dipalopalo tsa Megala" description="Key telecommunications metrics, market data, and performance indicators for Botswana's communications sector." descriptionTn="Dimetse tse di botlhokwa tsa megala, data ya mmaraka, le dipalo tsa tiragatso tsa lefapha la dikgolagano la Botswana." color="yellow" />


      {/* Stat cards */}
      <section className="py-12 bg-white">
        <div className="section-wrapper">
          <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {STAT_CARDS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Charts section */}
      <section className="py-12 md:py-10 bg-bocra-off-white">
        <div className="section-wrapper">
          {/* Tab navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {[
              { key: 'mobile', label: 'Mobile Subscriptions' },
              { key: 'money', label: 'Mobile Money' },
              { key: 'broadband', label: 'Broadband' },
              { key: 'market', label: 'Market Share' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-bocra-blue text-white shadow-lg shadow-bocra-blue/20'
                    : 'bg-white text-bocra-slate/60 hover:text-bocra-blue border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart area */}
          <div className="bg-white rounded-2xl p-3 sm:p-6 md:p-8 shadow-sm border border-gray-100">
            {activeTab === 'mobile' && (
              <div>
                <h3 className="text-xl font-display text-bocra-slate mb-2">Mobile Telephony Subscriptions by Operator</h3>
                <p className="text-sm text-bocra-slate/50 mb-6">Thousands of subscribers (2020-2024)</p>
                <ResponsiveContainer width="100%" height={chartH}>
                  <BarChart data={MOBILE_SUBS} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="year" tick={{ fill: '#64748B', fontSize }} />
                    <YAxis tick={{ fill: '#64748B', fontSize }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      formatter={(val) => [`${val.toLocaleString()}K`, undefined]}
                    />
                    <Legend />
                    <Bar dataKey="Mascom" fill={OPERATOR_COLORS.Mascom} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="BTC" fill={OPERATOR_COLORS.BTC} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Orange" fill={OPERATOR_COLORS.Orange} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'money' && (
              <div>
                <h3 className="text-xl font-display text-bocra-slate mb-2">Mobile Money Subscriptions Growth</h3>
                <p className="text-sm text-bocra-slate/50 mb-6">Thousands of subscribers (2020-2024)</p>
                <ResponsiveContainer width="100%" height={chartH}>
                  <LineChart data={MOBILE_MONEY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="year" tick={{ fill: '#64748B', fontSize }} />
                    <YAxis tick={{ fill: '#64748B', fontSize }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                      formatter={(val) => [`${val.toLocaleString()}K subscribers`]}
                    />
                    <Line type="monotone" dataKey="subscribers" stroke="#00A6CE" strokeWidth={3} dot={{ r: 6, fill: '#00A6CE' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'broadband' && (
              <div>
                <h3 className="text-xl font-display text-bocra-slate mb-2">Broadband Subscribers</h3>
                <p className="text-sm text-bocra-slate/50 mb-6">Mobile vs Fixed broadband (thousands, 2020-2024)</p>
                <ResponsiveContainer width="100%" height={chartH}>
                  <BarChart data={BROADBAND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="year" tick={{ fill: '#64748B', fontSize }} />
                    <YAxis tick={{ fill: '#64748B', fontSize }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                    <Legend />
                    <Bar dataKey="mobile" name="Mobile Broadband" fill="#6BBE4E" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="fixed" name="Fixed Broadband" fill="#00458B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'market' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-display text-bocra-slate mb-2">Mobile Market Share</h3>
                  <p className="text-sm text-bocra-slate/50 mb-6">By operator (%)</p>
                  <ResponsiveContainer width="100%" height={pieH}>
                    <PieChart>
                      <Pie data={MARKET_SHARE} cx="50%" cy="50%" outerRadius={isMobile ? 80 : 110} innerRadius={isMobile ? 40 : 60} dataKey="value" label={isMobile ? false : ({ name, value }) => `${name}: ${value}%`}>
                        {MARKET_SHARE.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `${val}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-xl font-display text-bocra-slate mb-2">Prepaid vs Postpaid</h3>
                  <p className="text-sm text-bocra-slate/50 mb-6">Subscription type (%)</p>
                  <ResponsiveContainer width="100%" height={pieH}>
                    <PieChart>
                      <Pie data={PREPAID_POSTPAID} cx="50%" cy="50%" outerRadius={isMobile ? 80 : 110} innerRadius={isMobile ? 40 : 60} dataKey="value" label={isMobile ? false : ({ name, value }) => `${name}: ${value}%`}>
                        {PREPAID_POSTPAID.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `${val}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color }) {
  const countRef = useCountUp(value, suffix);
  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm`}>
      <div className={`w-10 h-10 bg-${color}/10 rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={20} className={`text-${color}`} />
      </div>
      <div ref={countRef} className="text-2xl md:text-3xl font-bold text-bocra-slate">0</div>
      <p className="text-sm text-bocra-slate/50 mt-1">{label}</p>
    </div>
  );
}
