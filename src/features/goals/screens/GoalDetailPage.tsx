import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { Button, Card, ProgressBar } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useGoalDetail } from '../hooks/useGoals';

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { goal, isLoading, deleteMutation } = useGoalDetail(id);

  if (isLoading || !goal) return null;

  const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;

  return (
    <FormStackScreen title="Goal Detail" eyebrow={goal.type.replace(/_/g, ' ')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        <Card variant="elevated" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>Progress</span>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amountLg.fontSize, fontWeight: Number(theme.typography.amountLg.fontWeight), color: theme.colors.text, margin: '4px 0' }}>{formatCurrency(goal.currentAmount, goal.currency)}<span style={{ fontSize: theme.typography.caption.fontSize, color: theme.colors.textTertiary }}> / {formatCurrency(goal.targetAmount, goal.currency)}</span></p>
          <ProgressBar progress={pct} color={pct >= 100 ? theme.colors.success : theme.colors.primary} />
          <span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, marginTop: 4, display: 'block', fontFamily: 'Inter, sans-serif' }}>{pct}% achieved</span>
        </Card>
        <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Row t={theme} l="Name" v={goal.name} /><Row t={theme} l="Type" v={goal.type.replace(/_/g, ' ')} /><Row t={theme} l="Target" v={formatCurrency(goal.targetAmount, goal.currency)} />{goal.targetDate && <Row t={theme} l="Target Date" v={goal.targetDate} />}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          <Button title="Contribute" onPress={() => window.location.href = `/goal/${id}/contribute`} variant="primary" size="lg" icon="add" />
          <Button title="Delete" onPress={() => { if (window.confirm('Delete this goal?')) deleteMutation.mutate(); }} variant="danger" size="lg" loading={deleteMutation.isPending} icon="trash" />
        </div>
      </div>
    </FormStackScreen>
  );
}

function Row({ t, l, v }: { t: ReturnType<typeof useTheme>; l: string; v: string }) {
  return <div><span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: t.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{l}</span><span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: t.colors.text, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{v}</span></div>;
}
