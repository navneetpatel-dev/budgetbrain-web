'use client';

import type { CSSProperties } from 'react';
import { useRef } from 'react';
import { Controller } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { ActionFab, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { Input, EmptyState, FormErrorBanner, FormActions } from '@/shared/components/ui/index';
import { EntityRow } from '@/shared/components/ui/list-rows';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';
import { ColorPicker, FormFieldLabel } from '@/shared/components/ui/forms';
import { useCategories, COLORS_PRESET } from '@/features/categories/hooks/useCategories';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
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
  const formDialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(showForm, formDialogRef, () => setShowForm(false));

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
            <EntityRow
              title={cat.name}
              accentColor={cat.color || theme.colors.primary}
              trailing={
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button type="button" className="bb-interactive" aria-label="Move up" onClick={() => { void moveCategory(index, -1); }} style={iconActionStyle(theme)}>
                    <AppIcon name="arrowUp" size={16} color={theme.colors.primary} />
                  </button>
                  <button type="button" className="bb-interactive" aria-label="Move down" onClick={() => { void moveCategory(index, 1); }} style={iconActionStyle(theme)}>
                    <AppIcon name="arrowDown" size={16} color={theme.colors.primary} />
                  </button>
                  <button type="button" className="bb-interactive" aria-label="Edit" onClick={() => openEdit(cat)} style={iconActionStyle(theme)}>
                    <AppIcon name="edit" size={16} color={theme.colors.primary} />
                  </button>
                  {!cat.isDefault && (
                    <button type="button" className="bb-interactive" aria-label="Archive" onClick={() => { void handleArchive(cat.id, cat.name); }} style={iconActionStyle(theme)}>
                      <AppIcon name="trash" size={16} color={theme.colors.danger} />
                    </button>
                  )}
                </div>
              }
            />
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
        <AnimatePresence>
        {showForm && (
          <motion.div
            role="presentation"
            onClick={() => setShowForm(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: theme.motion.duration.base / 1000, ease: theme.motion.easing }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: theme.colors.overlay, padding: 24,
            }}>
            <motion.div
              ref={formDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="category-form-title"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: theme.motion.duration.base / 1000, ease: theme.motion.easing }}
              style={{
                backgroundColor: theme.colors.surface, borderRadius: theme.radii.xl,
                padding: theme.spacing.xl, maxWidth: 420, width: '100%', boxShadow: theme.shadows.lg,
              }}>
              <h3
                id="category-form-title"
                style={{
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
                    maxLength={maxLen('categoryName')}
                    error={errors.name?.message}
                    placeholder="e.g. Food, Travel"
                    disabled={loading}
                    autoFocus
                  />
                )}
              />
              <div style={{ marginBottom: theme.spacing.lg }}>
                <FormFieldLabel>Color</FormFieldLabel>
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
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
        {!showForm && <ActionFab onPress={openCreate} label="Add category" />}
      </div>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}

function iconActionStyle(theme: AppTheme): CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : theme.colors.surfaceHover,
    border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle}`,
    cursor: 'pointer',
    padding: 0,
  };
}
