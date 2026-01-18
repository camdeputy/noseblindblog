'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PostEditor from '@/components/PostEditor';

export default function NewPostPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Create New Post</h1>
        <p className="text-gray-600 mt-1">Write and publish a new blog post</p>
      </div>

      <PostEditor mode="create" />
    </div>
  );
}
