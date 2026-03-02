import EditPostClient from './EditPostClient';

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  return <EditPostClient params={params} />;
}
