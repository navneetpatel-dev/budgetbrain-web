import { useNavigate } from 'react-router-dom';
import { FeatureHeader, HeaderIconButton, SearchField, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { Card, EmptyState } from '@/shared/components/ui/index';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { ensureArray } from '@/shared/utils/listData';
import { useExpenses } from '../hooks/useExpenses';
import type { Transaction } from '@/shared/types';

export function ExpensesPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const goBack = useStackBack('/dashboard');
  const { data, isLoading } = useExpenses();
  const transactions = ensureArray<Transaction>(data?.transactions);
  const total = transactions.length;

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          showBack
          onBack={goBack}
          eyebrow="TRACK"
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
        <Card
          onClick={() => navigate(`/expense/${txn.id}`)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: txn.category?.color ? txn.category.color + '18' : theme.colors.primarySoft }}><span style={{ fontSize: 16, fontWeight: 700, color: txn.category?.color ?? theme.colors.primary, fontFamily: 'Inter, sans-serif' }}>{(txn.category?.name ?? txn.merchant ?? 'T')[0].toUpperCase()}</span></div>
            <div><span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{txn.merchant || txn.category?.name || 'Transaction'}</span><span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>{txn.date}{txn.notes ? ` · ${txn.notes}` : ''}</span></div>
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: txn.type === 'expense' ? theme.colors.danger : theme.colors.success }}>{txn.type === 'expense' ? '-' : '+'}{formatCurrency(txn.amount, txn.currency)}</span>
        </Card>
      )}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={6} variant="transaction" />
        ) : (
          <EmptyState title="No expenses yet" subtitle="Your spending history will appear here" icon="activity" action="Add expense" onAction={() => navigate('/expense/add')} />
        )
      }
    />
  );
}
