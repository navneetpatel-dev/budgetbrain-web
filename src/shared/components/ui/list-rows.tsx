import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '@/shared/theme';
import { amountText, bodyMedium, caption } from '@/shared/theme/textStyles';
import { formatCurrency } from '@/shared/utils/currency';
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
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.lg,
        border: `1px solid ${theme.colors.borderSubtle}`,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
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

export function TransactionRow({
  transaction,
  onPress,
}: {
  transaction: Transaction;
  onPress?: () => void;
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
      onClick={onPress}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, minWidth: 0, flex: 1 }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accent, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <span style={{ ...bodyMedium(theme), display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
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
                fontWeight: 700,
                color: accent,
                backgroundColor: `${accent}18`,
                border: `1px solid ${accent}44`,
                borderRadius: theme.radii.full,
                padding: '2px 8px',
              }}>
                {entityLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <span style={{
        ...bodyMedium(theme, isExpense ? theme.colors.danger : theme.colors.success),
        flexShrink: 0,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {isExpense ? '−' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
      </span>
    </Surface>
  );
}

export function EntityRow({
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
}

export function ProgressEntityRow({
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
}) {
  const theme = useTheme();

  return (
    <EntityRow
      title={title}
      subtitle={subtitle}
      onPress={onPress}
      trailing={badge ?? (value != null ? (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{ ...amountText(theme), display: 'block', fontSize: 17 }}>{value}</span>
          {secondaryValue ? (
            <span style={{ ...caption(theme), display: 'block', marginTop: 2 }}>{secondaryValue}</span>
          ) : null}
        </div>
      ) : undefined)}
    >
      <div style={{ marginTop: theme.spacing.md }}>
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
}

export function NotificationRow({
  title,
  body,
  date,
  unread,
}: {
  title: string;
  body: string;
  date: string;
  unread?: boolean;
}) {
  const theme = useTheme();

  return (
    <Surface
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
}
