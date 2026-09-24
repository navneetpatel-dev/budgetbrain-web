import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transactionKind } from '../transactionKind.ts';

describe('transactionKind', () => {
  it('shows expenses as spending and income as money in', () => {
    assert.deepEqual(transactionKind({ type: 'expense' }), { label: 'Expense', sign: '−', tone: 'spend', hasCategory: true });
    assert.deepEqual(transactionKind({ type: 'income' }), { label: 'Income', sign: '+', tone: 'gain', hasCategory: false });
  });

  it('shows refunds as money in that keeps its spending category', () => {
    assert.deepEqual(transactionKind({ type: 'refund' }), { label: 'Refund', sign: '+', tone: 'gain', hasCategory: true });
  });

  it('shows transfers as neutral: neither spending nor income', () => {
    assert.deepEqual(transactionKind({ type: 'transfer' }), { label: 'Transfer', sign: '⇄ ', tone: 'neutral', hasCategory: false });
  });
});
