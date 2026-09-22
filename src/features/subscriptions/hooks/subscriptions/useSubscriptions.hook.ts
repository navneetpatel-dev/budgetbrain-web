'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/services/api';
import { createRecurringSeries, deleteRecurringSeries, dismissRecurringSeries } from '../../api/subscriptions.api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { RecurringSeries } from '@/shared/types';

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['recurring-series'] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useRecurringSeriesList() {
  return usePaginatedList<RecurringSeries, 'recurringSeries'>({
    queryKey: ['recurring-series'],
    url: '/recurring-series',
    itemsKey: 'recurringSeries',
  });
}

export function useCreateRecurringSeries() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createRecurringSeries(data),
    onSuccess: () => {
      invalidate(queryClient);
      setShowSuccess(true);
      setTimeout(() => router.back(), 900);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to add subscription')),
  });

  return { createMutation: mutation, error, setError, showSuccess };
}

export function useDismissRecurringSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dismissRecurringSeries(id),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteRecurringSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecurringSeries(id),
    onSuccess: () => invalidate(queryClient),
  });
}
