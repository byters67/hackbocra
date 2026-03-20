/**
 * language.jsx — LanguageContext provider + useLanguage hook
 * Supports English (en) and Setswana (tn) with toggle.
 * Language preference persisted in localStorage.
 */
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import translations from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('bocra-lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = useCallback((newLang) => {
    const l = newLang === 'tn' ? 'tn' : 'en';
    setLangState(l);
    try { localStorage.setItem('bocra-lang', l); } catch {}
  }, []);

  const toggleLang = useCallback(() => {
    setLangState(prev => {
      const next = prev === 'en' ? 'tn' : 'en';
      try { localStorage.setItem('bocra-lang', next); } catch {}
      return next;
    });
  }, []);

  const t = useCallback(
    (key) => translations?.[lang]?.[key] ?? translations?.en?.[key] ?? key,
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t]);

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
