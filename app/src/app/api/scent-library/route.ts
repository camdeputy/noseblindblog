import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 8;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
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
