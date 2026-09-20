'use client';

import { useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { FormStackScreen, OptionChips } from '@/shared/components/ui/feature-screen';
import { Button, Input, DetailActions, DetailHero, DetailMetaList, EmptyState, FormActions, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useAccounts } from '@/features/shared/hooks/useFeatures';
import { CONFIRM } from '@/shared/constants/confirmations';
import { useIncomeDetail } from '../hooks/useIncome';
import { maxLen, validateAmount, validateBoundedDate, validateOptionalText } from '@/shared/validation/fieldLimits';
import { DateBounds } from '@/shared/utils/dateBounds';
import {
  allocationTotal,
  eligibleAllocationAccounts,
  isAllocationValid,
  type AllocationRow,
} from '../utils/allocation';

export function IncomeDetailPage({ id: propId }: { id?: string } = {}) {
  const nextParams = useParams();
  const id = propId ?? (nextParams?.id as string | undefined);
  const theme = useTheme();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const {
    income,
    isLoading,
    isError,
    refetch,
    editing,
    error,
    setError,
    setEditing,
    updateMutation,
    deleteMutation,
    duplicateMutation,
    allocateMutation,
    showSuccess,
  } = useIncomeDetail(id);
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ amount?: string; date?: string; notes?: string }>({});
  const [showAllocate, setShowAllocate] = useState(false);
  const [allocationRows, setAllocationRows] = useState<AllocationRow[]>([]);
  const [allocationError, setAllocationError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <FormStackScreen title="Income">
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !income) {
    return (
      <FormStackScreen title="Income">
        <EmptyState
          icon="income"
          title="Couldn’t load income"
          subtitle="Check your connection and try again"
          action="Retry"
          onAction={() => void refetch()}
        />
      </FormStackScreen>
    );
  }

  const handleDelete = async () => {
    if (await confirm(CONFIRM.deleteIncome)) deleteMutation.mutate();
  };

  const eligibleAccounts = eligibleAllocationAccounts(accounts, income.currency);

  const openAllocate = () => {
    setAllocationError(null);
    setError(null);
    const existing = income.incomeAllocations ?? [];
    setAllocationRows(
      existing.length > 0
        ? existing.map((a) => ({ financialAccountId: a.financialAccountId, amount: String(a.amount) }))
        : [{ financialAccountId: eligibleAccounts[0]?.id ?? '', amount: '' }]
    );
    setShowAllocate(true);
  };

  const addAllocationRow = () => {
    setAllocationRows((rows) => [...rows, { financialAccountId: eligibleAccounts[0]?.id ?? '', amount: '' }]);
  };

  const removeAllocationRow = (index: number) => {
    setAllocationRows((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows));
  };

  const updateAllocationRow = (index: number, patch: Partial<AllocationRow>) => {
    setAllocationRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const allocationRunningTotal = allocationTotal(allocationRows);
  const allocationMatches = isAllocationValid(allocationRows, income.amount);

  const submitAllocation = () => {
    setAllocationError(null);
    if (!allocationMatches) {
      setAllocationError('Each row needs an account and amount, and the total must equal the income amount.');
      return;
    }
    allocateMutation.mutate(
      allocationRows.map((r) => ({ financialAccountId: r.financialAccountId, amount: Number(r.amount) })),
      { onSuccess: () => setShowAllocate(false) }
    );
  };

  if (editing) {
    const isPending = updateMutation.isPending;
    const save = () => {
      setError(null);
      const next: typeof fieldErrors = {};
      const amountErr = validateAmount(amount);
      const dateErr = validateBoundedDate('transaction', date);
      const notesErr = validateOptionalText('notes', notes);
      if (amountErr) next.amount = amountErr;
      if (dateErr) next.date = dateErr;
      if (notesErr) next.notes = notesErr;

      setFieldErrors(next);
      if (Object.keys(next).length) return;
      updateMutation.mutate({ amount: Number(amount), date, notes: notes || undefined });
    };
    return (
      <FormStackScreen title="Edit Income" onBack={() => setEditing(false)}>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); save(); }} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Amount" value={amount} onChange={(e) => { setAmount(e.target.value); setFieldErrors((f) => ({ ...f, amount: undefined })); }} type="number" leftIcon="dollar" disabled={isPending} error={fieldErrors.amount} />
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
          <Input label="Notes" value={notes} onChange={(e) => { setNotes(e.target.value); setFieldErrors((f) => ({ ...f, notes: undefined })); }} placeholder="Optional note" multiline disabled={isPending} maxLength={maxLen('notes')} error={fieldErrors.notes} />
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

  return (
    <>
      <FormStackScreen title={income.merchant || 'Income'} eyebrow="Income">
        {showSuccess ? <FormSuccessBanner message="Changes saved" /> : null}
        <DetailHero
          amount={`+${formatCurrency(income.amount, income.currency)}`}
          amountColor={theme.colors.success}
          subtitle={income.date}
        />
        <DetailMetaList
          rows={[
            { label: 'Date', value: income.date },
            { label: 'Merchant', value: income.merchant ?? '' },
            { label: 'Notes', value: income.notes ?? '' },
          ]}
        />

        {showAllocate ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            <FormFieldLabel>Split across accounts</FormFieldLabel>
            {accountsLoading ? null : eligibleAccounts.length === 0 ? (
              <FormErrorBanner
                message={`No ${income.currency} accounts yet — add one on the Accounts page before splitting this income.`}
              />
            ) : (
              <>
                {allocationRows.map((row, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs, paddingBottom: theme.spacing.xs, borderBottom: `1px solid ${theme.colors.border}` }}>
                    <OptionChips
                      options={eligibleAccounts.map((a) => a.id)}
                      value={row.financialAccountId}
                      onChange={(v) => updateAllocationRow(index, { financialAccountId: v })}
                      getLabel={(v) => eligibleAccounts.find((a) => a.id === v)?.name ?? v}
                      disabled={allocateMutation.isPending}
                    />
                    <div style={{ display: 'flex', gap: theme.spacing.xs, alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <Input
                          value={row.amount}
                          onChange={(e) => updateAllocationRow(index, { amount: e.target.value })}
                          type="number"
                          leftIcon="dollar"
                          placeholder="Amount"
                          disabled={allocateMutation.isPending}
                        />
                      </div>
                      {allocationRows.length > 1 ? (
                        <Button
                          title="Remove"
                          variant="dangerGhost"
                          onPress={() => removeAllocationRow(index)}
                          disabled={allocateMutation.isPending}
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
                <Button title="Add another account" variant="outline" onPress={addAllocationRow} disabled={allocateMutation.isPending} />
                <DetailMetaList
                  rows={[
                    { label: 'Allocated', value: formatCurrency(allocationRunningTotal, income.currency) },
                    { label: 'Income amount', value: formatCurrency(income.amount, income.currency) },
                  ]}
                />
                {allocationError ? <FormErrorBanner message={allocationError} /> : null}
                {error ? <FormErrorBanner message={error} /> : null}
                <FormActions
                  primaryTitle="Save Allocation"
                  onPrimary={submitAllocation}
                  primaryLoading={allocateMutation.isPending}
                  secondaryTitle="Cancel"
                  onSecondary={() => setShowAllocate(false)}
                />
              </>
            )}
          </div>
        ) : (
          <Button
            title={income.incomeAllocations?.length ? 'Edit Account Split' : 'Allocate to Accounts'}
            variant="outline"
            onPress={openAllocate}
            style={{ marginTop: theme.spacing.md }}
          />
        )}

        <DetailActions
          primaryTitle="Edit"
          onPrimary={() => { setAmount(String(income.amount)); setDate(income.date); setNotes(income.notes ?? ''); setEditing(true); }}
          secondaryTitle="Duplicate"
          onSecondary={() => duplicateMutation.mutate()}
          secondaryLoading={duplicateMutation.isPending}
          onDestructive={() => { void handleDelete(); }}
          destructiveLoading={deleteMutation.isPending}
        />
      </FormStackScreen>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}
