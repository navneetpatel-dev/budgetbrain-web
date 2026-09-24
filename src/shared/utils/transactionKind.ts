import type { Transaction } from '@/shared/types';

export type TransactionTone = 'spend' | 'gain' | 'neutral';

export interface TransactionKind {
  /** Human label for the type badge and eyebrow. */
  label: 'Expense' | 'Income' | 'Refund' | 'Transfer';
  /** Sign shown before the amount. */
  sign: '−' | '+' | '⇄ ';
  /** Colour family: spending (red), money in (green) or neither (grey). */
  tone: TransactionTone;
  /** Whether the transaction belongs to a spending category (expenses and their refunds). */
  hasCategory: boolean;
}

/**
 * How each transaction type is presented. Refunds are money back on a purchase, so they show as
 * money in with their category; transfers move money between the user's own accounts and count
 * as neither spending nor income, so they are neutral (spec §8–12).
 */
export function transactionKind(transaction: Pick<Transaction, 'type'>): TransactionKind {
  switch (transaction.type) {
    case 'expense':
      return { label: 'Expense', sign: '−', tone: 'spend', hasCategory: true };
    case 'refund':
      return { label: 'Refund', sign: '+', tone: 'gain', hasCategory: true };
    case 'transfer':
      return { label: 'Transfer', sign: '⇄ ', tone: 'neutral', hasCategory: false };
    default:
      return { label: 'Income', sign: '+', tone: 'gain', hasCategory: false };
  }
}
