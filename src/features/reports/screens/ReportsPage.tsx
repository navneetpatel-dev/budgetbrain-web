import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Card, Button, Input } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
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
      <Button title="View monthly recap" onPress={() => navigate('/reports/recap')} variant="outline" icon="sparkles" size="lg" />
      <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        <FormFieldLabel>Date Range</FormFieldLabel>
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
          <span style={{ alignSelf: 'center', marginTop: 12, color: theme.colors.textTertiary }}>to</span>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        <Button title="Download CSV" onPress={() => download('csv', params)} loading={loading} size="lg" icon="download" />
        <Button title="Download PDF" onPress={() => download('pdf', params)} loading={loading} variant="outline" size="lg" icon="fileText" />
      </div>
    </ScreenWrapper>
  );
}
