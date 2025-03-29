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

export type GuestBase = {
    PK: string; // EVENT#{eventId}
    SK: string; // GUEST#{guestId}
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

export function createGuestSK(guestId: string): string {
    return `GUEST#${guestId}`;
}

export function createProfileSK(): string {
    return "PROFILE";
}