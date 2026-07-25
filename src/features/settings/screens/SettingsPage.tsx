import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Button, Input, GroupedCard, ListRow, FormActions, FormErrorBanner } from '@/shared/components/ui/index';
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
import { apiGet } from '@/shared/services/api';
import { SUBSCRIPTION_PLANS, SUPPORTED_CURRENCIES } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { ProfileHero } from '../components/ProfileHero';
import { PremiumUpsellCard } from '../components/PremiumUpsellCard';
import { ThemePicker } from '../components/ThemePicker';
import { SecurityPreferencesSection } from '../components/SecurityPreferencesSection';
import { PROFILE_FEATURE_LINKS, PROFILE_ACCOUNT_LINKS } from '../constants/profileLinks';

export function SettingsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { signOut } = useSignOut();
  const { deleteAccount, loading: deleteLoading } = useDeleteAccount();
  const { save: saveProfile, loading: profileLoading, submitError: profileError, clearSubmitError } = useEditProfile();
  const [editingProfile, setEditingProfile] = useState(false);
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

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiGet<{ role: string; plans: typeof SUBSCRIPTION_PLANS }>('/subscriptions/status'),
    enabled: !!user,
  });

  if (!user) return <SettingsSkeleton />;

  const isPremium = ['premium', 'lifetime', 'admin'].includes(user.role ?? '');

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
    if (ok) setEditingProfile(false);
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
        {!isPremium && <PremiumUpsellCard />}

        <GroupedCard title="Features">
          {PROFILE_FEATURE_LINKS.map((link, i) => (
            <ListRow
              key={link.href}
              icon={link.icon}
              label={link.label}
              onPress={() => navigate(link.href)}
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
              onPress={() => navigate(link.href)}
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
              <ListRow icon="wallet" label="Currency" value={user.currency ?? 'INR'} />
              <ListRow icon="profile" label="Country" value={user.country ?? '—'} />
              <ListRow icon="chart" label="Plan" value={subscription?.role ?? user.role ?? 'free'} isLast />
            </>
          ) : (
            <FormSection title="Edit profile" style={{ margin: theme.spacing.lg, marginTop: 0 }}>
              {profileError ? <FormErrorBanner message={profileError} /> : null}
              <Controller
                control={control}
                name="name"
                rules={{ required: 'Name is required', maxLength: { value: 255, message: 'Name must be at most 255 characters' } }}
                render={({ field: { onChange, value } }) => (
                  <Input label="Name" value={value} onChange={(e) => onChange(e.target.value)} maxLength={255} error={errors.name?.message} leftIcon="personFill" disabled={profileLoading} />
                )}
              />
              <Controller
                control={control}
                name="country"
                rules={{ required: 'Country is required', maxLength: { value: 100, message: 'Country must be at most 100 characters' } }}
                render={({ field: { onChange, value } }) => (
                  <Input label="Country" value={value} onChange={(e) => onChange(e.target.value)} maxLength={100} error={errors.country?.message} disabled={profileLoading} />
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
          <Button title="Sign out" onPress={() => openConfirm(CONFIRM.signOut, signOut)} variant="outline" />
          <Button title="Delete account" onPress={() => openConfirm(CONFIRM.deleteAccount, deleteAccount)} variant="danger" loading={deleteLoading} />
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
