import type { CSSProperties } from 'react';
import type { AppTheme } from './types';

/** Theme-backed text styles — prefer these over hardcoding Inter/sizes. */
export function textStyle(
  theme: AppTheme,
  variant: keyof AppTheme['typography'],
  extras: CSSProperties = {},
): CSSProperties {
  const t = theme.typography[variant];
  return {
    fontFamily: t.fontFamily ? `${t.fontFamily}, Inter, sans-serif` : 'Inter, sans-serif',
    fontSize: t.fontSize,
    fontWeight: Number(t.fontWeight),
    letterSpacing: 'letterSpacing' in t ? t.letterSpacing : undefined,
    fontVariantNumeric: 'fontVariantNumeric' in t ? t.fontVariantNumeric : undefined,
    margin: 0,
    ...extras,
  };
}

export function bodyMedium(theme: AppTheme, color?: string): CSSProperties {
  return textStyle(theme, 'bodyMedium', { color: color ?? theme.colors.text, fontWeight: 600 });
}

export function caption(theme: AppTheme, color?: string): CSSProperties {
  return textStyle(theme, 'caption', { color: color ?? theme.colors.textTertiary });
}

export function amountText(theme: AppTheme, color?: string): CSSProperties {
  return textStyle(theme, 'amount', {
    color: color ?? theme.colors.text,
    fontVariantNumeric: 'tabular-nums',
  });
}
