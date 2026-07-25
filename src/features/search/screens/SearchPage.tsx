import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StackNavHeader, useStackBack, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { Input, EmptyState } from '@/shared/components/ui/index';
import { TransactionRow } from '@/shared/components/ui/list-rows';
import { ListSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { ensureArray } from '@/shared/utils/listData';
import { useSearch } from '@/features/shared/hooks/useFeatures';
import type { Transaction } from '@/shared/types';
import { FieldLimits, maxLen, ValidationMessages } from '@/shared/validation/fieldLimits';

export function SearchPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { data, isLoading, isFetching } = useSearch(query);

  const results = ensureArray<Transaction>(data?.transactions);
  const enabled = query.trim().length >= FieldLimits.search.min;
  const searching = enabled && (isLoading || isFetching);

  const goBack = useStackBack('/expenses');

  return (
    <StickyHeaderFlatScreen
      header={
        <StackNavHeader
          title="Search"
          onBack={goBack}
          footer={
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, maxLen('search')))}
              placeholder="Search transactions..."
              leftIcon="search"
              autoFocus
              maxLength={maxLen('search')}
            />
          }
        />
      }
      inset="stack"
      data={enabled && !searching ? results : []}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        searching ? (
          <ListSkeleton count={6} variant="transaction" showHeader={false} />
        ) : !enabled ? (
          <p style={{ textAlign: 'center', color: theme.colors.textSecondary, marginTop: 32, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
            {ValidationMessages.minChars(FieldLimits.search.min)}
          </p>
        ) : null
      }
      renderItem={(txn) => (
        <TransactionRow transaction={txn} onPress={() => navigate(`/expense/${txn.id}`)} />
      )}
      ListEmptyComponent={enabled && !searching ? <EmptyState title="No results" subtitle="Try a different search term" icon="search" /> : null}
    />
  );
}
