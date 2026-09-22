import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { ParsedTransactionPending } from '@/shared/types';

export function useIntegrations() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = usePaginatedList<ParsedTransactionPending, 'pending'>({
    queryKey: ['integrations-pending'],
    url: '/integrations/pending',
    itemsKey: 'pending',
  });

  const parseSmsMutation = useMutation({
    mutationFn: (d: { content: string }) => apiPost('/integrations/sms', d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations-pending'] }),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const parseEmailMutation = useMutation({
    mutationFn: (d: { subject: string; body: string }) => apiPost('/integrations/email', d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations-pending'] }),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, categoryId }: { id: string; categoryId: string }) =>
      apiPost(`/integrations/${id}/confirm`, { categoryId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations-pending'] });
      invalidateMoneyQueries(queryClient);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/integrations/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations-pending'] }),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return {
    pending: data,
    isLoading,
    parseSmsMutation,
    parseEmailMutation,
    confirmMutation,
    rejectMutation,
    error,
    setError,
  };
}
