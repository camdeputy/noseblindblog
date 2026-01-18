import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const TABLE_NAME = process.env.TABLE_NAME;
const CONTENT_BUCKET = process.env.CONTENT_BUCKET;

interface CreatePostBody {
    slug: string;
    title: string;
    summary?: string;
    content?: string;
    status?: "draft" | "published";
    tags?: string[];
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    if (!TABLE_NAME) {
        return {
            statusCode: 500,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Missing TABLE_NAME env var" })
        };
    }
    if (!CONTENT_BUCKET) {
        return {
            statusCode: 500,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Missing CONTENT_BUCKET env var" })
        };
    }

    if (!event.body) {
        return {
            statusCode: 400,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Missing request body" })
        };
    }

    let body: CreatePostBody;
    try {
        body = JSON.parse(event.body);
    } catch {
        return {
            statusCode: 400,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Invalid JSON body" })
        };
    }

    if (!body.slug || !body.title) {
        return {
            statusCode: 400,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Missing required fields: slug, title" })
        };
    }

    const now = new Date().toISOString();
    const postId = randomUUID();
    const status = body.status ?? "draft";

    let contentKey: string | undefined;
    if (body.content) {
        contentKey = `posts/${body.slug}.md`;
        await s3.send(
            new PutObjectCommand({
                Bucket: CONTENT_BUCKET,
                Key: contentKey,
                Body: body.content,
                ContentType: "text/markdown"
            })
        );
    }

    const item = {
        postId,
        slug: body.slug,
        title: body.title,
        summary: body.summary ?? "",
        status,
        tags: body.tags ?? [],
        contentKey,
        createdAt: now,
        updatedAt: now,
        ...(status === "published" ? { publishedAt: Date.now() } : {})
    };

    await ddb.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
            ConditionExpression: "attribute_not_exists(postId)"
        })
    );

    return {
        statusCode: 201,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true, item })
    };
}
