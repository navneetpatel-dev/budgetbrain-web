import type { CSSProperties } from 'react';
import { Controller } from 'react-hook-form';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ActionFab, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { Input, Button, EmptyState, FormErrorBanner, FormActions } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { ColorPicker } from '@/shared/components/ui/forms';
import { useCategories, COLORS_PRESET } from '@/features/categories/hooks/useCategories';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { maxLen, textRules } from '@/shared/validation/fieldLimits';

export function CategoriesPage() {
  const theme = useTheme();
  const {
    categories,
    isLoading,
    editingId,
    showForm,
    setShowForm,
    loading,
    submitError,
    listError,
    control,
    handleSubmit,
    setValue,
    errors,
    selectedColor,
    openCreate,
    openEdit,
    onSubmit,
    archiveCategory,
    moveCategory,
  } = useCategories();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();

  const handleArchive = async (id: string, name: string) => {
    if (await confirm(CONFIRM.archiveCategory(name))) await archiveCategory(id);
  };

  const items = categories ?? [];

  return (
    <>
      <div style={{ height: '100%', position: 'relative' }}>
        <StickyHeaderFlatScreen
          header={
            <ProfileStackHeader
              screen="categories"
              subtitle={isLoading ? 'Loading…' : `${items.length} categor${items.length !== 1 ? 'ies' : 'y'}`}
            />
          }
          inset="stack"
          data={isLoading ? [] : items}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listError ? <FormErrorBanner message={listError} /> : undefined}
          renderItem={(cat, index) => (
            <div style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.lg,
              border: `1px solid ${theme.colors.borderSubtle}`,
              padding: theme.spacing.lg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: theme.shadows.sm,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  backgroundColor: cat.color || theme.colors.primary,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600,
                  color: theme.colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{cat.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button type="button" onClick={() => { void moveCategory(index, -1); }} style={actionStyle(theme.colors.primary)}>↑</button>
                <button type="button" onClick={() => { void moveCategory(index, 1); }} style={actionStyle(theme.colors.primary)}>↓</button>
                <button type="button" onClick={() => openEdit(cat)} style={actionStyle(theme.colors.primary)}>Edit</button>
                {!cat.isDefault && (
                  <button type="button" onClick={() => { void handleArchive(cat.id, cat.name); }} style={actionStyle(theme.colors.danger)}>Archive</button>
                )}
              </div>
            </div>
          )}
          ListEmptyComponent={
            isLoading ? (
              <ListRowsSkeleton count={5} variant="category" />
            ) : (
              <EmptyState
                title="No categories"
                subtitle="Create categories to organize expenses"
                icon="category"
                action="Add category"
                onAction={openCreate}
              />
            )
          }
        />
        {showForm && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: theme.colors.overlay, padding: 24,
          }}>
            <div style={{
              backgroundColor: theme.colors.surface, borderRadius: theme.radii.xl,
              padding: theme.spacing.xl, maxWidth: 420, width: '100%', boxShadow: theme.shadows.lg,
            }}>
              <h3 style={{
                fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700,
                color: theme.colors.text, margin: '0 0 4px 0',
              }}>{editingId ? 'Edit Category' : 'New Category'}</h3>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 13, color: theme.colors.textSecondary,
                margin: '0 0 16px 0',
              }}>Pick a name and color</p>
              {submitError ? <FormErrorBanner message={submitError} /> : null}
              <Controller
                control={control}
                name="name"
                rules={textRules('categoryName')}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Category name"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={100}
                    error={errors.name?.message}
                    placeholder="e.g. Food, Travel"
                    disabled={loading}
                    autoFocus
                  />
                )}
              />
              <div style={{ marginBottom: theme.spacing.lg }}>
                <span style={{
                  fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary,
                  marginBottom: 8, display: 'block', fontFamily: 'Inter, sans-serif',
                }}>Color</span>
                <ColorPicker
                  value={selectedColor}
                  options={COLORS_PRESET.map((c) => ({ id: c, swatch: c }))}
                  onChange={(c) => setValue('color', c)}
                  disabled={loading}
                />
              </div>
              <FormActions
                primaryTitle={editingId ? 'Update' : 'Create'}
                onPrimary={handleSubmit(onSubmit)}
                primaryLoading={loading}
                secondaryTitle="Cancel"
                onSecondary={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
        {!showForm && <ActionFab onPress={openCreate} label="Add category" />}
      </div>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}

function actionStyle(color: string): CSSProperties {
  return {
    fontSize: 13,
    fontWeight: 600,
    color,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    padding: '4px 2px',
  };
}
