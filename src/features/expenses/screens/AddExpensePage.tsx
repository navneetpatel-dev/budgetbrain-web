import { useState, useMemo, type FormEvent } from 'react';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
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

const CURRENCIES = [
  { symbol: '₹', code: 'INR' },
  { symbol: '$', code: 'USD' },
  { symbol: '€', code: 'EUR' },
  { symbol: '£', code: 'GBP' },
];

const MERCHANT_SUGGESTIONS = ['Starbucks', 'Uber', 'Amazon', 'Target', 'Whole Foods'];

const DEFAULT_TAG_PRESETS = ['#dinner', '#groceries', '#work', '#treat'];

export function AddExpensePage() {
  const theme = useTheme();
  const { createMutation, error, setError, showSuccess } = useCreateExpense();
  const createSplitMutation = useCreateSplit();
  const { categories } = useCategories();

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

  const isPending = createMutation.isPending;
  const currentCurrency = CURRENCIES[currencyIndex];

  const handleMerchantBlur = async () => {
    if (categoryId || !merchant.trim()) return;
    const suggestedId = await fetchCategorySuggestion(merchant).catch(() => null);
    if (suggestedId) {
      setCategoryId(suggestedId);
      setCategorySuggested(true);
      setFieldErrors((f) => ({ ...f, categoryId: undefined }));
    }
  };

  const handleSelectMerchantSuggestion = async (name: string) => {
    setMerchant(name);
    setFieldErrors((f) => ({ ...f, merchant: undefined }));
    const suggestedId = await fetchCategorySuggestion(name).catch(() => null);
    if (suggestedId) {
      setCategoryId(suggestedId);
      setCategorySuggested(true);
      setFieldErrors((f) => ({ ...f, categoryId: undefined }));
    }
  };

  const handleAddTagPreset = (preset: string) => {
    const raw = preset.replace(/^#/, '');
    if (!tags.includes(raw)) {
      setTags([...tags, raw]);
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
    <FormStackScreen title="Log Expense" eyebrow="New Transaction" icon="receipt">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Luminous Amount Hero Card */}
        <div
          style={{
            position: 'relative',
            padding: '24px',
            borderRadius: theme.radii.card,
            backgroundColor: theme.colors.surfaceElevated,
            border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
            boxShadow: theme.shadows.md,
            overflow: 'hidden',
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: theme.colors.primary,
              opacity: 0.12,
              filter: 'blur(36px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'Inter, sans-serif' }}>
              Expense Amount
            </span>

            {/* Currency Selector */}
            <div style={{ display: 'flex', gap: 4, backgroundColor: theme.colors.surfaceContainerLow, padding: 3, borderRadius: 20 }}>
              {CURRENCIES.map((curr, idx) => {
                const isSelected = idx === currencyIndex;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrencyIndex(idx)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                      color: isSelected ? '#FFFFFF' : theme.colors.textSecondary,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {curr.symbol} {curr.code}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount input row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>
              {currentCurrency.symbol}
            </span>
            <input
              type="number"
              step="any"
              autoFocus
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setFieldErrors((f) => ({ ...f, amount: undefined }));
              }}
              placeholder="0.00"
              disabled={isPending}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 44,
                fontWeight: 800,
                color: theme.colors.text,
                fontFamily: 'Inter, sans-serif',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: -1,
              }}
            />
          </div>
          {fieldErrors.amount && (
            <p style={{ color: theme.colors.danger, fontSize: 12, marginTop: 6, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
              {fieldErrors.amount}
            </p>
          )}
        </div>

        {/* Merchant Field & Quick Suggestion Chips */}
        <div>
          <Input
            label="Merchant / Recipient"
            value={merchant}
            onChange={(e) => {
              setMerchant(e.target.value);
              setCategorySuggested(false);
              setFieldErrors((f) => ({ ...f, merchant: undefined }));
            }}
            onBlur={() => { void handleMerchantBlur(); }}
            placeholder="e.g. Starbucks, Uber, Grocery"
            maxLength={maxLen('merchant')}
            disabled={isPending}
            error={fieldErrors.merchant}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: -8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>
              Suggestions:
            </span>
            {MERCHANT_SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => void handleSelectMerchantSuggestion(item)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 14,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
                  backgroundColor: theme.colors.surfaceContainerLow,
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Date Input */}
        <Input
          label="Date of Transaction"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setFieldErrors((f) => ({ ...f, date: undefined }));
          }}
          type="date"
          min={DateBounds.transaction(date).min}
          max={DateBounds.transaction(date).max}
          disabled={isPending}
          error={fieldErrors.date}
        />

        {/* Category Visual Grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <FormFieldLabel style={{ marginBottom: 0 }}>Category</FormFieldLabel>
            {categorySuggested && (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: theme.colors.secondaryFixed,
                backgroundColor: theme.colors.secondary + '20',
                borderRadius: 9999,
                padding: '2px 8px',
                fontFamily: 'Inter, sans-serif',
              }}>
                Smart Suggested ✨
              </span>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 10,
          }}>
            {(categories ?? []).map((cat) => {
              const isSelected = categoryId === cat.id;
              const catColor = cat.color ?? theme.colors.primary;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(cat.id);
                    setCategorySuggested(false);
                    setFieldErrors((f) => ({ ...f, categoryId: undefined }));
                  }}
                  disabled={isPending}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: isSelected
                      ? `2px solid ${catColor}`
                      : `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
                    backgroundColor: isSelected
                      ? (theme.isDark ? 'rgba(255,255,255,0.08)' : catColor + '14')
                      : theme.colors.surfaceContainerLow,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: catColor,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? theme.colors.text : theme.colors.textSecondary,
                    fontFamily: 'Inter, sans-serif',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
          {fieldErrors.categoryId && (
            <p style={{ color: theme.colors.danger, fontSize: 12, marginTop: 6, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
              {fieldErrors.categoryId}
            </p>
          )}
        </div>

        {/* Payment Method Selector */}
        <div>
          <FormFieldLabel>Payment Method</FormFieldLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  disabled={isPending}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    border: isSelected
                      ? `1.5px solid ${theme.colors.primary}`
                      : `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceContainerLow,
                    color: isSelected ? '#FFFFFF' : theme.colors.textSecondary,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {method.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tag input & presets */}
        <div>
          <TagInput value={tags} onChange={setTags} disabled={isPending} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>
              Presets:
            </span>
            {DEFAULT_TAG_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddTagPreset(preset)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  border: 'none',
                  backgroundColor: theme.colors.surfaceContainerHigh,
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <Input
          label="Optional Notes"
          maxLength={maxLen('notes')}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setFieldErrors((f) => ({ ...f, notes: undefined }));
          }}
          placeholder="Add memo or context"
          multiline
          disabled={isPending}
          error={fieldErrors.notes}
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
