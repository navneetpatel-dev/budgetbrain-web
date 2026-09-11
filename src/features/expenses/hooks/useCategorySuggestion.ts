import { apiGet } from '@/shared/services/api';

/** Looks up a remembered merchant → category mapping. Returns null on no match. */
export async function fetchCategorySuggestion(merchant: string): Promise<string | null> {
  if (!merchant.trim()) return null;
  const result = await apiGet<{ categoryId: string | null }>('/categories/suggest', { merchant });
  return result.categoryId;
}
