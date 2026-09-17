import type { CSSProperties } from 'react';
import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppIcon, type AppIconName } from './icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';

export type ActionSheetItem = {
  id: string;
  label: string;
  subtitle?: string;
  icon?: AppIconName;
  destructive?: boolean;
  onPress: () => void;
};

export function ActionSheet({
  visible,
  title = 'Create',
  items,
  onClose,
}: {
  visible: boolean;
  title?: string;
  items: ActionSheetItem[];
  onClose: () => void;
}) {
  const theme = useTheme();
  const { isTablet, isDesktop, width } = useResponsive();
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(visible, dialogRef, onClose);

  const centered = isTablet;
  const sheetMaxWidth = isDesktop ? 560 : isTablet ? Math.min(520, width - 48) : undefined;

  const rowStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: '14px 16px',
    minHeight: 56,
    background: 'none',
    border: 'none',
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'Inter, sans-serif',
  };

  const sheetDuration = theme.motion.duration.base / 1000;
  const sheetTransition = { duration: sheetDuration, ease: theme.motion.easing };

  return (
    <AnimatePresence>
      {visible && (
    <motion.div
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={sheetTransition}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 400,
        backgroundColor: theme.colors.overlay,
        display: 'flex',
        alignItems: centered ? 'center' : 'flex-end',
        justifyContent: 'center',
        padding: centered ? 24 : 0,
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: centered ? 8 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: centered ? 8 : 24 }}
        transition={sheetTransition}
        style={{
          width: centered ? '100%' : '100%',
          maxWidth: sheetMaxWidth ?? '100%',
          backgroundColor: theme.colors.surface,
          borderRadius: centered ? theme.radii.xl : undefined,
          borderTopLeftRadius: theme.radii.xl,
          borderTopRightRadius: theme.radii.xl,
          borderBottomLeftRadius: centered ? theme.radii.xl : 0,
          borderBottomRightRadius: centered ? theme.radii.xl : 0,
          border: `1px solid ${theme.colors.borderSubtle}`,
          borderBottom: centered ? `1px solid ${theme.colors.borderSubtle}` : 'none',
          padding: centered
            ? `${theme.spacing.lg}px ${theme.spacing.xl}px`
            : `${theme.spacing.sm}px ${theme.spacing.lg}px max(16px, env(safe-area-inset-bottom))`,
          boxShadow: theme.shadows.lg,
        }}
      >
        {!centered ? (
          <div style={{
            width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.border,
            margin: '0 auto 12px',
          }} />
        ) : null}
        <span style={{
          display: 'block',
          fontFamily: 'Inter, sans-serif',
          fontSize: theme.typography.titleSm.fontSize,
          fontWeight: 600,
          color: theme.colors.text,
          marginBottom: theme.spacing.sm,
        }}>{title}</span>
        <div style={{
          borderRadius: theme.radii.lg,
          border: `1px solid ${theme.colors.borderSubtle}`,
          overflow: 'hidden',
          backgroundColor: theme.colors.backgroundElevated,
        }}>
          {items.map((item, i) => (
            <button
              className="bb-interactive"
              key={item.id}
              type="button"
              onClick={() => {
                onClose();
                item.onPress();
              }}
              style={{
                ...rowStyle,
                borderBottom: i === items.length - 1 ? 'none' : rowStyle.borderBottom,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.surfaceHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {item.icon ? (
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: item.destructive ? theme.colors.dangerSoft : theme.colors.primarySoft,
                  flexShrink: 0,
                }}>
                  <AppIcon
                    name={item.icon}
                    size={18}
                    color={item.destructive ? theme.colors.danger : theme.colors.primary}
                  />
                </div>
              ) : null}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  display: 'block', fontSize: 15, fontWeight: 600,
                  color: item.destructive ? theme.colors.danger : theme.colors.text,
                }}>{item.label}</span>
                {item.subtitle ? (
                  <span style={{ display: 'block', fontSize: 12, color: theme.colors.textTertiary, marginTop: 2 }}>
                    {item.subtitle}
                  </span>
                ) : null}
              </div>
              <AppIcon name="chevronRight" size={14} color={theme.colors.textTertiary} />
            </button>
          ))}
        </div>
        <button
          className="bb-interactive"
          type="button"
          onClick={onClose}
          style={{
            width: '100%', marginTop: theme.spacing.md, padding: 14,
            borderRadius: theme.radii.lg, border: 'none', cursor: 'pointer',
            backgroundColor: theme.colors.surfaceHover,
            fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600,
            color: theme.colors.textSecondary,
          }}
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
