import os
from datetime import datetime, timezone
from uuid import uuid4

import boto3


TABLE_NAME = os.getenv("DYNAMODB_TABLE", "VideoHubVideos")
REGION = os.getenv("AWS_REGION", "us-east-1")


def main() -> None:
    table = boto3.resource("dynamodb", region_name=REGION).Table(TABLE_NAME)
    now = datetime.now(timezone.utc).isoformat()
    videos = [
        {
            "videoId": str(uuid4()),
            "title": "Introducción a VideoHub",
            "description": "Video de prueba para la entrega intermedia.",
            "category": "educación",
            "videoUrl": "https://example.com/videos/introduccion",
            "thumbnailUrl": "https://example.com/images/introduccion.jpg",
            "views": 0,
            "publishedAt": now,
        },
        {
            "videoId": str(uuid4()),
            "title": "Demo de despliegue en AWS",
            "description": "Caso de uso ejecutado desde API Gateway hasta DynamoDB.",
            "category": "tecnología",
            "videoUrl": "https://example.com/videos/aws",
            "thumbnailUrl": "https://example.com/images/aws.jpg",
            "views": 0,
            "publishedAt": now,
        },
    ]
    with table.batch_writer() as batch:
        for video in videos:
            batch.put_item(Item=video)
    print(f"Datos de prueba insertados en {TABLE_NAME}: {len(videos)} videos")


if __name__ == "__main__":
    main()
