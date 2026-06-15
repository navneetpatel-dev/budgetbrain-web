import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';
import { useScreenInsets } from '@/shared/hooks/useScreenInsets';
import { useBottomInset } from '@/shared/hooks/useTabBarInset';
import type { CSSProperties, ReactNode } from 'react';

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
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

/** Dashboard metric cards: full-width income/expense, paired goals/net-worth on phone & tablet */
export function SummaryMetricsGrid({
  children, gap: gapProp, style,
}: {
  children: ReactNode; gap?: number; style?: CSSProperties;
}) {
  const { isDesktop, gridGap } = useResponsive();
  const gap = gapProp ?? gridGap;
  const items = Array.isArray(children) ? children : [children];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
      gap,
      ...style,
    }}>
      {items.map((child, i) => (
        <div key={i} style={{ gridColumn: !isDesktop && i < 2 ? '1 / -1' : undefined, minWidth: 0 }}>
          {child}
        </div>
      ))}
    </div>
  );
}

/* ── ScreenLoader ── */

export function ScreenLoader() {
  const theme = useTheme();

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100%', backgroundColor: theme.colors.background,
    }}>
      <div style={{
        width: 40, height: 40,
        borderRadius: '50%',
        border: `3px solid ${theme.colors.primarySoft}`,
        borderTopColor: theme.colors.primary,
        animation: 'spin 0.6s linear infinite',
      }} />
    </div>
  );
}

/* ── ScreenSkeleton ── */

export function ScreenSkeleton({ rows = 4 }: { rows?: number }) {
  const theme = useTheme();
  const { frame } = useScreenInsets();

  return (
    <div style={{
      backgroundColor: theme.colors.background, paddingTop: theme.spacing.lg,
      display: 'flex', flexDirection: 'column', gap: theme.spacing.md,
      ...frame,
    }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 72, borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.surfaceHover, opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}
