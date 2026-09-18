/**
 * KNOWN-GAP(money-math): `principal - remainingBalance` is a client-side derivation
 * of a money value the API doesn't return. The backend Loan model has no
 * `amountPaid`/`paidPercentage` virtual field (unlike Goal's `progressPercentage`),
 * so this stays a documented, centralized exception rather than duplicated inline
 * arithmetic. See implementation-plan/web/18-money-math-lint-guardrail.md.
 */
export function getLoanAmountPaid(principal: number, remainingBalance: number): number {
  // eslint-disable-next-line no-restricted-syntax
  return principal - remainingBalance;
}
