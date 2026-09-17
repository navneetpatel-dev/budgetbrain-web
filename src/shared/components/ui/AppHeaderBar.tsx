import { useNavigate } from 'react-router-dom';
import { BrandMark } from '@/shared/components/brand/BrandMark';
import { AppIcon } from './icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { useAppSelector } from '@/shared/store/hooks';

export interface AppHeaderBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotifications?: boolean;
  rightAction?: React.ReactNode;
}

export function AppHeaderBar({
  title = 'BudgetBrain',
  subtitle = 'Dashboard',
  showBack = false,
  onBack,
  showNotifications = true,
  rightAction,
}: AppHeaderBarProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const userInitial = (user?.name?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        backgroundColor: theme.colors.background,
        borderBottom: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showBack && (
          <button
            onClick={handleBack}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
              backgroundColor: theme.colors.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: theme.colors.text,
            }}
            aria-label="Go back"
          >
            <AppIcon name="arrowLeft" size={18} color={theme.colors.text} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrandMark size={32} />
          <div>
            <span style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontSize: 16,
              fontWeight: 800,
              color: theme.colors.text,
              letterSpacing: -0.3,
            }}>
              {title}
            </span>
            {subtitle && (
              <span style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                color: theme.colors.textTertiary,
              }}>
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {rightAction ? (
          rightAction
        ) : (
          <>
            {showNotifications && (
              <button
                onClick={() => navigate('/notifications')}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
                  backgroundColor: theme.colors.surface,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: theme.colors.textSecondary,
                  position: 'relative',
                }}
                aria-label="Notifications"
              >
                <AppIcon name="bell" size={18} color={theme.colors.textSecondary} />
                <span style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.colors.secondary,
                }} />
              </button>
            )}

            <button
              onClick={() => navigate('/settings')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                border: 'none',
                background: `linear-gradient(135deg, ${theme.colors.ocean}, ${theme.colors.violet})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 800,
                fontSize: 14,
                boxShadow: theme.shadows.sm,
              }}
              aria-label="Open profile settings"
            >
              {userInitial}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
