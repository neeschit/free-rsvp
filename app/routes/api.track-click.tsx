import { Resource } from "sst";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getClient } from "~/model/client";
import { createEventPK, createInviteMetadataSK } from "~/model/event";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const inviteId = url.searchParams.get('inviteId');
  const eventId = url.searchParams.get('eventId');
  
  // Default redirect URL
  let redirectUrl = '/';
  
  if (eventId) {
    redirectUrl = `/rsvp/${eventId}`;
    
    // Add invite parameter to RSVP URL if we have inviteId
    if (inviteId) {
      redirectUrl += `?invite=${inviteId}`;
    }
  }

  // Track the click if we have the required parameters
  if (inviteId && eventId) {
    try {
      const client = getClient();
      
      // Update the invite metadata to mark as clicked
      await client.send(new UpdateCommand({
        TableName: Resource.Kiddobash.name,
        Key: {
          PK: createEventPK(eventId),
          SK: createInviteMetadataSK(inviteId)
        },
        UpdateExpression: "SET ClickedAt = :clickedAt, #status = :status",
        ExpressionAttributeNames: {
          "#status": "Status"
        },
        ExpressionAttributeValues: {
          ":clickedAt": new Date().toISOString(),
          ":status": "Clicked"
        },
        ReturnValues: "NONE"
      }));

      console.log(`Email clicked: inviteId=${inviteId}, eventId=${eventId}`);
    } catch (error) {
      console.error('Failed to track email click:', error);
      // Continue with redirect even if tracking fails
    }
  }

  return redirect(redirectUrl);
} 