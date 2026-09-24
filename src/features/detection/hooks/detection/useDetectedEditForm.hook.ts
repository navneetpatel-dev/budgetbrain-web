'use client';

import { useState, type ChangeEvent } from 'react';
import { allowedTypes, buildConfirmOverrides, initialEditValues, type DetectedEditValues } from '../../utils/confirmOverrides';
import type { ConfirmOverrides, DetectedTransaction } from '../../types/detection.types';

/** The inline Edit form of one review item: merchant, type, category, account and note. */
export function useDetectedEditForm(item: DetectedTransaction, onSave: (item: DetectedTransaction, overrides: ConfirmOverrides) => void) {
  const [values, setValues] = useState<DetectedEditValues>(() => initialEditValues(item));
  const set = <K extends keyof DetectedEditValues>(key: K) => (value: DetectedEditValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  return {
    values,
    typeOptions: allowedTypes(item.direction),
    showCategory: values.transactionType !== 'transfer',
    setMerchant: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set('merchant')(e.target.value),
    setNotes: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set('notes')(e.target.value),
    setTransactionType: set('transactionType'),
    setCategoryId: set('categoryId'),
    setFinancialAccountId: set('financialAccountId'),
    save: () => onSave(item, buildConfirmOverrides(item, values)),
  };
}
