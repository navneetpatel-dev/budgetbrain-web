import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { BentoCard, EmptyState, Button, GroupedCard, ListRow } from '@/shared/components/ui/index';
import { SegmentedMacroBar } from '@/shared/components/ui/SegmentedMacroBar';
import { NetWorthSkeleton } from '@/shared/components/ui/skeleton';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { ensureArray } from '@/shared/utils/listData';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import type { FinancialAccount, Investment } from '@/shared/types';

interface NetWorthData {
  summary: {
    netWorth: number;
    totalAssets: number;
    totalLiabilities: number;
    bankBalance: number;
    creditCardDebt: number;
    investmentValue: number;
    currency: string;
  };
  accounts: FinancialAccount[];
  investments: Investment[];
}

export function NetWorthPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['net-worth'],
    queryFn: () => apiGet<NetWorthData>('/net-worth'),
  });

  const summary = data?.summary;
  const currency = summary?.currency ?? 'INR';
  const accounts = ensureArray<FinancialAccount>(data?.accounts);
  const investments = ensureArray<Investment>(data?.investments);
  const isEmpty = !isLoading && accounts.length === 0 && investments.length === 0;

  // Compute macro bar breakdown
  const macroItems = useMemo(() => {
    if (!summary) return [];
    const total = Math.max(1, (summary.totalAssets || 0) + (summary.totalLiabilities || 0));
    const assetPct = Math.round(((summary.totalAssets || 0) / total) * 100);
    const liabPct = 100 - assetPct;
    return [
      {
        id: 'assets',
        name: 'Assets',
        amount: summary.totalAssets || 0,
        pct: assetPct,
        color: theme.colors.secondary,
      },
      {
        id: 'liabilities',
        name: 'Liabilities',
        amount: summary.totalLiabilities || 0,
        pct: liabPct,
        color: theme.colors.rose,
      },
    ];
  }, [summary, theme]);

  const equityRatio = useMemo(() => {
    if (!summary || summary.totalAssets <= 0) return 100;
    const ratio = Math.round((summary.netWorth / summary.totalAssets) * 100);
    return Math.max(0, Math.min(100, ratio));
  }, [summary]);

  return (
    <ScreenWrapper
      header={
        <ProfileStackHeader
          screen="net-worth"
          subtitle={
            isLoading
              ? 'Loading…'
              : isEmpty
                ? 'Build your financial picture'
                : `${accounts.length} account${accounts.length !== 1 ? 's' : ''} · ${investments.length} investment${investments.length !== 1 ? 's' : ''}`
          }
        />
      }
      inset="stack"
    >
      {isLoading || !data || !summary ? (
        <NetWorthSkeleton />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Wealth Hero Bento Card */}
          <div
            style={{
              position: 'relative',
              backgroundColor: theme.colors.surfaceContainer ?? theme.colors.surface,
              borderRadius: theme.radii.card,
              padding: '24px',
              border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
              overflow: 'hidden',
              background: `linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(78, 222, 163, 0.08), transparent)`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.isDark ? 'rgba(14, 165, 233, 0.18)' : 'rgba(14, 165, 233, 0.25)',
                  }}
                >
                  <AppIcon name="netWorth" size={18} color={theme.colors.primary} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: theme.colors.textSecondary }}>Total Net Worth</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: theme.isDark ? 'rgba(78, 222, 163, 0.12)' : theme.colors.secondaryContainer,
                  padding: '4px 10px',
                  borderRadius: 9999,
                  border: `1px solid ${theme.isDark ? 'rgba(78, 222, 163, 0.3)' : 'transparent'}`,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.secondary }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: theme.colors.secondary }}>{equityRatio}% Equity</span>
              </div>
            </div>

            <div style={{ fontSize: 36, fontWeight: 800, color: theme.colors.text, letterSpacing: '-1px', margin: '8px 0 16px' }}>
              {formatCurrency(summary.netWorth, currency)}
            </div>

            {/* Assets vs Liabilities Breakdown Bar */}
            <div style={{ paddingTop: 14, borderTop: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textTertiary, textTransform: 'uppercase' }}>Distribution</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: theme.colors.textSecondary }}>Assets vs Liabilities</span>
              </div>
              <SegmentedMacroBar items={macroItems} currency={currency} showLegend={false} />
            </div>
          </div>

          {/* 2x2 Bento Metric Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <BentoCard
              title="Total Assets"
              value={formatCurrency(summary.totalAssets, currency)}
              subtitle="Investments & Cash"
              accentColor={theme.colors.secondary}
              icon="trendingUp"
            />
            <BentoCard
              title="Total Liabilities"
              value={formatCurrency(summary.totalLiabilities, currency)}
              subtitle="Credit & Borrowings"
              accentColor={theme.colors.rose}
              icon="expense"
            />
            <BentoCard
              title="Liquid Cash"
              value={formatCurrency(summary.bankBalance, currency)}
              subtitle="Bank & Wallets"
              accentColor={theme.colors.primary}
              icon="wallet"
              onPress={() => navigate('/accounts')}
            />
            <BentoCard
              title="Investments"
              value={formatCurrency(summary.investmentValue, currency)}
              subtitle="Stocks, Funds & Metals"
              accentColor={theme.colors.violet}
              icon="chart"
              onPress={() => navigate('/investments')}
            />
          </div>

          {isEmpty ? (
            <div>
              <EmptyState
                title="No accounts yet"
                subtitle="Add bank accounts and investments to track your net worth"
                icon="wallet"
                action="View accounts"
                onAction={() => navigate('/accounts')}
              />
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: theme.spacing.sm }}>
                <Button title="View investments" onPress={() => navigate('/investments')} variant="outline" />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {accounts.length > 0 && (
                <GroupedCard title="Accounts & Liquid Balances">
                  {accounts.map((acc, i) => (
                    <ListRow
                      key={acc.id}
                      icon="wallet"
                      label={acc.name}
                      subtitle={`${acc.type.replace(/_/g, ' ')}${acc.institution ? ` · ${acc.institution}` : ''}`}
                      value={formatCurrency(acc.balance, currency)}
                      onPress={() => navigate('/accounts')}
                      isLast={i === accounts.length - 1}
                    />
                  ))}
                </GroupedCard>
              )}

              {investments.length > 0 && (
                <GroupedCard title="Investment Holdings">
                  {investments.map((inv, i) => (
                    <ListRow
                      key={inv.id}
                      icon="chart"
                      label={inv.name}
                      subtitle={`${inv.type.replace(/_/g, ' ')} · ${inv.gainLoss >= 0 ? '+' : ''}${formatCurrency(inv.gainLoss, currency)}`}
                      value={formatCurrency(inv.currentValue, currency)}
                      onPress={() => navigate('/investments')}
                      isLast={i === investments.length - 1}
                    />
                  ))}
                </GroupedCard>
              )}
            </div>
          )}
        </div>
      )}
    </ScreenWrapper>
  );
}
