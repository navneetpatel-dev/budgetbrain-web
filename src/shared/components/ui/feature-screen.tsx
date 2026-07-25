import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppIcon, type AppIconName } from './icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { caption, textStyle } from '@/shared/theme/textStyles';
import { ensureArray } from '@/shared/utils/listData';
import { useScreenInsets } from '@/shared/hooks/useScreenInsets';
import { useBottomInset } from '@/shared/hooks/useTabBarInset';
import { useResponsive } from '@/shared/hooks/useResponsive';
import type { CSSProperties } from 'react';

/* ── Back Navigation ── */

export function useStackBack(fallback = '/') {
  const navigate = useNavigate();
  return () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };
}

export function useProfileBack() {
  return useStackBack('/settings');
}

export function BackButton({ onPress, size = 'default' }: { onPress?: () => void; size?: 'default' | 'compact' }) {
  const theme = useTheme();
  const stackBack = useStackBack();
  const compact = size === 'compact';

  return (
    <button
      onClick={onPress ?? stackBack}
      style={{
        width: compact ? 36 : 40, height: compact ? 36 : 40,
        borderRadius: compact ? 10 : 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface,
        border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle}`,
        cursor: 'pointer',
      }}
      aria-label="Go back"
    >
      <AppIcon name="arrowLeft" size={compact ? 18 : 20} color={theme.colors.primary} />
    </button>
  );
}

/* ── StackNavHeader ── */

export function StackNavHeader({
  title, subtitle, eyebrow, showBack = true, onBack, actionIcon, onAction, actionLabel, footer,
}: {
  title: string; subtitle?: string; eyebrow?: string; showBack?: boolean; onBack?: () => void;
  actionIcon?: AppIconName; onAction?: () => void; actionLabel?: string; footer?: React.ReactNode;
}) {
  const theme = useTheme();
  const stackBack = useStackBack();
  const { paddingX, contentMaxWidth } = useScreenInsets();
  const { isDesktop } = useResponsive();

  return (
    <div style={{
      backgroundColor: theme.colors.background,
      borderBottom: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
    }}>
      <div style={{
        ...paddingX,
        paddingTop: isDesktop ? 20 : 12,
        paddingBottom: 10,
        maxWidth: contentMaxWidth ?? '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, minHeight: 36,
        }}>
          {showBack && <BackButton onPress={onBack ?? stackBack} size="compact" />}
          <div style={{ flex: 1, minWidth: 0 }}>
            {eyebrow && (
              <span style={{
                display: 'block', ...caption(theme), fontWeight: 600, letterSpacing: 0.2,
                marginBottom: 2, textTransform: 'capitalize',
              }}>{eyebrow}</span>
            )}
            <span style={textStyle(theme, 'titleSm', { color: theme.colors.text, fontWeight: 700, letterSpacing: -0.2 })}>
              {title}
            </span>
            {subtitle && (
              <span style={{
                display: 'block', ...caption(theme, theme.colors.textSecondary),
                fontWeight: 500, marginTop: 1, lineHeight: '16px',
              }}>{subtitle}</span>
            )}
          </div>
          {onAction && actionIcon && (
            <button
              onClick={onAction}
              style={{
                width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface,
                border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle}`,
                cursor: 'pointer',
              }}
              aria-label={actionLabel ?? 'Action'}
            >
              <AppIcon name={actionIcon} size={18} color={theme.colors.primary} />
            </button>
          )}
        </div>
        {footer && <div style={{ marginTop: theme.spacing.sm }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ── FeatureHeader ── */

export function FeatureHeader({
  title, subtitle, eyebrow, icon, actionIcon, onAction, actionLabel,
  footer, showBack, onBack, variant = 'tab',
}: {
  title: string; subtitle?: string; eyebrow?: string; icon?: AppIconName;
  actionIcon?: AppIconName; onAction?: () => void; actionLabel?: string;
  footer?: React.ReactNode; showBack?: boolean; onBack?: () => void;
  variant?: 'tab' | 'stack';
}) {
  const theme = useTheme();
  const stackBack = useStackBack();
  const { paddingX, contentMaxWidth } = useScreenInsets();
  const { isDesktop } = useResponsive();

  if (variant === 'stack') {
    return (
      <StackNavHeader
        title={title} subtitle={subtitle} eyebrow={eyebrow} showBack={showBack} onBack={onBack ?? stackBack}
        actionIcon={actionIcon} onAction={onAction} actionLabel={actionLabel} footer={footer}
      />
    );
  }

  return (
    <div style={{
      backgroundColor: theme.colors.background,
      borderBottom: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
    }}>
      <div style={{
        ...paddingX,
        paddingTop: isDesktop ? 24 : 12,
        paddingBottom: theme.spacing.md,
        maxWidth: contentMaxWidth ?? '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
        {showBack ? <BackButton onPress={onBack ?? stackBack} size="compact" /> : null}
        {icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${theme.colors.primary}38, ${theme.colors.gradientEnd}22)`,
            border: `1px solid ${theme.colors.primary}33`,
          }}>
            <AppIcon name={icon} size={20} color={theme.colors.primary} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {eyebrow && (
            <span style={{
              display: 'block', ...caption(theme), fontWeight: 600, letterSpacing: 0.2,
              marginBottom: 3, textTransform: 'capitalize',
            }}>{eyebrow}</span>
          )}
          <span style={textStyle(theme, 'title', { color: theme.colors.text, fontWeight: 800, fontSize: 22, letterSpacing: -0.3 })}>
            {title}
          </span>
          {subtitle && (
            <span style={{
              display: 'block', ...caption(theme, theme.colors.textSecondary),
              fontWeight: 500, marginTop: 3, lineHeight: '18px',
            }}>{subtitle}</span>
          )}
        </div>
        {onAction && actionIcon && (
          <button
            onClick={onAction}
            style={{
              width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${theme.colors.primary}33, ${theme.colors.gradientEnd}22)`,
              border: `1px solid ${theme.colors.primary}33`, cursor: 'pointer',
            }}
            aria-label={actionLabel ?? 'Action'}
          >
            <AppIcon name={actionIcon} size={20} color={theme.colors.primary} />
          </button>
        )}
      </div>
      {footer && <div style={{ marginTop: theme.spacing.sm }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ── HeaderIconButton ── */

export function HeaderIconButton({
  icon, onPress, label, variant = 'soft',
}: {
  icon: AppIconName; onPress: () => void; label: string; variant?: 'soft' | 'solid';
}) {
  const theme = useTheme();
  const isSolid = variant === 'solid';

  return (
    <button
      onClick={onPress}
      style={{
        width: 42, height: 42, borderRadius: 14, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isSolid
          ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`
          : (theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface),
        border: `1px solid ${isSolid ? 'transparent' : (theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle)}`,
        cursor: 'pointer',
      }}
      aria-label={label}
    >
      <AppIcon name={icon} size={20} color={isSolid ? theme.colors.onPrimary : theme.colors.primary} />
    </button>
  );
}

/* ── SearchField ── */

export function SearchField({ placeholder, onPress, rightAction }: { placeholder: string; onPress: () => void; rightAction?: React.ReactNode }) {
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
      <button
        onClick={onPress}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: theme.spacing.sm,
          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.surface,
          borderRadius: theme.radii.lg, padding: '11px 12px',
          border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
          cursor: 'pointer', width: '100%',
        }}
      >
        <AppIcon name="search" size={17} color={theme.colors.textTertiary} />
        <span style={textStyle(theme, 'bodyMedium', { color: theme.colors.textTertiary })}>{placeholder}</span>
      </button>
      {rightAction}
    </div>
  );
}

/* ── OptionChips ── */

export function OptionChips<T extends string>({
  options, value, onChange, getLabel = (v) => v, getColor, error, disabled,
}: {
  options: T[]; value: T; onChange: (v: T) => void;
  getLabel?: (v: T) => string; getColor?: (v: T) => string | undefined; error?: string; disabled?: boolean;
}) {
  const theme = useTheme();
  /** Shared rule with mobile: ≤4 segmented, 5–8 chips, >8 select. */
  const useSelect = options.length > 8;
  const useSegmented = options.length <= 4;

  if (useSelect) {
    return (
      <div style={{ marginBottom: theme.spacing.lg, opacity: disabled ? 0.55 : 1 }}>
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as T)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            height: 48,
            padding: '0 12px',
            borderRadius: theme.radii.lg,
            border: `1.5px solid ${theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle}`,
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.inputBg,
            color: theme.colors.text,
            ...textStyle(theme, 'bodyMedium', { fontWeight: 600 }),
            textTransform: 'capitalize',
          }}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{getLabel(opt)}</option>
          ))}
        </select>
        {error && (
          <p style={{ ...caption(theme, theme.colors.danger), marginTop: theme.spacing.xs, fontWeight: 500 }}>{error}</p>
        )}
      </div>
    );
  }

  if (useSegmented) {
    return (
      <div style={{ marginBottom: theme.spacing.lg, opacity: disabled ? 0.55 : 1 }}>
        <div style={{
          display: 'flex',
          borderRadius: theme.radii.lg,
          border: `1.5px solid ${theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle}`,
          overflow: 'hidden',
          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.surface,
        }}>
          {options.map((opt, i) => {
            const selected = value === opt;
            const accent = getColor?.(opt) ?? theme.colors.primary;
            return (
              <button
                key={opt}
                type="button"
                disabled={disabled}
                onClick={() => onChange(opt)}
                style={{
                  flex: 1,
                  padding: '11px 6px',
                  border: 'none',
                  borderRight: i < options.length - 1
                    ? `1px solid ${theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle}`
                    : 'none',
                  backgroundColor: selected ? accent + '22' : 'transparent',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  ...textStyle(theme, 'caption', {
                    fontWeight: selected ? 700 : 600,
                    color: selected ? accent : theme.colors.text,
                  }),
                  textTransform: 'capitalize',
                }}
              >
                {getLabel(opt)}
              </button>
            );
          })}
        </div>
        {error && (
          <p style={{ ...caption(theme, theme.colors.danger), marginTop: theme.spacing.xs, fontWeight: 500 }}>{error}</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: theme.spacing.lg, opacity: disabled ? 0.55 : 1 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => {
          const selected = value === opt;
          const accent = getColor?.(opt) ?? theme.colors.primary;
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 12px', borderRadius: theme.radii.lg,
                border: `1.5px solid ${selected ? accent : (theme.isDark ? 'rgba(255,255,255,0.12)' : theme.colors.borderSubtle)}`,
                backgroundColor: selected ? accent + '22' : (theme.isDark ? 'rgba(255,255,255,0.05)' : theme.colors.surface),
                cursor: disabled ? 'not-allowed' : 'pointer',
                ...textStyle(theme, 'caption', {
                  fontWeight: selected ? 700 : 600,
                  color: selected ? accent : theme.colors.text,
                }),
                textTransform: 'capitalize',
              }}
            >
              {getLabel(opt)}
            </button>
          );
        })}
      </div>
      {error && (
        <p style={{ ...caption(theme, theme.colors.danger), marginTop: theme.spacing.xs, fontWeight: 500 }}>{error}</p>
      )}
    </div>
  );
}

export function OptionChipList({
  items, selectedId, onSelect, error, disabled,
}: {
  items: { id: string; label: string; color?: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const safeItems = ensureArray<{ id: string; label: string; color?: string }>(items);
  const useSelect = safeItems.length > 8;
  const selected = safeItems.find((i) => i.id === selectedId);

  if (useSelect) {
    const borderColor = error
      ? theme.colors.danger
      : (theme.isDark ? 'rgba(255,255,255,0.12)' : theme.colors.borderSubtle);
    return (
      <div style={{ marginBottom: theme.spacing.lg, opacity: disabled ? 0.55 : 1 }}>
        <select
          value={selectedId}
          disabled={disabled}
          onChange={(e) => onSelect(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box', height: 48, padding: '0 12px',
            borderRadius: theme.radii.lg,
            border: `1.5px solid ${borderColor}`,
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : theme.colors.inputBg,
            color: selected ? theme.colors.text : theme.colors.textTertiary,
            fontFamily: theme.typography.bodyMedium.fontFamily ?? 'Inter',
            fontSize: 15, fontWeight: 600,
          }}
        >
          <option value="" disabled>
            Please select a category
          </option>
          {safeItems.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        {selected?.color ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: selected.color }} />
            <span style={{ fontSize: 12, color: theme.colors.textTertiary, fontFamily: theme.typography.caption.fontFamily ?? 'Inter' }}>
              {selected.label}
            </span>
          </div>
        ) : null}
        {error && (
          <p style={{ color: theme.colors.danger, fontSize: 12, marginTop: theme.spacing.xs, fontWeight: 500, fontFamily: theme.typography.caption.fontFamily ?? 'Inter' }}>{error}</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: theme.spacing.lg, opacity: disabled ? 0.55 : 1 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {safeItems.map((item) => {
          const isSelected = selectedId === item.id;
          const accent = item.color ?? theme.colors.primary;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 12px', borderRadius: theme.radii.lg,
                border: `1.5px solid ${isSelected ? accent : (theme.isDark ? 'rgba(255,255,255,0.12)' : theme.colors.borderSubtle)}`,
                backgroundColor: isSelected ? accent + '22' : (theme.isDark ? 'rgba(255,255,255,0.05)' : theme.colors.surface),
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: theme.typography.bodyMedium.fontFamily ?? 'Inter',
                fontSize: 13,
                fontWeight: isSelected ? 700 : 600,
                color: isSelected ? accent : theme.colors.text,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accent, flexShrink: 0 }} />
              {item.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p style={{ color: theme.colors.danger, fontSize: 12, marginTop: theme.spacing.xs, fontWeight: 500, fontFamily: theme.typography.caption.fontFamily ?? 'Inter' }}>{error}</p>
      )}
    </div>
  );
}

export function MultiOptionChips({
  options, selected, onToggle, getLabel = (v) => v, error, disabled,
}: {
  options: string[]; selected: string[]; onToggle: (v: string) => void;
  getLabel?: (v: string) => string; error?: string; disabled?: boolean;
}) {
  const theme = useTheme();

  return (
    <div style={{ marginBottom: theme.spacing.lg, opacity: disabled ? 0.55 : 1 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          const accent = theme.colors.primary;
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(opt)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 14px', borderRadius: theme.radii.lg,
                border: `1.5px solid ${isSelected ? accent : (theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle)}`,
                backgroundColor: isSelected ? accent + '22' : (theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.surface),
                cursor: disabled ? 'not-allowed' : 'pointer',
                ...textStyle(theme, 'caption', {
                  fontWeight: isSelected ? 700 : 600,
                  color: isSelected ? accent : theme.colors.text,
                }),
                textTransform: 'capitalize',
              }}
            >
              {isSelected && (
                <span style={{
                  width: 16, height: 16, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: accent,
                }}>
                  <AppIcon name="checkmark" size={10} color={theme.colors.onPrimary} />
                </span>
              )}
              {getLabel(opt)}
            </button>
          );
        })}
      </div>
      {error && (
        <p style={{ ...caption(theme, theme.colors.danger), marginTop: theme.spacing.xs, fontWeight: 500 }}>{error}</p>
      )}
    </div>
  );
}

/* ── ActionFab ── */

export function ActionFab({ onPress, label = 'Add' }: { onPress: () => void; label?: string }) {
  const theme = useTheme();
  const { contentMaxWidth, tabBarPaddingX } = useResponsive();
  const bottomInset = useBottomInset('tab');
  const fabBottom = typeof bottomInset === 'number' ? bottomInset - 56 : `calc(${bottomInset} - 56px)`;

  return (
    <button
      onClick={onPress}
      style={{
        position: 'fixed',
        bottom: fabBottom,
        right: contentMaxWidth
          ? `max(${tabBarPaddingX}px, calc((100% - ${contentMaxWidth}px) / 2 + ${tabBarPaddingX}px))`
          : tabBarPaddingX + 14,
        width: 56, height: 56,
        borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`,
        border: 'none', cursor: 'pointer', zIndex: 50,
        boxShadow: theme.shadows.lg,
      }}
      aria-label={label}
    >
      <AppIcon name="add" size={26} color={theme.colors.onPrimary} />
    </button>
  );
}

/* ── Screen Wrappers ── */

export function StackScrollScreen({
  header, children, contentContainerStyle,
}: {
  header: React.ReactNode; children: React.ReactNode; contentContainerStyle?: CSSProperties;
}) {
  const theme = useTheme();
  const { frame, sectionGap } = useScreenInsets();
  const bottomPadding = useBottomInset('stack');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: theme.colors.background }}>
      {header}
      <div style={{
        flex: 1, overflowY: 'auto',
        ...frame,
        paddingTop: theme.spacing.md,
        paddingBottom: bottomPadding,
        ...contentContainerStyle,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function FormStackScreen({
  eyebrow, title, subtitle, icon, onBack, children,
}: {
  eyebrow?: string; title: string; subtitle?: string; icon?: AppIconName; onBack?: () => void; children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <StackScrollScreen
      header={
        <FeatureHeader variant="stack" showBack onBack={onBack} icon={icon} eyebrow={eyebrow} title={title} subtitle={subtitle} />
      }
      contentContainerStyle={{ paddingTop: theme.spacing.sm }}
    >
      {children}
    </StackScrollScreen>
  );
}

export function StickyHeaderFlatScreen<T>({
  header, data, renderItem, keyExtractor, ListEmptyComponent, ListHeaderComponent, contentContainerStyle, inset = 'tab',
}: {
  header: React.ReactNode; data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  ListEmptyComponent?: React.ReactNode;
  ListHeaderComponent?: React.ReactNode;
  contentContainerStyle?: CSSProperties;
  inset?: 'tab' | 'stack' | 'none';
}) {
  const theme = useTheme();
  const { frame, stackGap } = useScreenInsets();
  const bottomPadding = useBottomInset(inset);
  const safeData = ensureArray<T>(data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: theme.colors.background }}>
      {header}
      <div style={{
        flex: 1, overflowY: 'auto',
        ...frame,
        paddingTop: stackGap,
        paddingBottom: bottomPadding,
        ...contentContainerStyle,
      }}>
        {safeData.length === 0 && ListEmptyComponent ? (
          <>
            {ListHeaderComponent}
            {ListEmptyComponent}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: stackGap }}>
            {ListHeaderComponent}
            {safeData.map((item, index) => (
              <div key={keyExtractor(item, index)}>
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
