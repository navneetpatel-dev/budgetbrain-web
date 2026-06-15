import { useNavigate } from 'react-router-dom';
import { FeatureHeader, HeaderIconButton, SearchField, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { ListSkeleton } from '@/shared/components/ui/skeleton';
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

  if (isLoading) return <ListSkeleton count={6} />;
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
          subtitle={`${total} transaction${total !== 1 ? 's' : ''}`}
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
      data={transactions}
      keyExtractor={(item: Transaction) => item.id}
      renderItem={(txn) => (
        <div onClick={() => navigate(`/expense/${txn.id}`)} style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.borderSubtle}`, borderRadius: theme.radii.lg, padding: theme.spacing.lg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: theme.shadows.sm }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: txn.category?.color ? txn.category.color + '18' : theme.colors.primarySoft }}><span style={{ fontSize: 16, fontWeight: 700, color: txn.category?.color ?? theme.colors.primary, fontFamily: 'Inter, sans-serif' }}>{(txn.category?.name ?? txn.merchant ?? 'T')[0].toUpperCase()}</span></div>
            <div><span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{txn.merchant || txn.category?.name || 'Transaction'}</span><span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>{txn.date}{txn.notes ? ` · ${txn.notes}` : ''}</span></div>
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: txn.type === 'expense' ? theme.colors.danger : theme.colors.success }}>{txn.type === 'expense' ? '-' : '+'}{formatCurrency(txn.amount, txn.currency)}</span>
        </div>
      )}
      ListEmptyComponent={<EmptyState title="No expenses yet" subtitle="Your spending history will appear here" icon="activity" action="Add expense" onAction={() => navigate('/expense/add')} />}
    />
  );
}
