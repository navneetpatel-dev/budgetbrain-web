'use client';

import { useState, type FormEvent } from 'react';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { OptionChips, OptionChipList } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner, FormSuccessBanner, Toggle } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { useTheme } from '@/shared/theme';
import { useCreateBudget } from '../hooks/useBudgets';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { BUDGET_TYPES } from '@/shared/constants/config';
import {
  maxLen,
  validateAlertThreshold,
  validateAmount,
  validateBoundedDate,
  validateText,
  ValidationMessages,
} from '@/shared/validation/fieldLimits';
import { DateBounds, toIsoDate } from '@/shared/utils/dateBounds';

type Period = 'monthly' | 'weekly' | 'custom';

type FieldErrors = {
  name?: string;
  amount?: string;
  startDate?: string;
  endDate?: string;
  alertThreshold?: string;
};

export function AddBudgetPage() {
  const theme = useTheme();
  const { createMutation, error, setError, showSuccess } = useCreateBudget();
  const { categories } = useCategories();
  const [name, setName] = useState('');
  const [type, setType] = useState<Period>('monthly');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(toIsoDate(new Date()));
  const [endDate, setEndDate] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [categoryId, setCategoryId] = useState('__all__');
  const [rollover, setRollover] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isPending = createMutation.isPending;
  const ALL_SPENDING = '__all__';
  const categoryItems = [
    { id: ALL_SPENDING, label: 'All spending' },
    ...(categories ?? []).map((c) => ({ id: c.id, label: c.name, color: c.color ?? undefined })),
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const next: FieldErrors = {};
    const nameErr = validateText('entityName', name);
    const amountErr = validateAmount(amount);
    const dateErr = validateBoundedDate('budgetStart', startDate);
    const thresholdErr = validateAlertThreshold(alertThreshold);
    if (nameErr) next.name = nameErr;
    if (amountErr) next.amount = amountErr;
    if (dateErr) next.startDate = dateErr;
    if (thresholdErr) next.alertThreshold = thresholdErr;
    if (type === 'custom') {
      if (!endDate) next.endDate = ValidationMessages.endDateRequired;
      else {
        const endErr = validateBoundedDate('budgetEnd', endDate, { startDate });
        if (endErr) next.endDate = endErr;
      }
    }
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate({
      name,
      type,
      amount: Number(amount),
      startDate,
      endDate: type === 'custom' ? endDate : undefined,
      alertThreshold: Number(alertThreshold),
      categoryId: !categoryId || categoryId === ALL_SPENDING ? undefined : categoryId,
      rollover: type === 'custom' ? false : rollover,
    });
  };

  return (
    <FormStackScreen title="Create Budget" eyebrow="New Budget" icon="budgets">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        <Input
          label="Budget Name"
          value={name}
          onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: undefined })); }}
          placeholder="e.g. Groceries"
          maxLength={maxLen('entityName')}
          disabled={isPending}
          error={fieldErrors.name}
        />
        <FormFieldLabel>Period</FormFieldLabel>
        <OptionChips
          options={BUDGET_TYPES.map((t) => t.id)}
          value={type}
          onChange={(v) => {
            setType(v as Period);
            setFieldErrors((f) => ({ ...f, endDate: undefined }));
          }}
          getLabel={(v) => BUDGET_TYPES.find((t) => t.id === v)?.label ?? v}
          disabled={isPending}
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
        <Input
          label="Start Date"
          value={startDate}
          onChange={(e) => {
            const next = e.target.value;
            setStartDate(next);
            if (endDate && next && endDate < next) setEndDate(next);
            setFieldErrors((f) => ({ ...f, startDate: undefined, endDate: undefined }));
          }}
          type="date"
          min={DateBounds.budgetStart(startDate).min}
          max={DateBounds.budgetStart(startDate).max}
          disabled={isPending}
          error={fieldErrors.startDate}
        />
        {type === 'custom' ? (
          <Input
            label="End Date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setFieldErrors((f) => ({ ...f, endDate: undefined })); }}
            type="date"
            min={DateBounds.budgetEnd(startDate, endDate).min}
            max={DateBounds.budgetEnd(startDate, endDate).max}
            disabled={isPending}
            error={fieldErrors.endDate}
          />
        ) : null}
        <Input
          label="Alert Threshold (%)"
          value={alertThreshold}
          onChange={(e) => { setAlertThreshold(e.target.value); setFieldErrors((f) => ({ ...f, alertThreshold: undefined })); }}
          placeholder="80"
          type="number"
          helperText="Get notified when spending reaches this percentage"
          disabled={isPending}
          error={fieldErrors.alertThreshold}
        />
        <FormFieldLabel>Category (optional)</FormFieldLabel>
        <OptionChipList
          items={categoryItems}
          selectedId={categoryId}
          onSelect={setCategoryId}
          disabled={isPending}
          mode="sheet"
        />
        {type !== 'custom' ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md,
            padding: `${theme.spacing.md}px 0`, marginBottom: theme.spacing.lg,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: theme.typography.bodyMedium.fontSize, fontWeight: Number(theme.typography.bodySemibold.fontWeight), color: theme.colors.text }}>Roll over unused amount</span>
              <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: theme.typography.caption.fontSize, color: theme.colors.textTertiary, marginTop: 2 }}>Carry last period's leftover (or deficit) into this one</span>
            </div>
            <Toggle value={rollover} onChange={setRollover} disabled={isPending} label="Roll over unused amount" />
          </div>
        ) : null}
        {error ? <FormErrorBanner message={error} /> : null}
        {showSuccess ? <FormSuccessBanner message="Budget created" /> : null}
        <Button title="Create Budget" onPress={handleSubmit} loading={isPending || showSuccess} disabled={showSuccess} size="lg" />
      </form>
    </FormStackScreen>
  );
}
