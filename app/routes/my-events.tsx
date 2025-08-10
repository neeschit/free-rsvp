import { Resource } from "sst";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { useLoaderData } from "react-router";
import { headers } from "~/headers";
import { getClient } from "~/model/client";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import type { UserEventBase, UserRsvpBase } from "~/model/event";
import { createUserPK, extractEventIdFromSK, extractRsvpEventIdFromSK } from "~/model/event";
import { getUserId } from "~/utils/session.server";
import { Button } from "~/components/ui/Button";
import { Heading, Text } from "~/components/ui/Typography";
import * as patterns from "~/styles/tailwind-patterns";
import { Section } from "~/components/ui/Section";
import { Panel } from "~/components/ui/Panel";
import { requireAuth } from "~/utils/requireAuth";

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

async function myEventsLoader({ request }: LoaderFunctionArgs) {
  const client = getClient();
  const userId = await getUserId(request);
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
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
    
    const data: MyEventsLoaderData = {
      hostedEvents: (hostedEventsResult.Items || []) as UserEventBase[],
      rsvps: (rsvpResult.Items || []) as UserRsvpBase[]
    };
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        ...headers()
      }
    });
  } catch (error) {
    console.error("Error loading user events:", error);
    const data: MyEventsLoaderData = {
      hostedEvents: [],
      rsvps: []
    };
    
    return new Response(JSON.stringify(data), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...headers()
      }
    });
  }
}

// Wrap the loader with authentication requirement
export const loader = requireAuth(myEventsLoader);

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
      <main className={`flex-grow ${patterns.bgSecondary}`}>
        <Section as="section" useSectionPadding>
          <Heading level={1} className="mb-8">My Events</Heading>

          {hasEvents ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Hosted Events */}
              <div>
                <Heading level={2} className="mb-4">Events I'm Hosting</Heading>
                {hostedEvents.length === 0 ? (
                  <Panel>
                    <Text>You haven't created any events yet.</Text>
                    <Button variant="primary" as="a" href="/create-event" className="mt-4">
                      Create an Event
                    </Button>
                  </Panel>
                ) : (
                  <div className="space-y-4">
                    {hostedEvents.map(event => {
                      const eventId = extractEventIdFromSK(event.SK);
                      return (
                        <Panel key={event.SK}>
                          <Heading level={3} className="mb-2">{event.EventName}</Heading>
                          <Text className="mb-4">Date: {new Date(event.Date).toLocaleDateString()}</Text>
                          <Button variant="outline" as="a" href={`/event/${eventId}`} className="mt-2">
                            View Event
                          </Button>
                        </Panel>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RSVPs */}
              <div>
                <Heading level={2} className="mb-4">My RSVPs</Heading>
                {rsvps.length === 0 ? (
                  <Panel>
                    <Text>You haven't RSVPed to any events yet.</Text>
                  </Panel>
                ) : (
                  <div className="space-y-6">
                    {goingRsvps.length > 0 && (
                      <Panel title="Events I'm Attending">
                        <div className="space-y-4">
                          {goingRsvps.map(rsvp => {
                            const eventId = extractRsvpEventIdFromSK(rsvp.SK);
                            return (
                              <div key={rsvp.SK} className={`${patterns.borderBottom} pb-4 last:border-0 last:pb-0`}>
                                <Heading level={4}>{rsvp.EventName}</Heading>
                                <Text className="mb-2">Date: {new Date(rsvp.Date).toLocaleDateString()}</Text>
                                <Button variant="outline" as="a" href={`/event/${eventId}`}>
                                  View Event
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </Panel>
                    )}

                    {maybeRsvps.length > 0 && (
                      <Panel title="Events I'm Maybe Attending">
                        <div className="space-y-4">
                          {maybeRsvps.map(rsvp => {
                            const eventId = extractRsvpEventIdFromSK(rsvp.SK);
                            return (
                              <div key={rsvp.SK} className={`${patterns.borderBottom} pb-4 last:border-0 last:pb-0`}>
                                <Heading level={4}>{rsvp.EventName}</Heading>
                                <Text className="mb-2">Date: {new Date(rsvp.Date).toLocaleDateString()}</Text>
                                <Button variant="outline" as="a" href={`/event/${eventId}`}>
                                  View Event
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </Panel>
                    )}

                    {notGoingRsvps.length > 0 && (
                      <Panel title="Events I'm Not Attending">
                        <div className="space-y-4">
                          {notGoingRsvps.map(rsvp => {
                            const eventId = extractRsvpEventIdFromSK(rsvp.SK);
                            return (
                              <div key={rsvp.SK} className={`${patterns.borderBottom} pb-4 last:border-0 last:pb-0`}>
                                <Heading level={4}>{rsvp.EventName}</Heading>
                                <Text className="mb-2">Date: {new Date(rsvp.Date).toLocaleDateString()}</Text>
                                <Button variant="outline" as="a" href={`/event/${eventId}`}>
                                  View Event
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </Panel>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Panel>
              <Text>You haven't created any events or RSVPed to any events yet.</Text>
              <Button variant="primary" as="a" href="/create-event" className="mt-4">
                Create an Event
              </Button>
            </Panel>
          )}
        </Section>
      </main>
    </div>
  );
}