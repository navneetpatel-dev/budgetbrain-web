import { useState } from 'react';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { Input, Button, Card, EmptyState, FormErrorBanner } from '@/shared/components/ui/index';
import { SupportSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { useSupportTickets } from '@/features/shared/hooks/useFeatures';

type FieldErrors = { subject?: string; message?: string };

export function SupportPage() {
  const theme = useTheme();
  const { tickets, isLoading, createMutation, error, setError } = useSupportTickets();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = () => {
    setError(null);
    const next: FieldErrors = {};
    if (!subject.trim()) next.subject = 'Subject is required';
    else if (subject.trim().length < 3) next.subject = 'At least 3 characters';
    if (!message.trim()) next.message = 'Message is required';
    else if (message.trim().length < 10) next.message = 'At least 10 characters';
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate({ subject, message });
  };

  return (
    <StickyHeaderFlatScreen
      header={<ProfileStackHeader screen="support" subtitle="Get help" actionIcon="add" onAction={() => setShowForm(!showForm)} actionLabel="New Ticket" />}
      inset="stack"
      data={isLoading ? [] : tickets}
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
        isLoading ? (
          <SupportSkeleton />
        ) : showForm ? (
          <Card variant="elevated">
            <Input
              label="Subject"
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setFieldErrors((f) => ({ ...f, subject: undefined })); }}
              placeholder="Brief description"
              disabled={createMutation.isPending}
              error={fieldErrors.subject}
            />
            <Input
              label="Message"
              value={message}
              onChange={(e) => { setMessage(e.target.value); setFieldErrors((f) => ({ ...f, message: undefined })); }}
              placeholder="Describe your issue"
              multiline
              disabled={createMutation.isPending}
              error={fieldErrors.message}
              helperText="Minimum 10 characters"
            />
            {error ? <FormErrorBanner message={error} /> : null}
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <Button title="Submit" onPress={handleSubmit} loading={createMutation.isPending} />
              <Button title="Cancel" onPress={() => { setShowForm(false); setFieldErrors({}); }} variant="outline" disabled={createMutation.isPending} />
            </div>
          </Card>
        ) : (
          <EmptyState title="No tickets" subtitle="Need help? Create a support ticket" icon="helpCircle" action="New Ticket" onAction={() => setShowForm(true)} />
        )
      }
    />
  );
}
