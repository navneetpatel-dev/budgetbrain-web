import { useState } from 'react';
import { FeatureHeader, ActionFab, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { Input, Button, EmptyState } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { ColorPicker } from '@/shared/components/ui/forms';
import { ACCENT_OPTIONS } from '@/shared/theme';
import { useCategories } from '@/features/shared/hooks/useFeatures';

export function CategoriesPage() {
  const theme = useTheme();
  const { categories, createMutation, archiveMutation, error, setError } = useCategories();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366F1');

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <StickyHeaderFlatScreen
        header={<FeatureHeader title="Categories" subtitle="Manage your categories" icon="category" variant="stack" showBack />}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={(cat) => (
          <div style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, border: `1px solid ${theme.colors.borderSubtle}`, padding: theme.spacing.lg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: theme.shadows.sm }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: (cat.color || theme.colors.primary) + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${(cat.color || theme.colors.primary)}44` }}><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cat.color || theme.colors.primary }} /></div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: theme.colors.text }}>{cat.name}</span>
            </div>
            <button onClick={() => archiveMutation.mutate(cat.id)} style={{ fontSize: 12, fontWeight: 600, color: theme.colors.danger, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Archive</button>
          </div>
        )}
        ListEmptyComponent={<EmptyState title="No categories" subtitle="Add categories to organize your expenses" icon="category" />}
      />
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.overlay, padding: 24 }}>
          <div style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.xl, padding: theme.spacing.xl, maxWidth: 420, width: '100%', boxShadow: theme.shadows.lg }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, color: theme.colors.text, margin: '0 0 16px 0' }}>New Category</h3>
            <Input label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Transport" autoFocus />
            <div style={{ marginBottom: theme.spacing.lg }}><span style={{ fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: 8, display: 'block', fontFamily: 'Inter, sans-serif' }}>Color</span><ColorPicker value={newColor} options={ACCENT_OPTIONS.map((o) => ({ id: o.swatch, swatch: o.swatch }))} onChange={setNewColor} /></div>
            {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <Button title="Add" onPress={() => createMutation.mutate({ name: newName, color: newColor })} loading={createMutation.isPending} />
              <Button title="Cancel" onPress={() => { setShowAdd(false); setError(null); }} variant="outline" />
            </div>
          </div>
        </div>
      )}
      <ActionFab onPress={() => setShowAdd(true)} label="Add Category" />
    </div>
  );
}
