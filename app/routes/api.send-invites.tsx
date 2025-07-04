import { Resource } from "sst";
import type { ActionFunctionArgs } from "react-router";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { PutCommand, QueryCommand, TransactWriteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { getClient } from "~/model/client";
import { getUserId } from "~/utils/session.server";
import { 
    createEventPK, 
    createMetadataSK, 
    createInviteMetadataSK,
    generateInviteId,
    type EventBase,
    type InviteMetadata
} from "~/model/event";

const sesClient = new SESv2Client({});

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        throw new Response("Method not allowed", { status: 405 });
    }

    const userId = await getUserId(request);
    
    if (!userId) {
        throw new Response("Unauthorized", { status: 401 });
    }
    
    const formData = await request.formData();
    const eventId = formData.get("eventId")?.toString();
    const recipients = JSON.parse(formData.get("recipients")?.toString() || "[]");

    if (!eventId || !Array.isArray(recipients) || recipients.length === 0) {
        throw new Response("Event ID and recipients are required", { status: 400 });
    }

    const client = getClient();

    try {
        // Verify the user is the host of this event
        const eventResult = await client.send(new QueryCommand({
            TableName: Resource.Kiddobash.name,
            KeyConditionExpression: "PK = :pk AND SK = :sk",
            ExpressionAttributeValues: {
                ":pk": createEventPK(eventId),
                ":sk": createMetadataSK()
            }
        }));

        if (!eventResult.Items || eventResult.Items.length === 0) {
            throw new Response("Event not found", { status: 404 });
        }

        const event = eventResult.Items[0] as EventBase;
        if (event.HostId !== `USER#${userId}`) {
            throw new Response("Unauthorized", { status: 403 });
        }

        const sentInvites = [];
        const errors = [];

        // Send invites to each recipient
        for (const recipient of recipients) {
            const { email, name } = recipient;
            if (!email) continue;

            try {
                const inviteId = generateInviteId();
                
                // Create email content
                const emailHtml = createInviteEmailHtml({
                    eventName: event.EventName,
                    eventDate: event.Date,
                    eventTime: event.Time,
                    eventLocation: event.Location,
                    theme: event.Theme,
                    recipientName: name,
                    inviteId,
                    eventId
                });

                // Send email via SES
                await sesClient.send(new SendEmailCommand({
                    FromEmailAddress: Resource.KiddobashEmail.sender,
                    Destination: {
                        ToAddresses: [email]
                    },
                    Content: {
                        Simple: {
                            Subject: { 
                                Data: `You're Invited! ${event.EventName}`,
                                Charset: "UTF-8"
                            },
                            Body: { 
                                Html: { 
                                    Data: emailHtml,
                                    Charset: "UTF-8"
                                }
                            }
                        }
                    }
                }));

                // Store invite metadata in DynamoDB
                const inviteMetadata: InviteMetadata = {
                    PK: createEventPK(eventId),
                    SK: createInviteMetadataSK(inviteId),
                    InviteId: inviteId,
                    RecipientEmail: email,
                    RecipientName: name,
                    SentAt: new Date().toISOString(),
                    EventId: eventId,
                    HostId: event.HostId,
                    CreatedAt: new Date().toISOString()
                };

                await client.send(new PutCommand({
                    TableName: Resource.Kiddobash.name,
                    Item: inviteMetadata
                }));

                sentInvites.push({ email, inviteId });
            } catch (error) {
                console.error(`Failed to send invite to ${email}:`, error);
                errors.push({ email, error: "Failed to send" });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            sentCount: sentInvites.length,
            errorCount: errors.length,
            sentInvites,
            errors
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error sending invites:", error);
        throw new Response("Failed to send invites", { status: 500 });
    }
}

function createInviteEmailHtml({ 
    eventName, 
    eventDate, 
    eventTime, 
    eventLocation, 
    theme, 
    recipientName, 
    inviteId,
    eventId
}: {
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    theme?: string;
    recipientName?: string;
    inviteId: string;
    eventId: string;
}) {
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch {
            return dateString;
        }
    };

    const trackingPixelUrl = `https://kiddobash.com/api/track-pixel?inviteId=${inviteId}&eventId=${eventId}`;
    const clickTrackingUrl = `https://kiddobash.com/api/track-click?inviteId=${inviteId}&eventId=${eventId}`;

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>You're Invited!</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎉 You're Invited!</h1>
                <h2>${eventName}</h2>
            </div>
            
            <div class="content">
                ${recipientName ? `<p>Hi ${recipientName},</p>` : '<p>Hi there,</p>'}
                
                <p>You're invited to join us for an amazing celebration!</p>
                
                <div class="event-details">
                    <h3>Event Details</h3>
                    <p><strong>📅 Date:</strong> ${formatDate(eventDate)}</p>
                    <p><strong>🕐 Time:</strong> ${eventTime || 'TBD'}</p>
                    <p><strong>📍 Location:</strong> ${eventLocation || 'TBD'}</p>
                    ${theme ? `<p><strong>🎨 Theme:</strong> ${theme}</p>` : ''}
                </div>
                
                <p>Please let us know if you can make it!</p>
                
                <div style="text-align: center;">
                    <a href="${clickTrackingUrl}" class="cta-button">RSVP Now</a>
                </div>
                
                <p>We can't wait to celebrate with you!</p>
            </div>
            
            <div class="footer">
                <p>Powered by Kiddobash</p>
                <p><small>Invite ID: ${inviteId}</small></p>
            </div>
            
            <!-- Tracking pixel -->
            <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
        </body>
        </html>
    `;
} 