import { memo, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { m as motion } from 'framer-motion';
import { useTheme } from '@/shared/theme';
import { amountText, bodyMedium, caption } from '@/shared/theme/textStyles';
import { formatCurrency } from '@/shared/utils/currency';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import type { Transaction } from '@/shared/types';

function InlineProgress({ progress, color }: { progress: number; color: string }) {
  const theme = useTheme();
  const pct = Math.min(100, Math.max(0, progress));
  return (
    <div style={{ height: 8, borderRadius: 4, backgroundColor: theme.colors.borderSubtle, overflow: 'hidden', width: '100%' }}>
      <div style={{
        height: '100%', width: `${pct}%`, borderRadius: 4,
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        transition: 'width 0.5s ease',
      }} />
    </div>
  );
}

function Surface({
  children,
  onClick,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  const theme = useTheme();
  const baseStyle: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    border: `1px solid ${theme.colors.borderSubtle}`,
    cursor: onClick ? 'pointer' : undefined,
    ...style,
  };

  if (!onClick) {
    return <div style={baseStyle}>{children}</div>;
  }

  return (
    <motion.div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      whileHover={{ backgroundColor: theme.colors.surfaceHover, boxShadow: theme.shadows.md }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: theme.motion.duration.fast / 1000, ease: theme.motion.easing }}
      style={baseStyle}
    >
      {children}
    </motion.div>
  );
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export const TransactionRow = memo(function TransactionRow({
  transaction,
  onPress,
  showBadge = true,
}: {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  showBadge?: boolean;
}) {
  const theme = useTheme();
  const isExpense = transaction.type === 'expense';
  const accent =
    (isExpense ? transaction.category?.color : undefined) ?? theme.colors.primary;
  const title = isExpense
    ? (transaction.merchant || transaction.category?.name || 'Expense')
    : (transaction.incomeSource?.name || transaction.merchant || 'Income');
  const dateLabel = formatDate(transaction.date);
  const entityLabel = isExpense
    ? transaction.category?.name
    : transaction.incomeSource?.name;

  return (
    <Surface
      onClick={onPress ? () => onPress(transaction) : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        padding: '18px 18px',
        borderRadius: theme.radii.xl,
        minHeight: 88,
        boxShadow: theme.isDark
          ? '0 8px 24px rgba(0,0,0,0.22)'
          : '0 8px 24px rgba(15, 23, 42, 0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: `${accent}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: accent }} />
        </div>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: -0.1,
            color: theme.colors.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              color: theme.colors.textTertiary,
            }}>
              {dateLabel}
            </span>
            {entityLabel ? (
              <span style={{
                maxWidth: '70%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                color: accent,
                backgroundColor: `${accent}18`,
                border: `1px solid ${accent}44`,
                borderRadius: theme.radii.full,
                padding: '3px 9px',
              }}>
                {entityLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexShrink: 0,
        gap: 5,
        minWidth: 84,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: -0.1,
            color: isExpense ? theme.colors.danger : theme.colors.success,
            fontVariantNumeric: 'tabular-nums',
            textAlign: 'right',
            lineHeight: 1.2,
          }}>
            {isExpense ? '−' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
          </span>
          {onPress ? <AppIcon name="chevronRight" size={15} color={theme.colors.textTertiary} /> : null}
        </div>
        {showBadge ? (
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            fontWeight: 600,
            lineHeight: 1.2,
            color: isExpense ? theme.colors.danger : theme.colors.success,
            backgroundColor: isExpense ? theme.colors.dangerSoft : theme.colors.successSoft,
            borderRadius: theme.radii.full,
            padding: '3px 9px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: onPress ? 23 : 0,
          }}>
            {isExpense ? 'Expense' : 'Income'}
          </span>
        ) : null}
      </div>
    </Surface>
  );
});

export const EntityRow = memo(function EntityRow({
  title,
  subtitle,
  value,
  valueColor,
  accentColor,
  onPress,
  trailing,
  children,
  style,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  valueColor?: string;
  accentColor?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const theme = useTheme();

  return (
    <Surface onClick={onPress} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, minWidth: 0, flex: 1 }}>
          {accentColor ? (
            <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accentColor, flexShrink: 0 }} />
          ) : null}
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ ...bodyMedium(theme), display: 'block' }}>{title}</span>
            {subtitle ? (
              <span style={{ ...caption(theme), display: 'block', marginTop: 2, textTransform: 'capitalize' }}>
                {subtitle}
              </span>
            ) : null}
          </div>
        </div>
        {trailing ?? (value != null ? (
          <span style={{ ...amountText(theme, valueColor), fontSize: 17 }}>{value}</span>
        ) : null)}
      </div>
      {children}
    </Surface>
  );
});

export const ProgressEntityRow = memo(function ProgressEntityRow({
  title,
  subtitle,
  value,
  secondaryValue,
  progress,
  progressColor,
  footerLeft,
  footerRight,
  badge,
  onPress,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  secondaryValue?: string;
  progress: number;
  progressColor: string;
  footerLeft?: string;
  footerRight?: string;
  badge?: ReactNode;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const theme = useTheme();
  const stop = (e: MouseEvent) => e.stopPropagation();

  const actions = (onEdit || onDelete) ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }} onClick={stop}>
      {onEdit ? (
        <button
          className="bb-interactive"
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${title}`}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, border: 'none', padding: 0, borderRadius: 8,
            background: 'transparent', cursor: 'pointer', color: theme.colors.textTertiary,
          }}
        >
          <AppIcon name="edit" size={18} color={theme.colors.textTertiary} />
        </button>
      ) : null}
      {onDelete ? (
        <button
          className="bb-interactive"
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${title}`}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, border: 'none', padding: 0, borderRadius: 8,
            background: 'transparent', cursor: 'pointer', color: theme.colors.danger,
          }}
        >
          <AppIcon name="trash" size={18} color={theme.colors.danger} />
        </button>
      ) : null}
    </div>
  ) : null;

  return (
    <EntityRow
      title={title}
      subtitle={subtitle}
      onPress={onPress}
      trailing={actions ?? badge}
    >
      <div style={{ marginTop: theme.spacing.sm }}>
        {value != null ? (
          <div style={{ marginBottom: theme.spacing.md, display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ ...amountText(theme), fontSize: 17 }}>{value}</span>
            {secondaryValue ? (
              <span style={{ ...caption(theme), fontSize: 14, fontWeight: 500 }}>{secondaryValue}</span>
            ) : null}
          </div>
        ) : null}
        {badge && actions ? <div style={{ marginBottom: theme.spacing.sm }}>{badge}</div> : null}
        <InlineProgress progress={progress} color={progressColor} />
        {(footerLeft || footerRight) ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={caption(theme)}>{footerLeft}</span>
            {footerRight ? <span style={{ ...caption(theme), fontWeight: 600, color: progressColor }}>{footerRight}</span> : null}
          </div>
        ) : null}
      </div>
    </EntityRow>
  );
});

export const NotificationRow = memo(function NotificationRow({
  title,
  body,
  date,
  unread,
  onPress,
}: {
  title: string;
  body: string;
  date: string;
  unread?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();

  return (
    <Surface
      onClick={onPress}
      style={{
        border: `1px solid ${unread ? `${theme.colors.primary}33` : theme.colors.borderSubtle}`,
        opacity: unread ? 1 : 0.75,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.md }}>
        {unread ? (
          <div style={{
            width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.colors.primary,
            marginTop: 6, flexShrink: 0,
          }} />
        ) : null}
        <div style={{ minWidth: 0 }}>
          <span style={{ ...bodyMedium(theme), display: 'block', fontSize: 14 }}>{title}</span>
          <span style={{ ...caption(theme, theme.colors.textSecondary), display: 'block', marginTop: 2 }}>{body}</span>
          <span style={{ ...caption(theme), display: 'block', marginTop: 4, fontSize: 11 }}>{date}</span>
        </div>
      </div>
    </Surface>
  );
});
