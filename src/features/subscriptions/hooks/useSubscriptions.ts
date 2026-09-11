import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost<RecurringSeries>('/recurring-series', data),
    onSuccess: () => {
      invalidate(queryClient);
      navigate(-1);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to add subscription')),
  });

  return { createMutation: mutation, error, setError };
}

export function useDismissRecurringSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/recurring-series/${id}`, { active: false }),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteRecurringSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/recurring-series/${id}`),
    onSuccess: () => invalidate(queryClient),
  });
}
