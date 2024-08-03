import { Resource } from "sst";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { json, useLoaderData } from "@remix-run/react";
import { headers } from "~/headers";
import { getClient } from "~/model/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getUserId } from "~/model/userId.server";

export async function loader({
    request,
    params,
}: LoaderFunctionArgs) {
    const client = getClient();

    const userId = getUserId(request);

    const eventId = params.eventId;

    console.log(userId);

    const result = await client.send(new QueryCommand({
        TableName: Resource.Events.name,
        KeyConditionExpression: "eventId = :eventId",
        ExpressionAttributeValues: {
            ":eventId": eventId
        }
    }));

    return json(
        {
            result: result.Items
        },
        {
            headers: headers(),
        }
    );
}

export default function EventPage() {
    const { result } = useLoaderData<typeof loader>();
    return <div>{JSON.stringify(result)}</div>
}