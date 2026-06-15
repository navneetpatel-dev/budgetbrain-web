import { useState } from 'react';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Card, Button, Input, EmptyState } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useFamily } from '@/features/shared/hooks/useFeatures';

export function FamilyPage() {
  const theme = useTheme();
  const { memberships, createMutation, joinMutation, error, setError } = useFamily();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  return (
    <ScreenWrapper header={<ProfileStackHeader screen="family" subtitle="Manage expenses together" />} inset="stack">
      {memberships.length > 0 ? memberships.map((m) => (
        <Card key={m.id} variant="elevated"><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{m.group?.name ?? 'Group'}</span><span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>Role: {m.role} · Code: {m.group?.inviteCode ?? '-'}</span></Card>
      )) : <EmptyState title="No family groups" subtitle="Create or join a group to share expenses" icon="users" />}
      {showCreate && (
        <Card variant="elevated">
          <Input label="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Family Budget" />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif', marginBottom: theme.spacing.md }}>{error}</p>}
          <div style={{ display: 'flex', gap: theme.spacing.sm }}><Button title="Create" onPress={() => createMutation.mutate({ name: groupName })} loading={createMutation.isPending} /><Button title="Cancel" onPress={() => { setShowCreate(false); setError(null); }} variant="outline" /></div>
        </Card>
      )}
      {showJoin && (
        <Card variant="elevated">
          <Input label="Invite Code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Enter invite code" />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif', marginBottom: theme.spacing.md }}>{error}</p>}
          <div style={{ display: 'flex', gap: theme.spacing.sm }}><Button title="Join" onPress={() => joinMutation.mutate({ inviteCode })} loading={joinMutation.isPending} /><Button title="Cancel" onPress={() => { setShowJoin(false); setError(null); }} variant="outline" /></div>
        </Card>
      )}
      <div style={{ display: 'flex', gap: theme.spacing.sm }}>
        {!showCreate && <Button title="Create Group" onPress={() => { setShowCreate(true); setError(null); }} variant="outline" />}
        {!showJoin && <Button title="Join Group" onPress={() => { setShowJoin(true); setError(null); }} variant="secondary" />}
      </div>
    </ScreenWrapper>
  );
}
