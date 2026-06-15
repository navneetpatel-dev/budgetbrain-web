import { StackNavHeader, useProfileBack } from '@/shared/components/ui/feature-screen';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Card, Button } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';

export function SubscriptionPage() {
  const theme = useTheme();
  const goBack = useProfileBack();

  const plans = [
    { name: 'Monthly', price: '₹199', period: '/month', id: 'monthly' },
    { name: 'Yearly', price: '₹1,499', period: '/year', id: 'yearly', popular: true },
    { name: 'Lifetime', price: '₹3,999', period: 'once', id: 'lifetime' },
  ];

  return (
    <ScreenWrapper header={<StackNavHeader title="Subscription" subtitle="Choose your plan" onBack={goBack} />} inset="stack">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          variant={plan.popular ? 'elevated' : 'outline'}
          style={{
            borderColor: plan.popular ? theme.colors.primary : theme.colors.border,
            position: 'relative',
          }}
        >
          {plan.popular && (
            <span style={{
              position: 'absolute', top: -10, right: 20,
              padding: '4px 12px', borderRadius: theme.radii.full,
              backgroundColor: theme.colors.primary, color: theme.colors.onPrimary,
              fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif',
            }}>
              Popular
            </span>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, color: theme.colors.text }}>
                {plan.name}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>
                {plan.period}
              </span>
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amount.fontSize, fontWeight: Number(theme.typography.amount.fontWeight), color: theme.colors.primary }}>
              {plan.price}
            </span>
          </div>
        </Card>
      ))}
    </ScreenWrapper>
  );
}
