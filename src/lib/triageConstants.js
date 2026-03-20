/**
 * Single source of truth for AI triage categories, departments, and urgencies.
 * Used by both the classify-complaint edge function and the admin UI.
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
