import type { EventBase } from '~/model/event';
import { Card } from '~/components/ui/Card';
import { Heading, Text } from '~/components/ui/Typography';
import * as patterns from '~/styles/tailwind-patterns';

type EventDetailsProps = {
  event: EventBase;
  isHost: boolean;
  className?: string;
};

export function EventDetails({ event, isHost, className = '' }: EventDetailsProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    
    try {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date.getTime())
        ? date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        : dateString;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className={className}>
      <div className="flex justify-between items-start mb-2">
        <Heading level={2}>Event Details</Heading>
        {isHost && (
            <a 
                href="#invite-guests" 
                className="lg:hidden text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap ml-4 mt-1"
            >
                Start Inviting
            </a>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Heading level={3}>{event.EventName}</Heading>
          {event.Theme && (
            <Text variant="secondary" className="italic">Theme: {event.Theme}</Text>
          )}
        </div>
        
        <div className={patterns.gridCols2}>
          <div>
            <Text variant="muted" className="text-sm">Date</Text>
            <Text className="mt-1">
              {formatDate(event.Date)}
            </Text>
          </div>
          
          <div>
            <Text variant="muted" className="text-sm">Time</Text>
            <Text className="mt-1">
              {event.Time || 'TBD'}
            </Text>
          </div>
        </div>
        
        <div>
          <Text variant="muted" className="text-sm">Location</Text>
          <Text className="mt-1">
            {event.Location || 'TBD'}
          </Text>
        </div>
      </div>
    </Card>
  );
} 