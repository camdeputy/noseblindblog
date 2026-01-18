import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const TABLE_NAME = process.env.TABLE_NAME;
const CONTENT_BUCKET = process.env.CONTENT_BUCKET;

interface UpdatePostBody {
    title?: string;
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

    const slug = event.pathParameters?.slug;
    if (!slug) {
        return {
            statusCode: 400,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Missing slug path param" })
        };
    }

    if (!event.body) {
        return {
            statusCode: 400,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Missing request body" })
        };
    }

    let body: UpdatePostBody;
    try {
        body = JSON.parse(event.body);
    } catch {
        return {
            statusCode: 400,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Invalid JSON body" })
        };
    }

    // Find existing post by slug
    const queryResp = await ddb.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "slug-index",
            KeyConditionExpression: "#sl = :slug",
            ExpressionAttributeNames: { "#sl": "slug" },
            ExpressionAttributeValues: { ":slug": slug },
            Limit: 1
        })
    );

    const existingItem = queryResp.Items?.[0];
    if (!existingItem) {
        return {
            statusCode: 404,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Post not found" })
        };
    }

    const now = new Date().toISOString();

    // Upload content to S3 if provided
    let contentKey = existingItem.contentKey as string | undefined;
    if (body.content !== undefined) {
        contentKey = `posts/${slug}.md`;
        await s3.send(
            new PutObjectCommand({
                Bucket: CONTENT_BUCKET,
                Key: contentKey,
                Body: body.content,
                ContentType: "text/markdown"
            })
        );
    }

    // Build update expression dynamically
    const updateExprParts: string[] = ["#updatedAt = :updatedAt"];
    const exprAttrNames: Record<string, string> = { "#updatedAt": "updatedAt" };
    const exprAttrValues: Record<string, any> = { ":updatedAt": now };

    if (body.title !== undefined) {
        updateExprParts.push("#title = :title");
        exprAttrNames["#title"] = "title";
        exprAttrValues[":title"] = body.title;
    }
    if (body.summary !== undefined) {
        updateExprParts.push("#summary = :summary");
        exprAttrNames["#summary"] = "summary";
        exprAttrValues[":summary"] = body.summary;
    }
    if (body.tags !== undefined) {
        updateExprParts.push("#tags = :tags");
        exprAttrNames["#tags"] = "tags";
        exprAttrValues[":tags"] = body.tags;
    }
    if (contentKey !== undefined) {
        updateExprParts.push("#contentKey = :contentKey");
        exprAttrNames["#contentKey"] = "contentKey";
        exprAttrValues[":contentKey"] = contentKey;
    }
    if (body.status !== undefined) {
        updateExprParts.push("#status = :status");
        exprAttrNames["#status"] = "status";
        exprAttrValues[":status"] = body.status;

        // Set publishedAt when publishing for the first time (as Unix timestamp for GSI)
        if (body.status === "published" && !existingItem.publishedAt) {
            updateExprParts.push("#publishedAt = :publishedAt");
            exprAttrNames["#publishedAt"] = "publishedAt";
            exprAttrValues[":publishedAt"] = Date.now();
        }
    }

    const updateResp = await ddb.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                postId: existingItem.postId
            },
            UpdateExpression: "SET " + updateExprParts.join(", "),
            ExpressionAttributeNames: exprAttrNames,
            ExpressionAttributeValues: exprAttrValues,
            ReturnValues: "ALL_NEW"
        })
    );

    return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true, item: updateResp.Attributes })
    };
}
