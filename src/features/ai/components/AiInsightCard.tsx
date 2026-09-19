'use client';

import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';

export function AiInsightCard({ text }: { text: string }) {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 14,
        backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.surfaceContainer,
        border: `1px solid ${theme.colors.borderSubtle}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: `linear-gradient(180deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`,
        }}
      />
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: theme.colors.primarySoft,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <AppIcon name="sparkles" size={15} color={theme.colors.primary} />
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          lineHeight: '20px',
          color: theme.colors.text,
        }}
      >
        {text}
      </p>
    </div>
  );
}
