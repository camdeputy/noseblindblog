'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export interface ImageRecord {
    id: string;
    url: string;
    alt_text: string | null;
    is_primary: boolean;
}

interface Props {
    entityType: 'fragrance' | 'house';
    entityId: string;
    images: ImageRecord[];
    onChange: (images: ImageRecord[]) => void;
}

function isValidUrl(url: string): boolean {
    try { new URL(url); return true; } catch { return false; }
}

export default function ImageUploader({ entityType, entityId, images, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const basePath = `/api/admin/${entityType}s/${entityId}/images`;

    async function handleFiles(files: FileList | null) {
        if (!files?.length) return;
        setUploading(true);
        setError(null);

        let currentImages = [...images];

        for (const file of Array.from(files)) {
            try {
                // 1. Get presigned URL
                const presignRes = await fetch('/api/admin/presign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        entityType,
                        entityId,
                        contentType: file.type,
                        fileSize: file.size,
                    }),
                });
                if (!presignRes.ok) {
                    const body = await presignRes.json().catch(() => ({}));
                    throw new Error((body as { error?: string }).error ?? 'Failed to get upload URL');
                }
                const { presignedUrl, publicUrl } = await presignRes.json() as { presignedUrl: string; publicUrl: string };

                // 2. Upload directly to S3 — browser never touches your server for the bytes
                const uploadRes = await fetch(presignedUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file,
                });
                if (!uploadRes.ok) throw new Error('S3 upload failed');

                // 3. Save record to Supabase via your API
                const isPrimary = currentImages.length === 0;
                const saveRes = await fetch(basePath, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: publicUrl,
                        altText: file.name.replace(/\.[^/.]+$/, ''),
                        isPrimary,
                    }),
                });
                if (!saveRes.ok) {
                    const body = await saveRes.json().catch(() => ({}));
                    throw new Error((body as { error?: string }).error ?? 'Failed to save image');
                }

                const saved = await saveRes.json() as ImageRecord;
                currentImages = [...currentImages, saved];
                onChange(currentImages);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Upload failed');
                break;
            }
        }

        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
    }

    async function handleDelete(imageId: string) {
        setDeletingId(imageId);
        try {
            const res = await fetch(`${basePath}/${imageId}`, { method: 'DELETE' });
            if (!res.ok && res.status !== 204) throw new Error('Delete failed');
            onChange(images.filter((img) => img.id !== imageId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Delete failed');
        } finally {
            setDeletingId(null);
        }
    }

    async function handleSetPrimary(imageId: string) {
        try {
            const res = await fetch(`${basePath}/${imageId}`, { method: 'PATCH' });
            if (!res.ok && res.status !== 204) throw new Error('Failed to set primary');
            onChange(images.map((img) => ({ ...img, is_primary: img.id === imageId })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to set primary');
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
                {images.map((img) => {
                    const isDeleting = deletingId === img.id;
                    return (
                        <div
                            key={img.id}
                            className="relative group w-24 h-24 rounded overflow-hidden border border-gray-200 flex-shrink-0"
                        >
                            {isValidUrl(img.url) ? (
                                <Image
                                    src={img.url}
                                    alt={img.alt_text ?? ''}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-[10px] text-gray-400 text-center px-1">Invalid URL</span>
                                </div>
                            )}
                            {img.is_primary && !isDeleting && (
                                <span className="absolute top-1 left-1 text-[10px] leading-none bg-black/60 text-white px-1.5 py-0.5 rounded pointer-events-none">
                                    Primary
                                </span>
                            )}
                            {isDeleting ? (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                                    {!img.is_primary && (
                                        <button
                                            type="button"
                                            onClick={() => handleSetPrimary(img.id)}
                                            className="text-[11px] text-white underline leading-none"
                                        >
                                            Set primary
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(img.id)}
                                        className="text-[11px] text-red-300 underline leading-none"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    aria-label="Upload image"
                >
                    {uploading
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <span className="text-2xl leading-none select-none">+</span>
                    }
                </button>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
