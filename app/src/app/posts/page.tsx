import { Metadata } from 'next';
import Link from 'next/link';
import { getPosts } from '@/lib/api';
import { Post } from '@/types/post';

export const metadata: Metadata = {
  title: 'Posts',
  description: 'Explore our latest articles and stories',
};

function formatDate(date: string | number): string {
  const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function truncateWords(text: string, maxWords: number = 18): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

interface PostCardProps {
  post: Post;
  index: number;
}

function PostCard({ post, index }: PostCardProps) {
  const displayDate = post.publishedAt || post.createdAt;
  const preview = truncateWords(post.summary, 18);

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block bg-tertiary/30 hover:bg-tertiary/60 transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Card number display */}
      <div className="aspect-4/3 bg-tertiary/50 flex items-center justify-center relative overflow-hidden">
        <span className="font-display text-8xl text-secondary/20 group-hover:text-secondary/30 transition-colors">
          {String(index + 1).padStart(2, '0')}
        </span>
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-bl-full group-hover:scale-125 transition-transform duration-500" />
      </div>

      <div className="p-5">
        {/* Tags & Date */}
        <div className="flex items-center gap-3 text-xs text-primary/50 mb-3">
          {post.tags.length > 0 && (
            <>
              <span className="uppercase tracking-wider font-medium text-secondary">
                {post.tags[0]}
              </span>
              <span>&middot;</span>
            </>
          )}
          <time dateTime={typeof displayDate === 'number' ? new Date(displayDate).toISOString() : displayDate}>
            {formatDate(displayDate)}
          </time>
        </div>

        {/* Title */}
        <h2 className="font-display text-xl font-semibold text-primary mb-2 group-hover:text-secondary transition-colors leading-tight">
          {post.title}
        </h2>

        {/* Preview */}
        <p className="text-sm text-primary/60 leading-relaxed mb-4">
          {preview}
        </p>

        {/* Read more */}
        <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary group-hover:gap-2 transition-all">
          Read Article
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

const POSTS_PER_PAGE = 6;

export default async function PostsPage() {
  let posts: Post[] = [];
  let error: string | null = null;

  try {
    const allPosts = await getPosts();
    posts = allPosts
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt);
        const dateB = new Date(b.publishedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, POSTS_PER_PAGE);
  } catch (err) {
    console.error('Failed to fetch posts:', err);
    error = err instanceof Error ? err.message : 'Failed to load posts';
  }

  return (
    <div className="min-h-screen bg-tertiary/30">
      {/* Hero Section - matching landing page aesthetic */}
      <section className="relative overflow-hidden">
        {/* Decorative elements */}
        <StarSticker className="absolute top-16 left-[10%] w-6 h-6" />
        <StarSticker className="absolute top-24 left-[15%] w-4 h-4" />
        <StarSticker className="absolute top-20 right-[12%] w-5 h-5" />
        <StarSticker className="absolute top-32 right-[18%] w-3 h-3" />
        <FloralAccent className="absolute top-8 right-[8%] w-20 h-20 opacity-60" />
        <FloralAccent className="absolute bottom-4 left-[5%] w-16 h-16 opacity-40 rotate-45" />

        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-sm tracking-widest text-secondary mb-4 uppercase">
            The Journal
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-primary leading-tight mb-6">
            Stories & <span className="text-secondary">Discoveries</span>
          </h1>
          <p className="text-primary/60 max-w-xl mx-auto text-lg leading-relaxed">
            Dive into our collection of thoughts on fragrance, creativity,
            and the art of sensory experience.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="h-px w-16 bg-secondary/30" />
        <DiamondIcon className="w-3 h-3 text-secondary/50" />
        <div className="h-px w-16 bg-secondary/30" />
      </div>

      {/* Posts Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {error ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-tertiary rounded-full mb-6">
              <svg className="w-10 h-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-semibold text-primary mb-2">
              Unable to load posts
            </h2>
            <p className="text-primary/60">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-tertiary/50 rounded-full mb-6">
              <svg className="w-10 h-10 text-secondary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-semibold text-primary mb-2">
              No posts yet
            </h2>
            <p className="text-primary/60">
              Check back soon for new content!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <PostCard
                key={post.id || post.slug}
                post={post}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bottom decorative section */}
      <section className="bg-tertiary/50 py-16 mt-8">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="font-display text-2xl text-primary/80 italic">
            "Perfume is the art that makes memory speak."
          </p>
          <p className="text-sm text-primary/50 mt-4">— Noseblind Journal</p>
        </div>
      </section>
    </div>
  );
}

/* Decorative SVG Components */

const StarSticker = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0L24 16L40 20L24 24L20 40L16 24L0 20L16 16L20 0Z" fill="#B27092" opacity="0.5" />
  </svg>
);

const FloralAccent = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" stroke="#C9CBA3" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
    <circle cx="50" cy="50" r="30" stroke="#B27092" strokeWidth="1" opacity="0.4" />
    <path d="M50 20V80" stroke="#C9CBA3" strokeWidth="1" opacity="0.3" />
    <path d="M20 50H80" stroke="#C9CBA3" strokeWidth="1" opacity="0.3" />
  </svg>
);

const DiamondIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 10 10" className={className} fill="currentColor">
    <path d="M5 0L10 5L5 10L0 5L5 0Z" />
  </svg>
);
