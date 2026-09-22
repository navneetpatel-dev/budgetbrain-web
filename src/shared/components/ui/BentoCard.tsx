import { m as motion } from 'framer-motion';
import { AppIcon, type AppIconName } from './icons/AppIcon';
import { useTheme } from '@/shared/theme';

export interface BentoCardProps {
  title: string;
  amount?: string;
  value?: string;
  subtitle?: string;
  badgeText?: string;
  badgeColor?: string;
  icon: AppIconName;
  iconColor?: string;
  accentColor?: string;
  onPress?: () => void;
  style?: React.CSSProperties;
}

export function BentoCard({
  title,
  amount,
  value,
  subtitle,
  badgeText,
  badgeColor,
  icon,
  iconColor,
  accentColor,
  onPress,
  style,
}: BentoCardProps) {
  const theme = useTheme();
  const displayAmount = amount ?? value ?? '';
  const tint = iconColor ?? accentColor ?? theme.colors.primary;
  const tagColor = badgeColor ?? tint;

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 124,
    padding: '16px',
    borderRadius: theme.radii.card,
    backgroundColor: theme.colors.surfaceContainer ?? theme.colors.surface,
    border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
    boxShadow: theme.shadows.sm,
    boxSizing: 'border-box',
    cursor: onPress ? 'pointer' : 'default',
    textAlign: 'left',
    width: '100%',
    ...style,
  };

  const content = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tint + '18',
        }}>
          <AppIcon name={icon} size={18} color={tint} />
        </div>
        {badgeText ? (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            color: tagColor,
            backgroundColor: tagColor + '14',
            padding: '4px 8px',
            borderRadius: 9999,
          }}>
            {badgeText}
          </span>
        ) : null}
      </div>

      <div>
        <span style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
          color: theme.colors.textSecondary,
          marginBottom: 4,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {title}
        </span>
        {displayAmount ? (
          <span style={{
            display: 'block',
            fontSize: 20,
            fontWeight: 800,
            fontFamily: 'Inter, sans-serif',
            color: theme.colors.text,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: -0.4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {displayAmount}
          </span>
        ) : null}
        {subtitle ? (
          <span style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            color: theme.colors.textSecondary,
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {subtitle}
          </span>
        ) : null}
      </div>
    </>
  );

  if (onPress) {
    return (
      <motion.button
        type="button"
        onClick={onPress}
        style={{ ...cardStyle, border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}` }}
        whileHover={{ y: -2, boxShadow: theme.shadows.md, borderColor: tint + '40' }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        {content}
      </motion.button>
    );
  }

  return <div style={cardStyle}>{content}</div>;
}
