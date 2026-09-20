'use client';

import { useState } from 'react';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Card, Button, Input, EmptyState, FormErrorBanner, FormSuccessBanner, SectionHeader } from '@/shared/components/ui/index';
import { ActionSheet, type ActionSheetItem } from '@/shared/components/ui/ActionSheet';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { FamilySkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { useAppSelector } from '@/shared/store/hooks';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { formatCurrency } from '@/shared/utils/currency';
import { CONFIRM } from '@/shared/constants/confirmations';
import {
  useCreateFamilyInvite,
  useFamily,
  useFamilyBalances,
  useFamilyMembers,
  useGroupSplits,
  useRemoveMember,
  useSettleSplit,
  useUpdateMemberRole,
} from '@/features/shared/hooks/useFeatures';
import { getApiErrorMessage } from '@/shared/services/api';
import { maxLen, validateInviteCode, validateText } from '@/shared/validation/fieldLimits';
import type { FamilyGroupMember } from '@/shared/types';

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  contributor: 'Contributor',
  read_only: 'Read Only',
};

/** Members list with role-gated remove / promote-demote actions, mirroring
 * backend family.service.ts's exact permission rules (owner: full control
 * over non-self members plus ownership transfer; admin: can remove
 * contributor/read_only only; contributor/read_only: no member management). */
function GroupMembers({ groupId, currentUserRole }: { groupId: string; currentUserRole: string }) {
  const theme = useTheme();
  const currentUser = useAppSelector((s) => s.auth.user);
  const { data: members } = useFamilyMembers(groupId);
  const removeMutation = useRemoveMember(groupId);
  const roleMutation = useUpdateMemberRole(groupId);
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const [sheetTarget, setSheetTarget] = useState<FamilyGroupMember | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!members || members.length === 0) return null;

  const nameFor = (m: FamilyGroupMember) =>
    m.userId === currentUser?.id ? 'You' : (m.user?.name ?? m.user?.email ?? 'Member');

  const canRemove = (target: FamilyGroupMember) => {
    if (target.userId === currentUser?.id) return false;
    if (currentUserRole === 'owner') return true;
    if (currentUserRole === 'admin') return target.role !== 'owner' && target.role !== 'admin';
    return false;
  };

  // Owner can't change their own role directly (backend requires transferring
  // ownership to someone else first) — only offer role changes on other members.
  const canChangeRole = (target: FamilyGroupMember) =>
    currentUserRole === 'owner' && target.userId !== currentUser?.id;

  const buildItems = (target: FamilyGroupMember): ActionSheetItem[] => {
    const items: ActionSheetItem[] = [];
    if (canChangeRole(target)) {
      const roleOptions: Array<{ role: 'admin' | 'contributor' | 'read_only'; label: string }> = [
        { role: 'admin', label: 'Make Admin' },
        { role: 'contributor', label: 'Make Contributor' },
        { role: 'read_only', label: 'Make Read Only' },
      ];
      for (const opt of roleOptions) {
        if (target.role === opt.role) continue;
        items.push({
          id: `role-${opt.role}`,
          label: opt.label,
          icon: 'edit',
          onPress: () => roleMutation.mutate(
            { userId: target.userId, role: opt.role },
            { onError: (err) => setActionError(getApiErrorMessage(err)) }
          ),
        });
      }
      items.push({
        id: 'transfer-owner',
        label: 'Transfer Ownership',
        subtitle: 'You will be demoted to admin',
        icon: 'shield',
        destructive: true,
        onPress: async () => {
          const ok = await confirm(CONFIRM.transferOwnership(nameFor(target)));
          if (ok) {
            roleMutation.mutate(
              { userId: target.userId, role: 'owner' },
              { onError: (err) => setActionError(getApiErrorMessage(err)) }
            );
          }
        },
      });
    }
    if (canRemove(target)) {
      items.push({
        id: 'remove',
        label: 'Remove from Group',
        icon: 'trash',
        destructive: true,
        onPress: async () => {
          const ok = await confirm(CONFIRM.removeMember(nameFor(target)));
          if (ok) {
            removeMutation.mutate(target.userId, {
              onError: (err) => setActionError(getApiErrorMessage(err)),
            });
          }
        },
      });
    }
    return items;
  };

  return (
    <Card>
      <SectionHeader title="Members" />
      {actionError ? <FormErrorBanner message={actionError} /> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        {members.map((m) => {
          const items = buildItems(m);
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: theme.colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nameFor(m)}
                </span>
                <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary }}>
                  {ROLE_LABEL[m.role] ?? m.role}
                </span>
              </div>
              {items.length > 0 ? (
                <button
                  type="button"
                  className="bb-interactive"
                  onClick={() => setSheetTarget(m)}
                  aria-label={`Manage ${nameFor(m)}`}
                  style={{ width: 32, height: 32, borderRadius: theme.radii.md, border: `1px solid ${theme.colors.borderSubtle}`, backgroundColor: theme.colors.surfaceHover, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                  <AppIcon name="more" size={16} color={theme.colors.textSecondary} />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
      <ActionSheet
        visible={sheetTarget != null}
        title={sheetTarget ? nameFor(sheetTarget) : ''}
        items={sheetTarget ? buildItems(sheetTarget) : []}
        onClose={() => setSheetTarget(null)}
      />
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </Card>
  );
}

const INVITE_ROLE_OPTIONS: Array<{ role: 'admin' | 'contributor' | 'read_only'; label: string }> = [
  { role: 'contributor', label: 'Contributor' },
  { role: 'admin', label: 'Admin' },
  { role: 'read_only', label: 'Read Only' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Invite a non-member by email — additive alongside the existing invite-code sharing UI,
 * for invitees who don't have an account yet. Owner/admin only, matching backend's
 * assertCanInvite() permission rule. */
function InviteByEmailForm({ groupId, currentUserRole }: { groupId: string; currentUserRole: string }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'contributor' | 'read_only'>('contributor');
  const [emailError, setEmailError] = useState<string>();
  const inviteMutation = useCreateFamilyInvite(groupId);

  if (currentUserRole !== 'owner' && currentUserRole !== 'admin') return null;

  const reset = () => {
    setOpen(false);
    setEmail('');
    setRole('contributor');
    setEmailError(undefined);
    inviteMutation.reset();
  };

  const handleInvite = () => {
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError(undefined);
    inviteMutation.mutate({ invitedEmail: trimmed, role });
  };

  if (!open) {
    return (
      <Button title="Invite by Email" onPress={() => setOpen(true)} variant="outline" />
    );
  }

  return (
    <Card variant="elevated">
      <SectionHeader title="Invite by Email" subtitle="Sends a signed link — works even if they don't have an account yet" />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setEmailError(undefined); }}
        placeholder="name@example.com"
        disabled={inviteMutation.isPending}
        error={emailError}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: theme.colors.textSecondary }}>
          Role
        </span>
        <div style={{ display: 'flex', gap: theme.spacing.xs }}>
          {INVITE_ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.role}
              type="button"
              className="bb-interactive"
              onClick={() => setRole(opt.role)}
              disabled={inviteMutation.isPending}
              style={{
                padding: '6px 12px',
                borderRadius: theme.radii.lg,
                border: `1px solid ${role === opt.role ? theme.colors.primary : theme.colors.borderSubtle}`,
                backgroundColor: role === opt.role ? theme.colors.primarySoft : theme.colors.surface,
                color: role === opt.role ? theme.colors.primary : theme.colors.textSecondary,
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {inviteMutation.isError ? (
        <FormErrorBanner message={getApiErrorMessage(inviteMutation.error, 'Could not send invite')} />
      ) : null}
      {inviteMutation.isSuccess ? (
        <FormSuccessBanner message={`Invite sent to ${inviteMutation.data?.invitedEmail}`} />
      ) : null}
      <div style={{ display: 'flex', gap: theme.spacing.sm }}>
        <Button title="Send Invite" onPress={handleInvite} loading={inviteMutation.isPending} />
        <Button title="Cancel" onPress={reset} variant="outline" disabled={inviteMutation.isPending} />
      </div>
    </Card>
  );
}

function GroupBalances({ groupId, userRole }: { groupId: string; userRole: string }) {
  const theme = useTheme();
  const currentUser = useAppSelector((s) => s.auth.user);
  const { data: balances } = useFamilyBalances(groupId);
  const { data: members } = useFamilyMembers(groupId);
  const { data: pendingSplits } = useGroupSplits(groupId);
  const settleMutation = useSettleSplit();
  // Read-only members can't settle splits (backend family.service.ts's
  // settleSplit rejects role === 'read_only') — hide the action rather than
  // let them tap it and get a 403 with no client-side warning.
  const canSettle = userRole !== 'read_only';

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
              {canSettle ? (
                <button
                  type="button"
                  className="bb-interactive"
                  onClick={() => settleMutation.mutate(split.id)}
                  disabled={settleMutation.isPending}
                  style={{ padding: '5px 12px', borderRadius: theme.radii.lg, backgroundColor: theme.colors.successSoft, color: theme.colors.success, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif', flexShrink: 0 }}
                >
                  Settle
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

export function FamilyPage() {
  const theme = useTheme();
  const { memberships, isLoading, createMutation, joinMutation, error, setError, showCreateSuccess, showJoinSuccess } = useFamily();
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
            <Card><span style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.bodySemibold.fontSize, fontWeight: Number(theme.typography.bodySemibold.fontWeight), color: theme.colors.text }}>{m.group?.name ?? 'Group'}</span><span style={{ display: 'block', fontSize: theme.typography.caption.fontSize, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>Role: {ROLE_LABEL[m.role] ?? m.role} · Code: {m.group?.inviteCode ?? '-'}</span></Card>
            <GroupMembers groupId={m.groupId} currentUserRole={m.role} />
            <InviteByEmailForm groupId={m.groupId} currentUserRole={m.role} />
            <GroupBalances groupId={m.groupId} userRole={m.role} />
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
          {showCreateSuccess ? <FormSuccessBanner message="Group created" /> : null}
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
          {showJoinSuccess ? <FormSuccessBanner message="Joined group" /> : null}
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
