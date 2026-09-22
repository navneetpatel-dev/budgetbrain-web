'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';

export function useSupportTickets() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = usePaginatedList<{ id: string; subject: string; status: string; createdAt: string }, 'tickets'>({
    queryKey: ['support-tickets'],
    url: '/support',
    itemsKey: 'tickets',
  });

  const createMutation = useMutation({
    mutationFn: (d: { subject: string; message: string }) => apiPost('/support', d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support-tickets'] }),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return { tickets: data, isLoading, createMutation, error, setError };
}