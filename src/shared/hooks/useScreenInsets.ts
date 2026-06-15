import { useMemo } from 'react';
import { useTheme } from '@/shared/theme';
import { useResponsive } from './useResponsive';

export function useScreenInsets() {
  const { tabBarPaddingX, contentMaxWidth, sectionGap, stackGap } = useResponsive();

  return useMemo(
    () => ({
      paddingHorizontal: tabBarPaddingX,
      contentMaxWidth,
      sectionGap,
      stackGap,
      paddingX: {
        paddingLeft: tabBarPaddingX,
        paddingRight: tabBarPaddingX,
      } as React.CSSProperties,
      frame: {
        paddingLeft: tabBarPaddingX,
        paddingRight: tabBarPaddingX,
        width: '100%',
        maxWidth: contentMaxWidth ?? '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
      } as React.CSSProperties,
    }),
    [tabBarPaddingX, contentMaxWidth, sectionGap, stackGap],
  );
}

export function useScreenHeaderStyle() {
  const theme = useTheme();
  const { frame, stackGap } = useScreenInsets();

  return useMemo(
    () => ({
      ...frame,
      paddingTop: theme.spacing.md,
      paddingBottom: stackGap,
    }),
    [theme, frame, stackGap],
  );
}
