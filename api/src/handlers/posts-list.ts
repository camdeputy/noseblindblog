import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

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

  const resp = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "published-index",
      KeyConditionExpression: "#st = :published",
      ExpressionAttributeNames: { "#st": "status" },
      ExpressionAttributeValues: { ":published": "published" },
      Limit: 50
    })
  );  

  const items = (resp.Items ?? []).map((it: any) => ({
    slug: it.slug ?? it.PK?.replace("POST#", ""), // supports either style
    title: it.title,
    summary: it.summary,
    status: it.status,
    publishedAt: it.publishedAt,
    updatedAt: it.updatedAt,
    tags: it.tags
  }));

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true, items })
  };
}
