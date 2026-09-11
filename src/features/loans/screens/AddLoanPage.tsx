import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChips } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useCreateLoan } from '../hooks/useLoans';
import {
  maxLen,
  validateAmount,
  validateBoundedDate,
  validateOptionalText,
  validateText,
} from '@/shared/validation/fieldLimits';
import { DateBounds } from '@/shared/utils/dateBounds';

const LOAN_TYPES = [
  { id: 'loan', label: 'Loan' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'emi', label: 'EMI' },
  { id: 'other', label: 'Other' },
] as const;

type LoanType = (typeof LOAN_TYPES)[number]['id'];

type FieldErrors = { name?: string; principal?: string; interestRate?: string; emiAmount?: string; startDate?: string; notes?: string };

export function AddLoanPage() {
  const theme = useTheme();
  const { createMutation, error, setError } = useCreateLoan();
  const [name, setName] = useState('');
  const [type, setType] = useState<LoanType>('loan');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isPending = createMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const next: FieldErrors = {};
    const nameErr = validateText('entityName', name);
    const principalErr = validateAmount(principal);
    const dateErr = validateBoundedDate('investmentPurchase', startDate);
    const notesErr = validateOptionalText('notes', notes);
    if (nameErr) next.name = nameErr;
    if (principalErr) next.principal = principalErr;
    if (dateErr) next.startDate = dateErr;
    if (notesErr) next.notes = notesErr;
    if (interestRate && (Number(interestRate) < 0 || Number(interestRate) > 100 || Number.isNaN(Number(interestRate)))) {
      next.interestRate = 'Must be between 0 and 100';
    }
    if (emiAmount && validateAmount(emiAmount)) {
      next.emiAmount = validateAmount(emiAmount);
    }
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate({
      name,
      type,
      principal: Number(principal),
      interestRate: interestRate ? Number(interestRate) : undefined,
      emiAmount: emiAmount ? Number(emiAmount) : undefined,
      startDate,
      notes: notes || undefined,
    });
  };

  return (
    <FormStackScreen title="Add Loan" eyebrow="New Debt" icon="creditCard">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        <Input
          label="Name"
          maxLength={maxLen('entityName')}
          value={name}
          onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: undefined })); }}
          placeholder="e.g. Car Loan"
          disabled={isPending}
          error={fieldErrors.name}
        />
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Type</label>
        <OptionChips
          options={LOAN_TYPES.map((t) => t.id)}
          value={type}
          onChange={setType}
          getLabel={(v) => LOAN_TYPES.find((t) => t.id === v)?.label ?? v}
          disabled={isPending}
        />
        <Input
          label="Principal amount"
          value={principal}
          onChange={(e) => { setPrincipal(e.target.value); setFieldErrors((f) => ({ ...f, principal: undefined })); }}
          placeholder="0.00"
          type="number"
          leftIcon="dollar"
          disabled={isPending}
          error={fieldErrors.principal}
        />
        <Input
          label="Interest rate % (optional)"
          value={interestRate}
          onChange={(e) => { setInterestRate(e.target.value); setFieldErrors((f) => ({ ...f, interestRate: undefined })); }}
          placeholder="e.g. 8.5"
          type="number"
          disabled={isPending}
          error={fieldErrors.interestRate}
        />
        <Input
          label="EMI amount (optional)"
          value={emiAmount}
          onChange={(e) => { setEmiAmount(e.target.value); setFieldErrors((f) => ({ ...f, emiAmount: undefined })); }}
          placeholder="0.00"
          type="number"
          disabled={isPending}
          error={fieldErrors.emiAmount}
        />
        <Input
          label="Start date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setFieldErrors((f) => ({ ...f, startDate: undefined })); }}
          type="date"
          min={DateBounds.investmentPurchase(startDate).min}
          max={DateBounds.investmentPurchase(startDate).max}
          disabled={isPending}
          error={fieldErrors.startDate}
        />
        <Input
          label="Notes (optional)"
          maxLength={maxLen('notes')}
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setFieldErrors((f) => ({ ...f, notes: undefined })); }}
          multiline
          disabled={isPending}
          error={fieldErrors.notes}
        />
        {error ? <FormErrorBanner message={error} /> : null}
        <Button title="Add Loan" onPress={handleSubmit} loading={isPending} size="lg" />
      </form>
    </FormStackScreen>
  );
}
