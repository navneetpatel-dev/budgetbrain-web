import { useNavigate } from 'react-router-dom';
import { useTheme, ACCENT_OPTIONS } from '@/shared/theme';
import { FeatureHeader } from '@/shared/components/ui/feature-screen';
import { Card } from '@/shared/components/ui/index';
import { ListRow } from '@/shared/components/ui/lists';
import { useAppSelector, useAppDispatch } from '@/shared/store/hooks';
import { setTheme, setAccent } from '@/shared/store/settingsSlice';
import { useSignOut } from '@/features/auth/hooks/useAuthHooks';

export function SettingsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { signOut } = useSignOut();
  const user = useAppSelector((s) => s.auth.user);
  const settingsTheme = useAppSelector((s) => s.settings.theme);

  return (
    <div style={{ flex: 1, backgroundColor: theme.colors.background, overflowY: 'auto', paddingBottom: 120 }}>
      <FeatureHeader title="Profile" subtitle={user?.email ?? ''} icon="profile" />
      <div style={{ paddingLeft: theme.spacing.lg, paddingRight: theme.spacing.lg, paddingTop: theme.spacing.md, display: 'flex', flexDirection: 'column', gap: theme.spacing.md, maxWidth: 840, margin: '0 auto' }}>
        <Card variant="elevated" style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`, margin: '0 auto', marginBottom: theme.spacing.md, fontSize: 24, fontWeight: 800, color: theme.colors.onPrimary }}>{(user?.name ?? 'U')[0].toUpperCase()}</div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.titleSm.fontSize, fontWeight: Number(theme.typography.titleSm.fontWeight), color: theme.colors.text, margin: 0 }}>{user?.name ?? 'User'}</h3>
          <p style={{ fontSize: 13, fontWeight: 500, color: theme.colors.textSecondary, marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{user?.email}</p>
        </Card>
        <Card variant="elevated">
          <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.md }}>Theme Mode</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button key={mode} onClick={() => dispatch(setTheme(mode))} style={{ flex: 1, padding: '10px', borderRadius: theme.radii.md, border: `1.5px solid ${settingsTheme === mode ? theme.colors.primary : theme.colors.borderSubtle}`, backgroundColor: settingsTheme === mode ? theme.colors.primarySoft : theme.colors.surface, color: settingsTheme === mode ? theme.colors.primary : theme.colors.text, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>{mode}</button>
            ))}
          </div>
          <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginTop: theme.spacing.lg, marginBottom: theme.spacing.md }}>Accent Color</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {ACCENT_OPTIONS.map((opt) => (
              <button key={opt.id} onClick={() => dispatch(setAccent(opt.id))} style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: opt.swatch, border: theme.accent === opt.id ? `2.5px solid ${theme.colors.text}` : '2.5px solid transparent', cursor: 'pointer' }} aria-label={opt.label} />
            ))}
          </div>
        </Card>
        <Card variant="elevated" style={{ padding: 0 }}>
          <ListRow icon="piggyBank" label="Net Worth" onPress={() => navigate('/net-worth')} />
          <ListRow icon="category" label="Categories" onPress={() => navigate('/categories')} />
          <ListRow icon="creditCard" label="Accounts" onPress={() => navigate('/accounts')} />
          <ListRow icon="chart" label="Investments" onPress={() => navigate('/investments')} />
          <ListRow icon="search" label="Search" onPress={() => navigate('/search')} />
          <ListRow icon="download" label="Reports" onPress={() => navigate('/reports')} />
          <ListRow icon="notification" label="Notifications" onPress={() => navigate('/notifications')} />
          <ListRow icon="users" label="Family" onPress={() => navigate('/family')} />
          <ListRow icon="chat" label="AI Coach" onPress={() => navigate('/ai')} />
          <ListRow icon="globe" label="Integrations" onPress={() => navigate('/integrations')} />
        </Card>
        <Card variant="elevated" style={{ padding: 0 }}>
          <ListRow icon="dollar" label="Subscription" onPress={() => navigate('/subscription')} />
          <ListRow icon="helpCircle" label="Support" onPress={() => navigate('/support')} />
          <ListRow icon="shield" label="Privacy Policy" onPress={() => navigate('/privacy')} />
          <ListRow icon="fileText" label="Terms of Service" onPress={() => navigate('/terms')} />
        </Card>
        <Card variant="elevated" style={{ padding: 0 }}>
          <ListRow icon="logout" label="Sign Out" onPress={signOut} destructive />
          <ListRow icon="trash" label="Delete Account" onPress={() => {}} destructive />
        </Card>
      </div>
    </div>
  );
}
