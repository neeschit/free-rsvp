export type EventBase = {
    eventId: string;
    ownerId: string;
    createdAt: number;
    location: string;
    user: string;
    name: string;
    rsvps: {
        name: string;
        userId: string;
        votes: {
            vote: string;
        }[];
    }[];
}

export type EventSerialized = EventBase & {
    date: string;
}

export type Event = EventBase & {
    date: string[];
}