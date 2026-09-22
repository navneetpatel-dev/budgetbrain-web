'use client';

import { useState, type KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import { useTheme } from '@/shared/theme';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { maxLen } from '@/shared/validation/fieldLimits';

const MAX_TAGS = 8;

export function useTagSuggestions() {
  return useQuery({
    queryKey: ['expense-tag-suggestions'],
    queryFn: () => apiGet<{ tags: string[] }>('/expenses/tags/suggestions'),
    select: (data) => data.tags,
    staleTime: 60_000,
  });
}

export function TagInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const { data: suggestions } = useTagSuggestions();

  const addTag = (raw: string) => {
    const tag = raw.trim().slice(0, maxLen('tag'));
    if (!tag || value.includes(tag) || value.length >= MAX_TAGS) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const unusedSuggestions = (suggestions ?? []).filter((s) => !value.includes(s)).slice(0, 6);

  return (
    <div style={{ marginBottom: theme.spacing.lg, opacity: disabled ? 0.55 : 1 }}>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif',
      }}>Tags (optional)</label>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
        border: `1.5px solid ${theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle}`,
        borderRadius: theme.radii.lg, padding: '8px 10px',
        backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.inputBg,
      }}>
        {value.map((tag) => (
          <span key={tag} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '5px 8px', borderRadius: theme.radii.full,
            backgroundColor: theme.colors.primarySoft, color: theme.colors.primary,
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
          }}>
            {tag}
            {!disabled ? (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                style={{ display: 'flex', border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: theme.colors.primary }}
              >
                <AppIcon name="close" size={12} color={theme.colors.primary} />
              </button>
            ) : null}
          </span>
        ))}
        {value.length < MAX_TAGS ? (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => draft && addTag(draft)}
            placeholder={value.length === 0 ? 'Add a tag…' : ''}
            disabled={disabled}
            style={{
              flex: 1, minWidth: 80, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'Inter, sans-serif', fontSize: 13, color: theme.colors.text, padding: '5px 2px',
            }}
          />
        ) : null}
      </div>
      {unusedSuggestions.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {unusedSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => addTag(s)}
              style={{
                padding: '4px 10px', borderRadius: theme.radii.full,
                border: `1px solid ${theme.colors.borderSubtle}`, background: 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500, color: theme.colors.textSecondary,
              }}
            >
              + {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}