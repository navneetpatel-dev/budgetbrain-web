import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppIcon, type AppIconName } from '@/shared/components/ui/icons/AppIcon';
import { ActionSheet } from '@/shared/components/ui/ActionSheet';
import { BrandMark } from '@/shared/components/brand/BrandMark';
import { useTheme } from '@/shared/theme';
import { caption, textStyle } from '@/shared/theme/textStyles';
import { useResponsive } from '@/shared/hooks/useResponsive';
import { useAppSelector } from '@/shared/store/hooks';

type NavItem = {
  route: string;
  label: string;
  icon: AppIconName;
};

const MAIN_NAV: NavItem[] = [
  { route: '/dashboard', label: 'Home', icon: 'home' },
  { route: '/expenses', label: 'Activity', icon: 'activity' },
  { route: '/budgets', label: 'Budgets', icon: 'budgets' },
  { route: '/settings', label: 'Profile', icon: 'profile' },
];

const SECONDARY_NAV: NavItem[] = [
  { route: '/goals', label: 'Goals', icon: 'target' },
  { route: '/income', label: 'Income', icon: 'trendingUp' },
  { route: '/ai', label: 'AI Coach', icon: 'sparkles' },
  { route: '/loans', label: 'Debts', icon: 'creditCard' },
  { route: '/subscriptions', label: 'Subscriptions', icon: 'calendar' },
];

export function DesktopSidebar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarWidth } = useResponsive();
  const user = useAppSelector((s) => s.auth.user);
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentPath = '/' + location.pathname.split('/').filter(Boolean)[0];

  return (
    <aside style={{
      width: sidebarWidth,
      flexShrink: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRight: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
      backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.backgroundElevated,
      padding: `${20}px ${16}px`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, paddingLeft: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`,
        }}>
          <BrandMark size={20} color={theme.colors.onPrimary} strokeWidth={2} />
        </div>
        <div>
          <span style={textStyle(theme, 'bodySemibold', { color: theme.colors.text, fontWeight: 800, fontSize: 16, letterSpacing: -0.3, display: 'block' })}>budgetbrain</span>
          <span style={{ ...caption(theme), fontSize: 11, fontWeight: 500 }}>{user?.name ?? 'Finance'}</span>
        </div>
      </div>

      <button
        onClick={() => setSheetOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          margin: '0 8px 20px', padding: '12px 16px', borderRadius: theme.radii.lg,
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`,
          border: 'none', cursor: 'pointer', boxShadow: theme.shadows.md,
        }}
      >
        <AppIcon name="add" size={18} color={theme.colors.onPrimary} />
        <span style={textStyle(theme, 'bodyMedium', { fontSize: 14, fontWeight: 700, color: theme.colors.onPrimary })}>Create</span>
      </button>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ ...caption(theme), fontWeight: 600, letterSpacing: 0.2, padding: '0 12px 8px' }}>Main</span>
        {MAIN_NAV.map((item) => (
          <SidebarLink key={item.route} item={item} isActive={currentPath === item.route} onPress={() => navigate(item.route)} />
        ))}
      </nav>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 20 }}>
        <span style={{ ...caption(theme), fontWeight: 600, letterSpacing: 0.2, padding: '0 12px 8px' }}>More</span>
        {SECONDARY_NAV.map((item) => (
          <SidebarLink key={item.route} item={item} isActive={currentPath === item.route} onPress={() => navigate(item.route)} />
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <ActionSheet
        visible={sheetOpen}
        title="Create"
        onClose={() => setSheetOpen(false)}
        items={[
          { id: 'expense', label: 'Expense', subtitle: 'Log a purchase or bill', icon: 'receipt', onPress: () => navigate('/expense/add') },
          { id: 'income', label: 'Income', subtitle: 'Record money in', icon: 'income', onPress: () => navigate('/income/add') },
          { id: 'budget', label: 'Budget', subtitle: 'Set a spending limit', icon: 'budgets', onPress: () => navigate('/budget/add') },
          { id: 'goal', label: 'Goal', subtitle: 'Start a savings target', icon: 'target', onPress: () => navigate('/goal/add') },
        ]}
      />

      <div style={{
        margin: '0 8px', padding: '12px', borderRadius: theme.radii.lg,
        backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.surface,
        border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
      }}>
        <span style={{ ...caption(theme, theme.colors.textSecondary), fontSize: 11, fontWeight: 600 }}>Quick tip</span>
        <p style={{ ...caption(theme), marginTop: 4, lineHeight: '18px' }}>Use keyboard shortcuts: press <kbd style={{ padding: '1px 5px', borderRadius: 4, backgroundColor: theme.colors.primarySoft, fontSize: 11 }}>N</kbd> to add expense.</p>
      </div>
    </aside>
  );
}

function SidebarLink({ item, isActive, onPress }: { item: NavItem; isActive: boolean; onPress: () => void }) {
  const theme = useTheme();

  return (
    <button
      onClick={onPress}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', borderRadius: theme.radii.md,
        border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
        backgroundColor: isActive ? theme.colors.primarySoft : 'transparent',
        transition: 'background-color 0.15s',
      }}
    >
      <AppIcon name={item.icon} size={20} color={isActive ? theme.colors.primary : theme.colors.textTertiary} />
      <span style={textStyle(theme, 'bodyMedium', {
        fontSize: 14, fontWeight: isActive ? 700 : 500,
        color: isActive ? theme.colors.primary : theme.colors.textSecondary,
      })}>{item.label}</span>
      {isActive && (
        <div style={{
          marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
          backgroundColor: theme.colors.primary,
        }} />
      )}
    </button>
  );
}
