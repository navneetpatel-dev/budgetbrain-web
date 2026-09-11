import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import { invalidateLoanQueries, removeLoanDetail } from '@/shared/services/queryInvalidation';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { Loan, LoanPayment } from '@/shared/types';

export function useLoans() {
  return usePaginatedList<Loan, 'loans'>({
    queryKey: ['loans'],
    url: '/loans',
    itemsKey: 'loans',
  });
}

export function useLoanDetail(id: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: loan, isLoading, isError, refetch, isPlaceholderData } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => apiGet<Loan>(`/loans/${id}`),
    enabled: !!id,
    placeholderData: undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch<Loan>(`/loans/${id}`, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['loan', id], updated);
      invalidateLoanQueries(queryClient, id);
      setEditing(false);
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/loans/${id}`),
    onSuccess: () => {
      if (id) removeLoanDetail(queryClient, id);
      invalidateLoanQueries(queryClient);
      navigate(-1);
    },
  });

  return {
    loan: isPlaceholderData ? undefined : loan,
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

export function useCreateLoan() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost<Loan>('/loans', data),
    onSuccess: () => {
      invalidateLoanQueries(queryClient);
      navigate(-1);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to create loan')),
  });

  return { createMutation: mutation, error, setError };
}

export function usePayLoan(id: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: { amount: number; notes?: string }) =>
      apiPost<{ payment: LoanPayment; loan: Loan }>(`/loans/${id}/pay`, data),
    onSuccess: (result) => {
      if (id && result?.loan) {
        queryClient.setQueryData(['loan', id], result.loan);
      }
      invalidateLoanQueries(queryClient, id);
      navigate(-1);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Payment failed')),
  });

  return { payMutation: mutation, error, setError };
}
