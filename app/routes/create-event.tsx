import { Resource } from "sst";
import { redirect, Form } from "react-router";
import { PutCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { headers } from "~/headers";
import { getClient } from "~/model/client";
import { getUserId } from "~/model/userId.server";
import { createEventPK, createUserPK, createMetadataSK, createEventSK } from "~/model/event";
import { getEventId } from "~/model/eventId.server";
import { FormInput } from "~/components/forms/FormInput";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { Heading, Text } from "~/components/ui/Typography";
import * as patterns from "~/styles/tailwind-patterns";

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
  
  const date = formData.get('date')?.toString() || '';
  const time = formData.get('time')?.toString() || '';
  const location = formData.get('location')?.toString() || 'TBD';
  const theme = formData.get('theme')?.toString() || '';
  const hostName = formData.get('hostName')?.toString() || 'Party Host';
  const email = formData.get('email')?.toString() || '';
  const currentTime = new Date().toISOString();

  try {
    // First, ensure the user profile exists
    await client.send(new PutCommand({
      TableName: Resource.Kiddobash.name,
      Item: {
        PK: createUserPK(userId),
        SK: "PROFILE",
        Name: hostName,
        Email: email,
        CreatedAt: currentTime
      }
    })).catch(err => {
      // Ignore condition failures (user already exists)
      console.log("User profile creation error (may be expected):", err.name);
    });

    // Create both the event and the user-event relationship in a transaction
    const eventPK = createEventPK(eventId);
    
    await client.send(new TransactWriteCommand({
      TransactItems: [
        // Create the event
        {
          Put: {
            TableName: Resource.Kiddobash.name,
            Item: {
              PK: eventPK,
              SK: createMetadataSK(),
              HostId: createUserPK(userId),
              EventName: eventName,
              Date: date,
              Time: time,
              Location: location,
              Theme: theme || null,
              isPublic: false,
              CreatedAt: currentTime
            }
          }
        },
        // Create the user-event relationship
        {
          Put: {
            TableName: Resource.Kiddobash.name,
            Item: {
              PK: createUserPK(userId),
              SK: createEventSK(eventId),
              Role: "HOST",
              EventName: eventName,
              Date: date,
              CreatedAt: currentTime
            }
          }
        }
      ]
    }));

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
    <div className="flex flex-col min-h-screen">
      <main className={`flex-grow ${patterns.bgSecondary} ${patterns.textPrimary}`}>
        <div className={patterns.container}>
          <div className="py-8">
            <Heading level={1} className="mb-6">Create New Event</Heading>
            
            <Card>
              <Form method="post" className={patterns.formSection}>
                <div className="space-y-4">
                  <Heading level={2}>Event Details</Heading>
                  
                  <FormInput
                    label="Event Name"
                    id="eventName"
                    placeholder="e.g., Sophia's 5th Birthday Party"
                    required
                  />
                  
                  <div className={patterns.gridCols2}>
                    <div>
                      <FormInput
                        label="Date"
                        id="date"
                        type="date"
                        required
                      />
                    </div>
                    
                    <div>
                      <FormInput
                        label="Time"
                        id="time"
                        type="time"
                        required
                      />
                    </div>
                  </div>
                  
                  <FormInput
                    label="Location"
                    id="location"
                    placeholder="e.g., Community Park, 123 Main St"
                    required
                  />
                  
                  <FormInput
                    label="Theme (Optional)"
                    id="theme"
                    placeholder="e.g., Superheroes, Princess, Dinosaurs"
                  />
                </div>
                
                <div className={`pt-6 ${patterns.borderTop} space-y-4 mt-6`}>
                  <Heading level={2}>Host Information</Heading>
                  
                  <FormInput
                    label="Your Name"
                    id="hostName"
                    placeholder="e.g., Alex Parent"
                    required
                  />
                  
                  <FormInput
                    label="Email (Optional)"
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    helperText="Used for notifications and reminders only"
                  />
                </div>
                
                <Button variant="primary" type="submit" fullWidth className="mt-6">
                  Create Event
                </Button>
              </Form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 