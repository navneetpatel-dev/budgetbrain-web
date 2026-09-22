'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { Transaction, IncomeSource } from '@/shared/types';

export function useIncome() {
  return usePaginatedList<Transaction, 'transactions'>({
    queryKey: ['income-list'],
    url: '/income',
    itemsKey: 'transactions',
    pageSize: 50,
  });
}

export function useIncomeDetail(id: string | undefined) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: income, isLoading, isError, refetch, isPlaceholderData } = useQuery({
    queryKey: ['income', id],
    queryFn: () => apiGet<Transaction>(`/income/${id}`),
    enabled: !!id,
    placeholderData: undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch<Transaction>(`/income/${id}`, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['income', id], updated);
      void queryClient.invalidateQueries({ queryKey: ['income', id] });
      invalidateMoneyQueries(queryClient);
      setEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/income/${id}`),
    onSuccess: () => {
      if (id) void queryClient.removeQueries({ queryKey: ['income', id] });
      invalidateMoneyQueries(queryClient);
      router.back();
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => apiPost(`/income/${id}/duplicate`),
    onSuccess: () => {
      invalidateMoneyQueries(queryClient);
      router.back();
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not duplicate income')),
  });

  const allocateMutation = useMutation({
    mutationFn: (allocations: { financialAccountId: string; amount: number }[]) =>
      apiPost<{ id: string; financialAccountId: string; amount: number }[]>(
        `/income/${id}/allocate`,
        { allocations }
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['income', id] });
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      invalidateMoneyQueries(queryClient);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not save allocation')),
  });

  return {
    income: isPlaceholderData ? undefined : income,
    isLoading,
    isError,
    refetch,
    editing,
    error,
    setError,
    setEditing,
    updateMutation,
    deleteMutation,
    duplicateMutation,
    allocateMutation,
    showSuccess,
  };
}

export function useCreateIncome() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      let incomeSourceId = data.incomeSourceId as string;
      if (data.newSourceName) {
        const source = await apiPost<IncomeSource>('/income/sources', {
          name: data.newSourceName,
          type: (data.newSourceType as string) || 'salary',
        });
        incomeSourceId = source.id;
        queryClient.invalidateQueries({ queryKey: ['income-sources'] });
      }
      return apiPost<Transaction>('/income', {
        amount: Number(data.amount),
        notes: data.notes || undefined,
        date: data.date,
        incomeSourceId: incomeSourceId || undefined,
      });
    },
    onSuccess: () => {
      invalidateMoneyQueries(queryClient);
      setShowSuccess(true);
      setTimeout(() => router.back(), 900);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to save income')),
  });

  return { createMutation: mutation, error, setError, showSuccess };
}

export function useIncomeSources() {
  return usePaginatedList<IncomeSource, 'sources'>({
    queryKey: ['income-sources'],
    url: '/income/sources',
    itemsKey: 'sources',
  });
}