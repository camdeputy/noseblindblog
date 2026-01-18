import { Metadata } from 'next';
import Link from 'next/link';
import { getPosts } from '@/lib/api';
import { Post } from '@/types/post';

export const metadata: Metadata = {
  title: 'Posts',
  description: 'Explore our latest articles and stories',
};

function formatDate(date: string | number): string {
  // Handle both ISO strings (createdAt/updatedAt) and Unix timestamps (publishedAt)
  const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Truncate text to approximately N words
function truncateWords(text: string, maxWords: number = 12): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

// Assign visual variants for masonry visual interest
function getCardVariant(index: number): 'featured' | 'accent' | 'standard' {
  if (index === 0) return 'featured';
  if (index % 5 === 2 || index % 7 === 0) return 'accent';
  return 'standard';
}

interface PostCardProps {
  post: Post;
  variant: 'featured' | 'accent' | 'standard';
  index: number;
}

function PostCard({ post, variant, index }: PostCardProps) {
  const displayDate = post.publishedAt || post.createdAt;
  const preview = truncateWords(post.summary, 12);

  const baseClasses = `
    group relative block rounded-2xl overflow-hidden
    transition-all duration-500 ease-out
    break-inside-avoid mb-6
  `;

  const variantClasses = {
    featured: `
      bg-primary text-white
      hover:bg-secondary
      p-8 min-h-[320px]
    `,
    accent: `
      bg-accent text-primary
      hover:bg-tertiary
      p-6 min-h-[240px]
    `,
    standard: `
      bg-tertiary text-primary
      hover:bg-secondary hover:text-white
      p-6 min-h-[200px]
    `,
  };

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`${baseClasses} ${variantClasses[variant]}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Decorative corner element */}
      <div className={`
        absolute top-0 right-0 w-24 h-24
        transition-transform duration-500 ease-out
        group-hover:scale-150 group-hover:rotate-12
        ${variant === 'featured' ? 'bg-secondary/20' : ''}
        ${variant === 'accent' ? 'bg-primary/10' : ''}
        ${variant === 'standard' ? 'bg-secondary/10' : ''}
        rounded-bl-full
      `} />

      <div className="relative z-10 h-full flex flex-col">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={`
                  text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full
                  transition-colors duration-300
                  ${variant === 'featured'
                    ? 'bg-white/20 text-white group-hover:bg-primary/30'
                    : variant === 'accent'
                    ? 'bg-primary/10 text-primary group-hover:bg-primary/20'
                    : 'bg-secondary/20 text-secondary group-hover:bg-white/30 group-hover:text-white'
                  }
                `}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className={`
          font-display font-semibold leading-tight mb-3
          transition-transform duration-300 group-hover:translate-x-1
          ${variant === 'featured' ? 'text-3xl' : 'text-xl'}
        `}>
          {post.title}
        </h2>

        {/* Preview text */}
        <p className={`
          flex-grow mb-4 leading-relaxed
          ${variant === 'featured'
            ? 'text-white/80 text-base'
            : variant === 'accent'
            ? 'text-primary/70 text-sm'
            : 'text-primary/70 text-sm group-hover:text-white/80'
          }
        `}>
          {preview}
        </p>

        {/* Footer */}
        <div className={`
          flex items-center justify-between text-xs font-medium
          pt-4 border-t
          ${variant === 'featured'
            ? 'border-white/20 text-white/60'
            : variant === 'accent'
            ? 'border-primary/10 text-primary/50'
            : 'border-secondary/20 text-primary/50 group-hover:border-white/20 group-hover:text-white/60'
          }
        `}>
          <time dateTime={displayDate}>{formatDate(displayDate)}</time>
          <span className="
            flex items-center gap-1
            transition-transform duration-300
            group-hover:translate-x-1
          ">
            Read more
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

const POSTS_PER_PAGE = 5;

export default async function PostsPage() {
  let posts: Post[] = [];
  let error: string | null = null;

  try {
    const allPosts = await getPosts();
    // Get latest 5 posts, sorted by date (pagination-ready)
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <span className="inline-block text-accent text-sm font-semibold uppercase tracking-widest mb-4">
              The Blog
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Stories, Insights & Discoveries
            </h1>
            <p className="text-xl text-white/70 leading-relaxed">
              Dive into our collection of thoughts on fragrance, creativity, and the art of sensory experience.
            </p>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
            <path
              d="M0 120V60C240 20 480 0 720 0C960 0 1200 20 1440 60V120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {error ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-semibold text-primary mb-2">
              Unable to load posts
            </h2>
            <p className="text-primary/60 mb-4">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-tertiary rounded-full mb-6">
              <svg className="w-10 h-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {posts.map((post, index) => (
              <PostCard
                key={post.id || post.slug}
                post={post}
                variant={getCardVariant(index)}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
