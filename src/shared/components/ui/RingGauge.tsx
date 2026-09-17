import { useId } from 'react';
import { AppIcon, type AppIconName } from './icons/AppIcon';
import { useTheme } from '@/shared/theme';

export interface RingGaugeProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 to 100
  variant?: 'circle' | 'semi';
  icon?: AppIconName;
  centerText?: string;
  gradientColors?: [string, string];
}

export function RingGauge({
  size = 56,
  strokeWidth = 5,
  progress = 0,
  variant = 'circle',
  icon = 'budgets',
  centerText,
  gradientColors,
}: RingGaugeProps) {
  const theme = useTheme();
  const gradId = useId();
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const startColor = gradientColors?.[0] ?? theme.colors.secondary;
  const endColor = gradientColors?.[1] ?? theme.colors.primary;

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * clampedProgress) / 100;
  const center = size / 2;

  if (variant === 'semi') {
    const semiRadius = 46;
    const semiCircumference = 2 * Math.PI * semiRadius;
    const semiOffset = semiCircumference * (1 - clampedProgress / 100);

    return (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={startColor} />
              <stop offset="55%" stopColor={theme.colors.primary} />
              <stop offset="100%" stopColor={endColor} />
            </linearGradient>
          </defs>
          <circle
            cx="60"
            cy="60"
            r={semiRadius}
            fill="none"
            stroke={theme.colors.surfaceContainerHigh}
            strokeWidth={8}
            strokeDasharray="3 4"
            strokeLinecap="round"
          />
          <circle
            cx="60"
            cy="60"
            r={semiRadius}
            fill="none"
            stroke={theme.colors.surfaceContainerHighest}
            strokeWidth={8}
            opacity={0.6}
          />
          <circle
            cx="60"
            cy="60"
            r={semiRadius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={8.5}
            strokeDasharray={semiCircumference}
            strokeDashoffset={semiOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>

        <div style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          {icon && (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.primaryContainer,
              marginBottom: 4,
            }}>
              <AppIcon name={icon} size={18} color="#FFFFFF" />
            </div>
          )}
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            fontWeight: 800,
            color: theme.colors.secondaryFixed,
            letterSpacing: 0.2,
          }}>
            {centerText ?? `${Math.round(clampedProgress)}%`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={theme.colors.surfaceContainerHighest}
          strokeWidth={strokeWidth}
          opacity={0.5}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>

      <div style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        {centerText ? (
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: theme.colors.text,
          }}>
            {centerText}
          </span>
        ) : icon ? (
          <AppIcon name={icon} size={Math.round(size * 0.36)} color={theme.colors.secondary} />
        ) : null}
      </div>
    </div>
  );
}
