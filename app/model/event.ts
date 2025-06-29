// Base types for the various entities in the Kiddobash table

export type EventBase = {
    PK: string; // EVENT#{eventId}
    SK: string; // METADATA
    HostId: string; // USER#{userId}
    EventName: string;
    Date: string;
    Time: string;
    Location: string;
    Theme?: string;
    isPublic: boolean;
    CreatedAt: string;
}

export type InvitationBase = {
    PK: string; // EVENT#{eventId}
    SK: string; // INVITE#{invitationId}
    GuestEmail: string;
    RSVPStatus: "Going" | "Not Going" | "Maybe";
    InvitationSent: boolean;
    UpdatedAt: string;
}

// New type for tracking email invites with unique IDs
export type InviteMetadata = {
    PK: string; // EVENT#{eventId}
    SK: string; // INVITE_METADATA#{inviteId}
    InviteId: string; // Unique identifier for tracking
    RecipientEmail: string;
    RecipientName?: string;
    SentAt: string;
    EventId: string;
    HostId: string;
    CreatedAt: string;
    // Tracking fields
    Status?: "Sent" | "Opened" | "Clicked";
    OpenedAt?: string;
    ClickedAt?: string;
}

export type RsvpBase = {
    PK: string; // EVENT#{eventId}
    SK: string; // RSVP#{userId}#{timestamp}
    DisplayName: string;
    RSVPStatus: "Going" | "Not Going" | "Maybe";
    UpdatedAt: string;
}

export type UserBase = {
    PK: string; // USER#{userId}
    SK: string; // PROFILE
    Name: string;
    Email: string;
    CreatedAt: string;
}

// New types for the bidirectional relationships
export type UserEventBase = {
    PK: string; // USER#{userId}
    SK: string; // EVENT#{eventId}
    Role: "HOST"; // Indicates the relationship - could add other roles like CO-HOST
    EventName: string; // Denormalized for easy listing
    Date: string; // Denormalized for easy listing
    CreatedAt: string;
}

export type UserRsvpBase = {
    PK: string; // USER#{userId}
    SK: string; // RSVP#{eventId}
    EventName: string; // Denormalized for easy listing
    RSVPStatus: "Going" | "Not Going" | "Maybe";
    Date: string; // Denormalized for easy listing
    UpdatedAt: string;
}

// Helper functions to create the composite keys
export function createEventPK(eventId: string): string {
    return `EVENT#${eventId}`;
}

export function createUserPK(userId: string): string {
    return `USER#${userId}`;
}

export function createMetadataSK(): string {
    return "METADATA";
}

export function createInviteSK(invitationId: string): string {
    return `INVITE#${invitationId}`;
}

export function createInviteMetadataSK(inviteId: string): string {
    return `INVITE_METADATA#${inviteId}`;
}

export function createRsvpSK(userId: string, timestamp?: number): string {
    const ts = timestamp || Date.now();
    return `RSVP#${userId}#${ts}`;
}

// New function for a static (non-timestamped) RSVP SK within an Event
export function createStaticRsvpSK(userId: string): string {
    return `RSVP#${userId}`;
}

export function createProfileSK(): string {
    return "PROFILE";
}

export function createEventSK(eventId: string): string {
    return `EVENT#${eventId}`;
}

export function createUserRsvpSK(eventId: string): string {
    return `RSVP#${eventId}`;
}

// Helper function to generate unique invite ID
export function generateInviteId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper functions to extract IDs from keys
export function extractEventIdFromPK(pk: string): string | null {
    const match = pk.match(/^EVENT#(.+)$/);
    return match ? match[1] : null;
}

export function extractUserIdFromPK(pk: string): string | null {
    const match = pk.match(/^USER#(.+)$/);
    return match ? match[1] : null;
}

export function extractUserIdFromRsvpSK(sk: string): string | null {
    const match = sk.match(/^RSVP#(.+?)#/);
    return match ? match[1] : null;
}

export function extractEventIdFromSK(sk: string): string | null {
    const match = sk.match(/^EVENT#(.+)$/);
    return match ? match[1] : null;
}

export function extractRsvpEventIdFromSK(sk: string): string | null {
    const match = sk.match(/^RSVP#(.+)$/);
    return match ? match[1] : null;
}

export function extractInviteIdFromSK(sk: string): string | null {
    const match = sk.match(/^INVITE_METADATA#(.+)$/);
    return match ? match[1] : null;
}