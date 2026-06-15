import { useMemo, useSyncExternalStore } from 'react';

const BREAKPOINTS = {
  tablet: 768,
  largeTablet: 1024,
} as const;

const PHONE = {
  tabBarPaddingX: 10,
  sectionGap: 16,
  stackGap: 10,
  gridGap: 10,
  inlineGap: 6,
  cardPadding: 16,
  tabBarBottomInset: 8,
} as const;

const TABLET = {
  tabBarPaddingX: 14,
  sectionGap: 20,
  stackGap: 12,
  gridGap: 12,
  inlineGap: 8,
  cardPadding: 18,
  tabBarBottomInset: 12,
} as const;

const LARGE_TABLET = {
  tabBarPaddingX: 16,
  sectionGap: 24,
  stackGap: 14,
  gridGap: 14,
  inlineGap: 8,
  cardPadding: 20,
  tabBarBottomInset: 12,
} as const;

function subscribe(cb: () => void) {
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
}

function getSnapshot() {
  return window.innerWidth;
}

export function useResponsive() {
  const width = useSyncExternalStore(subscribe, getSnapshot);

  return useMemo(() => {
    const isTablet = width >= BREAKPOINTS.tablet;
    const isLargeTablet = width >= BREAKPOINTS.largeTablet;
    const tokens = isLargeTablet ? LARGE_TABLET : isTablet ? TABLET : PHONE;

    return {
      width,
      isTablet,
      isLargeTablet,
      isPhone: !isTablet,
      contentMaxWidth: (isLargeTablet ? 840 : isTablet ? 720 : undefined) as number | undefined,
      columns: isLargeTablet ? 3 : isTablet ? 2 : 1,
      ...tokens,
      screenPaddingX: tokens.tabBarPaddingX,
      horizontalPadding: tokens.tabBarPaddingX,
    };
  }, [width]);
}

export type LayoutTokens = ReturnType<typeof useResponsive>;
