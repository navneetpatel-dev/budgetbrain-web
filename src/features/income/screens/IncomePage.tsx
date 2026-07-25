import { useNavigate } from 'react-router-dom';
import { FeatureHeader, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { Card, EmptyState } from '@/shared/components/ui/index';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useIncome } from '../hooks/useIncome';
import type { Transaction } from '@/shared/types';

export function IncomePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const goBack = useStackBack('/dashboard');
  const { data, isLoading } = useIncome();
  const incomeList = data ?? [];

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          showBack
          onBack={goBack}
          eyebrow="EARN"
          title="Income"
          subtitle={isLoading ? 'Loading…' : `${incomeList.length} record${incomeList.length !== 1 ? 's' : ''}`}
          actionIcon="add"
          actionLabel="Add income"
          onAction={() => navigate('/income/add')}
        />
      }
      inset="tab"
      data={isLoading ? [] : incomeList}
      keyExtractor={(txn: Transaction) => txn.id}
      renderItem={(txn) => (
        <Card
          onClick={() => navigate(`/income/${txn.id}`)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div><span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{txn.merchant || txn.notes || 'Income'}</span><span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>{txn.date}</span></div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.success }}>+{formatCurrency(txn.amount, txn.currency)}</span>
        </Card>
      )}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={4} variant="transaction" />
        ) : (
          <EmptyState title="No income yet" subtitle="Record your first income" icon="trendingUp" action="Add Income" onAction={() => navigate('/income/add')} />
        )
      }
    />
  );
}