/**
 * Workflow Helper Functions — BOCRA Automated Workflow Engine
 *
 * Client-side utilities for interacting with the workflow engine via Supabase.
 * All functions call Supabase RPCs or CRUD operations on workflow tables.
 */

import { supabase } from './supabase';

/**
 * Fetch all workflow rules, newest first.
 */
export async function getWorkflowRules() {
  const { data, error } = await supabase
    .from('workflow_rules')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

/**
 * Toggle a rule on/off.
 * @param {string} ruleId — UUID of the rule
 * @param {boolean} isActive — new active state
 */
export async function toggleRule(ruleId, isActive) {
  const { data, error } = await supabase
    .from('workflow_rules')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', ruleId)
    .select();
  return { data, error };
}

/**
 * Update rule parameters (delay, condition, target, etc.).
 * @param {string} ruleId — UUID of the rule
 * @param {object} updates — fields to update
 */
export async function updateRule(ruleId, updates) {
  const { data, error } = await supabase
    .from('workflow_rules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', ruleId)
    .select();
  return { data, error };
}

/**
 * Manually trigger the escalation check via Supabase RPC.
 * Calls the check_escalations() PostgreSQL function.
 */
export async function runEscalationCheck() {
  const { data, error } = await supabase.rpc('check_escalations');
  return { data, error };
}

/**
 * Fetch workflow logs (audit trail), newest first.
 * @param {number} limit — max rows to return (default 50)
 */
export async function getWorkflowLogs(limit = 50) {
  const { data, error } = await supabase
    .from('workflow_logs')
    .select('*')
    .order('executed_at', { ascending: false })
    .limit(limit);
  return { data, error };
}

/**
 * Fetch workflow logs with pagination.
 * @param {number} page — page number (0-indexed)
 * @param {number} pageSize — rows per page
 * @param {object} filters — optional filters { caseType, ruleNameSearch, result, dateFrom, dateTo }
 */
export async function getWorkflowLogsPaginated(page = 0, pageSize = 20, filters = {}) {
  let query = supabase
    .from('workflow_logs')
    .select('*', { count: 'exact' })
    .order('executed_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (filters.caseType) query = query.eq('case_type', filters.caseType);
  if (filters.result) query = query.eq('action_result', filters.result);
  if (filters.ruleNameSearch) query = query.ilike('rule_name', `%${filters.ruleNameSearch}%`);
  if (filters.dateFrom) query = query.gte('executed_at', filters.dateFrom);
  if (filters.dateTo) query = query.lte('executed_at', filters.dateTo);

  const { data, error, count } = await query;
  return { data, error, count };
}

/**
 * Generate a weekly report on demand.
 * Aggregates data from complaints, cyber_incidents, and licence_applications
 * for the last 7 days and stores a summary in generated_reports.
 */
export async function generateWeeklyReport() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const [complaints, incidents, applications] = await Promise.all([
    supabase.from('complaints').select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString()),
    supabase.from('cyber_incidents').select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString()),
    supabase.from('licence_applications').select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString()),
  ]);

  const cData = complaints.data || [];
  const iData = incidents.data || [];
  const aData = applications.data || [];

  // Aggregate complaint stats
  const complaintsByStatus = {};
  const complaintsByProvider = {};
  cData.forEach(c => {
    complaintsByStatus[c.status] = (complaintsByStatus[c.status] || 0) + 1;
    const prov = c.provider || 'Unknown';
    complaintsByProvider[prov] = (complaintsByProvider[prov] || 0) + 1;
  });

  // Aggregate incident stats
  const incidentsByUrgency = {};
  iData.forEach(i => {
    incidentsByUrgency[i.urgency] = (incidentsByUrgency[i.urgency] || 0) + 1;
  });

  // Aggregate application stats
  const applicationsByStatus = {};
  aData.forEach(a => {
    applicationsByStatus[a.status] = (applicationsByStatus[a.status] || 0) + 1;
  });

  // Top 3 complained-about providers
  const topProviders = Object.entries(complaintsByProvider)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // SLA compliance (simplified: pending complaints older than 14 days = breached)
  const slaBreached = cData.filter(c =>
    c.status !== 'resolved' && c.status !== 'closed' &&
    (Date.now() - new Date(c.created_at).getTime()) > 14 * 24 * 60 * 60000
  ).length;
  const slaCompliance = cData.length > 0
    ? Math.round(((cData.length - slaBreached) / cData.length) * 100)
    : 100;

  const reportData = {
    period: { start: startDate.toISOString(), end: endDate.toISOString() },
    complaints: {
      total: cData.length,
      resolved: cData.filter(c => c.status === 'resolved').length,
      byStatus: complaintsByStatus,
      byProvider: complaintsByProvider,
      topProviders,
    },
    incidents: {
      total: iData.length,
      byUrgency: incidentsByUrgency,
    },
    applications: {
      total: aData.length,
      byStatus: applicationsByStatus,
    },
    sla: {
      compliance: slaCompliance,
      breached: slaBreached,
    },
  };

  const title = `Weekly Report: ${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} \u2013 ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const { data, error } = await supabase
    .from('generated_reports')
    .insert({
      report_type: 'weekly',
      title,
      period_start: startDate.toISOString().split('T')[0],
      period_end: endDate.toISOString().split('T')[0],
      data: reportData,
    })
    .select();

  return { data, error };
}

/**
 * Fetch generated reports, newest first.
 * @param {number} limit — max rows to return
 */
export async function getGeneratedReports(limit = 10) {
  const { data, error } = await supabase
    .from('generated_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
}
