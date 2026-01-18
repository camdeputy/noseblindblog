import { Post, PostWithContent, CreatePostData, UpdatePostData } from '@/types/post';

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
    next: { revalidate: 60 },
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
    next: { revalidate: 60 },
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
