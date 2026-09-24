'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { confirmDetected, fetchPending, rejectDetected } from '../../api/detection/detection.api';
import type { ConfirmOverrides, DetectedTransaction } from '../../types/detection.types';

export const DETECTION_KEY = ['detected-transactions'] as const;
const PENDING_KEY = [...DETECTION_KEY, 'pending'] as const;

/** The review inbox (plan T6.4): confirm, edit then confirm, or delete each detected transaction. */
export function useReviewInbox() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const pending = useQuery({ queryKey: PENDING_KEY, queryFn: () => fetchPending(1, 50) });

  const refreshAll = () => {
    void queryClient.invalidateQueries({ queryKey: DETECTION_KEY });
    invalidateMoneyQueries(queryClient);
  };
  const dropLocally = (id: string) =>
    queryClient.setQueryData(PENDING_KEY, (list: typeof pending.data) =>
      list ? { ...list, items: list.items.filter((i) => i.id !== id) } : list
    );

  const confirm = useMutation({
    mutationFn: ({ item, overrides }: { item: DetectedTransaction; overrides: ConfirmOverrides }) => confirmDetected(item.id, overrides),
    onSuccess: (_row, { item }) => {
      dropLocally(item.id);
      setEditingId(null);
      refreshAll();
    },
  });
  const reject = useMutation({
    mutationFn: (id: string) => rejectDetected(id),
    onSuccess: (_row, id) => {
      dropLocally(id);
      void queryClient.invalidateQueries({ queryKey: DETECTION_KEY });
    },
  });

  const mutationError = confirm.error ?? reject.error;
  return {
    items: pending.data?.items ?? [],
    total: pending.data?.pagination.total ?? 0,
    isLoading: pending.isLoading,
    isError: pending.isError,
    retry: () => void pending.refetch(),
    error: mutationError ? getApiErrorMessage(mutationError, 'Could not update this transaction') : null,
    editingId,
    startEdit: (id: string) => setEditingId(id),
    cancelEdit: () => setEditingId(null),
    confirmItem: (item: DetectedTransaction, overrides: ConfirmOverrides = {}) => confirm.mutate({ item, overrides }),
    rejectItem: (id: string) => reject.mutate(id),
    busyId: confirm.isPending ? confirm.variables?.item.id : reject.isPending ? reject.variables : undefined,
  };
}
