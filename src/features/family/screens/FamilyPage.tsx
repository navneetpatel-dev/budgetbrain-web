import { useState } from 'react';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Card, Button, Input, EmptyState, FormErrorBanner, SectionHeader } from '@/shared/components/ui/index';
import { FamilySkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { useAppSelector } from '@/shared/store/hooks';
import { formatCurrency } from '@/shared/utils/currency';
import {
  useFamily,
  useFamilyBalances,
  useFamilyMembers,
  useGroupSplits,
  useSettleSplit,
} from '@/features/shared/hooks/useFeatures';
import { maxLen, validateInviteCode, validateText } from '@/shared/validation/fieldLimits';

function GroupBalances({ groupId }: { groupId: string }) {
  const theme = useTheme();
  const currentUser = useAppSelector((s) => s.auth.user);
  const { data: balances } = useFamilyBalances(groupId);
  const { data: members } = useFamilyMembers(groupId);
  const { data: pendingSplits } = useGroupSplits(groupId);
  const settleMutation = useSettleSplit();

  const nameFor = (userId: string) => {
    if (userId === currentUser?.id) return 'You';
    const member = members?.find((m) => m.userId === userId);
    return member?.user?.name ?? member?.user?.email ?? 'Member';
  };

  if (!balances || balances.length === 0) return null;

  return (
    <Card>
      <SectionHeader title="Balances" subtitle="Who owes whom for shared expenses" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        {balances.map((b) => (
          <div key={`${b.fromUserId}-${b.toUserId}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.sm }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: theme.colors.text }}>
              {nameFor(b.fromUserId)} owes {nameFor(b.toUserId)}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: theme.colors.primary }}>
              {formatCurrency(b.amount, currentUser?.currency ?? 'INR')}
            </span>
          </div>
        ))}
      </div>
      {pendingSplits && pendingSplits.length > 0 ? (
        <div style={{ marginTop: theme.spacing.md, paddingTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.borderSubtle}`, display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          {pendingSplits.map((split) => (
            <div key={split.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.sm }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: theme.colors.textSecondary, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {split.transaction?.merchant ?? 'Expense'} — {nameFor(split.userId)}'s share: {formatCurrency(split.shareAmount, currentUser?.currency ?? 'INR')}
              </span>
              <button
                onClick={() => settleMutation.mutate(split.id)}
                disabled={settleMutation.isPending}
                style={{ padding: '5px 12px', borderRadius: theme.radii.lg, backgroundColor: theme.colors.successSoft, color: theme.colors.success, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif', flexShrink: 0 }}
              >
                Settle
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

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
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            <Card><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{m.group?.name ?? 'Group'}</span><span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>Role: {m.role} · Code: {m.group?.inviteCode ?? '-'}</span></Card>
            <GroupBalances groupId={m.groupId} />
          </div>
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
