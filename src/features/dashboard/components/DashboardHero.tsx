import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppIcon, type AppIconName } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { useCountUp } from '@/shared/hooks/useCountUp';
import { formatCurrency } from '@/shared/utils/currency';
import { SkeletonBlock } from '@/shared/components/ui/skeleton';

type QuickAction = { label: string; icon: AppIconName; href: string };

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Expense', icon: 'receipt', href: '/expense/add' },
  { label: 'Income', icon: 'income', href: '/income/add' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export function DashboardHero({
  name,
  amount,
  currency,
  savingsRate,
  loading = false,
}: {
  name: string;
  amount: number;
  currency: string;
  savingsRate?: number;
  loading?: boolean;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { tabBarPaddingX, inlineGap, contentMaxWidth, isDesktop } = useResponsive();
  const reducedMotion = useReducedMotion();
  const animatedAmount = useCountUp(amount);
  const initial = name[0]?.toUpperCase() ?? '?';

  const heroStyle = useMemo(() => ({
    position: 'relative' as const,
    overflow: 'hidden',
    paddingTop: isDesktop ? 28 : 16,
    paddingBottom: theme.spacing.lg,
    paddingLeft: tabBarPaddingX,
    paddingRight: tabBarPaddingX,
    borderBottomLeftRadius: theme.radii.xl,
    borderBottomRightRadius: theme.radii.xl,
    maxWidth: contentMaxWidth ?? '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
  }), [theme, tabBarPaddingX, contentMaxWidth, isDesktop]);

  return (
    <div style={heroStyle}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.primary}, ${theme.colors.gradientEnd})`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: theme.spacing.sm }}>
          <span style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: 0.2, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>
            Good {getGreeting()}
          </span>
          <span style={{ display: 'block', color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: -0.4, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
            {name}
          </span>
        </div>
        <button
          onClick={() => navigate('/settings')}
          style={{
            width: 40, height: 40, borderRadius: 20, border: '1px solid rgba(255,255,255,0.28)',
            backgroundColor: 'rgba(255,255,255,0.16)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Open profile"
        >
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>{initial}</span>
        </button>
      </div>

      <div
        style={{
          position: 'relative',
          animation: reducedMotion ? undefined : 'bb-fade-up 0.38s ease both',
        }}
      >
        <span style={{ display: 'block', color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: 600, letterSpacing: 0.2, fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
          Net savings
        </span>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: theme.spacing.sm, minHeight: 40 }}>
            <SkeletonBlock width={148} height={34} radius={10} tone="onBrand" />
            <SkeletonBlock width={36} height={14} radius={6} tone="onBrand" style={{ marginBottom: 4 }} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: theme.spacing.sm }}>
            <span style={{
              color: '#fff', fontSize: 34, fontWeight: 700, letterSpacing: -1,
              fontFamily: 'Fraunces, Georgia, serif', fontVariantNumeric: 'tabular-nums',
            }}>{formatCurrency(animatedAmount, currency)}</span>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{currency}</span>
          </div>
        )}
        {loading ? (
          <SkeletonBlock width={140} height={12} radius={6} tone="onBrand" style={{ marginTop: 8 }} />
        ) : savingsRate !== undefined ? (
          <span style={{ display: 'block', color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: 600, marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
            {Math.round(savingsRate)}% saved this month
          </span>
        ) : null}
      </div>

      <div style={{ position: 'relative', display: 'flex', gap: inlineGap, marginTop: theme.spacing.md }}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.href)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '11px 8px', borderRadius: theme.radii.md, cursor: 'pointer',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <AppIcon name={action.icon} size={15} color="rgba(255,255,255,0.95)" />
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              color: 'rgba(255,255,255,0.95)',
            }}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
