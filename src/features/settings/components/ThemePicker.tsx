import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ACCENT_OPTIONS, type ThemeMode, type AccentPalette } from '@/shared/theme';

const MODES: { id: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'system', label: 'Auto', Icon: Monitor },
];

export function ThemePicker({
  mode,
  accent,
  onModeChange,
  onAccentChange,
}: {
  mode: ThemeMode;
  accent: AccentPalette;
  onModeChange: (m: ThemeMode) => void;
  onAccentChange: (a: AccentPalette) => void;
}) {
  const theme = useTheme();

  return (
    <div>
      <div style={{ display: 'flex', gap: theme.spacing.sm }}>
        {MODES.map(({ id, label, Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onModeChange(id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: theme.spacing.md,
                borderRadius: theme.radii.md,
                backgroundColor: active ? theme.colors.primarySoft : theme.colors.surfaceHover,
                border: `2px solid ${active ? theme.colors.primary : 'transparent'}`,
                cursor: 'pointer',
              }}
            >
              <Icon size={20} color={active ? theme.colors.primary : theme.colors.textSecondary} />
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 12,
                fontWeight: active ? 700 : 500,
                color: active ? theme.colors.primary : theme.colors.textSecondary,
              }}>{label}</span>
            </button>
          );
        })}
      </div>

      <span style={{
        display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12,
        color: theme.colors.textTertiary, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm,
      }}>Accent color</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        {ACCENT_OPTIONS.map((a) => {
          const active = accent === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onAccentChange(a.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: theme.spacing.sm,
                borderRadius: theme.radii.md,
                border: `2px solid ${active ? theme.colors.primary : 'transparent'}`,
                backgroundColor: active ? theme.colors.primarySoft : 'transparent',
                cursor: 'pointer',
                minWidth: 58,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: a.swatch,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 4,
              }}>
                {active && (
                  <div style={{
                    width: 10, height: 10, borderRadius: 5,
                    backgroundColor: '#fff', border: '2px solid rgba(0,0,0,0.15)',
                  }} />
                )}
              </div>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? theme.colors.primary : theme.colors.textTertiary,
              }}>{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
