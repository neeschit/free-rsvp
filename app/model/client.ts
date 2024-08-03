
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, } from "@aws-sdk/lib-dynamodb";

let client: DynamoDBClient | null = null;

export function getClient() {
    if (!client) {
        client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    }

    return client;
}