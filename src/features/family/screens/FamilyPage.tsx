import { useState } from 'react';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Card, Button, Input, EmptyState, FormErrorBanner } from '@/shared/components/ui/index';
import { FamilySkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { useFamily } from '@/features/shared/hooks/useFeatures';
import { maxLen, validateInviteCode, validateText } from '@/shared/validation/fieldLimits';

export function FamilyPage() {
  const theme = useTheme();
  const { memberships, isLoading, createMutation, joinMutation, error, setError } = useFamily();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [groupNameError, setGroupNameError] = useState<string>();
  const [inviteCodeError, setInviteCodeError] = useState<string>();

  const handleCreate = () => {
    setError(null);
    const nameErr = validateText('entityName', groupName);
    if (nameErr) {
      setGroupNameError(nameErr);
      return;
    }
    setGroupNameError(undefined);
    createMutation.mutate({ name: groupName });
  };

  const handleJoin = () => {
    setError(null);
    const codeErr = validateInviteCode(inviteCode);
    if (codeErr) {
      setInviteCodeError(codeErr);
      return;
    }
    setInviteCodeError(undefined);
    joinMutation.mutate({ inviteCode });
  };

  return (
    <ScreenWrapper header={<ProfileStackHeader screen="family" subtitle="Manage expenses together" />} inset="stack">
      {isLoading ? (
        <FamilySkeleton />
      ) : memberships.length > 0 ? (
        memberships.map((m) => (
          <Card key={m.id} variant="elevated"><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{m.group?.name ?? 'Group'}</span><span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>Role: {m.role} · Code: {m.group?.inviteCode ?? '-'}</span></Card>
        ))
      ) : (
        <EmptyState
          title="No family groups"
          subtitle="Create or join a group to share expenses together"
          icon="users"
          action="Create Group"
          onAction={() => { setShowCreate(true); setError(null); }}
        />
      )}
      {!isLoading && showCreate && (
        <Card variant="elevated">
          <Input
            label="Group Name"
            value={groupName}
            onChange={(e) => { setGroupName(e.target.value); setGroupNameError(undefined); }}
            placeholder="e.g. Family Budget"
            maxLength={maxLen('entityName')}
            disabled={createMutation.isPending}
            error={groupNameError}
          />
          {error ? <FormErrorBanner message={error} /> : null}
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <Button title="Create" onPress={handleCreate} loading={createMutation.isPending} />
            <Button title="Cancel" onPress={() => { setShowCreate(false); setError(null); setGroupNameError(undefined); }} variant="outline" disabled={createMutation.isPending} />
          </div>
        </Card>
      )}
      {!isLoading && showJoin && (
        <Card variant="elevated">
          <Input
            label="Invite Code"
            value={inviteCode}
            onChange={(e) => { setInviteCode(e.target.value); setInviteCodeError(undefined); }}
            placeholder="Enter invite code"
            maxLength={maxLen('inviteCode')}
            disabled={joinMutation.isPending}
            error={inviteCodeError}
          />
          {error ? <FormErrorBanner message={error} /> : null}
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <Button title="Join" onPress={handleJoin} loading={joinMutation.isPending} />
            <Button title="Cancel" onPress={() => { setShowJoin(false); setError(null); setInviteCodeError(undefined); }} variant="outline" disabled={joinMutation.isPending} />
          </div>
        </Card>
      )}
      {!isLoading && !showCreate && !showJoin && (
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          {memberships.length > 0 && (
            <Button title="Create Group" onPress={() => { setShowCreate(true); setError(null); }} variant="outline" />
          )}
          <Button title="Join Group" onPress={() => { setShowJoin(true); setError(null); }} variant="secondary" />
        </div>
      )}
    </ScreenWrapper>
  );
}
