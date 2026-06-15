import { useMemo } from 'react';
import { useTheme } from '@/shared/theme';
import { useResponsive } from './useResponsive';

const TAB_BAR_BODY = 84;
const FAB_OVERFLOW = 36;
const TAB_BAR_EXTRA = 16;

/** Bottom padding to clear the floating tab bar (mobile/tablet only). */
export function useTabBarInset() {
  const { isDesktop, tabBarBottomInset } = useResponsive();

  return useMemo(() => {
    if (isDesktop) return 32;
    return tabBarBottomInset + TAB_BAR_BODY + FAB_OVERFLOW + TAB_BAR_EXTRA;
  }, [isDesktop, tabBarBottomInset]);
}

export function useBottomInset(inset: 'tab' | 'stack' | 'none' = 'tab') {
  const theme = useTheme();
  const tabInset = useTabBarInset();

  return useMemo(() => {
    if (inset === 'none') return theme.spacing.lg;
    if (inset === 'stack') return theme.spacing.xxl;
    return tabInset;
  }, [inset, tabInset, theme.spacing.lg, theme.spacing.xxl]);
}
