import { Resource } from "sst";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { json, redirect, useLoaderData, useSubmit } from "@remix-run/react";
import { headers } from "~/headers";
import { getClient } from "~/model/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Stack, Title, Text, Fieldset, TextInput, Button, Card, Radio, SimpleGrid, CheckIcon, Table } from "@mantine/core";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import { EventSerialized } from "~/model/event";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { getUserId } from "~/model/userId.server";

export async function action({
    request
}: ActionFunctionArgs) {
    const formData = await request.formData();
    const client = getClient();

    const userId = getUserId(request);

    const eventIdForm = formData.get('eventId');

    if (!eventIdForm) {
        throw json({}, 400);
    }

    const eventId = eventIdForm.toString();
    const name = formData.get('name')?.toString() || '';
    const ownerId = formData.get('ownerId')?.toString() || '';
    const decisionString = formData.get('decision')?.toString() || '{}';

    try {
        const decision = JSON.parse(decisionString);
        await client.send(new UpdateItemCommand({
            TableName: Resource.Events.name,
            UpdateExpression: "set rsvps= list_append(rsvps, :rsvp)",
            Key: {
                eventId: {
                    S: eventId
                },
                ownerId: {
                    S: ownerId
                }
            },
            ExpressionAttributeValues: {
                ":rsvp": {
                    L: [{
                        M: {
                            userId: {
                                S: userId
                            },
                            name: {
                                S: name,
                            },
                            votes: {
                                L: decision.map((d: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                    return {
                                        M: {
                                            vote: {
                                                S: d.vote
                                            }
                                        }
                                    }
                                })
                            }
                        }
                    }]
                }
            },
            ReturnValues: "ALL_NEW"
        }));

        return redirect(`/event/${eventId}`);
    } catch (e) {
        console.log(e);
        throw json({
            error: 'unexpected_error'
        }, {
            status: 500,
        })
    }
}

export async function loader({
    request,
    params,
}: LoaderFunctionArgs) {
    const client = getClient();

    const eventId = params.eventId;

    const userId = getUserId(request);

    const result = await client.send(new QueryCommand({
        TableName: Resource.Events.name,
        KeyConditionExpression: "eventId = :eventId",
        ExpressionAttributeValues: {
            ":eventId": eventId
        }
    }));

    if (!result.Count || !result.Items?.length) {
        return redirect('/', {
            status: 403
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item: EventSerialized = result.Items[0] as any;

    console.log(item);

    return json(
        {
            result: item,
            userId,
        },
        {
            headers: headers(),
        }
    );
}

export default function EventPage() {
    const { result, userId } = useLoaderData<typeof loader>();
    const submit = useSubmit();

    const events: number[] = JSON.parse(result.date);

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            name: '',
            decision: events.map((e) => {
                return {
                    event: e,
                    vote: '',
                }
            }),
        },
        validate: {
            name: (value) => value.length > 0 ? null : 'Is your name really less than 1 character?',
            decision: {
                vote: (value) => {
                    return value ? null : 'Please indicate your availability for this slot';
                }
            }
        },
        transformValues: (values) => {
            return {
                ...values,
                decision: JSON.stringify(values.decision)
            }
        }
    });

    if (!events.length) {
        return <div>Booo we done bad. Please report this to someone</div>
    }

    const userSubmitted = result.rsvps.some(rsvp => rsvp.userId === userId);

    return <Stack>
        <Title>You are invited to <Text span c="blue" inherit>{result.name}</Text></Title>
        {result.location && <Text>Location: {result.location}</Text>}
        {userSubmitted ? <div>All set</div> :
            <form onSubmit={(event) => {
                event?.preventDefault();
                const validationResult = form.validate();

                if (validationResult.hasErrors) {
                    return; // TODO: Show toast/notification
                }

                form.setFieldValue('eventId', result.eventId);
                form.setFieldValue('ownerId', result.ownerId);

                console.log(form.getTransformedValues());

                submit(form.getTransformedValues(), {
                    method: 'post'
                });
            }}>
                <Fieldset legend="Attendee Information">
                    <TextInput label="Name" style={{ display: 'inline-block', marginBottom: '1rem' }} name="name" key={form.key('name')} {...form.getInputProps('name')} withAsterisk />

                    <SimpleGrid
                        cols={{ base: 1, sm: 2, lg: 4 }}
                        spacing={{ base: 10, sm: 'xl' }}
                        verticalSpacing={{ base: 'md', sm: 'xl' }}
                        style={{ marginBottom: '1rem' }}
                    >
                        {events.map((e, i) => {
                            console.log(e);
                            console.log(dayjs().toISOString());
                            return <Card key={e}>
                                <Stack>
                                    <Title order={6}>
                                        {dayjs(e).format('ddd h:mmA (MMM D)')}
                                    </Title>
                                    <Radio.Group label="Going?" mt="sm" name={`decision.${i}.vote`} key={form.key(`decision.${i}.vote`)} {...form.getInputProps(`decision.${i}.vote`)} withAsterisk style={{ marginBottom: '1em' }}>
                                        <Radio icon={CheckIcon} color="green.5" value="Yes" label="Yes" style={{ display: 'inline-block', marginRight: '1em' }} />
                                        <Radio color="red.8" variant="outline" value="No" label="No" style={{ display: 'inline-block', marginRight: '1em' }} />
                                        <Radio color="yellow.6" value="Maybe" label="Maybe" style={{ display: 'inline-block', marginRight: '1em' }} />
                                    </Radio.Group>
                                </Stack>
                            </Card>
                        })}
                    </SimpleGrid>
                    <Button type="submit" autoContrast>Submit</Button>
                </Fieldset>
            </form>
        }
        
        <Table striped>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    {events.map(e => {
                        return <Table.Th key={e}>{dayjs(e).format('ddd h:mmA (MMM D)')}</Table.Th>
                    })}
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {result.rsvps.map((r, idx) => {
                    return <Table.Tr key={r.name + idx}>
                        <Table.Th>{r.name}</Table.Th>
                        {r.votes.map((v, i)=> {
                            return <Table.Th key={r.name + i + v.vote}>{v.vote}</Table.Th>
                        })}
                    </Table.Tr>
                })}
            </Table.Tbody>
        </Table>
    </Stack>
}