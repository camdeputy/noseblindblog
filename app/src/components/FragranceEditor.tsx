'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import NoteSelector from '@/components/NoteSelector';
import { createFragrance, getAdminHouses, getAdminPosts } from '@/lib/api';
import { FragranceHouse, NoteAssignment } from '@/types/fragrance';
import { Post } from '@/types/post';

interface FragranceEditorProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FragranceEditor({ onSuccess, onCancel }: FragranceEditorProps) {
  // Dropdown data
  const [houses, setHouses] = useState<FragranceHouse[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form fields
  const [houseId, setHouseId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('');
  const [priceCents, setPriceCents] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [houseUrl, setHouseUrl] = useState('');
  const [fragranceUrl, setFragranceUrl] = useState('');
  const [reviewPostId, setReviewPostId] = useState('');
  const [notes, setNotes] = useState<NoteAssignment[]>([]);

  // Form state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Load dropdown data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [housesData, postsData] = await Promise.all([
          getAdminHouses(),
          getAdminPosts().catch(() => [] as Post[]),
        ]);
        setHouses(housesData);
        setPosts(postsData);
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

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

    setIsSaving(true);
    try {
      await createFragrance({
        house_id: houseId,
        name: name.trim(),
        description: description.trim() || undefined,
        rating: ratingNum,
        price_cents: priceNum,
        currency: currency.trim() || undefined,
        house_url: houseUrl.trim() || undefined,
        fragrance_url: fragranceUrl.trim() || undefined,
        review_post_id: reviewPostId || null,
        notes: notes.length > 0 ? notes : undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create fragrance');
    } finally {
      setIsSaving(false);
    }
  }

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
      <h3 className="text-lg font-semibold text-primary mb-4">New Fragrance</h3>

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
            disabled={isSaving}
          >
            <option value="">Select a brand...</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </Select>

          <Input
            label="Fragrance Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Baccarat Rouge 540"
            required
            disabled={isSaving}
          />
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the fragrance..."
          disabled={isSaving}
        />

        {/* Rating & Price row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Rating (0-5)"
            type="number"
            min={0}
            max={5}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="0-5"
            disabled={isSaving}
          />

          <Input
            label="Price (cents)"
            type="number"
            min={0}
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            placeholder="e.g. 32500"
            disabled={isSaving}
          />

          <Input
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="USD"
            disabled={isSaving}
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
            disabled={isSaving}
          />

          <Input
            label="Fragrance URL"
            type="url"
            value={fragranceUrl}
            onChange={(e) => setFragranceUrl(e.target.value)}
            placeholder="https://..."
            disabled={isSaving}
          />
        </div>

        {/* Review Post */}
        <Select
          label="Linked Review Post"
          value={reviewPostId}
          onChange={(e) => setReviewPostId(e.target.value)}
          disabled={isSaving}
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
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSaving ? 'Creating...' : 'Create Fragrance'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
