import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { NoteAssignment } from "@/types/fragrance";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminSupabase();

  // Fetch fragrance
  const { data: fragrance, error: fragError } = await supabase
    .from("fragrances")
    .select("*, fragrance_houses(name)")
    .eq("id", id)
    .single();

  if (fragError || !fragrance) {
    return NextResponse.json({ ok: false, error: "Fragrance not found" }, { status: 404 });
  }

  // Fetch note mappings with note names
  const { data: noteMappings } = await supabase
    .from("fragrance_note_map")
    .select("note_id, position, sort_order, fragrance_notes(name)")
    .eq("fragrance_id", id)
    .order("sort_order", { ascending: true });

  const notes: NoteAssignment[] = (noteMappings ?? []).map((m: Record<string, unknown>) => ({
    note_id: m.note_id as string,
    note_name: (m.fragrance_notes as { name: string } | null)?.name ?? "",
    position: m.position as "top" | "middle" | "base",
    sort_order: m.sort_order as number,
  }));

  return NextResponse.json({ ok: true, item: { ...fragrance, notes } });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminSupabase();

  let body: {
    house_id?: string;
    name?: string;
    slug?: string;
    description?: string;
    rating?: number;
    price_cents?: number;
    currency?: string;
    size_ml?: number;
    house_url?: string;
    fragrance_url?: string;
    review_post_id?: string | null;
    notes?: NoteAssignment[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (body.name !== undefined && !body.name.trim()) {
    return NextResponse.json({ ok: false, error: "Name cannot be empty" }, { status: 400 });
  }

  // Build update object (only include fields that were sent)
  const updates: Record<string, unknown> = {};
  if (body.house_id !== undefined) updates.house_id = body.house_id;
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.slug !== undefined) updates.slug = body.slug.trim();
  if (body.description !== undefined) updates.description = body.description.trim() || null;
  if (body.rating !== undefined) updates.rating = body.rating;
  if (body.price_cents !== undefined) updates.price_cents = body.price_cents;
  if (body.currency !== undefined) updates.currency = body.currency.trim() || null;
  if (body.size_ml !== undefined) updates.size_ml = body.size_ml;
  if (body.house_url !== undefined) updates.house_url = body.house_url.trim() || null;
  if (body.fragrance_url !== undefined) updates.fragrance_url = body.fragrance_url.trim() || null;
  if (body.review_post_id !== undefined) updates.review_post_id = body.review_post_id || null;

  // Update fragrance fields
  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from("fragrances")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 400 });
    }
  }

  // Replace notes if provided
  if (body.notes !== undefined) {
    // Delete old mappings
    const { error: deleteError } = await supabase
      .from("fragrance_note_map")
      .delete()
      .eq("fragrance_id", id);

    if (deleteError) {
      console.error("Failed to delete old note mappings:", deleteError.message);
    }

    // Insert new mappings
    if (body.notes.length > 0) {
      const noteMappings = [];

      for (const note of body.notes) {
        let resolvedNoteId = note.note_id;

        // If no note_id, resolve by name (find or create)
        if (!resolvedNoteId && note.note_name?.trim()) {
          const { data: existing } = await supabase
            .from("fragrance_notes")
            .select("id")
            .ilike("name", note.note_name.trim())
            .single();

          if (existing) {
            resolvedNoteId = existing.id;
          } else {
            const { data: created, error: createErr } = await supabase
              .from("fragrance_notes")
              .insert({ name: note.note_name.trim() })
              .select("id")
              .single();

            if (createErr) {
              const { data: retry } = await supabase
                .from("fragrance_notes")
                .select("id")
                .ilike("name", note.note_name.trim())
                .single();
              resolvedNoteId = retry?.id;
            } else {
              resolvedNoteId = created.id;
            }
          }
        }

        if (resolvedNoteId) {
          noteMappings.push({
            fragrance_id: id,
            note_id: resolvedNoteId,
            position: note.position,
            sort_order: note.sort_order,
          });
        }
      }

      if (noteMappings.length > 0) {
        const { error: mapError } = await supabase
          .from("fragrance_note_map")
          .insert(noteMappings);

        if (mapError) {
          console.error("Failed to insert note mappings:", mapError.message);
        }
      }
    }
  }

  // Re-fetch the updated fragrance
  const { data: updated } = await supabase
    .from("fragrances")
    .select("*, fragrance_houses(name)")
    .eq("id", id)
    .single();

  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminSupabase();

  // Delete note mappings first (in case no cascade)
  await supabase.from("fragrance_note_map").delete().eq("fragrance_id", id);

  const { error } = await supabase
    .from("fragrances")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
