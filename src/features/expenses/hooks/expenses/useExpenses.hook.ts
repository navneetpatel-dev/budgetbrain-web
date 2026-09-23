'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { useInfinitePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { Transaction, TransactionsSummary } from '@/shared/types';
import { toExpenseListParams, type TransactionListFilters } from '../../utils/transactionFilters';

export function useExpenses(filters: TransactionListFilters) {
  const params = toExpenseListParams(filters);
  return useInfinitePaginatedList<Transaction, TransactionsSummary>({
    queryKey: ['expenses', 'filtered'],
    url: '/expenses',
    itemsKey: 'transactions',
    params,
    pageSize: 20,
  });
}

export function useExpenseDetail(id: string | undefined) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: txn, isLoading, isError, refetch, isPlaceholderData } = useQuery({
    queryKey: ['expense', id],
    queryFn: () => apiGet<Transaction>(`/expenses/${id}`),
    enabled: !!id,
    placeholderData: undefined,
    // Invalidated on its own update mutation below — staleness is bounded by that.
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch<Transaction>(`/expenses/${id}`, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['expense', id], updated);
      void queryClient.invalidateQueries({ queryKey: ['expense', id] });
      invalidateMoneyQueries(queryClient);
      setEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/expenses/${id}`),
    onSuccess: () => {
      if (id) void queryClient.removeQueries({ queryKey: ['expense', id] });
      invalidateMoneyQueries(queryClient);
      router.back();
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => apiPost(`/expenses/${id}/duplicate`),
    onSuccess: () => {
      invalidateMoneyQueries(queryClient);
      router.back();
    },
  });

  const startEdit = () => {
    if (!txn) return;
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setError(null); };

  return {
    txn: isPlaceholderData ? undefined : txn,
    isLoading,
    isError,
    refetch,
    editing,
    error,
    setError,
    startEdit,
    cancelEdit,
    updateMutation,
    deleteMutation,
    duplicateMutation,
    showSuccess,
  };
}

export function useCreateExpense() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost<Transaction>('/expenses', data),
    onSuccess: () => {
      invalidateMoneyQueries(queryClient);
      setShowSuccess(true);
      // Brief confirmation before leaving, instead of an instant navigate-away.
      setTimeout(() => router.back(), 900);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to add expense')),
  });

  return { createMutation: mutation, error, setError, showSuccess };
}