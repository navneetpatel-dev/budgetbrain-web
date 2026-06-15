import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/shared/store/hooks';
import { buildTheme } from './buildTheme';
import { resolveAccent, resolveThemeMode } from './palettes';
import type { AppTheme } from './types';

const ThemeContext = createContext<AppTheme | null>(null);

function useSystemColorScheme(): 'light' | 'dark' {
  const [scheme, setScheme] = useState<'light' | 'dark'>(
    () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setScheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return scheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const themeMode = resolveThemeMode(useAppSelector((s) => s.settings.theme));
  const accent = resolveAccent(useAppSelector((s) => s.settings.accent));

  const theme = useMemo(() => {
    const resolved =
      themeMode === 'system' ? systemScheme : themeMode;
    return buildTheme(resolved, accent);
  }, [themeMode, accent, systemScheme]);

  useEffect(() => {
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text;
    document.documentElement.style.colorScheme = theme.isDark ? 'dark' : 'light';
  }, [theme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return buildTheme('light', 'indigo');
  }
  return ctx;
}
