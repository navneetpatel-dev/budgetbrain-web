import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/budgets/${id}`),
    onSuccess: () => {
      if (id) removeBudgetDetail(queryClient, id);
      invalidateBudgetQueries(queryClient);
      navigate(-1);
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
  };
}

export function useCreateBudget() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost<Budget>('/budgets', data),
    onSuccess: () => {
      invalidateBudgetQueries(queryClient);
      navigate(-1);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to create budget')),
  });

  return { createMutation: mutation, error, setError };
}
