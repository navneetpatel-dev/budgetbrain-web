import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppIcon, type AppIconName } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';

type QuickAction = { label: string; icon: AppIconName; href: string; primary?: boolean };

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Expense', icon: 'receipt', href: '/expense/add', primary: true },
  { label: 'Income', icon: 'trendingUp', href: '/income/add' },
  { label: 'Budget', icon: 'budgets', href: '/budget/add' },
  { label: 'AI', icon: 'sparkles', href: '/ai' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export function DashboardHero({
  name,
  netSavings,
  currency,
  savingsRate,
}: {
  name: string;
  netSavings: string;
  currency: string;
  savingsRate?: number;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { tabBarPaddingX, inlineGap, contentMaxWidth, isDesktop } = useResponsive();
  const initial = name[0]?.toUpperCase() ?? '?';

  const heroStyle = useMemo(() => ({
    position: 'relative' as const,
    overflow: 'hidden',
    paddingTop: isDesktop ? 28 : 16,
    paddingBottom: theme.spacing.md,
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
      <div style={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', top: -35, right: -45, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', bottom: 20, left: -25, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: theme.spacing.sm }}>
          <span style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }}>
            GOOD {getGreeting().toUpperCase()}
          </span>
          <span style={{ display: 'block', color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: -0.4, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
            {name}
          </span>
        </div>
        <button
          onClick={() => navigate('/settings')}
          style={{
            borderRadius: 999, padding: 2, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.45), rgba(255,255,255,0.1))',
          }}
          aria-label="Open profile"
        >
          <div style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>{initial}</span>
          </div>
        </button>
      </div>

      <div style={{
        position: 'relative',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: theme.radii.lg,
        padding: `${theme.spacing.sm + 2}px ${theme.spacing.md}px`,
        border: '1px solid rgba(255,255,255,0.14)',
        marginBottom: theme.spacing.sm,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: 600, letterSpacing: 0.2, fontFamily: 'Inter, sans-serif' }}>Net savings</span>
          {savingsRate !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.12)', padding: '3px 8px', borderRadius: theme.radii.full }}>
              <AppIcon name="chart" size={10} color="rgba(255,255,255,0.9)" />
              <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{savingsRate}% saved</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: theme.spacing.sm }}>
          <span style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: -0.8, fontFamily: 'Inter, sans-serif' }}>{netSavings}</span>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{currency}</span>
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', gap: inlineGap }}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.href)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '9px 4px', borderRadius: theme.radii.md, cursor: 'pointer',
              backgroundColor: action.primary ? '#fff' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${action.primary ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <AppIcon name={action.icon} size={15} color={action.primary ? theme.colors.primary : 'rgba(255,255,255,0.95)'} />
            <span style={{
              fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              color: action.primary ? theme.colors.primary : 'rgba(255,255,255,0.92)',
            }}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
