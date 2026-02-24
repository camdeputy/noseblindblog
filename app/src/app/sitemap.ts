import { MetadataRoute } from 'next';
import { createServerSupabase } from '@/lib/supabase/server';
import { getPosts } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://noseblindblog.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${baseUrl}/posts`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${baseUrl}/scent-library`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/privacy`, priority: 0.3, changeFrequency: 'yearly' },
  ];

  const supabase = createServerSupabase();
  const [postsResult, fragrancesResult] = await Promise.allSettled([
    getPosts(),
    supabase.from('fragrances').select('slug, updated_at').order('name', { ascending: true }),
  ]);

  const postRoutes: MetadataRoute.Sitemap =
    postsResult.status === 'fulfilled'
      ? postsResult.value.map((post) => ({
          url: `${baseUrl}/posts/${post.slug}`,
          lastModified: new Date(post.publishedAt || post.createdAt),
          priority: 0.7,
          changeFrequency: 'monthly' as const,
        }))
      : [];

  const fragranceRoutes: MetadataRoute.Sitemap =
    fragrancesResult.status === 'fulfilled'
      ? (fragrancesResult.value.data ?? [])
          .filter((f) => f.slug)
          .map((f) => ({
            url: `${baseUrl}/fragrances/${f.slug}`,
            lastModified: f.updated_at ? new Date(f.updated_at) : undefined,
            priority: 0.6,
            changeFrequency: 'monthly' as const,
          }))
      : [];

  return [...staticRoutes, ...postRoutes, ...fragranceRoutes];
}
