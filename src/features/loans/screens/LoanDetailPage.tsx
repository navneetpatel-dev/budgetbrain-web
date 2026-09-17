import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FormStackScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { ProgressBar, Input, DetailActions, DetailHero, DetailMetaList, EmptyState, FormActions, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { useLoanDetail } from '../hooks/useLoans';
import { maxLen, validateOptionalText, validateText } from '@/shared/validation/fieldLimits';

type FieldErrors = { name?: string; notes?: string };

export function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const goBack = useStackBack('/loans');
  const theme = useTheme();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { loan, isLoading, isError, refetch, editing, error, setError, setEditing, updateMutation, deleteMutation, showSuccess } = useLoanDetail(id);
  const [name, setName] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [startedFromQuery, setStartedFromQuery] = useState(false);
  const editFromViewRef = useRef(false);

  const populateEdit = (l: NonNullable<typeof loan>) => {
    setName(l.name);
    setInterestRate(l.interestRate != null ? String(l.interestRate) : '');
    setEmiAmount(l.emiAmount != null ? String(l.emiAmount) : '');
    setNotes(l.notes ?? '');
    setFieldErrors({});
    setError(null);
  };

  const startEdit = () => {
    if (!loan) return;
    populateEdit(loan);
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
    if (!loan || startedFromQuery || editing) return;
    const wantsEdit = searchParams.get('edit') === '1' || searchParams.get('edit') === 'true';
    if (!wantsEdit) return;
    populateEdit(loan);
    editFromViewRef.current = false;
    setEditing(true);
    setStartedFromQuery(true);
  }, [loan, searchParams, startedFromQuery, editing, setError, setEditing]);

  if (isLoading) {
    return (
      <FormStackScreen title="Loan" onBack={goBack}>
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !loan) {
    return (
      <FormStackScreen title="Loan" onBack={goBack}>
        <EmptyState icon="creditCard" title="Couldn't load loan" subtitle="Check your connection and try again" action="Retry" onAction={() => void refetch()} />
      </FormStackScreen>
    );
  }

  const handleDelete = async () => {
    if (await confirm(CONFIRM.deleteLoan)) deleteMutation.mutate();
  };

  if (editing) {
    const isPending = updateMutation.isPending;
    const save = (e?: FormEvent) => {
      e?.preventDefault();
      setError(null);
      const next: FieldErrors = {};
      const nameErr = validateText('entityName', name);
      const notesErr = validateOptionalText('notes', notes);
      if (nameErr) next.name = nameErr;
      if (notesErr) next.notes = notesErr;
      setFieldErrors(next);
      if (Object.keys(next).length) return;
      updateMutation.mutate(
        {
          name,
          interestRate: interestRate ? Number(interestRate) : undefined,
          emiAmount: emiAmount ? Number(emiAmount) : undefined,
          notes: notes || undefined,
        },
        { onSuccess: () => { editFromViewRef.current = false; } },
      );
    };

    return (
      <FormStackScreen title="Edit Loan" subtitle="Update loan details" onBack={exitEdit}>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} maxLength={maxLen('entityName')} error={fieldErrors.name} disabled={isPending} />
          <Input label="Interest rate %" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} type="number" disabled={isPending} />
          <Input label="EMI amount" value={emiAmount} onChange={(e) => setEmiAmount(e.target.value)} type="number" disabled={isPending} />
          <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline error={fieldErrors.notes} disabled={isPending} />
          {error ? <FormErrorBanner message={error} /> : null}
          <FormActions primaryTitle="Save Changes" onPrimary={save} primaryLoading={isPending} secondaryTitle="Cancel" onSecondary={exitEdit} />
        </form>
      </FormStackScreen>
    );
  }

  const paid = loan.principal - loan.remainingBalance;
  const pct = toSafePercent(paid, loan.principal);
  const progressColor = loan.closed ? theme.colors.success : theme.colors.primary;

  return (
    <>
      <FormStackScreen title={loan.name} eyebrow={loan.type.replace(/_/g, ' ')} subtitle={loan.closed ? 'Paid off' : `${pct}% paid off`} onBack={goBack}>
        {showSuccess ? <FormSuccessBanner message="Changes saved" /> : null}
        <DetailHero
          amount={formatCurrency(loan.remainingBalance, loan.currency)}
          subtitle={`remaining of ${formatCurrency(loan.principal, loan.currency)}`}
        />
        <div style={{ marginBottom: theme.spacing.lg }}>
          <ProgressBar progress={pct} color={progressColor} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary }}>{pct}% paid off</span>
            {loan.closed ? <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: progressColor }}>Paid off</span> : null}
          </div>
        </div>
        <DetailMetaList
          rows={[
            { label: 'Type', value: loan.type.replace(/_/g, ' ') },
            { label: 'Principal', value: formatCurrency(loan.principal, loan.currency) },
            { label: 'Interest rate', value: loan.interestRate != null ? `${loan.interestRate}%` : '' },
            { label: 'EMI amount', value: loan.emiAmount != null ? formatCurrency(loan.emiAmount, loan.currency) : '' },
            { label: 'Started', value: loan.startDate },
            { label: 'Notes', value: loan.notes ?? '' },
          ]}
        />
        <DetailActions
          primaryTitle={loan.closed ? 'Paid off' : 'Make a payment'}
          onPrimary={() => { if (!loan.closed) navigate(`/loan/${id}/pay`); }}
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
