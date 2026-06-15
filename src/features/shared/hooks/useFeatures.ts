import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import type { Category, FinancialAccount, Investment, NotificationItem, ParsedTransactionPending } from '@/shared/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useCategories() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });

  const createMutation = useMutation({
    mutationFn: (d: { name: string; color: string }) => apiPost('/categories', d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/categories/${id}/archive`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  return { categories: data ?? [], createMutation, archiveMutation, error, setError };
}

export function useAccounts() {
  const { data } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => apiGet<FinancialAccount[]>('/accounts'),
  });
  return { accounts: data ?? [] };
}

export function useInvestments() {
  const { data } = useQuery({
    queryKey: ['investments'],
    queryFn: () => apiGet<Investment[]>('/investments'),
  });
  return { investments: data ?? [] };
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => apiGet<{ transactions: import('@/shared/types').Transaction[] }>('/expenses/search', { q: query, page: 1, limit: 50 }),
    enabled: query.length >= 2,
  });
}

export function useFamily() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['family'],
    queryFn: () => apiGet<Array<{ id: string; groupId: string; role: string; group?: { id: string; name: string; inviteCode: string } }>>('/family/groups'),
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

  return { memberships: data ?? [], createMutation, joinMutation, error, setError };
}

export function useNotifications() {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiGet<NotificationItem[]>('/notifications'),
  });
  return { notifications: data ?? [] };
}

export function useSupportTickets() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => apiGet<Array<{ id: string; subject: string; status: string; createdAt: string }>>('/support/tickets'),
  });

  const createMutation = useMutation({
    mutationFn: (d: { subject: string; message: string }) => apiPost('/support/tickets', d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support-tickets'] }),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return { tickets: data ?? [], createMutation, error, setError };
}

export function useIntegrations() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['integrations-pending'],
    queryFn: () => apiGet<ParsedTransactionPending[]>('/integrations/pending'),
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

  return { pending: data ?? [], confirmMutation, rejectMutation };
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
    } catch (err) { setError('Download failed'); }
    finally { setLoading(false); }
  };

  return { download, loading, error };
}
