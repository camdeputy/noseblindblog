import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME;

export async function handler(
    _event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
    if (!TABLE_NAME) {
        return {
            statusCode: 500,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Missing TABLE_NAME env var" })
        };
    }

    // Scan all posts (admin view includes drafts and published)
    const resp = await ddb.send(
        new ScanCommand({
            TableName: TABLE_NAME,
            Limit: 100
        })
    );

    const items = (resp.Items ?? []).map((it: any) => ({
        id: it.postId,
        slug: it.slug,
        title: it.title,
        summary: it.summary,
        status: it.status,
        tags: it.tags,
        contentKey: it.contentKey,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
        publishedAt: it.publishedAt
    }));

    return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true, items })
    };
}
