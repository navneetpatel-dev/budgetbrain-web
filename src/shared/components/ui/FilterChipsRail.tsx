import { AppIcon, type AppIconName } from './icons/AppIcon';
import { useTheme } from '@/shared/theme';

export interface FilterChipItem {
  id: string;
  label: string;
  icon?: AppIconName;
  color?: string;
  dotColor?: string;
}

export interface FilterChipsRailProps {
  chips: FilterChipItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  style?: React.CSSProperties;
}

export function FilterChipsRail({
  chips,
  selectedId,
  onSelect,
  style,
}: FilterChipsRailProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        padding: '4px 0',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        ...style,
      }}
    >
      {chips.map((chip) => {
        const isSelected = chip.id === selectedId;

        return (
          <button
            key={chip.id}
            onClick={() => onSelect(chip.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: isSelected
                ? `1.5px solid ${theme.colors.primary}`
                : `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
              backgroundColor: isSelected
                ? theme.colors.primary
                : theme.isDark ? theme.colors.surfaceContainerLow : theme.colors.surface,
              color: isSelected ? theme.colors.onPrimary : theme.colors.textSecondary,
              boxShadow: isSelected ? theme.shadows.sm : 'none',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            {chip.dotColor ? (
              <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: chip.dotColor }} />
            ) : chip.icon ? (
              <AppIcon
                name={chip.icon}
                size={14}
                color={isSelected ? theme.colors.onPrimary : (chip.color ?? theme.colors.textSecondary)}
              />
            ) : isSelected ? (
              <AppIcon name="checkmark" size={14} color={theme.colors.onPrimary} />
            ) : null}

            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}
