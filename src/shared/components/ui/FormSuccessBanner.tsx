import { AnimatePresence, m as motion } from 'framer-motion';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';

/** Inline post-save confirmation — mirrors FormErrorBanner's structure with success styling. */
export function FormSuccessBanner({ message }: { message: string }) {
  const theme = useTheme();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        role="status"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: theme.motion.duration.base / 1000, ease: theme.motion.easing }}
        style={{
          display: 'flex', alignItems: 'center', gap: theme.spacing.md,
          backgroundColor: theme.colors.successSoft,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.lg,
          border: `1px solid ${theme.colors.success}33`,
          marginTop: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 20, flexShrink: 0,
          backgroundColor: theme.colors.success + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AppIcon name="checkmark" size="md" color={theme.colors.success} />
        </div>
        <p style={{
          fontSize: 15, fontWeight: 500, color: theme.colors.text,
          lineHeight: '22px', margin: 0, fontFamily: 'Inter, sans-serif',
        }}>{message}</p>
      </motion.div>
    </AnimatePresence>
  );
}
