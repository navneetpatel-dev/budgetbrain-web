import { useNavigate } from 'react-router-dom';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';

export function PremiumUpsellCard() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/subscription')}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.lg,
        borderRadius: theme.radii.lg,
        border: `1px solid ${theme.colors.primary}33`,
        background: `linear-gradient(135deg, ${theme.colors.primary}28, ${theme.colors.gradientEnd}18)`,
        cursor: 'pointer',
        marginBottom: theme.spacing.lg,
        textAlign: 'left',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: theme.colors.primarySoft, flexShrink: 0,
      }}>
        <AppIcon name="sparkles" size={20} color={theme.colors.primary} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>
          Unlock Premium
        </span>
        <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
          AI coach, advanced reports & unlimited budgets
        </span>
      </div>
      <AppIcon name="chevronRight" size={18} color={theme.colors.primary} />
    </button>
  );
}
