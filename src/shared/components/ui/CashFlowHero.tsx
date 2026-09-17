import { AppIcon } from './icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';

export interface CashFlowHeroProps {
  title?: string;
  totalSpent: number;
  totalEarned: number;
  currency?: string;
  netRate?: number;
  targetCap?: number;
}

export function CashFlowHero({
  title = 'Cash Flow',
  totalSpent,
  totalEarned,
  currency = 'INR',
  netRate,
}: CashFlowHeroProps) {
  const theme = useTheme();

  const totalFlow = totalSpent + totalEarned;
  const spentPct = totalFlow > 0 ? (totalSpent / totalFlow) * 100 : 0;
  const earnedPct = totalFlow > 0 ? (totalEarned / totalFlow) * 100 : 100;
  const netSurplus = totalEarned - totalSpent;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: theme.radii.card,
        padding: '20px',
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
        boxShadow: theme.shadows.md,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Ambient glows */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: theme.colors.secondary,
          opacity: 0.08,
          filter: 'blur(36px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            fontSize: 14,
            fontWeight: 700,
            color: theme.colors.text,
          }}>
            {title}
          </span>
        </div>

        {netRate !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 9999,
            backgroundColor: theme.colors.secondary + '18',
            color: theme.colors.secondary,
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
          }}>
            <AppIcon name="arrowUp" size={12} color={theme.colors.secondary} />
            <span>{netRate > 0 ? `+${Math.round(netRate)}%` : `${Math.round(netRate)}%`} Net</span>
          </div>
        )}
      </div>

      {/* Split Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Spent */}
        <div style={{
          padding: '12px 14px',
          borderRadius: 14,
          backgroundColor: theme.colors.surfaceContainerLow,
          border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.borderSubtle}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: theme.colors.danger + '18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AppIcon name="expense" size={12} color={theme.colors.danger} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>
              Total Spent
            </span>
          </div>
          <span style={{
            display: 'block',
            fontSize: 18,
            fontWeight: 800,
            color: theme.colors.text,
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'Inter, sans-serif',
          }}>
            -{formatCurrency(totalSpent, currency)}
          </span>
        </div>

        {/* Earned */}
        <div style={{
          padding: '12px 14px',
          borderRadius: 14,
          backgroundColor: theme.colors.surfaceContainerLow,
          border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.borderSubtle}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: theme.colors.secondary + '18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AppIcon name="income" size={12} color={theme.colors.secondary} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>
              Total Earned
            </span>
          </div>
          <span style={{
            display: 'block',
            fontSize: 18,
            fontWeight: 800,
            color: theme.colors.secondary,
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'Inter, sans-serif',
          }}>
            +{formatCurrency(totalEarned, currency)}
          </span>
        </div>
      </div>

      {/* Ratio Progress Bar */}
      <div>
        <div style={{
          width: '100%',
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.surfaceContainerHighest,
          display: 'flex',
          overflow: 'hidden',
          gap: 2,
        }}>
          <div style={{ width: `${spentPct}%`, backgroundColor: theme.colors.danger, transition: 'width 0.4s ease' }} />
          <div style={{ width: `${earnedPct}%`, backgroundColor: theme.colors.secondary, transition: 'width 0.4s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>
            Net: {netSurplus >= 0 ? '+' : ''}{formatCurrency(netSurplus, currency)}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: theme.colors.secondary, fontFamily: 'Inter, sans-serif' }}>
            {Math.round(earnedPct)}% Inflow
          </span>
        </div>
      </div>
    </div>
  );
}
