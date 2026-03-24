/**
 * HTML sanitization utility — V-04 remediation
 *
 * Wraps DOMPurify to sanitize HTML before rendering via dangerouslySetInnerHTML.
 * Allows safe structural HTML (headings, paragraphs, lists, links, tables)
 * while stripping all XSS vectors (scripts, event handlers, etc.).
 */
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content for safe rendering via dangerouslySetInnerHTML.
 * @param {string} html - Raw HTML string
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}
