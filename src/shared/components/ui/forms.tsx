import { useTheme } from '@/shared/theme';
import type { CSSProperties, ChangeEvent } from 'react';
import { AppIcon, type AppIconName } from './icons/AppIcon';
import { useState } from 'react';

export function FormFieldLabel({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  const theme = useTheme();
  return (
    <span style={{
      display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13,
      fontWeight: 600, color: theme.colors.textSecondary, marginBottom: 8, ...style,
    }}>{children}</span>
  );
}

export function FormSection({
  title, subtitle, children, style,
}: {
  title: string; subtitle?: string; children: React.ReactNode; style?: CSSProperties;
}) {
  const theme = useTheme();

  return (
    <div style={{
      border: `1px solid ${theme.colors.borderSubtle}`,
      borderRadius: theme.radii.lg, padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      ...style,
    }}>
      <span style={{
        fontFamily: 'Inter, sans-serif', fontSize: theme.typography.titleSm.fontSize,
        fontWeight: Number(theme.typography.titleSm.fontWeight), color: theme.colors.text,
      }}>{title}</span>
      {subtitle && (
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: theme.typography.caption.fontSize,
          fontWeight: 500, color: theme.colors.textSecondary,
          marginTop: 4, lineHeight: '18px', margin: '4px 0 0 0',
        }}>{subtitle}</p>
      )}
      <div style={{ marginTop: theme.spacing.md }}>{children}</div>
    </div>
  );
}

export function ImageUploadField({
  label, value, onChange, error, disabled,
}: {
  label: string; value: string | null; onChange: (url: string | null, file?: File) => void; error?: string; disabled?: boolean;
}) {
  const theme = useTheme();
  const [preview, setPreview] = useState<string | null>(value);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(url, file);
  };

  if (preview) {
    return (
      <div style={{ marginBottom: theme.spacing.lg }}>
        <div style={{
          position: 'relative', borderRadius: theme.radii.md, overflow: 'hidden',
          width: '100%', maxHeight: 200,
        }}>
          <img src={preview} alt="Preview" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 8 }}>
            <label style={{
              padding: '8px 12px', borderRadius: theme.radii.sm,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.55 : 1,
              backgroundColor: theme.colors.primary, color: theme.colors.onPrimary,
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
            }}>
              Replace
              <input type="file" accept="image/*,.pdf" onChange={handleFile} disabled={disabled} style={{ display: 'none' }} />
            </label>
            <button
              type="button"
              disabled={disabled}
              onClick={() => { setPreview(null); onChange(null); }}
              style={{
                padding: '8px 12px', borderRadius: theme.radii.sm, border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.55 : 1,
                backgroundColor: theme.colors.danger, color: theme.colors.onPrimary,
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: theme.spacing.lg, opacity: disabled ? 0.55 : 1 }}>
      <label style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px', borderRadius: theme.radii.lg,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: `2px dashed ${theme.colors.border}`, gap: theme.spacing.sm,
      }}>
        <AppIcon name="camera" size={24} color={theme.colors.textTertiary} />
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
          color: theme.colors.textSecondary,
        }}>{label}</span>
        <input type="file" accept="image/*,.pdf" onChange={handleFile} disabled={disabled} style={{ display: 'none' }} />
      </label>
      {error && (
        <p style={{ color: theme.colors.danger, fontSize: 12, marginTop: 4, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{error}</p>
      )}
    </div>
  );
}

export function ColorPicker({
  value, options, onChange, disabled,
}: {
  value: string; options: { id: string; swatch: string }[]; onChange: (id: string) => void; disabled?: boolean;
}) {
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', gap: 10, opacity: disabled ? 0.55 : 1 }}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.id)}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            backgroundColor: opt.swatch,
            border: value === opt.id ? `2.5px solid ${theme.colors.text}` : '2.5px solid transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          aria-label={opt.id}
        />
      ))}
    </div>
  );
}
