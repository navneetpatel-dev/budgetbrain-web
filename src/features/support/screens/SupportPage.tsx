import { useState } from 'react';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { Input, Button, Card, EmptyState, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { EntityRow } from '@/shared/components/ui/list-rows';
import { SupportSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { useSupportTickets } from '@/features/shared/hooks/useFeatures';
import { FieldLimits, maxLen, validateText } from '@/shared/validation/fieldLimits';

type FieldErrors = { subject?: string; message?: string };

export function SupportPage() {
  const theme = useTheme();
  const { tickets, isLoading, createMutation, error, setError } = useSupportTickets();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [justSubmitted, setJustSubmitted] = useState(false);

  const resetForm = () => {
    setShowForm(false);
    setSubject('');
    setMessage('');
    setFieldErrors({});
    setError(null);
  };

  const handleSubmit = () => {
    setError(null);
    const next: FieldErrors = {};
    const subjectErr = validateText('subject', subject);
    const messageErr = validateText('message', message);
    if (subjectErr) next.subject = subjectErr;
    if (messageErr) next.message = messageErr;
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate(
      { subject, message },
      {
        onSuccess: () => {
          resetForm();
          setJustSubmitted(true);
          setTimeout(() => setJustSubmitted(false), 2500);
        },
      }
    );
  };

  const ticketForm = (
    <Card variant="elevated" style={{ marginBottom: theme.spacing.lg }}>
      <Input
        label="Subject"
        value={subject}
        onChange={(e) => { setSubject(e.target.value); setFieldErrors((f) => ({ ...f, subject: undefined })); }}
        placeholder="Brief description"
        maxLength={maxLen('subject')}
        disabled={createMutation.isPending}
        error={fieldErrors.subject}
      />
      <Input
        label="Message"
        value={message}
        onChange={(e) => { setMessage(e.target.value); setFieldErrors((f) => ({ ...f, message: undefined })); }}
        placeholder="Describe your issue"
        multiline
        maxLength={maxLen('message')}
        disabled={createMutation.isPending}
        error={fieldErrors.message}
        helperText={`${FieldLimits.message.min}–${FieldLimits.message.max} characters`}
      />
      {error ? <FormErrorBanner message={error} /> : null}
      <div style={{ display: 'flex', gap: theme.spacing.sm }}>
        <Button title="Submit" onPress={handleSubmit} loading={createMutation.isPending} />
        <Button title="Cancel" onPress={resetForm} variant="outline" disabled={createMutation.isPending} />
      </div>
    </Card>
  );

  return (
    <StickyHeaderFlatScreen
      header={
        <ProfileStackHeader
          screen="support"
          subtitle="Get help"
          actionIcon="add"
          onAction={() => setShowForm((v) => !v)}
          actionLabel="New Ticket"
        />
      }
      inset="stack"
      data={isLoading ? [] : tickets}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        showForm && !isLoading
          ? ticketForm
          : justSubmitted
            ? <div style={{ marginBottom: theme.spacing.lg }}><FormSuccessBanner message="Ticket submitted — we'll get back to you soon" /></div>
            : null
      }
      renderItem={(t) => (
        <EntityRow
          title={t.subject}
          subtitle={new Date(t.createdAt).toLocaleDateString()}
          value={t.status.replace('_', ' ')}
          valueColor={t.status === 'open' ? theme.colors.warning : theme.colors.success}
        />
      )}
      ListEmptyComponent={
        isLoading ? (
          <SupportSkeleton />
        ) : showForm ? null : (
          <EmptyState
            title="No tickets"
            subtitle="Need help? Create a support ticket"
            icon="helpCircle"
            action="New Ticket"
            onAction={() => setShowForm(true)}
          />
        )
      }
    />
  );
}
