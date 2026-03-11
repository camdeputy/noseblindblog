import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { getS3Client } from '@/lib/s3';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export async function POST(req: NextRequest) {
    const maxSizeMb = parseInt(process.env.MEDIA_MAX_UPLOAD_SIZE_MB ?? '10', 10);
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    const { entityType, entityId, contentType, fileSize } = await req.json();

    if (!ALLOWED_TYPES.includes(contentType)) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    if (fileSize > maxSizeBytes) {
        return NextResponse.json({ error: `File too large (max ${maxSizeMb} MB)` }, { status: 400 });
    }
    if (!['fragrance', 'house'].includes(entityType)) {
        return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    const mediaBaseRaw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    if (!mediaBaseRaw) {
        return NextResponse.json({ error: 'NEXT_PUBLIC_MEDIA_BASE_URL is not configured' }, { status: 500 });
    }
    try { new URL(mediaBaseRaw); } catch {
        return NextResponse.json({ error: 'NEXT_PUBLIC_MEDIA_BASE_URL must be a full URL including https://' }, { status: 500 });
    }
    // Strip trailing slash to avoid double-slash in the public URL
    const mediaBase = mediaBaseRaw.replace(/\/$/, '');

    const ext = contentType.split('/')[1].replace('jpeg', 'jpg');
    const key = `media/${entityType}s/${entityId}/${randomUUID()}.${ext}`;

    const s3 = await getS3Client();
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_MEDIA_BUCKET!,
        Key: key,
        ContentType: contentType,
        ContentLength: fileSize,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min
    const publicUrl = `${mediaBase}/${key}`;

    return NextResponse.json({ presignedUrl, publicUrl, key });
}
