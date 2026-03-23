import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const rateLimitResponse = await enforceRateLimit(request, "admin_read");
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createAdminSupabase();

  const { data, error } = await supabase
    .from("fragrance_houses")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, items: data ?? [] });
}

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit(request, "admin_write");
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createAdminSupabase();

  let body: { name: string; slug?: string; description?: string; house_url?: string; price?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  }

  const slug = body.slug?.trim() ||
    body.name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

  const { data, error } = await supabase
    .from("fragrance_houses")
    .insert({
      name: body.name.trim(),
      slug,
      description: body.description?.trim() || null,
      house_url: body.house_url?.trim() || null,
      price: body.price ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: false, error: "A house with that name already exists" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}
