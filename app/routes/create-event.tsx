import { Resource } from "sst";
import { redirect, Form, useSubmit } from "react-router";
import { PutCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { headers } from "~/headers";
import { getClient } from "~/model/client";
import { getUserId } from "~/utils/session.server";
import { requireAuth } from "~/utils/requireAuth";
import { createEventPK, createUserPK, createMetadataSK, createEventSK } from "~/model/event";
import { getEventId } from "~/model/eventId.server";
import { FormInput } from "~/components/forms/FormInput";
import { DateInput } from "~/components/forms/DateInput";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Heading, Text, Label } from "~/components/ui/Typography";
import { container, bgSecondary, textPrimary, formSection } from "~/styles/tailwind-patterns";
import { useState } from "react";
import { addDays, addWeeks, addMonths } from "~/utils/dateUtils";

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

  const userId = await getUserId(request);
  
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

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
  const isPublic = formData.get('isPublic') === 'true';
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
              isPublic: isPublic,
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

async function createEventLoader() {
  return new Response(JSON.stringify({}), {
    headers: headers(),
  });
}

// Wrap the loader with authentication requirement
export const loader = requireAuth(createEventLoader);

export default function CreateEvent() {
  // Get current date in YYYY-MM-DD format for default date value
  const today = new Date();
  const defaultDate = today.toISOString().split('T')[0];
  
  // Get current time in HH:MM format for default time value
  const hours = today.getHours().toString().padStart(2, '0');
  const minutes = today.getMinutes().toString().padStart(2, '0');
  const defaultTime = `${hours}:${minutes}`;

  const [timeValue, setTimeValue] = useState(defaultTime);
  const [dateValue, setDateValue] = useState(defaultDate);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeValue(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateValue(e.target.value);
  };

  const setQuickDate = (date: string) => {
    setDateValue(date);
  };

  const setQuickTime = (time: string) => {
    setTimeValue(time);
  };

  const formatDate = (date: Date): string => date.toISOString().split('T')[0];

  return (
    <main className={`flex-grow ${bgSecondary} ${textPrimary}`}>
      <div className={container}>
        <div className="py-8 text-center">
          <Heading level={1} className="mb-8">Let's get this event planned <span className="text-4xl">🎉</span></Heading>
          
          <Card className="mt-8 max-w-xl mx-auto">
            <Form method="post" className={formSection}>
              <div className="space-y-6 text-left">
                <div>
                  <FormInput
                    label="What are you hosting?"
                    id="eventName"
                    placeholder="Jackson's 5th Birthday, Soccer Meetup..."
                    required
                  />
                </div>
                
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <DateInput
                        label="When is it?"
                        id="date"
                        value={dateValue}
                        onChange={setDateValue}
                        required
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button 
                          type="button"
                          className="text-xs px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/70 dark:hover:bg-blue-800 rounded-md transition border border-blue-200 dark:border-blue-800 font-medium cursor-pointer shadow-sm"
                          onClick={() => {
                            const currentDate = new Date(dateValue + 'T00:00:00');
                            setQuickDate(formatDate(addDays(currentDate, 1)));
                          }}
                        >
                          +1 day
                        </button>
                        <button 
                          type="button"
                          className="text-xs px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/70 dark:hover:bg-blue-800 rounded-md transition border border-blue-200 dark:border-blue-800 font-medium cursor-pointer shadow-sm"
                          onClick={() => {
                            const currentDate = new Date(dateValue + 'T00:00:00');
                            setQuickDate(formatDate(addWeeks(currentDate, 1)));
                          }}
                        >
                          +1 week
                        </button>
                        <button 
                          type="button"
                          className="text-xs px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/70 dark:hover:bg-blue-800 rounded-md transition border border-blue-200 dark:border-blue-800 font-medium cursor-pointer shadow-sm"
                          onClick={() => {
                            const currentDate = new Date(dateValue + 'T00:00:00');
                            setQuickDate(formatDate(addMonths(currentDate, 1)));
                          }}
                        >
                          +1 month
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <FormInput
                        label="Time"
                        id="time"
                        type="time"
                        placeholder="Time"
                        value={timeValue}
                        onChange={handleTimeChange}
                        required
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button 
                          type="button"
                          className="text-xs px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/70 dark:hover:bg-blue-800 rounded-md transition border border-blue-200 dark:border-blue-800 font-medium cursor-pointer shadow-sm"
                          onClick={() => setQuickTime('09:00')}
                        >
                          9 AM
                        </button>
                        <button 
                          type="button"
                          className="text-xs px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/70 dark:hover:bg-blue-800 rounded-md transition border border-blue-200 dark:border-blue-800 font-medium cursor-pointer shadow-sm"
                          onClick={() => setQuickTime('12:00')}
                        >
                          12 PM
                        </button>
                        <button 
                          type="button"
                          className="text-xs px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/70 dark:hover:bg-blue-800 rounded-md transition border border-blue-200 dark:border-blue-800 font-medium cursor-pointer shadow-sm"
                          onClick={() => setQuickTime('15:00')}
                        >
                          3 PM
                        </button>
                        <button 
                          type="button"
                          className="text-xs px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/70 dark:hover:bg-blue-800 rounded-md transition border border-blue-200 dark:border-blue-800 font-medium cursor-pointer shadow-sm"
                          onClick={() => setQuickTime('18:00')}
                        >
                          6 PM
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <FormInput
                    label="Where should everyone meet?"
                    id="location"
                    placeholder="The Park"
                    required
                  />
                </div>
                
                <div>
                  <FormInput
                    label="Who's the host?"
                    id="hostName"
                    placeholder="Alex Parent"
                    required
                  />
                </div>
                
                <div>
                  <FormInput
                    label=""
                    id="email"
                    type="email"
                    placeholder="alex@example.com"
                  />
                </div>

                <div className="mt-4">
                  <Label htmlFor="isPublic" className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="isPublic"
                      name="isPublic"
                      value="true"
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span>Make this event public</span>
                  </Label>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                    Public events can be viewed by anyone with the link. Private events require an invitation.
                  </Text>
                </div>
              </div>
              
              <Button variant="primary" type="submit" fullWidth className="mt-8">
                Start Planning
              </Button>
            </Form>
          </Card>
        </div>
      </div>
    </main>
  );
} 