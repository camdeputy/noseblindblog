import Link from 'next/link';
import { Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PostCard({ post }: PostCardProps) {
  const displayDate = post.publishedAt || post.createdAt;

  return (
    <Link href={`/posts/${post.slug}`}>
      <Card hoverable className="h-full">
        <article className="flex flex-col h-full">
          <h2 className="text-xl font-bold text-primary mb-2 line-clamp-2">
            {post.title}
          </h2>
          <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
            {post.summary}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <time dateTime={displayDate}>{formatDate(displayDate)}</time>
          </div>
        </article>
      </Card>
    </Link>
  );
}
