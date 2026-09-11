import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { Card, Button, SummaryCard } from '@/shared/components/ui/index';
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
      // clipboard unavailable — nothing more we can do
    }
  };

  return (
    <FormStackScreen title="Monthly Recap" eyebrow="Reports" icon="sparkles">
      {isLoading || !recap ? (
        <ScreenSkeleton rows={4} />
      ) : (
        <>
          <Card variant="elevated" style={{ textAlign: 'center', padding: theme.spacing.xl }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: theme.colors.textSecondary, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              {recap.periodStart} – {recap.periodEnd}
            </span>
            <p style={{
              fontFamily: theme.typography.amountLg.fontFamily ?? 'Inter, sans-serif',
              fontSize: theme.typography.amountLg.fontSize,
              fontWeight: Number(theme.typography.amountLg.fontWeight),
              color: theme.colors.text,
              margin: '8px 0 0',
            }}>{formatCurrency(recap.totalSpent, currency)}</p>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: theme.colors.textTertiary }}>Total spent this month</span>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            <SummaryCard
              title="Top category"
              amount={recap.topCategory ? formatCurrency(recap.topCategory.amount, currency) : '—'}
              subtitle={recap.topCategory?.name ?? 'No spending yet'}
              icon="chart"
              color={theme.colors.primary}
            />
            <SummaryCard
              title="Biggest expense"
              amount={recap.biggestExpense ? formatCurrency(recap.biggestExpense.amount, currency) : '—'}
              subtitle={recap.biggestExpense?.merchant ?? 'No spending yet'}
              icon="activity"
              color={theme.colors.danger}
            />
          </div>

          {recap.noSpendStreak > 0 ? (
            <Card variant="elevated" style={{ marginTop: theme.spacing.md, display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
              <span style={{ fontSize: 24 }}>🔥</span>
              <div>
                <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: theme.colors.text }}>{recap.noSpendStreak}-day no-spend streak</span>
                <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12, color: theme.colors.textTertiary }}>Keep it going!</span>
              </div>
            </Card>
          ) : null}

          <div style={{ marginTop: theme.spacing.lg }}>
            <Button
              title={shareState === 'copied' ? 'Copied to clipboard' : 'Share recap'}
              onPress={() => { void handleShare(); }}
              icon="upload"
              size="lg"
            />
          </div>
        </>
      )}
    </FormStackScreen>
  );
}
