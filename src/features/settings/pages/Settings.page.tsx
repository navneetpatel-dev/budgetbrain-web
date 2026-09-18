'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Button, Input, GroupedCard, ListRow, FormActions, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { FormSection, FormFieldLabel } from '@/shared/components/ui/forms';
import { OptionChips } from '@/shared/components/ui/feature-screen';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { SettingsSkeleton } from '@/shared/components/ui/skeleton';
import { useAppSelector } from '@/shared/store/hooks';
import { useSyncedPreferences } from '@/features/settings/hooks/useSyncedPreferences';
import { useSignOut } from '@/features/auth/hooks/useAuthHooks';
import { useDeleteAccount } from '@/features/settings/hooks/useDeleteAccount';
import { useEditProfile, type ProfileForm } from '@/features/settings/hooks/useEditProfile';
import { CONFIRM, type ConfirmCopy } from '@/shared/constants/confirmations';
import { SUPPORTED_CURRENCIES } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { ProfileHero } from '../components/ProfileHero';
import { ThemePicker } from '../components/ThemePicker';
import { SecurityPreferencesSection } from '../components/SecurityPreferencesSection';
import { PROFILE_FEATURE_LINKS, PROFILE_ACCOUNT_LINKS } from '../constants/profileLinks';
import { maxLen, textRules } from '@/shared/validation/fieldLimits';

export function SettingsPage() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut } = useSignOut();
  const { deleteAccount, loading: deleteLoading } = useDeleteAccount();
  const { save: saveProfile, loading: profileLoading, submitError: profileError, clearSubmitError } = useEditProfile();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [confirmCopy, setConfirmCopy] = useState<ConfirmCopy | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const { theme: themeMode, accent, setThemeMode, setAccentPalette } = useSyncedPreferences();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: { name: user?.name ?? '', country: user?.country ?? '', currency: user?.currency ?? 'INR' },
  });

  useEffect(() => {
    reset({ name: user?.name ?? '', country: user?.country ?? '', currency: user?.currency ?? 'INR' });
  }, [user, reset]);

  if (!user) {
    return (
      <ScreenWrapper inset="tab">
        <SettingsSkeleton />
      </ScreenWrapper>
    );
  }

  const openConfirm = (copy: ConfirmCopy, action: () => Promise<void>) => {
    setConfirmCopy(copy);
    setConfirmAction(() => action);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setConfirmLoading(true);
    try {
      await confirmAction();
      setConfirmCopy(null);
      setConfirmAction(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  const closeConfirm = () => {
    setConfirmCopy(null);
    setConfirmAction(null);
  };

  const onSaveProfile = async (data: ProfileForm) => {
    const ok = await saveProfile(data);
    if (ok) {
      setEditingProfile(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
  };

  return (
    <>
      <ScreenWrapper
        header={
          <ProfileHero
            name={user.name ?? 'User'}
            email={user.email}
            role={user.role}
            currency={user.currency}
          />
        }
        inset="tab"
      >
        <GroupedCard title="Features">
          {PROFILE_FEATURE_LINKS.map((link, i) => (
            <ListRow
              key={link.href}
              icon={link.icon}
              label={link.label}
              onPress={() => router.push(link.href)}
              isLast={i === PROFILE_FEATURE_LINKS.length - 1}
            />
          ))}
        </GroupedCard>

        <GroupedCard title="Account">
          {PROFILE_ACCOUNT_LINKS.map((link, i) => (
            <ListRow
              key={link.href}
              icon={link.icon}
              label={link.label}
              onPress={() => router.push(link.href)}
              isLast={i === PROFILE_ACCOUNT_LINKS.length - 1}
            />
          ))}
        </GroupedCard>

        <GroupedCard title="Appearance">
          <div style={{ padding: theme.spacing.lg }}>
            <ThemePicker
              mode={themeMode}
              accent={accent}
              onModeChange={setThemeMode}
              onAccentChange={setAccentPalette}
            />
          </div>
        </GroupedCard>

        <GroupedCard title="Security & preferences">
          <SecurityPreferencesSection />
        </GroupedCard>

        <GroupedCard title="Profile">
          <ListRow
            icon="profile"
            label={editingProfile ? 'Cancel editing' : 'Edit profile'}
            onPress={() => {
              if (editingProfile) clearSubmitError();
              setEditingProfile(!editingProfile);
            }}
            isLast={false}
          />
          {!editingProfile ? (
            <>
              {profileSaved ? (
                <div style={{ padding: theme.spacing.lg, paddingBottom: 0 }}>
                  <FormSuccessBanner message="Profile updated" />
                </div>
              ) : null}
              <ListRow icon="wallet" label="Currency" value={user.currency ?? 'INR'} />
              <ListRow icon="profile" label="Country" value={user.country ?? '—'} isLast />
            </>
          ) : (
            <FormSection title="Edit profile" style={{ margin: theme.spacing.lg, marginTop: 0 }}>
              {profileError ? <FormErrorBanner message={profileError} /> : null}
              <Controller
                control={control}
                name="name"
                rules={textRules('name')}
                render={({ field: { onChange, value } }) => (
                  <Input label="Name" value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLen('name')} error={errors.name?.message} leftIcon="personFill" disabled={profileLoading} />
                )}
              />
              <Controller
                control={control}
                name="country"
                rules={textRules('country')}
                render={({ field: { onChange, value } }) => (
                  <Input label="Country" value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLen('country')} error={errors.country?.message} disabled={profileLoading} />
                )}
              />
              <FormFieldLabel>Currency</FormFieldLabel>
              <Controller control={control} name="currency" render={({ field: { onChange, value } }) => (
                <OptionChips
                  options={[...SUPPORTED_CURRENCIES]}
                  value={value}
                  onChange={onChange}
                  disabled={profileLoading}
                />
              )} />
              <FormActions
                primaryTitle="Save profile"
                onPrimary={handleSubmit(onSaveProfile)}
                primaryLoading={profileLoading}
                secondaryTitle="Cancel"
                onSecondary={() => setEditingProfile(false)}
              />
            </FormSection>
          )}
        </GroupedCard>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
          <Button title="Sign out" onPress={() => openConfirm(CONFIRM.signOut, signOut)} variant="outline" style={{ minWidth: 160 }} />
          <Button title="Delete account" onPress={() => openConfirm(CONFIRM.deleteAccount, deleteAccount)} variant="dangerGhost" loading={deleteLoading} />
        </div>
      </ScreenWrapper>
      <ConfirmDialog
        open={confirmCopy != null}
        copy={confirmCopy}
        loading={confirmLoading || deleteLoading}
        onCancel={closeConfirm}
        onConfirm={() => { void handleConfirm(); }}
      />
    </>
  );
}
