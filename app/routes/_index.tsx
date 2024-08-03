import { ActionFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import { Title, Stack, Button, TextInput, Text, Fieldset, Group, ActionIcon } from '@mantine/core';

import { Resource } from "sst";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { redirect, useSubmit, Form } from "@remix-run/react";
import { headers } from "~/headers";
import { getClient } from "~/model/client";
import { getUserId } from "~/model/userId.server";
import { getEventId } from "~/model/eventId.server";
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconTrash, IconPlus } from '@tabler/icons-react';

export const meta: MetaFunction = () => {
    return [
        { title: "RSVP for Free" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};


export async function action({
    request
}: ActionFunctionArgs) {
    const formData = await request.formData();
    const client = getClient();

    const ownerId = getUserId(request);

    const name = formData.get('name');

    if (!name) {
        return json({
            error: 'required param missing'
        }, {
            status: 401,
        })
    }

    const eventId = getEventId(name as string);

    const createdAt = Date.now();

    try {
        const result = await client.send(new PutCommand({
            TableName: Resource.Events.name,
            Item: {
                eventId,
                ownerId,
                name,
                createdAt
            }
        }));

        return redirect(`/event/${eventId}`);
    } catch (e) {
        console.log(e);
        return json({
            error: 'unexpected_error'
        }, {
            status: 500,
        })
    }
}

export async function loader() {
    return json(
        {},
        {
            headers: headers(),
        }
    );
}

type CreateEventFormData = {
    name: string;
    location: string;
    date: Date[];
}

export default function Index() {
    const submit = useSubmit();

    const form = useForm<CreateEventFormData>({
        mode: 'uncontrolled',
        initialValues: {
            name: '',
            location: '',
            date: [new Date()],
        },

        validate: {
            name: (value) => value.length > 6 ? null : 'Invalid name',
            date: (value) => {
                return value.length > 1 ? null : 'Need at least one date';
            }
        },
    });

    return (
        <Stack style={{ marginTop: '1rem' }}>
            <Title>
                Free Anonymous RSVPs
            </Title>

            <Text>Provide a descriptive name of the event for people who view it</Text>

            <form onSubmit={(event) => {
                event?.preventDefault();
                const validationResult = form.validate();

                console.log(validationResult);
            }}>
                <Fieldset legend="Event Information">
                    <Stack align="flex-start" style={{ marginTop: '1rem' }}>
                        <Group align="flex-start">
                            <TextInput name="name" label="Name" key={form.key('name')} {...form.getInputProps('name')} withAsterisk></TextInput>
                            <TextInput name="location" label="Location" key={form.key('location')} {...form.getInputProps('location')}></TextInput>
                        </Group>
                        <Stack>
                            {form.getValues().date.map((d, i) => {
                                const firstItem = i === form.getValues().date.length - 1;
                                return <Group align="self-end" justify="center" key={d.toISOString()}>
                                    <DateTimePicker inputSize="xl" label="When" name={`date.${i}`} key={form.key(`date.${i}`)} {...form.getInputProps(`date.${i}`)} withAsterisk={firstItem} />

                                    {firstItem ?
                                        <ActionIcon color="green" onClick={() => {
                                            form.insertListItem('date', new Date(), 0);
                                        }}>
                                            <IconPlus title="Add Time" />
                                        </ActionIcon> : <ActionIcon color="red" onClick={() => {
                                            form.removeListItem('date', i);
                                        }}>
                                            <IconTrash title="Delete Time" />
                                        </ActionIcon>
                                    }
                                </Group>
                            })}
                        </Stack>

                        <Button type="submit" autoContrast>Save Event</Button>
                    </Stack>
                </Fieldset>
            </form>
        </Stack>
    );
}
