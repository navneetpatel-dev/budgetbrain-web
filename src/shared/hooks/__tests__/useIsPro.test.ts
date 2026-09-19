import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isProUser } from '../useIsPro.ts';

describe('useIsPro / isProUser entitlement check', () => {
  it('identifies free users as not pro', () => {
    assert.equal(isProUser('free'), false);
    assert.equal(isProUser(null), false);
    assert.equal(isProUser(undefined), false);
  });

  it('identifies premium users as pro', () => {
    assert.equal(isProUser('premium'), true);
  });

  it('identifies lifetime users as pro', () => {
    assert.equal(isProUser('lifetime'), true);
  });

  it('identifies admin users as pro', () => {
    assert.equal(isProUser('admin'), true);
  });
});
