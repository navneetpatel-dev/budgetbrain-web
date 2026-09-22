'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import { ensureArray } from '@/shared/utils/listData';
import { FieldLimits } from '@/shared/validation/fieldLimits';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => apiGet<{ transactions: import('@/shared/types').Transaction[]; total: number }>('/expenses/search', { q: query, page: 1, limit: 50 }),
    enabled: query.trim().length >= FieldLimits.search.min,
    select: (data) => ({ transactions: ensureArray(data.transactions) }),
  });
}