import { useEffect, useState } from 'react';
import { Toggle } from '@/shared/components/ui/index';
import { MultiOptionChips, SheetSelect } from '@/shared/components/ui/feature-screen';
import { useTheme } from '@/shared/theme';
import { useAppSelector } from '@/shared/store/hooks';
import { formatCurrency } from '@/shared/utils/currency';
import { useFamily, useFamilyMembers } from '@/shared/hooks';

export interface SplitPayload {
  groupId: string;
  participants: { userId: string; shareAmount: number }[];
}

/** Only rendered when the user belongs to at least one family group. */
export function SplitWithFamilyField({
  amount,
  onSplitChange,
  disabled,
}: {
  amount: number;
  onSplitChange: (split: SplitPayload | null) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const currentUser = useAppSelector((s) => s.auth.user);
  const { memberships } = useFamily();
  const [enabled, setEnabled] = useState(false);
  const [groupId, setGroupId] = useState('');
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const { data: members } = useFamilyMembers(groupId || undefined);

  // Read-only members can't create splits (backend family.service.ts's
  // createSplit rejects role === 'read_only') — only offer groups where the
  // current user has a role that's actually allowed to split.
  const splittableMemberships = memberships.filter((m) => m.role !== 'read_only');

  useEffect(() => {
    if (splittableMemberships.length > 0 && !groupId) setGroupId(splittableMemberships[0].groupId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splittableMemberships.map((m) => m.groupId).join(','), groupId]);

  const otherMembers = (members ?? []).filter((m) => m.userId !== currentUser?.id);
  const selectedMembers = otherMembers.filter((m) => !excludedIds.includes(m.userId));
  const totalPeople = selectedMembers.length + 1;
  // Not a money-math gap: the split-create API (backend family.service.ts)
  // is designed to take an explicit, arbitrary shareAmount per participant
  // (it validates the submitted amounts, it doesn't compute an equal split
  // itself) — this is proposing a default equal-split value for the user to
  // review/edit, not re-deriving a total the API should already return.
  // eslint-disable-next-line no-restricted-syntax
  const shareAmount = totalPeople > 0 && amount > 0 ? Math.round((amount / totalPeople) * 100) / 100 : 0;

  useEffect(() => {
    if (!enabled || !groupId || selectedMembers.length === 0 || amount <= 0) {
      onSplitChange(null);
      return;
    }
    onSplitChange({
      groupId,
      participants: selectedMembers.map((m) => ({ userId: m.userId, shareAmount })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, groupId, amount, shareAmount, excludedIds.join(',')]);

  if (splittableMemberships.length === 0) return null;

  return (
    <div style={{ marginBottom: theme.spacing.lg }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: enabled ? theme.spacing.sm : 0 }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: theme.colors.text }}>Split with family</span>
        <Toggle value={enabled} onChange={setEnabled} disabled={disabled} label="Split with family" />
      </div>
      {enabled ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          {splittableMemberships.length > 1 ? (
            <SheetSelect
              value={groupId}
              options={splittableMemberships.map((m) => m.groupId)}
              onChange={setGroupId}
              getLabel={(id) => splittableMemberships.find((m) => m.groupId === id)?.group?.name ?? 'Group'}
              placeholder="Choose group"
              disabled={disabled}
            />
          ) : null}
          {otherMembers.length > 0 ? (
            <MultiOptionChips
              options={otherMembers.map((m) => m.userId)}
              selected={selectedMembers.map((m) => m.userId)}
              onToggle={(id) =>
                setExcludedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
              }
              getLabel={(id) => otherMembers.find((m) => m.userId === id)?.user?.name ?? otherMembers.find((m) => m.userId === id)?.user?.email ?? 'Member'}
              disabled={disabled}
            />
          ) : (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: theme.colors.textTertiary }}>No other members in this group yet.</span>
          )}
          {selectedMembers.length > 0 && amount > 0 ? (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: theme.colors.textSecondary }}>
              {formatCurrency(shareAmount, currentUser?.currency ?? 'INR')} each, split {totalPeople} ways
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
