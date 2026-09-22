import { useState } from 'react';
import { ActionSheet } from '@/shared/components/ui/ActionSheet';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { useTheme } from '@/shared/theme';
import { FILTER_PICKER_PREVIEW_COUNT } from '../../utils/transactionFilters';

export type FilterEntityOption = { id: string; label: string };

interface Props {
  label: string;
  allLabel: string;
  value?: string;
  options: FilterEntityOption[];
  onChange: (id: string | undefined) => void;
  previewCount?: number;
}

export function FilterEntityPicker({
  label,
  allLabel,
  value,
  options,
  onChange,
  previewCount = FILTER_PICKER_PREVIEW_COUNT,
}: Props) {
  const theme = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);

  const preview = options.slice(0, previewCount);
  const hasMore = options.length > previewCount;

  const chipStyle = (active: boolean) => ({
    padding: '8px 12px',
    borderRadius: theme.radii.lg,
    border: `1.5px solid ${active ? theme.colors.primary : (theme.isDark ? 'rgba(255,255,255,0.12)' : theme.colors.borderSubtle)}`,
    backgroundColor: active
      ? theme.colors.primary + '22'
      : (theme.isDark ? 'rgba(255,255,255,0.05)' : theme.colors.surface),
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    // Keep weight constant — boldening selected text shifts wrap layout.
    fontWeight: 600,
    color: active ? theme.colors.primary : theme.colors.text,
  } as const);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <FormFieldLabel>{label}</FormFieldLabel>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" onClick={() => onChange(undefined)} style={chipStyle(!value)}>
          {allLabel}
        </button>
        {preview.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            style={chipStyle(value === opt.id)}
          >
            {opt.label}
          </button>
        ))}
        {hasMore ? (
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="More options"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              padding: '8px 10px',
              borderRadius: theme.radii.lg,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: theme.colors.textSecondary,
            }}
          >
            More
            <AppIcon name="chevronRight" size={13} color={theme.colors.textSecondary} />
          </button>
        ) : null}
      </div>

      <ActionSheet
        visible={moreOpen}
        title={label}
        onClose={() => setMoreOpen(false)}
        items={[
          {
            id: '__all__',
            label: allLabel,
            onPress: () => onChange(undefined),
          },
          ...options.map((opt) => ({
            id: opt.id,
            label: opt.label,
            onPress: () => onChange(opt.id),
          })),
        ]}
      />
    </div>
  );
}
