import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FormStackScreen, OptionChips } from '@/shared/components/ui/feature-screen';
import { Input, Button, Card, ProgressBar, FormErrorBanner } from '@/shared/components/ui/index';
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
  const { budget, isLoading, editing, error, setError, setEditing, updateMutation, deleteMutation } = useBudgetDetail(id);
  const [name, setName] = useState('');
  const [type, setType] = useState<'monthly' | 'weekly' | 'category'>('monthly');
  const [amount, setAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; amount?: string; alertThreshold?: string }>({});

  if (isLoading || !budget) return <DetailSkeleton />;

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
          <Button title="Save Changes" onPress={save} loading={isPending} size="lg" />
          <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" disabled={isPending} />
        </form>
      </FormStackScreen>
    );
  }

  const pct = toSafePercent(budget.spent, budget.amount);
  const alertAt = budget.alertThreshold ?? 80;

  return (
    <>
      <FormStackScreen title="Budget Detail" eyebrow={budget.type}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <Card variant="elevated">
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>Spent</span>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amountLg.fontSize, fontWeight: Number(theme.typography.amountLg.fontWeight), color: theme.colors.text, margin: '4px 0' }}>{formatCurrency(budget.spent, budget.currency)}<span style={{ fontSize: theme.typography.caption.fontSize, fontWeight: 500, color: theme.colors.textTertiary }}> / {formatCurrency(budget.amount, budget.currency)}</span></p>
              <ProgressBar progress={pct} color={pct >= 100 ? theme.colors.danger : pct >= alertAt ? theme.colors.warning : theme.colors.success} />
              <span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, marginTop: 4, display: 'block', fontFamily: 'Inter, sans-serif' }}>{pct}% used</span>
            </div>
          </Card>
          <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <Row t={theme} l="Name" v={budget.name} /><Row t={theme} l="Type" v={budget.type} /><Row t={theme} l="Alert" v={`${budget.alertThreshold}%`} /><Row t={theme} l="Started" v={budget.startDate} />{budget.endDate && <Row t={theme} l="Ends" v={budget.endDate} />}
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            <Button title="Edit" onPress={() => { setName(budget.name); setType(budget.type); setAmount(String(budget.amount)); setAlertThreshold(String(budget.alertThreshold)); setEditing(true); }} variant="outline" size="lg" icon="edit" />
            <Button title="Delete" onPress={() => { void handleDelete(); }} variant="danger" size="lg" loading={deleteMutation.isPending} icon="trash" />
          </div>
        </div>
      </FormStackScreen>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}

function Row({ t, l, v }: { t: ReturnType<typeof useTheme>; l: string; v: string }) {
  return <div><span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: t.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{l}</span><span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: t.colors.text, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{v}</span></div>;
}
