import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { allowedTypes, buildConfirmOverrides, initialEditValues } from '../confirmOverrides.ts';
import { amountSign, detectedTitle, ignoreReasonMessage, reviewReasonLabel, sourceLabel } from '../detectionLabels.ts';
import { isMappingComplete, setMappingColumn } from '../importMapping.ts';
import type { DetectedTransaction } from '../../types/detection.types.ts';

const ITEM = {
  id: 'd1',
  merchant: 'Zomato',
  transactionType: 'expense',
  direction: 'DEBIT',
  categoryId: 'food',
  financialAccountId: null,
  accountTail: '1234',
} as DetectedTransaction;

describe('confirm overrides (T5.2 on the web)', () => {
  it('sends nothing when nothing changed', () => {
    assert.deepEqual(buildConfirmOverrides(ITEM, initialEditValues(ITEM)), {});
    assert.deepEqual(buildConfirmOverrides(ITEM, { ...initialEditValues(ITEM), merchant: ' Zomato ' }), {});
  });

  it('sends only changed fields, and never a category for a transfer', () => {
    const base = initialEditValues(ITEM);
    assert.deepEqual(buildConfirmOverrides(ITEM, { ...base, categoryId: 'office', notes: ' lunch ' }), { categoryId: 'office', notes: 'lunch' });
    assert.deepEqual(buildConfirmOverrides(ITEM, { ...base, categoryId: '' }), { categoryId: null });
    assert.deepEqual(buildConfirmOverrides(ITEM, { ...base, transactionType: 'transfer', categoryId: 'office' }), { transactionType: 'transfer' });
    assert.deepEqual(buildConfirmOverrides(ITEM, { ...base, financialAccountId: 'acc' }), { financialAccountId: 'acc' });
  });

  it('offers only the types the money direction allows', () => {
    assert.deepEqual(allowedTypes('DEBIT'), ['expense', 'transfer']);
    assert.deepEqual(allowedTypes('CREDIT'), ['income', 'refund', 'transfer']);
  });
});

describe('labels', () => {
  it('names sources, reasons and titles in plain words', () => {
    assert.equal(sourceLabel('android_sms'), 'Phone SMS');
    assert.equal(sourceLabel('mystery'), 'mystery');
    assert.equal(reviewReasonLabel('possible_duplicate'), 'Looks like one you already have');
    assert.equal(reviewReasonLabel(null), null);
    assert.match(ignoreReasonMessage('unknown_sender'), /Pick the bank/);
    assert.match(ignoreReasonMessage(null), /didn't look like/);
    assert.equal(amountSign('transfer', 'DEBIT'), '⇄ ');
    assert.equal(amountSign('income', 'CREDIT'), '+');
    assert.equal(detectedTitle({ merchant: null, accountTail: '1234', transactionType: 'transfer' }), 'Account ••• 1234');
  });
});

describe('CSV mapping', () => {
  it('needs a date, a description and an amount', () => {
    assert.equal(isMappingComplete(null), false);
    assert.equal(isMappingComplete({ dateColumn: 'Date', descriptionColumn: 'Details' }), false);
    assert.equal(isMappingComplete({ dateColumn: 'Date', descriptionColumn: 'Details', debitColumn: 'Out' }), true);
  });

  it('keeps a single amount column and debit/credit columns exclusive', () => {
    const withSplit = setMappingColumn({ debitColumn: 'Out', creditColumn: 'In' }, 'amountColumn', 'Amount');
    assert.deepEqual(withSplit, { amountColumn: 'Amount' });
    assert.deepEqual(setMappingColumn(withSplit, 'debitColumn', 'Out'), { debitColumn: 'Out' });
    assert.deepEqual(setMappingColumn({ dateColumn: 'Date' }, 'dateColumn', ''), { dateColumn: undefined });
  });
});
