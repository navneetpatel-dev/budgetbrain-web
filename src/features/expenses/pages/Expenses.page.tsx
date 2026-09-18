'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { FeatureHeader, HeaderIconButton, SearchField, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { EmptyState, CashFlowHero, FilterChipsRail } from '@/shared/components/ui/index';
import { TransactionRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useTheme } from '@/shared/theme';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { TransactionFilters } from '../components/TransactionFilters';
import { useExpenses } from '../hooks/useExpenses';
import {
  countActiveFilters,
  DEFAULT_TRANSACTION_FILTERS,
  FILTER_PICKER_FETCH_LIMIT,
  filtersFromSearchParams,
  filtersToSearchParams,
  toExpenseListParams,
  type TransactionListFilters,
} from '../utils/transactionFilters';
import type { IncomeSource, Transaction } from '@/shared/types';

const LIST_PAGE_SIZE = 20;

function ExpensesPageContent() {
  const router = useRouter();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const goBack = useStackBack('/dashboard');
  const searchParams = useSearchParams();
  // Always start collapsed; active state is shown on the filter button badge.
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(searchParams?.toString() ?? '')),
    [searchParams],
  );

  // Draft edits while the panel is open; list uses applied URL filters until Apply.
  const [draftFilters, setDraftFilters] = useState<TransactionListFilters>(filters);

  const commitFilters = (next: TransactionListFilters) => {
    const params = filtersToSearchParams(next);
    const qs = params.toString();
    router.replace(qs ? `/expenses?${qs}` : '/expenses');
  };

  const openFilters = () => {
    setDraftFilters(filters);
    setFiltersOpen(true);
  };

  const closeFilters = () => setFiltersOpen(false);

  const applyFilters = () => {
    commitFilters(draftFilters);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    // Already cleared: close panel only — do not rewrite URL (avoids refetch loops).
    if (countActiveFilters(filters) === 0) {
      if (countActiveFilters(draftFilters) !== 0) {
        setDraftFilters({ ...DEFAULT_TRANSACTION_FILTERS });
      }
      setFiltersOpen(false);
      return;
    }
    const cleared = { ...DEFAULT_TRANSACTION_FILTERS };
    const clearedParams = toExpenseListParams(cleared);
    setDraftFilters(cleared);
    commitFilters(cleared);
    setFiltersOpen(false);

    // Default list is often still fresh (2m staleTime) from the initial load.
    // Reset that cache so Clear always hits the API with the default payload.
    void queryClient.resetQueries({
      queryKey: ['expenses', 'filtered', clearedParams, LIST_PAGE_SIZE],
      exact: true,
    });
  };

  const {
    items: transactions,
    total,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExpenses(filters);

  const { categories } = useCategories();
  const { data: sources } = usePaginatedList<IncomeSource, 'sources'>({
    queryKey: ['income-sources', 'filter'],
    url: '/income/sources',
    itemsKey: 'sources',
    pageSize: FILTER_PICKER_FETCH_LIMIT,
  });

  const activeFilterCount = countActiveFilters(filters);

  // KNOWN-GAP(money-math): this page-level spent/earned summary is derived from
  // the current (filtered, possibly paginated) transaction list rather than
  // returned by the API. See implementation-plan/web/18-money-math-lint-guardrail.md.
  const { totalSpent, totalEarned, currency } = useMemo(() => {
    let spent = 0;
    let earned = 0;
    let curr = 'INR';
    transactions.forEach((t) => {
      curr = t.currency || curr;
      if (t.type === 'income') {
        // eslint-disable-next-line no-restricted-syntax
        earned += Number(t.amount) || 0;
      } else {
        // eslint-disable-next-line no-restricted-syntax
        spent += Number(t.amount) || 0;
      }
    });
    return { totalSpent: spent, totalEarned: earned, currency: curr };
  }, [transactions]);

  const activeChipId =
    filters.type === 'expense'
      ? 'expense'
      : filters.type === 'income'
        ? 'income'
        : filters.datePreset === 'this_month'
          ? 'this_month'
          : 'all';

  const filterChips = [
    { id: 'all', label: `All (${total || 0})` },
    { id: 'expense', label: 'Expenses', icon: 'expense' as const },
    { id: 'income', label: 'Income', icon: 'income' as const },
    { id: 'this_month', label: 'This Month' },
  ];

  const handleChipSelect = (id: string) => {
    if (id === 'all') {
      commitFilters({ ...filters, type: 'all', datePreset: 'all' });
    } else if (id === 'expense') {
      commitFilters({ ...filters, type: 'expense' });
    } else if (id === 'income') {
      commitFilters({ ...filters, type: 'income' });
    } else if (id === 'this_month') {
      commitFilters({ ...filters, datePreset: 'this_month' });
    }
  };

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
          onAction={() => router.push('/expense/add')}
          footer={
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              <CashFlowHero
                title="Monthly Flow"
                totalSpent={totalSpent}
                totalEarned={totalEarned}
                currency={currency}
                // eslint-disable-next-line no-restricted-syntax -- KNOWN-GAP(money-math): derived from the already-flagged totalEarned/totalSpent above.
                netRate={totalEarned > 0 ? Math.round(((totalEarned - totalSpent) / totalEarned) * 100) : undefined}
              />

              <FilterChipsRail
                chips={filterChips}
                selectedId={activeChipId}
                onSelect={handleChipSelect}
              />

              <SearchField
                placeholder="Search transactions"
                onPress={() => router.push('/search')}
                rightAction={
                  <HeaderIconButton
                    icon="filter"
                    label={activeFilterCount ? `Filters (${activeFilterCount})` : 'Filters'}
                    badge={activeFilterCount}
                    onPress={() => (filtersOpen ? closeFilters() : openFilters())}
                  />
                }
              />
              {filtersOpen ? (
                <TransactionFilters
                  filters={draftFilters}
                  onChange={setDraftFilters}
                  onApply={applyFilters}
                  onClear={clearFilters}
                  categories={categories ?? []}
                  sources={sources}
                />
              ) : null}
            </div>
          }
        />
      }
      data={isLoading ? [] : transactions}
      keyExtractor={(item: Transaction) => item.id}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
      }}
      ListFooterComponent={
        isFetchingNextPage ? <ListRowsSkeleton count={2} variant="transaction" /> : null
      }
      renderItem={(txn) => (
        <TransactionRow
          transaction={txn}
          onPress={() => router.push(txn.type === 'income' ? `/income/${txn.id}` : `/expense/${txn.id}`)}
        />
      )}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={6} variant="transaction" />
        ) : isError ? (
          <EmptyState
            title="Couldn’t load activity"
            subtitle="Check your connection and try again"
            icon="activity"
            action="Retry"
            onAction={() => void refetch()}
          />
        ) : activeFilterCount > 0 ? (
          <EmptyState
            title="No matching transactions"
            subtitle="Try adjusting your filters"
            icon="activity"
            action="Clear filters"
            onAction={() => commitFilters({ ...DEFAULT_TRANSACTION_FILTERS })}
          />
        ) : (
          <EmptyState
            title="No transactions yet"
            subtitle="Your income and spending history will appear here"
            icon="activity"
            action="Add expense"
            onAction={() => router.push('/expense/add')}
          />
        )
      }
    />
  );
}

export function ExpensesPage() {
  return (
    <Suspense fallback={<ListRowsSkeleton count={6} variant="transaction" />}>
      <ExpensesPageContent />
    </Suspense>
  );
}
