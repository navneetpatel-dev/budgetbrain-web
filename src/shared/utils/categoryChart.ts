/** Shared category breakdown helpers for dashboard charts. */

export type CategoryChartInput = {
  categoryId: string;
  total: string | number;
  category?: { name?: string | null; color?: string | null } | null;
};

export type CategoryChartItem = {
  id: string;
  name: string;
  total: number;
  color: string;
  pct: number;
};

const FALLBACK_COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

/**
 * Show exactly what the API returned (no client-side truncation) — each
 * `total` is already a server-computed per-category aggregate for a bounded,
 * non-paginated response, so this is a display-ratio derivation, not a
 * re-derivation of an amount the API should have returned.
 * KNOWN-GAP(money-math): `pct` is still arithmetic on money-named values by
 * the letter of the rule. See implementation-plan/web/18-money-math-lint-guardrail.md.
 */
export function buildCategoryChartItems(data: CategoryChartInput[]): CategoryChartItem[] {
  const sorted = [...data]
    .map((item, index) => ({
      id: item.categoryId,
      name: item.category?.name ?? 'Other',
      total: Number(item.total) || 0,
      color: item.category?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    }))
    // eslint-disable-next-line no-restricted-syntax
    .sort((a, b) => b.total - a.total);

  // eslint-disable-next-line no-restricted-syntax
  const sum = sorted.reduce((s, d) => s + d.total, 0) || 1;

  return sorted.map((item) => ({
    ...item,
    // eslint-disable-next-line no-restricted-syntax
    pct: Math.round((item.total / sum) * 100),
  }));
}
