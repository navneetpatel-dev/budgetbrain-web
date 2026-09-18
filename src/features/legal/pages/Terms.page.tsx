'use client';

import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { useTheme } from '@/shared/theme';

export function TermsPage() {
  const theme = useTheme();

  return (
    <ScreenWrapper header={<ProfileStackHeader screen="terms" />} inset="stack">
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: '24px', color: theme.colors.textSecondary }}>
        <p>By using budgetbrain, you agree to these Terms of Service. Please read them carefully.</p>
        <h3 style={{ color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, fontSize: 17, fontWeight: 700 }}>Acceptance of Terms</h3>
        <p>By accessing or using budgetbrain, you agree to be bound by these terms and all applicable laws.</p>
        <h3 style={{ color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, fontSize: 17, fontWeight: 700 }}>Service Description</h3>
        <p>budgetbrain provides personal finance tracking and management tools. We reserve the right to modify or discontinue features at any time.</p>
        <h3 style={{ color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, fontSize: 17, fontWeight: 700 }}>User Responsibilities</h3>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
        <p style={{ marginTop: theme.spacing.xl, fontSize: 13, color: theme.colors.textTertiary }}>Last updated: June 2025</p>
      </div>
    </ScreenWrapper>
  );
}
