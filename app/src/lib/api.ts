import { Post, PostWithContent, CreatePostData, UpdatePostData } from '@/types/post';
import { FragranceHouse, CreateHouseData, UpdateHouseData, Fragrance, CreateFragranceData, UpdateFragranceData, FragranceNote, FragranceWithNotes } from '@/types/fragrance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiResponse<T> {
  ok: boolean;
  error?: string;
  items?: T[];
  item?: T;
  content?: string | null;
}

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${API_URL}/posts`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  const data: ApiResponse<Post> = await response.json();
  if (!data.ok) {
    throw new Error(data.error || 'Failed to fetch posts');
  }

  return data.items || [];
}

export async function getPostBySlug(slug: string): Promise<PostWithContent> {
  const response = await fetch(`${API_URL}/posts/${slug}`, {
    next: { revalidate: 300, tags: [`post-${slug}`] },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Post not found');
    }
    throw new Error('Failed to fetch post');
  }

  const data: ApiResponse<Post> = await response.json();
  if (!data.ok || !data.item) {
    throw new Error(data.error || 'Post not found');
  }

  return {
    ...data.item,
    content: data.content ?? null,
  };
}

// Admin API functions - call Next.js proxy routes (auth via session cookie)
// These routes forward to AWS server-side, avoiding CORS issues

export async function getAdminPosts(): Promise<Post[]> {
  const response = await fetch('/api/admin/posts', {
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch posts');
  }

  const data: ApiResponse<Post> = await response.json();
  if (!data.ok) {
    throw new Error(data.error || 'Failed to fetch posts');
  }

  return data.items || [];
}

export async function createPost(postData: CreatePostData): Promise<Post> {
  const response = await fetch('/api/admin/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create post');
  }

  const data: ApiResponse<Post> = await response.json();
  if (!data.ok || !data.item) {
    throw new Error(data.error || 'Failed to create post');
  }

  return data.item;
}

export async function updatePost(slug: string, postData: UpdatePostData): Promise<Post> {
  const response = await fetch(`/api/admin/posts/${slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized');
    }
    if (response.status === 404) {
      throw new Error('Post not found');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update post');
  }

  const data: ApiResponse<Post> = await response.json();
  if (!data.ok || !data.item) {
    throw new Error(data.error || 'Failed to update post');
  }

  return data.item;
}

export async function deletePost(slug: string): Promise<void> {
  const response = await fetch(`/api/admin/posts/${slug}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized');
    }
    if (response.status === 404) {
      throw new Error('Post not found');
    }
    throw new Error('Failed to delete post');
  }
}

// Fragrance Houses (Brands)

export async function getAdminHouses(): Promise<FragranceHouse[]> {
  const response = await fetch('/api/admin/houses', { cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    throw new Error('Failed to fetch houses');
  }

  const data: ApiResponse<FragranceHouse> = await response.json();
  if (!data.ok) throw new Error(data.error || 'Failed to fetch houses');
  return data.items || [];
}

export async function createHouse(houseData: CreateHouseData): Promise<FragranceHouse> {
  const response = await fetch('/api/admin/houses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(houseData),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create house');
  }

  const data: ApiResponse<FragranceHouse> = await response.json();
  if (!data.ok || !data.item) throw new Error(data.error || 'Failed to create house');
  return data.item;
}

export async function updateHouse(id: string, data: UpdateHouseData): Promise<FragranceHouse> {
  const response = await fetch(`/api/admin/houses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update house');
  }

  const result: ApiResponse<FragranceHouse> = await response.json();
  if (!result.ok || !result.item) throw new Error(result.error || 'Failed to update house');
  return result.item;
}

export async function deleteHouse(id: string): Promise<void> {
  const response = await fetch(`/api/admin/houses/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete house');
  }
}

// Fragrances

export async function getAdminFragrances(): Promise<Fragrance[]> {
  const response = await fetch('/api/admin/fragrances', { cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    throw new Error('Failed to fetch fragrances');
  }

  const data: ApiResponse<Fragrance> = await response.json();
  if (!data.ok) throw new Error(data.error || 'Failed to fetch fragrances');
  return data.items || [];
}

export async function createFragrance(fragData: CreateFragranceData): Promise<Fragrance> {
  const response = await fetch('/api/admin/fragrances', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fragData),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create fragrance');
  }

  const data: ApiResponse<Fragrance> = await response.json();
  if (!data.ok || !data.item) throw new Error(data.error || 'Failed to create fragrance');
  return data.item;
}

export async function getFragrance(id: string): Promise<FragranceWithNotes> {
  const response = await fetch(`/api/admin/fragrances/${id}`, { cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    if (response.status === 404) throw new Error('Fragrance not found');
    throw new Error('Failed to fetch fragrance');
  }

  const data: ApiResponse<FragranceWithNotes> = await response.json();
  if (!data.ok || !data.item) throw new Error(data.error || 'Failed to fetch fragrance');
  return data.item;
}

export async function updateFragrance(id: string, data: UpdateFragranceData): Promise<Fragrance> {
  const response = await fetch(`/api/admin/fragrances/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update fragrance');
  }

  const result: ApiResponse<Fragrance> = await response.json();
  if (!result.ok || !result.item) throw new Error(result.error || 'Failed to update fragrance');
  return result.item;
}

export async function deleteFragrance(id: string): Promise<void> {
  const response = await fetch(`/api/admin/fragrances/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete fragrance');
  }
}

// Notes

export async function searchNotes(query?: string): Promise<FragranceNote[]> {
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  const response = await fetch(`/api/admin/notes${params}`, { cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
    throw new Error('Failed to fetch notes');
  }

  const data: ApiResponse<FragranceNote> = await response.json();
  if (!data.ok) throw new Error(data.error || 'Failed to fetch notes');
  return data.items || [];
}
