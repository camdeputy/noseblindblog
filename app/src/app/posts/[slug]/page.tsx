import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { getPostBySlug, getPosts } from '@/lib/api';
import PostContent from '@/components/PostContent';
import Badge from '@/components/ui/Badge';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(date: string | number): string {
  // Handle both ISO strings and Unix timestamps
  const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.title,
      description: post.summary,
    };
  } catch {
    return {
      title: 'Post Not Found',
    };
  }
}

export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch {
    return [];
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  const displayDate = post.publishedAt || post.createdAt;
  const readingTime = post.content ? estimateReadingTime(post.content) : 0;

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to posts
      </Link>

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">{post.title}</h1>
        <p className="text-xl text-gray-600 mb-6">{post.summary}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time dateTime={typeof displayDate === 'number' ? new Date(displayDate).toISOString() : displayDate}>{formatDate(displayDate)}</time>
          </div>
          {readingTime > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
          )}
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}
      </header>

      <hr className="border-tertiary mb-8" />

      {post.content ? (
        <PostContent content={post.content} />
      ) : (
        <p className="text-gray-500 italic">No content available.</p>
      )}
    </article>
  );
}
