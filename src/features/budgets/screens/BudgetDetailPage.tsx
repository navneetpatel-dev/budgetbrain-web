import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FormStackScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { Input, ProgressBar, DetailActions, DetailHero, DetailMetaList, EmptyState, FormActions, FormErrorBanner, Toggle } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { useBudgetDetail } from '../hooks/useBudgets';
import { maxLen, validateAlertThreshold, validateAmount, validateText } from '@/shared/validation/fieldLimits';

export function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const goBack = useStackBack('/budgets');
  const theme = useTheme();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { budget, isLoading, isError, refetch, editing, error, setError, setEditing, updateMutation, deleteMutation } = useBudgetDetail(id);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('');
  const [rollover, setRollover] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; amount?: string; alertThreshold?: string }>({});
  const [startedFromQuery, setStartedFromQuery] = useState(false);
  /** True only when Edit was tapped from the view screen (not list → ?edit=1). */
  const editFromViewRef = useRef(false);

  const populateEdit = (b: NonNullable<typeof budget>) => {
    setName(b.name);
    setAmount(String(b.amount));
    setAlertThreshold(String(b.alertThreshold));
    setRollover(b.rollover);
    setFieldErrors({});
    setError(null);
  };

  const startEdit = (b: NonNullable<typeof budget>) => {
    populateEdit(b);
    editFromViewRef.current = true;
    setEditing(true);
  };

  const exitEdit = () => {
    if (editFromViewRef.current) {
      editFromViewRef.current = false;
      setEditing(false);
      return;
    }
    goBack();
  };

  useEffect(() => {
    if (!budget || startedFromQuery || editing) return;
    const wantsEdit = searchParams.get('edit') === '1' || searchParams.get('edit') === 'true';
    if (!wantsEdit) return;
    populateEdit(budget);
    editFromViewRef.current = false;
    setEditing(true);
    setStartedFromQuery(true);
  }, [budget, searchParams, startedFromQuery, editing, setError, setEditing]);

  if (isLoading) {
    return (
      <FormStackScreen title="Budget" onBack={goBack}>
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !budget) {
    return (
      <FormStackScreen title="Budget" onBack={goBack}>
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
      updateMutation.mutate(
        {
          name,
          amount: Number(amount),
          alertThreshold: Number(alertThreshold),
          ...(budget.type !== 'custom' && { rollover }),
        },
        {
          onSuccess: () => {
            editFromViewRef.current = false;
          },
        },
      );
    };
    return (
      <FormStackScreen title="Edit Budget" subtitle="Update budget" onBack={exitEdit}>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); save(); }} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Budget Name" maxLength={maxLen('entityName')} value={name} onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: undefined })); }} disabled={isPending} error={fieldErrors.name} />
          <Input label="Amount" value={amount} onChange={(e) => { setAmount(e.target.value); setFieldErrors((f) => ({ ...f, amount: undefined })); }} type="number" disabled={isPending} error={fieldErrors.amount} />
          <Input label="Alert Threshold (%)" value={alertThreshold} onChange={(e) => { setAlertThreshold(e.target.value); setFieldErrors((f) => ({ ...f, alertThreshold: undefined })); }} type="number" disabled={isPending} error={fieldErrors.alertThreshold} />
          {budget.type !== 'custom' ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md,
              padding: `${theme.spacing.md}px 0`, marginBottom: theme.spacing.sm,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: theme.colors.text }}>Roll over unused amount</span>
                <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12, color: theme.colors.textTertiary, marginTop: 2 }}>Carry last period's leftover (or deficit) into this one</span>
              </div>
              <Toggle value={rollover} onChange={setRollover} disabled={isPending} label="Roll over unused amount" />
            </div>
          ) : null}
          {error ? <FormErrorBanner message={error} /> : null}
          <FormActions
            primaryTitle="Save Changes"
            onPrimary={save}
            primaryLoading={isPending}
            secondaryTitle="Cancel"
            onSecondary={exitEdit}
          />
        </form>
      </FormStackScreen>
    );
  }

  const effectiveAmount = budget.effectiveAmount ?? budget.amount;
  const pct = toSafePercent(budget.spent, effectiveAmount);
  const alertAt = budget.alertThreshold ?? 80;
  const barColor = pct >= 100 ? theme.colors.danger : pct >= alertAt ? theme.colors.warning : theme.colors.success;
  const rolloverAmount = budget.rolloverAmount ?? 0;

  return (
    <>
      <FormStackScreen
        title={budget.name}
        eyebrow={`${budget.type.charAt(0).toUpperCase()}${budget.type.slice(1)} budget`}
        subtitle={`${pct}% used`}
        onBack={goBack}
      >
        <DetailHero
          amount={formatCurrency(budget.spent, budget.currency)}
          subtitle={`of ${formatCurrency(effectiveAmount, budget.currency)}`}
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
            { label: 'Period', value: `${budget.type.charAt(0).toUpperCase()}${budget.type.slice(1)}` },
            { label: 'Category', value: budget.category?.name ?? 'All spending' },
            { label: 'Alert', value: `${budget.alertThreshold}%` },
            { label: 'Started', value: budget.startDate },
            ...(budget.endDate ? [{ label: 'Ends', value: budget.endDate }] : []),
            ...(rolloverAmount !== 0
              ? [{ label: 'Rollover', value: `${rolloverAmount > 0 ? '+' : '-'}${formatCurrency(Math.abs(rolloverAmount), budget.currency)}` }]
              : []),
          ]}
        />
        <DetailActions
          primaryTitle="Edit"
          onPrimary={() => startEdit(budget)}
          onDestructive={() => { void handleDelete(); }}
          destructiveLoading={deleteMutation.isPending}
        />
      </FormStackScreen>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}
