import { beforeEach, describe, expect, it, vi } from 'vitest';

type LambdaResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
};

const mockDdbSend = vi.fn();
const mockS3Send = vi.fn();

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn(function DynamoDBClient() {
    return {};
  }),
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: vi.fn(() => ({
      send: mockDdbSend,
    })),
  },
  QueryCommand: vi.fn(function QueryCommand(input) {
    return { input };
  }),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(function S3Client() {
    return {
      send: mockS3Send,
    };
  }),
  GetObjectCommand: vi.fn(function GetObjectCommand(input) {
    return { input };
  }),
}));

describe('posts-get-by-slug handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete process.env.TABLE_NAME;
    delete process.env.CONTENT_BUCKET;
  });

  it('returns 400 when the slug path parameter is missing', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    const { handler } = await import('./posts-get-by-slug');

    const response = (await handler({ pathParameters: {} } as any)) as LambdaResponse;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body ?? '{}')).toEqual({
      ok: false,
      error: 'Missing slug path param',
    });
    expect(mockDdbSend).not.toHaveBeenCalled();
  });

  it('returns 409 when multiple posts share the same slug', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    mockDdbSend.mockResolvedValue({
      Items: [
        { slug: 'duplicate-post', status: 'published' },
        { slug: 'duplicate-post', status: 'published' },
      ],
    });

    const { handler } = await import('./posts-get-by-slug');
    const response = (await handler({
      pathParameters: { slug: 'duplicate-post' },
    } as any)) as LambdaResponse;

    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body ?? '{}')).toEqual({
      ok: false,
      error: 'Duplicate slug detected',
    });
    expect(mockS3Send).not.toHaveBeenCalled();
  });

  it('returns 404 when the post is not published', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    mockDdbSend.mockResolvedValue({
      Items: [
        { slug: 'draft-post', status: 'draft' },
      ],
    });

    const { handler } = await import('./posts-get-by-slug');
    const response = (await handler({
      pathParameters: { slug: 'draft-post' },
    } as any)) as LambdaResponse;

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body ?? '{}')).toEqual({
      ok: false,
      error: 'Not found',
    });
    expect(mockS3Send).not.toHaveBeenCalled();
  });

  it('returns metadata-only responses when no content key exists', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    process.env.CONTENT_BUCKET = 'blog-content';
    mockDdbSend.mockResolvedValue({
      Items: [
        {
          postId: 'post-1',
          slug: 'first-post',
          title: 'First Post',
          status: 'published',
        },
      ],
    });

    const { handler } = await import('./posts-get-by-slug');
    const response = (await handler({
      pathParameters: { slug: 'first-post' },
    } as any)) as LambdaResponse;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body ?? '{}')).toEqual({
      ok: true,
      item: {
        postId: 'post-1',
        slug: 'first-post',
        title: 'First Post',
        status: 'published',
      },
      content: null,
    });
    expect(mockS3Send).not.toHaveBeenCalled();
  });

  it('loads post content from S3 when a content key exists', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    process.env.CONTENT_BUCKET = 'blog-content';
    mockDdbSend.mockResolvedValue({
      Items: [
        {
          postId: 'post-1',
          slug: 'first-post',
          title: 'First Post',
          status: 'published',
          contentKey: 'posts/first-post.md',
        },
      ],
    });
    mockS3Send.mockResolvedValue({
      Body: {
        transformToString: vi.fn().mockResolvedValue('# First Post'),
      },
    });

    const { handler } = await import('./posts-get-by-slug');
    const response = (await handler({
      pathParameters: { slug: 'first-post' },
    } as any)) as LambdaResponse;

    expect(response.statusCode).toBe(200);
    expect(mockS3Send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(response.body ?? '{}')).toEqual({
      ok: true,
      item: {
        postId: 'post-1',
        slug: 'first-post',
        title: 'First Post',
        status: 'published',
        contentKey: 'posts/first-post.md',
      },
      content: '# First Post',
    });
  });
});
