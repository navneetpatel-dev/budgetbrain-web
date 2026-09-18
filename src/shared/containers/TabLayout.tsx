'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AppIcon, type AppIconName } from '@/shared/components/ui/icons/AppIcon';
import { ActionSheet } from '@/shared/components/ui/ActionSheet';
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
  const router = useRouter();
  const pathname = usePathname();
  const { tabBarBottomInset, tabBarPaddingX, contentMaxWidth, isDesktop } = useResponsive();
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentPath = '/' + (pathname?.split('/').filter(Boolean)[0] || '');
  const shouldHide = HIDDEN_TAB_BAR_PATHS.some((p) => pathname?.startsWith(p));

  if (shouldHide || isDesktop) return null;

  const leftTabs = TABS.slice(0, 2);
  const rightTabs = TABS.slice(2);

  return (
    <>
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
          backgroundColor: theme.isDark ? 'rgba(27, 32, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          borderRadius: theme.radii.nav,
          border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.tabBarBorder}`,
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
            {leftTabs.map((tab) => (
              <TabButton
                key={tab.route}
                config={tab}
                isFocused={currentPath === tab.route}
                onPress={() => router.push(tab.route)}
                theme={theme}
              />
            ))}
          </div>

          <button
            onClick={() => setSheetOpen(true)}
            style={{
              marginTop: -28,
              marginLeft: theme.spacing.xs,
              marginRight: theme.spacing.xs,
              width: 56, height: 56,
              borderRadius: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${theme.colors.ocean}, ${theme.colors.primary}, ${theme.colors.violet})`,
              border: `4px solid ${theme.colors.background}`,
              cursor: 'pointer',
              boxShadow: theme.shadows.lg,
              flexShrink: 0,
            }}
            aria-label="Create"
          >
            <AppIcon name="add" size={28} color="#FFFFFF" />
          </button>

          <div style={{ flex: 1, display: 'flex' }}>
            {rightTabs.map((tab) => (
              <TabButton
                key={tab.route}
                config={tab}
                isFocused={currentPath === tab.route}
                onPress={() => router.push(tab.route)}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </div>

      <ActionSheet
        visible={sheetOpen}
        title="Create"
        onClose={() => setSheetOpen(false)}
        items={[
          { id: 'expense', label: 'Expense', subtitle: 'Log a purchase or bill', icon: 'receipt', onPress: () => router.push('/expense/add') },
          { id: 'income', label: 'Income', subtitle: 'Record money in', icon: 'income', onPress: () => router.push('/income/add') },
          { id: 'budget', label: 'Budget', subtitle: 'Set a spending limit', icon: 'budgets', onPress: () => router.push('/budget/add') },
          { id: 'goal', label: 'Goal', subtitle: 'Start a savings target', icon: 'target', onPress: () => router.push('/goal/add') },
        ]}
      />
    </>
  );
}

function TabButton({ config, isFocused, onPress, theme }: {
  config: TabConfig; isFocused: boolean; onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <button
      onClick={onPress}
      aria-current={isFocused ? 'page' : undefined}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '2px 0', gap: 3, minHeight: 52,
        background: 'none', border: 'none', cursor: 'pointer',
      }}
    >
      <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AppIcon
          name={config.icon}
          size={22}
          color={isFocused ? theme.colors.primary : theme.colors.textTertiary}
        />
      </div>
      <span style={{
        fontSize: 10, fontWeight: isFocused ? 700 : 600,
        color: isFocused ? theme.colors.primary : theme.colors.textTertiary,
        letterSpacing: '0.2px', fontFamily: 'Inter, sans-serif',
      }}>
        {config.label}
      </span>
      <div style={{
        width: 16, height: 3, borderRadius: 2, marginTop: 1,
        background: isFocused ? theme.colors.primary : 'transparent',
      }} />
    </button>
  );
}

export function TabLayout({ children }: { children?: React.ReactNode }) {
  const theme = useTheme();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: theme.motion.duration.base / 1000, ease: theme.motion.easing }}
          style={{ flex: 1, minHeight: 0 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <CustomTabBar />
    </div>
  );
}
