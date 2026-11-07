import os

import boto3
from botocore.exceptions import ClientError


TABLE_NAME = os.getenv("DYNAMODB_TABLE", "VideoHubVideos")
REGION = os.getenv("AWS_REGION", "us-east-1")


def main() -> None:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    try:
        table = dynamodb.create_table(
            TableName=TABLE_NAME,
            KeySchema=[{"AttributeName": "videoId", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "videoId", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        table.wait_until_exists()
        print(f"Tabla creada: {TABLE_NAME}")
    except ClientError as error:
        if error.response["Error"]["Code"] == "ResourceInUseException":
            print(f"La tabla ya existe: {TABLE_NAME}")
            return
        raise


if __name__ == "__main__":
    main()
