import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME;

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    if (!TABLE_NAME) {
        return {
            statusCode: 500,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Missing TABLE_NAME env var" })
        };
    }

    const id = event.pathParameters?.id;
    if (!id) {
        return {
            statusCode: 400,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Missing id path param" })
        };
    }

    const resp = await ddb.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: { postId: id }
        })
    );

    const item = resp.Item;
    if (!item || item.status !== "published") {
        return {
            statusCode: 404,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Not found" })
        };
    }

    return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            ok: true,
            item: {
                id: item.postId,
                slug: item.slug,
                title: item.title,
                summary: item.summary,
                status: item.status,
                publishedAt: item.publishedAt,
                updatedAt: item.updatedAt,
                tags: item.tags
            }
        })
    };
}
