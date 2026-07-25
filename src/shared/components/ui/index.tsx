import { useMemo, useState } from 'react';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';
import { AppIcon, type AppIconName } from './icons/AppIcon';
import type { CSSProperties } from 'react';

import { FormErrorBanner } from './FormErrorBanner';
import { getLoadingLabel } from '@/shared/utils/buttonLoadingLabel';

export const FIELD_CONTROL_HEIGHT = 48;
const FIELD_CONTROL_BORDER = 1.5;

function fieldBorderColor(theme: AppTheme, error?: boolean, focused?: boolean) {
  if (error) return theme.colors.danger;
  if (focused) return theme.colors.primary + '88';
  return theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle;
}

function fieldBackground(theme: AppTheme, focused?: boolean) {
  if (focused) return theme.colors.primarySoft;
  return theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.inputBg;
}

/** Shared single-line / multiline field sizing for inputs and selects. */
export function fieldControlStyle(
  theme: AppTheme,
  options: {
    error?: boolean;
    focused?: boolean;
    multiline?: boolean;
    flex?: number;
    borderRadius?: number;
    fontSize?: number;
  } = {},
): CSSProperties {
  const { error, focused, multiline, flex, borderRadius, fontSize = 16 } = options;
  const innerHeight = FIELD_CONTROL_HEIGHT - FIELD_CONTROL_BORDER * 2;

  const base: CSSProperties = {
    boxSizing: 'border-box',
    border: `${FIELD_CONTROL_BORDER}px solid ${fieldBorderColor(theme, error, focused)}`,
    borderRadius: borderRadius ?? theme.radii.lg,
    backgroundColor: fieldBackground(theme, focused),
    color: theme.colors.text,
    fontSize,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s, background-color 0.2s',
    ...(flex !== undefined ? { flex } : { width: '100%' }),
  };

  if (multiline) {
    return {
      ...base,
      padding: '14px 12px',
      lineHeight: '22px',
      minHeight: 96,
      resize: 'vertical',
    };
  }

  return {
    ...base,
    height: FIELD_CONTROL_HEIGHT,
    padding: '0 12px',
    lineHeight: `${innerHeight}px`,
  };
}

function cssProps(style: CSSProperties): string {
  return Object.entries(style)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`)
    .join(';');
}

/* ── Button ── */

interface ButtonProps {
  title: string;
  onPress: (e: React.FormEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  loading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;
  size?: 'md' | 'lg';
  icon?: AppIconName;
  type?: 'button' | 'submit';
  style?: CSSProperties;
}

function buttonVariantStyle(
  theme: AppTheme,
  variant: ButtonProps['variant'],
  size: ButtonProps['size'],
): CSSProperties {
  const isPrimary = variant === 'primary';
  if (variant === 'danger') {
    return { backgroundColor: theme.colors.danger, color: theme.colors.onPrimary };
  }
  if (isPrimary) {
    return {
      background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`,
      color: theme.colors.onPrimary,
      width: size === 'lg' ? '100%' : undefined,
    };
  }
  if (variant === 'secondary') {
    return { backgroundColor: theme.colors.surfaceHover, color: theme.colors.text };
  }
  if (variant === 'outline') {
    return {
      backgroundColor: 'transparent',
      border: `1.5px solid ${theme.colors.border}`,
      color: theme.colors.primary,
    };
  }
  if (variant === 'ghost') {
    return { backgroundColor: theme.colors.primarySoft, color: theme.colors.primary };
  }
  return {};
}

export function Button({
  title, onPress, variant = 'primary', loading, loadingTitle, disabled, size = 'md',
  icon, type = 'button', style,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const busyLabel = loading ? (loadingTitle ?? getLoadingLabel(title)) : title;
  const spinnerColor =
    variant === 'outline' || variant === 'ghost'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.colors.text
        : theme.colors.onPrimary;

  return (
    <button
      type={type}
      onClick={onPress}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: size === 'lg' ? theme.radii.lg : theme.radii.md,
        padding: size === 'lg' ? '16px 20px' : '14px 20px',
        fontFamily: 'Inter, sans-serif',
        fontSize: theme.typography.bodySemibold.fontSize,
        fontWeight: Number(theme.typography.bodySemibold.fontWeight),
        border: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: disabled && !loading ? 0.5 : 1,
        transition: 'opacity 0.15s, transform 0.15s',
        ...buttonVariantStyle(theme, variant, size),
        ...style,
      }}
    >
      {loading ? <Spinner color={spinnerColor} /> : null}
      {!loading && icon ? <AppIcon name={icon} size={18} color={spinnerColor} /> : null}
      {busyLabel}
    </button>
  );
}

/* ── Spinner ── */

function Spinner({ color, size = 18 }: { color?: string; size?: number }) {
  const theme = useTheme();
  const resolved = color ?? theme.colors.onPrimary;
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid transparent`,
        borderTopColor: resolved,
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  );
}

/* ── Input ── */

interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  secureToggle?: boolean;
  leftIcon?: AppIconName;
  variant?: 'default' | 'soft';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  name?: string;
  multiline?: boolean;
  rows?: number;
  autoFocus?: boolean;
  autoComplete?: string;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function Input({
  label, error, helperText, secureToggle, leftIcon,
  variant = 'default', value, onChange, placeholder, type: inputType,
  name, multiline, rows = 4, autoFocus, autoComplete, readOnly, disabled, maxLength, onKeyDown,
}: InputProps) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(inputType === 'password');
  const [focused, setFocused] = useState(false);
  const isSecure = inputType === 'password' && (secureToggle ? hidden : true);
  const actualType = isSecure ? 'password' : (inputType === 'password' ? 'text' : (inputType ?? 'text'));

  const innerHeight = FIELD_CONTROL_HEIGHT - FIELD_CONTROL_BORDER * 2;

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    alignItems: multiline ? 'flex-start' : 'stretch',
    border: `${FIELD_CONTROL_BORDER}px solid ${fieldBorderColor(theme, !!error, focused && !disabled)}`,
    borderRadius: theme.radii.lg,
    backgroundColor: fieldBackground(theme, focused && !disabled),
    transition: 'border-color 0.2s, background-color 0.2s',
    minHeight: multiline ? 112 : FIELD_CONTROL_HEIGHT,
    opacity: disabled ? 0.55 : 1,
  };

  const sharedInputStyle: CSSProperties = {
    flex: 1,
    width: '100%',
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
    resize: multiline ? 'vertical' : 'none',
    ...(multiline ? {
      padding: '14px 12px',
      lineHeight: '22px',
      minHeight: 96,
    } : {
      height: innerHeight,
      padding: `0 ${leftIcon ? 4 : 12}px`,
      paddingRight: secureToggle ? 4 : 12,
      lineHeight: `${innerHeight}px`,
    }),
  };

  return (
    <div style={{ marginBottom: theme.spacing.lg }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.sm,
          fontFamily: 'Inter, sans-serif',
        }}>
          {label}
        </label>
      )}
      <div style={wrapperStyle}>
        {leftIcon && (
          <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: theme.spacing.sm, marginTop: multiline ? 12 : 0 }}>
            <AppIcon name={leftIcon} size={18} color={focused ? theme.colors.primary : theme.colors.textTertiary} />
          </div>
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            name={name}
            rows={rows}
            autoFocus={autoFocus}
            autoComplete={autoComplete}
            readOnly={readOnly}
            disabled={disabled}
            maxLength={maxLength}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onKeyDown}
            style={sharedInputStyle}
          />
        ) : (
          <input
            type={actualType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            name={name}
            autoFocus={autoFocus}
            autoComplete={autoComplete}
            readOnly={readOnly}
            disabled={disabled}
            maxLength={maxLength}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onKeyDown}
            style={sharedInputStyle}
          />
        )}
        {secureToggle && inputType === 'password' && (
          <button
            type="button"
            onClick={() => setHidden((v) => !v)}
            style={{
              width: 44, height: 44, flexShrink: 0, alignSelf: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: theme.spacing.xs, background: 'none', border: 'none', cursor: 'pointer',
            }}
            aria-label={hidden ? 'Show password' : 'Hide password'}
          >
            <AppIcon name={hidden ? 'eye' : 'eyeSlash'} size={20} color={theme.colors.textTertiary} />
          </button>
        )}
      </div>
      {error ? (
        <p style={{ color: theme.colors.danger, fontSize: 12, marginTop: theme.spacing.xs, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{error}</p>
      ) : helperText ? (
        <p style={{ color: theme.colors.textTertiary, fontSize: 12, marginTop: theme.spacing.xs, fontFamily: 'Inter, sans-serif' }}>{helperText}</p>
      ) : null}
    </div>
  );
}

/* ── Card ── */

interface CardProps {
  children: React.ReactNode;
  style?: CSSProperties;
  variant?: 'default' | 'elevated' | 'outline' | 'glass';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const theme = useTheme();

  const baseStyle: CSSProperties = {
    backgroundColor: variant === 'outline' ? 'transparent' : variant === 'glass' ? (theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)') : theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    border: `1px solid ${variant === 'outline' ? theme.colors.border : variant === 'glass' ? (theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)') : variant === 'elevated' ? 'transparent' : theme.colors.borderSubtle}`,
    boxShadow: variant === 'elevated' ? theme.shadows.md : 'none',
    ...style,
  };

  return <div style={baseStyle}>{children}</div>;
}

/* ── SummaryCard ── */

interface SummaryCardProps {
  title: string;
  amount: string;
  color?: string;
  subtitle?: string;
  icon?: AppIconName;
  onPress?: () => void;
}

export function SummaryCard({ title, amount, color, subtitle, icon, onPress }: SummaryCardProps) {
  const theme = useTheme();
  const tint = color ?? theme.colors.text;

  const content = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: theme.spacing.sm }}>
        {icon && (
          <div style={{
            width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: tint + '18',
          }}>
            <AppIcon name={icon} size={16} color={tint} />
          </div>
        )}
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: theme.typography.caption.fontSize,
          fontWeight: Number(theme.typography.caption.fontWeight),
          color: theme.colors.textSecondary,
          flex: 1,
        }}>{title}</span>
      </div>
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: theme.typography.amount.fontSize,
        fontWeight: Number(theme.typography.amount.fontWeight),
        letterSpacing: theme.typography.amount.letterSpacing,
        color: tint,
      }}>{amount}</span>
      {subtitle && (
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: theme.typography.caption.fontSize,
          fontWeight: Number(theme.typography.caption.fontWeight),
          color: theme.colors.textTertiary,
          marginTop: 4,
          margin: 0,
        }}>{subtitle}</p>
      )}
    </>
  );

  if (onPress) {
    return (
      <button type="button" onClick={onPress} style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
        <Card variant="elevated" style={{ height: '100%' }}>{content}</Card>
      </button>
    );
  }

  return <Card variant="elevated" style={{ height: '100%' }}>{content}</Card>;
}

/* ── EmptyState ── */

export function EmptyState({
  title, subtitle, icon, action, onAction,
}: {
  title: string; subtitle?: string; icon?: AppIconName; action?: string; onAction?: () => void;
}) {
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
      {icon && (
        <div style={{
          width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: theme.colors.primarySoft, border: `1px solid ${theme.colors.primary}28`, marginBottom: theme.spacing.lg,
        }}>
          <AppIcon name={icon} size={28} color={theme.colors.primary} />
        </div>
      )}
      <h3 style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: theme.typography.titleSm.fontSize,
        fontWeight: Number(theme.typography.titleSm.fontWeight),
        color: theme.colors.text,
        textAlign: 'center',
        margin: 0,
      }}>{title}</h3>
      {subtitle && (
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: theme.typography.bodyMedium.fontSize,
          fontWeight: Number(theme.typography.bodyMedium.fontWeight),
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.sm,
          textAlign: 'center',
          lineHeight: '22px',
          maxWidth: 280,
          margin: `${theme.spacing.sm}px 0 0 0`,
        }}>{subtitle}</p>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: theme.spacing.lg,
            padding: '12px 24px',
            borderRadius: theme.radii.full,
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`,
            color: theme.colors.onPrimary,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

/* ── SectionHeader ── */

export function SectionHeader({
  title, subtitle, action, onAction,
}: {
  title: string; subtitle?: string; action?: string; onAction?: () => void;
}) {
  const theme = useTheme();

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
      minHeight: 36,
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <h3 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: -0.3,
          color: theme.colors.text,
          margin: 0,
          lineHeight: '24px',
        }}>{title}</h3>
        {subtitle ? (
          <span style={{
            display: 'block',
            marginTop: 2,
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            color: theme.colors.textTertiary,
            lineHeight: '16px',
          }}>{subtitle}</span>
        ) : null}
      </div>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
            padding: '7px 12px 7px 14px',
            borderRadius: theme.radii.full,
            border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle}`,
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : theme.colors.surface,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: theme.colors.primary,
            boxShadow: theme.shadows.sm,
          }}
        >
          {action}
          <AppIcon name="chevronRight" size={14} color={theme.colors.primary} />
        </button>
      )}
    </div>
  );
}

/* ── FormActions ── */

export function FormActions({
  primaryTitle, onPrimary, primaryLoading, primaryLoadingTitle, secondaryTitle, onSecondary, style,
}: {
  primaryTitle: string; onPrimary: () => void; primaryLoading?: boolean; primaryLoadingTitle?: string;
  secondaryTitle?: string; onSecondary?: () => void; style?: CSSProperties;
}) {
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, marginTop: theme.spacing.sm, ...style }}>
      <Button
        title={primaryTitle}
        loadingTitle={primaryLoadingTitle}
        onPress={onPrimary}
        loading={primaryLoading}
        disabled={primaryLoading}
        size="lg"
      />
      {secondaryTitle && onSecondary && (
        <Button title={secondaryTitle} onPress={onSecondary} variant="outline" disabled={primaryLoading} />
      )}
    </div>
  );
}

/* ── ProgressBar ── */

export function ProgressBar({ progress, color, height = 8 }: { progress: number; color?: string; height?: number }) {
  const theme = useTheme();
  const barColor = color ?? theme.colors.primary;
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div style={{ height, borderRadius: height / 2, backgroundColor: theme.colors.borderSubtle, overflow: 'hidden', width: '100%' }}>
      <div style={{
        height: '100%', width: `${clamped}%`, borderRadius: height / 2,
        background: `linear-gradient(135deg, ${barColor}, ${barColor}dd)`,
        transition: 'width 0.5s ease',
      }} />
    </div>
  );
}

/* ── ListRow ── */

export function ListRow({
  icon, label, subtitle, value, onPress, chevron, destructive, isLast,
}: {
  icon?: AppIconName; label: string; subtitle?: string; value?: string;
  onPress?: () => void; chevron?: boolean; destructive?: boolean; isLast?: boolean;
}) {
  const theme = useTheme();
  const showChevron = chevron ?? !!onPress;

  const content = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: theme.spacing.md,
      padding: '14px 16px',
      minHeight: 52,
      cursor: onPress ? 'pointer' : 'default',
      borderBottom: isLast ? 'none' : `1px solid ${theme.colors.borderSubtle}`,
    }}>
      {icon && (
        <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: destructive ? theme.colors.dangerSoft : theme.colors.primarySoft, flexShrink: 0 }}>
          <AppIcon name={icon} size={18} color={destructive ? theme.colors.danger : theme.colors.primary} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block',
          fontFamily: 'Inter, sans-serif',
          fontSize: theme.typography.body.fontSize,
          fontWeight: Number(theme.typography.bodyMedium.fontWeight),
          color: destructive ? theme.colors.danger : theme.colors.text,
        }}>{label}</span>
        {subtitle && (
          <span style={{
            display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12,
            color: theme.colors.textTertiary, marginTop: 2,
          }}>{subtitle}</span>
        )}
      </div>
      {value && (
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: theme.typography.caption.fontSize,
          fontWeight: 600,
          color: theme.colors.textSecondary,
          flexShrink: 0,
        }}>{value}</span>
      )}
      {showChevron && onPress && <AppIcon name="chevronRight" size={14} color={theme.colors.textTertiary} />}
    </div>
  );

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        style={{ width: '100%', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.surfaceHover; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        {content}
      </button>
    );
  }

  return <div>{content}</div>;
}

/* ── GroupedCard ── */

export function GroupedCard({ children, title, style }: { children: React.ReactNode; title?: string; style?: CSSProperties }) {
  const theme = useTheme();

  return (
    <div style={{ marginBottom: theme.spacing.section, ...style }}>
      {title && (
        <span style={{
          display: 'block',
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.9,
          textTransform: 'uppercase',
          color: theme.colors.textTertiary,
          marginBottom: theme.spacing.sm,
          marginLeft: theme.spacing.xs,
        }}>{title}</span>
      )}
      <Card variant="elevated" style={{ padding: 0, overflow: 'hidden' }}>
        {children}
      </Card>
    </div>
  );
}

export { FormErrorBanner };
