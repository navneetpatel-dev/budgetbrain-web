'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/services/api';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { deleteRule, fetchRules, resetRules, updateRule } from '../../api/detection/detection.api';
import { DETECTION_KEY } from './useReviewInbox.hook';

const RULES_KEY = [...DETECTION_KEY, 'rules'] as const;

/** Learned merchant → category rules (plan T6.4 rules manager): view, change, forget. */
export function useDetectionRules() {
  const queryClient = useQueryClient();
  const dialog = useConfirmDialog();
  const rules = useQuery({ queryKey: RULES_KEY, queryFn: fetchRules });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: RULES_KEY });

  const update = useMutation({ mutationFn: ({ id, categoryId }: { id: string; categoryId: string }) => updateRule(id, categoryId), onSuccess: refresh });
  const remove = useMutation({ mutationFn: deleteRule, onSuccess: refresh });
  const reset = useMutation({ mutationFn: resetRules, onSuccess: refresh });

  const handleReset = async () => {
    const ok = await dialog.confirm({
      title: 'Forget all learned rules?',
      message: 'New detections will use the category the knowledge base suggests until you correct them again.',
      confirmLabel: 'Forget all',
      cancelLabel: 'Keep',
      destructive: true,
    });
    if (ok) reset.mutate();
  };

  const error = update.error ?? remove.error ?? reset.error;
  return {
    rules: rules.data ?? [],
    isLoading: rules.isLoading,
    isError: rules.isError,
    retry: () => void rules.refetch(),
    changeCategory: (id: string, categoryId: string) => update.mutate({ id, categoryId }),
    removeRule: (id: string) => remove.mutate(id),
    resetAll: () => void handleReset(),
    isResetting: reset.isPending,
    dialog,
    error: error ? getApiErrorMessage(error, 'Could not update the rule') : null,
  };
}
