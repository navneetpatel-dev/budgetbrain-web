import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StackNavHeader, useStackBack, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { Input, EmptyState } from '@/shared/components/ui/index';
import { ListSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { ensureArray } from '@/shared/utils/listData';
import { useSearch } from '@/features/shared/hooks/useFeatures';
import type { Transaction } from '@/shared/types';

export function SearchPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { data, isLoading, isFetching } = useSearch(query);

  const results = ensureArray<Transaction>(data?.transactions);
  const searching = query.length >= 2 && (isLoading || isFetching);

  const goBack = useStackBack('/expenses');

  return (
    <StickyHeaderFlatScreen
      header={<StackNavHeader title="Search" onBack={goBack} footer={<Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search transactions..." leftIcon="search" autoFocus />} />}
      inset="stack"
      data={query.length >= 2 && !searching ? results : []}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        searching ? <ListSkeleton count={6} variant="transaction" showHeader={false} /> : query.length < 2 ? (
          <p style={{ textAlign: 'center', color: theme.colors.textSecondary, marginTop: 32, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Type at least 2 characters to search</p>
        ) : null
      }
      renderItem={(txn) => (
        <div onClick={() => navigate(`/expense/${txn.id}`)} style={{ cursor: 'pointer', backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, border: `1px solid ${theme.colors.borderSubtle}`, padding: theme.spacing.lg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: theme.shadows.sm }}>
          <div><span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{txn.merchant || txn.category?.name || 'Transaction'}</span><span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>{txn.date}{txn.notes ? ` · ${txn.notes}` : ''}</span></div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: txn.type === 'expense' ? theme.colors.danger : theme.colors.success }}>{txn.type === 'expense' ? '-' : '+'}{formatCurrency(txn.amount, txn.currency)}</span>
        </div>
      )}
      ListEmptyComponent={query.length >= 2 && !searching ? <EmptyState title="No results" subtitle="Try a different search term" icon="search" /> : null}
    />
  );
}
