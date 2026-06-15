import { useParams, useNavigate } from 'react-router-dom';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { Button, Card, ProgressBar } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { useGoalDetail } from '../hooks/useGoals';

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { goal, isLoading, deleteMutation } = useGoalDetail(id);

  if (isLoading || !goal) return <DetailSkeleton />;

  const pct = toSafePercent(goal.currentAmount, goal.targetAmount);

  const handleDelete = async () => {
    if (await confirm(CONFIRM.deleteGoal)) deleteMutation.mutate();
  };

  return (
    <>
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
            <Button title="Contribute" onPress={() => navigate(`/goal/${id}/contribute`)} variant="primary" size="lg" icon="add" />
            <Button title="Delete" onPress={() => { void handleDelete(); }} variant="danger" size="lg" loading={deleteMutation.isPending} icon="trash" />
          </div>
        </div>
      </FormStackScreen>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}

function Row({ t, l, v }: { t: ReturnType<typeof useTheme>; l: string; v: string }) {
  return <div><span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: t.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{l}</span><span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: t.colors.text, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{v}</span></div>;
}
