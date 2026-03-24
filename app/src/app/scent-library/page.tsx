import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import ScentLibraryClient, {
  type HouseWithFragrances,
  type FragranceWithHouseName,
} from './ScentLibraryClient';
import { siteUrl } from '@/lib/siteConfig';
import ScentLibraryLoading from './loading';

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
const HOUSE_LIST_COLUMNS = 'id, name, slug, description, rating, created_at';
const FRAGRANCE_LIST_COLUMNS = 'id, house_id, name, slug, description, rating, size_ml, concentration, review_post_id, created_at';

// Static shell — streams to the browser immediately, no data dependency
export default function ScentLibraryPage() {
  return (
    <div className="min-h-screen bg-tertiary/30">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 42%, rgba(244,191,219,0.22) 0%, transparent 68%)' }} aria-hidden="true" />
        <div className="hidden sm:contents">
          <StarSticker className="absolute top-12 left-[8%] w-6 h-6" />
          <StarSticker className="absolute top-20 left-[12%] w-4 h-4" />
          <StarSticker className="absolute top-16 right-[10%] w-5 h-5" />
          <StarSticker className="absolute top-28 right-[15%] w-3 h-3" />
          <FloralAccent className="absolute top-4 right-[5%] w-24 h-24 opacity-50" />
          <FloralAccent className="absolute bottom-0 left-[3%] w-20 h-20 opacity-30 -rotate-12" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 pt-10 sm:pt-16 pb-6 text-center">
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-primary leading-tight mb-6">
            Scent <span className="text-secondary">Library</span>
          </h1>
          <p className="text-primary/60 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Explore and discover your favorite fragrance houses
          </p>
        </div>
      </section>

      {/* Search bar + filter + house list — skeleton shown while Supabase resolves */}
      <Suspense fallback={<ScentLibraryLoading />}>
        <ScentLibraryData />
      </Suspense>
    </div>
  );
}

// Async data loader — runs after the static shell is already streaming
async function ScentLibraryData() {
  const supabase = createServerSupabase();

  const [
    { data: allHousesData },
    { data: firstPageHouses, count },
    { data: recentFragData },
  ] = await Promise.all([
    supabase.from('fragrance_houses').select('id, name').order('name'),
    supabase.from('fragrance_houses').select(HOUSE_LIST_COLUMNS, { count: 'exact' }).order('name').range(0, PAGE_SIZE - 1),
    supabase.from('fragrances').select(FRAGRANCE_LIST_COLUMNS).order('created_at', { ascending: false }).limit(5),
  ]);

  const allHouses = allHousesData ?? [];
  const houses = firstPageHouses ?? [];
  const total = count ?? 0;

  const houseIds = houses.map((h) => h.id);
  const { data: fragrancesData } = houseIds.length > 0
    ? await supabase.from('fragrances').select(FRAGRANCE_LIST_COLUMNS).in('house_id', houseIds).order('created_at', { ascending: false })
    : { data: [] };

  const fragrances = fragrancesData ?? [];

  const allFragIds = [...new Set([
    ...fragrances.map((f) => f.id),
    ...(recentFragData ?? []).map((f) => f.id),
  ])];

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

const StarSticker = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0L24 16L40 20L24 24L20 40L16 24L0 20L16 16L20 0Z" fill="#B27092" opacity="0.5" />
  </svg>
);

const FloralAccent = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" stroke="#C9CBA3" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
    <circle cx="50" cy="50" r="30" stroke="#B27092" strokeWidth="1" opacity="0.4" />
    <path d="M50 20V80" stroke="#C9CBA3" strokeWidth="1" opacity="0.3" />
    <path d="M20 50H80" stroke="#C9CBA3" strokeWidth="1" opacity="0.3" />
  </svg>
);
