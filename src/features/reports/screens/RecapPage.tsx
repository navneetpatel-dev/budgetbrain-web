import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { BentoCard } from '@/shared/components/ui/index';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { ScreenSkeleton } from '@/shared/components/ui/layout';
import { useTheme } from '@/shared/theme';
import { useAppSelector } from '@/shared/store/hooks';
import { apiGet } from '@/shared/services/api';
import { formatCurrency } from '@/shared/utils/currency';
import type { MonthlyRecap } from '@/shared/types';

function buildRecapText(recap: MonthlyRecap, currency: string): string {
  const lines = [
    `My BudgetBrain recap (${recap.periodStart} – ${recap.periodEnd})`,
    `💸 Total spent: ${formatCurrency(recap.totalSpent, currency)}`,
  ];
  if (recap.topCategory) {
    lines.push(`🏆 Top category: ${recap.topCategory.name} (${formatCurrency(recap.topCategory.amount, currency)})`);
  }
  if (recap.biggestExpense) {
    lines.push(`💥 Biggest expense: ${recap.biggestExpense.merchant ?? 'Unknown'} — ${formatCurrency(recap.biggestExpense.amount, currency)}`);
  }
  if (recap.noSpendStreak > 0) {
    lines.push(`🔥 No-spend streak: ${recap.noSpendStreak} day${recap.noSpendStreak === 1 ? '' : 's'}`);
  }
  return lines.join('\n');
}

export function RecapPage() {
  const theme = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const currency = user?.currency ?? 'INR';
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');

  const { data: recap, isLoading } = useQuery({
    queryKey: ['recap'],
    queryFn: () => apiGet<MonthlyRecap>('/reports/recap'),
  });

  const handleShare = async () => {
    if (!recap) return;
    const text = buildRecapText(recap, currency);
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ text, title: 'My BudgetBrain recap' });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <FormStackScreen title="Monthly Recap" eyebrow="Reports" icon="sparkles">
      {isLoading || !recap ? (
        <ScreenSkeleton rows={4} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Celebration Recap Hero Card */}
          <div
            style={{
              position: 'relative',
              backgroundColor: theme.colors.surfaceContainer ?? theme.colors.surface,
              borderRadius: theme.radii.card,
              padding: '28px 20px',
              textAlign: 'center',
              border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
              overflow: 'hidden',
              background: `linear-gradient(180deg, rgba(14, 165, 233, 0.14), rgba(139, 92, 246, 0.08), transparent)`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.isDark ? 'rgba(14, 165, 233, 0.18)' : 'rgba(14, 165, 233, 0.25)',
              }}
            >
              <AppIcon name="sparkles" size={24} color={theme.colors.primary} />
            </div>

            <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Total Spent This Month ({recap.periodStart} – {recap.periodEnd})
            </span>

            <div style={{ fontSize: 36, fontWeight: 800, color: theme.colors.text, margin: '8px 0 12px', letterSpacing: '-0.8px' }}>
              {formatCurrency(recap.totalSpent, currency)}
            </div>

            {recap.noSpendStreak > 0 && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: theme.isDark ? 'rgba(78, 222, 163, 0.12)' : theme.colors.secondaryContainer,
                  padding: '6px 14px',
                  borderRadius: 9999,
                  border: `1px solid ${theme.isDark ? 'rgba(78, 222, 163, 0.25)' : 'transparent'}`,
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                }}
              >
                <AppIcon name="trendingUp" size={14} color={theme.colors.secondary} />
                <span>
                  <strong style={{ color: theme.colors.secondary }}>{recap.noSpendStreak} Days</strong> No-Spend Streak
                </span>
              </div>
            )}
          </div>

          {/* Key Insights Grid */}
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text, marginTop: 4 }}>
            Key Insights
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {recap.topCategory && (
              <BentoCard
                title="Top Category"
                value={recap.topCategory.name}
                subtitle={formatCurrency(recap.topCategory.amount, currency)}
                accentColor={theme.colors.primary}
                icon="category"
              />
            )}

            {recap.biggestExpense && (
              <BentoCard
                title="Largest Single Outflow"
                value={recap.biggestExpense.merchant ?? 'Unknown'}
                subtitle={formatCurrency(recap.biggestExpense.amount, currency)}
                accentColor={theme.colors.rose}
                icon="expense"
              />
            )}

            <BentoCard
              title="Discipline Streak"
              value={`${recap.noSpendStreak} Days`}
              subtitle="Zero discretionary spending"
              accentColor={theme.colors.secondary}
              icon="shield"
            />
          </div>

          {/* Share CTA Button */}
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => { void handleShare(); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 20px',
                borderRadius: 14,
                border: 'none',
                background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.ocean})`,
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <AppIcon name="upload" size={18} color="#FFFFFF" />
              <span>{shareState === 'copied' ? 'Copied to Clipboard! 🎉' : 'Share Monthly Recap'}</span>
            </button>
          </div>
        </div>
      )}
    </FormStackScreen>
  );
}
