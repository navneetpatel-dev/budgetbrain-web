import { ListRow } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { usePushTest } from '@/features/settings/hooks/usePushTest';

export function SecurityPreferencesSection() {
  const theme = useTheme();
  const testPush = usePushTest();

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        minHeight: 52,
        borderBottom: `1px solid ${theme.colors.borderSubtle}`,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 15,
            fontWeight: 600, color: theme.colors.text,
          }}>Biometric lock</span>
          <span style={{
            display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12,
            color: theme.colors.textTertiary, marginTop: 2,
          }}>Require auth when reopening</span>
        </div>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
          color: theme.colors.textSecondary, flexShrink: 0, marginLeft: 12,
        }}>Mobile app only</span>
      </div>
      <ListRow
        icon="bell"
        label="Test push notification"
        onPress={() => { void testPush(); }}
        isLast
      />
    </>
  );
}
