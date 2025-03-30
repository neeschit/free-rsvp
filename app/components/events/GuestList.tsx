import type { GuestBase } from '~/model/event';
import { Card } from '~/components/ui/Card';
import { Text } from '~/components/ui/Typography';
import { RsvpBadge } from '~/components/ui/StatusBadge';
import * as patterns from '~/styles/tailwind-patterns';

type GuestListProps = {
  guests: GuestBase[];
  className?: string;
};

export function GuestList({ guests, className = '' }: GuestListProps) {
  const guestsByStatus = {
    Going: guests.filter(g => g.RSVPStatus === 'Going'),
    Maybe: guests.filter(g => g.RSVPStatus === 'Maybe'),
    NotGoing: guests.filter(g => g.RSVPStatus === 'Not Going')
  };

  const totalResponses = guests.length;
  const goingCount = guestsByStatus.Going.length;

  return (
    <Card className={className} title={`Guest List (${goingCount} Attending)`}>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <RsvpBadge status="Going">
            {guestsByStatus.Going.length} Going
          </RsvpBadge>
          <RsvpBadge status="Maybe">
            {guestsByStatus.Maybe.length} Maybe
          </RsvpBadge>
          <RsvpBadge status="Not Going">
            {guestsByStatus.NotGoing.length} Not Going
          </RsvpBadge>
        </div>

        {totalResponses === 0 ? (
          <Text variant="muted" className="italic">No RSVPs yet</Text>
        ) : (
          <div>
            {guestsByStatus.Going.length > 0 && (
              <div className="mb-4">
                <Text variant="secondary" className="font-medium text-sm mb-2">Going</Text>
                <ul className="space-y-1">
                  {guestsByStatus.Going.map((guest) => (
                    <li key={guest.SK}>
                      <Text>{guest.DisplayName}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guestsByStatus.Maybe.length > 0 && (
              <div className="mb-4">
                <Text variant="secondary" className="font-medium text-sm mb-2">Maybe</Text>
                <ul className="space-y-1">
                  {guestsByStatus.Maybe.map((guest) => (
                    <li key={guest.SK}>
                      <Text>{guest.DisplayName}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guestsByStatus.NotGoing.length > 0 && (
              <div>
                <Text variant="secondary" className="font-medium text-sm mb-2">Not Going</Text>
                <ul className="space-y-1">
                  {guestsByStatus.NotGoing.map((guest) => (
                    <li key={guest.SK}>
                      <Text>{guest.DisplayName}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 