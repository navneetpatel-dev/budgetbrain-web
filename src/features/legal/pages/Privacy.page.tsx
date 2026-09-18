'use client';

import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { useTheme } from '@/shared/theme';

export function PrivacyPage() {
  const theme = useTheme();

  return (
    <ScreenWrapper header={<ProfileStackHeader screen="privacy" />} inset="stack">
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: '24px', color: theme.colors.textSecondary }}>
        <p>Your privacy is important to us. This Privacy Policy explains how budgetbrain collects, uses, and protects your personal information.</p>
        <h3 style={{ color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, fontSize: 17, fontWeight: 700 }}>Information We Collect</h3>
        <p>We collect information you provide when creating an account, including your name, email address, and financial transaction data. We also collect usage data to improve our services.</p>
        <h3 style={{ color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, fontSize: 17, fontWeight: 700 }}>How We Use Your Data</h3>
        <p>Your data is used to provide and improve our services, send notifications, and analyze usage patterns. We never sell your personal information to third parties.</p>
        <h3 style={{ color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, fontSize: 17, fontWeight: 700 }}>Data Security</h3>
        <p>We implement industry-standard security measures to protect your data, including encryption at rest and in transit.</p>
        <p style={{ marginTop: theme.spacing.xl, fontSize: 13, color: theme.colors.textTertiary }}>Last updated: June 2025</p>
      </div>
    </ScreenWrapper>
  );
}
