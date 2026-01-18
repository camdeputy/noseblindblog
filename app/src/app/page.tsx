import { getPosts } from '@/lib/api';
import PostCard from '@/components/PostCard';
import { Post } from '@/types/post';

export default async function HomePage() {
  let posts: Post[] = [];
  let error: string | null = null;

  try {
    posts = await getPosts();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load posts';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary mb-4">
          Welcome to Noseblind
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Thoughts, stories, and ideas worth sharing.
        </p>
      </section>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts yet. Check back soon!</p>
        </div>
      ) : (
        <section>
          <h2 className="text-2xl font-bold text-primary mb-6">Latest Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
