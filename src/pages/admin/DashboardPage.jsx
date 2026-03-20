/**
 * DashboardPage — BOCRA Admin Portal Smart Insights
 * 
 * Not just numbers — actionable insights powered by AI classification.
 * Shows trends, provider comparisons, department workloads, urgency distribution.
 * Realtime updates when new submissions arrive.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  AlertCircle, FileCheck, Shield, Clock, Mail, ArrowRight, Bell,
  Activity, RefreshCw, CheckCircle, TrendingUp, TrendingDown,
  BarChart3, Zap, Users, Building, AlertTriangle, Brain, Play
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { calculateSLA } from '../../lib/sla';
import { getWorkflowLogs, runEscalationCheck } from '../../lib/workflow';

const BOCRA = { blue: '#00458B', cyan: '#00A6CE', magenta: '#C8237B', yellow: '#F7B731', green: '#6BBE4E', dark: '#001A3A' };
const PIE_COLORS = [BOCRA.magenta, BOCRA.cyan, BOCRA.yellow, BOCRA.green, '#94A3B8', '#7C3AED', '#EA580C'];
const URGENCY_COLORS = { critical: '#DC2626', high: '#EA580C', medium: '#F7B731', low: '#6BBE4E' };

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useOutletContext();
  const [stats, setStats] = useState({ complaints: 0, applications: 0, incidents: 0, contacts: 0, totalComplaints: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [providerBreakdown, setProviderBreakdown] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [urgencyBreakdown, setUrgencyBreakdown] = useState([]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState([]);
  const [triageStats, setTriageStats] = useState({ avgConfidence: 0, needsReview: 0, classified: 0, total: 0 });
  const [insights, setInsights] = useState([]);
  const [realtimeEvents, setRealtimeEvents] = useState([]);
  const [slaBreakdown, setSlaBreakdown] = useState([]);
  const [slaCompliance, setSlaCompliance] = useState(100);
  const [recentAutomations, setRecentAutomations] = useState([]);
  const [escalationRunning, setEscalationRunning] = useState(false);
  const [escalationResult, setEscalationResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [cRes, aRes, iRes, ctRes, recentC] = await Promise.all([
        supabase.from('complaints').select('*'),
        supabase.from('licence_applications').select('id, status, licence_type, created_at'),
        supabase.from('cyber_incidents').select('id, status, urgency, created_at'),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('complaints').select('*').order('created_at', { ascending: false }).limit(8),
      ]);

      const complaints = cRes.data || [];
      const apps = aRes.data || [];
      const incidents = iRes.data || [];

      const pending = complaints.filter(c => c.status === 'pending').length;
      setStats({
        complaints: pending,
        applications: apps.filter(a => a.status === 'pending').length,
        incidents: incidents.filter(i => ['received', 'investigating'].includes(i.status)).length,
        contacts: ctRes.count || 0,
        totalComplaints: complaints.length,
      });

      setRecentComplaints(recentC.data || []);

      // Provider breakdown
      const provCounts = {};
      complaints.forEach(c => { const p = c.provider || 'Unknown'; provCounts[p] = (provCounts[p] || 0) + 1; });
      setProviderBreakdown(Object.entries(provCounts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name: name.replace('Botswana Telecommunications Corporation (BTC)', 'BTC').replace('Orange Botswana', 'Orange').replace('Mascom Wireless', 'Mascom').replace('Botswana Fibre Networks (BoFiNet)', 'BoFiNet'), value })));

      // AI category breakdown
      const catCounts = {};
      complaints.forEach(c => { const cat = c.ai_category || c.complaint_type || 'Uncategorised'; catCounts[cat] = (catCounts[cat] || 0) + 1; });
      setCategoryBreakdown(Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value })));

      // AI urgency breakdown
      const urgCounts = { critical: 0, high: 0, medium: 0, low: 0 };
      complaints.forEach(c => { const u = c.ai_urgency || 'medium'; if (urgCounts[u] !== undefined) urgCounts[u]++; });
      setUrgencyBreakdown(Object.entries(urgCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: URGENCY_COLORS[name] })));

      // AI department breakdown
      const deptCounts = {};
      complaints.forEach(c => { const d = c.ai_department || 'Unassigned'; deptCounts[d] = (deptCounts[d] || 0) + 1; });
      setDepartmentBreakdown(Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })));

      // Triage stats
      const classified = complaints.filter(c => c.ai_category);
      const withConfidence = classified.filter(c => c.ai_confidence != null);
      const avgConf = withConfidence.length > 0 ? Math.round(withConfidence.reduce((sum, c) => sum + c.ai_confidence, 0) / withConfidence.length) : 0;
      const needsReview = withConfidence.filter(c => c.ai_confidence < 70).length;
      setTriageStats({ avgConfidence: avgConf, needsReview, classified: classified.length, total: complaints.length });

      // Generate smart insights
      generateInsights(complaints, apps, incidents);

      // SLA compliance calculation across open cases
      const openComplaints = complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed');
      const openIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed');
      const slaCounts = { on_track: 0, warning: 0, at_risk: 0, breached: 0 };

      openComplaints.forEach(c => {
        const urgency = (c.ai_urgency === 'critical' || c.ai_urgency === 'high') ? 'urgent' : 'standard';
        const sla = calculateSLA('complaint', urgency, c.created_at);
        slaCounts[sla.status]++;
      });
      openIncidents.forEach(i => {
        const sla = calculateSLA('cyber_incident', i.urgency || 'medium', i.created_at);
        slaCounts[sla.status]++;
      });

      const slaData = [
        { name: 'On Track', value: slaCounts.on_track, color: '#6BBE4E' },
        { name: 'Warning', value: slaCounts.warning, color: '#F7B731' },
        { name: 'At Risk', value: slaCounts.at_risk, color: '#EA580C' },
        { name: 'Breached', value: slaCounts.breached, color: '#C8237B' },
      ].filter(d => d.value > 0);
      setSlaBreakdown(slaData);

      const totalOpen = openComplaints.length + openIncidents.length;
      setSlaCompliance(totalOpen > 0 ? Math.round(((totalOpen - slaCounts.breached) / totalOpen) * 100) : 100);

      // Fetch recent workflow automations
      const { data: logs } = await getWorkflowLogs(5);
      if (logs) setRecentAutomations(logs);
    } catch (err) {
      console.error('[BOCRA] Dashboard fetch error:', err);
    }
    setLoading(false);
  }, []);

  function generateInsights(complaints, apps, incidents) {
    const ins = [];
    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const prevWeek = now - 14 * 86400000;

    // This week vs last week complaints
    const thisWeek = complaints.filter(c => new Date(c.created_at).getTime() > weekAgo).length;
    const lastWeek = complaints.filter(c => { const t = new Date(c.created_at).getTime(); return t > prevWeek && t <= weekAgo; }).length;
    if (lastWeek > 0 && thisWeek > lastWeek) {
      const pct = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
      ins.push({ type: 'warning', icon: TrendingUp, text: `Complaints up ${pct}% this week (${thisWeek} vs ${lastWeek} last week)`, color: '#EA580C' });
    } else if (lastWeek > 0 && thisWeek < lastWeek) {
      const pct = Math.round(((lastWeek - thisWeek) / lastWeek) * 100);
      ins.push({ type: 'positive', icon: TrendingDown, text: `Complaints down ${pct}% this week — good progress!`, color: BOCRA.green });
    }

    // Top complained-about provider
    const provCounts = {};
    complaints.filter(c => new Date(c.created_at).getTime() > weekAgo).forEach(c => { const p = c.provider || 'Unknown'; provCounts[p] = (provCounts[p] || 0) + 1; });
    const topProv = Object.entries(provCounts).sort((a, b) => b[1] - a[1])[0];
    if (topProv && topProv[1] >= 2) {
      ins.push({ type: 'info', icon: Building, text: `${topProv[0].replace('Botswana Telecommunications Corporation (BTC)', 'BTC')} has the most complaints this week (${topProv[1]})`, color: BOCRA.magenta });
    }

    // Critical/high urgency complaints needing attention
    const urgent = complaints.filter(c => (c.ai_urgency === 'critical' || c.ai_urgency === 'high') && c.status === 'pending').length;
    if (urgent > 0) {
      ins.push({ type: 'alert', icon: AlertTriangle, text: `${urgent} high/critical urgency complaint${urgent > 1 ? 's' : ''} need immediate attention`, color: '#DC2626' });
    }

    // AI classified percentage
    const classified = complaints.filter(c => c.ai_category).length;
    if (complaints.length > 0) {
      const pct = Math.round((classified / complaints.length) * 100);
      ins.push({ type: 'info', icon: Brain, text: `${pct}% of complaints auto-classified by AI (${classified}/${complaints.length})`, color: BOCRA.cyan });
    }

    // Pending applications
    const pendingApps = apps.filter(a => a.status === 'pending').length;
    if (pendingApps > 3) {
      ins.push({ type: 'warning', icon: FileCheck, text: `${pendingApps} licence applications awaiting review`, color: BOCRA.yellow });
    }

    // Open incidents
    const openInc = incidents.filter(i => i.status === 'received').length;
    if (openInc > 0) {
      ins.push({ type: 'info', icon: Shield, text: `${openInc} cyber incident${openInc > 1 ? 's' : ''} awaiting investigation`, color: BOCRA.cyan });
    }

    setInsights(ins.slice(0, 6));
  }

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('admin-dashboard-v2')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'complaints' }, (payload) => {
        setRealtimeEvents(prev => [{ type: 'complaint', data: payload.new, time: new Date() }, ...prev.slice(0, 9)]);
        setStats(s => ({ ...s, complaints: s.complaints + 1, totalComplaints: s.totalComplaints + 1 }));
        setRecentComplaints(prev => [payload.new, ...prev.slice(0, 7)]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'licence_applications' }, (payload) => {
        setRealtimeEvents(prev => [{ type: 'application', data: payload.new, time: new Date() }, ...prev.slice(0, 9)]);
        setStats(s => ({ ...s, applications: s.applications + 1 }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cyber_incidents' }, (payload) => {
        setRealtimeEvents(prev => [{ type: 'incident', data: payload.new, time: new Date() }, ...prev.slice(0, 9)]);
        setStats(s => ({ ...s, incidents: s.incidents + 1 }));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'complaints' }, () => {
        // Refetch when AI classification updates a complaint
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const timeAgo = (d) => {
    if (!d) return '';
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  };

  const EVENT_ICONS = {
    complaint: { icon: AlertCircle, color: BOCRA.magenta, label: 'New complaint' },
    application: { icon: FileCheck, color: BOCRA.yellow, label: 'Licence application' },
    incident: { icon: Shield, color: BOCRA.cyan, label: 'Cyber incident' },
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#00A6CE]/20 border-t-[#00A6CE] rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm mt-4">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.full_name?.split(' ')[0] || 'Admin'}</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Activity size={14} className="text-[#00A6CE]" /> Smart Dashboard
            {realtimeEvents.length > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full animate-pulse"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Live</span>}
          </p>
        </div>
        <button onClick={() => { setLoading(true); fetchData(); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#00A6CE] hover:text-[#00A6CE] transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'New Complaints', value: stats.complaints, total: stats.totalComplaints, icon: AlertCircle, color: BOCRA.magenta, bg: 'bg-[#C8237B]/10', path: '/admin/complaints' },
          { label: 'Pending Applications', value: stats.applications, icon: FileCheck, color: BOCRA.yellow, bg: 'bg-[#F7B731]/10', path: '/admin/applications' },
          { label: 'Open Incidents', value: stats.incidents, icon: Shield, color: BOCRA.cyan, bg: 'bg-[#00A6CE]/10', path: '/admin/incidents' },
          { label: 'Contact Messages', value: stats.contacts, icon: Mail, color: BOCRA.green, bg: 'bg-[#6BBE4E]/10', path: '/admin/contact' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.label} onClick={() => navigate(s.path)} className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:shadow-lg hover:border-gray-200 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><Icon size={20} style={{ color: s.color }} /></div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-[#00A6CE] transition-colors" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              {s.total && <p className="text-[10px] text-gray-300 mt-0.5">{s.total} total all time</p>}
            </button>
          );
        })}
      </div>

      {/* ═══ SMART INSIGHTS ═══ */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-[#001A3A] to-[#00458B] rounded-xl p-5 mb-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Brain size={16} className="text-[#00A6CE]" /> AI-Powered Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {insights.map((ins, i) => {
              const Icon = ins.icon;
              return (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-white/5">
                  <Icon size={16} style={{ color: ins.color }} className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/80 leading-relaxed">{ins.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Triage Performance */}
      {triageStats.classified > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'AI Classified', value: `${triageStats.classified}/${triageStats.total}`, sub: `${Math.round((triageStats.classified / triageStats.total) * 100)}% coverage`, color: BOCRA.cyan, icon: Brain },
            { label: 'Avg Confidence', value: `${triageStats.avgConfidence}%`, sub: triageStats.avgConfidence >= 80 ? 'Strong accuracy' : triageStats.avgConfidence >= 60 ? 'Moderate accuracy' : 'Needs tuning', color: triageStats.avgConfidence >= 70 ? BOCRA.green : '#DC2626', icon: BarChart3 },
            { label: 'Needs Review', value: triageStats.needsReview, sub: 'Low confidence flags', color: triageStats.needsReview > 0 ? '#EA580C' : BOCRA.green, icon: AlertTriangle },
            { label: 'Reviews Avoided', value: triageStats.classified - triageStats.needsReview, sub: `est. ~8min each manual review`, color: BOCRA.magenta, icon: Clock },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} style={{ color: s.color }} />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Provider breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building size={16} className="text-[#C8237B]" /> Complaints by Provider
          </h3>
          {providerBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={providerBreakdown.slice(0, 5)} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="value" fill={BOCRA.magenta} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">No data yet</div>}
        </div>

        {/* Category donut */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-[#00A6CE]" /> By Category (AI)
          </h3>
          {categoryBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {categoryBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {categoryBreakdown.map((s, i) => (
                  <span key={s.name} className="flex items-center gap-1 text-[9px] text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} /> {s.name} ({s.value})
                  </span>
                ))}
              </div>
            </>
          ) : <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">Submit complaints to see AI categories</div>}
        </div>

        {/* Urgency + Live feed */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Zap size={16} className="text-[#F7B731]" /> Urgency (AI)
          </h3>
          {urgencyBreakdown.length > 0 ? (
            <div className="space-y-2 mb-4">
              {urgencyBreakdown.map(u => {
                const pct = stats.totalComplaints > 0 ? Math.round((u.value / stats.totalComplaints) * 100) : 0;
                return (
                  <div key={u.name} className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-500 w-14">{u.name}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: pct + '%', backgroundColor: u.color }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 w-8 text-right">{u.value}</span>
                  </div>
                );
              })}
            </div>
          ) : <div className="h-[60px] flex items-center justify-center text-gray-300 text-[10px]">AI urgency data will appear here</div>}

          <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-2 pt-2 border-t border-gray-100">
            <Bell size={12} className="text-[#00A6CE]" /> Live Feed
            {realtimeEvents.length > 0 && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
          </h3>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
            {realtimeEvents.length === 0 ? (
              <p className="text-[10px] text-gray-300 text-center py-3">Waiting for submissions…</p>
            ) : realtimeEvents.slice(0, 5).map((evt, i) => {
              const config = EVENT_ICONS[evt.type] || { icon: Mail, color: BOCRA.green, label: 'Message' };
              const Icon = config.icon;
              return (
                <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-gray-50">
                  <Icon size={12} style={{ color: config.color }} />
                  <p className="text-[10px] text-gray-600 truncate flex-1">{config.label} — {evt.data?.name || evt.data?.full_name || 'Anonymous'}</p>
                  <span className="text-[9px] text-gray-300">{timeAgo(evt.time)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Department workload + Recent complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Department workload */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={16} className="text-[#00458B]" /> Department Workload (AI Assigned)
          </h3>
          {departmentBreakdown.length > 0 ? (
            <div className="space-y-2">
              {departmentBreakdown.map((d, i) => {
                const maxVal = departmentBreakdown[0]?.value || 1;
                const pct = Math.round((d.value / maxVal) * 100);
                return (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-36 flex-shrink-0">{d.name}</span>
                    <div className="flex-1 h-6 bg-gray-50 rounded-lg overflow-hidden">
                      <div className="h-full rounded-lg flex items-center px-2 transition-all" style={{ width: pct + '%', backgroundColor: PIE_COLORS[i % PIE_COLORS.length] + '30' }}>
                        <span className="text-[10px] font-bold" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{d.value}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div className="h-[120px] flex items-center justify-center text-gray-300 text-sm">AI will assign departments automatically</div>}
        </div>

        {/* Recent complaints with AI tags */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle size={16} className="text-[#C8237B]" /> Recent Complaints
            </h3>
            <button onClick={() => navigate('/admin/complaints')} className="text-xs text-[#00A6CE] hover:underline flex items-center gap-1">View all <ArrowRight size={10} /></button>
          </div>
          <div className="space-y-2">
            {recentComplaints.length === 0 ? <p className="text-sm text-gray-300 text-center py-6">No complaints yet</p> :
              recentComplaints.slice(0, 6).map(c => (
                <button key={c.id} onClick={() => navigate(`/admin/complaints/${c.id}`)}
                  className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-all text-left">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${c.ai_urgency === 'critical' ? 'bg-red-500' : c.ai_urgency === 'high' ? 'bg-orange-500' : c.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{c.ai_summary || c.name || 'Complaint'}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-gray-400">{c.provider?.replace('Botswana Telecommunications Corporation (BTC)', 'BTC') || 'Unknown'}</span>
                      {c.ai_category && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00A6CE]/10 text-[#00A6CE] font-medium">{c.ai_category}</span>}
                      {c.ai_urgency && <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: (URGENCY_COLORS[c.ai_urgency] || '#94A3B8') + '15', color: URGENCY_COLORS[c.ai_urgency] || '#94A3B8' }}>{c.ai_urgency}</span>}
                      {c.ai_department && <span className="text-[9px] text-gray-300">{c.ai_department}</span>}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-300 flex-shrink-0">{timeAgo(c.created_at)}</span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* ═══ SLA COMPLIANCE + AUTOMATIONS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* SLA Compliance donut */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Clock size={16} className="text-[#00458B]" /> SLA Compliance
          </h3>
          <div className="flex items-center gap-4">
            {slaBreakdown.length > 0 ? (
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={slaBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                    {slaBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-[120px] h-[120px] flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-8 border-[#6BBE4E]/30 flex items-center justify-center">
                  <CheckCircle size={24} className="text-[#6BBE4E]" />
                </div>
              </div>
            )}
            <div>
              <p className="text-3xl font-bold text-gray-900">{slaCompliance}%</p>
              <p className="text-xs text-gray-500 mt-0.5">Compliance Rate</p>
              <div className="mt-2 space-y-1">
                {slaBreakdown.map(s => (
                  <div key={s.name} className="flex items-center gap-1.5 text-[10px]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-gray-500">{s.name}: <b className="text-gray-700">{s.value}</b></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Automations */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Zap size={16} className="text-[#F7B731]" /> Recent Automations
            </h3>
            <button onClick={() => navigate('/admin/automation')} className="text-xs text-[#00A6CE] hover:underline flex items-center gap-1">
              View all <ArrowRight size={10} />
            </button>
          </div>
          <div className="space-y-1.5">
            {recentAutomations.length === 0 ? (
              <p className="text-xs text-gray-300 text-center py-6">No automations executed yet</p>
            ) : recentAutomations.map(log => (
              <div key={log.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <Zap size={12} className="text-[#F7B731] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-gray-700 truncate">{log.rule_name}</p>
                  <p className="text-[9px] text-gray-400 truncate">{log.case_reference || log.case_type} \u2014 {log.action_taken}</p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${log.action_result === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {log.action_result}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Play size={16} className="text-[#6BBE4E]" /> Automation Actions
          </h3>
          <div className="space-y-2">
            <button
              onClick={async () => {
                setEscalationRunning(true);
                setEscalationResult(null);
                const { data, error } = await runEscalationCheck();
                setEscalationRunning(false);
                if (error) {
                  setEscalationResult({ type: 'error', message: error.message });
                } else {
                  setEscalationResult({ type: 'success', message: `${data?.escalations || 0} case(s) escalated` });
                  fetchData();
                }
              }}
              disabled={escalationRunning}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00458B] text-white rounded-xl text-sm font-medium hover:bg-[#003366] disabled:opacity-50 transition-all"
            >
              {escalationRunning ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running check&hellip;</>
              ) : (
                <><AlertTriangle size={14} /> Run Escalation Check</>
              )}
            </button>
            {escalationResult && (
              <div className={`text-xs p-2.5 rounded-lg ${escalationResult.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {escalationResult.message}
              </div>
            )}
            <button
              onClick={() => navigate('/admin/automation')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all"
            >
              <Zap size={14} /> Manage Automation Rules
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-1 rounded-full overflow-hidden mt-4">
        <div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" />
      </div>
    </div>
  );
}
