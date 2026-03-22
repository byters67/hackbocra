/**
 * triageConstants.js — AI Complaint Triage Taxonomy
 *
 * Single source of truth for the categories, departments, and urgency
 * levels used by the AI complaint classification system.
 *
 * Shared between:
 *   - supabase/functions/classify-complaint/index.ts (server-side)
 *   - src/pages/admin/ComplaintsPage.jsx (admin filter dropdowns)
 *   - src/pages/admin/DashboardPage.jsx (analytics breakdowns)
 *
 * IMPORTANT: If you add/remove categories or departments here, you must
 * also update the VALID_CATEGORIES and VALID_DEPARTMENTS arrays in the
 * classify-complaint Edge Function to keep them in sync.
 */

export const AI_CATEGORIES = [
  'Telecommunications',
  'Broadcasting',
  'Postal Services',
  'Internet & Data Services',
  'Spectrum Management',
  'Cybersecurity',
  'Consumer Protection',
  'Licensing & Compliance',
];

export const AI_DEPARTMENTS = [
  'Telecommunications Division',
  'Broadcasting Division',
  'Postal Division',
  'Technical Services (Spectrum)',
  'ICT & Cybersecurity Division',
  'Consumer Affairs Division',
  'Legal & Compliance Division',
  'Licensing Division',
];

export const AI_URGENCIES = ['critical', 'high', 'medium', 'low'];
