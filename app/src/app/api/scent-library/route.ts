import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/rateLimit';

export const revalidate = 300;

const PAGE_SIZE = 8;
const SEARCH_MAX_LENGTH = 100;
const HOUSE_LIST_COLUMNS = 'id, name, slug, description, price, created_at';
const FRAGRANCE_LIST_COLUMNS = 'id, house_id, name, slug, description, rating, size_ml, concentration, review_post_id, created_at';

function sanitizeSearchQuery(raw: string): string {
  return raw
    // 1. Remove null bytes and ASCII control chars (except standard whitespace)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // 2. Collapse interior whitespace
    .replace(/\s+/g, ' ')
    // 3. Strip Postgres LIKE metacharacters
    .replace(/[%_]/g, '')
    .trim()
    // 4. Enforce max length
    .slice(0, SEARCH_MAX_LENGTH);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = sanitizeSearchQuery(searchParams.get('q') ?? '');

  // ── Search mode ─────────────────────────────────────────────────────────────
  if (q) {
    const rateLimitResponse = await enforceRateLimit(request, 'public_search');
    if (rateLimitResponse) return rateLimitResponse;

    const supabase = createServerSupabase();
    const pattern = `%${q}%`;

    // Parallel: houses matching by name AND fragrances matching by name
    const [{ data: houseMatches, error: houseErr }, { data: fragMatches, error: fragErr }] =
      await Promise.all([
        supabase.from('fragrance_houses').select(HOUSE_LIST_COLUMNS).ilike('name', pattern).order('name'),
        supabase.from('fragrances').select(FRAGRANCE_LIST_COLUMNS).ilike('name', pattern).order('created_at', { ascending: false }),
      ]);

    if (houseErr) return NextResponse.json({ error: houseErr.message }, { status: 500 });
    if (fragErr)  return NextResponse.json({ error: fragErr.message },  { status: 500 });

    const matchedHouses = houseMatches ?? [];
    const matchedFrags  = fragMatches  ?? [];

    const houseMatchIds = new Set(matchedHouses.map((h) => h.id));

    // Extra houses: those only found via a fragrance match (not already in houseMatches)
    const extraHouseIds = [...new Set(
      matchedFrags.filter((f) => !houseMatchIds.has(f.house_id)).map((f) => f.house_id),
    )];

    let extraHouses: typeof matchedHouses = [];
    if (extraHouseIds.length > 0) {
      const { data, error } = await supabase
        .from('fragrance_houses')
        .select(HOUSE_LIST_COLUMNS)
        .in('id', extraHouseIds)
        .order('name');
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      extraHouses = data ?? [];
    }

    // For houses matched by name: fetch ALL their fragrances
    let allFragsForHouseMatches: typeof matchedFrags = [];
    if (houseMatchIds.size > 0) {
      const { data, error } = await supabase
        .from('fragrances')
        .select(FRAGRANCE_LIST_COLUMNS)
        .in('house_id', [...houseMatchIds])
        .order('created_at', { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      allFragsForHouseMatches = data ?? [];
    }

    // Build lookup: house_id → fragrances
    const byHouse = new Map<string, typeof matchedFrags>();

    // Houses matched by name get ALL their fragrances
    for (const f of allFragsForHouseMatches) {
      const arr = byHouse.get(f.house_id) ?? [];
      arr.push(f);
      byHouse.set(f.house_id, arr);
    }
    // Extra houses (matched only via fragrance) get only the matching fragrances
    for (const f of matchedFrags.filter((f) => !houseMatchIds.has(f.house_id))) {
      const arr = byHouse.get(f.house_id) ?? [];
      arr.push(f);
      byHouse.set(f.house_id, arr);
    }

    const allHouses = [...matchedHouses, ...extraHouses].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    // Batch-fetch primary images
    const allHouseIds = allHouses.map((h) => h.id);
    const allFragIds = [...new Set([...byHouse.values()].flat().map((f) => f.id))];

    const [{ data: houseImgData }, { data: fragImgData }] = await Promise.all([
      allHouseIds.length > 0
        ? supabase.from('house_images').select('house_id, url').in('house_id', allHouseIds).eq('is_primary', true)
        : Promise.resolve({ data: [] }),
      allFragIds.length > 0
        ? supabase.from('fragrance_images').select('fragrance_id, url').in('fragrance_id', allFragIds).eq('is_primary', true)
        : Promise.resolve({ data: [] }),
    ]);

    const houseImageMap = new Map((houseImgData ?? []).map((i) => [i.house_id, i.url]));
    const fragImageMap = new Map((fragImgData ?? []).map((i) => [i.fragrance_id, i.url]));

    const housesWithFragrances = allHouses.map((h) => ({
      ...h,
      rating: null,
      logo_url: houseImageMap.get(h.id) ?? null,
      fragrances: (byHouse.get(h.id) ?? []).map((f) => ({
        ...f,
        primary_image_url: fragImageMap.get(f.id) ?? null,
      })),
    }));

    return NextResponse.json({ houses: housesWithFragrances, hasMore: false, total: allHouses.length });
  }

  // ── Paginated browse mode ────────────────────────────────────────────────────
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const rateLimitResponse = await enforceRateLimit(request, 'public_read');
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createServerSupabase();

  const { data: housesData, error: housesError, count } = await supabase
    .from('fragrance_houses')
    .select(HOUSE_LIST_COLUMNS, { count: 'exact' })
    .order('name', { ascending: true })
    .range(from, to);

  if (housesError) {
    return NextResponse.json({ error: housesError.message }, { status: 500 });
  }

  const houses = housesData ?? [];

  if (houses.length === 0) {
    return NextResponse.json({ houses: [], hasMore: false, total: count ?? 0 });
  }

  const houseIds = houses.map((h) => h.id);

  const { data: fragrancesData, error: fragrancesError } = await supabase
    .from('fragrances')
    .select(FRAGRANCE_LIST_COLUMNS)
    .in('house_id', houseIds)
    .order('created_at', { ascending: false });

  if (fragrancesError) {
    return NextResponse.json({ error: fragrancesError.message }, { status: 500 });
  }

  const fragrances = fragrancesData ?? [];

  const byHouse = new Map<string, typeof fragrances>();
  for (const f of fragrances) {
    const arr = byHouse.get(f.house_id) ?? [];
    arr.push(f);
    byHouse.set(f.house_id, arr);
  }

  // Batch-fetch primary images
  const allFragIds = fragrances.map((f) => f.id);

  const [{ data: houseImgData }, { data: fragImgData }] = await Promise.all([
    supabase.from('house_images').select('house_id, url').in('house_id', houseIds).eq('is_primary', true),
    allFragIds.length > 0
      ? supabase.from('fragrance_images').select('fragrance_id, url').in('fragrance_id', allFragIds).eq('is_primary', true)
      : Promise.resolve({ data: [] }),
  ]);

  const houseImageMap = new Map((houseImgData ?? []).map((i) => [i.house_id, i.url]));
  const fragImageMap = new Map((fragImgData ?? []).map((i) => [i.fragrance_id, i.url]));

  const housesWithFragrances = houses.map((h) => ({
    ...h,
    rating: null,
    logo_url: houseImageMap.get(h.id) ?? null,
    fragrances: (byHouse.get(h.id) ?? []).map((f) => ({
      ...f,
      primary_image_url: fragImageMap.get(f.id) ?? null,
    })),
  }));

  const total = count ?? 0;
  const hasMore = to < total - 1;

  return NextResponse.json({ houses: housesWithFragrances, hasMore, total });
}
