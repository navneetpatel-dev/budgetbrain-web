import { useNavigate } from 'react-router-dom';
import { FeatureHeader, HeaderIconButton, SearchField, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { TransactionRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { ensureArray } from '@/shared/utils/listData';
import { useExpenses } from '../hooks/useExpenses';
import type { Transaction } from '@/shared/types';

export function ExpensesPage() {
  const navigate = useNavigate();
  const goBack = useStackBack('/dashboard');
  const { data, isLoading, isError, refetch } = useExpenses();
  const transactions = ensureArray<Transaction>(data?.transactions);
  const total = transactions.length;

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          showBack
          onBack={goBack}
          eyebrow="Track"
          title="Activity"
          subtitle={isLoading ? 'Loading…' : `${total} transaction${total !== 1 ? 's' : ''}`}
          actionIcon="add"
          actionLabel="Add expense"
          onAction={() => navigate('/expense/add')}
          footer={
            <SearchField
              placeholder="Search transactions"
              onPress={() => navigate('/search')}
              rightAction={
                <HeaderIconButton
                  icon="trendingUp"
                  label="Add income"
                  onPress={() => navigate('/income/add')}
                />
              }
            />
          }
        />
      }
      data={isLoading ? [] : transactions}
      keyExtractor={(item: Transaction) => item.id}
      renderItem={(txn) => (
        <TransactionRow
          transaction={txn}
          onPress={() => navigate(txn.type === 'income' ? `/income/${txn.id}` : `/expense/${txn.id}`)}
        />
      )}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={6} variant="transaction" />
        ) : isError ? (
          <EmptyState title="Couldn’t load activity" subtitle="Check your connection and try again" icon="activity" action="Retry" onAction={() => void refetch()} />
        ) : (
          <EmptyState title="No transactions yet" subtitle="Your income and spending history will appear here" icon="activity" action="Add expense" onAction={() => navigate('/expense/add')} />
        )
      }
    />
  );
}
