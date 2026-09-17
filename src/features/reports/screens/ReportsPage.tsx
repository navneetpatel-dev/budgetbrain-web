import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Card, Button, Input } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { useReports } from '@/features/shared/hooks/useFeatures';
import { DateBounds } from '@/shared/utils/dateBounds';

export function ReportsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { download, loading } = useReports();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const fromBounds = DateBounds.rangeFrom(endDate, startDate);
  const toBounds = DateBounds.rangeTo(startDate, endDate);

  return (
    <ScreenWrapper header={<ProfileStackHeader screen="reports" subtitle="Export your data" />} inset="stack">
      {/* Luminous hero section */}
      <div style={{
        position: 'relative',
        borderRadius: theme.radii.card,
        padding: '24px',
        backgroundColor: theme.colors.surfaceElevated,
        border: `1px solid ${theme.isDark ? 'rgba(14,165,233,0.18)' : theme.colors.borderSubtle}`,
        boxShadow: theme.isDark ? '0 8px 32px rgba(0,0,0,0.45)' : theme.shadows.lg,
        marginBottom: theme.spacing.lg,
        overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: -30, right: -30, width: 120, height: 120,
          borderRadius: 60, backgroundColor: theme.colors.primary, opacity: 0.1,
          filter: 'blur(32px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: -30, width: 100, height: 100,
          borderRadius: 50, backgroundColor: theme.colors.secondary, opacity: 0.07,
          filter: 'blur(28px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${theme.colors.primary}22, ${theme.colors.secondary}22)`,
            border: `1px solid ${theme.isDark ? 'rgba(14,165,233,0.2)' : theme.colors.borderSubtle}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AppIcon name="reports" size={26} color={theme.colors.primary} />
          </div>
          <div>
            <span style={{
              display: 'block', fontFamily: 'Inter, sans-serif',
              fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
              color: theme.colors.textTertiary, textTransform: 'uppercase', marginBottom: 4,
            }}>
              Financial Reports
            </span>
            <span style={{
              display: 'block', fontFamily: 'Inter, sans-serif',
              fontSize: 22, fontWeight: 800, letterSpacing: -0.5,
              color: theme.colors.text, lineHeight: 1.2,
            }}>
              Export & Analyse
            </span>
            <span style={{
              display: 'block', fontFamily: 'Inter, sans-serif',
              fontSize: 13, fontWeight: 500, color: theme.colors.textSecondary, marginTop: 2,
            }}>
              Download CSV or PDF for any date range
            </span>
          </div>
        </div>

        {/* Quick Recap CTA */}
        <div style={{ position: 'relative', marginTop: 20 }}>
          <Button
            title="View Monthly Recap"
            onPress={() => navigate('/reports/recap')}
            variant="outline"
            icon="sparkles"
            size="lg"
          />
        </div>
      </div>

      {/* Date Range Card */}
      <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: theme.spacing.xs }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: theme.colors.primarySoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AppIcon name="calendar" size={14} color={theme.colors.primary} />
          </div>
          <FormFieldLabel>Date Range</FormFieldLabel>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.sm }}>
          <div style={{ flex: 1 }}>
            <Input
              type="date"
              value={startDate}
              min={fromBounds.min}
              max={fromBounds.max}
              onChange={(e) => {
                const next = e.target.value;
                setStartDate(next);
                if (endDate && next && endDate < next) setEndDate(next);
              }}
              disabled={loading}
            />
          </div>
          <span style={{ alignSelf: 'center', marginTop: 12, color: theme.colors.textTertiary, fontFamily: 'Inter', fontWeight: 600 }}>to</span>
          <div style={{ flex: 1 }}>
            <Input
              type="date"
              value={endDate}
              min={toBounds.min}
              max={toBounds.max}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </Card>

      {/* Export Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        <Button title="Download CSV" onPress={() => download('csv', params)} loading={loading} size="lg" icon="download" />
        <Button title="Download PDF" onPress={() => download('pdf', params)} loading={loading} variant="outline" size="lg" icon="fileText" />
      </div>
    </ScreenWrapper>
  );
}
