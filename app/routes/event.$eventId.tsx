import { Resource } from "sst";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { redirect, useLoaderData, useSubmit, Form, useParams } from "react-router";
import { headers } from "~/headers";
import { getClient } from "~/model/client";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import type { EventBase, GuestBase } from "~/model/event";
import { 
    createEventPK, 
    createMetadataSK, 
    createGuestSK,
    createUserPK
} from "~/model/event";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getUserId } from "~/model/userId.server";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { Button } from "~/components/ui/Button";
import { Heading, Text } from "~/components/ui/Typography";
import { EventDetails } from "~/components/events/EventDetails";
import { GuestList } from "~/components/events/GuestList";
import { RsvpForm } from "~/components/events/RsvpForm";
import * as patterns from "~/styles/tailwind-patterns";

export const meta: MetaFunction = () => {
    return [
        { title: "Event Details - Kiddobash" },
        { name: "description", content: "View event details and RSVP" },
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
    const guestName = formData.get('guestName')?.toString() || '';
    const rsvpStatus = formData.get('rsvpStatus')?.toString() as "Going" | "Not Going" | "Maybe";

    if (!guestName || !rsvpStatus) {
        throw new Response('Name and RSVP status are required', {
            status: 400,
        });
    }

    try {
        // Create a unique guest ID
        const guestId = `${userId}-${Date.now()}`;
        
        // Create a new guest entry
        await client.send(new UpdateCommand({
            TableName: Resource.Kiddobash.name,
            Key: {
                PK: createEventPK(eventId),
                SK: createGuestSK(guestId)
            },
            UpdateExpression: "SET DisplayName = :name, RSVPStatus = :status, UpdatedAt = :updatedAt",
            ExpressionAttributeValues: {
                ":name": guestName,
                ":status": rsvpStatus,
                ":updatedAt": new Date().toISOString()
            },
            ReturnValues: "ALL_NEW"
        }));

        return redirect(`/event/${eventId}`);
    } catch (e) {
        console.log(e);
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
            // Return 404 if no event found or essential data is missing
            throw new Response(null, { 
                status: 404,
                statusText: "Event not found!",
                headers: headers(),
            });
        }

        // Query for all guest RSVPs for this event
        const guestsResult = await client.send(new QueryCommand({
            TableName: Resource.Kiddobash.name,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
            ExpressionAttributeValues: {
                ":pk": event.PK,
                ":skPrefix": "GUEST#"
            }
        }));

        const guests = (guestsResult.Items || []) as GuestBase[];

        // Check if user is authorized to view this event
        const isHost = event.HostId === createUserPK(userId);
        const hasRsvp = guests.some(guest => guest.SK.includes(userId));
        const isAuthorized = isHost || hasRsvp || event.isPublic;

        if (!isAuthorized) {
            return redirect('/', {
                status: 403,
                statusText: "Not authorized to view this event"
            });
        }

        return {
            event: {
                ...event,
                PK: event.PK,
                SK: event.SK || createMetadataSK(),
                HostId: event.HostId,
                EventName: event.EventName,
                Date: event.Date,
                Time: event.Time,
                Location: event.Location,
                Theme: event.Theme || null,
                isPublic: !!event.isPublic,
                CreatedAt: event.CreatedAt || new Date().toISOString()
            },
            guests,
            userId,
            isHost
        };
    } catch (error: unknown) {
        console.error("Error loading event:", error);
        throw new Response(error instanceof Error ? error.message : String(error), {
            status: 500,
            headers: headers(),
        });
    }
}

export type EventLoaderData = {
    event?: EventBase;
    guests?: GuestBase[];
    userId: string;
    isHost: boolean;
    error?: string;
    message?: string;
};

export default function EventPage() {
    const data = useLoaderData<EventLoaderData>();
    const params = useParams();
    const eventId = params.eventId || '';
    
    // Check for error first
    if (data.error) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className={`flex-grow ${patterns.bgSecondary}`}>
                    <div className={patterns.container}>
                        <div className="py-8">
                            <Heading level={1} className="mb-6">Event not found!</Heading>
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
                                <Text className="font-bold">{data.error}</Text>
                                {data.message && <Text className="whitespace-pre-line">{data.message}</Text>}
                            </div>
                            <div className="mt-6 space-x-4">
                                <Button variant="outline" as="a" href="/">Return to home</Button>
                                <Button variant="primary" as="a" href="/create-event">Create a new event</Button>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }
    
    const { userId, isHost } = data;
    const event = data.event;
    
    // If event is undefined, show error message
    if (!event) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className={`flex-grow ${patterns.bgSecondary}`}>
                    <div className={patterns.container}>
                        <div className="py-8">
                            <Heading level={1} className="mb-6">Event not found!</Heading>
                            <Text>We couldn't find the event you requested. It's possible that:</Text>
                            <ul className="list-disc ml-6 mt-2 mb-4">
                                <li><Text>The event has been canceled</Text></li>
                                <li><Text>The event ID is incorrect</Text></li>
                                <li><Text>The event link you followed is invalid</Text></li>
                            </ul>
                            <div className="mt-6 space-x-4">
                                <Button variant="outline" as="a" href="/">Return to home</Button>
                                <Button variant="primary" as="a" href="/create-event">Create a new event</Button>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }
    
    // Ensure guests is always an array
    const guests = data.guests || [];
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className={`flex-grow ${patterns.bgSecondary}`}>
                <div className={patterns.container}>
                    <div className="py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <EventDetails event={event} />
                                
                                {isHost && (
                                    <div className="mt-6 flex gap-4">
                                        <Button variant="secondary" as="a" href={`/event/${eventId}/invite`}>
                                            Invite Guests
                                        </Button>
                                        <Button variant="outline" as="a" href={`/event/${eventId}/edit`}>
                                            Edit Event
                                        </Button>
                                    </div>
                                )}
                                
                                <GuestList guests={guests} className="mt-8" />
                            </div>
                            
                            <div>
                                <RsvpForm eventId={eventId} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}