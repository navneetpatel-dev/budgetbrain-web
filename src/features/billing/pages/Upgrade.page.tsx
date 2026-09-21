'use client';

import { useSearchParams } from 'next/navigation';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Button, FormErrorBanner, GroupedCard } from '@/shared/components/ui/index';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useAppSelector } from '@/shared/store/hooks';
import { useTheme } from '@/shared/theme';
import { useUpgrade, type UpgradeStatus } from '../hooks/useUpgrade';
import type { SubscriptionPlan } from '../types/billing.types';

/** The mobile app's own custom URL scheme (see mobile/app.json's "scheme") — used to bounce
 * the user back into the app once a checkout started from there succeeds. */
const MOBILE_APP_SCHEME_URL = 'budgetbrain://';

/** Fixed marketing copy matching backend's PLAN_PRICES_INR — the actual amount charged always
 * comes from the /subscriptions/razorpay/checkout response, never recomputed here. */
const PLANS: { plan: SubscriptionPlan; label: string; price: string; cadence: string; badge?: string }[] = [
  { plan: 'monthly', label: 'Monthly', price: '₹199', cadence: '/month' },
  { plan: 'yearly', label: 'Yearly', price: '₹1,499', cadence: '/year', badge: 'Best value' },
  { plan: 'lifetime', label: 'Lifetime', price: '₹3,999', cadence: 'one-time' },
];

function statusMessage(status: UpgradeStatus, plan: SubscriptionPlan | null): string | null {
  switch (status) {
    case 'creating_order':
      return 'Setting up checkout…';
    case 'confirming':
      return 'Payment received — confirming your subscription…';
    case 'success':
      return `You're now on the ${plan ?? ''} plan. Welcome to Premium!`;
    case 'confirming_delayed':
      return "Payment received. Your access is being set up and should appear shortly — this can take a few minutes. If it still hasn't updated after that, contact support and we'll sort it out.";
    case 'cancelled':
      return 'Checkout cancelled — no charge was made.';
    default:
      return null;
  }
}

export function UpgradePage() {
  const theme = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const { status, error, pendingPlan, startCheckout, reset, recheckEntitlement } = useUpgrade();
  const searchParams = useSearchParams();

  const preselectedPlan = searchParams.get('plan') as SubscriptionPlan | null;
  // Only the mobile handoff sets `from=app` (see webHandoff.service.ts) — a plain web visit
  // has nowhere to "return" to, so this action only ever shows when it'll actually work.
  const cameFromApp = searchParams.get('from') === 'app';

  const alreadyPremium = user?.role === 'premium' || user?.role === 'lifetime';
  const busy = status === 'creating_order' || status === 'awaiting_payment' || status === 'confirming';
  const info = statusMessage(status, pendingPlan);

  return (
    <ScreenWrapper inset="tab">
      <div style={{ padding: theme.spacing.lg, textAlign: 'center' }}>
        <AppIcon name="sparkles" size={32} color={theme.colors.primary} />
        <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: theme.spacing.sm, color: theme.colors.text }}>
          Upgrade to Premium
        </h1>
        <p style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
          Unlock AI Insights, Family Accounts, and PDF/Excel reports.
        </p>
      </div>

      {alreadyPremium ? (
        <GroupedCard title="Your plan">
          <div style={{ padding: theme.spacing.lg }}>
            <p style={{ color: theme.colors.text, fontWeight: 700 }}>
              You already have {user?.role === 'lifetime' ? 'Lifetime' : 'Premium'} access. Thank you!
            </p>
          </div>
        </GroupedCard>
      ) : (
        <>
          {error ? (
            <div style={{ padding: `0 ${theme.spacing.lg}px ${theme.spacing.md}px` }}>
              <FormErrorBanner message={error} />
            </div>
          ) : null}
          {info ? (
            <div style={{ padding: `0 ${theme.spacing.lg}px ${theme.spacing.md}px` }}>
              <p style={{
                color: status === 'success'
                  ? theme.colors.secondary
                  : status === 'confirming_delayed'
                    ? theme.colors.warning
                    : theme.colors.textSecondary,
                fontWeight: 600, textAlign: 'center',
              }}>
                {info}
              </p>
              {status === 'confirming_delayed' ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: theme.spacing.sm }}>
                  <Button title="Check again" onPress={recheckEntitlement} variant="outline" />
                </div>
              ) : null}
              {status === 'success' && cameFromApp ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: theme.spacing.sm }}>
                  <Button
                    title="Return to app"
                    onPress={() => { window.location.href = MOBILE_APP_SCHEME_URL; }}
                    variant="primary"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: theme.spacing.md,
            padding: theme.spacing.lg,
          }}>
            {PLANS.map(({ plan, label, price, cadence, badge }) => {
              const isPreselected = plan === preselectedPlan;
              const isHighlighted = Boolean(badge) || isPreselected;
              return (
              <div
                key={plan}
                style={{
                  position: 'relative',
                  border: `1.5px solid ${isHighlighted ? theme.colors.primary : theme.colors.borderSubtle}`,
                  borderRadius: theme.radii.lg,
                  padding: theme.spacing.lg,
                  backgroundColor: theme.colors.surface,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing.sm,
                }}
              >
                {badge ? (
                  <span style={{
                    position: 'absolute', top: -10, right: theme.spacing.md,
                    backgroundColor: theme.colors.primary, color: theme.colors.onPrimary,
                    fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: theme.radii.full,
                  }}>
                    {badge}
                  </span>
                ) : isPreselected ? (
                  <span style={{
                    position: 'absolute', top: -10, right: theme.spacing.md,
                    backgroundColor: theme.colors.primary, color: theme.colors.onPrimary,
                    fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: theme.radii.full,
                  }}>
                    Picked in app
                  </span>
                ) : null}
                <span style={{ fontSize: 14, fontWeight: 700, color: theme.colors.textSecondary }}>{label}</span>
                <span style={{ fontSize: 28, fontWeight: 800, color: theme.colors.text }}>
                  {price}
                  <span style={{ fontSize: 13, fontWeight: 500, color: theme.colors.textSecondary }}> {cadence}</span>
                </span>
                <Button
                  title={`Subscribe ${label}`}
                  onPress={() => { reset(); void startCheckout(plan); }}
                  loading={busy && pendingPlan === plan}
                  disabled={busy && pendingPlan !== plan}
                  variant={isHighlighted ? 'primary' : 'outline'}
                  style={{ marginTop: theme.spacing.sm }}
                />
              </div>
              );
            })}
          </div>
        </>
      )}
    </ScreenWrapper>
  );
}
