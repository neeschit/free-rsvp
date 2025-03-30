import { Resource } from "sst";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { redirect, useLoaderData, useSubmit, Form } from "react-router";
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
    
    // Check for error first
    if (data.error) {
        return (
            <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                <h1 className="text-3xl font-bold mb-6 dark:text-white">Event not found!</h1>
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
                    <p className="font-bold">{data.error}</p>
                    {data.message && <p className="whitespace-pre-line">{data.message}</p>}
                </div>
                <div className="mt-6">
                    <a href="/" className="text-blue-600 hover:underline dark:text-blue-400">Return to home</a>
                    <span className="mx-2 dark:text-gray-300">or</span>
                    <a href="/create" className="text-green-600 hover:underline dark:text-green-400">Create a new event</a>
                </div>
            </main>
        );
    }
    
    const { userId, isHost } = data;
    const event = data.event;
    
    // If event is undefined, show error message
    if (!event) {
        console.log("Event is undefined", data);
        return (
            <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                <h1 className="text-3xl font-bold mb-6 dark:text-white">Event not found!</h1>
                <p className="dark:text-gray-300">We couldn't find the event you requested. It's possible that:</p>
                <ul className="list-disc ml-6 mt-2 mb-4 dark:text-gray-300">
                    <li>The event has been canceled</li>
                    <li>The event ID is incorrect</li>
                    <li>The event link you followed is invalid</li>
                </ul>
                <div className="mt-6">
                    <a href="/" className="text-blue-600 hover:underline dark:text-blue-400">Return to home</a>
                    <span className="mx-2 dark:text-gray-300">or</span>
                    <a href="/create" className="text-green-600 hover:underline dark:text-green-400">Create a new event</a>
                </div>
            </main>
        );
    }
    
    // Ensure guests is always an array
    const guests = data.guests || [];
    const submit = useSubmit();

    const userHasRsvpd = guests.some(guest => guest.SK.includes(userId));

    return (
        <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
            <h1 className="text-3xl font-bold mb-6 dark:text-white">{event.EventName}</h1>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">Event Details</h2>
                        <p className="dark:text-gray-300"><span className="font-medium dark:text-white">Date:</span> {event.Date}</p>
                        <p className="dark:text-gray-300"><span className="font-medium dark:text-white">Time:</span> {event.Time}</p>
                        <p className="dark:text-gray-300"><span className="font-medium dark:text-white">Location:</span> {event.Location}</p>
                        {event.Theme && <p className="dark:text-gray-300"><span className="font-medium dark:text-white">Theme:</span> {event.Theme}</p>}
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">RSVPs ({guests.length})</h2>
                        <div className="space-y-2">
                            {guests.map((guest: GuestBase) => (
                                <div key={guest.SK} className="flex justify-between items-center py-1 border-b dark:border-gray-700">
                                    <span className="dark:text-gray-300">{guest.DisplayName}</span>
                                    <span className={`px-2 py-1 rounded text-sm ${
                                        guest.RSVPStatus === 'Going' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                                            : guest.RSVPStatus === 'Not Going'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                    }`}>
                                        {guest.RSVPStatus}
                                    </span>
                                </div>
                            ))}
                            
                            {guests.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400">No RSVPs yet. Be the first!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {!userHasRsvpd && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">RSVP to this Event</h2>
                    <Form method="post" className="space-y-4">
                        <div>
                            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="guestName"
                                name="guestName"
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Will you attend?
                            </label>
                            <div className="space-y-2">
                                {['Going', 'Maybe', 'Not Going'].map((status) => (
                                    <label key={status} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="rsvpStatus"
                                            value={status}
                                            required
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                                        />
                                        <span className="ml-2 dark:text-gray-300">{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-offset-gray-800"
                        >
                            Submit RSVP
                        </button>
                    </Form>
                </div>
            )}
            
            {isHost && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">Host Actions</h2>
                    <div className="flex space-x-4">
                        <a 
                            href={`/event/${event.PK.split('#')[1]}/edit`} 
                            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800 dark:focus:ring-offset-gray-800"
                        >
                            Edit Event
                        </a>
                        <a 
                            href={`/event/${event.PK.split('#')[1]}/invite`} 
                            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-purple-700 dark:hover:bg-purple-800 dark:focus:ring-offset-gray-800"
                        >
                            Send Invitations
                        </a>
                    </div>
                </div>
            )}
        </main>
    );
}