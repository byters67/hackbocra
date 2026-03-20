/**
 * useTranslatedContent — React hooks for manual bilingual content (EN / TN)
 *
 * Provides three hooks:
 *   useTranslatedContent  — selects HTML content by language
 *   useTranslatedText     — selects a single plain-text string by language
 *   useTranslatedStrings  — selects from a bilingual strings object by language
 *
 * All hooks return English immediately and swap to Setswana when available.
 * Falls back to English if Setswana content is missing.
 *
 * NO external API calls — all translations are manual / local.
 */

/**
 * Select HTML content by language.
 *
 * @param {string} contentEn — English HTML string
 * @param {string} contentTn — Setswana HTML string (optional)
 * @param {string} lang      — active language ('en' | 'tn')
 * @returns {{ translatedContent: string, isTranslating: boolean }}
 */
export function useTranslatedContent(contentEn, contentTn, lang) {
  const content = (lang === 'tn' && contentTn) ? contentTn : (contentEn || '');
  return { translatedContent: content, isTranslating: false };
}

/**
 * Select a single plain-text string by language.
 *
 * @param {string} textEn — English text
 * @param {string} textTn — Setswana text (optional)
 * @param {string} lang   — active language
 * @returns {{ translatedText: string, isTranslating: boolean }}
 */
export function useTranslatedText(textEn, textTn, lang) {
  const text = (lang === 'tn' && textTn) ? textTn : (textEn || '');
  return { translatedText: text, isTranslating: false };
}

/**
 * Select from a bilingual strings object by language.
 *
 * IMPORTANT: The `strings` parameter should contain both English and Setswana
 * values, structured as: { key: { en: 'English', tn: 'Setswana' } }
 * OR as a flat object of English defaults, with a matching `stringsTn` object.
 *
 * This hook accepts either:
 *   (a) { key: 'English text' } with a separate tnStrings object, or
 *   (b) a pre-resolved object that already has the correct language values.
 *
 * @param {Object<string, string>} strings   — English strings { key: 'text' }
 * @param {string} lang                      — active language
 * @param {string} _cachePrefix              — (unused, kept for API compat)
 * @param {Object<string, string>} [stringsTn] — Setswana overrides { key: 'text' }
 * @returns {{ translations: Object, isTranslating: boolean }}
 */
export function useTranslatedStrings(strings, lang, _cachePrefix, stringsTn) {
  if (lang === 'en' || !stringsTn) {
    return { translations: strings, isTranslating: false };
  }

  // Merge: use Setswana where available, fall back to English
  const merged = {};
  for (const key in strings) {
    merged[key] = stringsTn[key] || strings[key];
  }
  return { translations: merged, isTranslating: false };
}
