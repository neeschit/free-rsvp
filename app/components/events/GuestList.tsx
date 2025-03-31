import type { RsvpBase } from "~/model/event";
import { Heading, Text } from "~/components/ui/Typography";
import { extractUserIdFromRsvpSK } from "~/model/event";

type GuestListProps = {
  guests: RsvpBase[];
  className?: string;
};

export function GuestList({ guests, className = '' }: GuestListProps) {
  const goingGuests = guests.filter(g => g.RSVPStatus === 'Going');
  const maybeGuests = guests.filter(g => g.RSVPStatus === 'Maybe');
  const notGoingGuests = guests.filter(g => g.RSVPStatus === 'Not Going');
  
  if (guests.length === 0) {
    return (
      <section className={`p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 ${className}`}>
        <Heading level={2} className="text-xl mb-4">Guest List</Heading>
        <Text>No RSVPs yet</Text>
      </section>
    );
  }
  
  return (
    <section className={`p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 ${className}`}>
      <Heading level={2} className="text-xl mb-4">Guest List</Heading>
      
      <div className="space-y-6">
        {goingGuests.length > 0 && (
          <div>
            <Heading level={3} className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
              Going ({goingGuests.length})
            </Heading>
            <ul className="ml-5 list-disc space-y-1">
              {goingGuests.map(guest => (
                <li key={extractUserIdFromRsvpSK(guest.SK) || guest.SK}>
                  <Text>{guest.DisplayName}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {maybeGuests.length > 0 && (
          <div>
            <Heading level={3} className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
              Maybe ({maybeGuests.length})
            </Heading>
            <ul className="ml-5 list-disc space-y-1">
              {maybeGuests.map(guest => (
                <li key={extractUserIdFromRsvpSK(guest.SK) || guest.SK}>
                  <Text>{guest.DisplayName}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {notGoingGuests.length > 0 && (
          <div>
            <Heading level={3} className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Not Going ({notGoingGuests.length})
            </Heading>
            <ul className="ml-5 list-disc space-y-1">
              {notGoingGuests.map(guest => (
                <li key={extractUserIdFromRsvpSK(guest.SK) || guest.SK}>
                  <Text>{guest.DisplayName}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
} 