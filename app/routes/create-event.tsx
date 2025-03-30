import { Resource } from "sst";
import { redirect, Form } from "react-router";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { headers } from "~/headers";
import { getClient } from "~/model/client";
import { getUserId } from "~/model/userId.server";
import { createEventPK, createUserPK, createMetadataSK } from "~/model/event";
import { getEventId } from "~/model/eventId.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Create New Event - Kiddobash" },
    { name: "description", content: "Create a new birthday party event" },
  ];
};

export async function action({
    request
}: ActionFunctionArgs) {
    const formData = await request.formData();
    const client = getClient();

    const userId = getUserId(request);

    const eventName = formData.get('eventName')?.toString();
    if (!eventName) {
        throw new Response('Event name is required', {
            status: 400,
        });
    }

    const eventId = getEventId(eventName);
    console.log("Generated event ID:", eventId);
    
    const date = formData.get('date')?.toString() || '';
    const time = formData.get('time')?.toString() || '';
    const location = formData.get('location')?.toString() || 'TBD';
    const theme = formData.get('theme')?.toString() || '';
    const hostName = formData.get('hostName')?.toString() || 'Party Host';

    try {
        // First, ensure the user profile exists
        await client.send(new PutCommand({
            TableName: Resource.Kiddobash.name,
            Item: {
                PK: createUserPK(userId),
                SK: "PROFILE",
                Name: hostName,
                Email: formData.get('email')?.toString() || '',
                CreatedAt: new Date().toISOString()
            },
            // Don't use condition expression as it can fail if profile already exists
        })).catch(err => {
            // Ignore condition failures (user already exists)
            console.log("User profile creation error (may be expected):", err.name);
        });

        // Create the event
        const eventPK = createEventPK(eventId);
        console.log("Event PK to be created:", eventPK);
        
        const eventItem = {
            PK: eventPK,
            SK: createMetadataSK(),
            HostId: createUserPK(userId),
            EventName: eventName,
            Date: date,
            Time: time,
            Location: location,
            Theme: theme || null,
            isPublic: false,
            CreatedAt: new Date().toISOString()
        };

        console.log("Creating event with data:", JSON.stringify(eventItem, null, 2));

        await client.send(new PutCommand({
            TableName: Resource.Kiddobash.name,
            Item: eventItem
        }));

        console.log("Event created successfully, redirecting to:", `/event/${eventId}`);
        return redirect(`/event/${eventId}`);
    } catch (e) {
        console.error(e);
        throw new Response('An unexpected error occurred', {
            status: 500,
        });
    }
}

export async function loader() {
    return new Response(JSON.stringify({}), {
        headers: headers(),
    });
}

export default function CreateEvent() {
    return (
        <main className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
            <h1 className="text-3xl font-bold mb-6">Create New Event</h1>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <Form method="post" className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Event Details</h2>
                        
                        <div>
                            <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Event Name *
                            </label>
                            <input
                                type="text"
                                id="eventName"
                                name="eventName"
                                required
                                placeholder="e.g., Sophia's 5th Birthday Party"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                                          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                                              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Time *
                                </label>
                                <input
                                    type="time"
                                    id="time"
                                    name="time"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                                              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Location *
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                required
                                placeholder="e.g., Community Park, 123 Main St"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                                          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Theme (Optional)
                            </label>
                            <input
                                type="text"
                                id="theme"
                                name="theme"
                                placeholder="e.g., Superheroes, Princess, Dinosaurs"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                                          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                        <h2 className="text-xl font-semibold">Host Information</h2>
                        
                        <div>
                            <label htmlFor="hostName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Your Name *
                            </label>
                            <input
                                type="text"
                                id="hostName"
                                name="hostName"
                                required
                                placeholder="e.g., Alex Parent"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                                          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email (Optional)
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="your.email@example.com"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                                          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Used for notifications and reminders only
                            </p>
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                                text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                                focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                    >
                        Create Event
                    </button>
                </Form>
            </div>
        </main>
    );
} 