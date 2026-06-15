import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import type { Transaction, IncomeSource } from '@/shared/types';

export function useIncome() {
  return useQuery({
    queryKey: ['income-list'],
    queryFn: () => apiGet<Transaction[]>('/income', { page: 1, limit: 50 }),
  });
}

export function useIncomeDetail(id: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: income, isLoading } = useQuery({
    queryKey: ['income', id],
    queryFn: () => apiGet<Transaction>(`/income/${id}`),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch<Transaction>(`/income/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditing(false);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/income/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(-1);
    },
  });

  return { income, isLoading, editing, error, setError, setEditing, updateMutation, deleteMutation };
}

export function useCreateIncome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      let incomeSourceId = data.incomeSourceId as string;
      if (data.newSourceName) {
        const source = await apiPost<IncomeSource>('/income/sources', {
          name: data.newSourceName,
          type: (data.newSourceType as string) || 'salary',
        });
        incomeSourceId = source.id;
        queryClient.invalidateQueries({ queryKey: ['income-sources'] });
      }
      return apiPost<Transaction>('/income', {
        amount: Number(data.amount),
        notes: data.notes || undefined,
        date: data.date,
        incomeSourceId: incomeSourceId || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(-1);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to save income')),
  });

  return { createMutation: mutation, error, setError };
}

export function useIncomeSources() {
  return useQuery({
    queryKey: ['income-sources'],
    queryFn: () => apiGet<IncomeSource[]>('/income/sources'),
  });
}
