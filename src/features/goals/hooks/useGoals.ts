import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
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

  const { data: goal, isLoading } = useQuery({
    queryKey: ['goal', id],
    queryFn: () => apiGet<Goal>(`/goals/${id}`),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch<Goal>(`/goals/${id}`, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['goal', id], updated);
      queryClient.invalidateQueries({ queryKey: ['goal', id] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditing(false);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(-1);
    },
  });

  return { goal, isLoading, editing, error, setError, setEditing, updateMutation, deleteMutation };
}

export function useCreateGoal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost<Goal>('/goals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
    mutationFn: (data: { amount: number; notes?: string }) => apiPost(`/goals/${id}/contribute`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(-1);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Contribution failed')),
  });

  return { contributeMutation: mutation, error, setError };
}
