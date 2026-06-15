import { FeatureHeader } from '@/shared/components/ui/feature-screen';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { useTheme } from '@/shared/theme';

export function PrivacyPage() {
  const theme = useTheme();

  return (
    <ScreenWrapper
      header={<FeatureHeader title="Privacy Policy" variant="stack" showBack />}
    >
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: '24px', color: theme.colors.textSecondary }}>
        <p>Your privacy is important to us. This Privacy Policy explains how ExpenseFlow collects, uses, and protects your personal information.</p>
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

export function TermsPage() {
  const theme = useTheme();

  return (
    <ScreenWrapper
      header={<FeatureHeader title="Terms of Service" variant="stack" showBack />}
    >
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: '24px', color: theme.colors.textSecondary }}>
        <p>By using ExpenseFlow, you agree to these Terms of Service. Please read them carefully.</p>
        <h3 style={{ color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, fontSize: 17, fontWeight: 700 }}>Acceptance of Terms</h3>
        <p>By accessing or using ExpenseFlow, you agree to be bound by these terms and all applicable laws.</p>
        <h3 style={{ color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, fontSize: 17, fontWeight: 700 }}>Service Description</h3>
        <p>ExpenseFlow provides personal finance tracking and management tools. We reserve the right to modify or discontinue features at any time.</p>
        <h3 style={{ color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, fontSize: 17, fontWeight: 700 }}>User Responsibilities</h3>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
        <p style={{ marginTop: theme.spacing.xl, fontSize: 13, color: theme.colors.textTertiary }}>Last updated: June 2025</p>
      </div>
    </ScreenWrapper>
  );
}
