import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { ensureArray } from '@/shared/utils/listData';
import type { FinancialAccount, Investment, NotificationItem, ParsedTransactionPending } from '@/shared/types';
import { useState } from 'react';

export function useAccounts() {
  const { data } = usePaginatedList<FinancialAccount, 'accounts'>({
    queryKey: ['accounts'],
    url: '/accounts',
    itemsKey: 'accounts',
  });
  return { accounts: data };
}

export function useInvestments() {
  const { data } = usePaginatedList<Investment, 'investments'>({
    queryKey: ['investments'],
    url: '/investments',
    itemsKey: 'investments',
  });
  return { investments: data };
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => apiGet<{ transactions: import('@/shared/types').Transaction[]; total: number }>('/expenses/search', { q: query, page: 1, limit: 50 }),
    enabled: query.length >= 2,
    select: (data) => ({ transactions: ensureArray(data.transactions) }),
  });
}

export function useFamily() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data } = usePaginatedList<{ id: string; groupId: string; role: string; group?: { id: string; name: string; inviteCode: string } }, 'memberships'>({
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

  return { memberships: data, createMutation, joinMutation, error, setError };
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
    url: '/support/tickets',
    itemsKey: 'tickets',
  });

  const createMutation = useMutation({
    mutationFn: (d: { subject: string; message: string }) => apiPost('/support/tickets', d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support-tickets'] }),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return { tickets: data, isLoading, createMutation, error, setError };
}

export function useIntegrations() {
  const queryClient = useQueryClient();

  const { data, isLoading } = usePaginatedList<ParsedTransactionPending, 'pending'>({
    queryKey: ['integrations-pending'],
    url: '/integrations/pending',
    itemsKey: 'pending',
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/integrations/${id}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations-pending'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/integrations/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations-pending'] }),
  });

  return { pending: data, isLoading, confirmMutation, rejectMutation };
}

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async (format: 'csv' | 'pdf', params?: Record<string, string>) => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const search = params ? `?${new URLSearchParams(params).toString()}` : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'}/reports/${format}${search}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `report.${format}`; a.click();
      URL.revokeObjectURL(url);
    } catch { setError('Download failed'); }
    finally { setLoading(false); }
  };

  return { download, loading, error };
}
