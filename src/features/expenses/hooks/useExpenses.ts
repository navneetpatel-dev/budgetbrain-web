import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import type { Transaction } from '@/shared/types';

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: () => apiGet<{ transactions: Transaction[]; total: number }>('/expenses', { page: 1, limit: 50 }),
    select: (data) => data,
  });
}

export function useExpenseDetail(id: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: txn, isLoading } = useQuery({
    queryKey: ['expense', id],
    queryFn: () => apiGet<Transaction>(`/expenses/${id}`),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch<Transaction>(`/expenses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditing(false);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(-1);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => apiPost(`/expenses/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(-1);
    },
  });

  const startEdit = () => {
    if (!txn) return;
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setError(null); };

  return {
    txn, isLoading, editing, error, setError,
    startEdit, cancelEdit,
    updateMutation, deleteMutation, duplicateMutation,
  };
}

export function useCreateExpense() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost<Transaction>('/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(-1);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to add expense')),
  });

  return { createMutation: mutation, error, setError };
}
