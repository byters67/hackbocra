/**
 * SLA Calculation Utilities — BOCRA Automated Workflow Engine
 *
 * Calculates SLA status for complaints, cyber incidents, and licence applications.
 * Targets are stored in minutes for uniform comparison.
 *
 * Status thresholds:
 *   on_track  (green)  — >50% time remaining
 *   warning   (yellow) — 25-50% remaining
 *   at_risk   (orange) — <25% remaining
 *   breached  (red)    — 0% remaining (overdue)
 */

const SLA_TARGETS = {
  complaint: { standard: 14 * 24 * 60, urgent: 3 * 24 * 60 },
  cyber_incident: { critical: 24 * 60, high: 3 * 24 * 60, medium: 7 * 24 * 60, low: 14 * 24 * 60 },
  licence_application: { default: 30 * 24 * 60 },
};

/**
 * Calculate SLA status for a given case.
 * @param {string} caseType — 'complaint' | 'cyber_incident' | 'licence_application'
 * @param {string} urgency — urgency level (e.g. 'standard', 'urgent', 'critical', 'high', 'medium', 'low')
 * @param {string} createdAt — ISO date string of when the case was created
 * @returns {{ targetMinutes, elapsedMinutes, remainingMinutes, percentElapsed, status, remainingHuman }}
 */
export function calculateSLA(caseType, urgency, createdAt) {
  const targetMinutes = SLA_TARGETS[caseType]?.[urgency]
    || SLA_TARGETS[caseType]?.standard
    || SLA_TARGETS[caseType]?.default
    || 14 * 24 * 60;

  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 60000;
  const remaining = targetMinutes - elapsed;
  const percentElapsed = Math.min((elapsed / targetMinutes) * 100, 100);

  let status = 'on_track';
  if (percentElapsed >= 100) status = 'breached';
  else if (percentElapsed >= 75) status = 'at_risk';
  else if (percentElapsed >= 50) status = 'warning';

  return {
    targetMinutes,
    elapsedMinutes: Math.round(elapsed),
    remainingMinutes: Math.max(0, Math.round(remaining)),
    percentElapsed: Math.round(percentElapsed),
    status,
    remainingHuman: formatRemaining(remaining),
  };
}

/**
 * Format remaining minutes into human-readable text.
 * @param {number} minutes — remaining minutes (negative = overdue)
 * @returns {string}
 */
function formatRemaining(minutes) {
  if (minutes <= 0) {
    const overdue = Math.abs(minutes);
    const days = Math.floor(overdue / (24 * 60));
    const hours = Math.floor((overdue % (24 * 60)) / 60);
    if (days > 0) return `OVERDUE (${days}d ${hours}h)`;
    if (hours > 0) return `OVERDUE (${hours}h)`;
    return `OVERDUE (${Math.round(overdue)}m)`;
  }
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return `${Math.round(minutes)}m`;
}

/**
 * Get the SLA target object for reference.
 */
export { SLA_TARGETS };
