import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

export function validateReceiptFile(file: { type: string; size: number }): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, and PDF files are supported.' };
  }
  const maxBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxBytes) {
    return { valid: false, error: 'Receipt size must be less than 10MB.' };
  }
  return { valid: true };
}

describe('receipt validation logic', () => {
  it('accepts valid jpeg under 10MB', () => {
    const res = validateReceiptFile({ type: 'image/jpeg', size: 2 * 1024 * 1024 });
    assert.equal(res.valid, true);
    assert.equal(res.error, undefined);
  });

  it('accepts valid pdf file', () => {
    const res = validateReceiptFile({ type: 'application/pdf', size: 5 * 1024 * 1024 });
    assert.equal(res.valid, true);
  });

  it('rejects unsupported file type (e.g. text/csv)', () => {
    const res = validateReceiptFile({ type: 'text/csv', size: 500 });
    assert.equal(res.valid, false);
    assert.equal(res.error, 'Only JPG, PNG, and PDF files are supported.');
  });

  it('rejects files larger than 10MB', () => {
    const res = validateReceiptFile({ type: 'image/png', size: 11 * 1024 * 1024 });
    assert.equal(res.valid, false);
    assert.equal(res.error, 'Receipt size must be less than 10MB.');
  });
});
