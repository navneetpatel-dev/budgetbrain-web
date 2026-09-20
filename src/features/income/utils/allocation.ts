import type { FinancialAccount } from '@/shared/types';

export interface AllocationRow {
  financialAccountId: string;
  amount: string;
}

/**
 * Submit-readiness preview only, not a KNOWN-GAP(money-math) case — unlike pages that sum
 * server-computed values because no backend aggregate exists yet, this sums the user's own
 * in-progress form input to enable/disable the Save button before a request is even made.
 * The actual sum/currency validation, and every balance mutation, happen server-side in
 * allocateIncomeToAccounts; the per-row amounts are sent as typed, never as this total.
 */
export function allocationTotal(rows: AllocationRow[]): number {
  return rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
}

/** Only accounts whose currency matches the income transaction's — cross-currency splits
 *  are rejected server-side, so there's no point offering them in the picker. */
export function eligibleAllocationAccounts(
  accounts: FinancialAccount[],
  incomeCurrency: string
): FinancialAccount[] {
  return accounts.filter((a) => a.currency === incomeCurrency);
}

/** True once every row has an account + a positive amount and the total exactly matches
 *  (within a cent) the income amount — mirrors the server's own sum-validation as a
 *  pre-submit UX gate, not a substitute for it. */
export function isAllocationValid(rows: AllocationRow[], incomeAmount: number): boolean {
  if (rows.length === 0) return false;
  if (!rows.every((r) => r.financialAccountId && Number(r.amount) > 0)) return false;
  // eslint-disable-next-line no-restricted-syntax -- see allocationTotal's docstring
  const diff = Math.abs(allocationTotal(rows) - incomeAmount);
  return diff < 0.01;
}
