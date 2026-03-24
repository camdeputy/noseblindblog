import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { getS3Client } from '@/lib/s3';
import { enforceRateLimit } from '@/lib/rateLimit';
import { buildManagedMediaKey, getManagedMediaPublicUrl, type MediaEntityType } from '@/lib/media';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export async function POST(req: NextRequest) {
    const rateLimitResponse = await enforceRateLimit(req, 'presign');
    if (rateLimitResponse) return rateLimitResponse;

    const maxSizeMb = parseInt(process.env.MEDIA_MAX_UPLOAD_SIZE_MB ?? '10', 10);
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    const { entityType, entityId, contentType, fileSize } = await req.json();

    if (!ALLOWED_TYPES.includes(contentType)) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    if (fileSize > maxSizeBytes) {
        return NextResponse.json({ error: `File too large (max ${maxSizeMb} MB)` }, { status: 400 });
    }
    if (!['fragrance', 'house'].includes(entityType) || typeof entityId !== 'string' || !entityId) {
        return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    const ext = contentType.split('/')[1].replace('jpeg', 'jpg');
    let key: string;
    let publicUrl: string;
    try {
        key = buildManagedMediaKey(entityType as MediaEntityType, entityId, `${randomUUID()}.${ext}`);
        publicUrl = getManagedMediaPublicUrl(entityType as MediaEntityType, entityId, key);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Invalid media configuration' },
            { status: 400 },
        );
    }

    const s3 = await getS3Client();
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_MEDIA_BUCKET!,
        Key: key,
        ContentType: contentType,
        ContentLength: fileSize,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min
    return NextResponse.json({ presignedUrl, publicUrl, key });
}
