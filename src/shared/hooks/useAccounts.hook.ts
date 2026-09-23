'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiPatch, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { FinancialAccount } from '@/shared/types';

export function useAccounts() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = usePaginatedList<FinancialAccount, 'accounts'>({
    queryKey: ['accounts'],
    url: '/accounts',
    itemsKey: 'accounts',
  });

  const createMutation = useMutation({
    mutationFn: (d: {
      name: string;
      type: string;
      institution?: string;
      balance: number;
      accountNumberLast4?: string;
      currency?: string;
    }) => apiPost('/accounts', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: { id: string; name?: string; balance?: number }) =>
      apiPatch(`/accounts/${id}`, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return { accounts: data, isLoading, isError, refetch, createMutation, updateMutation, error, setError };
}