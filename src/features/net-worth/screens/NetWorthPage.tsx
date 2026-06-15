import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ScreenWrapper, ResponsiveGrid } from '@/shared/components/ui/layout';
import { Card, SummaryCard } from '@/shared/components/ui/index';
import { ListSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { ensureArray } from '@/shared/utils/listData';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import type { FinancialAccount, Investment } from '@/shared/types';

export function NetWorthPage() {
  const theme = useTheme();
  const { data, isLoading } = useQuery({
    queryKey: ['net-worth'],
    queryFn: () => apiGet<{ totalAssets: number; totalLiabilities: number; accounts: FinancialAccount[]; investments: Investment[] }>('/net-worth'),
  });

  if (isLoading) return <ListSkeleton count={4} />;
  if (!data) return null;
  const accounts = ensureArray<FinancialAccount>(data.accounts);

  return (
    <ScreenWrapper header={<ProfileStackHeader screen="net-worth" subtitle="Your financial overview" />} inset="stack">
      <div style={{ borderRadius: theme.radii.xl, padding: theme.spacing.xl, background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`, color: theme.colors.onPrimary, textAlign: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', opacity: 0.8, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Net Worth</span>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amountLg.fontSize, fontWeight: Number(theme.typography.amountLg.fontWeight), margin: '4px 0' }}>{formatCurrency(data.totalAssets - data.totalLiabilities)}</p>
      </div>
      <ResponsiveGrid>
        <SummaryCard title="Assets" amount={formatCurrency(data.totalAssets)} color={theme.colors.success} icon="trendingUp" />
        <SummaryCard title="Liabilities" amount={formatCurrency(data.totalLiabilities)} color={theme.colors.danger} icon="activity" />
      </ResponsiveGrid>
      {accounts.map((acc) => (
        <Card key={acc.id} variant="elevated">
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{acc.name}</span>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: theme.colors.textSecondary, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{acc.institution ?? acc.type} {acc.accountNumberLast4 ? `· ****${acc.accountNumberLast4}` : ''}</span>
          <span style={{ marginTop: 4, display: 'block', fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amount.fontSize, fontWeight: Number(theme.typography.amount.fontWeight), color: theme.colors.text }}>{formatCurrency(acc.balance, acc.currency)}</span>
        </Card>
      ))}
    </ScreenWrapper>
  );
}
