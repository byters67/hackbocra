/**
 * translateService.js — Manual bilingual content (no external API)
 *
 * Previously used Google Translate via Supabase Edge Function.
 * Now replaced with local-only bilingual support.
 *
 * These functions are kept as no-ops for backwards compatibility
 * with any remaining callers. They return the original text unchanged.
 */

/**
 * Return text unchanged (no external translation).
 *
 * @param {string} text       — source text/HTML
 * @param {string} _targetLang
 * @param {string} _cacheKey
 * @param {object} [_options]
 * @returns {Promise<string>}
 */
export async function translateContent(text) {
  return text;
}

/**
 * Return texts unchanged (no external translation).
 *
 * @param {string[]} texts
 * @param {string}   _targetLang
 * @param {string}   _cacheKeyPrefix
 * @param {object}   [_options]
 * @returns {Promise<string[]>}
 */
export async function translateBatch(texts) {
  return [...texts];
}
