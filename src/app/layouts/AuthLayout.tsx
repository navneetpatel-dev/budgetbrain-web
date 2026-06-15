import { Outlet } from 'react-router-dom';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';

export function AuthLayout() {
  const theme = useTheme();
  const { contentMaxWidth } = useResponsive();

  return (
    <div style={{
      minHeight: '100%',
      backgroundColor: theme.colors.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: contentMaxWidth ?? 420,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xl,
      }}>
        <Outlet />
      </div>
    </div>
  );
}
