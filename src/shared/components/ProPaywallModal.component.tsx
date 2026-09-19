'use client';

import Link from 'next/link';
import { useTheme } from '@/shared/theme';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';

interface ProPaywallModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

const PRO_FEATURES = [
  { icon: 'target', label: 'Unlimited Budgets & Goals' },
  { icon: 'calendar', label: 'Full Transaction History (beyond 90 days)' },
  { icon: 'document', label: 'Export PDF & Styled Excel Reports' },
  { icon: 'sparkles', label: 'AI Financial Coach & Spending Insights' },
  { icon: 'users', label: 'Family Accounts & Shared Budgets' },
  { icon: 'cloud', label: 'Multi-Device Cloud Sync' },
];

export function ProPaywallModal({
  open,
  onClose,
  title = 'Unlock with BudgetBrain Pro',
  description = 'You have reached a limit on the Free tier. Upgrade to Pro to unlock unlimited access.',
}: ProPaywallModalProps) {
  const theme = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl border text-center"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
        >
          <AppIcon name="close" size={18} />
        </button>

        <div
          className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.ocean}, ${theme.colors.primary})`,
            color: '#FFFFFF',
          }}
        >
          <AppIcon name="sparkles" size={28} />
        </div>

        <h3 className="text-xl font-bold mb-2 text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{description}</p>

        <div className="space-y-2.5 text-left mb-6">
          {PRO_FEATURES.map((feat, idx) => (
            <div key={idx} className="flex items-center space-x-3 text-sm text-slate-300">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: theme.colors.primarySoft,
                  color: theme.colors.primary,
                }}
              >
                ✓
              </div>
              <span>{feat.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Link
            href="/upgrade"
            onClick={onClose}
            className="block w-full py-3 px-4 rounded-xl font-bold text-center text-white shadow-lg transition"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.ocean}, ${theme.colors.primary}, ${theme.colors.violet})`,
            }}
          >
            Upgrade to Pro · From ₹199/mo
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
