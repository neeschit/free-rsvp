import { Resource } from "sst";
import { QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { redirect, useLoaderData, Form } from "react-router";
import { noCacheHeaders } from "~/headers";
import { getClient } from "~/model/client";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import type { EventBase, RsvpBase, InviteMetadata } from "~/model/event";
import { 
    createEventPK, 
    createMetadataSK, 
    createRsvpSK,
    createUserPK,
    createUserRsvpSK,
    extractEventIdFromPK
} from "~/model/event";
import { getUserId } from "~/model/userId.server";
import { Button } from "~/components/ui/Button";
import { EventDetails } from "~/components/events/EventDetails";
import { GuestList } from "~/components/events/GuestList";
import { InviteList } from "~/components/events/InviteList";
import { GatedFeature } from "~/components/ui/GatedFeature";
import * as patterns from "~/styles/tailwind-patterns";

export const meta: MetaFunction = () => {
    return [
        { title: "Event Details - Kiddobash" },
        { name: "description", content: "View event details and RSVP" },
    ];
};

export { noCacheHeaders as headers };

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
    const guestName = formData.get('guestName')?.toString() || '';
    const rsvpStatus = formData.get('rsvpStatus')?.toString() as "Going" | "Not Going" | "Maybe";

    if (!guestName || !rsvpStatus) {
        throw new Response('Name and RSVP status are required', {
            status: 400,
        });
    }

    try {
        // Get the event details for denormalization
        const eventResult = await client.send(new QueryCommand({
            TableName: Resource.Kiddobash.name,
            KeyConditionExpression: "PK = :pk AND SK = :sk",
            ExpressionAttributeValues: {
                ":pk": createEventPK(eventId),
                ":sk": createMetadataSK()
            }
        }));

        // Check if event exists
        if (!eventResult.Items || eventResult.Items.length === 0) {
            throw new Response('Event not found', { status: 404 });
        }

        const event = eventResult.Items[0] as EventBase;
        const timestamp = Date.now();
        const updateDate = new Date().toISOString();

        // Use a transaction to create both entries (RSVP on event + user's RSVP record)
        await client.send(new TransactWriteCommand({
            TransactItems: [
                // Create the RSVP on the event
                {
                    Update: {
                        TableName: Resource.Kiddobash.name,
                        Key: {
                            PK: createEventPK(eventId),
                            SK: createRsvpSK(userId, timestamp)
                        },
                        UpdateExpression: "SET DisplayName = :name, RSVPStatus = :status, UpdatedAt = :updatedAt",
                        ExpressionAttributeValues: {
                            ":name": guestName,
                            ":status": rsvpStatus,
                            ":updatedAt": updateDate
                        }
                    }
                },
                // Create the bidirectional relationship on the user
                {
                    Update: {
                        TableName: Resource.Kiddobash.name,
                        Key: {
                            PK: createUserPK(userId),
                            SK: createUserRsvpSK(eventId)
                        },
                        UpdateExpression: "SET EventName = :eventName, RSVPStatus = :status, Date = :date, UpdatedAt = :updatedAt",
                        ExpressionAttributeValues: {
                            ":eventName": event.EventName,
                            ":status": rsvpStatus,
                            ":date": event.Date,
                            ":updatedAt": updateDate
                        }
                    }
                }
            ]
        }));

        return redirect(`/event/${eventId}`);
    } catch (e) {
        console.log(e);
        throw new Response('unexpected_error', {
            status: 500,
        });
    }
}

// Define the data we expect from the loader
type EventLoaderData = {
    event: EventBase;
    guests: RsvpBase[];
    isHost: boolean;
    eventId: string;
    invites: InviteMetadata[];
};

export async function loader({
    request,
    params,
}: LoaderFunctionArgs) {
    const client = getClient();
    const headersToUse = noCacheHeaders();

    const eventId = params.eventId;
    if (!eventId) {
        return redirect('/', {
            status: 403,
            headers: headersToUse 
        });
    }

    const userId = getUserId(request);

    try {
        // First try to find the exact event by direct query
        const exactPK = createEventPK(eventId);
        const metadataSK = createMetadataSK();
        
        const exactMatchResult = await client.send(new QueryCommand({
            TableName: Resource.Kiddobash.name,
            KeyConditionExpression: "PK = :pk AND SK = :sk",
            ExpressionAttributeValues: {
                ":pk": exactPK,
                ":sk": metadataSK
            },
            Limit: 1
        }));

        
        // Safely check if we have results and parse the event
        let event: EventBase | undefined;
        
        if (exactMatchResult.Items && exactMatchResult.Items.length > 0) {
            
            const foundItem = exactMatchResult.Items[0];
            
            // Create a proper event object with all required fields
            event = {
                PK: foundItem.PK,
                SK: foundItem.SK,
                HostId: foundItem.HostId,
                EventName: foundItem.EventName,
                Date: foundItem.Date,
                Time: foundItem.Time,
                Location: foundItem.Location,
                isPublic: !!foundItem.isPublic,
                CreatedAt: foundItem.CreatedAt || new Date().toISOString(),
                Theme: foundItem.Theme
            };
        }

        // Check if an event was found AND if the found event has essential data
        if (!event || !event.EventName || !event.Date || !event.Time || !event.Location) {
            console.log("No valid event found or essential data missing", event ? JSON.stringify(event) : "No event object");
            // Return 404 with headers
            throw new Response(null, { 
                status: 404,
                statusText: "Event not found!",
                headers: headersToUse,
            });
        }

        // Check if user is the host
        const isHost = Boolean(userId && event.HostId === createUserPK(userId));
        
        // If not the host and not already on the RSVP page, redirect to it
        if (!isHost) {
            // Check if we're on the main event page (not already on rsvp)
            const url = new URL(request.url);
            if (!url.pathname.endsWith('/rsvp')) {
                // Add headers to redirect
                return redirect(`/rsvp/${eventId}`, { headers: headersToUse });
            }
        }

        // Query for all RSVPs for this event
        const guestsResult = await client.send(new QueryCommand({
            TableName: Resource.Kiddobash.name,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
            ExpressionAttributeValues: {
                ":pk": event.PK,
                ":skPrefix": "RSVP#"
            }
        }));

        const guests = (guestsResult.Items || []) as RsvpBase[];

        // Query for invites
        const invitesResult = await client.send(new QueryCommand({
            TableName: Resource.Kiddobash.name,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
            ExpressionAttributeValues: {
                ":pk": event.PK,
                ":skPrefix": "INVITE_METADATA#"
            }
        }));

        const invites = (invitesResult.Items || []) as InviteMetadata[];

        const data: EventLoaderData = {
            event,
            guests,
            isHost,
            eventId: extractEventIdFromPK(event.PK) || eventId,
            invites
        };

        // Return Response manually with stringified data and headers
        return new Response(JSON.stringify(data), {
             headers: { ...headersToUse, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        // Simplified error handling: Only add headers to new Response objects
        if (error instanceof Response) {
            // Re-throw existing Response objects without modification here
            // If they need no-cache headers, they should be thrown with them initially
            throw error; 
        }

        // Handle other errors
        console.error("Event loader error:", error);
        // Throw new Response with no-cache headers
        throw new Response(null, { 
            status: 500,
            statusText: "Server Error",
            headers: headersToUse,
        });
    }
}

// This is the main React component for the event page
export default function EventPage() {
    const data = useLoaderData<EventLoaderData>();

    // Destructure the data for easier access
    const { event, guests, isHost, eventId, invites } = data;

    return (
        <div className="flex flex-col min-h-screen">
            
            <main className={`flex-grow ${patterns.bgSecondary}`}>
                <div className={patterns.container}>
                    <div className="py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <EventDetails event={event} isHost={isHost} />
                                
                                {isHost && (
                                    <InviteList invites={invites} className="mt-8" />
                                )}
                                
                                <GuestList guests={guests} className="mt-8" />
                            </div>
                            
                            <div>
                                {isHost && (
                                    <GatedFeature isLocked={true} lockMessage="Auto send invitations coming soon!">
                                        <div id="invite-guests" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Invite Guests</h2>
                                            <Form method="post" className="space-y-4">
                                                <div>
                                                    <label htmlFor="guestEmails" className="flex flex-col text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                        <span>Guest Emails</span>
                                                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Enter one email address per line</span>
                                                    </label>
                                                    <textarea
                                                        id="guestEmails"
                                                        name="guestEmails"
                                                        rows={4}
                                                        required
                                                        placeholder={`example1@example.com\nexample2@example.com`}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                                    ></textarea>
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                        Enter each guest's email address on a new line.
                                                    </p>
                                                </div>
                                                
                                                <Button type="submit" className="w-full">
                                                    Send Invitations
                                                </Button>
                                            </Form>
                                        </div>
                                  z  </GatedFeature>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
        </div>
    );
}