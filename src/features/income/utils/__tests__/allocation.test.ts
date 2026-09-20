import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { allocationTotal, eligibleAllocationAccounts, isAllocationValid } from '../allocation.ts';
import type { FinancialAccount } from '@/shared/types';

function account(overrides: Partial<FinancialAccount> = {}): FinancialAccount {
  return {
    id: 'acc-1',
    name: 'Checking',
    type: 'bank',
    institution: null,
    accountNumberLast4: null,
    balance: 0,
    creditLimit: null,
    currency: 'INR',
    isActive: true,
    ...overrides,
  };
}

describe('allocationTotal', () => {
  it('sums valid numeric amounts', () => {
    assert.equal(
      allocationTotal([
        { financialAccountId: 'a', amount: '100' },
        { financialAccountId: 'b', amount: '250.5' },
      ]),
      350.5
    );
  });

  it('treats blank/invalid amounts as zero rather than NaN', () => {
    assert.equal(
      allocationTotal([
        { financialAccountId: 'a', amount: '' },
        { financialAccountId: 'b', amount: 'not-a-number' },
        { financialAccountId: 'c', amount: '50' },
      ]),
      50
    );
  });

  it('returns 0 for an empty row list', () => {
    assert.equal(allocationTotal([]), 0);
  });
});

describe('eligibleAllocationAccounts', () => {
  it('keeps only accounts matching the income currency', () => {
    const accounts = [
      account({ id: 'inr-1', currency: 'INR' }),
      account({ id: 'usd-1', currency: 'USD' }),
      account({ id: 'inr-2', currency: 'INR' }),
    ];
    const result = eligibleAllocationAccounts(accounts, 'INR');
    assert.deepEqual(result.map((a) => a.id), ['inr-1', 'inr-2']);
  });

  it('returns an empty array when no accounts match', () => {
    const accounts = [account({ id: 'usd-1', currency: 'USD' })];
    assert.deepEqual(eligibleAllocationAccounts(accounts, 'INR'), []);
  });
});

describe('isAllocationValid', () => {
  it('is true when rows sum exactly to the income amount', () => {
    const rows = [
      { financialAccountId: 'a', amount: '600' },
      { financialAccountId: 'b', amount: '400' },
    ];
    assert.equal(isAllocationValid(rows, 1000), true);
  });

  it('tolerates sub-cent floating point drift', () => {
    const rows = [
      { financialAccountId: 'a', amount: '333.33' },
      { financialAccountId: 'b', amount: '333.33' },
      { financialAccountId: 'c', amount: '333.34' },
    ];
    assert.equal(isAllocationValid(rows, 1000), true);
  });

  it('is false when the total does not match', () => {
    const rows = [{ financialAccountId: 'a', amount: '500' }];
    assert.equal(isAllocationValid(rows, 1000), false);
  });

  it('is false when a row is missing an account', () => {
    const rows = [{ financialAccountId: '', amount: '1000' }];
    assert.equal(isAllocationValid(rows, 1000), false);
  });

  it('is false when a row has a zero or negative amount', () => {
    const rows = [
      { financialAccountId: 'a', amount: '1000' },
      { financialAccountId: 'b', amount: '0' },
    ];
    assert.equal(isAllocationValid(rows, 1000), false);
  });

  it('is false for an empty row list', () => {
    assert.equal(isAllocationValid([], 1000), false);
  });
});
