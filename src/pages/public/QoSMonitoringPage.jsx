/**
 * QoS Monitoring Dashboard — DQoS BOCRA
 * Original chart-based design with operator logos
 * Data from qos_reports Supabase table
 */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Signal, Phone, Clock, Activity, Zap, Globe,
  AlertTriangle, TrendingUp, TrendingDown, BarChart3, Brain, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PieChart, Pie, Cell
} from 'recharts';
import { useScrollReveal } from '../../hooks/useAnimations';
import { supabase } from '../../lib/supabase';

import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';
const BASE = import.meta.env.BASE_URL;
const OPS = {
  mascom: { name:'Mascom Wireless', short:'Mascom', color:'#E21836', logo:`${BASE}images/operators/mascom.png` },
  btc: { name:'BTC / beMobile', short:'BTC', color:'#2E7D32', logo:`${BASE}images/operators/btc.png` },
  orange: { name:'Orange Botswana', short:'Orange', color:'#FF6600', logo:`${BASE}images/operators/orange.png` },
};
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const REGIONS_LIST = ['National','Gaborone','Francistown','Maun','Kasane','Selebi Phikwe','Palapye','Mahalapye'];
const MARKET = [{name:'Mascom',value:45,color:'#E21836'},{name:'BTC',value:30,color:'#2E7D32'},{name:'Orange',value:25,color:'#FF6600'}];
const KPI_INFO = {
  call_success_rate:{k:'csr',label:'Call Success Rate',unit:'%',icon:Phone,desc:'Percentage of voice calls successfully connected',target:'≥ 95%'},
  dropped_call_rate:{k:'dcr',label:'Dropped Call Rate',unit:'%',icon:AlertTriangle,desc:'Percentage of calls disconnected unexpectedly',target:'≤ 2%'},
  throughput:{k:'tp',label:'LTE Throughput',unit:'Mbps',icon:Zap,desc:'Average 4G download speed',target:'≥ 10 Mbps'},
  uptime:{k:'up',label:'Network Uptime',unit:'%',icon:Activity,desc:'Percentage of time network is operational',target:'≥ 99%'},
  latency:{k:'lat',label:'Latency',unit:'ms',icon:Clock,desc:'Average round-trip delay time',target:'≤ 50ms'},
  sms_delivery:{k:'sms',label:'SMS Delivery',unit:'%',icon:Globe,desc:'Percentage of SMS delivered successfully',target:'≥ 98%'},
};
const KPI_KEYS = Object.keys(KPI_INFO);

export default function QoSMonitoringPage() {
  const { lang } = useLanguage();
  const [op, setOp] = useState('mascom');
  const [kpi, setKpi] = useState('call_success_rate');
  const [tab, setTab] = useState('overview');
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiCache, setAiCache] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const heroRef = useScrollReveal();
  const aiInsights = aiCache[tab] || [];

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('qos_reports').select('*').order('year').order('created_at');
      if (data && data.length > 0) setRawData(data);
      setLoading(false);
    })();
  }, []);

  // Auto-trigger AI analysis when data loads or tab changes
  useEffect(() => {
    if (rawData.length > 0 && !aiCache[tab] && !aiLoading) {
      generateAiInsights(tab);
    }
  }, [rawData, tab]);

  const generateAiInsights = async (targetTab) => {
    if (rawData.length === 0) return;
    const t = targetTab || tab;
    setAiLoading(true);
    try {
      const national = rawData.filter(r => r.region === 'National');
      const summary = Object.keys(OPS).map(o => {
        const rows = national.filter(r => r.operator === o);
        const latest = rows[rows.length - 1];
        const prev = rows[rows.length - 2];
        return latest ? `${OPS[o].name}: CSR ${latest.call_success_rate}%, DCR ${latest.dropped_call_rate}%, Throughput ${latest.throughput} Mbps, Uptime ${latest.uptime}%, Latency ${latest.latency}ms, SMS ${latest.sms_delivery}%${prev ? ` (prev CSR ${prev.call_success_rate}%, TP ${prev.throughput})` : ''}` : '';
      }).filter(Boolean).join('\n');

      const regional = rawData.filter(r => r.region !== 'National');
      const regionSummary = Object.keys(OPS).map(o => {
        const rows = regional.filter(r => r.operator === o);
        return rows.map(r => `${OPS[o].short} in ${r.region}: ${r.throughput} Mbps, CSR ${r.call_success_rate}%, Latency ${r.latency}ms`).join('; ');
      }).filter(Boolean).join('\n');

      const prompts = {
        overview: `Analyse this REAL telecom QoS data. Give exactly 4 bullet points (start each with •). Each bullet: 1-2 sentences max with specific numbers. No intro, no conclusion, just bullets.\n\nOperator KPIs:\n${summary}\n\nTargets: CSR ≥95%, DCR ≤2%, Throughput ≥10Mbps, Uptime ≥99%, Latency ≤50ms, SMS ≥98%\n\nFocus: Overall performance, who meets/misses targets, trends, concerns.`,
        compare: `Analyse this REAL telecom QoS data. Give exactly 4 bullet points (start each with •). Each bullet: 1-2 sentences comparing operators with specific numbers. No intro, no conclusion.\n\nOperator KPIs:\n${summary}\n\nFocus: Rank Mascom vs BTC vs Orange per metric. Who leads? Who lags? Biggest performance gaps between them.`,
        regional: `Analyse this REAL regional telecom data. Give exactly 4 bullet points (start each with •). Each bullet: 1-2 sentences about specific regions with numbers. No intro, no conclusion.\n\nRegional Data:\n${regionSummary}\n\nFocus: Urban vs rural coverage gaps, worst-served regions, which operator has best rural performance, digital divide.`,
      };

      const res = await fetch('https://cyalwtuladeexxfsbrcs.supabase.co/functions/v1/qos-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5YWx3dHVsYWRlZXh4ZnNicmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MjM2NTYsImV4cCI6MjA4OTA5OTY1Nn0.rvH-J2O9sttpRFYLSo28BogTwBhwFD2Ei_QuMbnrHUk',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5YWx3dHVsYWRlZXh4ZnNicmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MjM2NTYsImV4cCI6MjA4OTA5OTY1Nn0.rvH-J2O9sttpRFYLSo28BogTwBhwFD2Ei_QuMbnrHUk',
        },
        body: JSON.stringify({ prompt: prompts[t] || prompts.overview }),
      });

      if (res.ok) {
        const data = await res.json();
        let reply = String(data.insights || data.reply || '');
        reply = reply.replace(/\*\*(.*?)\*\*/g, '$1');
        reply = reply.replace(/#+\s*/g, '');
        const bullets = reply.split('•').map(s => s.trim()).filter(s => s.length > 20);
        setAiCache(prev => ({ ...prev, [t]: bullets.slice(0, 4) }));
      } else {
        setAiCache(prev => ({ ...prev, [t]: ['AI analysis unavailable.'] }));
      }
    } catch (err) {
      console.warn('[BOCRA] AI QoS analysis failed:', err);
      setAiCache(prev => ({ ...prev, [t]: ['AI analysis unavailable.'] }));
    }
    setAiLoading(false);
  };

  const monthlyData = useMemo(() => {
    const result = {};
    Object.keys(OPS).forEach(o => {
      result[o] = MONTHS.map(m => {
        const row = rawData.find(r => r.operator === o && r.month === m && r.region === 'National');
        return row ? { m, csr:+row.call_success_rate, dcr:+row.dropped_call_rate, tp:+row.throughput, up:+row.uptime, lat:+row.latency, sms:+row.sms_delivery } : null;
      }).filter(Boolean);
    });
    return result;
  }, [rawData]);

  const regionalData = useMemo(() => {
    return REGIONS_LIST.filter(r => r !== 'National').map(region => {
      const row = { region };
      Object.keys(OPS).forEach(o => {
        const d = rawData.find(r => r.operator === o && r.region === region);
        row[o] = d ? +d.throughput : 0;
      });
      return row;
    });
  }, [rawData]);

  const data = monthlyData[op] || [];
  const opInfo = OPS[op];
  const latest = data.length > 0 ? data[data.length - 1] : null;
  const kInfo = KPI_INFO[kpi];
  const kShort = kInfo.k;

  const compData = MONTHS.map((m, i) => ({ m, Mascom:monthlyData.mascom?.[i]?.[kShort]||0, BTC:monthlyData.btc?.[i]?.[kShort]||0, Orange:monthlyData.orange?.[i]?.[kShort]||0 })).filter(d => d.Mascom > 0);

  const gaugeVals = useMemo(() => {
    const result = {};
    Object.keys(OPS).forEach(o => { const d = monthlyData[o]; result[o] = d && d.length > 0 ? d[d.length - 1] : null; });
    return result;
  }, [monthlyData]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-[#00A6CE]/20 border-t-[#00A6CE] rounded-full animate-spin"/></div>;

  const noData = data.length === 0;

  return (
    <div className="bg-white">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue transition-colors">Home</Link><ChevronRight size={14}/><span className="text-bocra-slate">QoS Monitoring</span></nav></div></div>

      
      {/* Hero */}
      <PageHero category="SERVICES" categoryTn="DITIRELO" title="Quality of Service Monitoring" titleTn="Tlhokomelo ya Boleng jwa Tirelo" description="Real-time performance data for Botswana's telecommunications operators — call success rates, throughput, latency, and more." descriptionTn="Data ya boleng jwa tirelo ya nako ya jaanong ya balaodi ba megala ba Botswana." color="cyan" />


      {/* Tabs + Operator */}
      <section className="py-4"><div className="section-wrapper flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-2">
          {[['overview','Overview'],['compare','Compare Operators'],['regional','Regional']].map(([k,v])=>(
            <button key={k} onClick={()=>setTab(k)} className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${tab===k?'bg-[#00458B] text-white':'bg-gray-100 text-gray-600'}`}>{v}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {Object.entries(OPS).map(([k,v])=>(
            <button key={k} onClick={()=>setOp(k)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${op===k?'text-white':'bg-white text-gray-600 border-gray-200'}`} style={op===k?{backgroundColor:v.color,borderColor:v.color}:{}}>
              <img src={v.logo} alt={v.short} className="w-5 h-5 rounded object-cover"/>{v.short}
            </button>
          ))}
        </div>
      </div></section>

      {noData ? (
        <section className="py-12"><div className="section-wrapper text-center">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-200"/><p className="text-gray-500 mb-2">No QoS data yet</p><p className="text-sm text-gray-400">Admin staff can submit reports from Admin Portal → QoS Reports</p>
        </div></section>
      ) : (<>
        {tab === 'overview' && (
          <section className="py-4"><div className="section-wrapper">
            {/* AI Insights — compact */}
            <AiInsightBar insights={aiInsights} loading={aiLoading} onRefresh={() => { setAiCache(p => ({...p, [tab]: null})); generateAiInsights(tab); }} />

            {/* Operator summary cards with logos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {Object.entries(OPS).map(([k, v]) => {
                const d = gaugeVals[k];
                if (!d) return null;
                return (
                  <button key={k} onClick={() => setOp(k)} className={`bg-white rounded-xl border-2 p-5 text-left transition-all ${op===k?'shadow-lg':'hover:shadow-md'}`} style={{borderColor: op===k ? v.color : '#e5e7eb'}}>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={v.logo} alt={v.short} className="w-10 h-10 rounded-lg object-cover shadow-sm"/>
                      <div><p className="text-sm font-bold" style={{color:v.color}}>{v.name}</p><p className="text-[10px] text-gray-400">2G/3G/4G LTE</p></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><p className="text-lg font-bold text-bocra-slate">{d.csr}%</p><p className="text-[9px] text-gray-400">Call Success</p></div>
                      <div><p className="text-lg font-bold text-bocra-slate">{d.tp}</p><p className="text-[9px] text-gray-400">Mbps</p></div>
                      <div><p className="text-lg font-bold text-bocra-slate">{d.up}%</p><p className="text-[9px] text-gray-400">Uptime</p></div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* KPI stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {KPI_KEYS.map(k => {
                const info = KPI_INFO[k]; const Icon = info.icon;
                const val = latest?.[info.k]; if (val == null) return null;
                const isGood = k==='dropped_call_rate'?val<=2:k==='latency'?val<=50:val>=95;
                return (
                  <button key={k} onClick={()=>setKpi(k)} className={`bg-white rounded-xl border-2 p-4 text-left transition-all ${kpi===k?'border-current shadow-md':'border-gray-100'}`} style={kpi===k?{borderColor:opInfo.color}:{}}>
                    <Icon size={16} className="text-gray-400 mb-2"/>
                    <p className="text-xl font-bold text-bocra-slate">{val}<span className="text-xs text-gray-400 font-normal ml-0.5">{info.unit}</span></p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{info.label}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block ${isGood?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{isGood?'Pass':'Below Target'}</span>
                  </button>
                );
              })}
            </div>

            {/* Main chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <img src={opInfo.logo} alt={opInfo.short} className="w-6 h-6 rounded object-cover"/>
                <div><h3 className="text-sm font-bold text-bocra-slate">{kInfo.label} — {opInfo.name}</h3><p className="text-xs text-gray-400">{kInfo.desc} · Target: {kInfo.target}</p></div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="m" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip contentStyle={{borderRadius:'8px',fontSize:'12px'}}/>
                  <Line type="monotone" dataKey={kShort} stroke={opInfo.color} strokeWidth={2.5} dot={{r:4,fill:opInfo.color}} activeDot={{r:6}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Market share + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-bocra-slate mb-4">Mobile Market Share</h3>
                <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={MARKET} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">{MARKET.map((m,i)=><Cell key={i} fill={m.color}/>)}</Pie><Tooltip contentStyle={{borderRadius:'8px',fontSize:'12px'}}/></PieChart></ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">{MARKET.map(m=>(<span key={m.name} className="flex items-center gap-1.5 text-[10px] text-gray-500"><img src={OPS[m.name.toLowerCase()]?.logo || OPS.mascom.logo} alt="" className="w-3.5 h-3.5 rounded object-cover"/>{m.name} ({m.value}%)</span>))}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-bocra-slate mb-4">Operator Performance Comparison</h3>
                <ResponsiveContainer width="100%" height={220}><RadarChart data={[
                  {k:'CSR',m:gaugeVals.mascom?.csr||0,b:gaugeVals.btc?.csr||0,o:gaugeVals.orange?.csr||0},
                  {k:'Uptime',m:gaugeVals.mascom?.up||0,b:gaugeVals.btc?.up||0,o:gaugeVals.orange?.up||0},
                  {k:'Speed',m:(gaugeVals.mascom?.tp||0)*4.5,b:(gaugeVals.btc?.tp||0)*4.5,o:(gaugeVals.orange?.tp||0)*4.5},
                  {k:'SMS',m:gaugeVals.mascom?.sms||0,b:gaugeVals.btc?.sms||0,o:gaugeVals.orange?.sms||0},
                  {k:'Latency',m:100-(gaugeVals.mascom?.lat||0),b:100-(gaugeVals.btc?.lat||0),o:100-(gaugeVals.orange?.lat||0)},
                ]}><PolarGrid stroke="#e5e7eb"/><PolarAngleAxis dataKey="k" tick={{fontSize:9}}/>
                  <Radar name="Mascom" dataKey="m" stroke="#E21836" fill="#E21836" fillOpacity={0.12}/>
                  <Radar name="BTC" dataKey="b" stroke="#2E7D32" fill="#2E7D32" fillOpacity={0.12}/>
                  <Radar name="Orange" dataKey="o" stroke="#FF6600" fill="#FF6600" fillOpacity={0.12}/>
                  <Tooltip contentStyle={{borderRadius:'8px',fontSize:'12px'}}/>
                </RadarChart></ResponsiveContainer>
              </div>
            </div>
          </div></section>
        )}

        {tab === 'compare' && (
          <section className="py-4"><div className="section-wrapper">
            <AiInsightBar insights={aiInsights} loading={aiLoading} onRefresh={() => { setAiCache(p => ({...p, [tab]: null})); generateAiInsights(tab); }} />
            <div className="flex flex-wrap gap-2 mb-4">{KPI_KEYS.map(k=>(<button key={k} onClick={()=>setKpi(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${kpi===k?'bg-[#00458B] text-white border-[#00458B]':'bg-white text-gray-600 border-gray-200'}`}>{KPI_INFO[k].label}</button>))}</div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-bocra-slate mb-1">{kInfo.label} — All Operators</h3>
              <p className="text-xs text-gray-400 mb-4">Target: {kInfo.target}</p>
              <ResponsiveContainer width="100%" height={320}><LineChart data={compData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="m" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip contentStyle={{borderRadius:'8px',fontSize:'12px'}}/><Legend wrapperStyle={{fontSize:'11px'}}/>
                <Line type="monotone" dataKey="Mascom" stroke="#E21836" strokeWidth={2} dot={{r:3}}/>
                <Line type="monotone" dataKey="BTC" stroke="#2E7D32" strokeWidth={2} dot={{r:3}}/>
                <Line type="monotone" dataKey="Orange" stroke="#FF6600" strokeWidth={2} dot={{r:3}}/>
              </LineChart></ResponsiveContainer>
            </div>
          </div></section>
        )}

        {tab === 'regional' && (
          <section className="py-4"><div className="section-wrapper">
            <AiInsightBar insights={aiInsights} loading={aiLoading} onRefresh={() => { setAiCache(p => ({...p, [tab]: null})); generateAiInsights(tab); }} />
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <h3 className="text-sm font-bold text-bocra-slate mb-1">LTE Download Throughput by Region</h3>
              <p className="text-xs text-gray-400 mb-4">Average 4G download speeds (Mbps) across Botswana</p>
              <ResponsiveContainer width="100%" height={320}><BarChart data={regionalData} layout="vertical" margin={{left:10}}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis type="number" tick={{fontSize:10}} unit=" Mbps"/><YAxis type="category" dataKey="region" tick={{fontSize:10}} width={90}/><Tooltip contentStyle={{borderRadius:'8px',fontSize:'12px'}}/><Legend wrapperStyle={{fontSize:'11px'}}/>
                <Bar dataKey="mascom" name="Mascom" fill="#E21836" radius={[0,4,4,0]} barSize={8}/>
                <Bar dataKey="btc" name="BTC" fill="#2E7D32" radius={[0,4,4,0]} barSize={8}/>
                <Bar dataKey="orange" name="Orange" fill="#FF6600" radius={[0,4,4,0]} barSize={8}/>
              </BarChart></ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(OPS).map(([k,v])=>{const best=regionalData.reduce((a,b)=>(a[k]||0)>(b[k]||0)?a:b);const worst=regionalData.reduce((a,b)=>(a[k]||99)<(b[k]||99)?a:b);const avg=(regionalData.reduce((a,b)=>a+(b[k]||0),0)/regionalData.length).toFixed(1);return(
                <div key={k} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3"><img src={v.logo} alt={v.short} className="w-6 h-6 rounded object-cover"/><span className="text-sm font-bold" style={{color:v.color}}>{v.short}</span></div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-400">Best</span><span className="text-xs font-medium text-green-600 flex items-center gap-1"><TrendingUp size={10}/>{best.region} ({best[k]} Mbps)</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-400">Weakest</span><span className="text-xs font-medium text-red-600 flex items-center gap-1"><TrendingDown size={10}/>{worst.region} ({worst[k]} Mbps)</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-400">National Avg</span><span className="text-xs font-bold text-bocra-slate">{avg} Mbps</span></div>
                  </div>
                </div>
              );})}
            </div>
          </div></section>
        )}
      </>)}

      <section className="py-6 bg-bocra-off-white mt-4"><div className="section-wrapper max-w-3xl mx-auto text-center">
        <p className="text-xs text-bocra-slate/30">Data from operator monthly reports · Based on BOCRA QoS & QoE Guidelines 2019</p>
      </div></section>
      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]"/><div className="flex-1 bg-[#C8237B]"/><div className="flex-1 bg-[#F7B731]"/><div className="flex-1 bg-[#6BBE4E]"/></div>
    </div>
  );
}

function AiInsightBar({ insights, loading, onRefresh }) {
  return (
    <div className="bg-gradient-to-r from-[#001A3A] to-[#00458B] rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5"><Brain size={14} className="text-[#00A6CE]"/> AI Analysis</h3>
        <button onClick={onRefresh} disabled={loading} className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-lg text-[9px] text-white/60 hover:bg-white/20 disabled:opacity-50 transition-all">
          <RefreshCw size={9} className={loading ? 'animate-spin' : ''}/> {loading ? 'Analysing...' : 'Refresh'}
        </button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-3"><div className="w-4 h-4 border-2 border-[#00A6CE]/30 border-t-[#00A6CE] rounded-full animate-spin"/><p className="text-[10px] text-white/40">Analysing performance data...</p></div>
      ) : Array.isArray(insights) && insights.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {insights.map((item, i) => (
            <div key={i} className="flex gap-2 p-2 rounded-lg bg-white/5">
              <div className="w-1 h-1 rounded-full bg-[#00A6CE] mt-1.5 flex-shrink-0"/>
              <p className="text-[10px] text-white/65 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-white/25 py-1">AI insights will appear automatically...</p>
      )}
    </div>
  );
}
