/**
 * language.jsx — LanguageContext provider + useLanguage hook
 * English only — Setswana translation removed.
 * useLanguage() still works everywhere to avoid breaking any pages.
 */
import { createContext, useContext, useCallback, useMemo } from 'react';
import translations from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const lang = 'en';

  const toggleLang = useCallback(() => {}, []);
  const setLang = useCallback(() => {}, []);

  const t = useCallback(
    (key) => translations?.en?.[key] ?? key,
    [],
  );

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [setLang, toggleLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
