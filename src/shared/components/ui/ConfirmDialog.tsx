import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/shared/theme';
import { Button } from './index';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
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
  const transition = { duration: theme.motion.duration.base / 1000, ease: theme.motion.easing };
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(!!(open && copy), dialogRef, loading ? undefined : onCancel);

  return (
    <AnimatePresence>
      {open && copy && (
    <motion.div
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
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
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={transition}
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
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
