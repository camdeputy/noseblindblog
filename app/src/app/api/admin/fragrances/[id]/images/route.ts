import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { enforceRateLimit } from '@/lib/rateLimit';

// POST: save a new image record
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const rateLimitResponse = await enforceRateLimit(req, 'admin_write');
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const supabase = createAdminSupabase();
    const { url, altText, isPrimary } = await req.json();

    if (isPrimary) {
        // Clear existing primary first (the DB unique index enforces this, but clearing
        // first avoids a constraint error on insert)
        await supabase
            .from('fragrance_images')
            .update({ is_primary: false })
            .eq('fragrance_id', id);
    }

    const { data, error } = await supabase
        .from('fragrance_images')
        .insert({
            fragrance_id: id,
            url,
            alt_text: altText,
            is_primary: isPrimary ?? false,
            sort_order: 0,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}

// GET: list images for a fragrance
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const rateLimitResponse = await enforceRateLimit(_, 'admin_read');
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
        .from('fragrance_images')
        .select('*')
        .eq('fragrance_id', id)
        .order('is_primary', { ascending: false })
        .order('sort_order');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
