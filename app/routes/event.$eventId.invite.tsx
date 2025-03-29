import { Resource } from "sst";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { redirect, useLoaderData, Form } from "react-router";
import { headers } from "~/headers";
import { getClient } from "~/model/client";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import type { EventBase } from "~/model/event";
import { 
    createEventPK, 
    createMetadataSK, 
    createInviteSK 
} from "~/model/event";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getUserId } from "~/model/userId.server";

export const meta: MetaFunction = () => {
    return [
        { title: "Send Invitations - Kiddobash" },
        { name: "description", content: "Invite guests to your event" },
    ];
};

export async function action({
    request,
    params
}: ActionFunctionArgs) {
    const formData = await request.formData();
    const client = getClient();

    const userId = getUserId(request);

    if (!params.eventId) {
        throw new Response('Event ID is required', {
            status: 400,
        });
    }

    const eventId = params.eventId;
    const guestEmails = formData.get('guestEmails')?.toString() || '';
    
    if (!guestEmails.trim()) {
        throw new Response('At least one guest email is required', {
            status: 400,
        });
    }

    // Get event to ensure user is the host
    const eventResult = await client.send(new QueryCommand({
        TableName: Resource.Kiddobash.name,
        KeyConditionExpression: "PK = :pk AND SK = :sk",
        ExpressionAttributeValues: {
            ":pk": createEventPK(eventId),
            ":sk": createMetadataSK()
        }
    }));

    if (!eventResult.Items?.length) {
        return redirect('/', {
            status: 404,
            statusText: "Event not found"
        });
    }

    const event = eventResult.Items[0] as EventBase;
    
    // Verify user is the host
    if (event.HostId !== `USER#${userId}`) {
        return redirect(`/event/${eventId}`, {
            status: 403,
            statusText: "Only the host can send invitations"
        });
    }

    try {
        // Process each email
        const emails = guestEmails.split(',').map(email => email.trim()).filter(Boolean);
        
        for (const email of emails) {
            const invitationId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            
            await client.send(new UpdateCommand({
                TableName: Resource.Kiddobash.name,
                Key: {
                    PK: createEventPK(eventId),
                    SK: createInviteSK(invitationId)
                },
                UpdateExpression: "SET GuestEmail = :email, RSVPStatus = :status, InvitationSent = :sent, UpdatedAt = :updatedAt",
                ExpressionAttributeValues: {
                    ":email": email,
                    ":status": "Maybe",
                    ":sent": true,
                    ":updatedAt": new Date().toISOString()
                }
            }));
        }

        return redirect(`/event/${eventId}?invitationsSent=true`);
    } catch (e) {
        console.error(e);
        throw new Response('unexpected_error', {
            status: 500,
        });
    }
}

export async function loader({
    request,
    params,
}: LoaderFunctionArgs) {
    const client = getClient();

    const eventId = params.eventId;
    if (!eventId) {
        return redirect('/', {
            status: 403
        });
    }

    const userId = getUserId(request);

    // Query for the event metadata
    const eventResult = await client.send(new QueryCommand({
        TableName: Resource.Kiddobash.name,
        KeyConditionExpression: "PK = :pk AND SK = :sk",
        ExpressionAttributeValues: {
            ":pk": createEventPK(eventId),
            ":sk": createMetadataSK()
        }
    }));

    if (!eventResult.Items?.length) {
        return redirect('/', {
            status: 404,
            statusText: "Event not found"
        });
    }

    const event = eventResult.Items[0] as EventBase;

    // Verify user is the host
    if (event.HostId !== `USER#${userId}`) {
        return redirect(`/event/${eventId}`, {
            status: 403,
            statusText: "Only the host can send invitations"
        });
    }

    return new Response(JSON.stringify({
        event,
        eventId
    }), {
        headers: headers(),
    });
}

export type InviteLoaderData = {
    event: EventBase;
    eventId: string;
};

export default function InvitePage() {
    const { event, eventId } = useLoaderData<InviteLoaderData>();

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Send Invitations</h1>
            <p className="mb-6">
                <strong>Event:</strong> {event.EventName} 
                <span className="mx-2">•</span>
                <strong>Date:</strong> {event.Date} 
                <span className="mx-2">•</span>
                <strong>Time:</strong> {event.Time}
            </p>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <Form method="post" className="space-y-6">
                    <div>
                        <label htmlFor="guestEmails" className="block text-sm font-medium text-gray-700 mb-1">
                            Guest Emails
                        </label>
                        <textarea
                            id="guestEmails"
                            name="guestEmails"
                            rows={6}
                            required
                            placeholder="Enter email addresses separated by commas
example1@example.com, example2@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                        <p className="mt-1 text-sm text-gray-500">
                            Separate multiple email addresses with commas
                        </p>
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Send Invitations
                    </button>
                </Form>
            </div>
            
            <div className="mt-6 text-center">
                <a 
                    href={`/event/${eventId}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                >
                    Return to Event
                </a>
            </div>
        </main>
    );
} 