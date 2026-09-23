'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StackNavHeader, useStackBack, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { Input, EmptyState } from '@/shared/components/ui/index';
import { TransactionRow } from '@/shared/components/ui/list-rows';
import { ListSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { ensureArray } from '@/shared/utils/listData';
import { useSearch } from '@/shared/hooks';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { Transaction } from '@/shared/types';
import { FieldLimits, maxLen, ValidationMessages } from '@/shared/validation/fieldLimits';

export function SearchPage() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data, isLoading, isFetching } = useSearch(debouncedQuery);

  const results = ensureArray<Transaction>(data?.transactions);
  const enabled = debouncedQuery.trim().length >= FieldLimits.search.min;
  const searching = enabled && (isLoading || isFetching);

  const goBack = useStackBack('/expenses');
  const handleTransactionPress = useCallback(
    (t: Transaction) => router.push(t.type === 'income' ? `/income/${t.id}` : `/expenses/${t.id}`),
    [router]
  );

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
              placeholder="Search transactions, notes, categories..."
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
      renderItem={(txn) => <TransactionRow transaction={txn} onPress={handleTransactionPress} />}
      ListEmptyComponent={enabled && !searching ? <EmptyState title="No results" subtitle="Try a different search term" icon="search" /> : null}
    />
  );
}
