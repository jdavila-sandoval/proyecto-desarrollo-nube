import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import type { CloudVideo, CreateCloudVideoInput } from "./cloud-video.types.js";

const tableName = process.env.DYNAMODB_TABLE || "VideoHubVideos";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
  }),
  { marshallOptions: { removeUndefinedValues: true } },
);

export async function listCloudVideos(category?: string): Promise<CloudVideo[]> {
  const result = await client.send(
    new ScanCommand({
      TableName: tableName,
      ...(category
        ? {
            FilterExpression: "#category = :category",
            ExpressionAttributeNames: { "#category": "category" },
            ExpressionAttributeValues: { ":category": category },
          }
        : {}),
    }),
  );

  return ((result.Items ?? []) as CloudVideo[]).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export async function getCloudVideo(videoId: string): Promise<CloudVideo | undefined> {
  const result = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: { videoId },
    }),
  );

  return result.Item as CloudVideo | undefined;
}

export async function createCloudVideo(input: CreateCloudVideoInput): Promise<CloudVideo> {
  const video: CloudVideo = {
    videoId: randomUUID(),
    title: input.title,
    description: input.description ?? "",
    category: input.category,
    videoUrl: input.videoUrl,
    thumbnailUrl: input.thumbnailUrl ?? "",
    views: 0,
    publishedAt: new Date().toISOString(),
  };

  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: video,
      ConditionExpression: "attribute_not_exists(videoId)",
    }),
  );

  return video;
}
