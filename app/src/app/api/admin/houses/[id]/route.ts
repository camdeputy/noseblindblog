import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await enforceRateLimit(request, "admin_write");
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;
  const supabase = createAdminSupabase();

  let body: { name?: string; slug?: string; description?: string; house_url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (body.name !== undefined && !body.name.trim()) {
    return NextResponse.json({ ok: false, error: "Name cannot be empty" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.slug !== undefined) updates.slug = body.slug.trim();
  if (body.description !== undefined) updates.description = body.description.trim() || null;
  if (body.house_url !== undefined) updates.house_url = body.house_url.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("fragrance_houses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: false, error: "A house with that name already exists" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ ok: false, error: "House not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await enforceRateLimit(request, "admin_write");
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;
  const supabase = createAdminSupabase();

  const { error } = await supabase
    .from("fragrance_houses")
    .delete()
    .eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        { ok: false, error: "Please delete all fragrances from this house first." },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
