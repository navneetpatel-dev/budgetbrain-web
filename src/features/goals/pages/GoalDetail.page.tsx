'use client';

import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FormStackScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { ProgressBar, Input, DetailActions, DetailHero, DetailMetaList, EmptyState, FormActions, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { EntityRow } from '@/shared/components/ui/list-rows';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { useGoalDetail } from '../hooks/useGoals';
import {
  maxLen,
  validateAmount,
  validateBoundedDate,
  validateText,
} from '@/shared/validation/fieldLimits';
import { DateBounds } from '@/shared/utils/dateBounds';

type FieldErrors = { name?: string; targetAmount?: string; targetDate?: string };

function GoalDetailPageContent({ id: propId }: { id?: string } = {}) {
  const nextParams = useParams();
  const id = propId ?? (nextParams?.id as string | undefined);
  const searchParams = useSearchParams();
  const router = useRouter();
  const goBack = useStackBack('/goals');
  const theme = useTheme();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { goal, isLoading, isError, refetch, editing, error, setError, setEditing, updateMutation, deleteMutation, showSuccess } = useGoalDetail(id);
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

  const handleDelete = async () => {
    if (await confirm(CONFIRM.deleteGoal)) deleteMutation.mutate();
  };

  const pct = goal.progressPercentage;

  if (editing) {
    const isPending = updateMutation.isPending;
    const save = () => {
      setError(null);
      const next: FieldErrors = {};
      const nameErr = validateText('entityName', name);
      const amountErr = validateAmount(targetAmount);
      const dateErr = validateBoundedDate('goalTarget', targetDate, { optional: true });
      if (nameErr) next.name = nameErr;
      if (amountErr) next.targetAmount = amountErr;
      if (dateErr) next.targetDate = dateErr;
      setFieldErrors(next);
      if (Object.keys(next).length) return;
      updateMutation.mutate(
        { name, targetAmount: Number(targetAmount), targetDate: targetDate || undefined },
        {
          onSuccess: () => {
            editFromViewRef.current = false;
          },
        },
      );
    };
    return (
      <FormStackScreen title="Edit Goal" subtitle="Update goal" onBack={exitEdit}>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); save(); }} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Goal Name" maxLength={maxLen('entityName')} value={name} onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: undefined })); }} disabled={isPending} error={fieldErrors.name} />
          <Input label="Target Amount" value={targetAmount} onChange={(e) => { setTargetAmount(e.target.value); setFieldErrors((f) => ({ ...f, targetAmount: undefined })); }} type="number" disabled={isPending} error={fieldErrors.targetAmount} />
          <Input
            label="Target Date (optional)"
            value={targetDate}
            onChange={(e) => { setTargetDate(e.target.value); setFieldErrors((f) => ({ ...f, targetDate: undefined })); }}
            type="date"
            min={DateBounds.goalTarget(targetDate).min}
            max={DateBounds.goalTarget(targetDate).max}
            error={fieldErrors.targetDate}
            disabled={isPending}
          />
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
        {showSuccess ? <FormSuccessBanner message="Changes saved" /> : null}
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
        <div style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.md }}>
          <span
            style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
            }}
          >
            Contribution History
          </span>
          {goal.contributions && goal.contributions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              {goal.contributions.map((c) => (
                <EntityRow
                  key={c.id}
                  title={c.note || 'Contribution'}
                  subtitle={new Date(c.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  value={`+${formatCurrency(c.amount, goal.currency)}`}
                  valueColor={theme.colors.success}
                />
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                color: theme.colors.textSecondary,
                margin: 0,
              }}
            >
              No contributions recorded yet.
            </p>
          )}
        </div>
        <DetailActions
          primaryTitle="Contribute"
          onPrimary={() => router.push(`/goal/${id}/contribute`)}
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

export function GoalDetailPage({ id }: { id?: string } = {}) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <GoalDetailPageContent id={id} />
    </Suspense>
  );
}
