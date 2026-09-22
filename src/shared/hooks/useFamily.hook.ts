'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { ensureArray } from '@/shared/utils/listData';
import type { ExpenseSplitParticipant, FamilyGroupMember, SplitBalance, Transaction } from '@/shared/types';

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

export function useCreateFamilyInvite(groupId: string | undefined) {
  return useMutation({
    mutationFn: (d: { invitedEmail: string; role: 'admin' | 'contributor' | 'read_only' }) =>
      apiPost<{ id: string; invitedEmail: string; role: string; expiresAt: string }>(
        `/family/groups/${groupId}/invites`,
        d
      ),
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