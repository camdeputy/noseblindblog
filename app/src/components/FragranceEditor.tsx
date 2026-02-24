'use client';

import { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import NoteSelector from '@/components/NoteSelector';
import { createFragrance, updateFragrance, deleteFragrance, getFragrance, getAdminHouses, getAdminPosts } from '@/lib/api';
import { FragranceHouse, Fragrance, NoteAssignment } from '@/types/fragrance';
import { Post } from '@/types/post';

interface FragranceEditorProps {
  mode?: 'create' | 'edit';
  fragrance?: Fragrance;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FragranceEditor({ mode = 'create', fragrance, onSuccess, onCancel }: FragranceEditorProps) {
  const isEdit = mode === 'edit';

  // Dropdown data
  const [houses, setHouses] = useState<FragranceHouse[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form fields
  const [houseId, setHouseId] = useState(fragrance?.house_id ?? '');
  const [name, setName] = useState(fragrance?.name ?? '');
  const [slug, setSlug] = useState(fragrance?.slug ?? '');
  const [description, setDescription] = useState(fragrance?.description ?? '');
  const [rating, setRating] = useState(fragrance?.rating != null ? String(fragrance.rating) : '');
  const [priceCents, setPriceCents] = useState(fragrance?.price_cents != null ? String(fragrance.price_cents) : '');
  const [currency, setCurrency] = useState(fragrance?.currency ?? 'USD');
  const [sizeMl, setSizeMl] = useState(fragrance?.size_ml != null ? String(fragrance.size_ml) : '');
  const [houseUrl, setHouseUrl] = useState(fragrance?.house_url ?? '');
  const [fragranceUrl, setFragranceUrl] = useState(fragrance?.fragrance_url ?? '');
  const [reviewPostId, setReviewPostId] = useState(fragrance?.review_post_id ?? '');
  const [notes, setNotes] = useState<NoteAssignment[]>([]);

  // Slug auto-generation helper
  function toSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  // Form state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Load dropdown data (and notes for edit mode) on mount
  useEffect(() => {
    async function loadData() {
      try {
        const promises: Promise<unknown>[] = [
          getAdminHouses(),
          getAdminPosts().catch(() => [] as Post[]),
        ];
        // If editing, also fetch the full fragrance with notes
        if (isEdit && fragrance) {
          promises.push(getFragrance(fragrance.id));
        }

        const results = await Promise.all(promises);
        setHouses(results[0] as FragranceHouse[]);
        setPosts(results[1] as Post[]);

        if (isEdit && results[2]) {
          const full = results[2] as { notes: NoteAssignment[] };
          setNotes(full.notes || []);
        }
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!houseId) {
      setError('Please select a brand');
      return;
    }
    if (!name.trim()) {
      setError('Fragrance name is required');
      return;
    }

    const ratingNum = rating ? parseInt(rating, 10) : undefined;
    if (ratingNum !== undefined && (ratingNum < 0 || ratingNum > 5)) {
      setError('Rating must be between 0 and 5');
      return;
    }

    const priceNum = priceCents ? parseInt(priceCents, 10) : undefined;
    const sizeMlNum = sizeMl ? parseInt(sizeMl, 10) : undefined;

    setIsSaving(true);
    try {
      if (!slug.trim()) {
      setError('Slug is required');
      return;
    }

    const payload = {
        house_id: houseId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        rating: ratingNum,
        price_cents: priceNum,
        currency: currency.trim() || undefined,
        size_ml: sizeMlNum,
        house_url: houseUrl.trim() || undefined,
        fragrance_url: fragranceUrl.trim() || undefined,
        review_post_id: reviewPostId || null,
        notes: notes.length > 0 ? notes : undefined,
      };

      if (isEdit && fragrance) {
        await updateFragrance(fragrance.id, payload);
      } else {
        await createFragrance(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'create'} fragrance`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!fragrance) return;
    if (!confirm(`Delete "${fragrance.name}"? This cannot be undone.`)) return;

    setIsDeleting(true);
    setError('');
    try {
      await deleteFragrance(fragrance.id);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete fragrance');
    } finally {
      setIsDeleting(false);
    }
  }

  const busy = isSaving || isDeleting;

  if (loadingData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-primary/60">Loading form data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-primary mb-4">
        {isEdit ? 'Edit Fragrance' : 'New Fragrance'}
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Brand & Name row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Brand"
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            required
            disabled={busy}
          >
            <option value="">Select a brand...</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </Select>

          <Input
            label="Fragrance Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!isEdit) setSlug(toSlug(e.target.value));
            }}
            placeholder="e.g. Baccarat Rouge 540"
            required
            disabled={busy}
          />
        </div>

        {/* Slug */}
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(toSlug(e.target.value))}
          placeholder="e.g. baccarat-rouge-540"
          required
          disabled={busy}
        />

        {/* Description */}
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the fragrance..."
          disabled={busy}
        />

        {/* Rating & Price row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Rating (0-5)"
            type="number"
            min={0}
            max={5}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="0-5"
            disabled={busy}
          />

          <Input
            label="Price (cents)"
            type="number"
            min={0}
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            placeholder="e.g. 32500"
            disabled={busy}
          />

          <Input
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="USD"
            disabled={busy}
          />

          <Input
            label="Size (ml)"
            type="number"
            min={0}
            value={sizeMl}
            onChange={(e) => setSizeMl(e.target.value)}
            placeholder="e.g. 100"
            disabled={busy}
          />
        </div>

        {/* URLs row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="House URL"
            type="url"
            value={houseUrl}
            onChange={(e) => setHouseUrl(e.target.value)}
            placeholder="https://..."
            disabled={busy}
          />

          <Input
            label="Fragrance URL"
            type="url"
            value={fragranceUrl}
            onChange={(e) => setFragranceUrl(e.target.value)}
            placeholder="https://..."
            disabled={busy}
          />
        </div>

        {/* Review Post */}
        <Select
          label="Linked Review Post"
          value={reviewPostId}
          onChange={(e) => setReviewPostId(e.target.value)}
          disabled={busy}
        >
          <option value="">-- No linked review --</option>
          {posts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.status})
            </option>
          ))}
        </Select>

        {/* Notes */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-sm font-semibold text-primary mb-4">Fragrance Notes</h4>
          <NoteSelector notes={notes} onChange={setNotes} />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button type="submit" disabled={busy}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSaving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Fragrance')}
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
