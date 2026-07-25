import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { useTheme } from '@/shared/theme';
import { useScreenInsets } from '@/shared/hooks/useScreenInsets';

/* ── Shimmer ── */

const SHIMMER_STYLE_ID = 'bb-skeleton-shimmer';

function ensureShimmerStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SHIMMER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = SHIMMER_STYLE_ID;
  style.textContent = `
@keyframes skeleton-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@media (prefers-reduced-motion: reduce) {
  .bb-skeleton-shine { animation: none !important; opacity: 0.35; }
}
`;
  document.head.appendChild(style);
}

export type ListSkeletonVariant =
  | 'transaction'
  | 'budget'
  | 'goal'
  | 'category'
  | 'notification'
  | 'account'
  | 'ticket'
  | 'generic';

export function SkeletonBlock({
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
  useEffect(() => {
    ensureShimmerStyles();
  }, []);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius ?? theme.radii.sm,
        backgroundColor: theme.colors.surfaceHover,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        className="bb-skeleton-shine"
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(105deg, transparent 30%, ${theme.colors.primarySoft} 50%, transparent 70%)`,
          animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
        }}
      />
    </div>
  );
}

export function SkeletonLine({
  width: w = '70%',
  size = 'md',
  style,
}: {
  width?: number | string;
  size?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}) {
  const heights = { sm: 10, md: 14, lg: 20 };
  return <SkeletonBlock width={w} height={heights[size]} style={style} />;
}

export function SkeletonCircle({ size = 40, style }: { size?: number; style?: CSSProperties }) {
  return <SkeletonBlock width={size} height={size} radius={size / 2} style={style} />;
}

function SurfaceCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const theme = useTheme();
  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        border: `1px solid ${theme.colors.borderSubtle}`,
        padding: theme.spacing.lg,
        boxShadow: theme.shadows.sm,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SkeletonScreen({ children, gap }: { children: ReactNode; gap?: number }) {
  const theme = useTheme();
  const { frame } = useScreenInsets();
  return (
    <div style={{ flex: 1, backgroundColor: theme.colors.background, height: '100%', overflow: 'hidden' }}>
      <div
        style={{
          ...frame,
          paddingTop: theme.spacing.lg,
          display: 'flex',
          flexDirection: 'column',
          gap: gap ?? theme.spacing.md,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function SkeletonHeaderBar({ withAction = true }: { withAction?: boolean }) {
  const theme = useTheme();
  return (
    <div style={{ marginBottom: theme.spacing.sm }}>
      <SkeletonBlock width={48} height={10} radius={4} style={{ marginBottom: 10 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <SkeletonBlock width="42%" height={26} radius={8} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="28%" height={12} radius={6} />
        </div>
        {withAction ? <SkeletonBlock width={40} height={40} radius={theme.radii.md} /> : null}
      </div>
    </div>
  );
}

/* ── Content-shaped rows ── */

function TransactionRowSkeleton() {
  const theme = useTheme();
  return (
    <SurfaceCard>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, flex: 1, minWidth: 0 }}>
          <SkeletonBlock width={40} height={40} radius={12} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <SkeletonBlock width="58%" height={14} radius={6} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="38%" height={11} radius={5} />
          </div>
        </div>
        <SkeletonBlock width={64} height={14} radius={6} />
      </div>
    </SurfaceCard>
  );
}

function BudgetRowSkeleton() {
  const theme = useTheme();
  return (
    <SurfaceCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
        <div style={{ flex: 1 }}>
          <SkeletonBlock width="45%" height={15} radius={6} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="30%" height={10} radius={5} />
        </div>
        <SkeletonBlock width={88} height={18} radius={6} />
      </div>
      <SkeletonBlock width="100%" height={8} radius={999} style={{ marginBottom: 8 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonBlock width={56} height={11} radius={5} />
        <SkeletonBlock width={48} height={11} radius={5} />
      </div>
    </SurfaceCard>
  );
}

function GoalRowSkeleton() {
  const theme = useTheme();
  return (
    <SurfaceCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
        <div style={{ flex: 1 }}>
          <SkeletonBlock width="50%" height={15} radius={6} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="36%" height={10} radius={5} />
        </div>
        <SkeletonBlock width={52} height={22} radius={999} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
        <SkeletonBlock width={90} height={20} radius={6} />
        <SkeletonBlock width={70} height={12} radius={5} />
      </div>
      <SkeletonBlock width="100%" height={8} radius={999} style={{ marginBottom: 6 }} />
      <SkeletonBlock width={72} height={11} radius={5} />
    </SurfaceCard>
  );
}

function CategoryRowSkeleton() {
  const theme = useTheme();
  return (
    <SurfaceCard>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, flex: 1 }}>
          <SkeletonCircle size={12} />
          <SkeletonBlock width="42%" height={14} radius={6} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SkeletonBlock width={28} height={28} radius={8} />
          <SkeletonBlock width={28} height={28} radius={8} />
        </div>
      </div>
    </SurfaceCard>
  );
}

function NotificationRowSkeleton() {
  const theme = useTheme();
  return (
    <SurfaceCard>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.md }}>
        <SkeletonCircle size={8} style={{ marginTop: 6 }} />
        <div style={{ flex: 1 }}>
          <SkeletonBlock width="62%" height={14} radius={6} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="88%" height={11} radius={5} style={{ marginBottom: 6 }} />
          <SkeletonBlock width="28%" height={10} radius={5} />
        </div>
      </div>
    </SurfaceCard>
  );
}

function AccountRowSkeleton() {
  const theme = useTheme();
  return (
    <SurfaceCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <SkeletonBlock width="48%" height={15} radius={6} />
        <SkeletonBlock width={56} height={11} radius={5} />
      </div>
      <SkeletonBlock width="32%" height={11} radius={5} style={{ marginBottom: 10 }} />
      <SkeletonBlock width={100} height={20} radius={6} />
    </SurfaceCard>
  );
}

function TicketRowSkeleton() {
  const theme = useTheme();
  return (
    <SurfaceCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <SkeletonBlock width="58%" height={14} radius={6} />
        <SkeletonBlock width={52} height={12} radius={5} />
      </div>
      <SkeletonBlock width="30%" height={11} radius={5} />
    </SurfaceCard>
  );
}

function GenericRowSkeleton() {
  return <SkeletonBlock width="100%" height={72} radius={16} />;
}

function rowForVariant(variant: ListSkeletonVariant) {
  switch (variant) {
    case 'transaction':
      return TransactionRowSkeleton;
    case 'budget':
      return BudgetRowSkeleton;
    case 'goal':
      return GoalRowSkeleton;
    case 'category':
      return CategoryRowSkeleton;
    case 'notification':
      return NotificationRowSkeleton;
    case 'account':
      return AccountRowSkeleton;
    case 'ticket':
      return TicketRowSkeleton;
    default:
      return GenericRowSkeleton;
  }
}

/* ── Screen skeletons ── */

/** Inline list-row placeholders (pagination footers, nested sections). */
export function ListRowsSkeleton({
  count = 2,
  variant = 'generic',
}: {
  count?: number;
  variant?: ListSkeletonVariant;
}) {
  const theme = useTheme();
  const Row = rowForVariant(variant);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, padding: `${theme.spacing.md}px 0` }}>
      {Array.from({ length: count }).map((_, i) => (
        <Row key={i} />
      ))}
    </div>
  );
}

/** Prefer embedding under a real page header. `showHeader` is for rare full-page fallbacks. */
export function ListSkeleton({
  count = 4,
  variant = 'generic',
  showHeader = false,
}: {
  count?: number;
  variant?: ListSkeletonVariant;
  showHeader?: boolean;
}) {
  const theme = useTheme();
  const Row = rowForVariant(variant);
  const rows = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
      {Array.from({ length: count }).map((_, i) => (
        <Row key={i} />
      ))}
    </div>
  );

  if (!showHeader) return rows;
  return (
    <SkeletonScreen>
      <SkeletonHeaderBar withAction={variant !== 'notification'} />
      {rows}
    </SkeletonScreen>
  );
}

export function ScreenSkeleton({ rows = 4 }: { rows?: number }) {
  return <ListSkeleton count={rows} variant="generic" showHeader />;
}

/** Dashboard body only — keep `DashboardHero` mounted while loading. */
export function DashboardContentSkeleton() {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SurfaceCard key={i} style={{ padding: theme.spacing.md }}>
            <SkeletonBlock width={28} height={28} radius={8} style={{ marginBottom: 12 }} />
            <SkeletonBlock width="50%" height={11} radius={5} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="70%" height={18} radius={6} />
          </SurfaceCard>
        ))}
      </div>
      <div>
        <SkeletonBlock width={160} height={14} radius={6} style={{ marginBottom: 12 }} />
        <SurfaceCard>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ marginBottom: i < 3 ? theme.spacing.md : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <SkeletonBlock width="40%" height={12} radius={5} />
                <SkeletonBlock width={48} height={12} radius={5} />
              </div>
              <SkeletonBlock width="100%" height={6} radius={999} />
            </div>
          ))}
        </SurfaceCard>
      </div>
      <div>
        <SkeletonBlock width={140} height={14} radius={6} style={{ marginBottom: 12 }} />
        <SurfaceCard>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: `${theme.spacing.md}px 0`,
                borderBottom: i < 2 ? `1px solid ${theme.colors.borderSubtle}` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <SkeletonBlock width="45%" height={14} radius={6} />
                <SkeletonBlock width={36} height={12} radius={5} />
              </div>
              <SkeletonBlock width="100%" height={8} radius={999} style={{ marginBottom: 6 }} />
              <SkeletonBlock width="55%" height={11} radius={5} />
            </div>
          ))}
        </SurfaceCard>
      </div>
      <div>
        <SkeletonBlock width={150} height={14} radius={6} style={{ marginBottom: 12 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ marginBottom: theme.spacing.sm }}>
            <TransactionRowSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  const theme = useTheme();
  const { frame } = useScreenInsets();
  return (
    <div style={{ flex: 1, backgroundColor: theme.colors.background, height: '100%', overflow: 'hidden' }}>
      <div
        style={{
          padding: `${theme.spacing.xl}px ${theme.spacing.lg}px`,
          background: `linear-gradient(135deg, ${theme.colors.primary}22, ${theme.colors.gradientEnd}18)`,
        }}
      >
        <SkeletonBlock width={120} height={12} radius={6} style={{ marginBottom: 14 }} />
        <SkeletonBlock width="55%" height={28} radius={8} style={{ marginBottom: 10 }} />
        <SkeletonBlock width={160} height={36} radius={10} style={{ marginBottom: 8 }} />
        <SkeletonBlock width={100} height={12} radius={6} />
      </div>
      <div style={{ ...(frame as CSSProperties), paddingTop: theme.spacing.lg }}>
        <DashboardContentSkeleton />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.lg, gap: 10 }}>
        <SkeletonBlock width={72} height={12} radius={5} />
        <SkeletonBlock width={140} height={40} radius={10} />
        <SkeletonBlock width={100} height={12} radius={5} />
      </div>
      <SurfaceCard style={{ padding: 0, overflow: 'hidden' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
              borderBottom: i < 3 ? `1px solid ${theme.colors.borderSubtle}` : 'none',
            }}
          >
            <SkeletonBlock width="30%" height={12} radius={5} />
            <SkeletonBlock width="40%" height={14} radius={6} />
          </div>
        ))}
      </SurfaceCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
        <SkeletonBlock width="100%" height={50} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={50} radius={theme.radii.md} />
      </div>
    </SkeletonScreen>
  );
}

export function SettingsSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen gap={theme.spacing.lg}>
      <SurfaceCard style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.xl }}>
        <SkeletonCircle size={64} />
        <div style={{ flex: 1 }}>
          <SkeletonBlock width="48%" height={18} radius={6} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="62%" height={12} radius={5} style={{ marginBottom: 6 }} />
          <SkeletonBlock width="30%" height={11} radius={5} />
        </div>
      </SurfaceCard>
      <SurfaceCard>
        <SkeletonBlock width={80} height={12} radius={5} style={{ marginBottom: 14 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 0',
              borderBottom: i < 3 ? `1px solid ${theme.colors.borderSubtle}` : 'none',
            }}
          >
            <SkeletonBlock width={36} height={36} radius={10} />
            <SkeletonBlock width="50%" height={13} radius={6} />
          </div>
        ))}
      </SurfaceCard>
      <SurfaceCard>
        <SkeletonBlock width={100} height={12} radius={5} style={{ marginBottom: 14 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} width={72} height={32} radius={999} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCircle key={i} size={36} />
          ))}
        </div>
      </SurfaceCard>
      <SurfaceCard>
        <SkeletonBlock width={90} height={12} radius={5} style={{ marginBottom: 14 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 0',
              borderBottom: i < 2 ? `1px solid ${theme.colors.borderSubtle}` : 'none',
            }}
          >
            <SkeletonBlock width={36} height={36} radius={10} />
            <SkeletonBlock width="45%" height={13} radius={6} />
          </div>
        ))}
      </SurfaceCard>
    </SkeletonScreen>
  );
}

/** Content-only — keep real stack header mounted while loading. */
export function NetWorthSkeleton() {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
      <div
        style={{
          borderRadius: theme.radii.xl,
          padding: theme.spacing.xl,
          background: `linear-gradient(135deg, ${theme.colors.primary}28, ${theme.colors.gradientEnd}22)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <SkeletonBlock width={80} height={11} radius={5} />
        <SkeletonBlock width={160} height={36} radius={10} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SurfaceCard key={i} style={{ padding: theme.spacing.md }}>
            <SkeletonBlock width={28} height={28} radius={8} style={{ marginBottom: 12 }} />
            <SkeletonBlock width="55%" height={11} radius={5} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="70%" height={16} radius={6} />
          </SurfaceCard>
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <AccountRowSkeleton key={i} />
      ))}
    </div>
  );
}

/** Content-only — keep real stack header mounted while loading. */
export function FamilySkeleton() {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
      {Array.from({ length: 2 }).map((_, i) => (
        <SurfaceCard key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <SkeletonCircle size={44} />
            <div style={{ flex: 1 }}>
              <SkeletonBlock width="50%" height={15} radius={6} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="70%" height={12} radius={5} />
            </div>
          </div>
        </SurfaceCard>
      ))}
      <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
        <SkeletonBlock width="50%" height={48} radius={theme.radii.md} />
        <SkeletonBlock width="50%" height={48} radius={theme.radii.md} />
      </div>
    </div>
  );
}

/** Content-only — keep real stack header mounted while loading. */
export function SupportSkeleton() {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
      <SurfaceCard>
        <SkeletonBlock width={90} height={12} radius={5} style={{ marginBottom: 14 }} />
        <SkeletonBlock width="100%" height={48} radius={theme.radii.md} style={{ marginBottom: 12 }} />
        <SkeletonBlock width="100%" height={96} radius={theme.radii.md} style={{ marginBottom: 14 }} />
        <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
      </SurfaceCard>
      {Array.from({ length: 3 }).map((_, i) => (
        <TicketRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function SubscriptionSkeleton() {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <SurfaceCard key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <SkeletonBlock width="40%" height={18} radius={6} />
            <SkeletonBlock width={72} height={18} radius={6} />
          </div>
          <SkeletonBlock width="100%" height={14} radius={5} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="70%" height={12} radius={5} style={{ marginBottom: 16 }} />
          <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
        </SurfaceCard>
      ))}
    </div>
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
    <div
      style={{
        height: '100%',
        backgroundColor: theme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: theme.spacing.xl,
      }}
    >
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

function ChatUserBubbleSkeleton({ width, height = 40 }: { width: number | string; height?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <SkeletonBlock
        width={width}
        height={height}
        radius={18}
        style={{ borderBottomRightRadius: 6, maxWidth: '82%' }}
      />
    </div>
  );
}

function ChatAssistantBubbleSkeleton({
  width,
  height = 56,
}: {
  width: number | string;
  height?: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '100%' }}>
      <SkeletonCircle size={28} />
      <SkeletonBlock
        width={width}
        height={height}
        radius={18}
        style={{ borderBottomLeftRadius: 6, maxWidth: '82%' }}
      />
    </div>
  );
}

/** Content-only chat body — keep real chat header mounted while loading. */
export function AiChatSkeleton() {
  const theme = useTheme();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: theme.spacing.md, paddingTop: theme.spacing.sm }}>
        <ChatUserBubbleSkeleton width="62%" height={40} />
        <ChatAssistantBubbleSkeleton width="78%" height={72} />
        <ChatUserBubbleSkeleton width="48%" height={40} />
        <ChatAssistantBubbleSkeleton width="84%" height={96} />
        <ChatUserBubbleSkeleton width="56%" height={40} />
        <ChatAssistantBubbleSkeleton width="70%" height={64} />
      </div>

      <div style={{ paddingTop: theme.spacing.md, paddingBottom: theme.spacing.lg, display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <SkeletonBlock width={132} height={32} radius={999} />
          <SkeletonBlock width={118} height={32} radius={999} />
          <SkeletonBlock width={148} height={32} radius={999} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <SkeletonBlock width="100%" height={48} radius={22} />
          </div>
          <SkeletonCircle size={44} />
        </div>
      </div>
    </div>
  );
}
