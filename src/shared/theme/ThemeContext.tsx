'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/shared/store/hooks';
import { buildTheme } from './buildTheme';
import { DEFAULT_ACCENT, resolveAccent, resolveThemeMode } from './palettes';
import type { AppTheme } from './types';

const ThemeContext = createContext<AppTheme | null>(null);

function useSystemColorScheme(): 'light' | 'dark' {
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setScheme(mq.matches ? 'dark' : 'light');
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
    const root = document.documentElement;
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text;
    root.style.colorScheme = theme.isDark ? 'dark' : 'light';
    root.style.setProperty('--bb-bg', theme.colors.background);
    root.style.setProperty('--bb-bg-elevated', theme.colors.backgroundElevated);
    root.style.setProperty('--bb-text', theme.colors.text);
    root.style.setProperty('--bb-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--bb-text-tertiary', theme.colors.textTertiary);
    root.style.setProperty('--bb-primary', theme.colors.primary);
    root.style.setProperty('--bb-primary-muted', theme.colors.primaryMuted);
    root.style.setProperty('--bb-primary-soft', theme.colors.primarySoft);
    root.style.setProperty('--bb-on-primary', theme.colors.onPrimary);
    root.style.setProperty('--bb-primary-container', theme.colors.primaryContainer);
    root.style.setProperty('--bb-border', theme.colors.border);
    root.style.setProperty('--bb-border-subtle', theme.colors.borderSubtle);
    root.style.setProperty('--bb-input-bg', theme.colors.inputBg);
    root.style.setProperty('--bb-surface', theme.colors.surface);
    root.style.setProperty('--bb-surface-container', theme.colors.surfaceContainer);
    root.style.setProperty('--bb-surface-container-low', theme.colors.surfaceContainerLow);
    root.style.setProperty('--bb-surface-container-high', theme.colors.surfaceContainerHigh);
    root.style.setProperty('--bb-surface-container-highest', theme.colors.surfaceContainerHighest);
    root.style.setProperty('--bb-surface-elevated', theme.colors.surfaceElevated);
    root.style.setProperty('--bb-surface-bright', theme.colors.surfaceBright);
    root.style.setProperty('--bb-surface-hover', theme.colors.surfaceHover);
    root.style.setProperty('--bb-secondary', theme.colors.secondary);
    root.style.setProperty('--bb-secondary-fixed', theme.colors.secondaryFixed);
    root.style.setProperty('--bb-secondary-container', theme.colors.secondaryContainer);
    root.style.setProperty('--bb-violet', theme.colors.violet);
    root.style.setProperty('--bb-rose', theme.colors.rose);
    root.style.setProperty('--bb-emerald', theme.colors.emerald);
    root.style.setProperty('--bb-ocean', theme.colors.ocean);
    root.style.setProperty('--bb-gradient-start', theme.colors.gradientStart);
    root.style.setProperty('--bb-gradient-end', theme.colors.gradientEnd);
    root.style.setProperty('--bb-tab-bar', theme.colors.tabBar);
    root.style.setProperty('--bb-tab-bar-border', theme.colors.tabBarBorder);
    root.style.setProperty('--bb-overlay', theme.colors.overlay);
    root.style.setProperty('--bb-success', theme.colors.success);
    root.style.setProperty('--bb-success-soft', theme.colors.successSoft);
    root.style.setProperty('--bb-danger', theme.colors.danger);
    root.style.setProperty('--bb-danger-soft', theme.colors.dangerSoft);
    root.style.setProperty('--bb-warning', theme.colors.warning);
    root.style.setProperty('--bb-warning-soft', theme.colors.warningSoft);
  }, [theme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return buildTheme('light', DEFAULT_ACCENT);
  }
  return ctx;
}
