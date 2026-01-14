import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";


const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME;
const s3 = new S3Client({});
const CONTENT_BUCKET = process.env.CONTENT_BUCKET;

async function streamToString(stream: any): Promise<string> {
    if (typeof stream?.transformToString === "function") {
        // Node 18+/20 on Lambda often supports this on the Body
        return await stream.transformToString();
    }

    // Fallback for streams
    return await new Promise((resolve, reject) => {
        const chunks: any[] = [];
        (stream as Readable).on("data", (chunk) => chunks.push(chunk));
        (stream as Readable).on("error", reject);
        (stream as Readable).on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    });
}


export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    if (!TABLE_NAME) {
        return {
            statusCode: 500,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Missing TABLE_NAME env var" })
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

    const resp = await ddb.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "slug-index",
            KeyConditionExpression: "#sl = :slug",
            ExpressionAttributeNames: { "#sl": "slug" },
            ExpressionAttributeValues: { ":slug": slug },
            Limit: 1
        })
    );

    const item = resp.Items?.[0];
    if (!item) {
        return {
            statusCode: 404,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Not found" })
        };
    }
    //   if (item.status !== "published") return { statusCode: 404 }
    if (!CONTENT_BUCKET) {
        return {
            statusCode: 500,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ok: false, error: "Missing CONTENT_BUCKET env var" })
        };
    }

    const contentKey = item.contentKey as string | undefined;

    // If you haven't uploaded content yet, allow metadata-only response
    let content: string | null = null;

    if (contentKey) {
        const obj = await s3.send(
            new GetObjectCommand({
                Bucket: CONTENT_BUCKET,
                Key: contentKey
            })
        );

        if (!obj.Body) {
            return {
                statusCode: 500,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ ok: false, error: "S3 object had no body" })
            };
        }

        content = await streamToString(obj.Body);
    }

    return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true, item, content })
    };

}
