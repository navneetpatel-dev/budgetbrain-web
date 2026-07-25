import { useState } from 'react';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { OptionChips, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { Card, EmptyState, Input, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useInvestments } from '@/features/shared/hooks/useFeatures';
import {
  maxLen,
  validateAmount,
  validateDate,
  validateOptionalText,
  validateQuantity,
  validateText,
} from '@/shared/validation/fieldLimits';

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
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = () => {
    setError(null);
    const next: FieldErrors = {};
    const nameErr = validateText('entityName', name);
    const symbolErr = validateOptionalText('symbol', symbol);
    const qtyErr = validateQuantity(quantity);
    const priceErr = validateAmount(purchasePrice);
    const currentErr = currentPrice.trim() ? validateAmount(currentPrice) : undefined;
    const dateErr = validateDate(purchaseDate);
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
        showForm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs, marginBottom: theme.spacing.lg }}>
            {error ? <FormErrorBanner message={error} /> : null}
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} maxLength={maxLen('entityName')} error={fieldErrors.name} disabled={createMutation.isPending} />
            <OptionChips options={INVESTMENT_TYPES.map((t) => t.id)} value={type} onChange={setType} getLabel={(v) => INVESTMENT_TYPES.find((t) => t.id === v)?.label ?? v} disabled={createMutation.isPending} />
            <Input label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} maxLength={maxLen('symbol')} error={fieldErrors.symbol} disabled={createMutation.isPending} />
            <Input label="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" error={fieldErrors.quantity} disabled={createMutation.isPending} />
            <Input label="Purchase price" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} type="number" error={fieldErrors.purchasePrice} disabled={createMutation.isPending} />
            <Input label="Current price" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} type="number" error={fieldErrors.currentPrice} disabled={createMutation.isPending} />
            <Input label="Purchase date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} type="date" error={fieldErrors.purchaseDate} disabled={createMutation.isPending} />
            <Button title="Save Investment" onPress={handleSubmit} loading={createMutation.isPending} />
            <Button title="Cancel" onPress={() => { setShowForm(false); setError(null); }} variant="outline" disabled={createMutation.isPending} />
          </div>
        ) : null
      }
      renderItem={(inv) => (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{inv.name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: theme.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{inv.type.replace('_', ' ')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amount.fontSize, fontWeight: Number(theme.typography.amount.fontWeight), color: theme.colors.text }}>
              {formatCurrency(inv.currentValue ?? (inv.quantity * inv.currentPrice), inv.currency)}
            </span>
            {(inv.gainLoss !== undefined) && (
              <span style={{
                fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                color: inv.gainLoss >= 0 ? theme.colors.success : theme.colors.danger,
              }}>
                {inv.gainLoss >= 0 ? '+' : ''}{formatCurrency(inv.gainLoss, inv.currency)}
              </span>
            )}
          </div>
        </Card>
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
