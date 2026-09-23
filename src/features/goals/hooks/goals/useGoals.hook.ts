'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import { invalidateGoalQueries, removeGoalDetail } from '@/shared/services/queryInvalidation';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { Goal } from '@/shared/types';

export function useGoals() {
  return usePaginatedList<Goal, 'goals'>({
    queryKey: ['goals'],
    url: '/goals',
    itemsKey: 'goals',
    // Every create/update/delete/contribute mutation below already calls
    // invalidateGoalQueries — staleness is bounded by that, not the timer.
    staleTime: 5 * 60 * 1000,
  });
}

export function useGoalDetail(id: string | undefined) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: goal, isLoading, isError, refetch, isPlaceholderData } = useQuery({
    queryKey: ['goal', id],
    queryFn: () => apiGet<Goal>(`/goals/${id}`),
    enabled: !!id,
    placeholderData: undefined,
    // Invalidated on its own update/contribute mutations below — staleness is bounded by that.
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch<Goal>(`/goals/${id}`, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['goal', id], updated);
      invalidateGoalQueries(queryClient, id);
      setEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/goals/${id}`),
    onSuccess: () => {
      if (id) removeGoalDetail(queryClient, id);
      invalidateGoalQueries(queryClient);
      router.back();
    },
  });

  return {
    goal: isPlaceholderData ? undefined : goal,
    isLoading,
    isError,
    refetch,
    editing,
    error,
    setError,
    setEditing,
    updateMutation,
    deleteMutation,
    showSuccess,
  };
}

export function useCreateGoal() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost<Goal>('/goals', data),
    onSuccess: () => {
      invalidateGoalQueries(queryClient);
      setShowSuccess(true);
      setTimeout(() => router.back(), 900);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to create goal')),
  });

  return { createMutation: mutation, error, setError, showSuccess };
}

export function useContributeGoal(id: string | undefined) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: { amount: number; notes?: string }) =>
      apiPost<{ goal: Goal }>(`/goals/${id}/contribute`, data),
    onSuccess: (result) => {
      if (id && result?.goal) {
        queryClient.setQueryData(['goal', id], result.goal);
      }
      invalidateGoalQueries(queryClient, id);
      setShowSuccess(true);
      setTimeout(() => router.back(), 900);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Contribution failed')),
  });

  return { contributeMutation: mutation, error, setError, showSuccess };
}