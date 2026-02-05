'use client';

import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { createHouse, updateHouse, deleteHouse } from '@/lib/api';
import { FragranceHouse } from '@/types/fragrance';

interface HouseEditorProps {
  mode?: 'create' | 'edit';
  house?: FragranceHouse;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function HouseEditor({ mode = 'create', house, onSuccess, onCancel }: HouseEditorProps) {
  const isEdit = mode === 'edit';
  const [name, setName] = useState(house?.name ?? '');
  const [description, setDescription] = useState(house?.description ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Brand name is required');
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit && house) {
        await updateHouse(house.id, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        await createHouse({
          name: name.trim(),
          description: description.trim() || undefined,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'create'} brand`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!house) return;
    if (!confirm(`Delete "${house.name}"? This cannot be undone.`)) return;

    setIsDeleting(true);
    setError('');
    try {
      await deleteHouse(house.id);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete brand');
    } finally {
      setIsDeleting(false);
    }
  }

  const busy = isSaving || isDeleting;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-primary mb-4">
        {isEdit ? 'Edit Brand' : 'New Brand'}
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Brand Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Maison Francis Kurkdjian"
          required
          disabled={busy}
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the house..."
          disabled={busy}
        />
      </div>

      <div className="flex items-center gap-3 mt-6">
        <Button type="submit" disabled={busy}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSaving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Brand')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleDelete}
            disabled={busy}
            className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        )}
      </div>
    </form>
  );
}
