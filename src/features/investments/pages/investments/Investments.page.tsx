'use client';

import { useState, useMemo } from 'react';
import { ProfileStackHeader } from '@/features/settings';
import { OptionChips, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState, Input, Button, FormErrorBanner, BentoCard } from '@/shared/components/ui/index';
import { EntityRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useInvestments } from '@/shared/hooks';
import {
  maxLen,
  validateAmount,
  validateBoundedDate,
  validateOptionalText,
  validateQuantity,
  validateText,
} from '@/shared/validation/fieldLimits';
import { DateBounds, toIsoDate } from '@/shared/utils/dateBounds';

const INVESTMENT_TYPES = [
  { id: 'stocks', label: 'Stocks' },
  { id: 'mutual_fund', label: 'Mutual Fund' },
  { id: 'fd', label: 'FD' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'gold', label: 'Gold' },
  { id: 'other', label: 'Other' },
] as const;

type FieldErrors = {
  name?: string;
  symbol?: string;
  quantity?: string;
  purchasePrice?: string;
  currentPrice?: string;
  purchaseDate?: string;
};

export function InvestmentsPage() {
  const theme = useTheme();
  const { investments, isLoading, createMutation, error, setError } = useInvestments();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<(typeof INVESTMENT_TYPES)[number]['id']>('stocks');
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(toIsoDate(new Date()));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { totalValue, totalGain } = useMemo(() => {
    let val = 0;
    let gain = 0;
    investments.forEach((inv) => {
      // KNOWN-GAP(money-math): both accumulators below sum already-server-computed
      // per-item values into a page-level portfolio total; the API has no aggregate
      // endpoint yet. See implementation-plan/web/18-money-math-lint-guardrail.md.
      // eslint-disable-next-line no-restricted-syntax
      val += inv.currentValue;
      gain += inv.gainLoss ?? 0;
    });
    return { totalValue: val, totalGain: gain };
  }, [investments]);
  const currency = investments[0]?.currency ?? 'INR';

  const handleSubmit = () => {
    setError(null);
    const next: FieldErrors = {};
    const nameErr = validateText('entityName', name);
    const symbolErr = validateOptionalText('symbol', symbol);
    const qtyErr = validateQuantity(quantity);
    const priceErr = validateAmount(purchasePrice);
    const currentErr = currentPrice.trim() ? validateAmount(currentPrice) : undefined;
    const dateErr = validateBoundedDate('investmentPurchase', purchaseDate);
    if (nameErr) next.name = nameErr;
    if (symbolErr) next.symbol = symbolErr;
    if (qtyErr) next.quantity = qtyErr;
    if (priceErr) next.purchasePrice = priceErr;
    if (currentErr) next.currentPrice = currentErr;
    if (dateErr) next.purchaseDate = dateErr;
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate(
      {
        name,
        type,
        symbol: symbol.trim() || undefined,
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        currentPrice: currentPrice.trim() ? Number(currentPrice) : undefined,
        purchaseDate,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setName('');
          setSymbol('');
          setQuantity('');
          setPurchasePrice('');
          setCurrentPrice('');
          setFieldErrors({});
        },
      }
    );
  };

  return (
    <StickyHeaderFlatScreen
      header={
        <ProfileStackHeader
          screen="investments"
          subtitle="Your portfolio"
          actionIcon="add"
          onAction={() => setShowForm((v) => !v)}
          actionLabel="Add"
        />
      }
      inset="stack"
      data={isLoading ? [] : investments}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
          {investments.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14,
            }}>
              <BentoCard
                title="Portfolio Value"
                amount={formatCurrency(totalValue, currency)}
                badgeText={totalGain >= 0 ? `+${formatCurrency(totalGain, currency)}` : formatCurrency(totalGain, currency)}
                badgeColor={totalGain >= 0 ? theme.colors.secondary : theme.colors.danger}
                icon="trendingUp"
                iconColor={totalGain >= 0 ? theme.colors.secondary : theme.colors.danger}
              />
              <BentoCard
                title="Total Holdings"
                amount={`${investments.length} asset${investments.length !== 1 ? 's' : ''}`}
                badgeText="Active"
                badgeColor={theme.colors.primary}
                icon="chart"
                iconColor={theme.colors.primary}
              />
            </div>
          )}
          {showForm ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              {error ? <FormErrorBanner message={error} /> : null}
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} maxLength={maxLen('entityName')} error={fieldErrors.name} disabled={createMutation.isPending} />
              <OptionChips options={INVESTMENT_TYPES.map((t) => t.id)} value={type} onChange={setType} getLabel={(v) => INVESTMENT_TYPES.find((t) => t.id === v)?.label ?? v} disabled={createMutation.isPending} />
              <Input label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} maxLength={maxLen('symbol')} error={fieldErrors.symbol} disabled={createMutation.isPending} />
              <Input label="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" error={fieldErrors.quantity} disabled={createMutation.isPending} />
              <Input label="Purchase price" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} type="number" error={fieldErrors.purchasePrice} disabled={createMutation.isPending} />
              <Input label="Current price" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} type="number" error={fieldErrors.currentPrice} disabled={createMutation.isPending} />
              <Input
                label="Purchase date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                type="date"
                min={DateBounds.investmentPurchase(purchaseDate).min}
                max={DateBounds.investmentPurchase(purchaseDate).max}
                error={fieldErrors.purchaseDate}
                disabled={createMutation.isPending}
              />
              <Button title="Save Investment" onPress={handleSubmit} loading={createMutation.isPending} />
              <Button title="Cancel" onPress={() => { setShowForm(false); setError(null); }} variant="outline" disabled={createMutation.isPending} />
            </div>
          ) : null}
        </div>
      }
      renderItem={(inv) => (
        <EntityRow
          title={inv.name}
          subtitle={[
            inv.type.replace('_', ' '),
            inv.gainLoss !== undefined
              ? `${inv.gainLoss >= 0 ? '+' : ''}${formatCurrency(inv.gainLoss, inv.currency)}`
              : null,
          ].filter(Boolean).join(' · ')}
          value={formatCurrency(inv.currentValue, inv.currency)}
        />
      )}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={4} variant="account" />
        ) : showForm ? null : (
          <EmptyState
            title="No investments yet"
            subtitle="Track stocks, mutual funds, and other holdings"
            icon="chart"
            action="Add investment"
            onAction={() => setShowForm(true)}
          />
        )
      }
    />
  );
}
