import { beforeEach, describe, expect, it, vi } from 'vitest';

type LambdaResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
};

const mockDdbSend = vi.fn();
const mockS3Send = vi.fn();

vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'test-post-id'),
}));

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
  PutCommand: vi.fn(function PutCommand(input) {
    return { input };
  }),
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
  PutObjectCommand: vi.fn(function PutObjectCommand(input) {
    return { input };
  }),
}));

describe('admin-posts-create handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete process.env.TABLE_NAME;
    delete process.env.CONTENT_BUCKET;
  });

  it('returns 400 for missing or invalid request bodies', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    process.env.CONTENT_BUCKET = 'blog-content';
    const { handler } = await import('./admin-posts-create');

    const missingBody = (await handler({ body: undefined } as any)) as LambdaResponse;
    expect(missingBody.statusCode).toBe(400);
    expect(JSON.parse(missingBody.body ?? '{}')).toEqual({
      ok: false,
      error: 'Missing request body',
    });

    const invalidJson = (await handler({ body: 'not-json' } as any)) as LambdaResponse;
    expect(invalidJson.statusCode).toBe(400);
    expect(JSON.parse(invalidJson.body ?? '{}')).toEqual({
      ok: false,
      error: 'Invalid JSON body',
    });

    const missingFields = (await handler({
      body: JSON.stringify({ slug: '', title: '' }),
    } as any)) as LambdaResponse;
    expect(missingFields.statusCode).toBe(400);
    expect(JSON.parse(missingFields.body ?? '{}')).toEqual({
      ok: false,
      error: 'Missing required fields: slug, title',
    });
    expect(mockDdbSend).not.toHaveBeenCalled();
  });

  it('returns 409 when the slug already exists', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    process.env.CONTENT_BUCKET = 'blog-content';
    mockDdbSend.mockResolvedValueOnce({
      Items: [{ slug: 'first-post' }],
    });

    const { handler } = await import('./admin-posts-create');
    const response = (await handler({
      body: JSON.stringify({ slug: 'first-post', title: 'First Post' }),
    } as any)) as LambdaResponse;

    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body ?? '{}')).toEqual({
      ok: false,
      error: 'Slug already exists',
    });
    expect(mockS3Send).not.toHaveBeenCalled();
    expect(mockDdbSend).toHaveBeenCalledTimes(1);
  });

  it('creates draft posts without uploading content when content is omitted', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    process.env.CONTENT_BUCKET = 'blog-content';
    mockDdbSend
      .mockResolvedValueOnce({ Items: [] })
      .mockResolvedValueOnce({});

    const { handler } = await import('./admin-posts-create');
    const response = (await handler({
      body: JSON.stringify({
        slug: 'first-post',
        title: 'First Post',
        summary: 'Summary',
      }),
    } as any)) as LambdaResponse;

    const parsed = JSON.parse(response.body ?? '{}');

    expect(response.statusCode).toBe(201);
    expect(mockS3Send).not.toHaveBeenCalled();
    expect(parsed.ok).toBe(true);
    expect(parsed.item).toMatchObject({
      postId: 'test-post-id',
      slug: 'first-post',
      title: 'First Post',
      summary: 'Summary',
      status: 'draft',
      tags: [],
    });
    expect(parsed.item).not.toHaveProperty('publishedAt');
    expect(parsed.item).not.toHaveProperty('contentKey');
  });

  it('uploads markdown content and sets publishedAt for published posts', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    process.env.CONTENT_BUCKET = 'blog-content';
    mockDdbSend
      .mockResolvedValueOnce({ Items: [] })
      .mockResolvedValueOnce({});
    mockS3Send.mockResolvedValue({});

    const { handler } = await import('./admin-posts-create');
    const response = (await handler({
      body: JSON.stringify({
        slug: 'published-post',
        title: 'Published Post',
        content: '# Published',
        status: 'published',
        tags: ['launch'],
      }),
    } as any)) as LambdaResponse;

    const parsed = JSON.parse(response.body ?? '{}');

    expect(response.statusCode).toBe(201);
    expect(mockS3Send).toHaveBeenCalledTimes(1);
    expect(parsed.ok).toBe(true);
    expect(parsed.item).toMatchObject({
      postId: 'test-post-id',
      slug: 'published-post',
      title: 'Published Post',
      status: 'published',
      tags: ['launch'],
      contentKey: 'posts/published-post.md',
    });
    expect(typeof parsed.item.publishedAt).toBe('number');
  });
});
