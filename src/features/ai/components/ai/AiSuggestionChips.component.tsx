import type { CSSProperties } from 'react';
import { useTheme } from '@/shared/theme';
import {
  AI_FOLLOW_UP_SUGGESTIONS,
  AI_STARTER_SUGGESTIONS,
} from '../../constants/suggestions';

export function AiSuggestionChips({
  mode,
  disabled,
  onSelect,
}: {
  mode: 'starter' | 'followup';
  disabled?: boolean;
  onSelect: (prompt: string) => void;
}) {
  const theme = useTheme();
  const prompts = mode === 'starter' ? AI_STARTER_SUGGESTIONS : AI_FOLLOW_UP_SUGGESTIONS;
  const label = mode === 'starter' ? 'Suggested questions' : 'Continue with';

  const wrapStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 10,
  };

  const labelStyle: CSSProperties = {
    margin: 0,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: theme.colors.textTertiary,
    fontFamily: 'Inter, sans-serif',
  };

  const rowStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  };

  return (
    <div style={wrapStyle}>
      <p style={labelStyle}>{label}</p>
      <div style={rowStyle}>
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(prompt)}
            style={{
              padding: '8px 14px',
              borderRadius: theme.radii.full,
              cursor: disabled ? 'default' : 'pointer',
              backgroundColor: theme.colors.primarySoft,
              color: theme.colors.primary,
              border: `1px solid ${theme.colors.primary}33`,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              opacity: disabled ? 0.55 : 1,
            }}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
