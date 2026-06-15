import { useState } from 'react';
import { FeatureHeader } from '@/shared/components/ui/feature-screen';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Card, Button, fieldControlStyle } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useReports } from '@/features/shared/hooks/useFeatures';

export function ReportsPage() {
  const theme = useTheme();
  const { download, loading } = useReports();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return (
    <ScreenWrapper header={<FeatureHeader title="Reports" subtitle="Export your data" icon="download" variant="stack" showBack />}>
      <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>Date Range</label>
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={fieldControlStyle(theme, { flex: 1, borderRadius: theme.radii.md, fontSize: 14 })} />
          <span style={{ alignSelf: 'center', color: theme.colors.textTertiary }}>to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={fieldControlStyle(theme, { flex: 1, borderRadius: theme.radii.md, fontSize: 14 })} />
        </div>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        <Button title="Download CSV" onPress={() => download('csv', params)} loading={loading} size="lg" icon="download" />
        <Button title="Download PDF" onPress={() => download('pdf', params)} loading={loading} variant="outline" size="lg" icon="fileText" />
      </div>
    </ScreenWrapper>
  );
}
