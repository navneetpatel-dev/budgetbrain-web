import { useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { Button, Card, ProgressBar, Input, FormErrorBanner } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { useGoalDetail } from '../hooks/useGoals';
import {
  maxLen,
  validateAmount,
  validateOptionalDate,
  validateText,
} from '@/shared/validation/fieldLimits';

type FieldErrors = { name?: string; targetAmount?: string; targetDate?: string };

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { goal, isLoading, editing, error, setError, setEditing, updateMutation, deleteMutation } = useGoalDetail(id);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (isLoading || !goal) {
    return (
      <FormStackScreen title="Goal">
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  const pct = toSafePercent(goal.currentAmount, goal.targetAmount);

  const handleDelete = async () => {
    if (await confirm(CONFIRM.deleteGoal)) deleteMutation.mutate();
  };

  const startEdit = () => {
    setName(goal.name);
    setTargetAmount(String(goal.targetAmount));
    setTargetDate(goal.targetDate ?? '');
    setFieldErrors({});
    setError(null);
    setEditing(true);
  };

  if (editing) {
    const isPending = updateMutation.isPending;
    const save = (e?: FormEvent) => {
      e?.preventDefault();
      setError(null);
      const next: FieldErrors = {};
      const nameErr = validateText('entityName', name);
      const amountErr = validateAmount(targetAmount);
      const dateErr = validateOptionalDate(targetDate);
      if (nameErr) next.name = nameErr;
      if (amountErr) next.targetAmount = amountErr;
      if (dateErr) next.targetDate = dateErr;
      setFieldErrors(next);
      if (Object.keys(next).length) return;
      updateMutation.mutate({
        name,
        targetAmount: Number(targetAmount),
        targetDate: targetDate.trim() || undefined,
      });
    };

    return (
      <FormStackScreen title="Edit Goal" onBack={() => setEditing(false)}>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Goal name" value={name} onChange={(e) => setName(e.target.value)} maxLength={maxLen('entityName')} error={fieldErrors.name} disabled={isPending} />
          <Input label="Target amount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} type="number" error={fieldErrors.targetAmount} disabled={isPending} />
          <Input label="Target date (optional)" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} type="date" error={fieldErrors.targetDate} disabled={isPending} />
          {error ? <FormErrorBanner message={error} /> : null}
          <Button title="Save Changes" onPress={save} loading={isPending} size="lg" />
          <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" disabled={isPending} />
        </form>
      </FormStackScreen>
    );
  }

  return (
    <>
      <FormStackScreen title="Goal Detail" eyebrow={goal.type.replace(/_/g, ' ')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <Card variant="elevated" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>Progress</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amountLg.fontSize, fontWeight: Number(theme.typography.amountLg.fontWeight), color: theme.colors.text, margin: '4px 0' }}>{formatCurrency(goal.currentAmount, goal.currency)}<span style={{ fontSize: theme.typography.caption.fontSize, color: theme.colors.textTertiary }}> / {formatCurrency(goal.targetAmount, goal.currency)}</span></p>
            <ProgressBar progress={pct} color={pct >= 100 ? theme.colors.success : theme.colors.primary} />
            <span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, marginTop: 4, display: 'block', fontFamily: 'Inter, sans-serif' }}>{pct}% achieved</span>
          </Card>
          <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <Row t={theme} l="Name" v={goal.name} /><Row t={theme} l="Type" v={goal.type.replace(/_/g, ' ')} /><Row t={theme} l="Target" v={formatCurrency(goal.targetAmount, goal.currency)} />{goal.targetDate && <Row t={theme} l="Target Date" v={goal.targetDate} />}
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            <Button title="Contribute" onPress={() => navigate(`/goal/${id}/contribute`)} variant="primary" size="lg" icon="add" />
            <Button title="Edit" onPress={startEdit} variant="outline" size="lg" icon="edit" />
            <Button title="Delete" onPress={() => { void handleDelete(); }} variant="danger" size="lg" loading={deleteMutation.isPending} icon="trash" />
          </div>
        </div>
      </FormStackScreen>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}

function Row({ t, l, v }: { t: ReturnType<typeof useTheme>; l: string; v: string }) {
  return <div><span style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.2px', color: t.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>{l}</span><span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: t.colors.text, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{v}</span></div>;
}
