import { useTheme } from '@/shared/theme';
import { Button } from './index';
import type { ConfirmCopy } from '@/shared/constants/confirmations';

export function ConfirmDialog({
  open,
  copy,
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  copy: ConfirmCopy | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const theme = useTheme();

  if (!open || !copy) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: theme.colors.overlay,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.xl,
          padding: theme.spacing.xl,
          boxShadow: theme.shadows.lg,
          border: `1px solid ${theme.colors.borderSubtle}`,
        }}
      >
        <h3
          id="confirm-dialog-title"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 17,
            fontWeight: 700,
            color: theme.colors.text,
            margin: 0,
          }}
        >
          {copy.title}
        </h3>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            lineHeight: '22px',
            color: theme.colors.textSecondary,
            margin: `${theme.spacing.md}px 0 ${theme.spacing.lg}px`,
          }}
        >
          {copy.message}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          <Button
            title={copy.confirmLabel}
            onPress={onConfirm}
            variant={copy.destructive ? 'danger' : 'primary'}
            loading={loading}
            disabled={loading}
            size="lg"
          />
          <Button
            title={copy.cancelLabel ?? 'Cancel'}
            onPress={onCancel}
            variant="outline"
            disabled={loading}
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}
