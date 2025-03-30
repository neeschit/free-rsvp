import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let client: DynamoDBDocumentClient | null = null;

export function getClient() {
    if (!client) {
        console.log("Creating new DynamoDB client");
        
        // Create the base client with retry options
        const baseClient = new DynamoDBClient({
            maxAttempts: 3,
            logger: console,
            retryMode: 'standard'
        });
        
        // Create the document client with marshalling options
        client = DynamoDBDocumentClient.from(baseClient, {
            marshallOptions: {
                // Convert empty strings, blobs, and sets to null
                convertEmptyValues: true,
                // Remove undefined values
                removeUndefinedValues: true,
            }
        });
    }

    return client;
}