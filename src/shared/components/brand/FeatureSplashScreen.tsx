import { useEffect, useState } from 'react';
import { BrandMark } from './BrandMark';
import { AppIcon, type AppIconName } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';

const FEATURES: { icon: AppIconName; label: string }[] = [
  { icon: 'receipt', label: 'Track expenses' },
  { icon: 'budgets', label: 'Manage budgets' },
  { icon: 'target', label: 'Reach goals' },
  { icon: 'sparkles', label: 'AI insights' },
];

export function FeatureSplashScreen() {
  const theme = useTheme();
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((i) => (i + 1) % FEATURES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <style>{`
        @keyframes splash-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes splash-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        height: '100%',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        background: `linear-gradient(160deg, ${theme.colors.background} 0%, ${theme.colors.primarySoft} 55%, ${theme.colors.background} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 280, height: 280, borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.colors.primary}18 0%, transparent 70%)`,
          top: '10%', right: '-20%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 220, height: 220, borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.colors.gradientEnd}14 0%, transparent 70%)`,
          bottom: '8%', left: '-15%', pointerEvents: 'none',
        }} />

        <div style={{
          width: 88, height: 88, borderRadius: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`,
          boxShadow: theme.shadows.lg,
          marginBottom: 24,
          animation: 'splash-fade-in 0.5s ease-out',
        }}>
          <BrandMark size={44} color="#fff" strokeWidth={2.2} />
        </div>

        <h1 style={{
          fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 800,
          color: theme.colors.text, margin: '0 0 8px 0', letterSpacing: -0.5,
          animation: 'splash-fade-in 0.6s ease-out',
        }}>BudgetBrain</h1>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 15, color: theme.colors.textSecondary,
          margin: '0 0 32px 0', textAlign: 'center', maxWidth: 280, lineHeight: 1.5,
          animation: 'splash-fade-in 0.7s ease-out',
        }}>Smart budgeting for your financial goals</p>

        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10,
          marginBottom: 40, minHeight: 36,
        }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: theme.radii.full,
                backgroundColor: i === activeFeature ? theme.colors.primarySoft : theme.colors.surface,
                border: `1px solid ${i === activeFeature ? theme.colors.primary + '44' : theme.colors.borderSubtle}`,
                opacity: i === activeFeature ? 1 : 0.55,
                transform: i === activeFeature ? 'scale(1)' : 'scale(0.96)',
                transition: 'all 0.35s ease',
              }}
            >
              <AppIcon name={f.icon} size={14} color={i === activeFeature ? theme.colors.primary : theme.colors.textSecondary} />
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                color: i === activeFeature ? theme.colors.primary : theme.colors.textSecondary,
              }}>{f.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            border: `2.5px solid ${theme.colors.borderSubtle}`,
            borderTopColor: theme.colors.primary,
            animation: 'splash-spin 0.8s linear infinite',
          }} />
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
            color: theme.colors.textTertiary,
          }}>Loading your finances…</span>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6, height: 6, borderRadius: 3,
                backgroundColor: theme.colors.primary,
                animation: `splash-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
