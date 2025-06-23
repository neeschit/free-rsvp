import { Resource } from "sst";
import type { LoaderFunctionArgs } from "react-router";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getClient } from "~/model/client";
import { createEventPK, createInviteMetadataSK } from "~/model/event";

// 1x1 transparent PNG pixel data
const PIXEL_DATA = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  'base64'
);

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const inviteId = url.searchParams.get('inviteId');
  const eventId = url.searchParams.get('eventId');

  // Always return the pixel, even if tracking fails
  const pixelResponse = new Response(PIXEL_DATA, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': PIXEL_DATA.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

  // Track the open if we have the required parameters
  if (inviteId && eventId) {
    try {
      const client = getClient();
      
      // Update the invite metadata to mark as opened
      await client.send(new UpdateCommand({
        TableName: Resource.Kiddobash.name,
        Key: {
          PK: createEventPK(eventId),
          SK: createInviteMetadataSK(inviteId)
        },
        UpdateExpression: "SET OpenedAt = :openedAt, #status = :status",
        ExpressionAttributeNames: {
          "#status": "Status"
        },
        ExpressionAttributeValues: {
          ":openedAt": new Date().toISOString(),
          ":status": "Opened"
        },
        // Don't fail if the item doesn't exist
        ReturnValues: "NONE"
      }));

      console.log(`Email opened: inviteId=${inviteId}, eventId=${eventId}`);
    } catch (error) {
      console.error('Failed to track email open:', error);
      // Don't fail the pixel response even if tracking fails
    }
  }

  return pixelResponse;
} 