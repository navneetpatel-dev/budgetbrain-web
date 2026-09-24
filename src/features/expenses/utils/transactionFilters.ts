/** How many category/source chips to show inline before “More”. */
import { toIsoDate } from '@/shared/utils/dateBounds';

export const FILTER_PICKER_PREVIEW_COUNT = 4;
/** Page size when loading income sources / categories for filters. */
export const FILTER_PICKER_FETCH_LIMIT = 100;

export type TransactionTypeFilter = 'all' | 'expense' | 'income' | 'refund' | 'transfer';
export type DatePreset = 'all' | 'this_month' | 'last_30' | 'custom';

export type TransactionListFilters = {
  type: TransactionTypeFilter;
  categoryId?: string;
  incomeSourceId?: string;
  paymentMethod?: string;
  datePreset: DatePreset;
  startDate?: string;
  endDate?: string;
  tag?: string;
  /** `detected`: added by auto-tracking or a statement import (plan T6.4). */
  source?: 'detected' | 'manual';
};

export const DEFAULT_TRANSACTION_FILTERS: TransactionListFilters = {
  type: 'all',
  datePreset: 'all',
};

export function resolveDateRange(filters: TransactionListFilters): {
  startDate?: string;
  endDate?: string;
} {
  if (filters.datePreset === 'custom') {
    return {
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    };
  }
  if (filters.datePreset === 'this_month') {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: toIsoDate(start), endDate: toIsoDate(now) };
  }
  if (filters.datePreset === 'last_30') {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
  }
  return {};
}

/** Build API query params for GET /expenses (omits empty values). */
export function toExpenseListParams(filters: TransactionListFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.type !== 'all') params.type = filters.type;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.incomeSourceId) params.incomeSourceId = filters.incomeSourceId;
  if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
  if (filters.tag) params.tag = filters.tag;
  if (filters.source) params.source = filters.source;

  const range = resolveDateRange(filters);
  if (range.startDate) params.startDate = range.startDate;
  if (range.endDate) params.endDate = range.endDate;
  return params;
}

export function countActiveFilters(filters: TransactionListFilters): number {
  let n = 0;
  if (filters.type !== 'all') n += 1;
  if (filters.categoryId) n += 1;
  if (filters.incomeSourceId) n += 1;
  if (filters.paymentMethod) n += 1;
  if (filters.datePreset !== 'all') n += 1;
  if (filters.tag) n += 1;
  if (filters.source) n += 1;
  return n;
}

export function filtersFromSearchParams(params: URLSearchParams): TransactionListFilters {
  const type = params.get('type');
  const datePreset = params.get('datePreset') as DatePreset | null;
  return {
    type: type === 'expense' || type === 'income' || type === 'refund' || type === 'transfer' ? type : 'all',
    categoryId: params.get('categoryId') || undefined,
    incomeSourceId: params.get('incomeSourceId') || undefined,
    paymentMethod: params.get('paymentMethod') || undefined,
    datePreset:
      datePreset === 'this_month' || datePreset === 'last_30' || datePreset === 'custom'
        ? datePreset
        : 'all',
    startDate: params.get('startDate') || undefined,
    endDate: params.get('endDate') || undefined,
    tag: params.get('tag') || undefined,
    source: params.get('source') === 'detected' || params.get('source') === 'manual' ? (params.get('source') as 'detected' | 'manual') : undefined,
  };
}

export function filtersToSearchParams(filters: TransactionListFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.type !== 'all') params.set('type', filters.type);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.incomeSourceId) params.set('incomeSourceId', filters.incomeSourceId);
  if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod);
  if (filters.datePreset !== 'all') params.set('datePreset', filters.datePreset);
  if (filters.datePreset === 'custom') {
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
  }
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.source) params.set('source', filters.source);
  return params;
}
