import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { useInfinitePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { Transaction } from '@/shared/types';
import { toExpenseListParams, type TransactionListFilters } from '../utils/transactionFilters';

export function useExpenses(filters: TransactionListFilters) {
  const params = toExpenseListParams(filters);
  return useInfinitePaginatedList<Transaction>({
    queryKey: ['expenses', 'filtered'],
    url: '/expenses',
    itemsKey: 'transactions',
    params,
    pageSize: 20,
  });
}

export function useExpenseDetail(id: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: txn, isLoading, isError, refetch, isPlaceholderData } = useQuery({
    queryKey: ['expense', id],
    queryFn: () => apiGet<Transaction>(`/expenses/${id}`),
    enabled: !!id,
    placeholderData: undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch<Transaction>(`/expenses/${id}`, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['expense', id], updated);
      void queryClient.invalidateQueries({ queryKey: ['expense', id] });
      invalidateMoneyQueries(queryClient);
      setEditing(false);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/expenses/${id}`),
    onSuccess: () => {
      if (id) void queryClient.removeQueries({ queryKey: ['expense', id] });
      invalidateMoneyQueries(queryClient);
      navigate(-1);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => apiPost(`/expenses/${id}/duplicate`),
    onSuccess: () => {
      invalidateMoneyQueries(queryClient);
      navigate(-1);
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
  };
}

export function useCreateExpense() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost<Transaction>('/expenses', data),
    onSuccess: () => {
      invalidateMoneyQueries(queryClient);
      navigate(-1);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to add expense')),
  });

  return { createMutation: mutation, error, setError };
}
