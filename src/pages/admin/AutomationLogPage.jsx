/**
 * AutomationLogPage — Full audit trail of all workflow executions.
 *
 * Features:
 * - Paginated table (20 per page) from workflow_logs
 * - Filter by: case type, result, date range, search by rule name / case reference
 * - Summary stats: total today, success rate, most active rule
 * - Expandable rows showing JSONB details
 * - Export filtered data as CSV
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, CheckCircle, XCircle, Download,
  Zap, RefreshCw, ChevronLeft, ChevronRight, ChevronDown,
  ChevronUp, X as XIcon, Calendar
} from 'lucide-react';
import { getWorkflowLogsPaginated } from '../../lib/workflow';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function formatTimestamp(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const CASE_TYPE_STYLES = {
  complaint:            { bg: 'bg-[#00458B]/10', text: 'text-[#00458B]', label: 'Complaint' },
  cyber_incident:       { bg: 'bg-[#C8237B]/10', text: 'text-[#C8237B]', label: 'Cyber Incident' },
  licence_application:  { bg: 'bg-[#F7B731]/10', text: 'text-[#9A7300]', label: 'Licence Application' },
};

function CaseTypeBadge({ type }) {
  const style = CASE_TYPE_STYLES[type] || { bg: 'bg-gray-100', text: 'text-gray-600', label: type?.replace('_', ' ') || '\u2014' };
  return (
    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

function ResultBadge({ result }) {
  const isSuccess = result === 'success';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {isSuccess ? <CheckCircle size={10} /> : <XCircle size={10} />}
      {result}
    </span>
  );
}

function TriggerBadge({ event }) {
  return (
    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-mono font-medium">
      {event}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AutomationLogPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const PAGE_SIZE = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const filters = {};
    if (caseTypeFilter) filters.caseType = caseTypeFilter;
    if (resultFilter) filters.result = resultFilter;
    if (dateFrom) filters.dateFrom = new Date(dateFrom).toISOString();
    if (dateTo) {
      // End of day for the "to" date
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      filters.dateTo = end.toISOString();
    }
    const { data, count } = await getWorkflowLogsPaginated(page, PAGE_SIZE, filters);
    if (data) setLogs(data);
    if (count !== null && count !== undefined) setTotalCount(count);
    setLoading(false);
  }, [page, caseTypeFilter, resultFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Client-side search filter (on already-fetched page)
  const filtered = useMemo(() => {
    if (!searchTerm) return logs;
    const q = searchTerm.toLowerCase();
    return logs.filter(l =>
      l.rule_name?.toLowerCase().includes(q) ||
      l.case_reference?.toLowerCase().includes(q) ||
      l.action_taken?.toLowerCase().includes(q)
    );
  }, [logs, searchTerm]);

  // Stats (from current page data)
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayLogs = logs.filter(l => new Date(l.executed_at) >= todayStart);
    const successCount = logs.filter(l => l.action_result === 'success').length;
    const successRate = logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 100;

    const ruleFreq = {};
    logs.forEach(l => { ruleFreq[l.rule_name] = (ruleFreq[l.rule_name] || 0) + 1; });
    const mostActive = Object.entries(ruleFreq).sort((a, b) => b[1] - a[1])[0];

    return { todayCount: todayLogs.length, successRate, mostActive: mostActive ? mostActive[0] : 'N/A' };
  }, [logs]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const rangeStart = page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, totalCount);
  const hasActiveFilters = searchTerm || caseTypeFilter || resultFilter || dateFrom || dateTo;

  function clearFilters() {
    setSearchTerm('');
    setCaseTypeFilter('');
    setResultFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  }

  function exportCSV() {
    const headers = ['Timestamp', 'Rule', 'Trigger Event', 'Case Type', 'Case Reference', 'Action', 'Result', 'Details'];
    const rows = filtered.map(log => [
      formatTimestamp(log.executed_at),
      log.rule_name || '',
      log.trigger_event || '',
      log.case_type || '',
      log.case_reference || log.case_id || '',
      log.action_taken || '',
      log.action_result || '',
      log.details ? JSON.stringify(log.details) : '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `automation_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Back link */}
      <button
        onClick={() => navigate('/admin/automation')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-5 transition-colors min-h-[48px]"
        aria-label="Back to Automation"
      >
        <ArrowLeft size={16} /> Back to Automation
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap size={24} className="text-[#F7B731]" /> Automation Activity Log
        </h1>
        <p className="text-sm text-gray-500 mt-1">{totalCount} total execution{totalCount !== 1 ? 's' : ''}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.todayCount}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Executions Today</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Success Rate</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-sm font-bold text-gray-900 truncate">{stats.mostActive}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Most Active Rule</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search rule name, case reference\u2026"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00458B] min-h-[48px]"
              aria-label="Search logs"
            />
          </div>

          {/* Case type */}
          <select
            value={caseTypeFilter}
            onChange={e => { setCaseTypeFilter(e.target.value); setPage(0); }}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-[#00458B] min-h-[48px]"
            aria-label="Filter by case type"
          >
            <option value="">All Case Types</option>
            <option value="complaint">Complaint</option>
            <option value="cyber_incident">Cyber Incident</option>
            <option value="licence_application">Licence Application</option>
          </select>

          {/* Result */}
          <select
            value={resultFilter}
            onChange={e => { setResultFilter(e.target.value); setPage(0); }}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-[#00458B] min-h-[48px]"
            aria-label="Filter by result"
          >
            <option value="">All Results</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(0); }}
                className="pl-8 pr-2 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-[#00458B] min-h-[48px]"
                aria-label="From date"
              />
            </div>
            <span className="text-gray-400 text-xs">\u2013</span>
            <div className="relative">
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(0); }}
                className="pl-8 pr-2 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-[#00458B] min-h-[48px]"
                aria-label="To date"
              />
            </div>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center gap-2 mt-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors min-h-[48px]"
              aria-label="Clear all filters"
            >
              <XIcon size={14} /> Clear Filters
            </button>
          )}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#00458B] border border-[#00458B]/20 rounded-lg hover:bg-[#00458B]/5 transition-colors min-h-[48px] ml-auto"
            aria-label="Export as CSV"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={fetchLogs}
            className="p-2.5 text-gray-400 hover:text-[#00A6CE] border border-gray-200 rounded-lg hover:border-[#00A6CE] transition-all min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Refresh logs"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-[#00458B]/20 border-t-[#00458B] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-300">
            <Zap size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No automation logs found</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-2 text-xs text-[#00A6CE] hover:underline">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left sticky top-0">
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase w-8" />
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase">Rule</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase">Event</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase">Case</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase">Case Type</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log, i) => {
                  const isExpanded = expandedRow === log.id;
                  const hasDetails = log.details && Object.keys(log.details).length > 0;
                  return (
                    <LogRow
                      key={log.id}
                      log={log}
                      index={i}
                      isExpanded={isExpanded}
                      hasDetails={hasDetails}
                      onToggleExpand={() => setExpandedRow(isExpanded ? null : log.id)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            Showing {rangeStart}\u2013{rangeEnd} of {totalCount}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center justify-center min-h-[48px] min-w-[48px] border border-gray-200 rounded-lg text-gray-400 hover:text-[#00458B] disabled:opacity-30 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-sm text-gray-600">
              Page {page + 1} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center justify-center min-h-[48px] min-w-[48px] border border-gray-200 rounded-lg text-gray-400 hover:text-[#00458B] disabled:opacity-30 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* BOCRA colour bar */}
      <div className="flex h-1 rounded-full overflow-hidden mt-6">
        <div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOG ROW (with expandable details)
   ═══════════════════════════════════════════════════════════════ */

function LogRow({ log, index, isExpanded, hasDetails, onToggleExpand }) {
  return (
    <>
      <tr
        className={`hover:bg-gray-50/50 ${index % 2 === 1 ? 'bg-gray-50/30' : ''} ${hasDetails ? 'cursor-pointer' : ''}`}
        onClick={hasDetails ? onToggleExpand : undefined}
      >
        {/* Expand toggle */}
        <td className="px-2 py-2.5 text-center">
          {hasDetails && (
            <button
              onClick={e => { e.stopPropagation(); onToggleExpand(); }}
              className="p-1 text-gray-400 hover:text-[#00458B] transition-colors"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </td>
        <td className="px-4 py-2.5 text-xs text-gray-500 font-mono whitespace-nowrap">{formatTimestamp(log.executed_at)}</td>
        <td className="px-4 py-2.5 text-xs text-gray-700 font-medium">{log.rule_name}</td>
        <td className="px-4 py-2.5"><TriggerBadge event={log.trigger_event} /></td>
        <td className="px-4 py-2.5 text-xs text-gray-600 font-mono">{log.case_reference || log.case_id?.slice(0, 8) || '\u2014'}</td>
        <td className="px-4 py-2.5"><CaseTypeBadge type={log.case_type} /></td>
        <td className="px-4 py-2.5 text-xs text-gray-600">{log.action_taken}</td>
        <td className="px-4 py-2.5"><ResultBadge result={log.action_result} /></td>
      </tr>
      {/* Expanded details sub-row */}
      {isExpanded && hasDetails && (
        <tr className="bg-[#00458B]/[0.02]">
          <td colSpan={8} className="px-6 py-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Execution Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
              {Object.entries(log.details).map(([key, value]) => (
                <div key={key} className="flex items-baseline gap-2">
                  <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-[11px] text-gray-700 font-mono break-all">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
