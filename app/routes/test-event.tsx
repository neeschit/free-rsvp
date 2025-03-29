import { headers } from "~/headers";
import { useLoaderData } from "react-router";
import type { EventBase, GuestBase } from "~/model/event";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
    // Hard-coded Test Event data
    const testEvent: EventBase = {
        PK: "EVENT#test-event-m8urvxca-edt6811b",
        SK: "METADATA",
        HostId: "USER#d993dffe3c47fbc440f1b4942aa5a937",
        EventName: "Test Event",
        Date: "2027-10-28",
        Time: "14:00",
        Location: "Nova Trampoline Park",
        isPublic: false,
        CreatedAt: "2025-03-29T22:18:13.307Z"
    };
    
    return new Response(JSON.stringify({
        event: testEvent,
        guests: [],
        userId: "d993dffe3c47fbc440f1b4942aa5a937",
        isHost: true,
        isExactMatch: true
    }), {
        headers: headers()
    });
}

type EventLoaderData = {
    event: EventBase;
    guests: GuestBase[];
    userId: string;
    isHost: boolean;
    isExactMatch: boolean;
};

export default function TestEventPage() {
    const data = useLoaderData<EventLoaderData>();
    const { event, guests } = data;
    
    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{event.EventName}</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800 dark:text-white">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                        <p><span className="font-medium">Date:</span> {event.Date}</p>
                        <p><span className="font-medium">Time:</span> {event.Time}</p>
                        <p><span className="font-medium">Location:</span> {event.Location}</p>
                        <p><span className="font-medium">Event ID:</span> {event.PK.replace("EVENT#", "")}</p>
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-semibold mb-4">RSVPs ({guests.length})</h2>
                        <div className="space-y-2">
                            {guests.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400">No RSVPs yet. Be the first!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-6">
                <a href="/utils/db" className="text-blue-600 hover:underline dark:text-blue-400">Return to database viewer</a>
                <span className="mx-2">or</span>
                <a href="/" className="text-green-600 hover:underline dark:text-green-400">Go to home page</a>
            </div>
        </main>
    );
} 