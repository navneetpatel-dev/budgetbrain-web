import React from 'react';
import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { SpendingTrendChart } from '../dashboard/SpendingTrendChart.component';
import type { SpendingTrends } from '@/shared/types';

afterEach(() => {
  cleanup();
});

const trends: SpendingTrends = {
  daily: [
    { label: 'Mon', total: 120 },
    { label: 'Tue', total: 0 },
    { label: 'Wed', total: 340 },
  ],
  weekly: [{ label: 'Wk 1', total: 900 }],
  monthly: [{ label: 'Jan', total: 4200 }],
};

describe('SpendingTrendChart', () => {
  it('renders the daily period by default with bar labels', () => {
    render(<SpendingTrendChart trends={trends} currency="INR" />);
    // Each point's label renders twice (hover tooltip + x-axis label) — use getAllByText.
    assert.ok(screen.getAllByText('Mon').length > 0);
    assert.ok(screen.getAllByText('Wed').length > 0);
    assert.ok(screen.getByText('Spending Trends'));
  });

  it('switches to the weekly period when its tab is clicked', () => {
    render(<SpendingTrendChart trends={trends} currency="INR" />);
    fireEvent.click(screen.getByRole('tab', { name: /weekly/i }));
    assert.ok(screen.getAllByText('Wk 1').length > 0);
    assert.equal(screen.queryAllByText('Mon').length, 0);
  });

  it('shows the empty-state message when there is no spending data', () => {
    const empty: SpendingTrends = { daily: [], weekly: [], monthly: [] };
    render(<SpendingTrendChart trends={empty} currency="INR" />);
    assert.ok(screen.getByText('No spending activity recorded in this period'));
  });

  it('shows the empty-state message when trends is undefined', () => {
    render(<SpendingTrendChart currency="INR" />);
    assert.ok(screen.getByText('No spending activity recorded in this period'));
  });
});
