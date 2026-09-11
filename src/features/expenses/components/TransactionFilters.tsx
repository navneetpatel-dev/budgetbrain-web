import { FormFieldLabel } from '@/shared/components/ui/forms';
import { OptionChips } from '@/shared/components/ui/feature-screen';
import { Input } from '@/shared/components/ui/index';
import { PAYMENT_METHODS } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import type { Category, IncomeSource } from '@/shared/types';
import type {
  DatePreset,
  TransactionListFilters,
  TransactionTypeFilter,
} from '../utils/transactionFilters';
import { DateBounds } from '@/shared/utils/dateBounds';
import { FilterEntityPicker } from './FilterEntityPicker';
import { useTagSuggestions } from './TagInput';

const TYPE_OPTIONS: TransactionTypeFilter[] = ['all', 'expense', 'income'];
const DATE_OPTIONS: DatePreset[] = ['all', 'this_month', 'last_30', 'custom'];

function typeLabel(v: TransactionTypeFilter) {
  if (v === 'all') return 'All';
  if (v === 'expense') return 'Expense';
  return 'Income';
}

/** Short labels so 4-segment control never wraps / deforms. */
function dateLabel(v: DatePreset) {
  if (v === 'all') return 'All';
  if (v === 'this_month') return 'Month';
  if (v === 'last_30') return '30 days';
  return 'Custom';
}

interface Props {
  filters: TransactionListFilters;
  onChange: (next: TransactionListFilters) => void;
  onApply: () => void;
  onClear: () => void;
  categories: Category[];
  sources: IncomeSource[];
}

export function TransactionFilters({
  filters,
  onChange,
  onApply,
  onClear,
  categories,
  sources,
}: Props) {
  const theme = useTheme();
  const { data: tagSuggestions } = useTagSuggestions();
  const showCategory = filters.type !== 'income';
  const showSource = filters.type !== 'expense';
  const showPayment = filters.type !== 'income';

  // Web config uses `{ id, label }`; mobile uses `{ value, label }`.
  const paymentMethods = PAYMENT_METHODS.map((p) => ({
    id: 'id' in p ? (p as { id: string }).id : (p as { value: string }).value,
    label: p.label,
  }));
  const paymentOptions = ['', ...paymentMethods.map((p) => p.id)];

  const patch = (partial: Partial<TransactionListFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <FormFieldLabel>Type</FormFieldLabel>
        <OptionChips
          options={TYPE_OPTIONS}
          value={filters.type}
          onChange={(type) =>
            patch({
              type,
              categoryId: type === 'income' ? undefined : filters.categoryId,
              incomeSourceId: type === 'expense' ? undefined : filters.incomeSourceId,
              paymentMethod: type === 'income' ? undefined : filters.paymentMethod,
            })
          }
          getLabel={typeLabel}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <FormFieldLabel>Date</FormFieldLabel>
        <OptionChips
          options={DATE_OPTIONS}
          value={filters.datePreset}
          onChange={(datePreset) =>
            patch({
              datePreset,
              startDate: datePreset === 'custom' ? filters.startDate : undefined,
              endDate: datePreset === 'custom' ? filters.endDate : undefined,
            })
          }
          getLabel={dateLabel}
        />
      </div>

      {filters.datePreset === 'custom' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
          <Input
            label="From"
            type="date"
            value={filters.startDate ?? ''}
            onChange={(e) => {
              const startDate = e.target.value;
              if (filters.endDate && startDate && filters.endDate < startDate) {
                patch({ startDate, endDate: startDate });
                return;
              }
              patch({ startDate });
            }}
            min={DateBounds.rangeFrom(filters.endDate, filters.startDate).min}
            max={DateBounds.rangeFrom(filters.endDate, filters.startDate).max}
          />
          <Input
            label="To"
            type="date"
            value={filters.endDate ?? ''}
            onChange={(e) => patch({ endDate: e.target.value })}
            min={DateBounds.rangeTo(filters.startDate, filters.endDate).min}
            max={DateBounds.rangeTo(filters.startDate, filters.endDate).max}
          />
        </div>
      ) : null}

      {showCategory ? (
        <FilterEntityPicker
          label="Category"
          allLabel="All categories"
          value={filters.categoryId}
          options={categories.map((c) => ({ id: c.id, label: c.name }))}
          onChange={(categoryId) => patch({ categoryId })}
        />
      ) : null}

      {showSource ? (
        <FilterEntityPicker
          label="Income source"
          allLabel="All sources"
          value={filters.incomeSourceId}
          options={sources.map((s) => ({ id: s.id, label: s.name }))}
          onChange={(incomeSourceId) => patch({ incomeSourceId })}
        />
      ) : null}

      {tagSuggestions && tagSuggestions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <FormFieldLabel>Tag</FormFieldLabel>
          <OptionChips
            options={['', ...tagSuggestions]}
            value={filters.tag ?? ''}
            onChange={(tag) => patch({ tag: tag || undefined })}
            getLabel={(t) => t || 'All tags'}
          />
        </div>
      ) : null}

      {showPayment ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <FormFieldLabel>Payment</FormFieldLabel>
          <OptionChips
            options={paymentOptions}
            value={filters.paymentMethod ?? ''}
            onChange={(paymentMethod) => patch({ paymentMethod: paymentMethod || undefined })}
            getLabel={(id) =>
              id
                ? (paymentMethods.find((p) => p.id === id)?.label ?? id)
                : 'All methods'
            }
          />
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.sm,
          marginTop: 4,
          paddingTop: 4,
        }}
      >
        <button
          type="button"
          onClick={onClear}
          style={{
            border: 'none',
            background: 'none',
            padding: '4px 8px 4px 0',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: theme.colors.textSecondary,
          }}
        >
          Clear filters
        </button>
        <button
          type="button"
          onClick={onApply}
          style={{
            border: 'none',
            borderRadius: theme.radii.full,
            backgroundColor: theme.colors.primary,
            color: theme.colors.onPrimary,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '6px 14px',
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
