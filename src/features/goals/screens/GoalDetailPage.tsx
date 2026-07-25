import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FormStackScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { ProgressBar, Input, DetailActions, DetailHero, DetailMetaList, EmptyState, FormActions, FormErrorBanner } from '@/shared/components/ui/index';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const goBack = useStackBack('/goals');
  const theme = useTheme();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { goal, isLoading, isError, refetch, editing, error, setError, setEditing, updateMutation, deleteMutation } = useGoalDetail(id);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [startedFromQuery, setStartedFromQuery] = useState(false);
  /** True only when Edit was tapped from the view screen (not list → ?edit=1). */
  const editFromViewRef = useRef(false);

  const populateEdit = (g: NonNullable<typeof goal>) => {
    setName(g.name);
    setTargetAmount(String(g.targetAmount));
    setTargetDate(g.targetDate ?? '');
    setFieldErrors({});
    setError(null);
  };

  const startEdit = () => {
    if (!goal) return;
    populateEdit(goal);
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
    if (!goal || startedFromQuery || editing) return;
    const wantsEdit = searchParams.get('edit') === '1' || searchParams.get('edit') === 'true';
    if (!wantsEdit) return;
    populateEdit(goal);
    editFromViewRef.current = false;
    setEditing(true);
    setStartedFromQuery(true);
  }, [goal, searchParams, startedFromQuery, editing, setError, setEditing]);

  if (isLoading) {
    return (
      <FormStackScreen title="Goal" onBack={goBack}>
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !goal) {
    return (
      <FormStackScreen title="Goal" onBack={goBack}>
        <EmptyState
          icon="goals"
          title="Couldn’t load goal"
          subtitle="Check your connection and try again"
          action="Retry"
          onAction={() => void refetch()}
        />
      </FormStackScreen>
    );
  }

  const pct = toSafePercent(goal.currentAmount, goal.targetAmount);

  const handleDelete = async () => {
    if (await confirm(CONFIRM.deleteGoal)) deleteMutation.mutate();
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
      updateMutation.mutate(
        {
          name,
          targetAmount: Number(targetAmount),
          targetDate: targetDate.trim() || undefined,
        },
        {
          onSuccess: () => {
            editFromViewRef.current = false;
          },
        },
      );
    };

    return (
      <FormStackScreen title="Edit Goal" subtitle="Update goal" onBack={exitEdit}>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Goal name" value={name} onChange={(e) => setName(e.target.value)} maxLength={maxLen('entityName')} error={fieldErrors.name} disabled={isPending} />
          <Input label="Target amount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} type="number" error={fieldErrors.targetAmount} disabled={isPending} />
          <Input label="Target date (optional)" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} type="date" error={fieldErrors.targetDate} disabled={isPending} />
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

  const progressColor = pct >= 100 ? theme.colors.success : theme.colors.primary;

  return (
    <>
      <FormStackScreen title={goal.name} eyebrow={goal.type.replace(/_/g, ' ')} subtitle={`${pct}% achieved`} onBack={goBack}>
        <DetailHero
          amount={formatCurrency(goal.currentAmount, goal.currency)}
          subtitle={`of ${formatCurrency(goal.targetAmount, goal.currency)}`}
        />
        <div style={{ marginBottom: theme.spacing.lg }}>
          <ProgressBar progress={pct} color={progressColor} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary }}>
              {pct}% achieved
            </span>
            {pct >= 100 ? (
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: progressColor }}>
                Done
              </span>
            ) : null}
          </div>
        </div>
        <DetailMetaList
          rows={[
            { label: 'Type', value: goal.type.replace(/_/g, ' ') },
            { label: 'Target', value: formatCurrency(goal.targetAmount, goal.currency) },
            { label: 'Target date', value: goal.targetDate ?? '' },
          ]}
        />
        <DetailActions
          primaryTitle="Contribute"
          onPrimary={() => navigate(`/goal/${id}/contribute`)}
          secondaryTitle="Edit"
          onSecondary={startEdit}
          onDestructive={() => { void handleDelete(); }}
          destructiveLoading={deleteMutation.isPending}
        />
      </FormStackScreen>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}
