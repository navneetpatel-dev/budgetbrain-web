import { StackNavHeader, useProfileBack } from '@/shared/components/ui/feature-screen';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Card, Button } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';

export function SubscriptionPage() {
  const theme = useTheme();
  const goBack = useProfileBack();

  const plans = [
    {
      name: 'Monthly',
      price: '₹199',
      period: 'per month',
      id: 'monthly',
      features: ['AI Coach', 'Family sharing', 'Advanced reports'],
    },
    {
      name: 'Yearly',
      price: '₹1,499',
      period: 'per year',
      id: 'yearly',
      popular: true,
      features: ['Everything in Monthly', '2 months free', 'Priority support'],
    },
    {
      name: 'Lifetime',
      price: '₹3,999',
      period: 'one-time',
      id: 'lifetime',
      features: ['All Premium features', 'Lifetime updates', 'Best value'],
    },
  ];

  return (
    <ScreenWrapper header={<StackNavHeader title="Subscription" subtitle="Unlock Premium features" onBack={goBack} />} inset="stack">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          variant={plan.popular ? 'elevated' : 'outline'}
          style={{
            borderColor: plan.popular ? theme.colors.primary : theme.colors.border,
            position: 'relative',
            paddingTop: plan.popular ? theme.spacing.xl : theme.spacing.lg,
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md }}>
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
          <ul style={{ margin: `0 0 ${theme.spacing.md}px`, paddingLeft: 18, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: '22px' }}>
            {plan.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <Button
            title={plan.popular ? `Choose ${plan.name}` : `Select ${plan.name}`}
            onPress={() => {
              // Billing provider wiring lives elsewhere; keep a clear primary CTA.
            }}
            variant={plan.popular ? 'primary' : 'outline'}
          />
        </Card>
      ))}
      <p style={{
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 500,
        color: theme.colors.textTertiary,
        fontFamily: 'Inter, sans-serif',
        marginTop: theme.spacing.sm,
      }}>
        Cancel anytime. Prices shown in INR.
      </p>
    </ScreenWrapper>
  );
}
