import { beforeEach, describe, expect, it, vi } from 'vitest';

type LambdaResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
};

const mockSend = vi.fn();

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn(function DynamoDBClient() {
    return {};
  }),
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: vi.fn(() => ({
      send: mockSend,
    })),
  },
  ScanCommand: vi.fn(function ScanCommand() {
    return {};
  }),
  QueryCommand: vi.fn(function QueryCommand(input) {
    return { input };
  }),
}));

describe('posts-list handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete process.env.TABLE_NAME;
  });

  it('returns 500 when TABLE_NAME is missing', async () => {
    const { handler } = await import('./posts-list');

    const response = (await handler({} as any)) as LambdaResponse;

    expect(response.statusCode).toBe(500);
    expect(response.headers).toEqual({ 'content-type': 'application/json' });
    expect(JSON.parse(response.body ?? '{}')).toEqual({
      ok: false,
      error: 'Missing TABLE_NAME env var',
    });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('queries DynamoDB and maps published posts', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    mockSend.mockResolvedValue({
      Items: [
        {
          postId: 'post-1',
          slug: 'first-post',
          title: 'First Post',
          summary: 'Summary',
          status: 'published',
          publishedAt: '2026-03-22T12:00:00.000Z',
          updatedAt: '2026-03-23T12:00:00.000Z',
          tags: ['intro'],
        },
      ],
    });

    const { handler } = await import('./posts-list');

    const response = (await handler({} as any)) as LambdaResponse;
    const body = JSON.parse(response.body ?? '{}');

    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual({ 'content-type': 'application/json' });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(body).toEqual({
      ok: true,
      items: [
        {
          id: 'post-1',
          slug: 'first-post',
          title: 'First Post',
          summary: 'Summary',
          status: 'published',
          publishedAt: '2026-03-22T12:00:00.000Z',
          updatedAt: '2026-03-23T12:00:00.000Z',
          tags: ['intro'],
        },
      ],
    });
  });
});
