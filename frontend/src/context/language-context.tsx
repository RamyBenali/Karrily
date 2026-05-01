import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import fr from "../i18n/fr.json";
import en from "../i18n/en.json";
import ar from "../i18n/ar.json";

const STORAGE_KEY = "karrily-lang";

export type Locale = "fr" | "en" | "ar";

const translations: Record<Locale, Record<string, any>> = { fr, en, ar };

export const LOCALE_META: Record<Locale, { label: string; flag: string; dir: "ltr" | "rtl" }> = {
  fr: { label: "Français", flag: "🇫🇷", dir: "ltr" },
  en: { label: "English", flag: "🇬🇧", dir: "ltr" },
  ar: { label: "العربية", flag: "🇩🇿", dir: "rtl" },
};

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "fr";
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "en" || raw === "ar" || raw === "fr") return raw;
  return "fr";
}

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[key];
  }
  return typeof current === "string" ? current : undefined;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const dir = LOCALE_META[locale].dir;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("lang", locale);
    root.setAttribute("dir", dir);
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore quota / private mode */
    }
  }, [locale, dir]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = getNestedValue(translations[locale], key);
      if (!value) {
        // Fallback to French
        value = getNestedValue(translations.fr, key);
      }
      if (!value) return key;

      // Replace {param} placeholders
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value!.replace(`{${k}}`, String(v));
        });
      }
      return value;
    },
    [locale]
  );

  const contextValue = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, t, dir }),
    [locale, setLocale, t, dir]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return ctx;
}
