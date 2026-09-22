import { ProfileStackHeader } from '@/features/settings';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { buildTheme, DEFAULT_ACCENT } from '@/shared/theme';

// No 'use client' here: this page has no interactivity of its own (its rendered children,
// ScreenWrapper/ProfileStackHeader, are already client components with their own boundary
// — see shared/components/ui/layout.tsx). Static content stays server-rendered instead of
// hydrating. Trade-off: this page always renders the light/ocean theme regardless of the
// signed-in user's dark-mode preference, since it can't read ThemeContext without becoming
// a client component — acceptable for a cold, informational page.
export function PrivacyPage() {
  const theme = buildTheme('light', DEFAULT_ACCENT);

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
