import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase();

  // Option A: query the base tables (no raw SQL)
  // We'll fetch fragrance + notes mapping and shape it.
  const { data: fragrance, error: fErr } = await supabase
    .from("fragrances")
    .select("id,name,description,house_id")
    .eq("id", params.id)
    .single();

  if (fErr) return NextResponse.json({ error: fErr.message }, { status: 400 });
  if (!fragrance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: mapped, error: nErr } = await supabase
    .from("fragrance_note_map")
    .select("position, sort_order, fragrance_notes(name)")
    .eq("fragrance_id", params.id)
    .order("position", { ascending: true })
    .order("sort_order", { ascending: true });

  if (nErr) return NextResponse.json({ error: nErr.message }, { status: 400 });

  const top: string[] = [];
  const middle: string[] = [];
  const base: string[] = [];

  for (const row of mapped ?? []) {
    const name = (row as any).fragrance_notes?.name as string | undefined;
    if (!name) continue;
    if (row.position === "top") top.push(name);
    if (row.position === "middle") middle.push(name);
    if (row.position === "base") base.push(name);
  }

  return NextResponse.json({
    ...fragrance,
    notes: { top, middle, base },
  });
}
