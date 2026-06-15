import { useLocation, useNavigate } from 'react-router-dom';
import { AppIcon, type AppIconName } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
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
];

export function DesktopSidebar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarWidth } = useResponsive();
  const user = useAppSelector((s) => s.auth.user);

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
          <AppIcon name="piggyBank" size={20} color={theme.colors.onPrimary} />
        </div>
        <div>
          <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 800, color: theme.colors.text, letterSpacing: -0.3 }}>BudgetBrain</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>{user?.name ?? 'Finance'}</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/expense/add')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          margin: '0 8px 20px', padding: '12px 16px', borderRadius: theme.radii.lg,
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`,
          border: 'none', cursor: 'pointer', boxShadow: theme.shadows.md,
        }}
      >
        <AppIcon name="add" size={18} color={theme.colors.onPrimary} />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: theme.colors.onPrimary }}>Add Expense</span>
      </button>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: theme.colors.textTertiary, padding: '0 12px 8px', fontFamily: 'Inter, sans-serif' }}>MAIN</span>
        {MAIN_NAV.map((item) => (
          <SidebarLink key={item.route} item={item} isActive={currentPath === item.route} onPress={() => navigate(item.route)} />
        ))}
      </nav>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 20 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: theme.colors.textTertiary, padding: '0 12px 8px', fontFamily: 'Inter, sans-serif' }}>MORE</span>
        {SECONDARY_NAV.map((item) => (
          <SidebarLink key={item.route} item={item} isActive={currentPath === item.route} onPress={() => navigate(item.route)} />
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{
        margin: '0 8px', padding: '12px', borderRadius: theme.radii.lg,
        backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.surface,
        border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>Quick tip</span>
        <p style={{ fontSize: 12, color: theme.colors.textTertiary, marginTop: 4, lineHeight: '18px', fontFamily: 'Inter, sans-serif' }}>Use keyboard shortcuts: press <kbd style={{ padding: '1px 5px', borderRadius: 4, backgroundColor: theme.colors.primarySoft, fontSize: 11 }}>N</kbd> to add expense.</p>
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
        backgroundColor: isActive
          ? (theme.isDark ? 'rgba(99,102,241,0.15)' : theme.colors.primarySoft)
          : 'transparent',
        transition: 'background-color 0.15s',
      }}
    >
      <AppIcon name={item.icon} size={20} color={isActive ? theme.colors.primary : theme.colors.textTertiary} />
      <span style={{
        fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: isActive ? 700 : 500,
        color: isActive ? theme.colors.primary : theme.colors.textSecondary,
      }}>{item.label}</span>
      {isActive && (
        <div style={{
          marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`,
        }} />
      )}
    </button>
  );
}
