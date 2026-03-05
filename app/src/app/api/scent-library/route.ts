import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 8;
const SEARCH_MAX_LENGTH = 100;

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
    const supabase = createServerSupabase();
    const pattern = `%${q}%`;

    // Parallel: houses matching by name AND fragrances matching by name
    const [{ data: houseMatches, error: houseErr }, { data: fragMatches, error: fragErr }] =
      await Promise.all([
        supabase.from('fragrance_houses').select('*').ilike('name', pattern).order('name'),
        supabase.from('fragrances').select('*').ilike('name', pattern).order('created_at', { ascending: false }),
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
        .select('*')
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
        .select('*')
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

    const housesWithFragrances = allHouses.map((h) => ({
      ...h,
      fragrances: byHouse.get(h.id) ?? [],
    }));

    return NextResponse.json({ houses: housesWithFragrances, hasMore: false, total: allHouses.length });
  }

  // ── Paginated browse mode ────────────────────────────────────────────────────
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createServerSupabase();

  const { data: housesData, error: housesError, count } = await supabase
    .from('fragrance_houses')
    .select('*', { count: 'exact' })
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
    .select('*')
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

  const housesWithFragrances = houses.map((h) => ({
    ...h,
    fragrances: byHouse.get(h.id) ?? [],
  }));

  const total = count ?? 0;
  const hasMore = to < total - 1;

  return NextResponse.json({ houses: housesWithFragrances, hasMore, total });
}
