import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  });
}

export function useGoalDetail(id: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: goal, isLoading, isError, refetch, isPlaceholderData } = useQuery({
    queryKey: ['goal', id],
    queryFn: () => apiGet<Goal>(`/goals/${id}`),
    enabled: !!id,
    placeholderData: undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch<Goal>(`/goals/${id}`, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['goal', id], updated);
      invalidateGoalQueries(queryClient, id);
      setEditing(false);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/goals/${id}`),
    onSuccess: () => {
      if (id) removeGoalDetail(queryClient, id);
      invalidateGoalQueries(queryClient);
      navigate(-1);
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
  };
}

export function useCreateGoal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost<Goal>('/goals', data),
    onSuccess: () => {
      invalidateGoalQueries(queryClient);
      navigate(-1);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to create goal')),
  });

  return { createMutation: mutation, error, setError };
}

export function useContributeGoal(id: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: { amount: number; notes?: string }) =>
      apiPost<{ goal: Goal }>(`/goals/${id}/contribute`, data),
    onSuccess: (result) => {
      if (id && result?.goal) {
        queryClient.setQueryData(['goal', id], result.goal);
      }
      invalidateGoalQueries(queryClient, id);
      navigate(-1);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Contribution failed')),
  });

  return { contributeMutation: mutation, error, setError };
}
