import type { ConfirmOverrides, DetectedTransaction, DetectedType, Direction } from '../types/detection.types';

/** What the edit form holds; empty strings mean "none". */
export interface DetectedEditValues {
  merchant: string;
  transactionType: DetectedType;
  categoryId: string;
  financialAccountId: string;
  notes: string;
}

/** Money out can only be an expense or a transfer; money in an income, refund or transfer. */
export function allowedTypes(direction: Direction): DetectedType[] {
  return direction === 'DEBIT' ? ['expense', 'transfer'] : ['income', 'refund', 'transfer'];
}

export function initialEditValues(item: DetectedTransaction): DetectedEditValues {
  return {
    merchant: item.merchant ?? '',
    transactionType: item.transactionType,
    categoryId: item.categoryId ?? '',
    financialAccountId: item.financialAccountId ?? '',
    notes: '',
  };
}

/**
 * Only the fields the user changed (plan T5.2): the server learns merchant → category from a
 * changed category or merchant, so an untouched field must not be sent as a correction.
 */
export function buildConfirmOverrides(item: DetectedTransaction, values: DetectedEditValues): ConfirmOverrides {
  const overrides: ConfirmOverrides = {};
  const merchant = values.merchant.trim();
  if (merchant && merchant !== (item.merchant ?? '')) overrides.merchant = merchant;
  if (values.transactionType !== item.transactionType) overrides.transactionType = values.transactionType;
  const categoryId = values.categoryId || null;
  if (values.transactionType !== 'transfer' && categoryId !== (item.categoryId ?? null)) overrides.categoryId = categoryId;
  const accountId = values.financialAccountId || null;
  if (accountId !== (item.financialAccountId ?? null)) overrides.financialAccountId = accountId;
  if (values.notes.trim()) overrides.notes = values.notes.trim();
  return overrides;
}
