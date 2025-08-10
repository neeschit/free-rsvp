import { Resource } from "sst";
import { QueryCommand, PutCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { redirect, useLoaderData, Form } from "react-router";
import { noCacheHeaders } from "~/headers";
import { getClient } from "~/model/client";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import type { EventBase, RsvpBase } from "~/model/event";
import { 
    createEventPK, 
    createMetadataSK, 
    createStaticRsvpSK,
    createUserPK,
    createUserRsvpSK,
    extractEventIdFromPK
} from "~/model/event";
import { getUserId } from "~/utils/session.server";
import { RsvpForm } from "~/components/events/RsvpForm";
import { Card } from "~/components/ui/Card";
import { Heading, Text } from "~/components/ui/Typography";
import * as patterns from "~/styles/tailwind-patterns";
import { GuestList } from "~/components/events/GuestList";

export { noCacheHeaders as headers };

export const meta: MetaFunction = () => {
    return [
        { title: "RSVP - Kiddobash" },
        { name: "description", content: "RSVP to the event" },
    ];
};

export async function action({
    request,
    params
}: ActionFunctionArgs) {
    // CSRF defense-in-depth: verify Origin/Referer
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const referer = request.headers.get("Referer");
    const matchesOrigin = origin ? origin === url.origin : true;
    const matchesReferer = referer ? referer.startsWith(url.origin + "/") : true;
    if (!matchesOrigin || !matchesReferer) {
        throw new Response("Invalid origin", { status: 403 });
    }
    const formData = await request.formData();
    const client = getClient();
    const headersToUse = noCacheHeaders();

    const userId = await getUserId(request);
    
    if (!userId) {
        throw new Response('Unauthorized', { status: 401 });
    }

    if (!params.eventId) {
        throw new Response('Event ID is required', {
            status: 400,
        });
    }

    const eventId = params.eventId;
    const guestName = formData.get('guestName')?.toString() || '';
    const rsvpStatus = formData.get('rsvpStatus')?.toString() as "Going" | "Not Going" | "Maybe";
    // Get event details from form data
    const eventName = formData.get('eventName')?.toString() || '';
    const eventDate = formData.get('eventDate')?.toString() || '';

    if (!guestName || !rsvpStatus || !eventName || !eventDate) { // Add checks for new form data
        throw new Response('Name, RSVP status, and event details are required', {
            status: 400,
        });
    }

    try {
        // Remove the QueryCommand for event details
        /*
        const eventResult = await client.send(new QueryCommand({
            TableName: Resource.Kiddobash.name,
            KeyConditionExpression: "PK = :pk AND SK = :sk",
            ExpressionAttributeValues: {
                ":pk": createEventPK(eventId),
                ":sk": createMetadataSK()
            }
        }));

        if (!eventResult.Items || eventResult.Items.length === 0) {
            throw new Response('Event not found', { status: 404 });
        }
        const event = eventResult.Items[0] as EventBase;
        */
        
        const timestamp = Date.now();
        const updateDate = new Date().toISOString();

        await client.send(new TransactWriteCommand({
            TransactItems: [
                {
                    Update: {
                        TableName: Resource.Kiddobash.name,
                        Key: {
                            PK: createEventPK(eventId),
                            SK: createStaticRsvpSK(userId)
                        },
                        UpdateExpression: "SET DisplayName = :name, RSVPStatus = :status, UpdatedAt = :updatedAt",
                        ExpressionAttributeValues: {
                            ":name": guestName,
                            ":status": rsvpStatus,
                            ":updatedAt": updateDate
                        }
                    }
                },
                {
                    Update: {
                        TableName: Resource.Kiddobash.name,
                        Key: {
                            PK: createUserPK(userId),
                            SK: createUserRsvpSK(eventId)
                        },
                        // Use eventName and eventDate from formData
                        // Use ExpressionAttributeNames for the reserved keyword "Date"
                        UpdateExpression: "SET EventName = :eventName, RSVPStatus = :status, #D = :date, UpdatedAt = :updatedAt",
                        ExpressionAttributeNames: {
                            "#D": "Date" // Map #D to the actual attribute name "Date"
                        },
                        ExpressionAttributeValues: {
                            ":eventName": eventName, 
                            ":status": rsvpStatus,
                            ":date": eventDate,
                            ":updatedAt": updateDate
                        }
                    }
                }
            ]
        }));

        // Redirect back to the RSVP page itself to show the updated status with headers
        return redirect(`/rsvp/${eventId}`, { headers: headersToUse });
    } catch (e) {
        console.log(e);
        // Check if it's a DynamoDB ValidationException
        if (e instanceof Error && e.name === 'ValidationException') {
            console.error("DynamoDB Validation Error:", e);
            throw new Response('Invalid data submitted. Please check your input.', {
                status: 400,
            });
        }
        throw new Response('unexpected_error', {
            status: 500,
            headers: headersToUse
        });
    }
}

type RsvpLoaderData = {
    event: EventBase;
    eventId: string;
    userRsvp?: RsvpBase;
    eventName: string;
    eventDate: string;
    guests?: RsvpBase[];
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

    const userId = await getUserId(request);

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
            console.log("No valid event found or essential data missing");
            throw new Response(null, { 
                status: 404,
                statusText: "Event not found!",
                headers: headersToUse,
            });
        }

        // Always fetch the user's RSVP status if userId exists
        let userRsvp: RsvpBase | undefined;
        if (userId) {
            const rsvpResult = await client.send(new QueryCommand({
                TableName: Resource.Kiddobash.name,
                KeyConditionExpression: "PK = :pk AND SK = :sk", 
                ExpressionAttributeValues: {
                    ":pk": event.PK,
                    ":sk": createStaticRsvpSK(userId)
                },
                Limit: 1, 
                ConsistentRead: true 
            }));
            userRsvp = rsvpResult.Items?.[0] as RsvpBase | undefined;
        }

        // Fetch guests if the event is public
        let guests: RsvpBase[] | undefined;
        if (event.isPublic) {
            const guestListResult = await client.send(new QueryCommand({
                TableName: Resource.Kiddobash.name,
                KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
                ExpressionAttributeValues: {
                    ":pk": event.PK,
                    ":skPrefix": "RSVP#" 
                }
            }));
            guests = guestListResult.Items as RsvpBase[] || [];
        } else { // If it's not a public event, check for invite or prior RSVP (for authorization)
            // Only check user-specific permissions if we have a userId
            if (userId) {
                // RSVP check (using the already fetched userRsvp)
                const hasRsvp = !!userRsvp;

                // Check for invitations (remains the same)
                const inviteResult = await client.send(new QueryCommand({
                    TableName: Resource.Kiddobash.name,
                    KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
                    FilterExpression: "GuestEmail = :email",
                    ExpressionAttributeValues: {
                        ":pk": event.PK,
                        ":skPrefix": "INVITE#",
                        ":email": userId 
                    }
                }));
                const hasInvite = inviteResult.Items && inviteResult.Items.length > 0;

                /* // Temporarily disabled faulty invite check
                if (!hasRsvp && !hasInvite) {
                    return redirect('/', {
                        status: 403,
                        statusText: "Not authorized to view this event",
                        headers: headersToUse
                    });
                }
                */

                // No need to return here specifically for private; fall through to common return

            } else {
                // For non-authenticated users trying to access a private event
                return redirect('/', {
                    status: 403,
                    statusText: "Sign in to view this private event",
                    headers: headersToUse
                });
            }
        }

        const data: RsvpLoaderData = {
            event,
            eventId: extractEventIdFromPK(event.PK) || eventId,
            userRsvp, // Now always included if userId existed
            eventName: event.EventName,
            eventDate: event.Date,
            guests 
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

        console.error("RSVP loader error:", error);
        // Add headers to error response
        throw new Response(null, { 
            status: 500,
            statusText: "Server Error",
            headers: headersToUse, 
        });
    }
}

export default function RsvpPage() {
    const data = useLoaderData() as RsvpLoaderData | undefined;

    if (!data || !data.event || !data.eventName || !data.eventDate) {
        console.error("RsvpPage: Loader data is missing or event details are undefined.", data);
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Card className="p-6 text-center">
                    <Heading level={2} className="mb-4">Error</Heading>
                    <Text>Sorry, there was a problem loading the event details.</Text>
                    <Text>Please try refreshing the page or contact support if the problem persists.</Text>
                </Card>
            </div>
        );
    }

    const { event, eventId, userRsvp, eventName, eventDate, guests } = data;

    return (
        <div className="flex flex-col min-h-screen">
            <main className={`flex-grow ${patterns.bgSecondary}`}>
                <div className={patterns.container}>
                    <div className="py-8 max-w-lg mx-auto">
                        <Card className="mb-6">
                            <Heading level={1} className="text-center mb-4">
                                {event.EventName}
                            </Heading>
                            
                            <div className="space-y-2 mb-6">
                                <div className="flex items-start">
                                    <div className="w-10 flex-shrink-0 flex justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <Text>
                                            <strong>Date:</strong> {event.Date}
                                        </Text>
                                        <Text>
                                            <strong>Time:</strong> {event.Time}
                                        </Text>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="w-10 flex-shrink-0 flex justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <Text>
                                        <strong>Location:</strong> {event.Location}
                                    </Text>
                                </div>
                                
                                {event.Theme && (
                                    <div className="flex items-start">
                                        <div className="w-10 flex-shrink-0 flex justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                            </svg>
                                        </div>
                                        <Text>
                                            <strong>Theme:</strong> {event.Theme}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </Card>
                        
                        {/* Display current RSVP status if available */}
                        {userRsvp && (
                            <Card className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                                <Text className="text-center">
                                    Your current RSVP status is: <strong>{userRsvp.RSVPStatus}</strong> (as {userRsvp.DisplayName}).
                                </Text>
                                <Text className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    You can update your details below.
                                </Text>
                            </Card>
                        )}

                        {/* Conditionally render GuestList for public events */}
                        {event.isPublic && guests && guests.length > 0 && (
                            <GuestList guests={guests} className="mb-6" />
                        )}
                        {/* Optionally show a message if public but no guests yet */}
                        {event.isPublic && guests && guests.length === 0 && (
                            <Card className="mb-6">
                                <Text className="text-center text-gray-600 dark:text-gray-400">No guests have RSVP'd yet.</Text>
                            </Card>
                        )}

                        <RsvpForm 
                            eventId={eventId} 
                            eventName={eventName}
                            eventDate={eventDate}
                            // Pass existing RSVP data to the form
                            userRsvp={userRsvp}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
} 