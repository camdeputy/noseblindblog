import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type NoteRow = {
  position: string;
  sort_order: number;
  // Supabase returns joined rows as an array without generated types
  fragrance_notes: { name: string }[] | null;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = createServerSupabase();

  const { data: fragrance, error: fErr } = await supabase
    .from("fragrances")
    .select("id,name,description,house_id")
    .eq("id", id)
    .single();

  if (fErr) {
    console.error("[api/fragrances] fragrance fetch error:", fErr.message);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!fragrance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: mapped, error: nErr } = await supabase
    .from("fragrance_note_map")
    .select("position, sort_order, fragrance_notes(name)")
    .eq("fragrance_id", id)
    .order("position", { ascending: true })
    .order("sort_order", { ascending: true });

  if (nErr) {
    console.error("[api/fragrances] notes fetch error:", nErr.message);
    return NextResponse.json({ error: "Failed to fetch fragrance data" }, { status: 500 });
  }

  const top: string[] = [];
  const middle: string[] = [];
  const base: string[] = [];

  for (const row of (mapped ?? []) as NoteRow[]) {
    const noteData = Array.isArray(row.fragrance_notes) ? row.fragrance_notes[0] : row.fragrance_notes;
    const name = noteData?.name;
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
