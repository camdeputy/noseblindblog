const VALID_MEDIA_ENTITY_TYPES = new Set(["fragrance", "house"]);

export type MediaEntityType = "fragrance" | "house";

function getMediaBaseUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (!raw) {
    throw new Error("NEXT_PUBLIC_MEDIA_BASE_URL is not configured");
  }

  try {
    return new URL(raw.endsWith("/") ? raw : `${raw}/`);
  } catch {
    throw new Error("NEXT_PUBLIC_MEDIA_BASE_URL must be a valid absolute URL");
  }
}

function validateEntityId(entityId: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(entityId);
}

export function buildManagedMediaKey(entityType: MediaEntityType, entityId: string, fileName: string): string {
  if (!VALID_MEDIA_ENTITY_TYPES.has(entityType)) {
    throw new Error("Invalid media entity type");
  }
  if (!validateEntityId(entityId)) {
    throw new Error("Invalid media entity id");
  }
  return `media/${entityType}s/${entityId}/${fileName}`;
}

export function getManagedMediaPublicUrl(entityType: MediaEntityType, entityId: string, key: string): string {
  const prefix = `media/${entityType}s/${entityId}/`;
  if (!key.startsWith(prefix)) {
    throw new Error("Media key does not match entity path");
  }

  return new URL(key, getMediaBaseUrl()).toString();
}

export function extractManagedMediaKey(
  url: string,
  entityType: MediaEntityType,
  entityId: string,
): string | null {
  if (!validateEntityId(entityId)) {
    return null;
  }

  let parsedUrl: URL;
  let baseUrl: URL;
  try {
    parsedUrl = new URL(url);
    baseUrl = getMediaBaseUrl();
  } catch {
    return null;
  }

  if (parsedUrl.origin !== baseUrl.origin) {
    return null;
  }

  const normalizedPath = parsedUrl.pathname.replace(/^\/+/, "");
  const expectedPrefix = `media/${entityType}s/${entityId}/`;
  if (!normalizedPath.startsWith(expectedPrefix)) {
    return null;
  }

  return normalizedPath;
}
