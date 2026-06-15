import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppIcon, type AppIconName } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';

type TabConfig = {
  route: string;
  label: string;
  icon: AppIconName;
};

const TABS: TabConfig[] = [
  { route: '/dashboard', label: 'Home', icon: 'home' },
  { route: '/expenses', label: 'Activity', icon: 'activity' },
  { route: '/budgets', label: 'Budgets', icon: 'budgets' },
  { route: '/settings', label: 'Profile', icon: 'profile' },
];

const HIDDEN_TAB_BAR_PATHS = ['/ai'];

function CustomTabBar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { tabBarBottomInset, tabBarPaddingX, contentMaxWidth, isDesktop } = useResponsive();

  const currentPath = '/' + location.pathname.split('/').filter(Boolean)[0];
  const shouldHide = HIDDEN_TAB_BAR_PATHS.some((p) => location.pathname.startsWith(p));

  if (shouldHide || isDesktop) return null;

  const leftTabs = TABS.slice(0, 2);
  const rightTabs = TABS.slice(2);

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      paddingBottom: `max(${tabBarBottomInset}px, env(safe-area-inset-bottom, 0px))`,
      paddingLeft: tabBarPaddingX,
      paddingRight: tabBarPaddingX,
      paddingTop: theme.spacing.xs,
      zIndex: 100,
      pointerEvents: 'none',
    }}>
      <div style={{
        width: '100%',
        maxWidth: contentMaxWidth ?? '100%',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        backgroundColor: theme.isDark ? 'rgba(22, 29, 50, 0.92)' : theme.colors.surface,
        borderRadius: 28,
        border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
        paddingLeft: theme.spacing.sm,
        paddingRight: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
        minHeight: 64,
        boxShadow: theme.shadows.lg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        pointerEvents: 'auto',
      }}>
        <div style={{ flex: 1, display: 'flex' }}>
          {leftTabs.map((tab) => {
            const isFocused = currentPath === tab.route;
            return (
              <TabButton
                key={tab.route}
                config={tab}
                isFocused={isFocused}
                onPress={() => navigate(tab.route)}
                theme={theme}
              />
            );
          })}
        </div>

        <button
          onClick={() => navigate('/expense/add')}
          style={{
            marginTop: -28,
            marginLeft: theme.spacing.xs,
            marginRight: theme.spacing.xs,
            width: 56, height: 56,
            borderRadius: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`,
            border: `4px solid ${theme.colors.background}`,
            cursor: 'pointer',
            boxShadow: theme.shadows.lg,
            flexShrink: 0,
          }}
          aria-label="Add expense"
        >
          <AppIcon name="add" size={28} color={theme.colors.onPrimary} />
        </button>

        <div style={{ flex: 1, display: 'flex' }}>
          {rightTabs.map((tab) => {
            const isFocused = currentPath === tab.route;
            return (
              <TabButton
                key={tab.route}
                config={tab}
                isFocused={isFocused}
                onPress={() => navigate(tab.route)}
                theme={theme}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TabButton({ config, isFocused, onPress, theme }: {
  config: TabConfig; isFocused: boolean; onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <button
      onClick={onPress}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '2px 0 2px 0', gap: 3, minHeight: 52,
        background: 'none', border: 'none', cursor: 'pointer',
      }}
    >
      {isFocused ? (
        <div style={{
          padding: '7px 14px', borderRadius: 18,
          background: `linear-gradient(135deg, ${theme.colors.primary}38, ${theme.colors.gradientEnd}22)`,
          border: `1px solid ${theme.colors.primary}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AppIcon name={config.icon} size={21} color={theme.colors.primary} />
        </div>
      ) : (
        <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AppIcon name={config.icon} size={20} color={theme.colors.textTertiary} />
        </div>
      )}
      <span style={{
        fontSize: 10, fontWeight: isFocused ? 700 : 600,
        color: isFocused ? theme.colors.primary : theme.colors.textTertiary,
        letterSpacing: '0.2px', fontFamily: 'Inter, sans-serif',
      }}>
        {config.label}
      </span>
      <div style={{
        width: 18, height: 3, borderRadius: 2, marginTop: 1,
        background: isFocused ? `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})` : 'transparent',
      }} />
    </button>
  );
}

export function TabLayout() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Outlet />
      <CustomTabBar />
    </div>
  );
}
