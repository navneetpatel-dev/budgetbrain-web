import { useMemo, useSyncExternalStore } from 'react';

const BREAKPOINTS = {
  tablet: 768,
  largeTablet: 1024,
  desktop: 1280,
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

const DESKTOP = {
  tabBarPaddingX: 24,
  sectionGap: 28,
  stackGap: 16,
  gridGap: 16,
  inlineGap: 10,
  cardPadding: 20,
  tabBarBottomInset: 0,
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
    const isDesktop = width >= BREAKPOINTS.desktop;
    const tokens = isDesktop ? DESKTOP : isLargeTablet ? LARGE_TABLET : isTablet ? TABLET : PHONE;

    return {
      width,
      isTablet,
      isLargeTablet,
      isDesktop,
      isPhone: !isTablet,
      // Cap content width at desktop so it doesn't stretch edge-to-edge on ultra-wide monitors.
      contentMaxWidth: isDesktop ? 1160 : (undefined as number | undefined),
      columns: isDesktop ? 3 : isLargeTablet ? 3 : isTablet ? 2 : 1,
      sidebarWidth: isDesktop ? 260 : 0,
      ...tokens,
      screenPaddingX: tokens.tabBarPaddingX,
      horizontalPadding: tokens.tabBarPaddingX,
    };
  }, [width]);
}

export type LayoutTokens = ReturnType<typeof useResponsive>;
