'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import type { StructuredInsight } from '@/shared/types';

interface Props {
  recommendations: StructuredInsight[];
}

export function AiBudgetRecommendationBanner({ recommendations }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || recommendations.length === 0) return null;

  const firstRec = recommendations[0];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        margin: '8px 16px 16px',
        borderRadius: 14,
        background: theme.isDark
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))'
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05))',
        border: `1px solid ${theme.isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: theme.isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <AppIcon name="sparkles" size={17} color={theme.colors.primary} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: theme.colors.primary,
            }}
          >
            {firstRec.title || 'AI Smart Recommendation'}
          </span>
          <button
            type="button"
            aria-label="Dismiss recommendation"
            onClick={() => setDismissed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme.colors.textTertiary,
              padding: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <AppIcon name="close" size={14} color={theme.colors.textTertiary} />
          </button>
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            lineHeight: '19px',
            color: theme.colors.text,
          }}
        >
          {firstRec.message}
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/ai')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              color: theme.colors.primary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Ask AI Coach
            <AppIcon name="chevronRight" size={12} color={theme.colors.primary} />
          </button>
        </div>
      </div>
    </div>
  );
}
