'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiPatch, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { Investment } from '@/shared/types';

export function useInvestments() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading } = usePaginatedList<Investment, 'investments'>({
    queryKey: ['investments'],
    url: '/investments',
    itemsKey: 'investments',
  });

  const createMutation = useMutation({
    mutationFn: (d: {
      name: string;
      type: string;
      symbol?: string;
      quantity: number;
      purchasePrice: number;
      currentPrice?: number;
      purchaseDate: string;
      currency?: string;
    }) => apiPost('/investments', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...d
    }: {
      id: string;
      currentPrice: number;
      quantity?: number;
    }) => apiPatch(`/investments/${id}`, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return { investments: data, isLoading, createMutation, updateMutation, error, setError };
}