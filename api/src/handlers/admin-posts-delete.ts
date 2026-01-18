import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const TABLE_NAME = process.env.TABLE_NAME;
const CONTENT_BUCKET = process.env.CONTENT_BUCKET;

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

    // Delete content from S3 if exists
    const contentKey = existingItem.contentKey as string | undefined;
    if (contentKey) {
        await s3.send(
            new DeleteObjectCommand({
                Bucket: CONTENT_BUCKET,
                Key: contentKey
            })
        );
    }

    // Delete from DynamoDB
    await ddb.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                postId: existingItem.postId
            }
        })
    );

    return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true, deleted: slug })
    };
}
