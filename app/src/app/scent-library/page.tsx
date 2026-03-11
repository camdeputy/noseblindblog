import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase/server';
import ScentLibraryClient, {
  type HouseWithFragrances,
  type FragranceWithHouseName,
} from './ScentLibraryClient';
import { siteUrl } from '@/lib/siteConfig';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Scent Library',
  description: 'Browse fragrances by house, notes, and ratings. Discover new scents in our curated fragrance catalog.',
  alternates: { canonical: `${siteUrl}/scent-library` },
  openGraph: {
    title: 'Scent Library | Noseblind',
    description: 'Browse fragrances by house, notes, and ratings. Discover new scents in our curated fragrance catalog.',
    url: `${siteUrl}/scent-library`,
    type: 'website',
  },
  twitter: {
    title: 'Scent Library | Noseblind',
    description: 'Browse fragrances by house, notes, and ratings. Discover new scents in our curated fragrance catalog.',
  },
};

const PAGE_SIZE = 8;

export default async function ScentLibraryPage() {
  const supabase = createServerSupabase();

  // Three parallel fetches:
  // 1. All house names/ids — lightweight, needed for alphabet filter letters
  // 2. First page of full house data — what renders immediately
  // 3. 5 most recent fragrances — for the "recently added" view
  const [
    { data: allHousesData },
    { data: firstPageHouses, count },
    { data: recentFragData },
  ] = await Promise.all([
    supabase.from('fragrance_houses').select('id, name').order('name'),
    supabase.from('fragrance_houses').select('*', { count: 'exact' }).order('name').range(0, PAGE_SIZE - 1),
    supabase.from('fragrances').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  const allHouses = allHousesData ?? [];
  const houses = firstPageHouses ?? [];
  const total = count ?? 0;

  // Fetch fragrances only for the first-page houses (sequential, depends on house IDs above)
  const houseIds = houses.map((h) => h.id);
  const { data: fragrancesData } = houseIds.length > 0
    ? await supabase.from('fragrances').select('*').in('house_id', houseIds).order('created_at', { ascending: false })
    : { data: [] };

  const fragrances = fragrancesData ?? [];

  // Batch-fetch primary images for houses and fragrances in parallel
  const allFragIds = [
    ...fragrances.map((f) => f.id),
    ...(recentFragData ?? []).map((f) => f.id),
  ];

  const [{ data: houseImgData }, { data: fragImgData }] = await Promise.all([
    houseIds.length > 0
      ? supabase.from('house_images').select('house_id, url').in('house_id', houseIds).eq('is_primary', true)
      : Promise.resolve({ data: [] }),
    allFragIds.length > 0
      ? supabase.from('fragrance_images').select('fragrance_id, url').in('fragrance_id', allFragIds).eq('is_primary', true)
      : Promise.resolve({ data: [] }),
  ]);

  const houseImageMap = new Map((houseImgData ?? []).map((i) => [i.house_id, i.url]));
  const fragImageMap = new Map((fragImgData ?? []).map((i) => [i.fragrance_id, i.url]));

  // Available letters derived from ALL houses, not just the first page
  const availableLetters = [
    ...new Set(
      allHouses
        .map((h) => h.name.charAt(0).toUpperCase())
        .filter((l) => /[A-Z]/.test(l))
    ),
  ];

  const byHouse = new Map<string, typeof fragrances>();
  for (const f of fragrances) {
    const arr = byHouse.get(f.house_id) ?? [];
    arr.push(f);
    byHouse.set(f.house_id, arr);
  }

  const initialHouses: HouseWithFragrances[] = houses.map((h) => ({
    ...h,
    logo_url: houseImageMap.get(h.id) ?? null,
    fragrances: (byHouse.get(h.id) ?? []).map((f) => ({
      ...f,
      primary_image_url: fragImageMap.get(f.id) ?? null,
    })),
  }));

  const houseNameById = new Map(allHouses.map((h) => [h.id, h.name]));
  const recentFragrances: FragranceWithHouseName[] = (recentFragData ?? []).map((f) => ({
    ...f,
    houseName: houseNameById.get(f.house_id) ?? '',
    primary_image_url: fragImageMap.get(f.id) ?? null,
  }));

  return (
    <ScentLibraryClient
      initialHouses={initialHouses}
      hasMore={total > PAGE_SIZE}
      recentFragrances={recentFragrances}
      availableLetters={availableLetters}
    />
  );
}
