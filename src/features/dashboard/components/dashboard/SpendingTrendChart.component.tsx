'use client';

import { useState } from 'react';
import { Card } from '@/shared/components/ui';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import type { SpendingTrends, SpendingTrendPoint } from '@/shared/types';
import { spendingTrendStyles } from '../../styles/dashboard/dashboard.styles';

interface Props {
  trends?: SpendingTrends;
  currency: string;
}

type IntervalMode = 'daily' | 'weekly' | 'monthly';

export function SpendingTrendChart({ trends, currency }: Props) {
  const theme = useTheme();
  const [mode, setMode] = useState<IntervalMode>('daily');

  const points: SpendingTrendPoint[] = trends?.[mode] ?? [];
  const maxVal = Math.max(...points.map((p) => p.total), 0);

  return (
    <Card variant="elevated" style={{ padding: theme.spacing.lg }}>
      <div className={spendingTrendStyles.header}>
        <div>
          <div className={spendingTrendStyles.titleRow}>
            <AppIcon name="trendingUp" size={18} color={theme.colors.primary} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: theme.colors.text,
              }}
            >
              Spending Trends
            </span>
          </div>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: theme.colors.textSecondary,
              marginTop: 2,
            }}
          >
            Periodic breakdown over time
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div
          role="tablist"
          aria-label="Spending trend periods"
          style={{
            display: 'inline-flex',
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surfaceContainer,
            padding: 3,
            borderRadius: 10,
            border: `1px solid ${theme.colors.borderSubtle}`,
          }}
        >
          {(['daily', 'weekly', 'monthly'] as IntervalMode[]).map((tab) => {
            const isActive = mode === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setMode(tab)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? theme.colors.primary : 'transparent',
                  color: isActive ? theme.colors.onPrimary : theme.colors.textSecondary,
                  transition: 'all 0.15s ease',
                }}
              >
                {tab === 'daily' ? 'Daily (14d)' : tab === 'weekly' ? 'Weekly (8w)' : 'Monthly (6m)'}
              </button>
            );
          })}
        </div>
      </div>

      {points.length === 0 || maxVal === 0 ? (
        <div
          style={{
            padding: `${theme.spacing.xl}px 0`,
            textAlign: 'center',
            color: theme.colors.textSecondary,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <AppIcon name="chart" size={32} color={theme.colors.textTertiary} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 500 }}>No spending activity recorded in this period</p>
        </div>
      ) : (
        <div className={spendingTrendStyles.chart}>
          {/* Bar Chart Container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 6,
              height: 140,
              paddingBottom: 24,
              position: 'relative',
              borderBottom: `1px solid ${theme.colors.borderSubtle}`,
            }}
          >
            {points.map((pt, idx) => {
              const heightPct = Math.max(toSafePercent(pt.total, maxVal), 4);
              return (
                <div
                  key={idx}
                  className={spendingTrendStyles.bar}
                >
                  {/* Tooltip on hover */}
                  <div
                    className={spendingTrendStyles.tooltip}
                    style={{
                      backgroundColor: theme.isDark ? '#1e293b' : '#0f172a',
                      color: '#ffffff',
                    }}
                  >
                    <div className={spendingTrendStyles.tooltipLabel}>{pt.label}</div>
                    <div>{formatCurrency(pt.total, currency)}</div>
                  </div>

                  {/* Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: mode === 'monthly' ? 36 : mode === 'weekly' ? 24 : 14,
                      height: `${heightPct}%`,
                      backgroundColor: pt.total > 0 ? theme.colors.primary : theme.colors.borderSubtle,
                      borderRadius: '4px 4px 1px 1px',
                      transition: 'height 0.25s ease, background-color 0.2s ease',
                    }}
                  />

                  {/* X-axis Label */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -20,
                      fontSize: 10,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      color: theme.colors.textTertiary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
