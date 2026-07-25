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
  section: 24,
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
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2, textTransform: 'none' as const, fontFamily: 'Inter' },
  amount: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, fontFamily: 'Inter', fontVariantNumeric: 'tabular-nums' },
  amountLg: { fontSize: 32, fontWeight: '700', letterSpacing: -1, fontFamily: 'Fraunces, Georgia, serif', fontVariantNumeric: 'tabular-nums' },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return null;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
}

function getShadows(isDark: boolean, primary: string): ThemeShadows {
  if (isDark) {
    return {
      sm: '0 2px 8px rgba(0, 0, 0, 0.25)',
      md: '0 4px 16px rgba(0, 0, 0, 0.35)',
      lg: '0 8px 28px rgba(0, 0, 0, 0.45)',
    };
  }
  const rgb = hexToRgb(primary) ?? { r: 99, g: 102, b: 241 };
  return {
    sm: `0 2px 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`,
    md: '0 4px 16px rgba(15, 23, 42, 0.08)',
    lg: '0 12px 28px rgba(15, 23, 42, 0.12)',
  };
}

export function buildTheme(
  resolvedMode: 'light' | 'dark',
  accent: AccentPalette,
): AppTheme {
  const isDark = resolvedMode === 'dark';
  const colors = getThemeColors(resolvedMode, accent);
  return {
    mode: resolvedMode,
    accent,
    isDark,
    colors,
    typography,
    spacing,
    radii,
    shadows: getShadows(isDark, colors.primary),
  };
}

export type { ThemeMode, AccentPalette };
