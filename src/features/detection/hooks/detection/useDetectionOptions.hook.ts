'use client';

import { useMemo } from 'react';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { Category, FinancialAccount } from '@/shared/types';

/** The user's categories and accounts, as pickers need them (edit form, rules, import). */
export function useDetectionOptions() {
  const categories = usePaginatedList<Category, 'categories'>({ queryKey: ['categories', 'active', undefined, 100], url: '/categories', itemsKey: 'categories' });
  const accounts = usePaginatedList<FinancialAccount, 'accounts'>({ queryKey: ['accounts'], url: '/accounts', itemsKey: 'accounts' });

  return useMemo(() => {
    const categoryById = new Map(categories.data.map((c) => [c.id, c]));
    const accountById = new Map(accounts.data.map((a) => [a.id, a]));
    return {
      categoryIds: categories.data.map((c) => c.id),
      accountIds: accounts.data.map((a) => a.id),
      categoryLabel: (id: string) => categoryById.get(id)?.name ?? 'None',
      categoryColor: (id: string) => categoryById.get(id)?.color ?? undefined,
      accountLabel: (id: string) => {
        const account = accountById.get(id);
        if (!account) return 'No account';
        return account.accountNumberLast4 ? `${account.name} ••• ${account.accountNumberLast4}` : account.name;
      },
    };
  }, [categories.data, accounts.data]);
}
