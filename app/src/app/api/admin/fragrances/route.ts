import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { NoteAssignment } from "@/types/fragrance";

export async function GET() {
  const supabase = createAdminSupabase();

  const { data, error } = await supabase
    .from("fragrances")
    .select("*, fragrance_houses(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, items: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = createAdminSupabase();

  let body: {
    house_id: string;
    name: string;
    slug: string;
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

  if (!body.house_id?.trim()) {
    return NextResponse.json({ ok: false, error: "House is required" }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  }
  if (!body.slug?.trim()) {
    return NextResponse.json({ ok: false, error: "Slug is required" }, { status: 400 });
  }

  // Insert the fragrance
  const { data: fragrance, error: fragError } = await supabase
    .from("fragrances")
    .insert({
      house_id: body.house_id,
      name: body.name.trim(),
      slug: body.slug.trim(),
      description: body.description?.trim() || null,
      rating: body.rating ?? null,
      price_cents: body.price_cents ?? null,
      currency: body.currency?.trim() || null,
      size_ml: body.size_ml ?? null,
      house_url: body.house_url?.trim() || null,
      fragrance_url: body.fragrance_url?.trim() || null,
      review_post_id: body.review_post_id || null,
    })
    .select()
    .single();

  if (fragError) {
    return NextResponse.json({ ok: false, error: fragError.message }, { status: 400 });
  }

  // Process notes if provided
  if (body.notes && body.notes.length > 0) {
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
            // Try one more time in case of race condition
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
          fragrance_id: fragrance.id,
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
        // Fragrance was created but notes failed — log but don't fail the request
        console.error("Failed to insert note mappings:", mapError.message);
      }
    }
  }

  return NextResponse.json({ ok: true, item: fragrance }, { status: 201 });
}
