import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const supabase = createAdminSupabase();
  const q = request.nextUrl.searchParams.get("q");

  let query = supabase
    .from("fragrance_notes")
    .select("*")
    .order("name", { ascending: true });

  if (q?.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, items: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = createAdminSupabase();

  let body: { name: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("fragrance_notes")
    .insert({
      name: body.name.trim(),
      description: body.description?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Note already exists, fetch and return it
      const { data: existing } = await supabase
        .from("fragrance_notes")
        .select("*")
        .ilike("name", body.name.trim())
        .single();

      if (existing) {
        return NextResponse.json({ ok: true, item: existing });
      }
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}
