export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentPalette = 'indigo' | 'emerald' | 'ocean' | 'rose' | 'violet';

export interface ThemeColors {
  primary: string;
  primaryMuted: string;
  primarySoft: string;
  onPrimary: string;
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  gradientStart: string;
  gradientEnd: string;
  tabBar: string;
  tabBarBorder: string;
  overlay: string;
  inputBg: string;
}

export interface ThemeTypography {
  display: { fontSize: number; fontWeight: string; letterSpacing: number; fontFamily?: string; lineHeight?: number };
  title: { fontSize: number; fontWeight: string; letterSpacing: number; fontFamily?: string; lineHeight?: number };
  titleSm: { fontSize: number; fontWeight: string; fontFamily?: string; lineHeight?: number };
  body: { fontSize: number; fontWeight: string; fontFamily?: string; lineHeight?: number };
  bodyMedium: { fontSize: number; fontWeight: string; fontFamily?: string; lineHeight?: number };
  bodySemibold: { fontSize: number; fontWeight: string; fontFamily?: string; lineHeight?: number };
  caption: { fontSize: number; fontWeight: string; fontFamily?: string; lineHeight?: number };
  label: { fontSize: number; fontWeight: string; letterSpacing: number; textTransform: 'none' | 'uppercase'; fontFamily?: string; lineHeight?: number };
  amount: { fontSize: number; fontWeight: string; letterSpacing: number; fontFamily?: string; fontVariantNumeric?: string; lineHeight?: number };
  amountLg: { fontSize: number; fontWeight: string; letterSpacing: number; fontFamily?: string; fontVariantNumeric?: string; lineHeight?: number };
}

/** Icon size scale (px) — consumed by AppIcon's `size` convenience prop. */
export interface ThemeIconSizes {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

/** Motion tokens — durations in ms, easing as a cubic-bezier tuple for Framer Motion. */
export interface ThemeMotion {
  duration: {
    fast: number;
    base: number;
    slow: number;
  };
  easing: [number, number, number, number];
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  section: number;
}

export interface ThemeRadii {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
}

export interface AppTheme {
  mode: 'light' | 'dark';
  accent: AccentPalette;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  iconSizes: ThemeIconSizes;
  motion: ThemeMotion;
  isDark: boolean;
}
