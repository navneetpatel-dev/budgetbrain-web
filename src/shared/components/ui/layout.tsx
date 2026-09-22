'use client';

import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';
import { useScreenInsets } from '@/shared/hooks/useScreenInsets';
import { useBottomInset } from '@/shared/hooks/useTabBarInset';
import { Children, type CSSProperties, type ReactNode } from 'react';
import { ScreenSkeleton as ContentScreenSkeleton } from './skeleton';

export { ScreenSkeleton } from './skeleton';

type ScreenInset = 'tab' | 'stack' | 'none';

export function ScreenWrapper({
  header, children, inset = 'tab', scroll = true, contentContainerStyle, style,
}: {
  header?: ReactNode; children: ReactNode; inset?: ScreenInset;
  scroll?: boolean; contentContainerStyle?: CSSProperties; style?: CSSProperties;
}) {
  const theme = useTheme();
  const { frame, sectionGap } = useScreenInsets();
  const bottomPadding = useBottomInset(inset);
  const contentGap = sectionGap;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: theme.colors.background, ...style }}>
      {header}
      {scroll ? (
        <div style={{
          flex: 1, overflowY: 'auto',
          ...frame,
          paddingTop: theme.spacing.md,
          paddingBottom: bottomPadding,
          ...contentContainerStyle,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: contentGap }}>
            {children}
          </div>
        </div>
      ) : (
        <div style={{
          flex: 1,
          ...frame,
          paddingTop: theme.spacing.md,
          paddingBottom: bottomPadding,
          ...contentContainerStyle,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── ResponsiveGrid ── */

export function ResponsiveGrid({
  children, columns: colsProp, gap: gapProp, style,
}: {
  children: ReactNode; columns?: number; gap?: number; style?: CSSProperties;
}) {
  const { columns: defaultCols, gridGap } = useResponsive();
  const cols = colsProp ?? defaultCols;
  const gap = gapProp ?? gridGap;

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap,
      ...style,
    }}>
      {Array.isArray(children) ? children.map((child, i) => (
        <div key={i} style={{
          flexGrow: 1,
          flexShrink: 0,
          flexBasis: cols === 1 ? '100%' : cols === 2 ? `calc((100% - ${gap}px) / 2)` : `calc((100% - ${gap * 2}px) / 3)`,
          minWidth: cols === 1 ? '100%' : cols === 2 ? `calc((100% - ${gap}px) / 2)` : `calc((100% - ${gap * 2}px) / 3)`,
          maxWidth: cols === 1 ? '100%' : cols === 2 ? `calc((100% - ${gap}px) / 2)` : `calc((100% - ${gap * 2}px) / 3)`,
        }}>
          {child}
        </div>
      )) : children}
    </div>
  );
}

/** Dashboard metric cards — equal-height cells in a 2×2 (phone) or 4-col (desktop) grid. */
export function SummaryMetricsGrid({
  children, gap: gapProp, style,
}: {
  children: ReactNode; gap?: number; style?: CSSProperties;
}) {
  const { isDesktop, gridGap } = useResponsive();
  const gap = gapProp ?? gridGap;
  const items = Children.toArray(children);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
      gap,
      alignItems: 'stretch',
      ...style,
    }}>
      {items.map((child, i) => (
        <div key={i} style={{ minWidth: 0, display: 'flex', height: '100%' }}>
          {child}
        </div>
      ))}
    </div>
  );
}

/* ── ScreenLoader ── */

/** @deprecated Prefer content skeletons (ListSkeleton, DashboardSkeleton, etc.). */
export function ScreenLoader() {
  return <ContentScreenSkeleton rows={5} />;
}
