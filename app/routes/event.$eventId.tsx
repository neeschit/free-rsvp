import { Resource } from "sst";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { json, useLoaderData } from "@remix-run/react";
import { headers } from "~/headers";
import { getClient } from "~/model/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getUserId } from "~/model/userId.server";
import { Stack, Title, Text, Fieldset } from "@mantine/core";

export async function loader({
    request,
    params,
}: LoaderFunctionArgs) {
    const client = getClient();

    const eventId = params.eventId;

    const result = await client.send(new QueryCommand({
        TableName: Resource.Events.name,
        KeyConditionExpression: "eventId = :eventId",
        ExpressionAttributeValues: {
            ":eventId": eventId
        }
    }));

    if (!result.Count || !result.Items?.length) {
        return json({
            result: null,
        }, {
            status: 403
        });
    }

    return json(
        {
            result: result.Items[0]
        },
        {
            headers: headers(),
        }
    );
}

export default function EventPage() {
    const { result } = useLoaderData<typeof loader>();

    if (!result) {
        return <div>Booo we done bad. Please report this to someone</div>
    }

    const events: number[] = JSON.parse(result.date);

    if (!events.length) {
        return <div>Booo we done bad. Please report this to someone</div>
    }

    return <Stack>
        <Title>You are invited to <Text span c="blue" inherit>{result.name}</Text></Title>
        {result.location && <Text>Location: {result.location}</Text>}
        <Fieldset legend="Attendee Information">
            
        </Fieldset>
    </Stack>
}