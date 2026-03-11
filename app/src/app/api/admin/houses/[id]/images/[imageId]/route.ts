import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client } from '@/lib/s3';

export async function DELETE(
    _: NextRequest,
    { params }: { params: Promise<{ id: string; imageId: string }> }
) {
    const { id, imageId } = await params;
    const supabase = createAdminSupabase();

    const { data: image } = await supabase
        .from('house_images')
        .select('url')
        .eq('id', imageId)
        .eq('house_id', id)
        .single();

    if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL!;
    const key = image.url.replace(`${mediaBase}/`, '');
    const s3 = await getS3Client();
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_MEDIA_BUCKET!, Key: key }));

    const { error } = await supabase
        .from('house_images')
        .delete()
        .eq('id', imageId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return new NextResponse(null, { status: 204 });
}

// PATCH: set as primary
export async function PATCH(
    _: NextRequest,
    { params }: { params: Promise<{ id: string; imageId: string }> }
) {
    const { id, imageId } = await params;
    const supabase = createAdminSupabase();

    await supabase
        .from('house_images')
        .update({ is_primary: false })
        .eq('house_id', id);

    const { error } = await supabase
        .from('house_images')
        .update({ is_primary: true })
        .eq('id', imageId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return new NextResponse(null, { status: 204 });
}
