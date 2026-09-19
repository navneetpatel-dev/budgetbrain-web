'use client';

import { useState, type FormEvent } from 'react';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { Input, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { useCreateExpense } from '../hooks/useExpenses';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { fetchCategorySuggestion } from '../hooks/useCategorySuggestion';
import { TagInput } from '../components/TagInput';
import { SplitWithFamilyField, type SplitPayload } from '@/features/family/components/SplitWithFamilyField';
import { useCreateSplit } from '@/features/shared/hooks/useFeatures';
import { ReceiptUploader } from '../components/ReceiptUploader.component';
import { useReceiptAttachment } from '../hooks/useReceiptAttachment.hook';
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

const CURRENCIES = [
  { symbol: '₹', code: 'INR' },
  { symbol: '$', code: 'USD' },
  { symbol: '€', code: 'EUR' },
  { symbol: '£', code: 'GBP' },
];

const MERCHANT_SUGGESTIONS = ['Starbucks', 'Uber', 'Amazon', 'Target', 'Whole Foods'];

export function AddExpensePage() {
  const theme = useTheme();
  const { createMutation, error, setError, showSuccess } = useCreateExpense();
  const createSplitMutation = useCreateSplit();
  const { categories } = useCategories();
  const { uploadReceipt } = useReceiptAttachment();

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [currencyIndex, setCurrencyIndex] = useState(0);
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

  const isPending = createMutation.isPending || createSplitMutation.isPending;

  const handleMerchantChange = async (val: string) => {
    setMerchant(val);
    if (fieldErrors.merchant) {
      setFieldErrors((prev) => ({ ...prev, merchant: undefined }));
    }
    if (val.trim().length >= 2 && !categorySuggested) {
      try {
        const suggestion = await fetchCategorySuggestion(val.trim());
        if (suggestion) {
          setCategoryId(suggestion);
          setCategorySuggested(true);
        }
      } catch {
        // silent fail
      }
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

    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});

    const selectedCurrency = CURRENCIES[currencyIndex].code;

    createMutation.mutate(
      {
        amount: Number(amount),
        currency: selectedCurrency,
        merchant: merchant.trim(),
        date,
        paymentMethod,
        categoryId: categoryId || undefined,
        notes: notes ? notes.trim() : undefined,
        tags: tags.length > 0 ? tags : undefined,
      },
      {
        onSuccess: async (savedTxn) => {
          if (receiptFile && savedTxn?.id) {
            try {
              await uploadReceipt(savedTxn.id, receiptFile);
            } catch {
              // upload error handled in hook
            }
          }
          if (splitPayload && savedTxn?.id) {
            createSplitMutation.mutate({
              groupId: splitPayload.groupId,
              transactionId: savedTxn.id,
              participants: splitPayload.participants,
            });
          }
        },
      },
    );
  };

  const selectedCurr = CURRENCIES[currencyIndex];

  return (
    <FormStackScreen title="Add Expense">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        {/* Hero Amount Display Card */}
        <div
          style={{
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.surface,
            borderRadius: theme.radii.card,
            padding: '24px 20px',
            textAlign: 'center',
            border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
            boxShadow: theme.shadows.sm,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
            {CURRENCIES.map((c, idx) => {
              const active = idx === currencyIndex;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrencyIndex(idx)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: theme.radii.full,
                    border: active ? `1px solid ${theme.colors.primary}` : `1px solid transparent`,
                    backgroundColor: active ? theme.colors.primarySoft : 'transparent',
                    color: active ? theme.colors.primary : theme.colors.textSecondary,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.code}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: theme.colors.primary,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {selectedCurr.symbol}
            </span>
            <input
              type="number"
              step="any"
              min="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (fieldErrors.amount) setFieldErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              placeholder="0.00"
              autoFocus
              disabled={isPending}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 36,
                fontWeight: 800,
                color: theme.colors.text,
                fontFamily: 'Inter, sans-serif',
                textAlign: 'left',
                width: '180px',
                letterSpacing: '-1px',
              }}
            />
          </div>
          {fieldErrors.amount && (
            <span style={{ fontSize: 12, color: theme.colors.danger, marginTop: 8, display: 'block', fontWeight: 600 }}>
              {fieldErrors.amount}
            </span>
          )}
        </div>

        {/* Merchant Field & Quick Suggestion Chips */}
        <div>
          <FormFieldLabel>Merchant / Payee</FormFieldLabel>
          <Input
            value={merchant}
            onChange={(e) => void handleMerchantChange(e.target.value)}
            placeholder="e.g. Starbucks, Uber"
            maxLength={maxLen('merchant')}
            disabled={isPending}
            error={fieldErrors.merchant}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {MERCHANT_SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => void handleMerchantChange(item)}
                style={{
                  padding: '4px 10px',
                  borderRadius: theme.radii.full,
                  backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surfaceHover,
                  border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
                  color: theme.colors.textSecondary,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Category Picker Chips */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <FormFieldLabel>Category</FormFieldLabel>
            {categorySuggested && (
              <span style={{ fontSize: 11, color: theme.colors.violet, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AppIcon name="sparkles" size={12} color={theme.colors.violet} /> AI Suggested
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((c) => {
              const active = c.id === categoryId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(c.id);
                    if (fieldErrors.categoryId) setFieldErrors((prev) => ({ ...prev, categoryId: undefined }));
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: theme.radii.card,
                    border: active ? `1.5px solid ${theme.colors.primary}` : `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
                    backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                    color: active ? theme.colors.primary : theme.colors.text,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.color || theme.colors.primary }} />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
          {fieldErrors.categoryId && (
            <span style={{ fontSize: 12, color: theme.colors.danger, marginTop: 6, display: 'block', fontWeight: 600 }}>
              {fieldErrors.categoryId}
            </span>
          )}
        </div>

        {/* Date and Payment Method Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: theme.spacing.md }}>
          <div>
            <FormFieldLabel>Date</FormFieldLabel>
            <Input
              type="date"
              value={date}
              min={DateBounds.transaction(date).min}
              max={DateBounds.transaction(date).max}
              onChange={(e) => {
                setDate(e.target.value);
                if (fieldErrors.date) setFieldErrors((prev) => ({ ...prev, date: undefined }));
              }}
              disabled={isPending}
              error={fieldErrors.date}
            />
          </div>

          <div>
            <FormFieldLabel>Payment Method</FormFieldLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PAYMENT_METHODS.map((pm) => {
                const active = pm.id === paymentMethod;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: theme.radii.md,
                      border: active ? `1.5px solid ${theme.colors.primary}` : `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
                      backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                      color: active ? theme.colors.primary : theme.colors.textSecondary,
                      fontSize: 12,
                      fontWeight: active ? 700 : 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {pm.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tags with Presets */}
        <div>
          <FormFieldLabel>Tags</FormFieldLabel>
          <TagInput value={tags} onChange={setTags} disabled={isPending} />
        </div>

        {/* Notes */}
        <div>
          <FormFieldLabel>Notes</FormFieldLabel>
          <Input
            value={notes}
            maxLength={maxLen('notes')}
            onChange={(e) => {
              setNotes(e.target.value);
              if (fieldErrors.notes) setFieldErrors((prev) => ({ ...prev, notes: undefined }));
            }}
            placeholder="Add memo or context"
            disabled={isPending}
            error={fieldErrors.notes}
          />
        </div>

        {/* Receipt Attachment */}
        <ReceiptUploader
          pendingFile={receiptFile}
          onFileSelect={setReceiptFile}
          disabled={isPending}
        />

        {/* Family Split */}
        <SplitWithFamilyField amount={Number(amount) || 0} onSplitChange={setSplitPayload} disabled={isPending} />

        {error && <FormErrorBanner message={error} />}
        {showSuccess && <FormSuccessBanner message="Expense saved successfully!" />}

        {/* Glowing Gradient Submit Button */}
        <button
          type="submit"
          disabled={isPending || showSuccess}
          style={{
            width: '100%',
            padding: '16px 24px',
            borderRadius: theme.radii.card,
            border: 'none',
            cursor: isPending || showSuccess ? 'not-allowed' : 'pointer',
            background: `linear-gradient(135deg, ${theme.colors.ocean}, ${theme.colors.primary}, ${theme.colors.violet})`,
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 800,
            fontFamily: 'Inter, sans-serif',
            boxShadow: theme.shadows.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'opacity 0.2s, transform 0.15s',
            opacity: isPending ? 0.7 : 1,
          }}
        >
          <AppIcon name="receipt" size={20} color="#FFFFFF" />
          <span>{isPending ? 'Saving Expense...' : 'Save Expense'}</span>
        </button>
      </form>
    </FormStackScreen>
  );
}
