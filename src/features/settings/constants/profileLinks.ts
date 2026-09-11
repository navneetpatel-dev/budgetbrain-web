import type { AppIconName } from '@/shared/components/ui/icons/AppIcon';

export const PROFILE_FEATURE_LINKS: { label: string; href: string; icon: AppIconName }[] = [
  { label: 'Goals', href: '/goals', icon: 'goals' },
  { label: 'Income', href: '/income', icon: 'income' },
  { label: 'AI Insights', href: '/ai', icon: 'ai' },
  { label: 'Net Worth', href: '/net-worth', icon: 'netWorth' },
  { label: 'Reports', href: '/reports', icon: 'chart' },
  { label: 'Categories', href: '/categories', icon: 'category' },
  { label: 'Debts', href: '/loans', icon: 'creditCard' },
  { label: 'Subscriptions', href: '/subscriptions', icon: 'calendar' },
];

export const PROFILE_ACCOUNT_LINKS: { label: string; href: string; icon: AppIconName }[] = [
  { label: 'Accounts', href: '/accounts', icon: 'wallet' },
  { label: 'Investments', href: '/investments', icon: 'chart' },
  { label: 'Family Groups', href: '/family', icon: 'family' },
  { label: 'Integrations', href: '/integrations', icon: 'link' },
  { label: 'Notifications', href: '/notifications', icon: 'bell' },
  { label: 'Support', href: '/support', icon: 'support' },
  { label: 'Privacy Policy', href: '/privacy', icon: 'document' },
  { label: 'Terms of Service', href: '/terms', icon: 'document' },
];
