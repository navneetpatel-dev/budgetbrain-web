import { useNavigate } from 'react-router-dom';
import { FeatureHeader, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { TransactionRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useIncome } from '../hooks/useIncome';
import type { Transaction } from '@/shared/types';

export function IncomePage() {
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
          eyebrow="Earn"
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
        <TransactionRow transaction={txn} onPress={() => navigate(`/income/${txn.id}`)} />
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
