'use client';

import React from 'react';
import { TransactionRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { EmptyState } from '@/shared/components/ui/index';
import type { Transaction } from '@/shared/types';

export interface ExpenseListProps {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  activeFilterCount: number;
  onSelectTransaction: (txn: Transaction) => void;
  onRetry: () => void;
  onClearFilters: () => void;
  onAddExpense: () => void;
}

export function ExpenseList({
  transactions,
  isLoading,
  isError,
  activeFilterCount,
  onSelectTransaction,
  onRetry,
  onClearFilters,
  onAddExpense,
}: ExpenseListProps) {
  if (isLoading) {
    return <ListRowsSkeleton count={6} variant="transaction" />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Couldn’t load activity"
        subtitle="Check your connection and try again"
        icon="activity"
        action="Retry"
        onAction={onRetry}
      />
    );
  }

  if (transactions.length === 0) {
    if (activeFilterCount > 0) {
      return (
        <EmptyState
          title="No matching transactions"
          subtitle="Try adjusting your filters"
          icon="activity"
          action="Clear filters"
          onAction={onClearFilters}
        />
      );
    }
    return (
      <EmptyState
        title="No transactions yet"
        subtitle="Your income and spending history will appear here"
        icon="activity"
        action="Add expense"
        onAction={onAddExpense}
      />
    );
  }

  return (
    <div className="flex flex-col">
      {transactions.map((txn) => (
        <TransactionRow
          key={txn.id}
          transaction={txn}
          onPress={() => onSelectTransaction(txn)}
        />
      ))}
    </div>
  );
}
