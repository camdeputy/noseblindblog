export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: 'draft' | 'published';
  tags: string[];
  contentKey?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | number; // Unix timestamp when published
}

export interface PostWithContent extends Post {
  content: string | null;
}

export interface CreatePostData {
  slug: string;
  title: string;
  summary: string;
  content: string;
  status: 'draft' | 'published';
  tags: string[];
}

export interface UpdatePostData {
  title?: string;
  summary?: string;
  content?: string;
  status?: 'draft' | 'published';
  tags?: string[];
}
