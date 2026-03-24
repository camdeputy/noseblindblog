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
  GetCommand: vi.fn(function GetCommand(input) {
    return { input };
  }),
}));

describe('post-by-id handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete process.env.TABLE_NAME;
  });

  it('returns 400 when the id path parameter is missing', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    const { handler } = await import('./post-by-id');

    const response = (await handler({ pathParameters: {} } as any)) as LambdaResponse;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body ?? '{}')).toEqual({
      ok: false,
      error: 'Missing id path param',
    });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('returns 404 when the item is missing or not published', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    mockSend.mockResolvedValueOnce({ Item: undefined });

    const { handler } = await import('./post-by-id');
    const missingResponse = (await handler({
      pathParameters: { id: 'missing-post' },
    } as any)) as LambdaResponse;

    expect(missingResponse.statusCode).toBe(404);
    expect(JSON.parse(missingResponse.body ?? '{}')).toEqual({
      ok: false,
      error: 'Not found',
    });

    vi.resetModules();
    mockSend.mockReset();
    process.env.TABLE_NAME = 'blog-posts';
    mockSend.mockResolvedValueOnce({
      Item: {
        postId: 'draft-post',
        status: 'draft',
      },
    });

    const reloaded = await import('./post-by-id');
    const draftResponse = (await reloaded.handler({
      pathParameters: { id: 'draft-post' },
    } as any)) as LambdaResponse;

    expect(draftResponse.statusCode).toBe(404);
    expect(JSON.parse(draftResponse.body ?? '{}')).toEqual({
      ok: false,
      error: 'Not found',
    });
  });

  it('returns the mapped published post summary', async () => {
    process.env.TABLE_NAME = 'blog-posts';
    mockSend.mockResolvedValue({
      Item: {
        postId: 'post-1',
        slug: 'first-post',
        title: 'First Post',
        summary: 'Summary',
        status: 'published',
        publishedAt: '2026-03-22T12:00:00.000Z',
        updatedAt: '2026-03-23T12:00:00.000Z',
        tags: ['intro'],
      },
    });

    const { handler } = await import('./post-by-id');
    const response = (await handler({
      pathParameters: { id: 'post-1' },
    } as any)) as LambdaResponse;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body ?? '{}')).toEqual({
      ok: true,
      item: {
        id: 'post-1',
        slug: 'first-post',
        title: 'First Post',
        summary: 'Summary',
        status: 'published',
        publishedAt: '2026-03-22T12:00:00.000Z',
        updatedAt: '2026-03-23T12:00:00.000Z',
        tags: ['intro'],
      },
    });
  });
});
