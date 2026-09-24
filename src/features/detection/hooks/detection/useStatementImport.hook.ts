'use client';

import { useState, type ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { importStatement, previewStatement } from '../../api/detection/detection.api';
import type { CsvMapping, DateOrder, ImportOptions } from '../../types/detection.types';
import { isMappingComplete, setMappingColumn, startingMapping } from '../../utils/importMapping';
import { DETECTION_KEY } from './useReviewInbox.hook';

export type MappingColumnKey = 'dateColumn' | 'descriptionColumn' | 'amountColumn' | 'debitColumn' | 'creditColumn' | 'referenceColumn';

/**
 * Statement import (plan T6.5): choose a file, check the preview (and, for a CSV, the columns),
 * then import. The file stays in the browser between the two steps and is sent again to import,
 * so the server never keeps it.
 */
export function useStatementImport() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<Partial<CsvMapping> | null>(null);
  const [financialAccountId, setFinancialAccountId] = useState('');
  const [includeDuplicates, setIncludeDuplicates] = useState(true);

  const options = (): ImportOptions => ({
    ...(isMappingComplete(mapping) ? { mapping } : {}),
    financialAccountId: financialAccountId || null,
    includePossibleDuplicates: includeDuplicates,
  });

  const preview = useMutation({
    mutationFn: ({ f, opts }: { f: File; opts: ImportOptions }) => previewStatement(f, opts),
    onSuccess: (result) => {
      // The first preview of a CSV starts from the server's guess.
      if (result.csv && !mapping) setMapping(startingMapping(result.csv.suggestedMapping));
    },
  });
  const commit = useMutation({
    mutationFn: ({ f, opts }: { f: File; opts: ImportOptions }) => importStatement(f, opts),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DETECTION_KEY });
      invalidateMoneyQueries(queryClient);
    },
  });

  const chooseFile = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null;
    e.target.value = '';
    if (!next) return;
    setFile(next);
    setMapping(null);
    commit.reset();
    preview.mutate({ f: next, opts: { financialAccountId: financialAccountId || null } });
  };

  const csv = preview.data?.csv ?? null;
  const setColumn = (key: MappingColumnKey) => (column: string) => setMapping((m) => setMappingColumn(m ?? {}, key, column));
  const error = preview.error ?? commit.error;

  return {
    fileName: file?.name ?? null,
    chooseFile,
    preview: preview.data ?? null,
    isPreviewing: preview.isPending,
    refreshPreview: () => file && preview.mutate({ f: file, opts: options() }),
    csvColumns: csv?.columns ?? [],
    mapping,
    mappingComplete: isMappingComplete(mapping),
    setColumn,
    setDateOrder: (order: DateOrder) => setMapping((m) => ({ ...(m ?? {}), dateOrder: order })),
    setHeaderRow: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setMapping((m) => ({ ...(m ?? {}), headerRow: Math.max(1, Number(e.target.value) || 1) })),
    financialAccountId,
    setFinancialAccountId,
    includeDuplicates,
    setIncludeDuplicates,
    canImport: !!file && !!preview.data && preview.data.validRows > 0 && (!csv || isMappingComplete(mapping)) && !commit.isPending,
    runImport: () => file && commit.mutate({ f: file, opts: options() }),
    isImporting: commit.isPending,
    result: commit.data ?? null,
    error: error ? getApiErrorMessage(error, 'Could not read this statement') : null,
  };
}
