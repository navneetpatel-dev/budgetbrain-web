import { useState } from 'react';
import { FeatureHeader, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { Input, Button, Card, EmptyState } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useSupportTickets } from '@/features/shared/hooks/useFeatures';

export function SupportPage() {
  const theme = useTheme();
  const { tickets, createMutation, error, setError } = useSupportTickets();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  return (
    <StickyHeaderFlatScreen
      header={<FeatureHeader title="Support" subtitle="Get help" icon="helpCircle" variant="stack" showBack actionIcon="add" onAction={() => setShowForm(!showForm)} actionLabel="New Ticket" />}
      data={tickets}
      keyExtractor={(item) => item.id}
      renderItem={(t) => (
        <div style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, border: `1px solid ${theme.colors.borderSubtle}`, padding: theme.spacing.lg, boxShadow: theme.shadows.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{t.subject}</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', color: t.status === 'open' ? theme.colors.warning : theme.colors.success }}>{t.status}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, marginTop: 4, display: 'block', fontFamily: 'Inter, sans-serif' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
        </div>
      )}
      ListEmptyComponent={
        showForm ? (
          <Card variant="elevated">
            <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description" />
            <Input label="Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue" multiline />
            {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif', marginBottom: theme.spacing.md }}>{error}</p>}
            <div style={{ display: 'flex', gap: theme.spacing.sm }}><Button title="Submit" onPress={() => createMutation.mutate({ subject, message })} loading={createMutation.isPending} /><Button title="Cancel" onPress={() => setShowForm(false)} variant="outline" /></div>
          </Card>
        ) : <EmptyState title="No tickets" subtitle="Need help? Create a support ticket" icon="helpCircle" action="New Ticket" onAction={() => setShowForm(true)} />
      }
    />
  );
}
