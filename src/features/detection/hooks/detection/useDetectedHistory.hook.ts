'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { fetchDetected, undoDetected } from '../../api/detection/detection.api';
import type { DetectedStatus } from '../../types/detection.types';
import { DETECTION_KEY } from './useReviewInbox.hook';

export type HistoryFilter = 'added' | 'auto' | 'confirmed' | 'transfers';

const STATUS: Record<HistoryFilter, DetectedStatus | undefined> = {
  added: undefined,
  auto: 'auto_approved',
  confirmed: 'user_confirmed',
  transfers: undefined,
};

export const HISTORY_FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: 'added', label: 'All added' },
  { id: 'auto', label: 'Added automatically' },
  { id: 'confirmed', label: 'Confirmed by you' },
  { id: 'transfers', label: 'Transfers' },
];

/** Detected transactions that became ledger entries, with Undo (plan T6.4, T5.5). */
export function useDetectedHistory() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<HistoryFilter>('added');
  const list = useQuery({
    queryKey: [...DETECTION_KEY, 'history', filter],
    queryFn: () => fetchDetected({ status: STATUS[filter], limit: 100 }),
  });

  const undo = useMutation({
    mutationFn: (id: string) => undoDetected(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DETECTION_KEY });
      invalidateMoneyQueries(queryClient);
    },
  });

  // Only rows that became transactions can be undone; transfers are filtered by type.
  const items = useMemo(
    () =>
      (list.data?.items ?? []).filter(
        (i) => !!i.createdTransactionId && (filter !== 'transfers' || i.transactionType === 'transfer')
      ),
    [list.data, filter]
  );

  return {
    filter,
    setFilter: (id: string) => setFilter(id as HistoryFilter),
    items,
    isLoading: list.isLoading,
    isError: list.isError,
    retry: () => void list.refetch(),
    undoItem: (id: string) => undo.mutate(id),
    busyId: undo.isPending ? undo.variables : undefined,
    error: undo.error ? getApiErrorMessage(undo.error, 'Could not undo this transaction') : null,
  };
}
