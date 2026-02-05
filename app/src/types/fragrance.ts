export interface FragranceHouse {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHouseData {
  name: string;
  description?: string;
  price?: number;
}

export interface FragranceNote {
  id: string;
  name: string;
  description: string | null;
}

export interface NoteAssignment {
  note_id: string;
  note_name: string;
  position: 'top' | 'middle' | 'base';
  sort_order: number;
}

export interface Fragrance {
  id: string;
  house_id: string;
  name: string;
  description: string | null;
  rating: number | null;
  price_cents: number | null;
  currency: string | null;
  house_url: string | null;
  fragrance_url: string | null;
  review_post_id: string | null;
  created_at: string;
  updated_at: string;
  fragrance_houses?: { name: string };
}

export interface CreateFragranceData {
  house_id: string;
  name: string;
  description?: string;
  rating?: number;
  price_cents?: number;
  currency?: string;
  house_url?: string;
  fragrance_url?: string;
  review_post_id?: string | null;
  notes?: NoteAssignment[];
}

export interface UpdateHouseData {
  name?: string;
  description?: string;
}

export interface UpdateFragranceData {
  house_id?: string;
  name?: string;
  description?: string;
  rating?: number;
  price_cents?: number;
  currency?: string;
  house_url?: string;
  fragrance_url?: string;
  review_post_id?: string | null;
  notes?: NoteAssignment[];
}

export interface FragranceWithNotes extends Fragrance {
  notes: NoteAssignment[];
}
