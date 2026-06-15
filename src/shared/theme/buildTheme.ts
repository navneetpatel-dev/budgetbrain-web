import type { AppTheme, ThemeRadii, ThemeShadows, ThemeSpacing, ThemeTypography } from './types';
import { getThemeColors } from './palettes';
import type { AccentPalette, ThemeMode } from './types';

export const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  section: 16,
};

export const radii: ThemeRadii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography: ThemeTypography = {
  display: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, fontFamily: 'Inter' },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, fontFamily: 'Inter' },
  titleSm: { fontSize: 17, fontWeight: '600', fontFamily: 'Inter' },
  body: { fontSize: 16, fontWeight: '400', fontFamily: 'Inter' },
  bodyMedium: { fontSize: 15, fontWeight: '500', fontFamily: 'Inter' },
  bodySemibold: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter' },
  caption: { fontSize: 13, fontWeight: '500', fontFamily: 'Inter' },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' as const, fontFamily: 'Inter' },
  amount: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, fontFamily: 'Inter' },
  amountLg: { fontSize: 32, fontWeight: '800', letterSpacing: -1, fontFamily: 'Inter' },
};

function getShadows(isDark: boolean): ThemeShadows {
  if (isDark) {
    return {
      sm: '0 2px 8px rgba(0, 0, 0, 0.25)',
      md: '0 4px 16px rgba(0, 0, 0, 0.35)',
      lg: '0 8px 28px rgba(0, 0, 0, 0.45)',
    };
  }
  return {
    sm: '0 2px 8px rgba(99, 102, 241, 0.06)',
    md: '0 4px 16px rgba(15, 23, 42, 0.08)',
    lg: '0 12px 28px rgba(15, 23, 42, 0.12)',
  };
}

export function buildTheme(
  resolvedMode: 'light' | 'dark',
  accent: AccentPalette,
): AppTheme {
  const isDark = resolvedMode === 'dark';
  return {
    mode: resolvedMode,
    accent,
    isDark,
    colors: getThemeColors(resolvedMode, accent),
    typography,
    spacing,
    radii,
    shadows: getShadows(isDark),
  };
}

export type { ThemeMode, AccentPalette };
