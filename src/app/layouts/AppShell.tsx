import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';
import { DesktopSidebar } from './DesktopSidebar';

export function AppShell() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isDesktop } = useResponsive();

  useEffect(() => {
    if (!isDesktop) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        navigate('/expense/add');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDesktop, navigate]);

  if (!isDesktop) {
    return <Outlet />;
  }

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      backgroundColor: theme.colors.background,
    }}>
      <DesktopSidebar />
      <main style={{
        flex: 1,
        minWidth: 0,
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Outlet />
      </main>
    </div>
  );
}
