import type { RsvpBase } from "~/model/event";
import { Heading, Text } from "~/components/ui/Typography";
import { extractUserIdFromRsvpSK } from "~/model/event";

// Define SVG icons for different RSVP statuses
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 inline-block shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const QuestionMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2 inline-block shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 inline-block shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

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
      <section className={`p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 ${className}`}>
        <Heading level={2} className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Guest List</Heading>
        <Text className="text-gray-600 dark:text-gray-400">No RSVPs yet.</Text>
      </section>
    );
  }
  
  return (
    <section className={`p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 ${className}`}>
      <Heading level={2} className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Guest List</Heading>
      
      <div className="space-y-8">
        {goingGuests.length > 0 && (
          <div>
            <Heading level={3} className="flex items-center text-lg font-medium text-green-700 dark:text-green-400 mb-3">
              <CheckIcon /> Going ({goingGuests.length})
            </Heading>
            <ul className="space-y-2 ml-7">
              {goingGuests.map(guest => (
                <li key={extractUserIdFromRsvpSK(guest.SK) || guest.SK} className="flex items-center">
                   <Text className="text-gray-700 dark:text-gray-300">{guest.DisplayName}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {maybeGuests.length > 0 && (
          <div>
            <Heading level={3} className="flex items-center text-lg font-medium text-yellow-700 dark:text-yellow-400 mb-3">
              <QuestionMarkIcon /> Maybe ({maybeGuests.length})
            </Heading>
             <ul className="space-y-2 ml-7">
              {maybeGuests.map(guest => (
                <li key={extractUserIdFromRsvpSK(guest.SK) || guest.SK} className="flex items-center">
                   <Text className="text-gray-700 dark:text-gray-300">{guest.DisplayName}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {notGoingGuests.length > 0 && (
          <div>
            <Heading level={3} className="flex items-center text-lg font-medium text-red-700 dark:text-red-400 mb-3">
              <XIcon /> Not Going ({notGoingGuests.length})
            </Heading>
             <ul className="space-y-2 ml-7">
              {notGoingGuests.map(guest => (
                <li key={extractUserIdFromRsvpSK(guest.SK) || guest.SK} className="flex items-center">
                   <Text className="text-gray-700 dark:text-gray-300">{guest.DisplayName}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
} 