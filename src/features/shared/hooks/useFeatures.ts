import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiDownloadBinary, apiGet, apiPatch, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { ensureArray } from '@/shared/utils/listData';
import type { ExpenseSplitParticipant, FamilyGroupMember, FinancialAccount, Investment, NotificationItem, ParsedTransactionPending, SplitBalance, Transaction } from '@/shared/types';
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
  const [showCreateSuccess, setShowCreateSuccess] = useState(false);
  const [showJoinSuccess, setShowJoinSuccess] = useState(false);

  const { data, isLoading } = usePaginatedList<{ id: string; groupId: string; role: string; group?: { id: string; name: string; inviteCode: string } }, 'memberships'>({
    queryKey: ['family'],
    url: '/family/groups',
    itemsKey: 'memberships',
  });

  const createMutation = useMutation({
    mutationFn: (d: { name: string }) => apiPost('/family/groups', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] });
      setShowCreateSuccess(true);
      setTimeout(() => setShowCreateSuccess(false), 2000);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });
  const joinMutation = useMutation({
    mutationFn: (d: { inviteCode: string }) => apiPost('/family/join', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] });
      setShowJoinSuccess(true);
      setTimeout(() => setShowJoinSuccess(false), 2000);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return { memberships: data, isLoading, createMutation, joinMutation, error, setError, showCreateSuccess, showJoinSuccess };
}

export function useFamilyMembers(groupId: string | undefined) {
  return useQuery({
    queryKey: ['family-members', groupId],
    queryFn: () => apiGet<{ members: FamilyGroupMember[] }>(`/family/groups/${groupId}/members`),
    enabled: !!groupId,
    select: (d) => ensureArray<FamilyGroupMember>(d.members),
  });
}

export function useRemoveMember(groupId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiDelete(`/family/groups/${groupId}/members/${userId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family-members', groupId] });
      void queryClient.invalidateQueries({ queryKey: ['family'] });
    },
  });
}

export function useUpdateMemberRole(groupId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'owner' | 'admin' | 'contributor' | 'read_only' }) =>
      apiPatch(`/family/groups/${groupId}/members/${userId}`, { role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family-members', groupId] });
      void queryClient.invalidateQueries({ queryKey: ['family'] });
    },
  });
}

export function useFamilyBalances(groupId: string | undefined) {
  return useQuery({
    queryKey: ['family-balances', groupId],
    queryFn: () => apiGet<{ balances: SplitBalance[] }>(`/family/groups/${groupId}/balances`),
    enabled: !!groupId,
    select: (d) => ensureArray<SplitBalance>(d.balances),
  });
}

export type PendingSplit = ExpenseSplitParticipant & { transaction?: Pick<Transaction, 'id' | 'merchant' | 'amount' | 'date'> & { userId?: string } };

/** Individual unsettled splits (not the aggregated balances) so each can be settled one at a time. */
export function useGroupSplits(groupId: string | undefined) {
  return usePaginatedList<PendingSplit, 'splits'>({
    queryKey: ['family-splits', groupId],
    url: `/family/groups/${groupId}/splits`,
    itemsKey: 'splits',
    enabled: !!groupId,
  });
}

export function useSettleSplit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (splitId: string) => apiPost(`/family/splits/${splitId}/settle`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family-splits'] });
      void queryClient.invalidateQueries({ queryKey: ['family-balances'] });
    },
  });
}

export function useCreateSplit() {
  return useMutation({
    mutationFn: ({
      groupId,
      transactionId,
      participants,
    }: {
      groupId: string;
      transactionId: string;
      participants: { userId: string; shareAmount: number }[];
    }) => apiPost(`/family/groups/${groupId}/splits`, { transactionId, participants }),
  });
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const { data, isLoading } = usePaginatedList<NotificationItem, 'notifications'>({
    queryKey: ['notifications'],
    url: '/notifications',
    itemsKey: 'notifications',
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiPatch(`/notifications/${id}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return { notifications: data, isLoading, markAsRead: markAsReadMutation.mutate };
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

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async (format: 'csv' | 'pdf' | 'excel', params?: Record<string, string>) => {
    setLoading(true); setError(null);
    try {
      const blob = await apiDownloadBinary(`/reports/${format}`, params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = format === 'excel' ? 'xlsx' : format;
      a.href = url; a.download = `report.${ext}`; a.click();
      URL.revokeObjectURL(url);
    } catch { setError('Download failed'); }
    finally { setLoading(false); }
  };

  return { download, loading, error };
}
