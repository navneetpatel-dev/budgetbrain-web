import { BrandMark } from './BrandMark';

export function BrandLogoBadge({
  compact = false,
  branded = true,
}: {
  compact?: boolean;
  branded?: boolean;
}) {
  const logoSize = branded ? (compact ? 40 : 52) : compact ? 44 : 60;
  const logoRadius = branded ? (compact ? 12 : 15) : compact ? 14 : 18;
  const ringRadius = branded ? (compact ? 16 : 20) : compact ? 18 : 24;
  const iconSize = branded ? (compact ? 20 : 26) : compact ? 22 : 28;

  return (
    <div style={{
      padding: 2,
      borderRadius: ringRadius,
      border: '1px solid rgba(255,255,255,0.22)',
      flexShrink: 0,
    }}>
      <div style={{
        width: logoSize,
        height: logoSize,
        borderRadius: logoRadius,
        backgroundColor: 'rgba(255,255,255,0.16)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <BrandMark size={iconSize} color="#fff" strokeWidth={2} />
      </div>
    </div>
  );
}
