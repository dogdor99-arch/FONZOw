import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@shared/fonzo/types";

const STORAGE_KEY = "fonzo:locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** Pick the right string from a bilingual pair. */
  t: (th: string, en: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStored(): Locale {
  if (typeof window === "undefined") return "th";
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "en" ? "en" : "th";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStored());

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);
  const toggleLocale = useCallback(() => setLocaleState(prev => (prev === "th" ? "en" : "th")), []);
  const t = useCallback((th: string, en: string) => (locale === "th" ? th : en), [locale]);

  const value = useMemo(() => ({ locale, setLocale, toggleLocale, t }), [locale, setLocale, toggleLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}

