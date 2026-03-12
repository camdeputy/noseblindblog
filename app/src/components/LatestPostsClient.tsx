'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/types/post';

const CACHE_TTL = 5 * 60 * 1000;
let cache: { posts: Post[]; ts: number } | null = null;

const placeholderCards = [
  { category: 'Trend Report', date: 'Oct 12', title: 'The Resurgence of Chypre' },
  { category: 'Reviews', date: 'Oct 08', title: 'Santal 33: A Decade Later' },
  { category: 'Education', date: 'Oct 01', title: 'Synthetic vs. Natural' },
];

function PlaceholderCard({ category, date, title, index }: { category: string; date: string; title: string; index: number }) {
  return (
    <div className="bg-tertiary/30 card-shadow border border-secondary/10">
      <div className="aspect-4/3 bg-tertiary/50 flex items-center justify-center card-image-depth">
        <span className="font-display text-6xl text-secondary/30">{index}</span>
      </div>
      <div className="py-4 px-4">
        <div className="flex items-center gap-3 text-xs text-primary/75 mb-2">
          <span className="uppercase tracking-wider font-medium">{category}</span>
          <span>&middot;</span>
          <span>{date}</span>
        </div>
        <h3 className="font-display text-lg font-semibold text-primary">{title}</h3>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-tertiary/30 card-shadow border border-secondary/10 animate-pulse">
          <div className="aspect-4/3 bg-tertiary/50" />
          <div className="py-4 px-4 space-y-2">
            <div className="h-3 bg-tertiary/70 rounded w-1/3" />
            <div className="h-5 bg-tertiary/70 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LatestPostsClient() {
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      setPosts(cache.posts);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setPosts([]);
      return;
    }

    const controller = new AbortController();

    fetch(`${apiUrl}/posts`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const posts = (data.items ?? []).slice(0, 3) as Post[];
        cache = { posts, ts: Date.now() };
        setPosts(posts);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setPosts([]);
      });

    return () => controller.abort();
  }, []);

  if (posts === null) return <Skeleton />;

  if (posts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {placeholderCards.map((card, i) => (
          <PlaceholderCard key={i} {...card} index={i + 1} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map((post, i) => (
        <Link
          key={post.id}
          href={`/posts/${post.slug}`}
          className="bg-tertiary/30 hover:bg-tertiary/60 transition-colors group card-shadow border border-secondary/10"
        >
          <div className="aspect-4/3 bg-tertiary/50 flex items-center justify-center card-image-depth">
            <span className="font-display text-6xl text-secondary/30">{i + 1}</span>
          </div>
          <div className="py-4 px-4">
            <div className="flex items-center gap-3 text-xs text-primary/75 mb-2">
              <span className="uppercase tracking-wider font-medium">
                {post.tags?.[0] || 'Journal'}
              </span>
              <span>&middot;</span>
              <span>
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                })}
              </span>
            </div>
            <h3 className="font-display text-lg font-semibold text-primary group-hover:text-secondary transition-colors">
              {post.title}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
