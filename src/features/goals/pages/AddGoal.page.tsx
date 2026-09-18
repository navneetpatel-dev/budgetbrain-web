'use client';

import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChips } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { useTheme } from '@/shared/theme';
import { useCreateGoal } from '../hooks/useGoals';
import { GOAL_TYPES } from '@/shared/constants/config';
import { maxLen, validateAmount, validateBoundedDate, validateText } from '@/shared/validation/fieldLimits';
import { DateBounds } from '@/shared/utils/dateBounds';

type FieldErrors = { name?: string; targetAmount?: string; targetDate?: string };

export function AddGoalPage() {
  const theme = useTheme();
  const { createMutation, error, setError, showSuccess } = useCreateGoal();
  const [name, setName] = useState('');
  const [type, setType] = useState('emergency_fund');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isPending = createMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
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
    createMutation.mutate({ name, type, targetAmount: Number(targetAmount), targetDate: targetDate || undefined });
  };

  return (
    <FormStackScreen title="Create Goal" eyebrow="New Goal" icon="target">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        <Input
          label="Goal Name"
          maxLength={maxLen('entityName')}
          value={name}
          onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: undefined })); }}
          placeholder="e.g. Vacation Fund"
          disabled={isPending}
          error={fieldErrors.name}
        />
        <FormFieldLabel>Type</FormFieldLabel>
        <OptionChips options={GOAL_TYPES.map((t) => t.id)} value={type} onChange={setType} getLabel={(v) => GOAL_TYPES.find((t) => t.id === v)?.label ?? v} disabled={isPending} />
        <Input
          label="Target Amount"
          value={targetAmount}
          onChange={(e) => { setTargetAmount(e.target.value); setFieldErrors((f) => ({ ...f, targetAmount: undefined })); }}
          placeholder="0.00"
          type="number"
          leftIcon="dollar"
          disabled={isPending}
          error={fieldErrors.targetAmount}
        />
        <Input
          label="Target Date (optional)"
          value={targetDate}
          onChange={(e) => { setTargetDate(e.target.value); setFieldErrors((f) => ({ ...f, targetDate: undefined })); }}
          type="date"
          min={DateBounds.goalTarget(targetDate).min}
          max={DateBounds.goalTarget(targetDate).max}
          disabled={isPending}
          error={fieldErrors.targetDate}
        />
        {error ? <FormErrorBanner message={error} /> : null}
        {showSuccess ? <FormSuccessBanner message="Goal created" /> : null}
        <Button title="Create Goal" onPress={handleSubmit} loading={isPending || showSuccess} disabled={showSuccess} size="lg" />
      </form>
    </FormStackScreen>
  );
}
