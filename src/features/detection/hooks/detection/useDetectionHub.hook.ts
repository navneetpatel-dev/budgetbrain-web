'use client';

import { useState, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import {
  deleteMyDetectedData,
  fetchConfig,
  fetchInstitutions,
  fetchSyncState,
  ingestMessage,
  updateAutoAdd,
} from '../../api/detection/detection.api';
import type { IngestResponse } from '../../types/detection.types';
import { ignoreReasonMessage } from '../../utils/detectionLabels';
import { DETECTION_KEY } from './useReviewInbox.hook';

const STATUS_KEY = [...DETECTION_KEY, 'sync-state'] as const;
const CONFIG_KEY = [...DETECTION_KEY, 'config'] as const;

export type PasteKind = 'sms' | 'email';

function resultMessage(result: IngestResponse): { tone: 'success' | 'info' | 'error'; text: string } {
  switch (result.status) {
    case 'created':
      return { tone: 'success', text: 'Added to your transactions.' };
    case 'needs_review':
      return { tone: 'info', text: 'Found a transaction. It is waiting for you in Review.' };
    case 'already_synced':
      return { tone: 'info', text: 'You already have this transaction.' };
    case 'validation_error':
      return { tone: 'error', text: "The details in this message didn't pass our checks." };
    default:
      return { tone: 'error', text: ignoreReasonMessage(result.reason) };
  }
}

/**
 * The auto-tracking hub (plan T6.4): where detections come from, the auto-add choice, "delete
 * my detected data", and pasting a bank message or email (T6.2).
 */
export function useDetectionHub() {
  const queryClient = useQueryClient();
  const dialog = useConfirmDialog();
  const status = useQuery({ queryKey: STATUS_KEY, queryFn: fetchSyncState });
  const config = useQuery({ queryKey: CONFIG_KEY, queryFn: fetchConfig });

  const autoAdd = useMutation({
    mutationFn: updateAutoAdd,
    onSuccess: (next) => queryClient.setQueryData(CONFIG_KEY, next),
  });

  const deleteAll = useMutation({
    mutationFn: deleteMyDetectedData,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DETECTION_KEY });
      invalidateMoneyQueries(queryClient);
    },
  });
  const handleDeleteAll = async () => {
    const ok = await dialog.confirm({
      title: 'Delete your detected data?',
      message:
        'This deletes every detected transaction waiting for review or in your detection history. Transactions you already added stay in your records. Phones keep their own copy until you delete it there too.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      destructive: true,
    });
    if (ok) deleteAll.mutate();
  };

  // Paste a bank message or forward an email (T6.2).
  const [kind, setKind] = useState<PasteKind>('sms');
  const [text, setText] = useState('');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [needsBank, setNeedsBank] = useState(false);
  const institutions = useQuery({ queryKey: [...DETECTION_KEY, 'institutions'], queryFn: fetchInstitutions, enabled: needsBank, staleTime: 60 * 60 * 1000 });

  const ingest = useMutation({
    mutationFn: ingestMessage,
    onSuccess: (result) => {
      if (result.status === 'ignored' && result.reason === 'unknown_sender') {
        setNeedsBank(true);
        return;
      }
      if (result.status !== 'ignored' && result.status !== 'validation_error') {
        setText('');
        setSubject('');
        setNeedsBank(false);
        void queryClient.invalidateQueries({ queryKey: DETECTION_KEY });
        invalidateMoneyQueries(queryClient);
      }
    },
  });

  const submitPaste = () => {
    if (!text.trim()) return;
    ingest.mutate({
      kind,
      text,
      sender: sender.trim() || null,
      subject: kind === 'email' ? subject.trim() || null : null,
      institutionId: institutionId || null,
    });
  };

  const onInput = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setter(e.target.value);
  const error = autoAdd.error ?? deleteAll.error;
  return {
    status: status.data ?? null,
    isLoading: status.isLoading || config.isLoading,
    serverEnabled: config.data?.enabled ?? true,
    autoAddHighConfidence: autoAdd.isPending ? !!autoAdd.variables : (config.data?.autoAddHighConfidence ?? true),
    setAutoAdd: (value: boolean) => autoAdd.mutate(value),
    deleteAll: () => void handleDeleteAll(),
    isDeleting: deleteAll.isPending,
    deletedCount: deleteAll.data?.deleted ?? null,
    dialog,
    error: error ? getApiErrorMessage(error, 'Could not save this change') : null,
    paste: {
      kind,
      setKind: (value: PasteKind) => setKind(value),
      text,
      sender,
      subject,
      institutionId,
      onText: onInput(setText),
      onSender: onInput(setSender),
      onSubject: onInput(setSubject),
      setInstitutionId,
      needsBank,
      institutionIds: (institutions.data ?? []).map((i) => i.id),
      institutionLabel: (id: string) => institutions.data?.find((i) => i.id === id)?.name ?? id,
      submit: submitPaste,
      isSubmitting: ingest.isPending,
      result: ingest.data && !(ingest.data.status === 'ignored' && ingest.data.reason === 'unknown_sender') ? resultMessage(ingest.data) : null,
      requestError: ingest.error ? getApiErrorMessage(ingest.error, 'Could not read this message') : null,
    },
  };
}
