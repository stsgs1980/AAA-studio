'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { translations, type Locale, type TranslationDict } from './translations';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TranslationDict;
  /** Interpolate: tKey('Hello {name}', { name: 'World' }) => 'Hello World' */
  tKey: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: translations.en,
  tKey: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('3a-studio-locale') as Locale | null;
    if (saved && saved in translations) setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('3a-studio-locale', l);
  }, []);

  const tKey = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[locale];
      let value = key;
      for (const ns of Object.values(dict)) {
        if (ns[key]) { value = ns[key]; break; }
      }
      if (!params) return value;
      return Object.entries(params).reduce(
        (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
        value,
      );
    },
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale], tKey }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
