import { Resource } from "sst";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { useLoaderData } from "react-router";
import { headers } from "~/headers";
import { getClient } from "~/model/client";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import type { UserEventBase, UserRsvpBase } from "~/model/event";
import { createUserPK, extractEventIdFromSK, extractRsvpEventIdFromSK } from "~/model/event";
import { getUserId } from "~/model/userId.server";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { Button } from "~/components/ui/Button";
import { Heading, Text } from "~/components/ui/Typography";
import * as patterns from "~/styles/tailwind-patterns";

export const meta: MetaFunction = () => {
  return [
    { title: "My Events - Kiddobash" },
    { name: "description", content: "View your hosted events and RSVPs" },
  ];
};

type MyEventsLoaderData = {
  hostedEvents: UserEventBase[];
  rsvps: UserRsvpBase[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const client = getClient();
  const userId = getUserId(request);
  const userPK = createUserPK(userId);
  
  try {
    // Query for hosted events (SK starts with EVENT#)
    const hostedEventsResult = await client.send(new QueryCommand({
      TableName: Resource.Kiddobash.name,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": userPK,
        ":skPrefix": "EVENT#"
      }
    }));
    
    // Query for RSVPs (SK starts with RSVP#)
    const rsvpResult = await client.send(new QueryCommand({
      TableName: Resource.Kiddobash.name,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": userPK,
        ":skPrefix": "RSVP#"
      }
    }));
    
    return new Response(JSON.stringify({
      hostedEvents: hostedEventsResult.Items || [],
      rsvps: rsvpResult.Items || []
    } as MyEventsLoaderData), {
      headers: headers()
    });
  } catch (error) {
    console.error("Error loading user events:", error);
    return new Response(JSON.stringify({
      hostedEvents: [],
      rsvps: []
    } as MyEventsLoaderData), {
      status: 500,
      headers: headers()
    });
  }
}

export default function MyEventsPage() {
  const data = useLoaderData<typeof loader>() as MyEventsLoaderData;
  const { hostedEvents, rsvps } = data;
  
  const hasEvents = hostedEvents.length > 0 || rsvps.length > 0;
  
  // Group RSVPs by status
  const goingRsvps = rsvps.filter(rsvp => rsvp.RSVPStatus === "Going");
  const maybeRsvps = rsvps.filter(rsvp => rsvp.RSVPStatus === "Maybe");
  const notGoingRsvps = rsvps.filter(rsvp => rsvp.RSVPStatus === "Not Going");
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-grow ${patterns.bgSecondary}`}>
        <div className={patterns.container}>
          <div className="py-8">
            <Heading level={1} className="mb-8">My Events</Heading>
            
            {hasEvents ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hosted Events */}
                <div>
                  <Heading level={2} className="mb-4">Events I'm Hosting</Heading>
                  
                  {hostedEvents.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                      <Text>You haven't created any events yet.</Text>
                      <Button 
                        variant="primary" 
                        as="a" 
                        href="/create-event" 
                        className="mt-4"
                      >
                        Create an Event
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hostedEvents.map(event => {
                        const eventId = extractEventIdFromSK(event.SK);
                        return (
                          <div 
                            key={event.SK} 
                            className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800"
                          >
                            <Heading level={3} className="mb-2">{event.EventName}</Heading>
                            <Text className="mb-4">Date: {new Date(event.Date).toLocaleDateString()}</Text>
                            <Button 
                              variant="outline" 
                              as="a" 
                              href={`/event/${eventId}`}
                              className="mt-2"
                            >
                              View Event
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* RSVPs */}
                <div>
                  <Heading level={2} className="mb-4">My RSVPs</Heading>
                  
                  {rsvps.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                      <Text>You haven't RSVPed to any events yet.</Text>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Going */}
                      {goingRsvps.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                          <Heading level={3} className="text-green-600 dark:text-green-400 mb-4">
                            Events I'm Attending
                          </Heading>
                          <div className="space-y-4">
                            {goingRsvps.map(rsvp => {
                              const eventId = extractRsvpEventIdFromSK(rsvp.SK);
                              return (
                                <div key={rsvp.SK} className="border-b pb-4 last:border-0 last:pb-0">
                                  <Heading level={4}>{rsvp.EventName}</Heading>
                                  <Text className="mb-2">Date: {new Date(rsvp.Date).toLocaleDateString()}</Text>
                                  <Button 
                                    variant="outline" 
                                    as="a" 
                                    href={`/event/${eventId}`}
                                    className="text-sm"
                                  >
                                    View Details
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Maybe */}
                      {maybeRsvps.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                          <Heading level={3} className="text-yellow-600 dark:text-yellow-400 mb-4">
                            Events I Might Attend
                          </Heading>
                          <div className="space-y-4">
                            {maybeRsvps.map(rsvp => {
                              const eventId = extractRsvpEventIdFromSK(rsvp.SK);
                              return (
                                <div key={rsvp.SK} className="border-b pb-4 last:border-0 last:pb-0">
                                  <Heading level={4}>{rsvp.EventName}</Heading>
                                  <Text className="mb-2">Date: {new Date(rsvp.Date).toLocaleDateString()}</Text>
                                  <Button 
                                    variant="outline" 
                                    as="a" 
                                    href={`/event/${eventId}`}
                                    className="text-sm"
                                  >
                                    View Details
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Not Going */}
                      {notGoingRsvps.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                          <Heading level={3} className="text-red-600 dark:text-red-400 mb-4">
                            Events I'm Missing
                          </Heading>
                          <div className="space-y-4">
                            {notGoingRsvps.map(rsvp => {
                              const eventId = extractRsvpEventIdFromSK(rsvp.SK);
                              return (
                                <div key={rsvp.SK} className="border-b pb-4 last:border-0 last:pb-0">
                                  <Heading level={4}>{rsvp.EventName}</Heading>
                                  <Text className="mb-2">Date: {new Date(rsvp.Date).toLocaleDateString()}</Text>
                                  <Button 
                                    variant="outline" 
                                    as="a" 
                                    href={`/event/${eventId}`}
                                    className="text-sm"
                                  >
                                    View Details
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center dark:bg-gray-800 max-w-2xl mx-auto">
                <Heading level={2} className="mb-4">Welcome to Kiddobash!</Heading>
                <Text className="mb-6">You haven't created any events or RSVPed to any invitations yet.</Text>
                <Button 
                  variant="primary" 
                  as="a" 
                  href="/create-event" 
                  className="mx-auto"
                >
                  Create Your First Event
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 