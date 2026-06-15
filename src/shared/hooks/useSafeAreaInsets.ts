import { useMemo } from 'react';

/** Web safe-area helper — pairs with viewport-fit=cover in index.html */
export function useSafeAreaInsets() {
  return useMemo(
    () => ({
      paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)',
      paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)',
      paddingLeft: 'max(env(safe-area-inset-left, 0px), 0px)',
      paddingRight: 'max(env(safe-area-inset-right, 0px), 0px)',
    }),
    [],
  );
}

/** Phone auth hero — room for brand cluster + ticker */
export function useAuthHeroHeight() {
  return 'clamp(192px, 27dvh, 224px)';
}
