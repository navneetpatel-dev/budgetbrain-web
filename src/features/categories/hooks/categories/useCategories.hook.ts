'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getApiErrorMessage } from '@/shared/services/api';
import { archiveCategory as archiveCategoryRequest, createCategory, reorderCategories, unarchiveCategory as unarchiveCategoryRequest, updateCategory } from '../../api/categories.api';
import { invalidateCategoryConsumers } from '@/shared/services/queryInvalidation';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { Category } from '@/shared/types';

export interface CategoryForm {
  name: string;
  color: string;
}

export const COLORS_PRESET = ['#6366F1', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export function useCategories() {
  const queryClient = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const { data, isLoading } = usePaginatedList<Category, 'categories'>({
    queryKey: ['categories', showArchived ? 'all' : 'active'],
    url: showArchived ? '/categories?includeArchived=true' : '/categories',
    itemsKey: 'categories',
    // Categories change rarely (create/update/archive/reorder/merge), and every mutation
    // here already calls invalidateCategoryConsumers — staleness is bounded by that, not
    // by the timer, so a longer staleTime just avoids refetching unchanged data.
    staleTime: 10 * 60 * 1000,
  });

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CategoryForm>({
    defaultValues: { name: '', color: COLORS_PRESET[0] },
  });

  const selectedColor = watch('color');

  const openCreate = () => {
    clearSubmitError();
    reset({ name: '', color: COLORS_PRESET[0] });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    clearSubmitError();
    reset({ name: cat.name, color: cat.color ?? COLORS_PRESET[0] });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const onSubmit = async (form: CategoryForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
      }
      invalidateCategoryConsumers(queryClient);
      setShowForm(false);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not save category'));
    } finally {
      setLoading(false);
    }
  };

  const archiveCategory = async (id: string) => {
    setListError(null);
    try {
      await archiveCategoryRequest(id);
      invalidateCategoryConsumers(queryClient);
    } catch (err) {
      setListError(getApiErrorMessage(err, 'Could not archive category'));
    }
  };

  const unarchiveCategory = async (id: string) => {
    setListError(null);
    try {
      await unarchiveCategoryRequest(id);
      invalidateCategoryConsumers(queryClient);
    } catch (err) {
      setListError(getApiErrorMessage(err, 'Could not unarchive category'));
    }
  };

  const moveCategory = async (index: number, direction: -1 | 1) => {
    if (!data) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= data.length) return;
    const ordered = [...data];
    const [item] = ordered.splice(index, 1);
    ordered.splice(newIndex, 0, item);
    setListError(null);
    try {
      await reorderCategories(ordered.map((c) => c.id));
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      setListError(getApiErrorMessage(err, 'Could not reorder categories'));
    }
  };

  return {
    categories: data,
    isLoading,
    showArchived,
    setShowArchived,
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
    unarchiveCategory,
    moveCategory,
  };
}
