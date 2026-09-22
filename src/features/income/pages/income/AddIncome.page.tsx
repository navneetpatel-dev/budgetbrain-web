'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChips, OptionChipList } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { useTheme } from '@/shared/theme';
import { useCreateIncome, useIncomeSources } from '../../hooks/income/useIncome.hook';
import {
  maxLen,
  validateAmount,
  validateBoundedDate,
  validateOptionalText,
  validateText,
  ValidationMessages,
} from '@/shared/validation/fieldLimits';
import { DateBounds, toIsoDate } from '@/shared/utils/dateBounds';

const SOURCE_TYPES = [
  { id: 'salary', label: 'Salary' },
  { id: 'freelancing', label: 'Freelancing' },
  { id: 'investments', label: 'Investments' },
  { id: 'rental', label: 'Rental' },
  { id: 'other', label: 'Other' },
];

type FieldErrors = {
  amount?: string;
  date?: string;
  notes?: string;
  selectedSource?: string;
  newSourceName?: string;
};

export function AddIncomePage() {
  const theme = useTheme();
  const { createMutation, error, setError, showSuccess } = useCreateIncome();
  const { data: sources, isLoading: sourcesLoading } = useIncomeSources();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toIsoDate(new Date()));
  const [notes, setNotes] = useState('');
  const [sourceMode, setSourceMode] = useState<'existing' | 'new'>('new');
  const [selectedSource, setSelectedSource] = useState('');
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState('salary');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const modeInitialized = useRef(false);

  const isPending = createMutation.isPending;
  const hasSources = sources.length > 0;

  useEffect(() => {
    if (modeInitialized.current || sourcesLoading) return;
    modeInitialized.current = true;
    if (hasSources) setSourceMode('existing');
  }, [sourcesLoading, hasSources]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const next: FieldErrors = {};
    const amountErr = validateAmount(amount);
    const dateErr = validateBoundedDate('transaction', date);
    const notesErr = validateOptionalText('notes', notes);
    if (amountErr) next.amount = amountErr;
    if (dateErr) next.date = dateErr;
    if (notesErr) next.notes = notesErr;
    if (sourceMode === 'existing') {
      if (!hasSources) next.selectedSource = 'No income sources yet. Switch to New source to create one.';
      else if (!selectedSource) next.selectedSource = ValidationMessages.incomeSourceRequired;
    }
    if (sourceMode === 'new') {
      const sourceErr = validateText('entityName', newSourceName);
      if (sourceErr) next.newSourceName = sourceErr;
    }
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate({
      amount,
      date,
      notes: notes || undefined,
      incomeSourceId: sourceMode === 'existing' ? selectedSource : undefined,
      newSourceName: sourceMode === 'new' ? newSourceName : undefined,
      newSourceType,
    });
  };

  return (
    <FormStackScreen title="Add Income" eyebrow="Income" icon="trendingUp">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
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
          label="Date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setFieldErrors((f) => ({ ...f, date: undefined })); }}
          type="date"
          min={DateBounds.transaction(date).min}
          max={DateBounds.transaction(date).max}
          disabled={isPending}
          error={fieldErrors.date}
        />
        <FormFieldLabel>Source</FormFieldLabel>
        <OptionChips
          options={['existing', 'new'] as const}
          value={sourceMode}
          onChange={(mode) => {
            setSourceMode(mode);
            setFieldErrors((f) => ({ ...f, selectedSource: undefined, newSourceName: undefined }));
          }}
          getLabel={(v) => v === 'existing' ? 'Existing source' : 'New source'}
          disabled={isPending}
        />
        {sourceMode === 'existing' ? (
          hasSources ? (
            <OptionChipList
              items={sources.map((s) => ({ id: s.id, label: s.name }))}
              selectedId={selectedSource}
              onSelect={(id) => {
                setSelectedSource(id);
                setFieldErrors((f) => ({ ...f, selectedSource: undefined }));
              }}
              error={fieldErrors.selectedSource}
              disabled={isPending}
            />
          ) : (
            <p style={{
              color: fieldErrors.selectedSource ? theme.colors.danger : theme.colors.textSecondary,
              fontSize: 13,
              margin: `0 0 ${theme.spacing.sm}px`,
              fontFamily: 'Inter, sans-serif',
              fontWeight: fieldErrors.selectedSource ? 500 : 400,
            }}>
              {fieldErrors.selectedSource ?? 'No income sources yet. Switch to New source to create one.'}
            </p>
          )
        ) : (
          <>
            <Input
              label="Source Name"
              maxLength={maxLen('entityName')}
              value={newSourceName}
              onChange={(e) => { setNewSourceName(e.target.value); setFieldErrors((f) => ({ ...f, newSourceName: undefined })); }}
              placeholder="e.g. Salary"
              disabled={isPending}
              error={fieldErrors.newSourceName}
            />
            <OptionChips options={SOURCE_TYPES.map((t) => t.id)} value={newSourceType} onChange={setNewSourceType} getLabel={(v) => SOURCE_TYPES.find((t) => t.id === v)?.label ?? v} disabled={isPending} />
          </>
        )}
        <Input
          label="Notes"
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setFieldErrors((f) => ({ ...f, notes: undefined })); }}
          placeholder="Optional note"
          multiline
          disabled={isPending}
          maxLength={maxLen('notes')}
          error={fieldErrors.notes}
        />
        {error ? <FormErrorBanner message={error} /> : null}
        {showSuccess ? <FormSuccessBanner message="Income saved" /> : null}
        <Button title="Save Income" onPress={handleSubmit} loading={isPending || showSuccess} disabled={showSuccess} size="lg" />
      </form>
    </FormStackScreen>
  );
}
