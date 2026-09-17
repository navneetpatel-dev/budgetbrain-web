import { ListRow, Toggle } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { usePushTest } from '@/features/settings/hooks/usePushTest';
import { useDigestPreference } from '@/features/settings/hooks/useDigestPreference';

export function SecurityPreferencesSection() {
  const theme = useTheme();
  const testPush = usePushTest();
  const { enabled: digestEnabled, pending: digestPending, toggle: toggleDigest } = useDigestPreference();

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
            display: 'block', fontFamily: 'Inter, sans-serif', fontSize: theme.typography.bodySemibold.fontSize,
            fontWeight: Number(theme.typography.bodySemibold.fontWeight), color: theme.colors.text,
          }}>Weekly spending digest</span>
          <span style={{
            display: 'block', fontFamily: 'Inter, sans-serif', fontSize: theme.typography.caption.fontSize,
            color: theme.colors.textTertiary, marginTop: 2,
          }}>A Monday recap of last week's spending</span>
        </div>
        <Toggle value={digestEnabled} onChange={(v) => { void toggleDigest(v); }} disabled={digestPending} label="Weekly spending digest" />
      </div>
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
            display: 'block', fontFamily: 'Inter, sans-serif', fontSize: theme.typography.bodySemibold.fontSize,
            fontWeight: Number(theme.typography.bodySemibold.fontWeight), color: theme.colors.text,
          }}>Biometric lock</span>
          <span style={{
            display: 'block', fontFamily: 'Inter, sans-serif', fontSize: theme.typography.caption.fontSize,
            color: theme.colors.textTertiary, marginTop: 2,
          }}>Require auth when reopening</span>
        </div>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: theme.typography.label.fontSize, fontWeight: Number(theme.typography.label.fontWeight),
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
