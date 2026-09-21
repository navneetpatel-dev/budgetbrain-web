import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveDateRange } from '../transactionFilters.ts';
import { toIsoDate } from '../../../../shared/utils/dateBounds.ts';

describe('transactionFilters local-date presets', () => {
  it('this_month uses the local calendar day, not UTC (local midnight on the 1st)', () => {
    const originalNow = Date.now;
    const originalDate = Date;
    const pinned = new Date(2026, 9, 1, 0, 30, 0).getTime();

    class FakeDate extends originalDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super(pinned);
          return;
        }
        // @ts-expect-error Date constructor overload
        super(...args);
      }
      static now() {
        return pinned;
      }
    }
    // @ts-expect-error test stub
    globalThis.Date = FakeDate;
    Date.now = () => pinned;

    try {
      const range = resolveDateRange({ type: 'all', datePreset: 'this_month' });
      assert.equal(range.startDate, '2026-10-01');
      assert.equal(range.endDate, toIsoDate(new Date(2026, 9, 1, 0, 30, 0)));

      const localMidnight = new Date(2026, 9, 1, 0, 0, 0);
      assert.equal(toIsoDate(localMidnight), '2026-10-01');
      if (localMidnight.getTimezoneOffset() < 0) {
        assert.notEqual(localMidnight.toISOString().slice(0, 10), '2026-10-01');
      }
    } finally {
      globalThis.Date = originalDate;
      Date.now = originalNow;
    }
  });
});
