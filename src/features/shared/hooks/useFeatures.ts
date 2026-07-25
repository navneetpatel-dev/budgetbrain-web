import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDownloadBinary, apiGet, apiPatch, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { ensureArray } from '@/shared/utils/listData';
import type { FinancialAccount, Investment, NotificationItem, ParsedTransactionPending } from '@/shared/types';
import { useState } from 'react';
import { FieldLimits } from '@/shared/validation/fieldLimits';

export function useAccounts() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading } = usePaginatedList<FinancialAccount, 'accounts'>({
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

  return { accounts: data, isLoading, createMutation, updateMutation, error, setError };
}

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

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => apiGet<{ transactions: import('@/shared/types').Transaction[]; total: number }>('/expenses/search', { q: query, page: 1, limit: 50 }),
    enabled: query.trim().length >= FieldLimits.search.min,
    select: (data) => ({ transactions: ensureArray(data.transactions) }),
  });
}

export function useFamily() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = usePaginatedList<{ id: string; groupId: string; role: string; group?: { id: string; name: string; inviteCode: string } }, 'memberships'>({
    queryKey: ['family'],
    url: '/family/groups',
    itemsKey: 'memberships',
  });

  const createMutation = useMutation({
    mutationFn: (d: { name: string }) => apiPost('/family/groups', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['family'] }); },
    onError: (err) => setError(getApiErrorMessage(err)),
  });
  const joinMutation = useMutation({
    mutationFn: (d: { inviteCode: string }) => apiPost('/family/join', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['family'] }); },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return { memberships: data, isLoading, createMutation, joinMutation, error, setError };
}

export function useNotifications() {
  const { data, isLoading } = usePaginatedList<NotificationItem, 'notifications'>({
    queryKey: ['notifications'],
    url: '/notifications',
    itemsKey: 'notifications',
  });
  return { notifications: data, isLoading };
}

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
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async (format: 'csv' | 'pdf', params?: Record<string, string>) => {
    setLoading(true); setError(null);
    try {
      const blob = await apiDownloadBinary(`/reports/${format}`, params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `report.${format}`; a.click();
      URL.revokeObjectURL(url);
    } catch { setError('Download failed'); }
    finally { setLoading(false); }
  };

  return { download, loading, error };
}
