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

    const items: Record<string, any>[] = [];
    let lastEvaluatedKey: Record<string, unknown> | undefined;

    do {
        const resp = await ddb.send(
            new ScanCommand({
                TableName: TABLE_NAME,
                ExclusiveStartKey: lastEvaluatedKey
            })
        );
        items.push(...(resp.Items ?? []));
        lastEvaluatedKey = resp.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    const normalized = items
      .map((it: any) => ({
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
      }))
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        const dateB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        return dateB - dateA;
      });

    return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true, items: normalized })
    };
}
