import React, {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react';
import { TRANSLATIONS, Translations } from '../i18n/translations';
import { getAppSettings, setTheme as persistTheme, setLanguage as persistLanguage } from '../database/settingsRepository';
import { AppLanguage, AppTheme } from '../types';

// ─── Theme Context ────────────────────────────────────────────────────────────
interface ThemeContextValue {
  isDark: boolean;
  theme: AppTheme;
  setTheme: (t: AppTheme) => Promise<void>;
  language: AppLanguage;
  setLanguage: (l: AppLanguage) => Promise<void>;
  t: Translations;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('light');
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    (async () => {
      try {
        const settings = await getAppSettings();
        setThemeState(settings.theme);
        setLanguageState(settings.language as AppLanguage);
      } catch {}
    })();
  }, []);

  const isDark = theme === 'dark';

  const setTheme = useCallback(async (t: AppTheme) => {
    setThemeState(t);
    await persistTheme(t);
  }, []);

  const setLanguage = useCallback(async (l: AppLanguage) => {
    setLanguageState(l);
    await persistLanguage(l);
  }, []);

  const t = TRANSLATIONS[language] ?? TRANSLATIONS['en'];

  return (
    <ThemeContext.Provider value={{ isDark, theme, setTheme, language, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside AppThemeProvider');
  return ctx;
}
