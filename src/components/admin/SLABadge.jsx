/**
 * SLABadge — Inline SLA countdown pill for case tables.
 *
 * Displays remaining time with colour-coded status:
 *   Green  (#6BBE4E) — >50% time remaining (on track)
 *   Yellow (#F7B731) — 25-50% remaining (warning)
 *   Orange (#EA580C) — <25% remaining (at risk)
 *   Red    (#C8237B) — breached (overdue)
 *
 * Props:
 *   caseType  — 'complaint' | 'cyber_incident' | 'licence_application'
 *   urgency   — urgency level string
 *   createdAt — ISO date string
 *   compact   — boolean, renders smaller badge (for tight table rows)
 */

import { useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { calculateSLA } from '../../lib/sla';

const STATUS_STYLES = {
  on_track: {
    bg: 'bg-[#6BBE4E]/10',
    text: 'text-[#3d7a2a]',
    border: 'border-[#6BBE4E]/30',
    color: '#6BBE4E',
    label: 'On Track',
  },
  warning: {
    bg: 'bg-[#F7B731]/10',
    text: 'text-[#a07516]',
    border: 'border-[#F7B731]/30',
    color: '#F7B731',
    label: 'Warning',
  },
  at_risk: {
    bg: 'bg-[#EA580C]/10',
    text: 'text-[#EA580C]',
    border: 'border-[#EA580C]/30',
    color: '#EA580C',
    label: 'At Risk',
  },
  breached: {
    bg: 'bg-[#C8237B]/10',
    text: 'text-[#C8237B]',
    border: 'border-[#C8237B]/30',
    color: '#C8237B',
    label: 'Breached',
  },
};

export default function SLABadge({ caseType, urgency, createdAt, compact = false }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!createdAt) return null;

  const sla = calculateSLA(caseType, urgency || 'standard', createdAt);
  const style = STATUS_STYLES[sla.status] || STATUS_STYLES.on_track;

  const Icon = sla.status === 'breached' || sla.status === 'at_risk' ? AlertTriangle : Clock;

  const targetDays = Math.round(sla.targetMinutes / (24 * 60));
  const elapsedDays = Math.round(sla.elapsedMinutes / (24 * 60) * 10) / 10;

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1 rounded-full border font-semibold whitespace-nowrap transition-colors ${style.bg} ${style.text} ${style.border} ${
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
        }`}
        aria-label={`SLA status: ${style.label}. ${sla.remainingHuman}`}
      >
        <Icon size={compact ? 10 : 12} />
        <span>{sla.remainingHuman}</span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-[#001A3A] text-white rounded-lg shadow-xl p-3 text-[11px] pointer-events-none">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold" style={{ color: style.color }}>{style.label}</span>
            <span className="text-white/50">{sla.percentElapsed}% elapsed</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-white/10 rounded-full mb-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${sla.percentElapsed}%`, backgroundColor: style.color }}
            />
          </div>
          <div className="space-y-1 text-white/70">
            <div className="flex justify-between">
              <span>Target:</span>
              <span className="text-white/90">{targetDays} day{targetDays !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span>Elapsed:</span>
              <span className="text-white/90">{elapsedDays} day{elapsedDays !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining:</span>
              <span className="font-semibold" style={{ color: style.color }}>{sla.remainingHuman}</span>
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#001A3A]" />
        </div>
      )}
    </div>
  );
}

/**
 * Utility: determine urgency for a complaint based on complaint_type.
 * Used by ComplaintsPage when rendering SLA badges.
 */
export function getComplaintUrgency(complaint) {
  if (complaint.ai_urgency === 'critical' || complaint.ai_urgency === 'high') return 'urgent';
  const type = (complaint.complaint_type || '').toLowerCase();
  if (type.includes('urgent') || type.includes('network outage') || type.includes('emergency')) return 'urgent';
  return 'standard';
}
