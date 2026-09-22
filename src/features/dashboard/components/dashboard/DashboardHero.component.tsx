'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppIcon, type AppIconName } from '@/shared/components/ui/icons/AppIcon';
import { RingGauge } from '@/shared/components/ui/RingGauge';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';
import { useCountUp } from '@/shared/hooks/useCountUp';
import { formatCurrency } from '@/shared/utils/currency';
import { SkeletonBlock } from '@/shared/components/ui/skeleton';

type QuickAction = { label: string; icon: AppIconName; href: string; primary?: boolean };

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Log Expense', icon: 'receipt', href: '/expense/add', primary: true },
  { label: 'Add Income', icon: 'income', href: '/income/add' },
  { label: 'Net Worth', icon: 'trendingUp', href: '/net-worth' },
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
  savingsRate = 18.4,
  loading = false,
}: {
  name: string;
  amount: number;
  currency: string;
  savingsRate?: number;
  loading?: boolean;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { tabBarPaddingX, contentMaxWidth, isDesktop } = useResponsive();
  const animatedAmount = useCountUp(amount);
  const targetProgress = Math.min(100, Math.max(10, Math.round(savingsRate || 25)));

  const heroStyle = useMemo(() => ({
    position: 'relative' as const,
    paddingTop: isDesktop ? 24 : 16,
    paddingBottom: 24,
    paddingLeft: tabBarPaddingX,
    paddingRight: tabBarPaddingX,
    maxWidth: contentMaxWidth ?? '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    boxSizing: 'border-box' as const,
  }), [tabBarPaddingX, contentMaxWidth, isDesktop]);

  return (
    <div style={heroStyle}>
      <div style={{
        position: 'relative',
        borderRadius: theme.radii.card,
        padding: isDesktop ? '24px 28px' : '20px',
        backgroundColor: theme.colors.surfaceElevated,
        border: `1px solid ${theme.isDark ? 'rgba(14,165,233,0.18)' : theme.colors.borderSubtle}`,
        boxShadow: theme.isDark ? '0 8px 32px rgba(0,0,0,0.45)' : theme.shadows.lg,
        overflow: 'hidden',
        // Luminous top-edge gradient border
        backgroundImage: theme.isDark
          ? `linear-gradient(${theme.colors.surfaceElevated}, ${theme.colors.surfaceElevated}), linear-gradient(90deg, ${theme.colors.primary}44, ${theme.colors.secondary}44, ${theme.colors.primary}44)`
          : undefined,
        backgroundOrigin: 'border-box',
        backgroundClip: theme.isDark ? 'padding-box, border-box' : undefined,
      }}>
        {/* Ambient background glow accents */}
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: theme.colors.primary,
          opacity: 0.12,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: theme.colors.secondary,
          opacity: 0.08,
          filter: 'blur(36px)',
          pointerEvents: 'none',
        }} />

        {/* Top Status Row */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.secondary,
              boxShadow: `0 0 8px ${theme.colors.secondary}`,
            }} />
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: theme.colors.textSecondary,
            }}>
              Good {getGreeting()}, {name}
            </span>
          </div>

          {savingsRate !== undefined && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 9999,
              backgroundColor: theme.colors.secondary + '18',
              color: theme.colors.secondary,
              fontSize: 11,
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: 0.2,
            }}>
              <AppIcon name="chart" size={12} color={theme.colors.secondary} />
              <span>{savingsRate > 0 ? `+${Math.round(savingsRate)}%` : `${Math.round(savingsRate)}%`} saved</span>
            </div>
          )}
        </div>

        {/* Amount & Ring Visualizer Row */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: theme.colors.textTertiary,
              fontFamily: 'Inter, sans-serif',
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              Net Savings this month
            </span>

            {loading ? (
              <SkeletonBlock width={160} height={36} radius={8} />
            ) : (
              <span style={{
                display: 'block',
                color: theme.colors.text,
                fontSize: isDesktop ? 34 : 28,
                fontWeight: 800,
                letterSpacing: -1,
                fontFamily: 'Inter, sans-serif',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1.1,
              }}>
                {formatCurrency(animatedAmount, currency)}
              </span>
            )}
          </div>

          {/* Ring Visualizer */}
          <div style={{ flexShrink: 0 }}>
            <RingGauge
              size={58}
              strokeWidth={5}
              progress={targetProgress}
              icon="budgets"
              gradientColors={[theme.colors.secondary, theme.colors.primary]}
            />
          </div>
        </div>

        {/* Quick Actions Row */}
        <div style={{
          position: 'relative',
          display: 'flex',
          gap: 10,
          marginTop: 20,
        }}>
          {QUICK_ACTIONS.map((action) => {
            const isPrimary = !!action.primary;
            return (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)'; }}
                onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
                onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)'; }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: isPrimary ? 'none' : `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
                  background: isPrimary
                    ? `linear-gradient(135deg, ${theme.colors.ocean}, ${theme.colors.primary})`
                    : theme.isDark ? theme.colors.surfaceContainerHigh : theme.colors.surface,
                  color: isPrimary ? '#FFFFFF' : theme.colors.text,
                  boxShadow: isPrimary ? `0 4px 12px ${theme.colors.primary}44` : 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s ease',
                }}
              >
                <AppIcon name={action.icon} size={15} color={isPrimary ? '#FFFFFF' : theme.colors.primary} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}