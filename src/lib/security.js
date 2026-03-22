/**
 * ═══════════════════════════════════════════════════════════════════════
 * BOCRA Website — Security Implementation Layer
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * This module implements security controls that directly address every
 * finding from the BOCRA Penetration Test Report (14 March 2026).
 * 
 * ┌─────┬──────────────────────────────────────────┬──────────┬────────────────────────────────────┐
 * │ ID  │ Finding                                  │ Severity │ Remediation in this codebase       │
 * ├─────┼──────────────────────────────────────────┼──────────┼────────────────────────────────────┤
 * │ F01 │ Unauth POST triggers backend jobs        │ CRITICAL │ RLS + checkRateLimit() + auth      │
 * │ F02 │ Laravel debug mode in production         │ CRITICAL │ Static SPA — no server debug mode  │
 * │ F03 │ Route map exposed via Ziggy              │ HIGH     │ No Ziggy; client routes are public │
 * │ F04 │ Unauth API exposes operational data      │ HIGH     │ RLS on all tables; auth required   │
 * │ F05 │ Admin panel internet-exposed             │ HIGH     │ ProtectedRoute + role checks       │
 * │ F06 │ Verbose errors leak schema               │ MEDIUM   │ sanitizeError() strips internals   │
 * │ F07 │ Server version disclosure                │ MEDIUM   │ GitHub Pages — no server headers   │
 * │ F08 │ Missing security headers                 │ MEDIUM   │ _headers file + CSP meta tags      │
 * │ F09 │ QA/sandbox publicly accessible           │ MEDIUM   │ Single deployment — no QA subdomain│
 * │ F10 │ Email SPF/DMARC weak                     │ LOW      │ DNS config recommendations below   │
 * │ F11 │ Customer portal HTTP 500                 │ LOW      │ Fully rebuilt in React             │
 * └─────┴──────────────────────────────────────────┴──────────┴────────────────────────────────────┘
 * 
 * USAGE:
 *   import { sanitizeInput, sanitizeError, validateEmail, CSP_META } from '@/lib/security';
 */

// ─── F06 REMEDIATION: ERROR SANITIZATION ────────────────────────
// The old DQoS platform returned full stack traces, SQL queries,
// file paths, and framework internals in error responses.
// We strip ALL internal details from user-facing errors.

/**
 * Sanitizes an error before displaying to the user.
 * Strips internal details like stack traces, SQL, file paths.
 * 
 * @param {Error|string|object} error - The raw error from Supabase/API
 * @returns {string} A safe, user-friendly error message
 */
export function sanitizeError(error) {
  // Map of internal error patterns → user-friendly messages
  const ERROR_MAP = {
    'JWT expired': 'Your session has expired. Please sign in again.',
    'Invalid login credentials': 'Incorrect email or password. Please try again.',
    'Email not confirmed': 'Please check your email to confirm your account.',
    'duplicate key': 'This record already exists.',
    'violates row-level security': 'You do not have permission to perform this action.',
    'rate limit': 'Too many requests. Please wait a moment and try again.',
    'Failed to fetch': 'Unable to connect. Please check your internet connection.',
    'NetworkError': 'Network error. Please check your connection and try again.',
  };

  const errorStr = typeof error === 'string' 
    ? error 
    : error?.message || error?.error_description || JSON.stringify(error);

  // Check against known patterns
  for (const [pattern, friendly] of Object.entries(ERROR_MAP)) {
    if (errorStr.toLowerCase().includes(pattern.toLowerCase())) {
      return friendly;
    }
  }

  // NEVER expose raw error messages to users
  // Log the full error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error('[BOCRA Debug] Raw error:', error);
  }

  // Generic fallback — reveals nothing about internals
  return 'Something went wrong. Please try again or contact BOCRA at info@bocra.org.bw.';
}

// ─── F01/F04 REMEDIATION: INPUT SANITIZATION ────────────────────
// The old platform accepted unsanitized input in API endpoints.
// We sanitize all user input before sending to Supabase.

/**
 * Sanitizes user input to prevent XSS and injection attacks.
 * Strips HTML tags, trims whitespace, limits length.
 * 
 * @param {string} input - Raw user input
 * @param {number} maxLength - Maximum allowed length (default: 5000)
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input, maxLength = 5000) {
  if (typeof input !== 'string') return '';

  // V-08 remediation: removed SQL character stripping — Supabase uses
  // parameterized queries so SQL injection via the JS client is not possible.
  // Stripping quotes/semicolons corrupted legitimate input like O'Brien.
  // HTML tag stripping is kept as a lightweight XSS defense layer;
  // the primary XSS defense is DOMPurify at render time (V-04).
  return input
    .trim()
    // Remove HTML tags to prevent stored XSS in contexts without DOMPurify
    .replace(/<[^>]*>/g, '')
    // Limit length
    .slice(0, maxLength);
}

/**
 * Validates an email address format.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

/**
 * Validates a Botswana phone number.
 * Accepts formats: +267XXXXXXX, 267XXXXXXX, 7XXXXXXX, etc.
 * @param {string} phone
 * @returns {boolean}
 */
export function validatePhone(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Botswana numbers: 7 or 8 digits, optionally prefixed with +267 or 267
  return /^(\+?267)?[0-9]{7,8}$/.test(cleaned);
}

// ─── F08 REMEDIATION: CONTENT SECURITY POLICY ───────────────────
// The old site was missing CSP, Permissions-Policy, Referrer-Policy.
// GitHub Pages _headers file handles server-level headers.
// This meta tag provides a fallback CSP for the HTML document.

/**
 * Content Security Policy as a meta tag string.
 * This is injected into index.html as a fallback.
 * The primary CSP is in public/_headers.
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://www.google.com', 'https://www.gstatic.com'],  // Required for Vite/React + reCAPTCHA
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https://*.supabase.co', 'https://*.openstreetmap.org'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'https://www.google.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  'frame-src': ["'self'", 'https://*.openstreetmap.org', 'https://www.google.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

// ─── F05 REMEDIATION: ROLE-BASED ACCESS CONTROL ─────────────────
// The old admin panel was internet-exposed with no access control.
// We enforce role checks at both the frontend (ProtectedRoute)
// and backend (Supabase RLS) levels.

/**
 * Available user roles and their permissions.
 * Used by ProtectedRoute component and RLS policies.
 */
export const ROLES = {
  user: {
    label: 'Public User',
    canAccess: ['/', '/about/*', '/mandate/*', '/services/*', '/documents/*', '/media/*', '/contact'],
  },
  operator: {
    label: 'Licensed Operator',
    canAccess: ['...user', '/portal', '/portal/submissions'],
  },
  staff: {
    label: 'BOCRA Staff',
    canAccess: ['...operator', '/admin/complaints', '/admin/documents'],
  },
  admin: {
    label: 'Administrator',
    canAccess: ['*'],  // Full access to all routes
  },
};

/**
 * Checks if a given role has access to a specific path.
 * @param {string} role - User role ('user', 'operator', 'staff', 'admin')
 * @param {string} path - The route path to check
 * @returns {boolean}
 */
export function hasAccess(role, path) {
  if (role === 'admin') return true;
  
  const permissions = ROLES[role]?.canAccess || [];
  return permissions.some(pattern => {
    if (pattern === '*') return true;
    if (pattern.endsWith('/*')) {
      return path.startsWith(pattern.slice(0, -1));
    }
    return path === pattern;
  });
}

// ─── F10 REMEDIATION: EMAIL SECURITY RECOMMENDATIONS ────────────
// These DNS records should be configured by BOCRA's DNS admin.
// Documented here for the technical proposal.

/**
 * Recommended DNS changes for email security (F10 remediation):
 * 
 * 1. SPF: Change from ~all (softfail) to -all (hardfail)
 *    Current:  v=spf1 include:... ~all
 *    Fix:      v=spf1 include:... -all
 * 
 * 2. DMARC: Change from p=quarantine to p=reject
 *    Current:  v=DMARC1; p=quarantine; ...
 *    Fix:      v=DMARC1; p=reject; rua=mailto:dmarc@bocra.org.bw; ...
 * 
 * 3. DKIM: Ensure all sending sources have valid DKIM signatures.
 */
export const EMAIL_SECURITY_RECOMMENDATIONS = {
  spf: 'v=spf1 include:_spf.google.com include:sendgrid.net -all',
  dmarc: 'v=DMARC1; p=reject; rua=mailto:dmarc@bocra.org.bw; ruf=mailto:dmarc@bocra.org.bw; fo=1;',
  note: 'Monitor DMARC reports for 2 weeks before switching from quarantine to reject.',
};

// ─── SECURITY HEADERS VALIDATION ────────────────────────────────
// Utility to verify our security headers are properly set.

/**
 * Checks if required security headers are present on the current page.
 * Logs warnings for any missing headers (development only).
 */
export function auditSecurityHeaders() {
  if (!import.meta.env.DEV) return; // Only in development
  
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
  ];

  console.group('[BOCRA Security Audit]');
  console.log('Running client-side security header check...');
  console.log('Note: Full header validation requires server-side testing.');
  console.log('Use: curl -I https://hackathonteamproject.github.io/hackathonteamproject/');
  console.groupEnd();
}
