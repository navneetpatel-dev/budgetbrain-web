import { useState } from 'react';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Card, Button, fieldControlStyle } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useReports } from '@/features/shared/hooks/useFeatures';
import { DateBounds } from '@/shared/utils/dateBounds';

export function ReportsPage() {
  const theme = useTheme();
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
      <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>Date Range</label>
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          <input
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
            style={fieldControlStyle(theme, { flex: 1, borderRadius: theme.radii.md, fontSize: 14 })}
          />
          <span style={{ alignSelf: 'center', color: theme.colors.textTertiary }}>to</span>
          <input
            type="date"
            value={endDate}
            min={toBounds.min}
            max={toBounds.max}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
            style={fieldControlStyle(theme, { flex: 1, borderRadius: theme.radii.md, fontSize: 14 })}
          />
        </div>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        <Button title="Download CSV" onPress={() => download('csv', params)} loading={loading} size="lg" icon="download" />
        <Button title="Download PDF" onPress={() => download('pdf', params)} loading={loading} variant="outline" size="lg" icon="fileText" />
      </div>
    </ScreenWrapper>
  );
}
