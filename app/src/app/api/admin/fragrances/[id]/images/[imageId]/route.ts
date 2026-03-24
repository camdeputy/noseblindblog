import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client } from '@/lib/s3';
import { enforceRateLimit } from '@/lib/rateLimit';
import { extractManagedMediaKey } from '@/lib/media';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; imageId: string }> }
) {
    const rateLimitResponse = await enforceRateLimit(request, 'admin_write');
    if (rateLimitResponse) return rateLimitResponse;

    const { id, imageId } = await params;
    const supabase = createAdminSupabase();

    const { data: image } = await supabase
        .from('fragrance_images')
        .select('url')
        .eq('id', imageId)
        .eq('fragrance_id', id)
        .single();

    if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const key = extractManagedMediaKey(image.url, 'fragrance', id);
    if (!key) return NextResponse.json({ error: 'Invalid managed media URL' }, { status: 400 });
    const s3 = await getS3Client();
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_MEDIA_BUCKET!, Key: key }));

    const { error } = await supabase
        .from('fragrance_images')
        .delete()
        .eq('id', imageId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return new NextResponse(null, { status: 204 });
}

// PATCH: set as primary
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; imageId: string }> }
) {
    const rateLimitResponse = await enforceRateLimit(request, 'admin_write');
    if (rateLimitResponse) return rateLimitResponse;

    const { id, imageId } = await params;
    const supabase = createAdminSupabase();

    await supabase
        .from('fragrance_images')
        .update({ is_primary: false })
        .eq('fragrance_id', id);

    const { error } = await supabase
        .from('fragrance_images')
        .update({ is_primary: true })
        .eq('id', imageId)
        .eq('fragrance_id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return new NextResponse(null, { status: 204 });
}
