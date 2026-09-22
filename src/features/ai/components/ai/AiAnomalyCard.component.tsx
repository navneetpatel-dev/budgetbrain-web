'use client';

import { AppIcon, type AppIconName } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AiAnomaly } from '@/shared/types';

const ANOMALY_LABELS: Record<AiAnomaly['type'], { label: string; icon: AppIconName }> = {
  duplicate_expense: { label: 'Possible duplicate', icon: 'document' },
  spending_spike: { label: 'Spending spike', icon: 'trendingUp' },
  subscription_cost_increase: { label: 'Subscription cost increase', icon: 'bell' },
  unusual_transaction: { label: 'Unusual transaction', icon: 'shield' },
};

export function AiAnomalyCard({
  type,
  reason,
  meta,
}: {
  type: AiAnomaly['type'];
  reason: string;
  meta?: string;
}) {
  const theme = useTheme();
  const info = ANOMALY_LABELS[type] ?? { label: 'Unusual activity', icon: 'shield' as AppIconName };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 14,
        backgroundColor: theme.isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)',
        border: `1px solid ${theme.isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.2)'}`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: theme.isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <AppIcon name={info.icon} size={16} color={theme.colors.warning} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: theme.colors.warning,
            marginBottom: 2,
          }}
        >
          {info.label}
        </div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: theme.colors.text,
            lineHeight: '18px',
          }}
        >
          {reason}
        </div>
        {meta && (
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              color: theme.colors.textTertiary,
              marginTop: 4,
            }}
          >
            {meta}
          </div>
        )}
      </div>
    </div>
  );
}

export function AiAnomalyClear() {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 14,
        backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)',
        border: `1px solid ${theme.isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'}`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AppIcon name="checkmark" size={18} color={theme.colors.success} />
      </div>
      <div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: theme.colors.text,
          }}
        >
          All clear
        </div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: theme.colors.textSecondary,
          }}
        >
          No unusual spending detected
        </div>
      </div>
    </div>
  );
}
