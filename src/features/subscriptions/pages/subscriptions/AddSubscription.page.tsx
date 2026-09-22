'use client';

import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChips } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { useTheme } from '@/shared/theme';
import { useCreateRecurringSeries } from '../../hooks/subscriptions/useSubscriptions.hook';
import { maxLen, validateAmount, validateBoundedDate, validateText } from '@/shared/validation/fieldLimits';
import { DateBounds, toIsoDate } from '@/shared/utils/dateBounds';

const CADENCES = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
] as const;

type Cadence = (typeof CADENCES)[number]['id'];

type FieldErrors = { merchant?: string; amount?: string; nextDueDate?: string };

export function AddSubscriptionPage() {
  const theme = useTheme();
  const { createMutation, error, setError, showSuccess } = useCreateRecurringSeries();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [nextDueDate, setNextDueDate] = useState(toIsoDate(new Date()));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isPending = createMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const next: FieldErrors = {};
    const merchantErr = validateText('merchant', merchant);
    const amountErr = validateAmount(amount);
    const dateErr = validateBoundedDate('goalTarget', nextDueDate);
    if (merchantErr) next.merchant = merchantErr;
    if (amountErr) next.amount = amountErr;
    if (dateErr) next.nextDueDate = dateErr;
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate({ merchant, amount: Number(amount), cadence, nextDueDate });
  };

  return (
    <FormStackScreen title="Add Subscription" eyebrow="New Bill" icon="calendar">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        <Input
          label="Merchant / service"
          value={merchant}
          onChange={(e) => { setMerchant(e.target.value); setFieldErrors((f) => ({ ...f, merchant: undefined })); }}
          placeholder="e.g. Netflix"
          maxLength={maxLen('merchant')}
          disabled={isPending}
          error={fieldErrors.merchant}
        />
        <Input
          label="Amount"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setFieldErrors((f) => ({ ...f, amount: undefined })); }}
          placeholder="0.00"
          type="number"
          leftIcon="dollar"
          disabled={isPending}
          error={fieldErrors.amount}
        />
        <FormFieldLabel>Cadence</FormFieldLabel>
        <OptionChips
          options={CADENCES.map((c) => c.id)}
          value={cadence}
          onChange={setCadence}
          getLabel={(v) => CADENCES.find((c) => c.id === v)?.label ?? v}
          disabled={isPending}
        />
        <Input
          label="Next due date"
          value={nextDueDate}
          onChange={(e) => { setNextDueDate(e.target.value); setFieldErrors((f) => ({ ...f, nextDueDate: undefined })); }}
          type="date"
          min={DateBounds.goalTarget(nextDueDate).min}
          max={DateBounds.goalTarget(nextDueDate).max}
          disabled={isPending}
          error={fieldErrors.nextDueDate}
        />
        {error ? <FormErrorBanner message={error} /> : null}
        {showSuccess ? <FormSuccessBanner message="Subscription added" /> : null}
        <Button title="Add Subscription" onPress={handleSubmit} loading={isPending || showSuccess} disabled={showSuccess} size="lg" />
      </form>
    </FormStackScreen>
  );
}
