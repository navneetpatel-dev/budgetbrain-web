import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency, getCurrencySymbol } from '../currency.ts';

describe('web currency formatting', () => {
  it('formats INR correctly without decimals', () => {
    const res = formatCurrency(5000, 'INR');
    assert.ok(res.includes('5,000'));
    assert.ok(/₹|INR/.test(res));
  });

  it('formats USD correctly with 2 decimals', () => {
    const res = formatCurrency(1234.56, 'USD');
    assert.ok(res.includes('1,234.56'));
    assert.ok(res.includes('$'));
  });

  it('formats EUR correctly with 2 decimals', () => {
    const res = formatCurrency(99.9, 'EUR');
    assert.ok(res.includes('99.90'));
    assert.ok(res.includes('€'));
  });

  it('returns appropriate currency symbol', () => {
    assert.equal(getCurrencySymbol('SGD'), 'S$');
    assert.equal(getCurrencySymbol('USD'), '$');
    assert.equal(getCurrencySymbol('EUR'), '€');
  });

  it('handles negative currency values', () => {
    const res = formatCurrency(-50, 'USD');
    assert.ok(res.includes('50.00'));
    assert.ok(res.includes('-'));
  });
});
