export const POST_PUBLISHED_EVENT_TYPE = "post.published" as const;

export interface PostPublishedJob {
    eventType: typeof POST_PUBLISHED_EVENT_TYPE;
    jobId: string;
    postId: string;
    slug: string;
    publishedAt: number;
}

export function buildPostPublishedJob(input: {
    jobId: string;
    postId: string;
    slug: string;
    publishedAt: number;
}): PostPublishedJob {
    return {
        eventType: POST_PUBLISHED_EVENT_TYPE,
        jobId: input.jobId,
        postId: input.postId,
        slug: input.slug,
        publishedAt: input.publishedAt
    };
}

export function isPostPublishedJob(value: unknown): value is PostPublishedJob {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
        candidate.eventType === POST_PUBLISHED_EVENT_TYPE &&
        typeof candidate.jobId === "string" &&
        typeof candidate.postId === "string" &&
        typeof candidate.slug === "string" &&
        typeof candidate.publishedAt === "number"
    );
}
