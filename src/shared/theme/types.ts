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
  display: { fontSize: number; fontWeight: string; letterSpacing: number; fontFamily?: string };
  title: { fontSize: number; fontWeight: string; letterSpacing: number; fontFamily?: string };
  titleSm: { fontSize: number; fontWeight: string; fontFamily?: string };
  body: { fontSize: number; fontWeight: string; fontFamily?: string };
  bodyMedium: { fontSize: number; fontWeight: string; fontFamily?: string };
  bodySemibold: { fontSize: number; fontWeight: string; fontFamily?: string };
  caption: { fontSize: number; fontWeight: string; fontFamily?: string };
  label: { fontSize: number; fontWeight: string; letterSpacing: number; textTransform: 'none' | 'uppercase'; fontFamily?: string };
  amount: { fontSize: number; fontWeight: string; letterSpacing: number; fontFamily?: string; fontVariantNumeric?: string };
  amountLg: { fontSize: number; fontWeight: string; letterSpacing: number; fontFamily?: string; fontVariantNumeric?: string };
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
  isDark: boolean;
}
