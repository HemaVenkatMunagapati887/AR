import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './strings/en.json';
import hi from './strings/hi.json';
import sat from './strings/sat.json';
import { LanguageCode } from '../types/models';

type StringTable = Record<string, string>;
const TABLES: Record<LanguageCode, StringTable> = { en, hi, sat };

export const SUPPORTED_LANGUAGES: LanguageCode[] = ['en', 'hi', 'sat'];
const STORAGE_KEY = 'selected_language';

interface LocalizationContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, ...args: (string | number)[]) => string;
  isDraftLanguage: (lang: LanguageCode) => boolean;
}

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
  }, []);

  const t = useCallback(
    (key: string, ...args: (string | number)[]) => {
      const table = TABLES[language] ?? TABLES.en;
      // Falls back to English so a missing or not-yet-reviewed Santali string
      // never shows a raw key to the worker.
      let value = table[key] ?? TABLES.en[key] ?? key;
      args.forEach((arg, i) => {
        value = value.replace(`{${i}}`, String(arg));
      });
      return value;
    },
    [language]
  );

  const isDraftLanguage = useCallback((lang: LanguageCode) => lang === 'sat', []);

  const value = useMemo(() => ({ language, setLanguage, t, isDraftLanguage }), [language, setLanguage, t, isDraftLanguage]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const ctx = useContext(LocalizationContext);
  if (!ctx) throw new Error('useLocalization must be used within a LocalizationProvider');
  return ctx;
}

export async function loadPersistedLanguage(): Promise<LanguageCode | null> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored && SUPPORTED_LANGUAGES.includes(stored as LanguageCode) ? (stored as LanguageCode) : null;
}
