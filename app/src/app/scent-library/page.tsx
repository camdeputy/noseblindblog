import { createServerSupabase } from '@/lib/supabase/server';
import ScentLibraryClient, {
  type HouseWithFragrances,
  type FragranceWithHouseName,
} from './ScentLibraryClient';

// Always render server-side so catalog changes are immediately visible
export const dynamic = 'force-dynamic';

export default async function ScentLibraryPage() {
  const supabase = createServerSupabase();

  // Parallel fetch — eliminates the sequential waterfall from the old client component.
  // Use select('*') to avoid failures from any column-name mismatch with the live schema.
  const [{ data: housesData, error: housesError }, { data: fragrancesData, error: fragrancesError }] = await Promise.all([
    supabase
      .from('fragrance_houses')
      .select('*')
      .order('name', { ascending: true }),
    supabase
      .from('fragrances')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  if (housesError) console.error('[scent-library] houses fetch error:', housesError.message);
  if (fragrancesError) console.error('[scent-library] fragrances fetch error:', fragrancesError.message);

  const houses = housesData ?? [];
  const fragrances = fragrancesData ?? [];

  // Available alphabet letters derived from house names
  const availableLetters = [
    ...new Set(
      houses
        .map((h) => h.name.charAt(0).toUpperCase())
        .filter((l) => /[A-Z]/.test(l))
    ),
  ];

  // Group fragrances by house_id in one pass
  const byHouse = new Map<string, typeof fragrances>();
  for (const f of fragrances) {
    const arr = byHouse.get(f.house_id) ?? [];
    arr.push(f);
    byHouse.set(f.house_id, arr);
  }

  const housesWithFragrances: HouseWithFragrances[] = houses.map((h) => ({
    ...h,
    fragrances: byHouse.get(h.id) ?? [],
  }));

  // Pre-compute the 5 most recently added fragrances (already sorted desc)
  const houseNameById = new Map(houses.map((h) => [h.id, h.name]));
  const recentFragrances: FragranceWithHouseName[] = fragrances
    .slice(0, 5)
    .map((f) => ({ ...f, houseName: houseNameById.get(f.house_id) ?? '' }));

  return (
    <ScentLibraryClient
      houses={housesWithFragrances}
      recentFragrances={recentFragrances}
      availableLetters={availableLetters}
    />
  );
}
