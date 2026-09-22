'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import { invalidateBudgetQueries, removeBudgetDetail } from '@/shared/services/queryInvalidation';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { Budget } from '@/shared/types';

export function useBudgets() {
  return usePaginatedList<Budget, 'budgets'>({
    queryKey: ['budgets'],
    url: '/budgets',
    itemsKey: 'budgets',
  });
}

export function useBudgetDetail(id: string | undefined) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: budget, isLoading, isError, refetch, isPlaceholderData } = useQuery({
    queryKey: ['budget', id],
    queryFn: () => apiGet<Budget>(`/budgets/${id}`),
    enabled: !!id,
    placeholderData: undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch<Budget>(`/budgets/${id}`, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['budget', id], updated);
      invalidateBudgetQueries(queryClient, id);
      setEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/budgets/${id}`),
    onSuccess: () => {
      if (id) removeBudgetDetail(queryClient, id);
      invalidateBudgetQueries(queryClient);
      router.back();
    },
  });

  return {
    budget: isPlaceholderData ? undefined : budget,
    isLoading,
    isError,
    refetch,
    editing,
    error,
    setError,
    setEditing,
    updateMutation,
    deleteMutation,
    showSuccess,
  };
}

export function useCreateBudget() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost<Budget>('/budgets', data),
    onSuccess: () => {
      invalidateBudgetQueries(queryClient);
      setShowSuccess(true);
      setTimeout(() => router.back(), 900);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to create budget')),
  });

  return { createMutation: mutation, error, setError, showSuccess };
}