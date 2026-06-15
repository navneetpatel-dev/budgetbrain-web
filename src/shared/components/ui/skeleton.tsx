import { useTheme } from '@/shared/theme';
import { useScreenInsets } from '@/shared/hooks/useScreenInsets';
import type { CSSProperties } from 'react';

/* ── Shimmer Animation ── */

const shimmerKeyframes = `
@keyframes skeleton-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
`;

const shimmerStyle: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'var(--skeleton-bg)',
};

function SkeletonBlock({
  width = '100%',
  height = 16,
  radius,
  style,
}: {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: CSSProperties;
}) {
  const theme = useTheme();
  const bgColor = theme.colors.surfaceHover;
  const shimmerColor = theme.colors.primarySoft;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius ?? theme.radii.sm,
        backgroundColor: bgColor,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%)`,
          animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        }}
      />
    </div>
  );
}

function SkeletonLine({ width: w = '70%', size = 'md', style }: { width?: number | string; size?: 'sm' | 'md' | 'lg'; style?: CSSProperties }) {
  const heights = { sm: 10, md: 14, lg: 20 };
  return <SkeletonBlock width={w} height={heights[size]} style={style} />;
}

function SkeletonCircle({ size = 40, style }: { size?: number; style?: CSSProperties }) {
  return <SkeletonBlock width={size} height={size} radius={size / 2} style={style} />;
}

function SkeletonCard({ height = 72, style }: { height?: number; style?: CSSProperties }) {
  const theme = useTheme();
  return <SkeletonBlock width="100%" height={height} radius={theme.radii.lg} style={style} />;
}

/* ── Screen Skeletons ── */

function SkeletonScreen({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { frame } = useScreenInsets();
  return (
    <div style={{ flex: 1, backgroundColor: theme.colors.background, height: '100%' }}>
      <div style={{
        ...frame,
        paddingTop: theme.spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.md,
      }}>
        {children}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  const theme = useTheme();
  const { frame } = useScreenInsets();
  return (
    <div style={{ flex: 1, backgroundColor: theme.colors.background, height: '100%', overflow: 'hidden' }}>
      <SkeletonBlock width="100%" height={140} style={{ borderRadius: 0 }} />
      <div style={{ ...(frame as CSSProperties), paddingTop: theme.spacing.lg, display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}><SkeletonCard height={90} /></div>
          <div style={{ flex: 1 }}><SkeletonCard height={90} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}><SkeletonCard height={90} /></div>
          <div style={{ flex: 1 }}><SkeletonCard height={90} /></div>
        </div>
        <SkeletonBlock width="100%" height={160} radius={theme.radii.lg} />
        <SkeletonBlock width="100%" height={120} radius={theme.radii.lg} />
        <SkeletonBlock width="100%" height={200} radius={theme.radii.lg} />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  const theme = useTheme();
  return (
    <SkeletonScreen>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={68} />
      ))}
    </SkeletonScreen>
  );
}

export function DetailSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.xl }}>
        <SkeletonBlock width={120} height={40} radius={8} />
      </div>
      <SkeletonBlock width="100%" height={180} radius={theme.radii.lg} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
        <SkeletonBlock width="100%" height={50} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={50} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={50} radius={theme.radii.md} />
      </div>
    </SkeletonScreen>
  );
}

export function SettingsSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen>
      <SkeletonBlock width="100%" height={140} radius={theme.radii.lg} />
      <SkeletonBlock width="100%" height={120} radius={theme.radii.lg} />
      <SkeletonBlock width="100%" height={300} radius={theme.radii.lg} />
      <SkeletonBlock width="100%" height={140} radius={theme.radii.lg} />
    </SkeletonScreen>
  );
}

export function OnboardingSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen>
      <SkeletonLine width="40%" size="lg" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
        <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={100} radius={theme.radii.lg} />
      </div>
    </SkeletonScreen>
  );
}

export function ColdStartSkeleton() {
  const theme = useTheme();
  return (
    <div style={{ height: '100%', backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: theme.spacing.xl }}>
      <SkeletonCircle size={80} />
      <SkeletonBlock width={180} height={28} radius={8} />
      <SkeletonBlock width={240} height={16} radius={6} />
      <div style={{ width: '100%', maxWidth: 320 }}>
        <SkeletonBlock width="100%" height={50} radius={12} style={{ marginBottom: 12 }} />
        <SkeletonBlock width="100%" height={50} radius={12} style={{ marginBottom: 24 }} />
        <SkeletonBlock width="100%" height={52} radius={14} />
      </div>
    </div>
  );
}
