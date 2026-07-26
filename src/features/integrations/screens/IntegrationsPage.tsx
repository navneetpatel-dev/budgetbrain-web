import { useState } from 'react';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { SheetSelect, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState, FormErrorBanner, Input, Button } from '@/shared/components/ui/index';
import { EntityRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useIntegrations } from '@/features/shared/hooks/useFeatures';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { maxLen, validateText, ValidationMessages } from '@/shared/validation/fieldLimits';

type ParseErrors = { content?: string; subject?: string; body?: string };

export function IntegrationsPage() {
  const theme = useTheme();
  const {
    pending,
    isLoading,
    parseSmsMutation,
    parseEmailMutation,
    confirmMutation,
    rejectMutation,
    error,
    setError,
  } = useIntegrations();
  const { categories } = useCategories();
  const [categoryById, setCategoryById] = useState<Record<string, string>>({});
  const [categoryErrorById, setCategoryErrorById] = useState<Record<string, string | undefined>>({});
  const [smsContent, setSmsContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [parseErrors, setParseErrors] = useState<ParseErrors>({});

  const handleParseSms = () => {
    setError(null);
    const contentErr = validateText('smsContent', smsContent);
    setParseErrors({ content: contentErr });
    if (contentErr) return;
    parseSmsMutation.mutate(
      { content: smsContent },
      { onSuccess: () => { setSmsContent(''); setParseErrors({}); } }
    );
  };

  const handleParseEmail = () => {
    setError(null);
    const subjectErr = validateText('emailSubject', emailSubject);
    const bodyErr = validateText('emailBody', emailBody);
    setParseErrors({ subject: subjectErr, body: bodyErr });
    if (subjectErr || bodyErr) return;
    parseEmailMutation.mutate(
      { subject: emailSubject, body: emailBody },
      { onSuccess: () => { setEmailSubject(''); setEmailBody(''); setParseErrors({}); } }
    );
  };

  return (
    <StickyHeaderFlatScreen
      header={<ProfileStackHeader screen="integrations" subtitle="SMS & Email parsing" />}
      inset="stack"
      data={isLoading ? [] : pending}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
          {error ? <FormErrorBanner message={error} /> : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>Parse SMS</span>
            <Input
              label="SMS content"
              value={smsContent}
              onChange={(e) => setSmsContent(e.target.value)}
              maxLength={maxLen('smsContent')}
              multiline
              error={parseErrors.content}
              disabled={parseSmsMutation.isPending}
            />
            <Button title="Parse SMS" onPress={handleParseSms} loading={parseSmsMutation.isPending} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>Parse email</span>
            <Input
              label="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              maxLength={maxLen('emailSubject')}
              error={parseErrors.subject}
              disabled={parseEmailMutation.isPending}
            />
            <Input
              label="Body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              maxLength={maxLen('emailBody')}
              multiline
              error={parseErrors.body}
              disabled={parseEmailMutation.isPending}
            />
            <Button title="Parse Email" onPress={handleParseEmail} loading={parseEmailMutation.isPending} />
          </div>
        </div>
      }
      renderItem={(item) => (
        <EntityRow
          title={item.parsedMerchant ?? 'Unknown'}
          subtitle={item.source}
          value={formatCurrency(Number(item.parsedAmount) || 0)}
          valueColor={theme.colors.danger}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginTop: theme.spacing.md }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <SheetSelect
                compact
                value={categoryById[item.id] ?? ''}
                options={(categories ?? []).map((c) => c.id)}
                onChange={(id) => {
                  setCategoryById((prev) => ({ ...prev, [item.id]: id }));
                  setCategoryErrorById((prev) => ({ ...prev, [item.id]: undefined }));
                }}
                getLabel={(id) => (categories ?? []).find((c) => c.id === id)?.name ?? id}
                getColor={(id) => (categories ?? []).find((c) => c.id === id)?.color ?? undefined}
                title="Choose category"
                placeholder="Choose"
                error={categoryErrorById[item.id]}
              />
              <button
                onClick={() => {
                  const categoryId = categoryById[item.id];
                  if (!categoryId) {
                    setCategoryErrorById((prev) => ({ ...prev, [item.id]: ValidationMessages.categoryRequired }));
                    return;
                  }
                  setCategoryErrorById((prev) => ({ ...prev, [item.id]: undefined }));
                  setError(null);
                  confirmMutation.mutate({ id: item.id, categoryId });
                }}
                style={{ padding: '6px 14px', borderRadius: theme.radii.lg, backgroundColor: theme.colors.successSoft, color: theme.colors.success, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: theme.typography.caption.fontFamily ?? 'Inter' }}
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setCategoryErrorById((prev) => ({ ...prev, [item.id]: undefined }));
                  rejectMutation.mutate(item.id);
                }}
                style={{ padding: '6px 14px', borderRadius: theme.radii.lg, backgroundColor: theme.colors.dangerSoft, color: theme.colors.danger, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: theme.typography.caption.fontFamily ?? 'Inter' }}
              >
                Reject
              </button>
            </div>
          </div>
        </EntityRow>
      )}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={4} variant="transaction" />
        ) : (
          <EmptyState title="No pending items" subtitle="Parsed SMS and email receipts appear here" icon="globe" />
        )
      }
    />
  );
}
