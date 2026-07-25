import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChipList, OptionChips } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useCreateBudget } from '../hooks/useBudgets';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { BUDGET_TYPES } from '@/shared/constants/config';
import {
  maxLen,
  validateAlertThreshold,
  validateAmount,
  validateDate,
  validateText,
  ValidationMessages,
} from '@/shared/validation/fieldLimits';

type FieldErrors = {
  name?: string;
  amount?: string;
  startDate?: string;
  alertThreshold?: string;
  categoryId?: string;
};

export function AddBudgetPage() {
  const theme = useTheme();
  const { createMutation, error, setError } = useCreateBudget();
  const { categories } = useCategories();
  const [name, setName] = useState('');
  const [type, setType] = useState<'monthly' | 'weekly' | 'category'>('monthly');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [categoryId, setCategoryId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isPending = createMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const next: FieldErrors = {};
    const nameErr = validateText('entityName', name);
    const amountErr = validateAmount(amount);
    const dateErr = validateDate(startDate);
    const thresholdErr = validateAlertThreshold(alertThreshold);
    if (nameErr) next.name = nameErr;
    if (amountErr) next.amount = amountErr;
    if (dateErr) next.startDate = dateErr;
    if (thresholdErr) next.alertThreshold = thresholdErr;
    if (type === 'category' && !categoryId) next.categoryId = ValidationMessages.categoryRequired;
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate({
      name,
      type,
      amount: Number(amount),
      startDate,
      alertThreshold: Number(alertThreshold),
      categoryId: type === 'category' ? categoryId : undefined,
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
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Type</label>
        <OptionChips
          options={BUDGET_TYPES.map((t) => t.id as 'monthly' | 'weekly' | 'category')}
          value={type}
          onChange={(v) => { setType(v); setFieldErrors((f) => ({ ...f, categoryId: undefined })); }}
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
          onChange={(e) => { setStartDate(e.target.value); setFieldErrors((f) => ({ ...f, startDate: undefined })); }}
          type="date"
          disabled={isPending}
          error={fieldErrors.startDate}
        />
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
        {type === 'category' ? (
          <>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Category</label>
            <OptionChipList
              items={(categories ?? []).map((c) => ({ id: c.id, label: c.name, color: c.color ?? undefined }))}
              selectedId={categoryId}
              onSelect={(id) => { setCategoryId(id); setFieldErrors((f) => ({ ...f, categoryId: undefined })); }}
              disabled={isPending}
              error={fieldErrors.categoryId}
            />
          </>
        ) : null}
        {error ? <FormErrorBanner message={error} /> : null}
        <Button title="Create Budget" onPress={handleSubmit} loading={isPending} size="lg" />
      </form>
    </FormStackScreen>
  );
}
