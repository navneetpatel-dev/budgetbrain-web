'use client';

import { useMemo } from 'react';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';

/** Matches the floating tab bar bottom margin rhythm on mobile. */
export function useFloatingBlockGap() {
  const { tabBarBottomInset } = useResponsive();
  return Math.max(0, tabBarBottomInset);
}

const TAB_BAR_BODY = 84;
const FAB_OVERFLOW = 36;
const TAB_BAR_EXTRA = 16;

/** Bottom padding to clear the floating tab bar (mobile/tablet only). */
export function useTabBarInset(): number | string {
  const { isDesktop, tabBarBottomInset } = useResponsive();

  return useMemo(() => {
    if (isDesktop) return 32;
    const base = tabBarBottomInset + TAB_BAR_BODY + FAB_OVERFLOW + TAB_BAR_EXTRA;
    return `calc(${base}px + env(safe-area-inset-bottom, 0px))`;
  }, [isDesktop, tabBarBottomInset]);
}

export function useBottomInset(inset: 'tab' | 'stack' | 'none' = 'tab'): number | string {
  const theme = useTheme();
  const tabInset = useTabBarInset();

  return useMemo(() => {
    if (inset === 'none') return theme.spacing.lg;
    if (inset === 'stack') {
      return `calc(${theme.spacing.xxl}px + env(safe-area-inset-bottom, 0px))`;
    }
    return tabInset;
  }, [inset, tabInset, theme.spacing.lg, theme.spacing.xxl]);
}