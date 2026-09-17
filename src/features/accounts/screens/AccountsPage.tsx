import { useState } from 'react';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { OptionChips, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState, Input, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { EntityRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useAccounts } from '@/features/shared/hooks/useFeatures';
import {
  maxLen,
  validateLast4,
  validateMoneyValue,
  validateOptionalText,
  validateText,
} from '@/shared/validation/fieldLimits';

const ACCOUNT_TYPES = [
  { id: 'bank', label: 'Bank' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'cash', label: 'Cash' },
  { id: 'wallet', label: 'Wallet' },
] as const;

type FieldErrors = {
  name?: string;
  balance?: string;
  institution?: string;
  accountNumberLast4?: string;
};

export function AccountsPage() {
  const theme = useTheme();
  const { accounts, isLoading, createMutation, error, setError } = useAccounts();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<(typeof ACCOUNT_TYPES)[number]['id']>('bank');
  const [institution, setInstitution] = useState('');
  const [balance, setBalance] = useState('');
  const [last4, setLast4] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = () => {
    setError(null);
    const next: FieldErrors = {};
    const nameErr = validateText('entityName', name);
    const balanceErr = validateMoneyValue(balance, { allowNegative: true });
    const institutionErr = validateOptionalText('institution', institution);
    const last4Err = validateLast4(last4);
    if (nameErr) next.name = nameErr;
    if (balanceErr) next.balance = balanceErr;
    if (institutionErr) next.institution = institutionErr;
    if (last4Err) next.accountNumberLast4 = last4Err;
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate(
      {
        name,
        type,
        institution: institution.trim() || undefined,
        balance: Number(balance),
        accountNumberLast4: last4.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setName('');
          setInstitution('');
          setBalance('');
          setLast4('');
          setFieldErrors({});
        },
      }
    );
  };

  return (
    <StickyHeaderFlatScreen
      header={
        <ProfileStackHeader
          screen="accounts"
          subtitle="Bank accounts & cards"
          actionIcon="add"
          onAction={() => setShowForm((v) => !v)}
          actionLabel="Add"
        />
      }
      inset="stack"
      data={isLoading ? [] : accounts}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        showForm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs, marginBottom: theme.spacing.lg }}>
            {error ? <FormErrorBanner message={error} /> : null}
            <Input label="Account name" value={name} onChange={(e) => setName(e.target.value)} maxLength={maxLen('entityName')} error={fieldErrors.name} disabled={createMutation.isPending} />
            <FormFieldLabel>Type</FormFieldLabel>
            <OptionChips options={ACCOUNT_TYPES.map((t) => t.id)} value={type} onChange={setType} getLabel={(v) => ACCOUNT_TYPES.find((t) => t.id === v)?.label ?? v} disabled={createMutation.isPending} />
            <Input label="Institution" value={institution} onChange={(e) => setInstitution(e.target.value)} maxLength={maxLen('institution')} error={fieldErrors.institution} disabled={createMutation.isPending} />
            <Input label="Last 4 digits" value={last4} onChange={(e) => setLast4(e.target.value)} maxLength={maxLen('accountNumberLast4')} error={fieldErrors.accountNumberLast4} disabled={createMutation.isPending} />
            <Input label="Balance" value={balance} onChange={(e) => setBalance(e.target.value)} type="number" error={fieldErrors.balance} disabled={createMutation.isPending} />
            <Button title="Save Account" onPress={handleSubmit} loading={createMutation.isPending} />
            <Button title="Cancel" onPress={() => { setShowForm(false); setError(null); }} variant="outline" disabled={createMutation.isPending} />
          </div>
        ) : null
      }
      renderItem={(acc) => (
        <EntityRow
          title={acc.name}
          subtitle={[acc.type.replace('_', ' '), acc.institution].filter(Boolean).join(' · ')}
          value={formatCurrency(acc.balance, acc.currency)}
        />
      )}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={4} variant="account" />
        ) : (
          showForm ? null : (
            <EmptyState
              title="No accounts yet"
              subtitle="Add bank accounts and cards to track balances in Net Worth"
              icon="creditCard"
              action="Add account"
              onAction={() => setShowForm(true)}
            />
          )
        )
      }
    />
  );
}
