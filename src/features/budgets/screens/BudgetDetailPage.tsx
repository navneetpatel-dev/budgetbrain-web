import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FormStackScreen, OptionChips } from '@/shared/components/ui/feature-screen';
import { Input, ProgressBar, DetailActions, DetailHero, DetailMetaList, EmptyState, FormActions, FormErrorBanner } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { useBudgetDetail } from '../hooks/useBudgets';
import { BUDGET_TYPES } from '@/shared/constants/config';
import { maxLen, validateAlertThreshold, validateAmount, validateText } from '@/shared/validation/fieldLimits';

export function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { budget, isLoading, isError, refetch, editing, error, setError, setEditing, updateMutation, deleteMutation } = useBudgetDetail(id);
  const [name, setName] = useState('');
  const [type, setType] = useState<'monthly' | 'weekly' | 'category'>('monthly');
  const [amount, setAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; amount?: string; alertThreshold?: string }>({});

  if (isLoading) {
    return (
      <FormStackScreen title="Budget">
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !budget) {
    return (
      <FormStackScreen title="Budget">
        <EmptyState
          icon="budgets"
          title="Couldn’t load budget"
          subtitle="Check your connection and try again"
          action="Retry"
          onAction={() => void refetch()}
        />
      </FormStackScreen>
    );
  }

  const handleDelete = async () => {
    if (await confirm(CONFIRM.deleteBudget(budget.name))) deleteMutation.mutate();
  };

  if (editing) {
    const isPending = updateMutation.isPending;
    const save = () => {
      setError(null);
      const next: typeof fieldErrors = {};
      const nameErr = validateText('entityName', name);
      const amountErr = validateAmount(amount);
      const thresholdErr = validateAlertThreshold(alertThreshold);
      if (nameErr) next.name = nameErr;
      if (amountErr) next.amount = amountErr;
      if (thresholdErr) next.alertThreshold = thresholdErr;
      setFieldErrors(next);
      if (Object.keys(next).length) return;
      updateMutation.mutate({ name, type, amount: Number(amount), alertThreshold: Number(alertThreshold) });
    };
    return (
      <FormStackScreen title="Edit Budget" onBack={() => setEditing(false)}>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); save(); }} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Budget Name" maxLength={maxLen('entityName')} value={name} onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: undefined })); }} disabled={isPending} error={fieldErrors.name} />
          <OptionChips options={BUDGET_TYPES.map((t) => t.id as 'monthly' | 'weekly' | 'category')} value={type} onChange={setType} getLabel={(v) => BUDGET_TYPES.find((t) => t.id === v)?.label ?? v} disabled={isPending} />
          <Input label="Amount" value={amount} onChange={(e) => { setAmount(e.target.value); setFieldErrors((f) => ({ ...f, amount: undefined })); }} type="number" disabled={isPending} error={fieldErrors.amount} />
          <Input label="Alert Threshold (%)" value={alertThreshold} onChange={(e) => { setAlertThreshold(e.target.value); setFieldErrors((f) => ({ ...f, alertThreshold: undefined })); }} type="number" disabled={isPending} error={fieldErrors.alertThreshold} />
          {error ? <FormErrorBanner message={error} /> : null}
          <FormActions
            primaryTitle="Save Changes"
            onPrimary={save}
            primaryLoading={isPending}
            secondaryTitle="Cancel"
            onSecondary={() => setEditing(false)}
          />
        </form>
      </FormStackScreen>
    );
  }

  const pct = toSafePercent(budget.spent, budget.amount);
  const alertAt = budget.alertThreshold ?? 80;

  const barColor = pct >= 100 ? theme.colors.danger : pct >= alertAt ? theme.colors.warning : theme.colors.success;

  return (
    <>
      <FormStackScreen title={budget.name} eyebrow={`${budget.type} budget`}>
        <DetailHero
          amount={formatCurrency(budget.spent, budget.currency)}
          subtitle={`of ${formatCurrency(budget.amount, budget.currency)}`}
        />
        <div style={{ marginBottom: theme.spacing.lg }}>
          <ProgressBar progress={pct} color={barColor} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary }}>
              {pct}% used
            </span>
          </div>
        </div>
        <DetailMetaList
          rows={[
            { label: 'Type', value: budget.type },
            { label: 'Alert', value: `${budget.alertThreshold}%` },
            { label: 'Started', value: budget.startDate },
            { label: 'Ends', value: budget.endDate ?? '' },
          ]}
        />
        <DetailActions
          primaryTitle="Edit"
          onPrimary={() => { setName(budget.name); setType(budget.type); setAmount(String(budget.amount)); setAlertThreshold(String(budget.alertThreshold)); setEditing(true); }}
          onDestructive={() => { void handleDelete(); }}
          destructiveLoading={deleteMutation.isPending}
        />
      </FormStackScreen>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}
