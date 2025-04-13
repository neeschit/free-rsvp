import { Form } from 'react-router';
import { Card } from '~/components/ui/Card';
import { FormInput } from '~/components/forms/FormInput';
import { Button } from '~/components/ui/Button';
import { Text, Label } from '~/components/ui/Typography';
import * as patterns from '~/styles/tailwind-patterns';
import type { RsvpBase } from '~/model/event';

type RsvpFormProps = {
  eventId: string;
  className?: string;
  eventName: string;
  eventDate: string;
  userRsvp?: RsvpBase;
};

export function RsvpForm({ eventId, className = '', eventName, eventDate, userRsvp }: RsvpFormProps) {
  return (
    <Card className={className} title="RSVP to this Event">
      <Form method="post" className={patterns.spacingY}>
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="eventName" value={eventName} />
        <input type="hidden" name="eventDate" value={eventDate} />
        
        <FormInput
          label="Your Name"
          id="guestName"
          name="guestName"
          placeholder="Enter your name"
          required
          defaultValue={userRsvp?.DisplayName || ''}
        />
        
        <div>
          <Label htmlFor="rsvpStatus">
            Will you be attending? <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center">
              <input
                id="going"
                name="rsvpStatus"
                type="radio"
                value="Going"
                required
                defaultChecked={userRsvp?.RSVPStatus === 'Going'}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <Label htmlFor="going" className="ml-3 inline mb-0">
                Yes, I'll be there!
              </Label>
            </div>
            <div className="flex items-center">
              <input
                id="maybe"
                name="rsvpStatus"
                type="radio"
                value="Maybe"
                defaultChecked={userRsvp?.RSVPStatus === 'Maybe'}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <Label htmlFor="maybe" className="ml-3 inline mb-0">
                Maybe
              </Label>
            </div>
            <div className="flex items-center">
              <input
                id="notGoing"
                name="rsvpStatus"
                type="radio"
                value="Not Going"
                defaultChecked={userRsvp?.RSVPStatus === 'Not Going'}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <Label htmlFor="notGoing" className="ml-3 inline mb-0">
                Sorry, I can't make it
              </Label>
            </div>
          </div>
        </div>
        
        <Button variant="primary" type="submit" fullWidth>
          {userRsvp ? 'Update RSVP' : 'Submit RSVP'}
        </Button>
      </Form>
    </Card>
  );
} 