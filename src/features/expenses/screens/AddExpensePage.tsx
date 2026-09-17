import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChipList, OptionChips } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { useTheme } from '@/shared/theme';
import { useCreateExpense } from '../hooks/useExpenses';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { fetchCategorySuggestion } from '../hooks/useCategorySuggestion';
import { TagInput } from '../components/TagInput';
import { SplitWithFamilyField, type SplitPayload } from '@/features/family/components/SplitWithFamilyField';
import { useCreateSplit } from '@/features/shared/hooks/useFeatures';
import { PAYMENT_METHODS } from '@/shared/constants/config';
import {
  maxLen,
  validateAmount,
  validateBoundedDate,
  validateOptionalText,
  validateText,
  ValidationMessages,
} from '@/shared/validation/fieldLimits';
import { DateBounds } from '@/shared/utils/dateBounds';

type FieldErrors = {
  amount?: string;
  merchant?: string;
  date?: string;
  notes?: string;
  categoryId?: string;
};

export function AddExpensePage() {
  const theme = useTheme();
  const { createMutation, error, setError, showSuccess } = useCreateExpense();
  const createSplitMutation = useCreateSplit();
  const { categories } = useCategories();
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [categorySuggested, setCategorySuggested] = useState(false);
  const [splitPayload, setSplitPayload] = useState<SplitPayload | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isPending = createMutation.isPending;

  const handleMerchantBlur = async () => {
    if (categoryId || !merchant.trim()) return;
    const suggestedId = await fetchCategorySuggestion(merchant).catch(() => null);
    if (suggestedId) {
      setCategoryId(suggestedId);
      setCategorySuggested(true);
      setFieldErrors((f) => ({ ...f, categoryId: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const next: FieldErrors = {};
    const amountErr = validateAmount(amount);
    const merchantErr = validateText('merchant', merchant);
    const dateErr = validateBoundedDate('transaction', date);
    const notesErr = validateOptionalText('notes', notes);
    if (amountErr) next.amount = amountErr;
    if (merchantErr) next.merchant = merchantErr;
    if (dateErr) next.date = dateErr;
    if (notesErr) next.notes = notesErr;
    if (!categoryId) next.categoryId = ValidationMessages.categoryRequired;
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate(
      {
        type: 'expense',
        amount: Number(amount),
        merchant,
        date,
        paymentMethod,
        categoryId,
        notes: notes || undefined,
        tags: tags.length ? tags : undefined,
      },
      {
        onSuccess: (created) => {
          if (splitPayload && created) {
            createSplitMutation.mutate({
              groupId: splitPayload.groupId,
              transactionId: created.id,
              participants: splitPayload.participants,
            });
          }
        },
      }
    );
  };

  return (
    <FormStackScreen title="Add Expense" eyebrow="New Transaction" icon="receipt">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
          label="Merchant"
          value={merchant}
          onChange={(e) => { setMerchant(e.target.value); setCategorySuggested(false); setFieldErrors((f) => ({ ...f, merchant: undefined })); }}
          onBlur={() => { void handleMerchantBlur(); }}
          placeholder="e.g. Starbucks"
          maxLength={maxLen('merchant')}
          disabled={isPending}
          error={fieldErrors.merchant}
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
        <FormFieldLabel>Payment Method</FormFieldLabel>
        <OptionChips
          options={PAYMENT_METHODS.map((p) => p.id)}
          value={paymentMethod}
          onChange={setPaymentMethod}
          getLabel={(v) => PAYMENT_METHODS.find((p) => p.id === v)?.label ?? v}
          disabled={isPending}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: theme.spacing.sm }}>
          <FormFieldLabel style={{ marginBottom: 0 }}>Category</FormFieldLabel>
          {categorySuggested ? (
            <span style={{
              fontSize: 10, fontWeight: 700, color: theme.colors.primary, backgroundColor: theme.colors.primarySoft,
              borderRadius: theme.radii.full, padding: '2px 8px', fontFamily: 'Inter, sans-serif',
            }}>Suggested</span>
          ) : null}
        </div>
        <OptionChipList
          items={(categories ?? []).map((c) => ({ id: c.id, label: c.name, color: c.color ?? undefined }))}
          selectedId={categoryId}
          onSelect={(id) => { setCategoryId(id); setCategorySuggested(false); setFieldErrors((f) => ({ ...f, categoryId: undefined })); }}
          disabled={isPending}
          error={fieldErrors.categoryId}
        />
        <Input
          label="Notes"
          maxLength={maxLen('notes')}
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setFieldErrors((f) => ({ ...f, notes: undefined })); }}
          placeholder="Optional note"
          multiline
          disabled={isPending}
          error={fieldErrors.notes}
        />
        <TagInput value={tags} onChange={setTags} disabled={isPending} />
        <SplitWithFamilyField amount={Number(amount) || 0} onSplitChange={setSplitPayload} disabled={isPending} />
        {error ? <FormErrorBanner message={error} /> : null}
        {showSuccess ? <FormSuccessBanner message="Expense saved" /> : null}
        <Button title="Save Expense" onPress={handleSubmit} loading={isPending || showSuccess} disabled={showSuccess} size="lg" />
      </form>
    </FormStackScreen>
  );
}
