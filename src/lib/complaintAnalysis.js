/**
 * Complaint Analysis Engine
 *
 * Generates structured AI-style analysis for complaints using
 * keyword matching, pattern detection, and heuristic scoring.
 * Results are cached in localStorage per complaint ID.
 *
 * Output: { summary, issue, category, urgency, suggestedAction, generatedAt }
 */

const CACHE_PREFIX = 'bocra_analysis_';

// ─── Category detection ────────────────────────────────────────
const CATEGORY_RULES = [
  { category: 'Network Quality', keywords: ['network', 'signal', 'coverage', 'drop', 'call drop', 'poor signal', 'no signal', 'weak signal', 'dead zone', 'outage', 'downtime', 'connectivity', 'disconnection'] },
  { category: 'Billing & Charges', keywords: ['bill', 'billing', 'charge', 'overcharge', 'fee', 'tariff', 'price', 'cost', 'airtime', 'deduct', 'deduction', 'refund', 'credit', 'payment', 'subscription', 'bundle', 'data bundle'] },
  { category: 'Internet & Data', keywords: ['internet', 'broadband', 'fibre', 'fiber', 'data', 'speed', 'slow internet', 'wifi', 'wi-fi', 'bandwidth', 'throttle', 'streaming', 'download', 'upload', 'mbps', 'latency'] },
  { category: 'Service Delivery', keywords: ['service', 'delivery', 'install', 'installation', 'activation', 'provision', 'delay', 'waiting', 'pending', 'not working', 'faulty', 'repair', 'maintenance', 'technician'] },
  { category: 'Customer Service', keywords: ['customer service', 'support', 'agent', 'call centre', 'call center', 'response', 'rude', 'unprofessional', 'ignored', 'no response', 'complaint', 'helpline', 'unresponsive'] },
  { category: 'Broadcasting', keywords: ['broadcast', 'tv', 'television', 'radio', 'channel', 'dstv', 'satellite', 'antenna', 'reception', 'programme', 'program', 'content'] },
  { category: 'Postal Services', keywords: ['postal', 'post', 'mail', 'parcel', 'package', 'delivery', 'botswana post', 'courier', 'letter', 'postage', 'p.o. box'] },
  { category: 'Privacy & Data Protection', keywords: ['privacy', 'data protection', 'personal data', 'spam', 'unsolicited', 'sms', 'marketing', 'consent', 'gdpr', 'dpa', 'breach', 'leak', 'identity'] },
  { category: 'Licensing & Compliance', keywords: ['licence', 'license', 'compliance', 'regulation', 'regulatory', 'illegal', 'unlicensed', 'unauthorized', 'unauthorised', 'permit'] },
  { category: 'Equipment & Devices', keywords: ['equipment', 'device', 'handset', 'phone', 'modem', 'router', 'sim', 'sim card', 'type approval', 'faulty device', 'warranty'] },
];

// ─── Urgency signals ───────────────────────────────────────────
const HIGH_URGENCY_SIGNALS = [
  'urgent', 'emergency', 'critical', 'immediately', 'danger', 'safety',
  'fraud', 'scam', 'stolen', 'identity theft', 'life threatening',
  'disability', 'disabled', 'elderly', 'hospital', 'medical',
  'repeated', 'multiple times', 'months ago', 'still not',
  'legal action', 'lawyer', 'court', 'ombudsman',
];
const MEDIUM_URGENCY_SIGNALS = [
  'weeks', 'several days', 'frustrated', 'unacceptable', 'escalate',
  'supervisor', 'manager', 'compensation', 'refund', 'overcharged',
  'not resolved', 'follow up', 'follow-up', 'again',
];

// ─── Suggested actions per category ────────────────────────────
const SUGGESTED_ACTIONS = {
  'Network Quality': 'Issue quality-of-service inquiry to the operator; request coverage data and recent maintenance logs for the affected area.',
  'Billing & Charges': 'Request itemised billing records from the operator; verify charges against published tariff schedule under BOCRA pricing regulations.',
  'Internet & Data': 'Request speed-test evidence and SLA compliance data from the ISP; compare against minimum service standards.',
  'Service Delivery': 'Issue compliance notice for service delivery timelines; request installation/activation logs and escalation history.',
  'Customer Service': 'Log customer service quality complaint; request call logs and response-time records from the operator\u2019s complaints unit.',
  'Broadcasting': 'Verify broadcasting licence compliance; check content scheduling and signal distribution records.',
  'Postal Services': 'Issue tracking inquiry to Botswana Post; verify delivery SLA compliance and package handling procedures.',
  'Privacy & Data Protection': 'Initiate data protection investigation under the Data Protection Act; request consent records and data processing logs from the operator.',
  'Licensing & Compliance': 'Verify operator licensing status in BOCRA registry; if unlicensed, initiate enforcement action.',
  'Equipment & Devices': 'Check type-approval status of the device; verify warranty obligations under consumer protection regulations.',
};

// ─── Provider context ──────────────────────────────────────────
const PROVIDER_CONTEXT = {
  'mascom': 'Mascom Wireless (major mobile operator)',
  'btc': 'Botswana Telecommunications Corporation (state-owned telco)',
  'orange': 'Orange Botswana (mobile operator)',
  'bofinet': 'Botswana Fibre Networks (wholesale fibre provider)',
  'dstv': 'MultiChoice / DStV (satellite broadcasting)',
  'botswana post': 'Botswana Post (national postal service)',
};

/**
 * Detect the best-matching category from complaint text.
 * Returns { category, confidence } where confidence is 0\u20131.
 */
function detectCategory(text, complaintType) {
  const lower = text.toLowerCase();
  let best = { category: 'General Complaint', score: 0 };

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) score += kw.includes(' ') ? 2 : 1; // multi-word matches score higher
    }
    if (score > best.score) best = { category: rule.category, score };
  }

  // If no strong match but complaint_type is set, use that
  if (best.score === 0 && complaintType) {
    return { category: complaintType, confidence: 0.4 };
  }

  const confidence = Math.min(best.score / 4, 1);
  return { category: best.category, confidence };
}

/**
 * Determine urgency level from complaint content and metadata.
 */
function detectUrgency(text, complaint) {
  const lower = text.toLowerCase();
  let score = 0;

  for (const signal of HIGH_URGENCY_SIGNALS) {
    if (lower.includes(signal)) score += 3;
  }
  for (const signal of MEDIUM_URGENCY_SIGNALS) {
    if (lower.includes(signal)) score += 1;
  }

  // Previous complaint boosts urgency
  if (complaint.previous_complaint) score += 2;

  // Age of complaint boosts urgency (open complaints that are older = more urgent)
  if (complaint.created_at) {
    const daysOld = (Date.now() - new Date(complaint.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld > 14) score += 3;
    else if (daysOld > 7) score += 2;
    else if (daysOld > 3) score += 1;
  }

  if (score >= 6) return 'critical';
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

/**
 * Generate a plain-language summary of the complaint.
 */
function generateSummary(complaint, category) {
  const provider = complaint.provider || complaint.company || 'the service provider';
  const name = complaint.name || 'The complainant';
  const type = category.toLowerCase();

  const descSnippet = (complaint.description || '').slice(0, 120).trim();
  const truncated = complaint.description && complaint.description.length > 120
    ? descSnippet + '\u2026'
    : descSnippet;

  let summary = `${name} has filed a ${type} complaint against ${provider}.`;
  if (truncated) {
    summary += ` The complainant reports: \u201C${truncated}\u201D`;
  }
  if (complaint.previous_complaint) {
    summary += ' This is a repeat complaint, indicating an unresolved ongoing issue.';
  }
  return summary;
}

/**
 * Identify the core issue from the complaint description.
 */
function identifyIssue(text, category) {
  const lower = (text || '').toLowerCase();

  const issuePatterns = [
    { pattern: /no (signal|network|service|internet|connection)/i, issue: 'Complete loss of service' },
    { pattern: /overcharg(ed|ing)|extra charge|wrong bill/i, issue: 'Billing discrepancy or overcharging' },
    { pattern: /slow (internet|speed|connection|data)/i, issue: 'Below-standard service speeds' },
    { pattern: /not (installed|activated|connected|delivered)/i, issue: 'Failure to deliver contracted service' },
    { pattern: /no (response|reply|feedback|help)/i, issue: 'Unresponsive customer service' },
    { pattern: /spam|unsolicited|marketing/i, issue: 'Unsolicited communications or privacy violation' },
    { pattern: /fraud|scam|stolen/i, issue: 'Suspected fraud or security breach' },
    { pattern: /refund|money back|compensation/i, issue: 'Unresolved financial dispute' },
    { pattern: /cancel|terminat/i, issue: 'Service cancellation or termination dispute' },
    { pattern: /contract|agreement|terms/i, issue: 'Contract or terms-of-service dispute' },
  ];

  for (const { pattern, issue } of issuePatterns) {
    if (pattern.test(text || '')) return issue;
  }

  return `${category}-related service issue`;
}

/**
 * Main analysis function. Generates a full analysis object for a complaint.
 * Returns cached result if available, otherwise generates and caches.
 *
 * @param {object} complaint - The complaint record from Supabase
 * @returns {{ summary: string, issue: string, category: string, urgency: string, suggestedAction: string, generatedAt: string }}
 */
export function generateComplaintAnalysis(complaint) {
  if (!complaint || !complaint.id) return null;

  // Check cache
  const cacheKey = CACHE_PREFIX + complaint.id;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Validate cached structure
      if (parsed && parsed.summary && parsed.generatedAt) return parsed;
    }
  } catch {
    // Cache miss or corrupt — regenerate
  }

  // Build analysis text from all available fields
  const analysisText = [
    complaint.description,
    complaint.complaint_type,
    complaint.provider,
    complaint.company,
    complaint.name,
  ].filter(Boolean).join(' ');

  const { category } = detectCategory(analysisText, complaint.complaint_type);
  const urgency = detectUrgency(analysisText, complaint);
  const summary = generateSummary(complaint, category);
  const issue = identifyIssue(complaint.description, category);
  const suggestedAction = SUGGESTED_ACTIONS[category]
    || 'Review complaint details and contact the operator for clarification; determine applicable regulatory framework.';

  const result = {
    summary,
    issue,
    category,
    urgency,
    suggestedAction,
    generatedAt: new Date().toISOString(),
  };

  // Cache result
  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  } catch {
    // localStorage full or unavailable — non-critical
  }

  return result;
}

/**
 * Clear cached analysis for a specific complaint (e.g. after complaint update).
 */
export function clearAnalysisCache(complaintId) {
  try {
    localStorage.removeItem(CACHE_PREFIX + complaintId);
  } catch {
    // non-critical
  }
}
