import { useNavigate } from 'react-router-dom';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ScreenWrapper, ResponsiveGrid } from '@/shared/components/ui/layout';
import { SummaryCard, EmptyState, Button, GroupedCard, ListRow } from '@/shared/components/ui/index';
import { NetWorthSkeleton } from '@/shared/components/ui/skeleton';
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
        <>
          <div style={{
            borderRadius: theme.radii.xl,
            padding: theme.spacing.xl,
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`,
            color: theme.colors.onPrimary,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.2px', opacity: 0.85, fontFamily: 'Inter, sans-serif' }}>Net worth</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amountLg.fontSize, fontWeight: Number(theme.typography.amountLg.fontWeight), margin: '4px 0' }}>
              {formatCurrency(summary.netWorth, currency)}
            </p>
          </div>

          <ResponsiveGrid>
            <SummaryCard title="Assets" amount={formatCurrency(summary.totalAssets, currency)} color={theme.colors.success} icon="trendingUp" />
            <SummaryCard title="Liabilities" amount={formatCurrency(summary.totalLiabilities, currency)} color={theme.colors.danger} icon="activity" />
            <SummaryCard title="Bank Balance" amount={formatCurrency(summary.bankBalance, currency)} icon="creditCard" onPress={() => navigate('/accounts')} />
            <SummaryCard title="Investments" amount={formatCurrency(summary.investmentValue, currency)} color={theme.colors.primary} icon="chart" onPress={() => navigate('/investments')} />
          </ResponsiveGrid>

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
            <>
              {accounts.length > 0 && (
                <GroupedCard title="Accounts">
                  {accounts.map((acc, i) => (
                    <ListRow
                      key={acc.id}
                      label={acc.name}
                      subtitle={`${acc.institution ?? acc.type}${acc.accountNumberLast4 ? ` · ****${acc.accountNumberLast4}` : ''}`}
                      value={formatCurrency(acc.balance, acc.currency)}
                      onPress={() => navigate('/accounts')}
                      isLast={i === accounts.length - 1}
                    />
                  ))}
                </GroupedCard>
              )}
              {investments.length > 0 && (
                <GroupedCard title="Investments">
                  {investments.slice(0, 5).map((inv, i) => (
                    <ListRow
                      key={inv.id}
                      label={inv.name}
                      subtitle={inv.type.replace('_', ' ')}
                      value={formatCurrency(inv.currentValue ?? (inv.quantity * inv.currentPrice), inv.currency)}
                      onPress={() => navigate('/investments')}
                      isLast={i === Math.min(investments.length, 5) - 1}
                    />
                  ))}
                </GroupedCard>
              )}
            </>
          )}
        </>
      )}
    </ScreenWrapper>
  );
}
